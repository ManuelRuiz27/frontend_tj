import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Main from './pages/Main';
import Login from './pages/Login';
import Register from './pages/Register';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
    </Routes>
  </BrowserRouter>
);

export default App;
