import { useState } from 'react'

export function Legal() {
  const [activeSection, setActiveSection] = useState('terms')

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="flex gap-4">
        {[
          { id: 'terms', label: 'Terms of Service' },
          { id: 'privacy', label: 'Privacy Policy' },
          { id: 'security', label: 'Security' },
          { id: 'cookies', label: 'Cookies' }
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeSection === section.id
                ? 'bg-primary text-white'
                : 'bg-white/5 text-white/80 hover:bg-white/10'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="prose prose-invert max-w-none">
        {activeSection === 'terms' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Terms of Service</h2>
            <p className="text-white/80">
              By using AUDIOMAX, you agree to these terms of service...
            </p>
            {/* Add more terms content */}
          </div>
        )}

        {activeSection === 'privacy' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Privacy Policy</h2>
            <p className="text-white/80">
              Your privacy is important to us. This policy explains how we collect...
            </p>
            {/* Add more privacy content */}
          </div>
        )}

        {activeSection === 'security' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Security</h2>
            <p className="text-white/80">
              We take security seriously and implement industry-standard measures...
            </p>
            {/* Add more security content */}
          </div>
        )}

        {activeSection === 'cookies' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Cookie Policy</h2>
            <p className="text-white/80">
              We use cookies to enhance your experience...
            </p>
            {/* Add more cookie policy content */}
          </div>
        )}
      </div>
    </div>
  )
}