import { IonPage, IonHeader, IonToolbar, IonMenuButton, IonTitle,
  IonButtons, IonContent, IonSelect, IonSelectOption, IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel} from '@ionic/react';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import { StateProps } from '../data/state';
import './StravaTab.scss';

interface StravaTabProps extends RouteComponentProps, StateProps { };

const StravaTab: React.FC<StravaTabProps> = ({stravaStats, match}) => {
  let tab:any = match.path.match(/\w+/g);
  if (tab)
    tab = tab[1];

  let totals = stravaStats.getTotals();

  let stats = [];
  for (let line in totals.stats) {
    stats.push(capitalize(line))
  }

  let by = [];
  for (let line in totals.by) {
    by.push(capitalize(totals.by[line]));
  }

  function capitalize (s: string) {
    if (typeof s !== 'string') return '';
    s = s.replace(/([A-Z])/g, ' $1').trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  let distanceByYear = totals.totals[tab].distanceByYear


  return (
    <IonPage className="dark-theme">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>{tab}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid class="strava-list-item">
          <IonRow>
            <IonCol>
              <IonSelect>
                {stats.map((value, index) => {
                  let selected = index === 0 ? true : false;
                  return <IonSelectOption selected={selected} key={index} value={value}>{value}</IonSelectOption>;
                })}
              </IonSelect>
            </IonCol>
            <IonCol>
              <IonSelect>
                {by.map((value, index) => {
                  let selected = index === 0 ? true : false;
                  return <IonSelectOption selected={selected} key={index} value={value}>{value}</IonSelectOption>;
                })}
              </IonSelect>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonList>
                {distanceByYear.map((value: any, index: number) => {
                  return <IonItem button key={index}><IonLabel class="ion-text-center">{value.name}: {value.value}</IonLabel></IonItem>
                })}
              </IonList>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default StravaTab;
