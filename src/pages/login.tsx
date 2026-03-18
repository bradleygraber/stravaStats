import React from 'react';
import { IonPage, IonImg, IonButton } from '@ionic/react';
import { getOAuthUrl } from '../data/stravaAuth';

const Login: React.FC = () => {
  const loginLink = getOAuthUrl();
  const imgSrc = '/assets/strava_transparent_button.png';

  return (
    <IonPage id="login">
      <IonButton color="stravaorange" size="large" href={loginLink}>
        <IonImg src={imgSrc} alt="Strava Login Button" />
      </IonButton>
    </IonPage>
  );
};

export default Login;
