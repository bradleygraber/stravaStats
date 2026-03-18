# Strava Stats Modernization Design

## Overview

Modernize the Strava Stats app — update all dependencies, refactor code patterns to idiomatic modern React, drop unused native/mobile layers — while preserving identical functionality and UI.

## Constraints

- App is live (Firebase Hosting), solo user
- Functionality and visual appearance must stay the same
- Clean rewrite is acceptable

## 1. Build Tooling & Dependencies

### Swap CRA for Vite

Create React App is deprecated. Migrate to Vite for fast HMR and modern build pipeline.

### Dependency Upgrades

| Package | Current | Target |
|---|---|---|
| React | 16 | 18 |
| Ionic React | 5 | 8 |
| react-router-dom | 5 | 6 |
| TypeScript | 3.7 | 5.x |
| node-sass | 4 (deprecated) | sass (dart-sass) |
| react-data-table-component | 6 | 7 |

### Drop

- `@capacitor/core`, `@capacitor/cli`, `capacitor.config.json` — no native usage
- `cordova-plugin-ionic` — no native usage
- `is-online` — connectivity is detected via fetch failures instead; the `useStravaData` hook sets `status: 'offline'` when fetches fail due to network errors, and the UI shows the same "No Connection Detected" card. Retry logic moves into the hook (retry on network error with backoff, same as current `setTimeout` retry pattern)
- `combineReducers.ts` — unused
- `@turf/turf` — only `@turf/boolean-point-in-polygon` is used; the full bundle (~500KB) is unnecessary
- `loading.tsx` — unused (not referenced in routing), its functionality is handled by `IonLoading`

### Keep

- Firebase Hosting (`firebase.json` unchanged)
- `@turf/boolean-point-in-polygon`
- `tinycolor2`
- `react-data-table-component`
- `styled-components`

## 2. State Management & Data Flow

### Replace `StravaStats` class with `useStravaData` hook

The current class receives React state setters in its constructor and manages async flow imperatively. The new hook returns loading state, error state, and processed totals as React state:

```typescript
const { totals, finalTotals, types, status, error } = useStravaData();
// status: 'idle' | 'authenticating' | 'downloading' | 'processing' | 'ready' | 'error' | 'offline'
```

### Replace `{get, set}` prop-drilling with React Context

Current `StateProps` wraps every piece of state as `{get: () => value, set: setter}` and drills through every component. Replace with:

- `ThemeContext` for theme state (colors, current theme, setter)
- `useStravaData` hook manages its own state internally

### Replace manual DOM loading with `IonLoading`

Current code creates a DOM element manually and appends/removes it. Replace with declarative Ionic component:

```tsx
<IonLoading isOpen={status === 'downloading'} message={loadingMessage} />
```

Auth state becomes part of the hook's `status` field rather than a separate `loggedIn` string.

## 3. Authentication & API

### Environment variables

Move Strava client ID and secret to `.env`. Both `stravaStats.tsx` (token exchange, refresh) and `login.tsx` (OAuth authorize URL) currently hardcode the client ID — both must read from the env var.

```
VITE_STRAVA_CLIENT_ID=41457
VITE_STRAVA_CLIENT_SECRET=<secret>
```

Add `.env` to `.gitignore`. Include `.env.example` with empty placeholders.

Note: The client secret is inherently exposed in a browser-only SPA. Env vars keep it out of source code and git history.

### Consolidate auth logic

`getAccessToken` and `refreshAccessToken` become standalone async functions or part of `useStravaData`. OAuth callback handling (`getUrlParameter("code")`) moves into the hook's initialization. Flow stays the same:

1. Check localStorage for saved login data
2. If URL has auth `code`, exchange for token
3. If token expired, refresh it
4. Otherwise, redirect to Strava OAuth

### Replace Capacitor Storage with `localStorage`

Same keys, same JSON serialization. Note: Capacitor Storage returns `{ value: string | null }` while `localStorage.getItem()` returns `string | null` directly — every call site that accesses `.value` must be adjusted. Affected files: `stravaStats.tsx`, `state.tsx`, `App.tsx`, `StravaTab.tsx`, `Menu.tsx`.

## 4. Geographic Classification & Data Processing

### `WhichState` stays mostly as-is

The lazy loading, previous-hits caching, and Turf.js point-in-polygon logic all work well. Changes:

- Convert from class to a module with standalone async functions
- Replace manual `new Promise(resolve => { resolve(value) })` with `async/return`
- Add proper TypeScript types instead of `any`

### Processing pipeline unchanged

`addActivity` -> `calcAverages` -> `sort` -> `convertToDisplayValues` pipeline moves from class methods to functions called within `useStravaData`. Data structures (`totals[type][statBy]`, `finalTotals`) don't change.

Stat tracking config stays the same:
- Stats: distance, time, elevation, speed
- Dimensions: ByState, ByYear
- Unit conversions: meters->miles, meters->feet, m/s->mph or min/mile pace

## 5. UI Components & Routing

### react-router v6 migration

- `<Route path="/" render={props => ...}/>` becomes `<Route path="/" element={...}/>`
- `<Redirect>` becomes `<Navigate>`
- `match.path` pattern matching uses `useParams()` instead

### Components (same structure)

- `App.tsx` — root, providers/context, routing between login/loading/main
- `login.tsx` — Strava OAuth redirect
- `mainTabs.tsx` — dynamic tab generation per activity type
- `StravaTab.tsx` — stat table with stat/grouping dropdowns
- `Menu.tsx` — side menu with theme picker

### Minor cleanup

- Display preference persistence per tab swaps from Capacitor Storage to localStorage
- `react-data-table-component` v7: column `selector` changed from string (`selector: 'star'`) to function (`selector: row => row.star`) — all column definitions in `StravaTab.tsx` must be updated
- `createTheme` for react-data-table-component updated for v7 API if changed
- SCSS compiled by `sass` (dart) instead of `node-sass`

### No visual changes

Ionic components, layout, theming, and data tables look and work identically.
