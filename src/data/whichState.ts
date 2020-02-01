import * as turf from '@turf/boolean-point-in-polygon';
import { US_STATES } from './usStates';
import { COUNTRIES } from './worldSmall';

export default class WhichState {
  previousHits: any;
  previousCountries: any;
  boundries: any;
  countryBoundries: any;

  constructor() {
    this.previousHits = [];
    this.previousCountries = [];
    this.boundries = [];
    this.countryBoundries = [];
    for (let i in US_STATES) {
      let feature = US_STATES[i];
      this.boundries.push({name: feature.name, geometry: feature.geometry});
    }
    for (let i in COUNTRIES) {
      let feature = COUNTRIES[i];
      this.countryBoundries.push({name: feature.name, geometry: feature.geometry})
    }
  }

  is (point: any) {
    if (!turf)
      throw new Error("Turf is Required, please install it first.");
    if (!point || !point.lat || !point.lng)
      throw new Error("Malformed, or missing point. Expected format {lat:<lat>, lng:<lng>}");

    point = [point.lng, point.lat];
    for (let i = 0; i < this.previousHits.length; i++) {
      let s = this.previousHits[i];
      let state = this.boundries[s];
      if (turf.default(point, state.geometry)) {
        return state.name;
      }
    }
    for (let s in this.boundries) {
      let state = this.boundries[s];
      if (turf.default(point, state.geometry)) {
        this.previousHits.push(s);
        return state.name;
      }
    }
    for (let i = 0; i < this.previousCountries.length; i++) {
      let s = this.previousCountries[i];
      let state = this.countryBoundries[s];
      if (turf.default(point, state.geometry)) {
        return state.name;
      }
    }
    for (let s in this.countryBoundries) {
      let state = this.countryBoundries[s];
      if (state.name !==   "United States" && turf.default(point, state.geometry)) {
        this.previousCountries.push(s);
        return state.name;
      }
    }
    //    return "Unknown " + point[1] + "," + point[0];
    return "Unknown";
  }
}
