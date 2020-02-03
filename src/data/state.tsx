import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;


export const updateStateFromStorage = async (state: StateProps) => {
  const savedStateString = await Storage.get({ key: 'stravaStatsState' })
  let safeString = savedStateString.value === null ? '{"accessInfo":"","activities":[]}' : savedStateString.value;
  let savedStateObj:StringIter = JSON.parse(safeString);
  for (let key in savedStateObj) {
    if (key !== "stravaStats")
      state[key].set(savedStateObj[key]);
  }
}
export const saveStateToStorage = (state: StateProps) => {
  let stateValues:StringIter = {};
  for (let key in state) {
    stateValues[key] = state[key].get();
  };
  Storage.set({key: "stravaStatsState", value: JSON.stringify(stateValues)});
}

export interface StateProps {
  [index: string]: any,
  darkMode: { get: () => boolean, set: (accessInfo: boolean) => void },
//  activities: { get: () => any[], set: (activities: any[]) => void },
}
interface StringIter {
  [index: string]: any,
}


/**
getSavedState().then((savedStateString) => {
  let safeString = savedStateString.value === null ? "" : savedStateString.value;
  let savedStateObj:StringIter = JSON.parse(safeString);
  for (let key in savedStateObj) {
    state[key].set(savedStateObj[key]);
  }
});
**/
