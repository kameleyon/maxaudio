import { useState, useEffect, useRef } from 'react';
import { PencilIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface TranscriptEditorProps {
  transcript: string;
  onChange: (transcript: string) => void;
  onRegenerate: (content: string) => void;
}

export function TranscriptEditor({ transcript, onChange, onRegenerate }: TranscriptEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState(transcript);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditedTranscript(transcript);
  }, [transcript]);

  const handleSave = () => {
    onChange(editedTranscript);
    setIsEditing(false);
  };

  const handleRegenerate = () => {
    onRegenerate(editedTranscript);
  };

  return (
    <div className="relative">
      <div className="absolute right-2 top-2 flex gap-2">
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title={isEditing ? "Save changes" : "Edit transcript"}
        >
          {isEditing ? (
            <CheckIcon className="w-5 h-5 text-green-400" />
          ) : (
            <PencilIcon className="w-5 h-5 text-white/60" />
          )}
        </button>
        <button
          onClick={handleRegenerate}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Regenerate audio"
        >
          <ArrowPathIcon className="w-5 h-5 text-white/60" />
        </button>
      </div>

      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editedTranscript}
          onChange={(e) => setEditedTranscript(e.target.value)}
          className="w-full bg-[#ffffff10] rounded-lg p-4 text-white/90 focus:outline-none focus:ring-1 focus:ring-[#ffffff40] resize-none"
          style={{
            height: '300px', // Fixed height
            overflowY: 'auto' // Enable vertical scrolling
          }}
        />
      ) : (
        <div 
          className="w-full bg-[#ffffff10] rounded-lg p-4 text-white/90 whitespace-pre-wrap"
          style={{
            height: '300px', // Fixed height
            overflowY: 'auto' // Enable vertical scrolling
          }}
        >
          {transcript}
        </div>
      )}
    </div>
  );
}
