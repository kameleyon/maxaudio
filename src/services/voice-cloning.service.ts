import axios from 'axios';
import authService from './auth.service';

export interface VoiceTrainingData {
  audioFile: File;
  name: string;
  description?: string;
}

export interface CustomVoiceModel {
  id: string;
  name: string;
  description?: string;
  status: 'training' | 'ready' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface SynthesisRequest {
  text: string;
  voiceModelId: string;
  settings?: {
    speed?: number;
    pitch?: number;
    volume?: number;
  };
}

export interface SynthesisResponse {
  audioUrl: string;
  duration: number;
}

const API_URL = import.meta.env.VITE_API_URL;

class VoiceCloneService {
  async trainCustomVoice(data: VoiceTrainingData): Promise<CustomVoiceModel> {
    const formData = new FormData();
    formData.append('audio', data.audioFile);
    formData.append('name', data.name);
    if (data.description) {
      formData.append('description', data.description);
    }

    const response = await axios.post(`${API_URL}/voice-cloning/train`, formData, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  async getCustomVoiceModel(modelId: string): Promise<CustomVoiceModel> {
    const response = await axios.get(`${API_URL}/voice-cloning/models/${modelId}`, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
    });

    return response.data;
  }

  async listCustomVoiceModels(): Promise<CustomVoiceModel[]> {
    const response = await axios.get(`${API_URL}/voice-cloning/models`, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
    });

    return response.data;
  }

  async synthesizeSpeech(request: SynthesisRequest): Promise<SynthesisResponse> {
    const response = await axios.post(`${API_URL}/voice-cloning/synthesize`, request, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
    });

    return response.data;
  }

  async deleteCustomVoiceModel(modelId: string): Promise<void> {
    await axios.delete(`${API_URL}/voice-cloning/models/${modelId}`, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
    });
  }
}

export const voiceCloneService = new VoiceCloneService();
