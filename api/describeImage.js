import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Decode base64 image
    const imageBuffer = Buffer.from(image, 'base64');

    // Azure Computer Vision API
    const azureEndpoint = `https://${process.env.AZURE_REGION}.api.cognitive.microsoft.com/vision/v3.2/analyze`;
    const azureApiKey = process.env.AZURE_VISION_API_KEY;

    const azureParams = new URLSearchParams({
      visualFeatures: 'Description',
    });

    const azureResponse = await fetch(`${azureEndpoint}?${azureParams.toString()}`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': azureApiKey,
        'Content-Type': 'application/octet-stream',
      },
      body: imageBuffer,
    });

    if (!azureResponse.ok) {
      const errorData = await azureResponse.json();
      console.error('Error from Azure Vision API:', errorData);
      return res.status(500).json({ error: 'Error processing image with Azure Vision API' });
    }

    const azureData = await azureResponse.json();
    const azureDescription = azureData.description?.captions[0]?.text || 'No description available from Azure Vision API';

    // Google Cloud Vision API
    const googleVisionEndpoint = 'https://vision.googleapis.com/v1/images:annotate';
    const googleApiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;

    const googleRequestBody = {
      requests: [
        {
          image: {
            content: image,
          },
          features: [
            {
              type: 'LABEL_DETECTION',
              maxResults: 5,
            },
            {
              type: 'WEB_DETECTION',
              maxResults: 5,
            },
          ],
        },
      ],
    };

    const googleResponse = await fetch(`${googleVisionEndpoint}?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleRequestBody),
    });

    if (!googleResponse.ok) {
      const errorData = await googleResponse.json();
      console.error('Error from Google Vision API:', errorData);
      return res.status(500).json({ error: 'Error processing image with Google Vision API' });
    }

    const googleData = await googleResponse.json();
    const labelAnnotations = googleData.responses[0].labelAnnotations || [];
    const googleDescription =
      labelAnnotations.map((label) => label.description).join(', ') ||
      'No description available from Google Vision API';

    res.status(200).json({
      azureDescription,
      googleDescription,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error processing image' });
  }
}