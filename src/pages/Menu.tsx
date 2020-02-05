import React from 'react';
import { IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonToggle } from '@ionic/react';
import { alert } from 'ionicons/icons';
import { StateProps } from '../data/state'
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

export const Menu: React.FC<StateProps> = ({darkMode, stravaStats}) => {

  let click = async (e:any) => {
    await stravaStats.clearStoredData();
    for (let tab in stravaStats.getTotals().totals) {
      await Storage.remove({key: "stravaTabSaveDisplay" + tab});
    }
    await Storage.remove({key: "stravaAppUserPrefs"});
    window.location.reload(true);
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
