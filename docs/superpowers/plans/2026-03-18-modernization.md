# Strava Stats Modernization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize dependencies and code patterns while preserving identical functionality and UI.

**Architecture:** Migrate from CRA to Vite, upgrade React 16→18, Ionic 5→8. Refactor the imperative `StravaStats` class into a `useStravaData` hook, replace prop-drilled `{get, set}` state with React Context for theming, replace Capacitor Storage with localStorage, and move API credentials to env vars.

**Tech Stack:** React 18, Ionic 8, Vite, TypeScript 5, react-router v5 (pinned by Ionic), sass (dart), react-data-table-component v7

**Spec:** `docs/superpowers/specs/2026-03-18-modernization-design.md`

---

## File Structure

### Files to Create
- `vite.config.ts` — Vite config with React plugin and SCSS support
- `src/main.tsx` — new entry point (replaces `src/index.tsx`)
- `src/vite-env.d.ts` — TypeScript declarations for Vite env vars
- `.env` — Strava API credentials
- `.env.example` — placeholder template
- `src/hooks/useStravaData.ts` — main data hook replacing `StravaStats` class
- `src/hooks/useTheme.ts` — theme context and provider
- `src/data/stravaAuth.ts` — auth functions (getAccessToken, refreshAccessToken)
- `src/data/stravaProcessing.ts` — activity processing pipeline (addActivity, calcAverages, sort, convertToDisplayValues)
- `src/data/storage.ts` — localStorage wrapper (thin helpers for get/set/remove JSON)

### Files to Modify
- `package.json` — dependency updates, script changes
- `tsconfig.json` — update target, jsx setting for Vite
- `index.html` — move to project root (Vite convention), remove `%PUBLIC_URL%`
- `src/App.tsx` — full rewrite: setupIonicReact, ThemeProvider, useStravaData, IonLoading
- `src/pages/login.tsx` — read client ID from env var
- `src/pages/mainTabs.tsx` — consume hook/context instead of prop-drilled state
- `src/pages/StravaTab.tsx` — consume context, update data-table selectors to functions, swap Capacitor Storage for localStorage
- `src/pages/Menu.tsx` — consume context, swap Capacitor Storage for localStorage
- `src/data/whichState.ts` — convert class to async functions, fix Promise wrapping
- `src/theme/themeGenerator.tsx` — no logic changes, just clean up types
- `.gitignore` — add `.env`

### Files to Delete
- `src/index.tsx` — replaced by `src/main.tsx`
- `src/data/stravaStats.tsx` — replaced by hooks + modules
- `src/data/state.tsx` — replaced by context
- `src/data/combineReducers.ts` — unused
- `src/pages/loading.tsx` — unused
- `src/serviceWorker.ts` — CRA artifact
- `src/setupTests.ts` — CRA artifact (recreate if needed)
- `src/react-app-env.d.ts` — CRA artifact, replaced by `vite-env.d.ts`
- `capacitor.config.json` — no native usage
- `ionic.config.json` — not needed for web-only Vite build

---

## Task 1: Scaffold Vite and update dependencies

**Files:**
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/vite-env.d.ts`
- Modify: `package.json`
- Modify: `tsconfig.json`
- Modify: `index.html` (move to project root)
- Delete: `src/index.tsx`, `src/react-app-env.d.ts`, `src/serviceWorker.ts`, `src/setupTests.ts`, `capacitor.config.json`, `ionic.config.json`

- [ ] **Step 1: Delete ALL old source files that will be replaced**

Delete CRA artifacts, Capacitor config, and all source files that import from `@capacitor/core` or are being fully rewritten. This avoids broken imports between tasks.

```bash
rm src/index.tsx src/react-app-env.d.ts src/serviceWorker.ts src/setupTests.ts capacitor.config.json ionic.config.json src/data/combineReducers.ts src/pages/loading.tsx src/data/stravaStats.tsx src/data/state.tsx src/util/util.ts
rmdir src/util
```

Note: `src/App.tsx`, `src/pages/login.tsx`, `src/pages/mainTabs.tsx`, `src/pages/StravaTab.tsx`, `src/pages/Menu.tsx` also import from Capacitor but will be fully rewritten in later tasks. They will have compile errors until then — this is expected. The `public/` directory (containing `assets/`, `manifest.json`) stays in place — Vite serves it automatically.

- [ ] **Step 2: Move `index.html` to project root and update for Vite**

Move `public/index.html` to project root. Replace `%PUBLIC_URL%` with plain paths. Add the Vite module script entry point.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Strava Stats</title>
    <base href="/" />
    <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="msapplication-tap-highlight" content="no" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="shortcut icon" type="image/png" href="/assets/icon/favicon.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="Strava Stats" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
  </head>
  <body>
    <div id="root"><div style="text-align: center; margin-top: 200px;">Loading</div></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Delete old `public/index.html`.

- [ ] **Step 3: Create `vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
  },
});
```

Note: `outDir: 'build'` matches the existing Firebase Hosting config (`"public": "build"`).

- [ ] **Step 4: Create `src/main.tsx`**

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);
```

- [ ] **Step 5: Create `src/vite-env.d.ts`**

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRAVA_CLIENT_ID: string;
  readonly VITE_STRAVA_CLIENT_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 6: Update `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

- [ ] **Step 7: Replace dependencies in `package.json`**

Remove all existing dependencies and devDependencies. Install fresh:

```bash
npm install react@18 react-dom@18 @ionic/react@latest @ionic/react-router@latest react-router@5 react-router-dom@5 @turf/boolean-point-in-polygon tinycolor2 react-data-table-component styled-components ionicons
```

```bash
npm install -D vite @vitejs/plugin-react typescript @types/react@18 @types/react-dom@18 @types/react-router@5 @types/react-router-dom@5 @types/tinycolor2 sass
```

Update `package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

Remove `eslintConfig` and `browserslist` sections (CRA artifacts).

- [ ] **Step 8: Run `npm install` and verify Vite starts**

```bash
npm install
npm run dev
```

Expected: Vite dev server starts. The app will not render correctly yet because `App.tsx` still imports Capacitor — that's expected and fixed in later tasks.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: migrate from CRA to Vite, update all dependencies"
```

---

## Task 2: Environment variables and `.gitignore`

**Files:**
- Create: `.env`
- Create: `.env.example`
- Modify: `.gitignore`

- [ ] **Step 1: Add `.env` to `.gitignore`**

Add this line to the top of `.gitignore`:

```
.env
```

- [ ] **Step 2: Create `.env`**

```
VITE_STRAVA_CLIENT_ID=41457
VITE_STRAVA_CLIENT_SECRET=e28ef93238546fb930bdf561ce8aabe5670eee13
```

- [ ] **Step 3: Create `.env.example`**

```
VITE_STRAVA_CLIENT_ID=
VITE_STRAVA_CLIENT_SECRET=
```

- [ ] **Step 4: Commit**

```bash
git add .gitignore .env.example
git commit -m "chore: add env var setup for Strava API credentials"
```

Note: `.env` itself is gitignored and should NOT be committed.

---

## Task 3: localStorage storage helper

**Files:**
- Create: `src/data/storage.ts`

- [ ] **Step 1: Create `src/data/storage.ts`**

Thin wrapper to match the usage pattern across the app. This replaces all `Capacitor Storage` calls.

```typescript
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
    } catch {
      return fallback;
    }
  },
  setJSON(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/data/storage.ts
git commit -m "feat: add localStorage storage helper replacing Capacitor Storage"
```

---

## Task 4: Refactor `WhichState` from class to module

**Files:**
- Modify: `src/data/whichState.ts`

- [ ] **Step 1: Rewrite `src/data/whichState.ts`**

Convert from class to a module with a single exported async function. Keep the same caching optimization.

```typescript
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

interface Point {
  lat: number;
  lng: number;
}

interface Boundary {
  name: string;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}

let boundaries: Boundary[] = [];
let countryBoundaries: Boundary[] = [];
let loaded = false;
const previousHits: number[] = [];
const previousCountries: number[] = [];

async function ensureLoaded(): Promise<void> {
  if (loaded) return;
  const { US_STATES } = await import('./usStates');
  const { COUNTRIES } = await import('./worldSmall');
  boundaries = US_STATES.map((f: any) => ({ name: f.name, geometry: f.geometry }));
  countryBoundaries = COUNTRIES.map((f: any) => ({ name: f.name, geometry: f.geometry }));
  loaded = true;
}

export async function whichState(point: Point): Promise<string> {
  await ensureLoaded();

  const coords: [number, number] = [point.lng, point.lat];

  for (const idx of previousHits) {
    if (booleanPointInPolygon(coords, boundaries[idx].geometry)) {
      return boundaries[idx].name;
    }
  }
  for (let i = 0; i < boundaries.length; i++) {
    if (booleanPointInPolygon(coords, boundaries[i].geometry)) {
      previousHits.push(i);
      return boundaries[i].name;
    }
  }
  for (const idx of previousCountries) {
    if (booleanPointInPolygon(coords, countryBoundaries[idx].geometry)) {
      return countryBoundaries[idx].name;
    }
  }
  for (let i = 0; i < countryBoundaries.length; i++) {
    if (countryBoundaries[i].name !== 'United States' && booleanPointInPolygon(coords, countryBoundaries[i].geometry)) {
      previousCountries.push(i);
      return countryBoundaries[i].name;
    }
  }
  return 'Unknown';
}
```

- [ ] **Step 2: Commit**

```bash
git add src/data/whichState.ts
git commit -m "refactor: convert WhichState class to async module function"
```

---

## Task 5: Extract auth functions

**Files:**
- Create: `src/data/stravaAuth.ts`

- [ ] **Step 1: Create `src/data/stravaAuth.ts`**

Standalone auth functions extracted from `StravaStats` class. Read credentials from env vars.

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/data/stravaAuth.ts
git commit -m "feat: extract Strava auth functions with env var credentials"
```

---

## Task 6: Extract activity processing pipeline

**Files:**
- Create: `src/data/stravaProcessing.ts`

- [ ] **Step 1: Create `src/data/stravaProcessing.ts`**

Move processing logic from `StravaStats` class methods into standalone functions. Same algorithms, same data structures.

```typescript
import { whichState } from './whichState';

export interface StatEntry {
  name: string;
  value: number | string;
  count: number;
  id?: string;
  percent?: string;
  record?: boolean;
  star?: any;
}

interface Totals {
  [activityType: string]: {
    [statBy: string]: StatEntry[];
  };
}

const STATS_TO_TRACK: Record<string, string> = {
  distance: 'distance',
  time: 'moving_time',
  elevation: 'total_elevation_gain',
  speed: 'average_speed',
};

const THINGS_TO_TRACK_BY = ['ByState', 'ByYear'];

export async function processActivities(
  activities: any[],
  onProgress: (percent: number) => void,
): Promise<{ totals: Totals; finalTotals: Totals; types: string[] }> {
  const totals: Totals = { All: {} };

  for (let i = 0; i < activities.length; i++) {
    try {
      await addActivity(activities[i], totals);
    } catch (e) {
      console.log(e);
    }
    if (i % 200 === 199) {
      onProgress(Math.round((i / activities.length) * 100));
      // yield to UI thread
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  calcAverages(totals);
  sort(totals);
  const finalTotals = convertToDisplayValues(totals);
  const types = Object.keys(totals);

  return { totals, finalTotals, types };
}

async function addActivity(a: any, totals: Totals): Promise<void> {
  // Initialize type
  if (!totals[a.type]) {
    totals[a.type] = {};
  }

  let stateName = 'Unknown';
  if (a.start_latlng) {
    stateName = await whichState({ lat: a.start_latlng[0], lng: a.start_latlng[1] });
  }

  let stateNum = 0;
  for (let i = 0; i < stateName.length; i++) {
    stateNum += stateName.charCodeAt(i);
  }

  const date = new Date(a.start_date_local);
  const year = date.getFullYear();

  for (const by of THINGS_TO_TRACK_BY) {
    let info: { name: string; iter: number };
    if (by === 'ByState') info = { name: stateName, iter: stateNum };
    else info = { name: year.toString(), iter: year };

    for (const stat in STATS_TO_TRACK) {
      const stravaName = STATS_TO_TRACK[stat];
      const t = totals[a.type];
      const all = totals.All;
      const statBy = stat + by;

      if (!t[statBy]) t[statBy] = [];
      if (!all[statBy]) all[statBy] = [];

      for (const stats of [t[statBy], all[statBy]]) {
        if (!stats[info.iter]) {
          (stats as any)[info.iter] = { name: info.name, value: 0, count: 0 };
        }
        (stats[info.iter] as any).value += a[stravaName];
        (stats[info.iter] as any).count++;
      }
    }
  }
}

function calcAverages(totals: Totals): void {
  for (const type in totals) {
    for (const statBy in totals[type]) {
      const stat = matchPart(statBy, 'stat');
      if (stat === 'speed') {
        for (const item of totals[type][statBy]) {
          if (item) {
            (item as any).value = (item.value as number) / item.count;
          }
        }
      }
    }
  }
}

function sort(totals: Totals): void {
  for (const type in totals) {
    for (const statBy in totals[type]) {
      const by = matchPart(statBy, 'by');
      if (by === 'ByState') {
        totals[type][statBy].sort((b: any, a: any) => a.value - b.value);
      } else if (by === 'ByYear') {
        totals[type][statBy].sort((a: any, b: any) => a.name - b.name);
      }
      totals[type][statBy] = totals[type][statBy].filter((el: any) => el != null);
    }
  }
}

function convertToDisplayValues(totals: Totals): Totals {
  const finalTotals: Totals = {};
  for (const type in totals) {
    finalTotals[type] = {};
    for (const statBy in totals[type]) {
      const stat = matchPart(statBy, 'stat');
      let record = 0;
      let recordIndex = -1;
      const total = totals[type][statBy].reduce((prev: number, next: any) => prev + (next.value as number), 0);
      (finalTotals[type] as any)[statBy] = formatByStat(total, stat, type);
      for (let i = 0; i < totals[type][statBy].length; i++) {
        const item = totals[type][statBy][i] as any;
        item.id = i.toString();
        item.percent = ((item.value / total) * 100).toFixed(0) + '%';
        if (item.value > record) {
          if (recordIndex >= 0) (totals[type][statBy][recordIndex] as any).record = false;
          record = item.value;
          recordIndex = i;
          item.record = true;
        } else {
          item.record = false;
        }
        item.value = formatByStat(item.value, stat, type);
      }
    }
  }
  return finalTotals;
}

function matchPart(str: string, match: 'by' | 'stat'): string {
  let regex = match === 'by' ? /([A-Z])\w+/g : /^(.+?)(?=[A-Z])/g;
  const result = str.match(regex);
  return result ? result[0] : '';
}

function formatByStat(value: number, stat: string, type: string): string {
  if (stat === 'distance') return formatNumber(Math.round(value / 1000 * 0.621372)) + ' mi';
  if (stat === 'time') return Math.round(value / 60 / 60) + ' hrs';
  if (stat === 'elevation') return formatNumber(Math.round(value * 3.2)) + ' ft';
  if (stat === 'speed') {
    if (type === 'Ride') return formatNumber((2.23694 * value).toFixed(2)) + ' mph';
    return timeConvert((26.8224 / value).toFixed(2));
  }
  return String(value);
}

function timeConvert(minutes: any): string {
  const sign = minutes < 0 ? '-' : '';
  const min = Math.floor(Math.abs(minutes));
  const sec = Math.floor((Math.abs(minutes) * 60) % 60);
  return sign + (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec;
}

function formatNumber(num: any): string {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

export function capitalize(s: string): string {
  if (typeof s !== 'string') return '';
  s = s.replace(/([A-Z])/g, ' $1').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/data/stravaProcessing.ts
git commit -m "feat: extract activity processing pipeline into standalone module"
```

---

## Task 7: Create `useStravaData` hook

**Files:**
- Create: `src/hooks/useStravaData.ts`
- Delete: `src/data/stravaStats.tsx`

- [ ] **Step 1: Create `src/hooks/useStravaData.ts`**

The main hook replacing the `StravaStats` class. Manages auth, fetching, processing, and exposes state.

```typescript
import { useState, useEffect, useCallback } from 'react';
import {
  LoginData,
  getSavedState,
  saveState,
  clearStoredData,
  exchangeAuthCode,
  refreshAccessToken,
} from '../data/stravaAuth';
import { processActivities } from '../data/stravaProcessing';

type Status = 'idle' | 'authenticating' | 'downloading' | 'processing' | 'ready' | 'error' | 'offline';

interface StravaData {
  totals: any;
  finalTotals: any;
  types: string[];
  status: Status;
  loadingMessage: string;
  error: string | null;
  logout: () => void;
}

export function useStravaData(): StravaData {
  const [status, setStatus] = useState<Status>('idle');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [totals, setTotals] = useState<any>(null);
  const [finalTotals, setFinalTotals] = useState<any>(null);
  const [types, setTypes] = useState<string[]>([]);
  const [loginData, setLoginData] = useState<LoginData | null>(null);
  const [activities, setActivities] = useState<any[] | null>(null);

  const logout = useCallback(() => {
    clearStoredData();
    // Clear per-tab display settings
    if (totals) {
      for (const tab in totals) {
        localStorage.removeItem('stravaTabSaveDisplay' + tab);
      }
    }
    localStorage.removeItem('stravaAppUserPrefs');
    window.location.reload();
  }, [totals]);

  // Step 1: Initialize — check saved state or exchange auth code
  useEffect(() => {
    const init = async () => {
      const saved = getSavedState();
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        setStatus('authenticating');
        const data = await exchangeAuthCode(code);
        if (data) {
          window.history.pushState('', '', '/');
          setLoginData(data);
          setActivities(saved.activities || null);
          saveState(data, saved.activities || []);
        } else {
          window.history.pushState('', '', '/');
          clearStoredData();
          setStatus('idle'); // will show login
        }
      } else if (saved.loginData) {
        setLoginData(saved.loginData);
        setActivities(saved.activities || null);
      } else {
        setStatus('idle'); // will show login
      }
    };
    init();
  }, []);

  // Step 2: Once we have login data, fetch activities
  useEffect(() => {
    if (!loginData) return;

    let cancelled = false;
    // Use a local variable to track accumulated activities across paginated fetches.
    // React state (setActivities) is async and would create stale closures in recursive calls.
    let localActivities = activities ? [...activities] : [];

    const fetchActivities = async (attempt: number = 0) => {
      setStatus('downloading');

      const refreshed = await refreshAccessToken(loginData);
      if (!refreshed) {
        setStatus('idle');
        return;
      }
      if (refreshed !== loginData) {
        setLoginData(refreshed);
      }

      const after = localActivities.length > 1
        ? new Date(localActivities[0].start_date).getTime() / 1000
        : undefined;

      const params = new URLSearchParams({
        access_token: refreshed.access_token,
        page: '1',
        per_page: '200',
        ...(after ? { after: String(after) } : {}),
      });

      try {
        const res = await fetch(`https://www.strava.com/api/v3/athlete/activities?${params}`);

        if (cancelled) return;

        if (res.status === 200) {
          const data = await res.json();
          if (data.length === 0) {
            // Done downloading — process
            setStatus('processing');
            setLoadingMessage('Processing Activities: 0%');
            const result = await processActivities(localActivities, (pct) => {
              setLoadingMessage(`Processing Activities: ${pct}%`);
            });
            setActivities(localActivities);
            setTotals(result.totals);
            setFinalTotals(result.finalTotals);
            setTypes(result.types);
            setStatus('ready');
            return;
          }

          localActivities = [...localActivities, ...data];
          localActivities.sort((b: any, a: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
          setActivities([...localActivities]);
          setLoadingMessage(`Loading Activities: ${localActivities.length} loaded`);
          saveState(refreshed, localActivities);
          // Continue paginating — recursive call uses localActivities (not React state)
          await fetchActivities(0);
        } else if (res.status === 401) {
          clearStoredData();
          setLoginData(null);
          setStatus('idle');
        } else {
          // Server error — retry
          if (attempt > 3) {
            setStatus('error');
            setError('Server Error. Check your connection and reload. If the problem persists, the server may be down.');
          } else {
            setLoadingMessage(`Failed to contact server. Retry Attempt #${attempt + 1}`);
            await new Promise(r => setTimeout(r, 2000));
            if (!cancelled) await fetchActivities(attempt + 1);
          }
        }
      } catch (e) {
        // Network error — offline
        if (attempt > 3) {
          setStatus('error');
          setError('Server Error. Check your connection and reload.');
        } else {
          setStatus('offline');
          setLoadingMessage(`No connection. Retry Attempt #${attempt + 1}`);
          await new Promise(r => setTimeout(r, 2000));
          if (!cancelled) await fetchActivities(attempt + 1);
        }
      }
    };

    fetchActivities();

    return () => { cancelled = true; };
  // loginData is the trigger — activities is read but shouldn't re-trigger
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginData]);

  const isLoggedIn = loginData !== null;

  return {
    totals,
    finalTotals,
    types,
    status: !isLoggedIn && status === 'idle' ? 'idle' : status,
    loadingMessage,
    error,
    logout,
  };
}
```

Note: `src/data/stravaStats.tsx` and `src/data/state.tsx` were already deleted in Task 1.

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useStravaData.ts
git add -u
git commit -m "feat: replace StravaStats class with useStravaData hook"
```

---

## Task 8: Create Theme Context

**Files:**
- Create: `src/hooks/useTheme.ts`

- [ ] **Step 1: Create `src/hooks/useTheme.ts`**

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import applyTheme, { defaultTheme } from '../theme/themeGenerator';
import { storage } from '../data/storage';

const PREFS_KEY = 'stravaAppUserPrefs';

interface ThemeContextValue {
  theme: any;
  setTheme: (theme: any) => void;
  colors: any;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(() => {
    return storage.getJSON(PREFS_KEY, defaultTheme);
  });
  const [colors, setColors] = useState(() => applyTheme(defaultTheme));

  useEffect(() => {
    storage.setJSON(PREFS_KEY, theme);
    const newColors = applyTheme(theme);
    setColors(newColors);
  }, [theme]);

  return React.createElement(ThemeContext.Provider, { value: { theme, setTheme, colors } }, children);
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useTheme.ts
git commit -m "feat: add ThemeContext replacing prop-drilled theme state"
```

---

## Task 9: Rewrite `App.tsx`

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Rewrite `src/App.tsx`**

```tsx
import React from 'react';
import { Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  IonPage,
  IonContent,
  IonCard,
  IonLabel,
  IonLoading,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import './App.scss';

import Login from './pages/login';
import MainTabs from './pages/mainTabs';
import Menu from './pages/Menu';

import { useStravaData } from './hooks/useStravaData';
import { ThemeProvider } from './hooks/useTheme';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const AppContent: React.FC = () => {
  const { totals, finalTotals, types, status, loadingMessage, error, logout } = useStravaData();

  const isLoading = status === 'downloading' || status === 'processing' || status === 'authenticating';

  return (
    <>
      <IonLoading isOpen={isLoading} message={loadingMessage || 'Loading Activities: Please Wait'} />
      <Menu logout={logout} />
      <IonRouterOutlet id="main">
        <Route path="/" render={() => {
          if (status === 'offline') {
            return (
              <IonPage>
                <IonContent>
                  <IonCard><IonLabel>No Connection Detected</IonLabel></IonCard>
                </IonContent>
              </IonPage>
            );
          }
          if (status === 'error') {
            return (
              <IonPage>
                <IonContent>
                  <IonCard><IonLabel>{error}</IonLabel></IonCard>
                </IonContent>
              </IonPage>
            );
          }
          if (status === 'idle') {
            return <Login />;
          }
          if (status === 'ready') {
            return <MainTabs totals={totals} finalTotals={finalTotals} types={types} />;
          }
          return <IonPage></IonPage>;
        }} />
      </IonRouterOutlet>
    </>
  );
};

const App: React.FC = () => (
  <IonApp id="stravaStatsApp">
    <ThemeProvider>
      <IonReactRouter>
        <AppContent />
      </IonReactRouter>
    </ThemeProvider>
  </IonApp>
);

export default App;
```

- [ ] **Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "refactor: rewrite App.tsx with hooks, context, and IonLoading"
```

---

## Task 10: Update `login.tsx`

**Files:**
- Modify: `src/pages/login.tsx`

- [ ] **Step 1: Rewrite `src/pages/login.tsx`**

```tsx
import React from 'react';
import { IonPage, IonImg, IonButton } from '@ionic/react';
import { getOAuthUrl } from '../data/stravaAuth';

const Login: React.FC = () => {
  const loginLink = getOAuthUrl();
  const imgSrc = '/assets/strava_transparent_button.png';

  return (
    <IonPage id="login">
      <IonButton color="stravaorange" size="large" href={loginLink}>
        <IonImg src={imgSrc} alt="Strava Login Button" />
      </IonButton>
    </IonPage>
  );
};

export default Login;
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/login.tsx
git commit -m "refactor: login page uses getOAuthUrl with env var credentials"
```

---

## Task 11: Update `mainTabs.tsx`

**Files:**
- Modify: `src/pages/mainTabs.tsx`

- [ ] **Step 1: Rewrite `src/pages/mainTabs.tsx`**

```tsx
import React from 'react';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { aperture, bicycle, walk } from 'ionicons/icons';
import { Route, Redirect } from 'react-router';
import StravaTab from './StravaTab';

interface MainTabsProps {
  totals: any;
  finalTotals: any;
  types: string[];
}

const ICONS: Record<string, string> = {
  All: aperture,
  Ride: bicycle,
  Run: walk,
};

const MainTabs: React.FC<MainTabsProps> = ({ totals, finalTotals, types }) => {
  return (
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          {Object.keys(totals).map(tab => {
            const name = tab.charAt(0).toUpperCase() + tab.slice(1);
            const ref = `/tabs/${name}`;
            return (
              <Route key={tab} path={ref} render={() => (
                <StravaTab tab={tab} totals={totals} finalTotals={finalTotals} />
              )} />
            );
          })}
          <Redirect exact from="/" to="/tabs/All" />
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          {Object.keys(totals).map(tab => {
            const name = tab.charAt(0).toUpperCase() + tab.slice(1);
            return (
              <IonTabButton key={tab} tab={tab} href={`/tabs/${name}`}>
                <IonIcon icon={ICONS[tab] || walk} />
                <IonLabel>{name}</IonLabel>
              </IonTabButton>
            );
          })}
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  );
};

export default MainTabs;
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/mainTabs.tsx
git commit -m "refactor: mainTabs receives data via props instead of StravaStats class"
```

---

## Task 12: Update `StravaTab.tsx`

**Files:**
- Modify: `src/pages/StravaTab.tsx`

- [ ] **Step 1: Rewrite `src/pages/StravaTab.tsx`**

Update to receive data via props, use localStorage instead of Capacitor Storage, and update `react-data-table-component` v7 column selectors from strings to functions.

```tsx
import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonMenuButton, IonTitle, IonIcon, IonCard,
  IonButtons, IonContent, IonSelect, IonSelectOption, IonGrid, IonRow, IonCol,
} from '@ionic/react';
import { star } from 'ionicons/icons';
import './StravaTab.scss';
import DataTable, { createTheme } from 'react-data-table-component';
import { useTheme } from '../hooks/useTheme';
import { capitalize } from '../data/stravaProcessing';
import { storage } from '../data/storage';

interface StravaTabProps {
  tab: string;
  totals: any;
  finalTotals: any;
}

const STATS_TO_TRACK = ['distance', 'time', 'elevation', 'speed'];
const THINGS_TO_TRACK_BY = ['ByState', 'ByYear'];

const StravaTab: React.FC<StravaTabProps> = ({ tab, totals, finalTotals }) => {
  const { colors } = useTheme();
  const stats = STATS_TO_TRACK.map(s => capitalize(s));
  const by = THINGS_TO_TRACK_BY.map(b => capitalize(b));

  const [displayStat, setDisplayStat] = useState(stats[0]);
  const [displayBy, setDisplayBy] = useState(by[1]);

  // Load saved display settings
  useEffect(() => {
    const saved = storage.getJSON<{ displayStat: string; displayBy: string } | null>(
      'stravaTabSaveDisplay' + tab, null
    );
    if (saved) {
      setDisplayStat(saved.displayStat);
      setDisplayBy(saved.displayBy);
    }
  }, [tab]);

  // Save display settings
  useEffect(() => {
    storage.setJSON('stravaTabSaveDisplay' + tab, { displayStat, displayBy });
  }, [displayStat, displayBy, tab]);

  const statBy = displayStat.toLowerCase() + displayBy.replace(/\s/g, '');
  const displayList = totals[tab][statBy].map((row: any) => ({
    ...row,
    star: row.record ? <IonIcon icon={star} /> : undefined,
  }));

  const total = finalTotals[tab][statBy];

  createTheme('transparent', {
    text: {
      primary: colors['--ion-text-color'],
      secondary: '#2aa198',
    },
    background: {
      default: 'transparent',
    },
    divider: {
      default: colors['--ion-text-color'],
    },
    highlightOnHover: {
      default: '#efefef',
      text: '#232323',
    },
  });

  const customStyles = {
    subHeader: {
      style: {
        minHeight: '1px',
        color: colors['--ion-text-color'],
      },
    },
  };

  const columns: any[] = [
    { name: 'Star', cell: (row: any) => row.star, width: '20px', compact: true },
    { name: 'Year', selector: (row: any) => row.name, width: 'auto', compact: true },
    { name: 'Data', selector: (row: any) => row.value, width: 'auto' },
  ];
  if (displayStat !== 'Speed') {
    columns.push({ name: 'Percent', selector: (row: any) => row.percent, width: 'auto' });
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar mode="ios">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{tab}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol class="listContainer">
              <IonCard class="list">
                <IonGrid>
                  <IonRow>
                    <IonCol>
                      <IonSelect value={displayStat} interface="popover" onIonChange={(e: any) => setDisplayStat(e.detail.value)}>
                        {stats.map((value, index) => (
                          <IonSelectOption key={index} value={value}>{value}</IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonCol>
                    <IonCol>
                      <IonSelect value={displayBy} interface="popover" onIonChange={(e: any) => setDisplayBy(e.detail.value)}>
                        {by.map((value, index) => (
                          <IonSelectOption key={index} value={value}>{value}</IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonCol>
                  </IonRow>
                  <IonRow>
                    <IonCol>
                      <DataTable
                        theme="transparent"
                        title={`Total: ${total}`}
                        subHeader={displayStat !== 'Speed'}
                        subHeaderComponent={`Total: ${total}`}
                        columns={columns}
                        data={displayList}
                        noTableHead={true}
                        dense={true}
                        highlightOnHover={true}
                        customStyles={customStyles}
                      />
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default StravaTab;
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/StravaTab.tsx
git commit -m "refactor: StravaTab uses context, localStorage, and v7 column selectors"
```

---

## Task 13: Update `Menu.tsx`

**Files:**
- Modify: `src/pages/Menu.tsx`

- [ ] **Step 1: Rewrite `src/pages/Menu.tsx`**

```tsx
import React from 'react';
import {
  IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList,
  IonSelect, IonSelectOption, IonItem, IonIcon, IonLabel,
} from '@ionic/react';
import { alert } from 'ionicons/icons';
import { useTheme } from '../hooks/useTheme';
import { themePack } from '../theme/themeGenerator';

interface MenuProps {
  logout: () => void;
}

const Menu: React.FC<MenuProps> = ({ logout }) => {
  const { theme, setTheme } = useTheme();

  const themeSelectionChanged = (e: any) => {
    setTheme(themePack.filter(prop => prop.name === e.detail.value)[0]);
  };

  return (
    <IonMenu type="overlay" contentId="main">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent class="outer-content">
        <IonList>
          <IonItem button onClick={logout}>
            <IonIcon slot="start" icon={alert} />
            <IonLabel>Log Out</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>Theme</IonLabel>
            <IonSelect value={theme.name} interface="popover" onIonChange={themeSelectionChanged}>
              {themePack.map((t, index) => (
                <IonSelectOption key={index} value={t.name}>{t.name}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Menu.tsx
git commit -m "refactor: Menu uses ThemeContext and receives logout as prop"
```

---

## Task 14: Verify no dead imports remain

- [ ] **Step 1: Verify no remaining imports of deleted modules**

Search for any imports of removed files:

```bash
grep -r "from.*capacitor" src/ || true
grep -r "from.*serviceWorker" src/ || true
grep -r "from.*state'" src/ || true
grep -r "from.*combineReducers" src/ || true
grep -r "from.*util/util" src/ || true
grep -r "is-online" src/ || true
```

Expected: No matches. If any remain, update those files.

- [ ] **Step 3: Commit**

```bash
git add -u
git commit -m "chore: remove dead utility code and unused imports"
```

---

## Task 15: Build verification and smoke test

- [ ] **Step 1: Run TypeScript compilation**

```bash
npx tsc --noEmit
```

Expected: No errors. Fix any type errors that arise.

- [ ] **Step 2: Run Vite build**

```bash
npm run build
```

Expected: Build succeeds, output in `build/` directory.

- [ ] **Step 3: Preview the build**

```bash
npm run preview
```

Open in browser. Verify:
- Login page shows with Strava button
- After OAuth, activities load with progress indicator
- Tabs display for each activity type
- Stat/grouping dropdowns work
- Theme selector in menu works
- Log out clears state and returns to login

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify build passes with all modernization changes"
```
