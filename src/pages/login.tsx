import { IonPage, IonImg, IonButton } from '@ionic/react';
import React from 'react';
import { StateProps } from '../data/state'

const Login: React.FC<StateProps> = ({loggedIn}) => {
  let loginLink = "https://www.strava.com/oauth/authorize?client_id=41457&redirect_uri=https://bradleygraber.com/strava/&response_type=code&approval_prompt=auto&scope=activity:read_all";
  let imgSrc = "/assets/strava_transparent_button.png"

  return (
    <IonPage id="login">
      <IonButton color="stravaorange" size="large" href={loginLink}><IonImg src={imgSrc} alt="Strava Login Button"/></IonButton>
      <IonButton onClick={(e) => {loggedIn.set(!loggedIn.get()); } } >={loggedIn.get()? "yes": "no"}</IonButton>
      match - {JSON.stringify(loggedIn)} - {JSON.stringify(document.URL)}
    </IonPage>
  );
};

export default Login;
