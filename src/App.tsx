import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Main from './pages/Main';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';
import MapPage from './pages/Map';
import Settings from './pages/Settings';
import Help from './pages/Help';
import PreferencesInitializer from './features/preferences/PreferencesInitializer';
import Onboarding from './features/onboarding/Onboarding';
import A2HSBanner from './components/A2HSBanner';
import { track } from './lib/analytics';

const App = () => {
  useEffect(() => {
    track('open_app');
  }, []);

  return (
    <BrowserRouter>
      <PreferencesInitializer />
      <Onboarding />
      <A2HSBanner />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
