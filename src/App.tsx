import React, { useState, useEffect } from 'react';
import { Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonPage } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import Login from './pages/login';
import MainTabs from './pages/mainTabs';

import { StateProps } from './data/state'

import { getUrlParameter } from './util/util';
import StravaStats from './data/stravaStats';


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
  let [loggedIn, setLoggedIn] = useState("loading");
  let [finishedLoadingActivities, setFinishedLoadingActivities] = useState(false);
  let [loadingNumber, setLoadingNumber] = useState(-1);
  let loadingElement = useState(document.createElement('ion-loading'))[0];
  loadingElement.id = "loadingElement";

  // eslint-disable-next-line
  let [stravaStats, setStravaStats] = useState(new StravaStats(setLoggedIn, setFinishedLoadingActivities, setLoadingNumber, getUrlParameter("code")));

  let state:StateProps = {
//    stravaStats: { get: ()=>stravaStats }
  };


  useEffect(() => {
//    updateStateFromStorage(state);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    console.log("logged in=" + loggedIn);
    if (loggedIn === "true") {
      document.body.appendChild(loadingElement);
      setLoadingNumber(0);
      stravaStats.getActivities();
    }
  }, [loggedIn, stravaStats, loadingElement]);

  useEffect(() => {
    if (loadingNumber >= 0 && !finishedLoadingActivities) {
      let message = `Loading Activities: ${loadingNumber} loaded`
      loadingElement.message = message;
      loadingElement.present();
    }
    else if (loadingNumber >=0 && finishedLoadingActivities) {
      let message = `Processing Activities: ${loadingNumber}%`
      loadingElement.message = message;
      loadingElement.present();
    }
  }, [loadingNumber, loadingElement, finishedLoadingActivities]);

  useEffect(() => {
    console.log("finishedLoading: " + finishedLoadingActivities);
    if (finishedLoadingActivities) {
      stravaStats.processActivities();
    }
  }, [finishedLoadingActivities, stravaStats]);

/**
  useEffect(() => {
    console.log("saving state");
    saveStateToStorage(state);
  }, [state]);
**/

/**
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
**/

/**
  useEffect(() => {
    if (finishedLoadingActivities) {
      let remove = document.getElementById("loadingElement");
      if (remove)
        document.body.removeChild(remove);
      console.log("Finished loading activities");
    }
  }, [finishedLoadingActivities])
**/
  return (
  <IonApp>
    <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/" render={props => {
            if (loggedIn === "false")
              return <Login {...props} {...state} />;
            else if (loggedIn === "true") {
              if (finishedLoadingActivities)
                return <MainTabs {...props} {...state} />;
            }
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
