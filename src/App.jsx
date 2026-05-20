import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './store.jsx';
import Welcome from './views/auth/Welcome';
import Login from './views/auth/Login';
import Register from './views/auth/Register'; 
import ClientSelector from './views/clients/ClientSelector';
import Dashboard from './views/dashboard/Dashboard';
import MinutesAI from './views/minutes/MinutesAI';
import VoterScreen from './views/voter/VoterScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login/:perfil" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* <-- Añadimos la ruta oficial */}
        <Route path="/hub" element={<ClientSelector />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/acta-ia" element={<MinutesAI />} />
        <Route path="/voto-vecino" element={<VoterScreen tipoUsuario="vecino" />} />
        <Route path="/voto-socio" element={<VoterScreen tipoUsuario="empresa" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;