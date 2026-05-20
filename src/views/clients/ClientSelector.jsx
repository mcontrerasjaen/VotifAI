import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useVotifaiStore } from '../../store.jsx'; // <-- Archivo en la raíz
import { Building2, Search, Plus, Calendar, ArrowUpRight, FolderOpen, LogOut } from 'lucide-react';

export default function ClientSelector() {
  const navigate = useNavigate();
  const store = useVotifaiStore(); // <-- Leemos el store completo primero
  
  const [busqueda, setBusqueda] = useState('');
  const [nombreNuevaEntidad, setNombreNuevaEntidad] = useState('');
  const [tipoNuevaEntidad, setTipoNuevaEntidad] = useState('comunidad');
  const [mostrarModal, setMostrarModal] = useState(false);

  // CONTROL ANTICAÍDAS: Si el store o el contexto no se ha iniciado, usamos un estado demo seguro
  const state = store?.state || { tenant: null };
  const dispatch = store?.dispatch || (() => {});

  // Si no hay datos reales en el Reducer, activamos una plantilla por defecto para no romper el mapeo
  const tenant = state.tenant || {
    nombreEntidad: "Despacho General de Pruebas",
    tipoOrganizacion: "administrador",
    comunidadesYEmpresas: [
      { id: 'demo_1', nombre: 'Comunidad de Propietarios de Ejemplo 1', tipo: 'comunidad', ubicacion: 'Madrid', estado: 'Configuración inicial' }
    ]
  };

  // Filtrado reactivo de la barra de búsqueda
  const entidadesFiltradas = tenant.comunidadesYEmpresas.filter(entidad =>
    entidad.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleCrearEntidad = (e) => {
    e.preventDefault();
    if (!nombreNuevaEntidad.trim()) return;

    dispatch({
      type: 'AÑADIR_ENTIDAD',
      payload: {
        nombre: nombreNuevaEntidad,
        tipo: tipoNuevaEntidad,
        ubicacion: 'Sede Local'
      }
    });

    setNombreNuevaEntidad('');
    setMostrarModal(false);
  };

  const handleCerrarSesion = () => {
    dispatch({ type: 'CERRAR_SESION' });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased">
      
      {/* CABECERA */}
      <header className="border-b border-slate-800 bg-slate-950/40 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-xl text-white shadow-lg shadow-blue-600/20">
            <FolderOpen size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black text-white flex items-center gap-2">
              {tenant.nombreEntidad} <span className="text-4xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700 uppercase tracking-wider font-bold">Portal Activo</span>
            </h1>
            <p className="text-4xs uppercase tracking-widest text-slate-500 font-bold">Consola Privada SaaS</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMostrarModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/10 active:scale-98"
          >
            <Plus size={14} /> Registrar Nueva Junta
          </button>
          <button 
            onClick={handleCerrarSesion}
            className="p-2.5 bg-slate-950 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 rounded-xl transition-all"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        
        {/* BUSCADOR */}
        <div className="relative max-w-md bg-slate-950 p-1 rounded-2xl border border-slate-800/80 shadow-xl">
          <Search className="absolute left-4 top-4 text-slate-500" size={16} />
          <input 
            type="text"
            placeholder="Buscar entre tus fincas o empresas registradas..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-slate-900 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        {/* REJILLA DE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entidadesFiltradas.map((entidad) => (
            <motion.div
              key={entidad.id}
              whileHover={{ y: -3 }}
              className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between h-44 shadow-md group relative overflow-hidden"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-4xs font-black uppercase tracking-widest border px-2 py-0.5 rounded-md ${entidad.tipo === 'comunidad' ? 'border-blue-500/20 text-blue-400 bg-blue-500/5' : 'border-indigo-500/20 text-indigo-400 bg-indigo-500/5'}`}>
                    {entidad.tipo === 'comunidad' ? '📍 Finca' : '🏢 Corporación'}
                  </span>
                  <span className="text-4xs font-mono text-slate-600 font-bold">ID: {entidad.id.toUpperCase()}</span>
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 pr-2">
                  {entidad.nombre}
                </h3>
              </div>

              <div className="pt-3 border-t border-slate-900/80 flex items-center justify-between text-4xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <Calendar size={11} className="text-slate-600" />
                  <span>{entidad.estado}</span>
                </div>
                <button 
                  onClick={() => navigate('/admin')}
                  className="bg-slate-900 group-hover:bg-blue-600 p-2 rounded-xl text-slate-400 group-hover:text-white transition-all border border-slate-800/50"
                >
                  <ArrowUpRight size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* MODAL CREAR ENTIDAD */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <motion.form 
            initial={{ scale: 0.95 }} animate={{ scale: 1 }}
            onSubmit={handleCrearEntidad}
            className="bg-slate-950 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl"
          >
            <div>
              <h2 className="text-sm font-black text-white">Registrar Entidad bajo tu Suscripción</h2>
              <p className="text-3xs text-slate-400 mt-0.5">Añade un nuevo cliente a tu base de datos privada.</p>
            </div>

            <div>
              <label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1">Nombre Comercial / Dirección</label>
              <input 
                type="text" required placeholder="Ej: Comunidad de Vecinos Gran Vía 12" value={nombreNuevaEntidad}
                onChange={(e) => setNombreNuevaEntidad(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1">Clasificación Legal</label>
              <select 
                value={tipoNuevaEntidad} onChange={(e) => setTipoNuevaEntidad(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="comunidad">Finca Vecinal (Ley Propiedad Horizontal)</option>
                <option value="empresa">Sociedad Mercantil (Ley Sociedades Capital)</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                type="button" onClick={() => setMostrarModal(false)}
                className="flex-1 bg-slate-900 border border-slate-800 text-slate-400 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-blue-500 transition-colors"
              >
                Confirmar Registro
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
}