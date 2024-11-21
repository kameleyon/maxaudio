import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

export function NaturalSpeechGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          <span className="font-medium">Natural Speech Guide</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 border-t border-white/10 space-y-4">
          <section>
            <h3 className="font-medium mb-2">Basic Markers</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm text-white/60 mb-1">Pauses</h4>
                <ul className="text-sm space-y-1">
                  <li><code>...</code> - Thoughtful pause with "hmm"</li>
                  <li><code>(pause)</code> - Natural pause</li>
                  <li><code>(long pause)</code> - Dramatic pause</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm text-white/60 mb-1">Emotions</h4>
                <ul className="text-sm space-y-1">
                  <li><code>(happy)text)</code> - Happy tone</li>
                  <li><code>(sad)text)</code> - Sad tone</li>
                  <li><code>(excited)text)</code> - Excited tone</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-medium mb-2">Natural Sounds</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm text-white/60 mb-1">Interjections</h4>
                <ul className="text-sm space-y-1">
                  <li><code>(laugh)</code> - Natural laughter</li>
                  <li><code>(agree)</code> - "uh-huh" sound</li>
                  <li><code>(think)</code> - Thoughtful "hmm"</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm text-white/60 mb-1">Voice Styles</h4>
                <ul className="text-sm space-y-1">
                  <li><code>(whisper)text)</code> - Whispered</li>
                  <li><code>(soft)text)</code> - Gentle voice</li>
                  <li><code>(loud)text)</code> - Emphasized</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-medium mb-2">Examples</h3>
            <div className="space-y-2">
              <div className="bg-white/5 p-3 rounded text-sm">
                <div className="text-white/60 mb-1">Basic Example:</div>
                <code>Today, I want to tell you about something amazing... (think) It's a story that begins with a simple idea.</code>
              </div>
              <div className="bg-white/5 p-3 rounded text-sm">
                <div className="text-white/60 mb-1">Emotional Example:</div>
                <code>(excited)I can't believe what happened next!) The results were incredible... (laugh) You should have seen their faces!</code>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-medium mb-2">Tips</h3>
            <ul className="text-sm space-y-1 text-white/80">
              <li>• Use markers sparingly for natural flow</li>
              <li>• Match emotions to your content</li>
              <li>• Place pauses where they make sense</li>
              <li>• Mix different markers for variety</li>
              <li>• Test and adjust based on results</li>
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
