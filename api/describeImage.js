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

    // Call external API to get image description
    const endpoint = `https://${process.env.AZURE_REGION}.api.cognitive.microsoft.com/vision/v3.2/analyze`;
    const apiKey = process.env.AZURE_VISION_API_KEY;

    const params = new URLSearchParams({
      visualFeatures: 'Description',
    });

    const response = await fetch(`${endpoint}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/octet-stream',
      },
      body: imageBuffer,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from Vision API:', errorData);
      return res.status(500).json({ error: 'Error processing image' });
    }

    const data = await response.json();

    const description = data.description?.captions[0]?.text || 'No description available';

    res.status(200).json({ description });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error processing image' });
  }
}