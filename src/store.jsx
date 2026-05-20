import React, { createContext, useContext, useReducer } from 'react';

// 1. ESTADO INICIAL CON CENSO DE 20 VECINOS
const initialState = {
  tenant: (() => {
    const saved = localStorage.getItem('votifai_tenant');
    return saved ? JSON.parse(saved) : null;
  })()
};

// Simulador de generación de censo legal de 20 propietarios de España
const generarCenso20Propietarios = () => {
  const nombres = ["Manuel Contreras", "Carmen Ortiz", "Juan Pérez", "Ana Gómez", "Carlos Ruiz", "María José", "David León", "Laura Sanz", "Antonio López", "Elena G.", "Francisco B.", "Lucia M.", "Javier P.", "Isabel D.", "Miguel A.", "Sonia V.", "Pedro C.", "Nuria F.", "Diego R.", "Raquel H."];
  return Array.from({ length: 20 }, (_, i) => ({
    id: `vtr_${i + 1}`,
    nombre: nombres[i] || `Propietario Vecino ${i + 1}`,
    propiedad: `Piso ${Math.floor(i / 4) + 1}º${["A", "B", "C", "D"][i % 4]}`,
    email: `${(nombres[i] || `vecino${i+1}`).toLowerCase().replace(/ /g, '')}@correo.com`,
    telefono: `+34 6${Math.floor(10000000 + Math.random() * 90000000)}`,
    coeficiente: (5.00).toFixed(2), // 5% equitativo cada uno para la demo (Suma 100%)
    estadoVoto: 'pendiente'
  }));
};

// 2. EL REDUCER
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
            id: `ent_castellana`, 
            nombre: datos.tipoOrganizacion === 'administrador' ? `C.P. ${datos.nombreEntidad}` : datos.nombreEntidad, 
            tipo: datos.tipoOrganizacion === 'administrador' ? 'comunidad' : 'empresa', 
            ubicacion: 'Sede Central', 
            estado: 'Configuración inicial',
            propietarios: generarCenso20Propietarios() // <-- Inyectamos los 20 propietarios reales aquí
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
        ubicacion: nuevaEntidad.ubicacion || 'Sede Local',
        estado: 'Creada - Sin juntas activas',
        propietarios: generarCenso20Propietarios()
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

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(votifaiReducer, initialState);
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useVotifaiStore() {
  return useContext(StoreContext);
}