import { useState, useEffect, useCallback } from 'react';
import useAuth from './useAuth';

interface UserSettings {
  id: string;
  user_id: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  auto_save: boolean;
  language: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

interface SettingsHook {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  isUpdating: boolean;
}

// Default settings
const getDefaultSettings = (userId: string): UserSettings => ({
  id: userId,
  user_id: userId,
  notifications_enabled: true,
  email_notifications: true,
  push_notifications: true,
  auto_save: true,
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export const useSettings = (): SettingsHook => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Get settings from localStorage
  const getSettingsFromStorage = useCallback((userId: string): UserSettings | null => {
    try {
      const stored = localStorage.getItem(`user_settings_${userId}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  // Save settings to localStorage
  const saveSettingsToStorage = useCallback((userId: string, settings: UserSettings) => {
    try {
      localStorage.setItem(`user_settings_${userId}`, JSON.stringify(settings));
    } catch (err) {
      console.error('Error saving settings to localStorage:', err);
    }
  }, []);

  // Fetch user settings
  const fetchSettings = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get settings from localStorage
      let userSettings = getSettingsFromStorage(user.id);

      if (!userSettings) {
        // Create default settings if none exist
        userSettings = getDefaultSettings(user.id);
        saveSettingsToStorage(user.id, userSettings);
      }

      setSettings(userSettings);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [user, getSettingsFromStorage, saveSettingsToStorage]);

  // Update settings with optimistic updates
  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!user || !settings) return;

    try {
      setIsUpdating(true);
      setError(null);

      // Optimistic update - update UI immediately
      const optimisticSettings = { 
        ...settings, 
        ...updates, 
        updated_at: new Date().toISOString() 
      };
      setSettings(optimisticSettings);

      // Save to localStorage
      saveSettingsToStorage(user.id, optimisticSettings);

      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 100));

      // In a real app, you would save to database here
      // For now, we'll just use localStorage
      
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [user, settings, saveSettingsToStorage]);

  // Reset settings to defaults
  const resetSettings = useCallback(async () => {
    if (!user) return;

    try {
      setIsUpdating(true);
      setError(null);

      const defaultSettings = getDefaultSettings(user.id);

      // Optimistic update
      setSettings(defaultSettings);
      saveSettingsToStorage(user.id, defaultSettings);

      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (err) {
      console.error('Error resetting settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset settings');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [user, saveSettingsToStorage]);

  // Fetch settings on mount and when user changes
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    resetSettings,
    isUpdating,
  };
}; 