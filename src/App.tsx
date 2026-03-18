import React from 'react';
import { Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  IonPage,
  IonContent,
  IonCard,
  IonLabel,
  IonLoading,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import './App.scss';

import Login from './pages/login';
import MainTabs from './pages/mainTabs';
import Menu from './pages/Menu';

import { useStravaData } from './hooks/useStravaData';
import { ThemeProvider } from './hooks/useTheme';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const AppContent: React.FC = () => {
  const { totals, finalTotals, types, status, loadingMessage, error, logout } = useStravaData();

  const isLoading = status === 'downloading' || status === 'processing' || status === 'authenticating';

  return (
    <>
      <IonLoading isOpen={isLoading} message={loadingMessage || 'Loading Activities: Please Wait'} />
      <Menu logout={logout} />
      <IonRouterOutlet id="main">
        <Route path="/" render={() => {
          if (status === 'offline') {
            return (
              <IonPage>
                <IonContent>
                  <IonCard><IonLabel>No Connection Detected</IonLabel></IonCard>
                </IonContent>
              </IonPage>
            );
          }
          if (status === 'error') {
            return (
              <IonPage>
                <IonContent>
                  <IonCard><IonLabel>{error}</IonLabel></IonCard>
                </IonContent>
              </IonPage>
            );
          }
          if (status === 'idle') {
            return <Login />;
          }
          if (status === 'ready') {
            return <MainTabs totals={totals} finalTotals={finalTotals} types={types} />;
          }
          return <IonPage></IonPage>;
        }} />
      </IonRouterOutlet>
    </>
  );
};

const App: React.FC = () => (
  <IonApp>
    <ThemeProvider>
      <IonReactRouter>
        <AppContent />
      </IonReactRouter>
    </ThemeProvider>
  </IonApp>
);

export default App;
