import { IonPage, IonHeader, IonToolbar, IonMenuButton, IonTitle, IonIcon,
  IonButtons, IonContent, IonSelect, IonSelectOption, IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel} from '@ionic/react';
import { star } from 'ionicons/icons';

import React, { useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router';
import { StateProps } from '../data/state';
import './StravaTab.scss';

import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

interface StravaTabProps extends RouteComponentProps, StateProps { };

const StravaTab: React.FC<StravaTabProps> = ({stravaStats, match}) => {
  let tab:any = match.path.match(/\w+/g);
  if (tab)
    tab = tab[1];

  let [displayStat, setDisplayStat] = useState("Distance");
  let [displayBy, setDisplayBy] = useState("By State");

  let totals = stravaStats.getTotals();
  let stats: string[] = [];
  let by: string[] = [];
  for (let line in totals.stats) { stats.push(capitalize(line)); }
  for (let line in totals.by) { by.push(capitalize(totals.by[line])); }

  function capitalize (s: string) {
    if (typeof s !== 'string') return '';
    s = s.replace(/([A-Z])/g, ' $1').trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  let displayList = totals.totals[tab][displayStat.toLowerCase() + displayBy.replace(/\s/g, '')];

  let statsSelectionChanged = (e: any) => {
    setDisplayStat(e.detail.value);
  }
  let bySelectionChanged = (e: any) => {
    setDisplayBy(e.detail.value);
  }

  let getDisplaySettings = async ()=>{
    let displaySettingsString = await Storage.get({ key: 'stravaTabSaveDisplay'+tab });
    let displaySettings = displaySettingsString.value ? JSON.parse(displaySettingsString.value) : {displayStat: stats[0], displayBy: by[0]};
    setDisplayStat(displaySettings.displayStat);
    setDisplayBy(displaySettings.displayBy);
  }
  let setDisplaySettings = async (displayStat: string, displayBy: string)=> {
    Storage.set({key: "stravaTabSaveDisplay"+tab, value: JSON.stringify( { displayStat: displayStat, displayBy: displayBy} )});
  }
  useEffect(() => {
    getDisplaySettings();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setDisplaySettings(displayStat, displayBy);
    // eslint-disable-next-line
  }, [displayStat, displayBy]);


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
              <IonSelect selectedText={displayStat} interface="popover" onIonChange={statsSelectionChanged} >
                {stats.map((value, index) => {
                  console.log(displayStat);
                  let selected = value === displayStat ? true : false;
                  return <IonSelectOption selected={selected} key={index} value={value}>{value}</IonSelectOption>;
                })}
              </IonSelect>
            </IonCol>
            <IonCol>
              <IonSelect selectedText={displayBy} interface="popover" onIonChange={bySelectionChanged}>
                {by.map((value, index) => {
                  let selected = value === displayBy ? true : false;
                  return <IonSelectOption selected={selected} key={index} value={value}>{value}</IonSelectOption>;
                })}
              </IonSelect>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonList>
                {displayList.map((value: any, index: number) => {
                  return (<IonItem key={index}>
                            {value.record ? <IonIcon icon={star} /> : ""}
                            <IonLabel class="ion-text-center">{value.name}: {value.value}</IonLabel>
                          </IonItem>)
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
