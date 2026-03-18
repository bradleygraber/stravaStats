import { storage } from './storage';

const STORAGE_KEY = 'stravaStatsState';
const CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_STRAVA_CLIENT_SECRET;

export interface LoginData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete?: any;
  [key: string]: any;
}

interface SavedState {
  loginData?: LoginData;
  activities?: any[];
}

export function getSavedState(): SavedState {
  return storage.getJSON<SavedState>(STORAGE_KEY, {});
}

export function saveState(loginData: LoginData, activities: any[]): void {
  storage.setJSON(STORAGE_KEY, { loginData, activities });
}

export function clearStoredData(): void {
  storage.remove(STORAGE_KEY);
}

export async function exchangeAuthCode(code: string): Promise<LoginData | null> {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (res.status !== 200) return null;
  return res.json();
}

export async function refreshAccessToken(loginData: LoginData): Promise<LoginData | null> {
  if (new Date(loginData.expires_at * 1000) > new Date()) {
    return loginData; // not expired
  }

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: loginData.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  if (res.status === 200) return res.json();
  if (res.status === 401) {
    clearStoredData();
    return null;
  }
  return null;
}

export function getOAuthUrl(): string {
  const redirectUri = `${window.location.origin}/auth`;
  return `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&approval_prompt=auto&scope=activity:read_all`;
}
