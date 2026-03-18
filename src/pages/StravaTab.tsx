import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonMenuButton, IonTitle, IonIcon, IonCard,
  IonButtons, IonContent, IonSelect, IonSelectOption, IonGrid, IonRow, IonCol,
} from '@ionic/react';
import { star } from 'ionicons/icons';
import './StravaTab.scss';
import DataTable, { createTheme } from 'react-data-table-component';
import { useTheme } from '../hooks/useTheme';
import { capitalize, STAT_NAMES, THINGS_TO_TRACK_BY } from '../data/stravaProcessing';
import { storage } from '../data/storage';

interface StravaTabProps {
  tab: string;
  totals: any;
  finalTotals: any;
}

const StravaTab: React.FC<StravaTabProps> = ({ tab, totals, finalTotals }) => {
  const { colors } = useTheme();
  const stats = STAT_NAMES.map(s => capitalize(s));
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
    star: row.record ? <IonIcon icon={star} className="record-star" /> : undefined,
  }));

  const total = finalTotals[tab][statBy];

  // Split total into value and unit for display (e.g., "1,234 mi" → "1,234" + "mi")
  const totalStr = String(total);
  const totalParts = totalStr.match(/^(.+?)\s+(\S+)$/);
  const totalValue = totalParts ? totalParts[1] : totalStr;
  const totalUnit = totalParts ? totalParts[2] : '';

  createTheme('transparent', {
    text: {
      primary: colors['--ion-text-color'],
      secondary: '#2aa198',
    },
    background: {
      default: 'transparent',
    },
    divider: {
      default: colors['--ion-color-step-200'] || 'rgba(255,255,255,0.08)',
    },
    highlightOnHover: {
      default: colors['--ion-color-step-150'] || 'rgba(255,255,255,0.04)',
      text: colors['--ion-text-color'],
    },
  });

  const customStyles = {
    subHeader: {
      style: {
        display: 'none' as const,
      },
    },
  };

  const columns: any[] = [
    { name: 'Star', cell: (row: any) => row.star, width: '28px', compact: true },
    { name: 'Name', selector: (row: any) => row.name, grow: 2, compact: true },
    { name: 'Data', selector: (row: any) => row.value, grow: 1, right: true },
  ];
  if (displayStat !== 'Speed') {
    columns.push({ name: 'Percent', selector: (row: any) => row.percent, width: '60px', right: true, compact: true });
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
                <div className="stat-total">
                  <div className="stat-total-value">{totalValue}</div>
                  {totalUnit && <div className="stat-total-label">{totalUnit}</div>}
                </div>
                <IonGrid>
                  <IonRow className="selector-row">
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
