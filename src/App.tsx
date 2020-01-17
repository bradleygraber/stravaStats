import React, { useState, useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import Login from './pages/login';
import MainTabs from './pages/mainTabs';

import { getUrlParameter } from './util/util';
import { getAccessToken } from './data/stravaStats';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

import { getSavedState, StateProps } from './data/state'

import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

interface StringIter {
  [index: string]: any,
}


const App: React.FC = () => {
  let [loggedIn, setLoggedIn] = useState(false)
  let [accessInfo, setAccessInfo] = useState("");

  let state:StateProps = {
    loggedIn: { get: ()=>loggedIn, set: setLoggedIn },
    accessInfo: { get: ()=>accessInfo, set: setAccessInfo }
  };


  useEffect(() => {
    console.log("saving state");
    let stateValues:StringIter = {};
    for (let key in state) {
      stateValues[key] = state[key].get();
    };
    Storage.set({key: "stravaStatsState", value: JSON.stringify(stateValues)});
  });

  let code = getUrlParameter("code");
  if (code !== undefined) {
    getAccessToken(code, state);
  }

  return (
  <IonApp>
    <IonReactRouter>
        <IonRouterOutlet>
          <Redirect path="/auth" to="/" />
          <Route path="/" render={props => {
              return false ? <MainTabs {...props} {...state} /> : <Login {...props} {...state} />;
          }}/>
        </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
  )

};

export default App;
