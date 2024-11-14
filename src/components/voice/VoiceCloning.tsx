import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mic, Upload, Play, Square, RefreshCw, Trash2, Save, AlertCircle } from 'lucide-react';
import { voiceCloningService, type VoiceTrainingData, type CustomVoiceModel } from '../../services/voice-cloning.service';

interface TrainingItem {
  id: string;
  audioUrl: string;
  transcription: string;
  duration: number;
}

export function VoiceCloning() {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [trainingItems, setTrainingItems] = useState<TrainingItem[]>([]);
  const [transcription, setTranscription] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<CustomVoiceModel | null>(null);
  const [testText, setTestText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [testAudioUrl, setTestAudioUrl] = useState<string | null>(null);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioContext = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    audioContext.current = new AudioContext();
    return () => {
      audioContext.current?.close();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const duration = await getAudioDuration(audioBlob);

        setTrainingItems(prev => [...prev, {
          id: crypto.randomUUID(),
          audioUrl,
          transcription: '',
          duration
        }]);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please check your microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const audioBlob = await convertToWav(file);
      const audioUrl = URL.createObjectURL(audioBlob);
      const duration = await getAudioDuration(audioBlob);

      setTrainingItems(prev => [...prev, {
        id: crypto.randomUUID(),
        audioUrl,
        transcription: '',
        duration
      }]);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to process audio file. Please ensure it\'s a valid audio format.');
    }
  };

  const convertToWav = async (file: File): Promise<Blob> => {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.current!.decodeAudioData(arrayBuffer);
    
    // Convert to WAV format
    const wavBuffer = await audioContext.current!.createBuffer(
      1, // mono
      audioBuffer.length,
      48000 // 48kHz
    );
    
    // Copy and resample audio data
    const channelData = audioBuffer.getChannelData(0);
    wavBuffer.copyToChannel(channelData, 0);

    // Create WAV blob
    const offlineContext = new OfflineAudioContext(1, wavBuffer.length, 48000);
    const source = offlineContext.createBufferSource();
    source.buffer = wavBuffer;
    source.connect(offlineContext.destination);
    source.start();

    const renderedBuffer = await offlineContext.startRendering();
    const wavBlob = await audioBufferToWav(renderedBuffer);
    
    return wavBlob;
  };

  const audioBufferToWav = async (buffer: AudioBuffer): Promise<Blob> => {
    const worker = new Worker('/wav-encoder-worker.js');
    
    return new Promise((resolve, reject) => {
      worker.onmessage = (e) => {
        if (e.data.type === 'complete') {
          resolve(e.data.blob);
          worker.terminate();
        }
      };
      
      worker.onerror = reject;
      
      worker.postMessage({
        command: 'encode',
        buffer: buffer.getChannelData(0),
        sampleRate: buffer.sampleRate
      });
    });
  };

  const getAudioDuration = async (blob: Blob): Promise<number> => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    
    return new Promise((resolve) => {
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        resolve(audio.duration);
      });
    });
  };

  const handleTrainModel = async () => {
    if (trainingItems.length === 0) {
      setError('Please add at least one audio sample for training.');
      return;
    }

    if (trainingItems.some(item => !item.transcription.trim())) {
      setError('Please provide transcription for all audio samples.');
      return;
    }

    setIsTraining(true);
    setError(null);

    try {
      const trainingData: VoiceTrainingData[] = await Promise.all(
        trainingItems.map(async item => {
          const response = await fetch(item.audioUrl);
          const audioContent = await response.arrayBuffer();
          return {
            audioContent: Buffer.from(audioContent),
            transcription: item.transcription,
            speakerName: user?.name || 'Unknown Speaker',
            languageCode: 'en-US' // TODO: Make this configurable
          };
        })
      );

      const trainedModel = await voiceCloningService.trainCustomVoice(trainingData);
      setModel(trainedModel);
    } catch (err) {
      console.error('Error training model:', err);
      setError('Failed to train voice model. Please try again.');
    } finally {
      setIsTraining(false);
    }
  };

  const handleTestVoice = async () => {
    if (!model || !testText.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const audioContent = await voiceCloningService.synthesizeWithCustomVoice(
        testText,
        model.id,
        {
          languageCode: 'en-US',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      );

      const blob = new Blob([audioContent], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      setTestAudioUrl(url);
    } catch (err) {
      console.error('Error generating test audio:', err);
      setError('Failed to generate test audio. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
        <p className="text-center text-white/60">Please sign in to use voice cloning.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Training Data Collection */}
      <div className="p-6 bg-white/5 rounded-lg border border-white/10">
        <h2 className="text-xl font-semibold mb-4">Voice Training</h2>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-primary hover:bg-primary/80'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4" />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Start Recording</span>
              </>
            )}
          </button>

          <label className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Upload Audio</span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Training Items List */}
        <div className="space-y-4">
          {trainingItems.map((item, index) => (
            <div key={item.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="mb-2">
                    <audio src={item.audioUrl} controls className="w-full" />
                  </div>
                  <textarea
                    value={item.transcription}
                    onChange={(e) => {
                      const newItems = [...trainingItems];
                      newItems[index].transcription = e.target.value;
                      setTrainingItems(newItems);
                    }}
                    placeholder="Enter transcription for this audio..."
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg resize-none"
                    rows={2}
                  />
                </div>
                <button
                  onClick={() => {
                    const newItems = trainingItems.filter(i => i.id !== item.id);
                    setTrainingItems(newItems);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {trainingItems.length > 0 && (
          <div className="mt-6">
            <button
              onClick={handleTrainModel}
              disabled={isTraining}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTraining ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Training Model...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Train Voice Model</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Test Voice */}
      {model && (
        <div className="p-6 bg-white/5 rounded-lg border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Test Voice</h2>
          
          <div className="space-y-4">
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter text to test your voice..."
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg resize-none"
              rows={3}
            />

            <div className="flex gap-4">
              <button
                onClick={handleTestVoice}
                disabled={isGenerating || !testText.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Generate Speech</span>
                  </>
                )}
              </button>
            </div>

            {testAudioUrl && (
              <div className="mt-4">
                <audio src={testAudioUrl} controls className="w-full" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
