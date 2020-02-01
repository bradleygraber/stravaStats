import { IonTabs, IonTabBar, IonIcon, IonLabel, IonTabButton, IonRouterOutlet } from '@ionic/react';
import React, { useState, useEffect } from 'react';
import { flash } from 'ionicons/icons';
import { Route } from 'react-router';
import Ride from './Ride';
import { StateProps } from '../data/state';

const MainTabs: React.FC<StateProps> = ({activities}) => {

  let loadingElement = useState(document.createElement('ion-loading'))[0];

  /**
  let [ getPercentComplete, setPercentComplete ] = useState(0);
  let [ getTypes, setTypes ] = useState([]);
  let [ getTotals, setTotals ] = useState({ "all": { } });

  let processActivitiesState = {
    percentComplete: { get: getPercentComplete, set: setPercentComplete },
    totals: { get: () => getTotals, set: setTotals },
    types: { get: () => getTypes, set: setTypes },
    statsToTrack: {
      "distance": "distance",
      "time": "moving_time",
      "elevation": "total_elevation_gain",
      "speed": "average_speed"
    },
    thingsToTrackBy: [
      "ByState",
      "ByYear"
    ],
  }
**/

  useEffect(() => {
    loadingElement.id = "loadingElement"
    document.body.appendChild(loadingElement);
//    processActivities(activities.get(), processActivitiesState);
    // eslint-disable-next-line
  }, []);

/**
  useEffect(() => {
    let message = `Processing Activities: ${getPercentComplete}%`
    loadingElement.message = message;
    loadingElement.present();
    if (getPercentComplete === 100) {
      let remove = document.getElementById("loadingElement");
      if (remove)
        document.body.removeChild(remove);
    }
  }, [getPercentComplete, loadingElement]);
**/

  return (
      <IonTabs>
        <IonRouterOutlet>
          <Route path="/" render={props => {
              return <Ride {...props} />;
          }}/>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="run" href="/tabs/run">
            <IonIcon icon={flash} />
            <IonLabel>Run</IonLabel>
          </IonTabButton>
          <IonTabButton tab="ride" href="/tabs/ride">
            <IonIcon icon={flash} />
            <IonLabel>Ride</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
  );
};

export default MainTabs;
