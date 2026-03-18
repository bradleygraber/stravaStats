import React from 'react';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet } from '@ionic/react';
import { aperture, bicycle, walk } from 'ionicons/icons';
import { Route, Redirect } from 'react-router';
import StravaTab from './StravaTab';

interface MainTabsProps {
  totals: any;
  finalTotals: any;
}

const ICONS: Record<string, string> = {
  All: aperture,
  Ride: bicycle,
  Run: walk,
};

const MainTabs: React.FC<MainTabsProps> = ({ totals, finalTotals }) => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        {Object.keys(totals).map(tab => {
          const name = tab.charAt(0).toUpperCase() + tab.slice(1);
          const ref = `/tabs/${name}`;
          return (
            <Route key={tab} path={ref} render={() => (
              <StravaTab tab={tab} totals={totals} finalTotals={finalTotals} />
            )} />
          );
        })}
        <Redirect exact from="/" to="/tabs/All" />
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        {Object.keys(totals).map(tab => {
          const name = tab.charAt(0).toUpperCase() + tab.slice(1);
          return (
            <IonTabButton key={tab} tab={tab} href={`/tabs/${name}`}>
              <IonIcon icon={ICONS[tab] || walk} />
              <IonLabel>{name}</IonLabel>
            </IonTabButton>
          );
        })}
      </IonTabBar>
    </IonTabs>
  );
};

export default MainTabs;
