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
    theme.set(themePack[e.detail.value]);
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
            <IonSelect selectedText={theme.get().name} interface="alert" onIonChange={themeSelectionChanged} >
              {themePack.map((t, index) => {
                let selected = t.name === theme.get().name ? true : false;
                return <IonSelectOption selected={selected} key={index} value={index}>{t.name}</IonSelectOption>;
              })}
            </IonSelect>
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};
export default Menu;
