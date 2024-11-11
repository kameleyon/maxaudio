import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Moon, Sun, Globe, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface UserMetadata {
  preferredLanguage?: string;
  emailNotifications?: boolean;
}

const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
] as const;

type LanguageCode = typeof AVAILABLE_LANGUAGES[number]['code'];

interface FormData {
  displayName: string;
  preferredLanguage: LanguageCode;
  emailNotifications: boolean;
}

export function PreferencesPanel() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [isUpdating, setIsUpdating] = useState(false);

  const metadata = user?.publicMetadata as UserMetadata;
  
  const [formData, setFormData] = useState<FormData>({
    displayName: user?.fullName || '',
    preferredLanguage: (metadata?.preferredLanguage as LanguageCode) || 'en',
    emailNotifications: metadata?.emailNotifications !== false,
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsUpdating(true);

    try {
      const names = formData.displayName.split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ');

      await user.update({
        firstName,
        lastName,
        unsafeMetadata: {
          preferredLanguage: formData.preferredLanguage,
          emailNotifications: formData.emailNotifications,
        },
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Profile Information */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-white/60 mb-2">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your display name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/60 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={user.primaryEmailAddress?.emailAddress || ''}
                disabled
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/40"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full px-4 py-2 bg-primary hover:bg-primary/80 disabled:bg-primary/50 rounded-lg transition-colors"
          >
            {isUpdating ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* Theme Preferences */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Theme Preferences</h2>
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-primary" />
              )}
              <span>Theme Mode</span>
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </button>
          </div>
        </div>
      </div>

      {/* Language Preferences */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Language Preferences</h2>
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <span>Interface Language</span>
          </div>
          
          <select
            value={formData.preferredLanguage}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              preferredLanguage: e.target.value as LanguageCode 
            }))}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {AVAILABLE_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>

          <p className="text-sm text-white/40">
            This will change the language of the interface. Your content and generated audio will not be affected.
          </p>
        </div>
      </div>

      {/* Notification Preferences */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
          <label className="flex items-center justify-between cursor-pointer">
            <span>Email Notifications</span>
            <input
              type="checkbox"
              checked={formData.emailNotifications}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                emailNotifications: e.target.checked 
              }))}
              className="w-5 h-5 rounded text-primary bg-white/5 border-white/10 focus:ring-primary"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
