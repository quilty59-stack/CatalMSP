import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface SettingsContextType {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (value: boolean) => void;
  notifyNewMsp: boolean;
  setNotifyNewMsp: (value: boolean) => void;
  notifyUpdates: boolean;
  setNotifyUpdates: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'catalmsp_settings';

interface StoredSettings {
  darkMode: boolean;
  notificationsEnabled: boolean;
  notifyNewMsp: boolean;
  notifyUpdates: boolean;
}

const defaultSettings: StoredSettings = {
  darkMode: false,
  notificationsEnabled: true,
  notifyNewMsp: true,
  notifyUpdates: true,
};

function getStoredSettings(): StoredSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return defaultSettings;
}

function saveSettings(settings: StoredSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoredSettings>(getStoredSettings);

  // Apply dark mode to document
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Save settings whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const setDarkMode = (value: boolean) => {
    setSettings(prev => ({ ...prev, darkMode: value }));
  };

  const setNotificationsEnabled = (value: boolean) => {
    setSettings(prev => ({ ...prev, notificationsEnabled: value }));
  };

  const setNotifyNewMsp = (value: boolean) => {
    setSettings(prev => ({ ...prev, notifyNewMsp: value }));
  };

  const setNotifyUpdates = (value: boolean) => {
    setSettings(prev => ({ ...prev, notifyUpdates: value }));
  };

  return (
    <SettingsContext.Provider
      value={{
        darkMode: settings.darkMode,
        setDarkMode,
        notificationsEnabled: settings.notificationsEnabled,
        setNotificationsEnabled,
        notifyNewMsp: settings.notifyNewMsp,
        setNotifyNewMsp,
        notifyUpdates: settings.notifyUpdates,
        setNotifyUpdates,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
