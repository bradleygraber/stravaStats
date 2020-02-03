import React, { useState, useEffect } from 'react';
import { Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonPage } from '@ionic/react';
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

import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;


const App: React.FC = () => {
//  console.log("rendering");
  let [darkMode, setDarkMode] = useState(false);
  let [loggedIn, setLoggedIn] = useState("loading");
  let [finishedProcessing, setFinishedProcessing] = useState(false);
  let [finishedDownloading, setFinishedDownloading] = useState(false);
  let [loadingNumber, setLoadingNumber] = useState(-1);
  let loadingElement = useState(document.createElement('ion-loading'))[0];
  loadingElement.id = "loadingElement";

  // eslint-disable-next-line
  let [stravaStats, setStravaStats] = useState(new StravaStats(setLoggedIn, setFinishedDownloading, setFinishedProcessing, setLoadingNumber, getUrlParameter("code")));

  let getUserPrefs = async ()=>{
    let userPrefs = await Storage.get({ key: 'stravaAppUserPrefs' });
    let bool:boolean = userPrefs.value === "true" ? true : false;
    setDarkMode(bool);
  }
  let saveUserPrefs = async (darkMode: boolean)=> {
    Storage.set({key: "stravaAppUserPrefs", value: darkMode.toString()});
  }

  let state:StateProps = {
    darkMode: {get: ()=>darkMode, set: setDarkMode},
    stravaStats: stravaStats
  };

  useEffect(() => {
    getUserPrefs();
  }, []);

  useEffect(() => {
    saveUserPrefs(darkMode);
  }, [darkMode]);

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
  <IonApp id="stravaStatsApp" className={darkMode ? "dark-theme" : ""}>
    <IonReactRouter>
        <Menu {...state}/>
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
