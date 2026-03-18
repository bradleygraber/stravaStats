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

export const STAT_NAMES = Object.keys(STATS_TO_TRACK);
export const THINGS_TO_TRACK_BY = ['ByState', 'ByYear'];

export async function processActivities(
  activities: any[],
  onProgress: (percent: number) => void,
): Promise<{ totals: Totals; finalTotals: Totals; types: string[] }> {
  const totals: Totals = { All: {} };

  for (let i = 0; i < activities.length; i++) {
    try {
      await addActivity(activities[i], totals);
    } catch (e) {
      console.error(`Failed to process activity ${i} (id: ${activities[i]?.id}):`, e);
    }
    if (i % 200 === 199) {
      onProgress(Math.round((i / activities.length) * 100));
      // yield to UI thread
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  onProgress(100);
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
