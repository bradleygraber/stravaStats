import { IonPage, IonHeader, IonToolbar, IonMenuButton, IonTitle, IonIcon, IonCard,
  IonButtons, IonContent, IonSelect, IonSelectOption, IonGrid, IonRow, IonCol} from '@ionic/react';
import { star } from 'ionicons/icons';
import './StravaTab.scss';

import DataTable, {createTheme} from 'react-data-table-component';

import React, { useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router';
import { StateProps } from '../data/state';

import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

interface StravaTabProps extends RouteComponentProps, StateProps { };

const StravaTab: React.FC<StravaTabProps> = ({stravaStats, match, darkMode, colors}) => {
  let tab:any = match.path.match(/\w+/g);
  if (tab)
    tab = tab[1];

  let [displayStat, setDisplayStat] = useState("Distance");
  let [displayBy, setDisplayBy] = useState("By Year");

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
  displayList.forEach((row: any) => {
    if (row.record === true)
      row.star = <IonIcon  icon={star} />;
  });

  let statsSelectionChanged = (e: any) => {
    setDisplayStat(e.detail.value);
  }
  let bySelectionChanged = (e: any) => {
    setDisplayBy(e.detail.value);
  }

  let getDisplaySettings = async ()=>{
    let displaySettingsString = await Storage.get({ key: 'stravaTabSaveDisplay'+tab });
    let displaySettings = displaySettingsString.value ? JSON.parse(displaySettingsString.value) : {displayStat: stats[0], displayBy: by[1]};
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

  let columns:any = [
    {
      name: 'Star',
      selector: 'star',
      left: true,
      width: "20px",
      compact: true,
    },
    {
      name: 'Year',
      selector: 'name',
      left: true,
      width: "auto",
      compact: true,
    },
    {
      name: 'Data',
      selector: 'value',
      center: true,
      width: "auto",
    },
  ]
  if (displayStat !== "Speed") {
    columns.push({
      name: 'Percent',
      selector: 'percent',
      right: true,
      width: "auto",
    });
  }
  let total = stravaStats.finalTotals[tab][displayStat.toLowerCase() + displayBy.replace(/\s/g, '')];

  createTheme('transparent', {
    text: {
      primary: colors.get()["--ion-text-color"],
      secondary: '#2aa198',
    },
    background: {
      default: "transparent",
    },
    divider: {
      default: colors.get()["--ion-text-color"],
    },
    highlightOnHover: {
      default: '#efefef',
      text: '#232323',
    },
  });
  let customStyles = {
    subHeader: {
        style: {
          minHeight: '1px',
          color: colors.get()["--ion-text-color"]
        },
      },
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar mode="ios">
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>{tab}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol class="listContainer">
            <IonCard class="list">
            <IonGrid>
              <IonRow>
                <IonCol>
                  <IonSelect value={displayStat} interface="popover" onIonChange={statsSelectionChanged} >
                    {stats.map((value, index) => {
                      return <IonSelectOption key={index} value={value}>{value}</IonSelectOption>;
                    })}
                  </IonSelect>
                </IonCol>
                <IonCol>
                  <IonSelect value={displayBy} interface="popover" onIonChange={bySelectionChanged}>
                    {by.map((value, index) => {
                      return <IonSelectOption key={index} value={value}>{value}</IonSelectOption>;
                    })}
                  </IonSelect>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                    <DataTable
                      theme={"transparent"}
                      title={`Total: ${total}`}
                      subHeader={displayStat !== "Speed"}
                      subHeaderComponent={`Total: ${total}`}
                      subHeaderAlign={"center"}
                      columns={columns}
                      data={displayList}
                      noHeader={true}
                      noTableHead={true}
                      dense={true}
                      highlightOnHover={true}
                      customStyles={customStyles}
                    />
                </IonCol>
              </IonRow>
            </IonGrid>
            </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default StravaTab;
