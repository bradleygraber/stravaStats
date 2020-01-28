import { IonPage, IonImg, IonButton } from '@ionic/react';
import React from 'react';
import { StateProps } from '../data/state'

const Login: React.FC<StateProps> = () => {
  console.log("entering login");
  let redirect_uri = "http://localhost:8100/auth/"
  let loginLink = "https://www.strava.com/oauth/authorize?client_id=41457&redirect_uri=" + redirect_uri + "&response_type=code&approval_prompt=auto&scope=activity:read_all";
  let imgSrc = "/assets/strava_transparent_button.png"

  return (
    <IonPage id="login">
      <IonButton color="stravaorange" size="large" href={loginLink}><IonImg src={imgSrc} alt="Strava Login Button"/></IonButton>
    </IonPage>
  );
};

export default Login;
