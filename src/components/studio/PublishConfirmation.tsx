import { useState } from 'react';

interface PublishConfirmationProps {
  onConfirm: (title: string) => void;
  onCancel: () => void;
  transcript: string;
}

export function PublishConfirmation({ onConfirm, onCancel, transcript }: PublishConfirmationProps) {
  const [title, setTitle] = useState(transcript.slice(0, 20) + '...');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md p-6 bg-[#0f0035] rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Publish Audio</h3>
        
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="title" className="block text-sm text-white/60 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg 
                       focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                       text-white placeholder-white/40"
              placeholder="Enter a title for your audio"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">
              Preview
            </label>
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-white/80 text-sm">
              {transcript.slice(0, 100)}...
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(title)}
            className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}