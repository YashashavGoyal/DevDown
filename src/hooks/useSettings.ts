import { useState, useEffect } from 'react';

export interface AppSettings {
  fontSize: number;
  fontFamily: 'sans' | 'serif' | 'mono';
  lineNumbers: boolean;
  lineWrapping: boolean;
  zenMode: boolean;
  autoSave: boolean;
  showToolbarInZen: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  fontSize: 16,
  fontFamily: 'sans',
  lineNumbers: true,
  lineWrapping: true,
  zenMode: false,
  autoSave: true,
  showToolbarInZen: false,
};

/**
 * Custom hook to manage application settings with persistence.
 * Designed to be easily migratable to Tauri/Native storage.
 */
export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('devdown_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch (err) {
      console.error('Failed to parse settings from localStorage:', err);
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem('devdown_settings', JSON.stringify(settings));
    
    // Apply global font settings to document root for CSS variables
    const root = document.documentElement;
    root.style.setProperty('--app-font-size', `${settings.fontSize}px`);
    root.style.setProperty('--app-font-family', 
      settings.fontFamily === 'sans' ? 'Inter, system-ui, sans-serif' : 
      settings.fontFamily === 'serif' ? 'Georgia, serif' : 
      'JetBrains Mono, monospace'
    );
  }, [settings]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return { settings, updateSettings, resetSettings };
}
