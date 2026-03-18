import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonMenuButton, IonTitle, IonIcon, IonCard,
  IonButtons, IonContent, IonSelect, IonSelectOption, IonGrid, IonRow, IonCol,
} from '@ionic/react';
import { star } from 'ionicons/icons';
import './StravaTab.scss';
import DataTable, { createTheme } from 'react-data-table-component';
import { useTheme } from '../hooks/useTheme';
import { capitalize } from '../data/stravaProcessing';
import { storage } from '../data/storage';

interface StravaTabProps {
  tab: string;
  totals: any;
  finalTotals: any;
}

const STATS_TO_TRACK = ['distance', 'time', 'elevation', 'speed'];
const THINGS_TO_TRACK_BY = ['ByState', 'ByYear'];

const StravaTab: React.FC<StravaTabProps> = ({ tab, totals, finalTotals }) => {
  const { colors } = useTheme();
  const stats = STATS_TO_TRACK.map(s => capitalize(s));
  const by = THINGS_TO_TRACK_BY.map(b => capitalize(b));

  const [displayStat, setDisplayStat] = useState(stats[0]);
  const [displayBy, setDisplayBy] = useState(by[1]);

  // Load saved display settings
  useEffect(() => {
    const saved = storage.getJSON<{ displayStat: string; displayBy: string } | null>(
      'stravaTabSaveDisplay' + tab, null
    );
    if (saved) {
      setDisplayStat(saved.displayStat);
      setDisplayBy(saved.displayBy);
    }
  }, [tab]);

  // Save display settings
  useEffect(() => {
    storage.setJSON('stravaTabSaveDisplay' + tab, { displayStat, displayBy });
  }, [displayStat, displayBy, tab]);

  const statBy = displayStat.toLowerCase() + displayBy.replace(/\s/g, '');
  const displayList = totals[tab][statBy].map((row: any) => ({
    ...row,
    star: row.record ? <IonIcon icon={star} /> : undefined,
  }));

  const total = finalTotals[tab][statBy];

  createTheme('transparent', {
    text: {
      primary: colors['--ion-text-color'],
      secondary: '#2aa198',
    },
    background: {
      default: 'transparent',
    },
    divider: {
      default: colors['--ion-text-color'],
    },
    highlightOnHover: {
      default: '#efefef',
      text: '#232323',
    },
  });

  const customStyles = {
    subHeader: {
      style: {
        minHeight: '1px',
        color: colors['--ion-text-color'],
      },
    },
  };

  const columns: any[] = [
    { name: 'Star', cell: (row: any) => row.star, width: '20px', compact: true },
    { name: 'Year', selector: (row: any) => row.name, width: 'auto', compact: true },
    { name: 'Data', selector: (row: any) => row.value, width: 'auto' },
  ];
  if (displayStat !== 'Speed') {
    columns.push({ name: 'Percent', selector: (row: any) => row.percent, width: 'auto' });
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar mode="ios">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{tab}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol className="listContainer">
              <IonCard className="list">
                <IonGrid>
                  <IonRow>
                    <IonCol>
                      <IonSelect value={displayStat} interface="popover" onIonChange={(e: any) => setDisplayStat(e.detail.value)}>
                        {stats.map((value, index) => (
                          <IonSelectOption key={index} value={value}>{value}</IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonCol>
                    <IonCol>
                      <IonSelect value={displayBy} interface="popover" onIonChange={(e: any) => setDisplayBy(e.detail.value)}>
                        {by.map((value, index) => (
                          <IonSelectOption key={index} value={value}>{value}</IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonCol>
                  </IonRow>
                  <IonRow>
                    <IonCol>
                      <DataTable
                        theme="transparent"
                        title={`Total: ${total}`}
                        subHeader={displayStat !== 'Speed'}
                        subHeaderComponent={`Total: ${total}`}
                        columns={columns}
                        data={displayList}
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
