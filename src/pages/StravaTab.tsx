import { IonPage, IonHeader, IonToolbar, IonMenuButton, IonTitle, IonButtons, IonContent} from '@ionic/react';
import React from 'react';
import { RouteComponentProps } from 'react-router';

interface UserDetailPageProps extends RouteComponentProps<{
  home: string;

}> {}

const StravaTab: React.FC<UserDetailPageProps> = ({match}) => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>Ride</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        Ride - {JSON.stringify(match)}
      </IonContent>
    </IonPage>
  );
};

export default StravaTab;
