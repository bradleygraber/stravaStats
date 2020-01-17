import { IonTabs, IonTabBar, IonIcon, IonLabel, IonTabButton, IonRouterOutlet } from '@ionic/react';
import React from 'react';
import { flash } from 'ionicons/icons';
import { Route, Redirect } from 'react-router';
import Ride from './Ride';
import { StateProps } from '../data/state'

const MainTabs: React.FC<StateProps> = () => {
  return (
      <IonTabs>
        <IonRouterOutlet>
          <Redirect exact path="/tabs" to="/tabs/ride" />
          <Route path="/tabs/ride" render={(props) => <Ride { ...props } />} />
          <Route path="/tabs/run" render={(props) => <Ride { ...props } />} />
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
