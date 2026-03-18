# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Strava Stats is an Ionic React app that connects to the Strava API, downloads a user's activity data, and displays aggregated statistics (distance, time, elevation, speed) broken down by US state/country and by year. It deploys to Firebase Hosting.

## Commands

- **Dev server:** `npm run dev` (Vite)
- **Build:** `npm run build` (tsc + Vite, outputs to `build/`)
- **Preview:** `npm run preview` (serves production build locally)
- **Deploy:** `firebase deploy` (serves from `build/` directory)

## Architecture

### Tech Stack
React 18, Ionic 8, Vite, TypeScript 5, react-router v5 (pinned by @ionic/react-router), sass (dart), react-data-table-component v7, styled-components.

### Auth & Data Flow
The app uses OAuth with the Strava API. Credentials are stored in `.env` as `VITE_STRAVA_CLIENT_ID` and `VITE_STRAVA_CLIENT_SECRET` (see `.env.example`). The `useStravaData` hook (`src/hooks/useStravaData.ts`) is the core data engine — it handles authentication, paginated activity fetching, geographic classification, and stat aggregation. Auth functions live in `src/data/stravaAuth.ts`, activity processing in `src/data/stravaProcessing.ts`.

### State Management
The `useStravaData` hook manages auth, fetching, and processing state internally. Theme state uses React Context via `ThemeProvider`/`useTheme` (`src/hooks/useTheme.ts`). Persistence uses `localStorage` via a thin helper (`src/data/storage.ts`), with keys `stravaStatsState` for activities/login and `stravaAppUserPrefs` for theme.

### Geographic Classification
`whichState()` (`src/data/whichState.ts`) determines which US state or country an activity occurred in using `@turf/boolean-point-in-polygon` against boundary data from `usStates.js` and `worldSmall.js` (lazily imported). It caches recent matches in `previousHits`/`previousCountries` for performance.

### Theming
`src/theme/themeGenerator.tsx` dynamically generates Ionic CSS custom properties from a simple color config (`text`, `background`, `primary`). Predefined themes are exported as `themePack`. Colors are applied directly to `document.documentElement.style`.

### Tab/Page Structure
- `login.tsx` — Strava OAuth login page
- `mainTabs.tsx` — Dynamically generates tabs per activity type (All, Ride, Run, etc.)
- `StravaTab.tsx` — Displays stats table using `react-data-table-component`, with dropdowns for stat type and grouping dimension
- `Menu.tsx` — Side menu with theme picker and logout

### Key Data Structures
Stats are organized as `totals[activityType][statName + "By" + dimension]` — e.g., `totals["Ride"]["distanceByState"]`. Each entry is an array of `{name, value, count}` objects. `finalTotals` holds formatted display strings. Stat names and dimensions are exported from `stravaProcessing.ts` as `STAT_NAMES` and `THINGS_TO_TRACK_BY`.
