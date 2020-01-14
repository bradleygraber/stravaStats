import { IonPage, IonImg, IonButton } from '@ionic/react';
import React from 'react';
import { RouteComponentProps } from 'react-router';

const Login: React.FC<RouteComponentProps> = ({match}) => {
  let loginLink = "https://www.strava.com/oauth/authorize?client_id=41457&redirect_uri=https://bradleygraber.com/strava/&response_type=code&approval_prompt=auto&scope=activity:read_all";
  let imgSrc = "/assets/strava_transparent_button.png"
  return (
    <IonPage id="login">
      <IonButton color="stravaorange" size="large" href={loginLink}><IonImg src={imgSrc} alt="Strava Login Button"/></IonButton>
      match - {JSON.stringify(document.URL)}
    </IonPage>
  );
};

export default Login;
