import React, { useState, useEffect } from 'react';
import { Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonPage } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import Login from './pages/login';
import MainTabs from './pages/mainTabs';

import { StateProps, updateStateFromStorage, saveStateToStorage } from './data/state'

import { getUrlParameter } from './util/util';
import { getAccessToken, getActivities } from './data/stravaStats';


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


const App: React.FC = () => {
  console.log("rendering");
  let [code, setCode] = useState("loading");
  let [accessInfo, setAccessInfo] = useState("loading");
  let arr: any[] = ["loading"];
  let [activities, setActivities] = useState(arr);
  let [finishedLoadingActivities, setFinishedLoadingActivities] = useState(false);

  let state:StateProps = {
    code: { get: ()=>code, set: setCode },
    accessInfo: { get: ()=>accessInfo.slice(), set: setAccessInfo },
    activities: { get: ()=>activities.slice(), set: setActivities }
  };


  useEffect(() => {
    console.log("loading State");
    let getCode = getUrlParameter("code");
    getCode = getCode === undefined? "" : getCode;
    setCode(getCode);
    updateStateFromStorage(state);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (code !== "" && code !== "loading" && accessInfo === "") {
      getAccessToken(code, setCode, setAccessInfo);
    }
  }, [code, accessInfo]);

  useEffect(() => {
    console.log("saving state");
    saveStateToStorage(state);
  }, [state]);

  useEffect(() => {
    let mod = activities.length%200;
    let after = activities.length > 1 ? new Date(activities[0].start_date).getTime()/1000 : undefined;
    if (mod === 0 && accessInfo !== "" && finishedLoadingActivities === false) {
      getActivities(state.activities, accessInfo, setFinishedLoadingActivities, after);
    }
    else if (activities.length > 1 && mod !== 0) {
      setFinishedLoadingActivities(true);
    }
  // eslint-disable-next-line
  }, [activities, accessInfo, finishedLoadingActivities]);

  useEffect(() => {
    if (finishedLoadingActivities) {
      console.log("Finished loading activities");
    }
  }, [finishedLoadingActivities])


  return (
  <IonApp>
    <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/" render={props => {
            if (accessInfo === "" && code === "")
              return <Login {...props} {...state} />;
            else if (accessInfo !== "" && accessInfo !== "loading")
              return <MainTabs {...props} {...state} />;
            else {
              console.log("empty page");
              return <IonPage></IonPage>;
            }
          }}/>
        </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
  )

};

export default App;
