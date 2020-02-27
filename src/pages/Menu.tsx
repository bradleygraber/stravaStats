import React from 'react';
import { IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonSelect, IonSelectOption,
          IonItem, IonIcon, IonLabel } from '@ionic/react';
import { alert } from 'ionicons/icons';
import { StateProps } from '../data/state'
import { themePack } from '../theme/themeGenerator';
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

export const Menu: React.FC<StateProps> = ({theme, stravaStats}) => {

  let click = async (e:any) => {
    await stravaStats.clearStoredData();
    for (let tab in stravaStats.getTotals().totals) {
      await Storage.remove({key: "stravaTabSaveDisplay" + tab});
    }
    await Storage.remove({key: "stravaAppUserPrefs"});
    window.location.reload(true);
  }

  let themeSelectionChanged = (e: any) => {
    theme.set(themePack.filter(prop => prop.name === e.detail.value)[0]);
  };

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
            <IonLabel>Theme</IonLabel>
            <IonSelect value={theme.get().name} interface="popover" onIonChange={themeSelectionChanged} >
              {themePack.map((t, index) => {
                return <IonSelectOption key={index} value={t.name}>{t.name}</IonSelectOption>;
              })}
            </IonSelect>
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};
export default Menu;
