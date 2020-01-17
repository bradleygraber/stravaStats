import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;


export const getSavedState = async () => {
  const response = await Storage.get({ key: 'stravaStatsState' })
  return response;
}

export interface StateProps {
  [index: string]: any,
  loggedIn: { get: () => boolean, set: (loggedIn: boolean) => void },
  accessInfo: { get: () => string, set: (accessInfo: string) => void }
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
