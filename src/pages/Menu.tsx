import React from 'react';
import { IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonToggle } from '@ionic/react';
import { alert } from 'ionicons/icons';
import { StateProps } from '../data/state'
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

export const Menu: React.FC<StateProps> = ({darkMode}) => {

  let click = (e:any) => {
    Storage.remove({key: "stravaStatsState" }).then(() => { window.location.reload(true); });
  }

  return (
    <IonMenu type="overlay" contentId="main">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent class="outer-content">
        <IonList>
          <IonItem button onClick={click}>
            <IonIcon slot="start" icon={alert} />
            <IonLabel>Log Out</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>Dark Theme</IonLabel>
            <IonToggle checked={darkMode.get()} onClick={() => darkMode.set(!darkMode.get())} />
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};
export default Menu;
