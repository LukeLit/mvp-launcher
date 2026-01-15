// Admin settings storage utilities
// Using in-memory storage for development (similar to kv.ts)

export interface AdminSettings {
  scanEnabled: boolean;
}

const DEFAULT_SETTINGS: AdminSettings = {
  scanEnabled: false, // Default to disabled as requested
};

let settingsStore: AdminSettings = { ...DEFAULT_SETTINGS };

export async function getSettings(): Promise<AdminSettings> {
  if (typeof window !== 'undefined') {
    return { ...DEFAULT_SETTINGS }; // Client-side
  }
  return { ...settingsStore };
}

export async function updateSettings(settings: Partial<AdminSettings>): Promise<AdminSettings> {
  if (typeof window !== 'undefined') {
    return { ...DEFAULT_SETTINGS }; // Client-side
  }
  settingsStore = { ...settingsStore, ...settings };
  return { ...settingsStore };
}
