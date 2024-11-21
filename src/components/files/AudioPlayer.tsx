import { useRef, useEffect } from 'react';

interface AudioPlayerProps {
  url: string;
  isPlaying: boolean;
  onEnded: () => void;
}

export function AudioPlayer({ url, isPlaying, onEnded }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <audio
      ref={audioRef}
      src={url}
      onEnded={onEnded}
      style={{ display: 'none' }}
    />
  );
}
