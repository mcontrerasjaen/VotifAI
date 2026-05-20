import React, { createContext, useContext, useReducer } from 'react';

// 1. ESTADO INICIAL
const initialState = {
  tenant: (() => {
    const saved = localStorage.getItem('votifai_tenant');
    return saved ? JSON.parse(saved) : null;
  })()
};

// 2. EL REDUCER (Flujo clásico basado en Acciones)
function votifaiReducer(state, action) {
  switch (action.type) {
    case 'REGISTRAR_ORGANIZACION': {
      const datos = action.payload;
      const nuevoTenant = {
        tenantId: `tenant_${Math.random().toString(36).substr(2, 9)}`,
        nombreEntidad: datos.nombreEntidad,
        email: datos.email,
        tipoOrganizacion: datos.tipoOrganizacion,
        plan: datos.plan,
        fechaRegistro: new Date().toISOString(),
        comunidadesYEmpresas: [
          { 
            id: `ent_${Math.random().toString(36).substr(2, 9)}`, 
            nombre: `${datos.nombreEntidad} - Sede Inicial`, 
            tipo: datos.tipoOrganizacion === 'administrador' ? 'comunidad' : 'empresa', 
            ubicacion: 'Principal', 
            estado: 'Configuración inicial' 
          }
        ]
      };
      localStorage.setItem('votifai_tenant', JSON.stringify(nuevoTenant));
      return { ...state, tenant: nuevoTenant };
    }

    case 'AÑADIR_ENTIDAD': {
      if (!state.tenant) return state;
      const nuevaEntidad = action.payload;
      const entidadEstructurada = {
        id: `ent_${Math.random().toString(36).substr(2, 9)}`,
        nombre: nuevaEntidad.nombre,
        tipo: nuevaEntidad.tipo,
        ubicacion: nuevaEntidad.ubicacion || 'No especificada',
        estado: 'Creada - Sin juntas activas',
        color: nuevaEntidad.tipo === 'comunidad' ? 'border-blue-500/30 text-blue-400' : 'border-indigo-500/30 text-indigo-400'
      };
      const tenantActualizado = {
        ...state.tenant,
        comunidadesYEmpresas: [...state.tenant.comunidadesYEmpresas, entidadEstructurada]
      };
      localStorage.setItem('votifai_tenant', JSON.stringify(tenantActualizado));
      return { ...state, tenant: tenantActualizado };
    }

    case 'CERRAR_SESION':
      localStorage.removeItem('votifai_tenant');
      return { ...state, tenant: null };

    default:
      return state;
  }
}

// 3. CONTEXTO DE DISTRIBUCIÓN
const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(votifaiReducer, initialState);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

// 4. HOOK MAESTRO
export function useVotifaiStore() {
  return useContext(StoreContext);
}