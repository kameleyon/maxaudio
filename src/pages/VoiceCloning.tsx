import { useState } from 'react';
import { VoiceHeader } from '../components/voice/VoiceHeader';
import { VoiceList } from '../components/voice/VoiceList';
import { VoiceUpload } from '../components/voice/VoiceUpload';
import { FavoriteVoices } from '../components/voice/FavoriteVoices';

export function VoiceCloning() {
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <VoiceHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voice Upload Section */}
        <div className="lg:col-span-2">
          <VoiceUpload
            isRecording={isRecording}
            onFileUpload={handleFileUpload}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
          />
          
          {/* Voice List */}
          <div className="mt-6">
            <VoiceList />
          </div>
        </div>

        {/* Favorite Voices Section */}
        <div className="lg:col-span-1">
          <FavoriteVoices />
        </div>
      </div>
    </div>
  );
}