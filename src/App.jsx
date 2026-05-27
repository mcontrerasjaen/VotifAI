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
import ProtectedRoute from './components/ProtectedRoute'; // <-- Importamos el protector

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          {/* 🔓 RUTAS PÚBLICAS */}
          <Route path="/" element={<Welcome />} />
          <Route path="/login/:perfil" element={<Login />} />
          <Route path="/register" element={<Register />} /> 
          
          {/* 🗳️ PANTALLAS DE VOTO (Acceso directo para propietarios) */}
          <Route path="/voto-vecino" element={<VoterScreen tipoUsuario="vecino" />} />
          <Route path="/voto-socio" element={<VoterScreen tipoUsuario="empresa" />} />

          {/* 🔒 RUTAS PRIVADAS (Solo Administradores Autenticados) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/hub" element={<ClientSelector />} />       
            <Route path="/admin/:fincaId" element={<Dashboard />} />
            <Route path="/acta-ia" element={<MinutesAI />} />
          </Route>

          {/* 🔄 REDIRECCIÓN POR DEFECTO */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;