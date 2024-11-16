import axios from 'axios';

export interface Voice {
  id: string;
  name: string;
  language: string;
  gender: string;
}

export async function synthesizeSpeech(text: string, voiceId: string): Promise<ArrayBuffer> {
  try {
    const response = await axios.post('/api/tts/synthesize', 
      { text, voiceId },
      { responseType: 'arraybuffer' }
    );
    return response.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Speech synthesis failed');
  }
}

export async function getAvailableVoices(): Promise<Voice[]> {
  try {
    const response = await axios.get<Voice[]>('/api/tts/voices');
    return response.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch voices');
  }
}
