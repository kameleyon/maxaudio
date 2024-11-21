import { Upload, Mic } from 'lucide-react'

interface VoiceUploadProps {
  isRecording: boolean
  onFileUpload: (file: File) => void
  onStartRecording: () => void
  onStopRecording: () => void
}

export function VoiceUpload({
  isRecording,
  onFileUpload,
  onStartRecording,
  onStopRecording
}: VoiceUploadProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileUpload(file)
    }
  }

  return (
    <div className="bg-white/5 rounded-lg border border-white/10 p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Voice Sample</h2>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {/* File Upload */}
        <div className="flex-1">
          <label className="block w-full cursor-pointer">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex items-center justify-center gap-3 px-4 py-8 border-2 border-dashed border-white/20 rounded-lg hover:border-primary transition-colors">
              <Upload className="w-6 h-6 text-white/60" />
              <span className="text-white/60">Upload audio file</span>
            </div>
          </label>
        </div>

        {/* Record */}
        <div className="flex-1">
          <button
            onClick={isRecording ? onStopRecording : onStartRecording}
            className={`w-full flex items-center justify-center gap-3 px-4 py-8 rounded-lg transition-colors ${
              isRecording
                ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <Mic className="w-6 h-6" />
            <span>{isRecording ? 'Stop Recording' : 'Record Voice'}</span>
          </button>
        </div>
      </div>

      <button
        className="mt-6 w-full px-6 py-3 bg-primary hover:bg-primary/80 rounded-lg transition-colors font-medium"
      >
        Clone Voice
      </button>
    </div>
  )
}