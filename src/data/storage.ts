export const storage = {
  get(key: string): string | null {
    return localStorage.getItem(key);
  },
  set(key: string, value: string): void {
    localStorage.setItem(key, value);
  },
  remove(key: string): void {
    localStorage.removeItem(key);
  },
  getJSON<T>(key: string, fallback: T): T {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch (e) {
      console.error(`Failed to parse stored JSON for key "${key}":`, e);
      localStorage.removeItem(key);
      return fallback;
    }
  },
  setJSON(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to save to localStorage for key "${key}":`, e);
    }
  },
};
