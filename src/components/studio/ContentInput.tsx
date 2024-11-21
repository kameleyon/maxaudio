import { ChangeEvent } from 'react';
import { Upload } from 'lucide-react';

interface ContentInputProps {
  content: string;
  onChange: (content: string) => void;
}

export function ContentInput({ content, onChange }: ContentInputProps) {
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange(e.target?.result as string || '');
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Content</h2>
        <label className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer">
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept=".txt,.doc,.docx"
          />
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
          </div>
        </label>
      </div>

      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write or paste your content here..."
        className="w-full h-[120px] px-4 py-3 bg-white/5 border border-white/10 rounded-lg 
                 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                 placeholder-white/40 resize-none"
      />
    </div>
  );
}