import { useState } from 'react';
import { Upload, Loader2, Edit2, Save, RotateCcw, MoreVertical } from 'lucide-react';
import { ContentInput } from '../components/studio/ContentInput';
import { ContentSettings, ContentSettingsType } from '../components/studio/ContentSettings';
import { TranscriptEditor } from '../components/studio/TranscriptEditor';
import { AudioPlayer } from '../components/studio/AudioPlayer';
import { PublishConfirmation } from '../components/studio/PublishConfirmation';
import { generateContent } from '../services/openrouter';

interface GenerateContentParams {
  content: string;
  tone: string;
  category: string;
}

interface AudioGenerateParams {
  text: string;
  languageCode: 'en-GB' | 'en-US';
  voiceName: string;
}

export function Studio() {
  // Content state
  const [content, setContent] = useState('');
  const [settings, setSettings] = useState<ContentSettingsType>({
    category: 'podcast',
    tone: 'professional',
    voiceType: 'library',
    voice: 'en-US-Journey-D'
  });

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const params: GenerateContentParams = {
        content,
        tone: settings.tone,
        category: settings.category
      };
      
      const generatedContent = await generateContent(params);
      
      setTranscript(generatedContent);
      generateAudio(generatedContent);
    } catch (err) {
      console.error('Generation error:', err);
      setError('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAudio = async (textContent: string) => {
    setIsGeneratingAudio(true);
    try {
      const params: AudioGenerateParams = {
        text: textContent,
        languageCode: settings.voice.startsWith('en-GB') ? 'en-GB' : 'en-US',
        voiceName: settings.voice
      };

      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      } else {
        const errorText = await response.text();
        throw new Error(errorText);
      }
    } catch (err) {
      console.error('Audio generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate audio');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handlePublish = () => {
    setShowPublishConfirm(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 md:px-0">
      {/* Header with Workflow */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Studio</h1>
        <div className="p-3 bg-white/5 rounded-lg border border-white/10 overflow-x-auto">
          <div className="flex items-center justify-between text-sm text-white/60 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span>Upload/Write</span>
              <span>➞</span>
              <span>Configure</span>
              <span>➞</span>
              <span>Generate</span>
              <span>➞</span>
              <span>Edit</span>
              <span>➞</span>
              <span>Publish</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side - Input and Settings */}
        <div className="space-y-4">
          <ContentInput 
            content={content}
            onChange={setContent}
          />
          
          <ContentSettings 
            settings={settings}
            onChange={setSettings}
          />

          <button
            onClick={handleGenerate}
            disabled={!content || isGenerating}
            className="w-full px-6 py-3 bg-[#63248d] hover:bg-[#63248d]/80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Content...</span>
              </div>
            ) : (
              <span>Generate</span>
            )}
          </button>
        </div>

        {/* Right Side - Transcript */}
        <div className="h-full">
          {isGenerating ? (
            <div className="h-full flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
              <div className="flex flex-col items-center gap-2 text-white/60">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span>Generating content with Llama 2...</span>
              </div>
            </div>
          ) : transcript ? (
            <div className="h-full">
              <TranscriptEditor
                transcript={transcript}
                onChange={setTranscript}
                onRegenerate={generateAudio}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/60">
                Generated content will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Audio Section */}
      {transcript && (
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          {isGeneratingAudio ? (
            <div className="flex items-center justify-center gap-2 text-white/60 py-4">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Generating audio...</span>
            </div>
          ) : audioUrl ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Generated Audio</h2>
                <button
                  onClick={handlePublish}
                  className="px-4 py-2 bg-[#63248d] hover:bg-[#63248d]/80 rounded-lg transition-colors"
                >
                  Publish
                </button>
              </div>
              <AudioPlayer url={audioUrl} />
            </div>
          ) : null}
        </div>
      )}

      {/* Publish Confirmation Dialog */}
      {showPublishConfirm && (
        <PublishConfirmation
          onConfirm={() => {
            // TODO: Handle publish
            setShowPublishConfirm(false);
          }}
          onCancel={() => setShowPublishConfirm(false)}
        />
      )}
    </div>
  );
}
