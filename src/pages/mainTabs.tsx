import { IonTabs, IonTabBar, IonIcon, IonLabel, IonTabButton, IonRouterOutlet } from '@ionic/react';
import React from 'react';
import { flash } from 'ionicons/icons';
import { Route } from 'react-router';
import Ride from './Ride';
import Loading from './loading';
import { StateProps } from '../data/state';

const MainTabs: React.FC<StateProps> = (state) => {


  return (
      <IonTabs>
        <IonRouterOutlet>
          <Route path="/" render={props => {
              return true ? <Loading {...props} {...state}/> : <Ride {...props} />;
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
