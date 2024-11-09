import { useState, useRef } from 'react';
import { Play, Pause, RotateCcw, Download, Share2 } from 'lucide-react';

interface AudioPlayerProps {
  url: string;
  label?: string;
}

export function AudioPlayer({ url, label }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (audioRef.current) {
      const time = (value / 100) * audioRef.current.duration;
      audioRef.current.currentTime = time;
      setProgress(value);
    }
  };

  return (
    <div className="space-y-4">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {label && (
        <div className="text-sm text-white/80">
          {label}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="p-3 bg-[#63248d] hover:bg-[#63248d]/80 rounded-full transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>

        <div className="flex-1">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => audioRef.current?.load()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Restart"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
