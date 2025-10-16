import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Main from './pages/Main';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';
import MapPage from './pages/Map';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/map" element={<MapPage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
