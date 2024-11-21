import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/auth.service';
import { Switch } from '../ui/switch';
import { Select, type SelectOption } from '../ui/select';

type ThemeValue = 'light' | 'dark' | 'system';
type LanguageValue = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko';

const languages: SelectOption<LanguageValue>[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
];

const themes: SelectOption<ThemeValue>[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export function PreferencesPanel() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return null;
  }

  const handleThemeChange = async (theme: ThemeValue) => {
    try {
      setIsSaving(true);
      await authService.updatePreferences({
        ...user.preferences,
        theme,
      });
    } catch (error) {
      console.error('Failed to update theme:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguageChange = async (language: LanguageValue) => {
    try {
      setIsSaving(true);
      await authService.updatePreferences({
        ...user.preferences,
        language,
      });
    } catch (error) {
      console.error('Failed to update language:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationsChange = async (enabled: boolean) => {
    try {
      setIsSaving(true);
      await authService.updatePreferences({
        ...user.preferences,
        emailNotifications: enabled,
      });
    } catch (error) {
      console.error('Failed to update notifications:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Preferences</h3>
        <p className="text-sm text-gray-500">
          Manage your application preferences and settings.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="theme" className="block text-sm font-medium">
              Theme
            </label>
            <p className="text-sm text-gray-500">Choose your preferred theme.</p>
          </div>
          <Select<ThemeValue>
            id="theme"
            value={user.preferences.theme}
            options={themes}
            onChange={handleThemeChange}
            disabled={isSaving}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="language" className="block text-sm font-medium">
              Language
            </label>
            <p className="text-sm text-gray-500">Select your preferred language.</p>
          </div>
          <Select<LanguageValue>
            id="language"
            value={user.preferences.language as LanguageValue}
            options={languages}
            onChange={handleLanguageChange}
            disabled={isSaving}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="notifications" className="block text-sm font-medium">
              Email Notifications
            </label>
            <p className="text-sm text-gray-500">
              Receive email notifications about important updates.
            </p>
          </div>
          <Switch
            id="notifications"
            checked={user.preferences.emailNotifications}
            onCheckedChange={handleNotificationsChange}
            disabled={isSaving}
          />
        </div>
      </div>
    </div>
  );
}
