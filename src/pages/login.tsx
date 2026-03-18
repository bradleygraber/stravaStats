import React from 'react';
import { IonPage, IonContent, IonImg, IonButton } from '@ionic/react';
import { getOAuthUrl } from '../data/stravaAuth';

const Login: React.FC = () => {
  const loginLink = getOAuthUrl();
  const imgSrc = '/assets/strava_transparent_button.png';

  return (
    <IonPage id="login">
      <IonContent>
        <div className="login-content">
          <div className="login-brand">
            <h1>Strava Stats</h1>
            <p>Your miles, mapped</p>
          </div>
          <IonButton color="stravaorange" size="large" href={loginLink}>
            <IonImg src={imgSrc} alt="Connect with Strava" />
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
