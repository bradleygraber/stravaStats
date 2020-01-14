import { IonPage } from '@ionic/react';
import React from 'react';
import { RouteComponentProps } from 'react-router';

interface UserDetailPageProps extends RouteComponentProps<{
  home: string;
}> {}

const Ride: React.FC<UserDetailPageProps> = ({match}) => {
  return (
    <IonPage id="tabListing">
    Ride - {JSON.stringify(match)}
    </IonPage>
  );
};

export default Ride;
