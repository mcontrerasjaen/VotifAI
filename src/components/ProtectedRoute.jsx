import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
// 🔑 Importamos el hook institucional correcto de tu store relacional
import { useVotifaiStore } from '../store.jsx'; 

export default function ProtectedRoute() {
  // Extraemos el tenant desde el estado de tu reducer central
  const { state } = useVotifaiStore() || { state: { tenant: null } };
  const admin = state?.tenant?.admin;

  // Si no hay sesión o datos de administrador guardados, bloqueamos el acceso
  if (!admin) {
    return <Navigate to="/login/corporativo" replace />;
  }

  // Si está autenticado de forma segura, renderiza las pantallas privadas
  return <Outlet />;
}