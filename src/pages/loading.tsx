import { IonPage } from '@ionic/react';
import React, { useState, useEffect } from 'react';

import { RouteComponentProps } from 'react-router';
import { StateProps } from '../data/state';

interface test extends RouteComponentProps, StateProps {}

const Loading: React.FC<StateProps> = ({activities}) => {
  console.log("rendering loading");

  let loadingElement = useState(document.createElement('ion-loading'))[0];


  useEffect(() => {
    document.body.appendChild(loadingElement);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    let total:string = activities.get().length.toString()
    let message = `Loading Activities: ${total} loaded`
    loadingElement.message = message;
    loadingElement.present();
  }, [activities, loadingElement]);

  return (
    <IonPage>
    </IonPage>
  );
};

export default Loading;
