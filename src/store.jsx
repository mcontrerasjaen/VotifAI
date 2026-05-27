import React, { createContext, useContext, useReducer } from 'react';

// 1. ESTADO INICIAL COMPATIBLE CON PERSISTENCIA LOCAL (Estructura Blindada)
const initialState = {
  tenant: (() => {
    const saved = localStorage.getItem('votifai_tenant');
    if (!saved) return null;
    
    const parsed = JSON.parse(saved);
    // 🛡️ Aseguramos que la propiedad coleccionista de fincas siempre exista como array al arrancar
    if (parsed && !parsed.comunidadesYEmpresas) {
      parsed.comunidadesYEmpresas = [];
    }
    return parsed;
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

// 2. EL REDUCER CENTRAL DE ACCIONES RELACIONALES
function votifaiReducer(state, action) {
  switch (action.type) {
    case 'REGISTRAR_ORGANIZACION': {
      const datosServidor = action.payload;
      
      // 🔒 Mapeamos de forma segura para dar soporte a ambos formatos (Registro y Login)
      // Extraemos el nombre del Admin (administrador_nombre o lo que devuelva tu API)
      const nuevoTenant = {
        tenantId: datosServidor.id || datosServidor.tenantId,
        nombreEntidad: datosServidor.nombre_entidad || datosServidor.nombreEntidad || "Despacho Profesional",
        email: datosServidor.email_maestro || datosServidor.email,
        tipoOrganizacion: datosServidor.tipo_organizacion || datosServidor.tipoOrganizacion,
        plan: datosServidor.plan_suscripcion || datosServidor.plan || 'trial_15_dias',
        
        // 🆕 Añadimos los datos específicos del Administrador para el Header
        admin: {
          nombre: datosServidor.admin_nombre || datosServidor.adminNombre || datosServidor.nombre || "Admin General",
          despacho: datosServidor.nombre_entidad || datosServidor.nombreEntidad || "Despacho Administrador"
        },
        
        // 💎 Inicializamos OBLIGATORIAMENTE el listado de fincas vacío si no viene del servidor
        comunidadesYEmpresas: datosServidor.comunidadesYEmpresas || []
      };
      
      localStorage.setItem('votifai_tenant', JSON.stringify(nuevoTenant));
      return { ...state, tenant: nuevoTenant };
    }

    case 'AÑADIR_ENTIDAD': {
      if (!state.tenant) return state;
      
      const nuevaEntidad = action.payload;
      
      // Aseguramos de forma reactiva que exista la lista antes de añadir
      const fincasActuales = state.tenant.comunidadesYEmpresas || [];

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
        comunidadesYEmpresas: [...fincasActuales, entidadEstructurada]
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