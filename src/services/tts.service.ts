import axios from 'axios';

export interface Voice {
  name: string;
  languageCode: string;
  gender: string;
}

export async function synthesizeSpeech(text: string, voice: string): Promise<Blob> {
  try {
    const response = await axios.post('/api/tts/synthesize', 
      { text, voice },
      { responseType: 'blob' }
    );
    return new Blob([response.data], { type: 'audio/mpeg' });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Speech synthesis failed');
  }
}

export async function getAvailableVoices(): Promise<Voice[]> {
  try {
    const response = await axios.get<Voice[]>('/api/tts/voices');
    return response.data.map(voice => ({
      name: String(voice.name),
      languageCode: String(voice.languageCode),
      gender: String(voice.gender)
    }));
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch voices');
  }
}
