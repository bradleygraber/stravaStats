import React, { useState } from 'react';
import { IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonAlert } from '@ionic/react';
import { alert } from 'ionicons/icons';
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

export const Menu: React.FC = () => {

  let [showAlert, setShowAlert] = useState(false);

  let click = (e:any) => {
    setShowAlert(true);
    console.log(e);
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
          <IonItem button color="danger" onClick={click}>
            <IonIcon slot="start" icon={alert} />
            <IonLabel>Clear Data</IonLabel>
          </IonItem>
        </IonList>
        <IonAlert
            isOpen={showAlert}
            onDidDismiss={() => setShowAlert(false)}
            header={'Clear Data'}
            message={'This will clear the data on your computer.  You will have to download your data again if you do this.'}
            buttons={[
              {
                text: 'Confirm Erase',
                handler: () => {
                  Storage.remove({key: "stravaStatsState" }).then(() => { window.location.reload(true); });
                }
              },
              {
                text: "Don't Erase",
                role: 'cancel',
                handler: blah => {
                  console.log('Confirm Cancel: blah');
                }
              },
            ]}
          />
      </IonContent>
    </IonMenu>
  );
};
export default Menu;
