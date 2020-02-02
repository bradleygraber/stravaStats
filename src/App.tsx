import React, { useState, useEffect } from 'react';
import { Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonPage, IonSplitPane } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import './App.scss';

import Login from './pages/login';
import MainTabs from './pages/mainTabs';
import Menu from './pages/Menu';

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
//  console.log("rendering");
  let [loggedIn, setLoggedIn] = useState("loading");
  let [finishedProcessing, setFinishedProcessing] = useState(false);
  let [finishedDownloading, setFinishedDownloading] = useState(false);
  let [loadingNumber, setLoadingNumber] = useState(-1);
  let loadingElement = useState(document.createElement('ion-loading'))[0];
  loadingElement.id = "loadingElement";

  // eslint-disable-next-line
  let [stravaStats, setStravaStats] = useState(new StravaStats(setLoggedIn, setFinishedDownloading, setFinishedProcessing, setLoadingNumber, getUrlParameter("code")));

  let state:StateProps = {
    stravaStats: stravaStats
  };


  useEffect(() => {
//    updateStateFromStorage(state);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
//    console.log("logged in=" + loggedIn);
    if (loggedIn === "true") {
      document.body.appendChild(loadingElement);
      setLoadingNumber(0);
      stravaStats.getActivities();
    }
  }, [loggedIn, stravaStats, loadingElement]);

  useEffect(() => {
    if (loadingNumber >= 0 && !finishedDownloading) {
      let message = `Loading Activities: ${loadingNumber} loaded`
      loadingElement.message = message;
      loadingElement.present();
    }
    else if (loadingNumber >=0 && finishedDownloading) {
      let message = `Processing Activities: ${loadingNumber}%`
      loadingElement.message = message;
      loadingElement.present();
    }
  }, [loadingNumber, loadingElement, finishedDownloading]);

/**
  useEffect(() => {
    console.log("saving state");
    saveStateToStorage(state);
  }, [state]);
**/


  useEffect(() => {
    if (finishedProcessing) {
      let remove = document.getElementById("loadingElement");
      if (remove)
        document.body.removeChild(remove);
      console.log("Finished Processing");
    }
  }, [finishedProcessing])

  return (
  <IonApp id="stravaStatsApp">
    <IonReactRouter>
        <Menu />
        <IonRouterOutlet id="main">
          <Route path="/" render={props => {
            if (loggedIn === "false")
              return <Login {...props} {...state} />;
            else if (loggedIn === "true" && finishedProcessing) {
              return <MainTabs {...props} {...state} />;
            }
            else {
//              console.log("empty page");
              return <IonPage></IonPage>;
            }
          }}/>
        </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
  )

};

export default App;
