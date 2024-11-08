import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000', // Adjust this to point to your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function synthesizeSpeech(text: string, voice: string): Promise<Blob> {
  try {
    const response = await apiClient.post('/api/tts/synthesize', 
      { text, voice },
      { 
        responseType: 'blob',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout for audio generation
      }
    );
    return response.data;
  } catch (error) {
    console.error('TTS Client Error:', 
      axios.isAxiosError(error) ? error.response?.data || error.message : error
    );
    throw error;
  }
}
