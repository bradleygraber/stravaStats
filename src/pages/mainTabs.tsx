import { IonTabs, IonTabBar, IonIcon, IonLabel, IonTabButton, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import React, { useState, useEffect } from 'react';
import { flash } from 'ionicons/icons';
import { Route } from 'react-router';
import StravaTab from './StravaTab';
import { StateProps } from '../data/state';

const MainTabs: React.FC<StateProps> = ({stravaStats}) => {


  useEffect(() => {
    console.log(stravaStats.getTotals());
//    processActivities(activities.get(), processActivitiesState);
    // eslint-disable-next-line
  }, []);

  let tabs = [];
  let ros = [];
  for (let tab in stravaStats.getTotals()) {
    let name = tab.charAt(0).toUpperCase() + tab.slice(1);
    let ref = `/tabs/${name}`;
    ros.push(<Route key={tab} path={ref} render={props => {
      return <StravaTab {...props} />
    }} />)
    tabs.push(<IonTabButton key={tab} tab={tab} href={ref}><IonIcon icon={flash}/><IonLabel>{name}</IonLabel></IonTabButton>)
  }

  return (
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          {ros}
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          {tabs}
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  );
};

export default MainTabs;
