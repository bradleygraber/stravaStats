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
