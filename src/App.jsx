import { createSignal, onMount, createEffect, Show } from 'solid-js';
import { supabase } from './supabaseClient';
import { Auth } from '@supabase/auth-ui-solid';
import { ThemeSupa } from '@supabase/auth-ui-shared';

function App() {
  const [user, setUser] = createSignal(null);
  const [currentPage, setCurrentPage] = createSignal('login');
  const [imageFile, setImageFile] = createSignal(null);
  const [description, setDescription] = createSignal('');
  const [audioUrl, setAudioUrl] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  const checkUserSignedIn = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setCurrentPage('homePage');
    }
  };

  onMount(checkUserSignedIn);

  createEffect(() => {
    const authListener = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(session.user);
        setCurrentPage('homePage');
      } else {
        setUser(null);
        setCurrentPage('login');
      }
    });

    return () => {
      authListener.data.unsubscribe();
    };
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('login');
  };

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
      const { data: { session } } = await supabase.auth.getSession();

      // Read the file as base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1]; // Remove the data:url prefix

        const response = await fetch('/api/describeImage', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
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
      <Show
        when={currentPage() === 'homePage'}
        fallback={
          <div class="flex items-center justify-center min-h-screen">
            <div class="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
              <h2 class="text-3xl font-bold mb-6 text-center text-purple-600">Sign in with ZAPT</h2>
              <a
                href="https://www.zapt.ai"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 hover:underline mb-6 block text-center"
              >
                Learn more about ZAPT
              </a>
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'facebook', 'apple']}
                magicLink={true}
                view="magic_link"
                showLinks={false}
                authView="magic_link"
              />
            </div>
          </div>
        }
      >
        <div class="max-w-3xl mx-auto">
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-4xl font-bold text-purple-600">Image Describer</h1>
            <button
              class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
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
      </Show>
    </div>
  );
}

export default App;