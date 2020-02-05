import * as turf from '@turf/boolean-point-in-polygon';

export default class WhichState {
  previousHits: any;
  previousCountries: any;
  boundries: any;
  countryBoundries: any;
  loaded: boolean;

  constructor() {
    this.previousHits = [];
    this.previousCountries = [];
    this.boundries = [];
    this.countryBoundries = [];
    this.loaded = false;
    this.init();
  }
  async init() {
    let { US_STATES } = await import('./usStates');
    let { COUNTRIES } = await import('./worldSmall');
    for (let i in US_STATES) {
      let feature = US_STATES[i];
      this.boundries.push({name: feature.name, geometry: feature.geometry});
    }
    for (let i in COUNTRIES) {
      let feature = COUNTRIES[i];
      this.countryBoundries.push({name: feature.name, geometry: feature.geometry})
    }
    this.loaded = true;
  }

  async is (point: any) {
    if (!this.loaded) {
      console.log("not loaded, waiting 200ms");
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(this.is(point));
        }, 200);
      });
    }
    if (!turf)
      throw new Error("Turf is Required, please install it first.");
    if (!point || !point.lat || !point.lng)
      throw new Error("Malformed, or missing point. Expected format {lat:<lat>, lng:<lng>}");

    point = [point.lng, point.lat];
    for (let i = 0; i < this.previousHits.length; i++) {
      let s = this.previousHits[i];
      let state = this.boundries[s];
      if (turf.default(point, state.geometry)) {
        return new Promise(resolve => { resolve(state.name); });
      }
    }
    for (let s in this.boundries) {
      let state = this.boundries[s];
      if (turf.default(point, state.geometry)) {
        this.previousHits.push(s);
        return new Promise(resolve => { resolve(state.name); });
      }
    }
    for (let i = 0; i < this.previousCountries.length; i++) {
      let s = this.previousCountries[i];
      let state = this.countryBoundries[s];
      if (turf.default(point, state.geometry)) {
        return new Promise(resolve => { resolve(state.name); });
      }
    }
    for (let s in this.countryBoundries) {
      let state = this.countryBoundries[s];
      if (state.name !==   "United States" && turf.default(point, state.geometry)) {
        this.previousCountries.push(s);
        return new Promise(resolve => { resolve(state.name); });
      }
    }
    //    return "Unknown " + point[1] + "," + point[0];
    return new Promise(resolve => { resolve("Unknown"); });
  }
}
