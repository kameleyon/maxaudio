import { useState } from 'react';

export function AudioGeneratorTest() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const testAudioGeneration = async () => {
    setIsGenerating(true);
    setError(null);
    
    const testText = "This is a test of the audio generation function. If you can hear this, the Netlify Function is working correctly.";
    
    try {
      const response = await fetch('/.netlify/functions/generateAudio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: testText,
          languageCode: 'en-US',
          voiceName: 'en-US-Studio-M'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }
      
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (err) {
      console.error('Audio generation test error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate audio');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
      <h2 className="text-lg font-semibold mb-4">Audio Generator Test</h2>
      
      <button
        onClick={testAudioGeneration}
        disabled={isGenerating}
        className="px-4 py-2 bg-[#63248d] hover:bg-[#63248d]/80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? 'Generating...' : 'Test Generate Audio'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {audioUrl && (
        <div className="mt-4">
          <audio controls src={audioUrl} className="w-full">
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}
