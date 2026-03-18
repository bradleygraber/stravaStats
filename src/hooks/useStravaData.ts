import { useState, useEffect, useCallback, useRef } from 'react';
import {
  LoginData,
  getSavedState,
  saveState,
  clearStoredData,
  exchangeAuthCode,
  refreshAccessToken,
} from '../data/stravaAuth';
import { processActivities } from '../data/stravaProcessing';
import { storage } from '../data/storage';

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
        storage.remove('stravaTabSaveDisplay' + tab);
      }
    }
    storage.remove('stravaAppUserPrefs');
    window.location.reload();
  }, [totals]);

  // Step 1: Initialize — check saved state or exchange auth code
  useEffect(() => {
    const init = async () => {
      try {
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
      } catch (e) {
        console.error('Failed to initialize:', e);
        setStatus('error');
        setError('Failed to initialize. Please reload the page.');
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
    // Track the current token locally to avoid re-triggering this effect on refresh
    let currentLoginData = loginData;

    const fetchActivities = async (page: number = 1, attempt: number = 0) => {
      setStatus('downloading');

      // Only refresh token on first page to avoid redundant API calls
      if (page === 1) {
        const refreshed = await refreshAccessToken(currentLoginData);
        if (!refreshed) {
          setStatus('idle');
          return;
        }
        currentLoginData = refreshed;
        if (refreshed !== loginData) {
          saveState(refreshed, localActivities);
        }
      }

      // For incremental sync: if we have saved activities, only fetch newer ones
      const after = (page === 1 && localActivities.length > 1)
        ? new Date(localActivities[0].start_date).getTime() / 1000
        : undefined;

      const params = new URLSearchParams({
        access_token: currentLoginData.access_token,
        page: String(page),
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
          saveState(currentLoginData, localActivities);
          // Continue paginating — increment page, recursive call uses localActivities (not React state)
          await fetchActivities(page + 1);
        } else if (res.status === 401) {
          clearStoredData();
          setLoginData(null);
          setStatus('idle');
        } else {
          // Server error — retry
          console.error(`Activity fetch failed: HTTP ${res.status}`);
          if (attempt > 3) {
            setStatus('error');
            setError('Server Error. Check your connection and reload. If the problem persists, the server may be down.');
          } else {
            setLoadingMessage(`Failed to contact server. Retry Attempt #${attempt + 1}`);
            await new Promise(r => setTimeout(r, 2000));
            if (!cancelled) await fetchActivities(page, attempt + 1);
          }
        }
      } catch (e) {
        // Network error — offline
        console.error('Network error fetching activities:', e);
        if (attempt > 3) {
          setStatus('error');
          setError('Server Error. Check your connection and reload.');
        } else {
          setStatus('offline');
          setLoadingMessage(`No connection. Retry Attempt #${attempt + 1}`);
          await new Promise(r => setTimeout(r, 2000));
          if (!cancelled) await fetchActivities(page, attempt + 1);
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
