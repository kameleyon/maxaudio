import { useState } from 'react';
import { Upload, Loader2, Edit2, Save, RotateCcw, MoreVertical } from 'lucide-react';
import { ContentInput } from '../components/studio/ContentInput';
import { ContentSettings, ContentSettingsType } from '../components/studio/ContentSettings';
import { TranscriptEditor } from '../components/studio/TranscriptEditor';
import { AudioPlayer } from '../components/studio/AudioPlayer';
import { PublishConfirmation } from '../components/studio/PublishConfirmation';
import { AudioGeneratorTest } from '../components/studio/AudioGeneratorTest';
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
  fileName: string;
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
  const [publishSuccessMessage, setPublishSuccessMessage] = useState<string | null>(null);
  const [showTestComponent, setShowTestComponent] = useState(false);

  const generateFileName = (text: string) => {
    const date = new Date();
    const dateStr = date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '');

    // Clean and truncate the text
    const cleanText = text
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove special characters
      .slice(0, 20); // Take first 20 characters

    return `${cleanText}${dateStr}`;
  };

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
      const fileName = generateFileName(textContent);
      const params: AudioGenerateParams = {
        text: textContent,
        languageCode: settings.voice.startsWith('en-GB') ? 'en-GB' : 'en-US',
        voiceName: settings.voice,
        fileName
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

  const handlePublishConfirm = () => {
    setShowPublishConfirm(false);
    setPublishSuccessMessage('Content published successfully!');
    
    // Hide the success message after a short delay
    setTimeout(() => {
      setPublishSuccessMessage(null);
    }, 5000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 md:px-0">
      {/* Header with Workflow */}
      <div>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Studio</h1>
          <button
            onClick={() => setShowTestComponent(!showTestComponent)}
            className="px-3 py-1 text-sm bg-[#63248d]/50 hover:bg-[#63248d]/80 rounded transition-colors"
          >
            {showTestComponent ? 'Hide Test' : 'Show Test'}
          </button>
        </div>
        <div className="p-3 bg-white/5 rounded-lg border border-white/10 overflow-x-auto">
          <div className="flex items-center justify-between text-sm text-white/60 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <p className="whitespace-normal">How does it work? Begin with content creation - whether uploading existing material or writing new text. Then customize your settings to match your specific requirements. After generating your output, review and refine it to ensure quality and accuracy. When satisfied, proceed to publication. This streamlined workflow guides you from initial concept to final delivery.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Component */}
      {showTestComponent && (
        <AudioGeneratorTest />
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Publish Success Message */}
      {publishSuccessMessage && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
          {publishSuccessMessage}
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
                <span>Generating Content...</span>
              </div>
            ) : (
              <span>Generate</span>
            )}
          </button>
        </div>

        {/* Right Side - Transcript */}
        <div className="h-full overflow-y-auto bg-white/5 rounded-lg border border-white/10">
          {isGenerating ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-2 text-white/60">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span>Generating your content...</span>
              </div>
            </div>
          ) : transcript ? (
            <TranscriptEditor
              transcript={transcript}
              onChange={setTranscript}
              onRegenerate={generateAudio}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
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
              <AudioPlayer 
                url={audioUrl} 
                label={generateFileName(transcript)}
              />
            </div>
          ) : null}
        </div>
      )}

      {/* Publish Confirmation Dialog */}
      {showPublishConfirm && (
        <PublishConfirmation
          onConfirm={handlePublishConfirm}
          onCancel={() => setShowPublishConfirm(false)}
        />
      )}
    </div>
  );
}
