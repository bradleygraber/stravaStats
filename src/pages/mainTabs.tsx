import { IonTabs, IonTabBar, IonIcon, IonLabel, IonTabButton, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import React, { useEffect } from 'react';
import { aperture, bicycle, walk } from 'ionicons/icons';
import { Route, Redirect } from 'react-router';
import StravaTab from './StravaTab';
import { StateProps } from '../data/state';

const MainTabs: React.FC<StateProps> = ({darkMode, stravaStats}) => {

interface StringIter {
  [index: string]: any,
}


  useEffect(() => {
    console.log(stravaStats.getTotals());
//    processActivities(activities.get(), processActivitiesState);
    // eslint-disable-next-line
  }, []);

  let icons: StringIter = {
    All: aperture,
    Ride: bicycle,
    Run: walk,
  }

  let tabs = [];
  let ros = [];
  for (let tab in stravaStats.getTotals().totals) {
    let name = tab.charAt(0).toUpperCase() + tab.slice(1);
    let ref = `/tabs/${name}`;
    ros.push(<Route key={tab} path={ref} render={props => {
      return <StravaTab {...props} {...{stravaStats, darkMode} }/>
    }} />)
    tabs.push(
      <IonTabButton key={tab} tab={tab} href={ref}>
        <IonIcon
        icon={icons[tab] ? icons[tab] : walk}
        />
        <IonLabel>{name}</IonLabel>
      </IonTabButton>)
  }

  return (
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          {ros}
          <Redirect exact from="/" to="/tabs/All" />
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          {tabs}
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  );
};

export default MainTabs;
