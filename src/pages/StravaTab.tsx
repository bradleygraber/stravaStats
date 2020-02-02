import { IonPage } from '@ionic/react';
import React from 'react';
import { RouteComponentProps } from 'react-router';

interface UserDetailPageProps extends RouteComponentProps<{
  home: string;

}> {}

const StravaTab: React.FC<UserDetailPageProps> = ({match}) => {
  return (
    <IonPage>
    Ride - {JSON.stringify(match)}
    </IonPage>
  );
};

export default StravaTab;
