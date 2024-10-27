import { createSignal, Show } from 'solid-js';
import { createEvent } from './supabaseClient';

function App() {
  const [imageFile, setImageFile] = createSignal(null);
  const [description, setDescription] = createSignal('');
  const [audioUrl, setAudioUrl] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleDescribeImage = async () => {
    if (!imageFile()) {
      alert('Please select an image file.');
      return;
    }

    setLoading(true);
    setDescription('');
    setAudioUrl('');

    try {
      // Read the file as base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1]; // Remove the data:url prefix

        const response = await fetch('/api/describeImage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64Image }),
        });

        if (response.ok) {
          const data = await response.json();
          setDescription(data.description);
        } else {
          const errorData = await response.json();
          console.error('Error:', errorData.error);
          alert('Error generating description.');
        }

        setLoading(false);
      };
      reader.readAsDataURL(imageFile());
    } catch (error) {
      console.error('Error:', error);
      alert('Error generating description.');
      setLoading(false);
    }
  };

  const handleTextToSpeech = async () => {
    if (!description()) {
      alert('No description available.');
      return;
    }

    setLoading(true);
    try {
      const result = await createEvent('text_to_speech', {
        text: description(),
      });
      setAudioUrl(result);
    } catch (error) {
      console.error('Error converting text to speech:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4">
      <div class="max-w-3xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-4xl font-bold text-purple-600">Image Describer</h1>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-bold mb-4 text-purple-600">Upload Image</h2>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent box-border"
          />
          <button
            onClick={handleDescribeImage}
            class={`mt-4 w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${loading() ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading()}
          >
            {loading() ? 'Processing...' : 'Describe Image'}
          </button>
        </div>

        <Show when={description()}>
          <div class="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-2xl font-bold mb-4 text-purple-600">Description</h2>
            <p class="text-gray-700">{description()}</p>
            <button
              onClick={handleTextToSpeech}
              class={`mt-4 w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${loading() ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading()}
            >
              {loading() ? 'Loading Audio...' : 'Listen to Description'}
            </button>
          </div>
        </Show>

        <Show when={audioUrl()}>
          <div class="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-2xl font-bold mb-4 text-purple-600">Audio Description</h2>
            <audio controls src={audioUrl()} class="w-full" />
          </div>
        </Show>
      </div>
    </div>
  );
}

export default App;