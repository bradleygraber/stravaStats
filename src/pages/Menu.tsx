import React from 'react';
import {
  IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList,
  IonSelect, IonSelectOption, IonItem, IonIcon, IonLabel,
} from '@ionic/react';
import { alert } from 'ionicons/icons';
import { useTheme } from '../hooks/useTheme';
import { themePack } from '../theme/themeGenerator';

interface MenuProps {
  logout: () => void;
}

const Menu: React.FC<MenuProps> = ({ logout }) => {
  const { theme, setTheme } = useTheme();

  const themeSelectionChanged = (e: any) => {
    setTheme(themePack.filter(prop => prop.name === e.detail.value)[0]);
  };

  return (
    <IonMenu type="overlay" contentId="main">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="outer-content">
        <IonList>
          <IonItem button onClick={logout}>
            <IonIcon slot="start" icon={alert} />
            <IonLabel>Log Out</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>Theme</IonLabel>
            <IonSelect value={theme.name} interface="popover" onIonChange={themeSelectionChanged}>
              {themePack.map((t, index) => (
                <IonSelectOption key={index} value={t.name}>{t.name}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
