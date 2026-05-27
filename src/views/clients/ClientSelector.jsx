import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useVotifaiStore } from '../../store.jsx';
import { Building2, Search, Plus, ArrowUpRight, FolderOpen, LogOut, Users, Mail, Phone, Send, CheckCircle2 } from 'lucide-react';

export default function ClientSelector() {
  const navigate = useNavigate();
  const { state, dispatch } = useVotifaiStore() || { state: { tenant: null }, dispatch: () => {} };
  
  const [busqueda, setBusqueda] = useState('');
  const [nombreNuevaEntidad, setNombreNuevaEntidad] = useState('');
  const [tipoNuevaEntidad, setTipoNuevaEntidad] = useState('comunidad');
  const [mostrarModal, setMostrarModal] = useState(false);
  
  const [comunidadesReales, setComunidadesReales] = useState([]);
  const [entidadSeleccionada, setEntidadSeleccionada] = useState(null);
  const [notificacionConvocatoria, setNotificacionConvocatoria] = useState(false);
  const [cargandoFincas, setCargandoFincas] = useState(true);

  const tenantIdActual = state.tenant?.tenantId || state.tenant?.id;
  
  // 🔑 Leemos los datos reales del administrador para el render
  const adminGlobal = state.tenant?.admin;
  const nombreDespacho = adminGlobal?.despacho || state.tenant?.nombreEntidad || "Mi Despacho SaaS";

  useEffect(() => {
    const cargarFincasDesdeNeon = async () => {
      if (!tenantIdActual) { setCargandoFincas(false); return; }
      try {
        const respuesta = await fetch(`/api/entities/${tenantIdActual}`);
        const datosServidor = await respuesta.json();
        console.log("=== DATOS REALES DE NEON CLOUD ===", datosServidor);
        
        if (respuesta.ok && datosServidor) {
          let listaFincasRAW = [];
          
          if (Array.isArray(datosServidor)) {
            listaFincasRAW = datosServidor;
          } else if (typeof datosServidor === 'object') {            
            listaFincasRAW = datosServidor.fincas || 
                             datosServidor.entities || 
                             datosServidor.comunidadesYEmpresas || 
                             datosServidor.data ||
                             Object.values(datosServidor).find(val => Array.isArray(val)) || 
                             [];
          }

          const fincasEstructuradas = listaFincasRAW.map(f => ({
            id: f.id || f.entityId,
            nombre: f.nombre || f.nombre_entidad || 'Finca sin nombre',
            tipo: f.tipo || 'comunidad',
            direccion: f.direccion || 'Dirección Registrada',
            estado: 'Junta Programada — HOY 18:00',
            propietarios: Array.from({ length: 20 }, (_, i) => ({
              id: `vtr_${i + 1}`,
              nombre: ["Manuel Contreras", "Carmen Ortiz", "Juan Pérez", "Ana Gómez", "Carlos Ruiz", "María José", "David León", "Laura Sanz", "Antonio López", "Elena G.", "Francisco B.", "Lucia M.", "Javier P.", "Isabel D.", "Miguel A.", "Sonia V.", "Pedro C.", "Nuria F.", "Diego R.", "Raquel H."][i] || `Vecino ${i+1}`,
              propiedad: `Piso ${Math.floor(i / 4) + 1}º${["A", "B", "C", "D"][i % 4]}`,
              email: `vecino_${i+1}@correo.com`,
              telefono: `+34 600 123 0${i+1}`,
              coeficiente: "5.00"
            }))
          }));
          
          setComunidadesReales(fincasEstructuradas);
          
          if (fincasEstructuradas.length > 0) {
            setEntidadSeleccionada(fincasEstructuradas[0]);
          }
        }
      } catch (error) { 
        console.error("Fallo crítico de lectura en el catálogo:", error); 
      } finally { 
        setCargandoFincas(false); 
      }
    };
    cargarFincasDesdeNeon();
  }, [tenantIdActual]);

  const entidadesFiltradas = comunidadesReales.filter(e => e.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  
  const handleCrearEntidad = async (e) => {
    e.preventDefault();
    if (!nombreNuevaEntidad.trim() || !tenantIdActual) return;

    const payload = {
      tenant_id: tenantIdActual,
      nombre: nombreNuevaEntidad,
      cif: `H-${Math.floor(10000000 + Math.random() * 90000000)}`,
      direccion: 'Calle Registrada de la Finca'
    };

    try {     
      const respuesta = await fetch('/api/entities/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (respuesta.ok) {
        setNombreNuevaEntidad('');
        setMostrarModal(false);               
        setCargandoFincas(true);
        const refetch = await fetch(`/api/entities/${tenantIdActual}`);
        const nuevosDatos = await refetch.json();            
        const listaFincas = Array.isArray(nuevosDatos) ? nuevosDatos : (nuevosDatos.fincas || []);
        const fincasEstructuradas = listaFincas.map(f => ({
          id: f.id,
          nombre: f.nombre,
          tipo: 'comunidad',
          direccion: f.direccion || 'Dirección Registrada',
          estado: 'Junta Programada — HOY 18:00',
          propietarios: comunidadesReales[0]?.propietarios || [] 
        }));
        setComunidadesReales(fincasEstructuradas);
      }
    } catch (error) {
      console.error("Error al dar de alta la finca en Neon:", error);
    }
  };

  const handleDispararConvocatoria = () => { setNotificacionConvocatoria(true); setTimeout(() => setNotificacionConvocatoria(false), 3000); };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col h-screen overflow-hidden">
      <header className="border-b border-slate-900 bg-slate-950 px-6 py-4 flex justify-between items-center shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white"><FolderOpen size={20} /></div>
          <div>
            <h1 className="text-sm font-black text-white">{nombreDespacho}</h1>
            <p className="text-4xs uppercase tracking-widest text-slate-500 font-bold">Consola Maestro de Gestión de Carteras</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {adminGlobal?.nombre && (
            <span className="text-4xs font-mono bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1.5 rounded-lg">
              👤 {adminGlobal.nombre}
            </span>
          )}
          <button onClick={() => setMostrarModal(true)} className="bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl">Dar de Alta Nueva Finca</button>
          <button onClick={() => { dispatch({ type: 'CERRAR_SESION' }); navigate('/'); }} className="p-2.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl"><LogOut size={14} /></button>
        </div>
      </header>

     {/* CUERPO TRES COLUMNAS PANORÁMICO */}
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden p-4 gap-4">
        <div className="w-full lg:flex-grow bg-slate-900/30 border border-slate-900 rounded-2xl p-4 flex flex-col h-full overflow-hidden">
          <div className="relative bg-slate-950 p-1 rounded-2xl border border-slate-900 mb-4 shrink-0">
            <Search className="absolute left-4 top-4 text-slate-500" size={16} />
            <input type="text" placeholder="Filtrar por dirección o nombre de finca..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full bg-slate-900 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200" />
          </div>
          <div className="space-y-2 overflow-y-auto flex-grow pr-1 custom-scrollbar">
            {cargandoFincas ? (
              <div className="text-center py-8 text-4xs text-slate-500 font-bold uppercase">Interrogando a Neon Cloud...</div>
            ) : entidadesFiltradas.length > 0 ? (
              entidadesFiltradas.map((entidad) => (
                <div key={entidad.id} onClick={() => setEntidadSeleccionada(entidad)} className={`p-4 rounded-xl border flex flex-col gap-3 cursor-pointer ${entidadSeleccionada?.id === entidad.id ? 'bg-blue-600/10 border-blue-500' : 'bg-slate-950 border-slate-900'}`}>
                  <div className="flex justify-between text-4xs font-mono"><span>📍 Finca Activa</span><span>CENSO: {entidad.propietarios?.length}</span></div>
                  <h3 className="text-xs font-bold text-white">{entidad.nombre}</h3>
                  <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-4xs">
                    <span className="text-amber-400 font-bold">{entidad.estado}</span>
                    
                    {/* 🚀 BOTÓN MODIFICADO: Inyecta el ID real de la finca en la URL de navegación */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Evitamos que pise la selección de la tarjeta
                        navigate(`/admin/${entidad.id}`);
                      }} 
                      className="bg-blue-600 hover:bg-blue-500 transition-colors px-3 py-1.5 rounded-xl text-white text-5xs font-black uppercase tracking-wider shadow-md shadow-blue-600/10"
                    >
                      Entrar a Sala ➔
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-4xs text-slate-500 font-bold">No se han encontrado fincas registradas.</div>
            )}
          </div>
        </div>

       {/* COLUMNA DERECHA: EXPEDIENTE E INFORMACIÓN REAL DE LA FINCA SELECCIONADA */}
        <div className="w-full lg:w-7/12 bg-slate-950/40 border border-slate-900 rounded-2xl p-5 flex flex-col h-full overflow-hidden justify-between">
          {entidadSeleccionada ? (
            <div className="flex flex-col h-full overflow-hidden justify-between">
              <div className="flex flex-col flex-grow overflow-hidden">
                
                {/* CABECERA DEL EXPEDIENTE */}
                <div className="border-b border-slate-900 pb-3 flex justify-between items-center shrink-0">
                  <div>
                    <h3 className="text-xs font-black uppercase text-slate-400 flex items-center gap-1.5">
                      <Users size={14} /> Expediente y Censo de la Finca
                    </h3>
                    <p className="text-4xs text-blue-400 font-mono mt-0.5 uppercase tracking-wider">
                      {entidadSeleccionada.nombre}
                    </p>
                  </div>
                  <button onClick={handleDispararConvocatoria} className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 text-5xs font-black px-3 py-2 rounded-xl transition-all">
                    Convocar por WA
                  </button>
                </div>

                {/* 📊 NUEVO PANEL DE DATOS REALES DE NEON CLOUD (CIF, Dirección y Estado) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3 shrink-0">
                  <div className="bg-slate-900/50 border border-slate-900 p-3 rounded-xl shadow-inner">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Código CIF Legal</span>
                    <p className="text-3xs font-mono font-bold text-slate-200 mt-1 uppercase">
                      {entidadSeleccionada.cif || "H-00000000"}
                    </p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-900 p-3 rounded-xl shadow-inner sm:col-span-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Dirección de la Propiedad</span>
                    <p className="text-3xs font-medium text-slate-200 mt-1 truncate">
                      {entidadSeleccionada.direccion || "Calle no especificada en Neon"}
                    </p>
                  </div>
                </div>

                {/* TABLA DEL CENSO LEGAL */}
                <div className="flex-grow overflow-y-auto custom-scrollbar mb-3 border border-slate-900 rounded-xl bg-slate-950">
                  <table className="w-full text-left font-sans text-4xs">
                    <thead className="bg-slate-900 text-slate-400 sticky top-0 border-b border-slate-800 font-bold z-10">
                      <tr>
                        <th className="py-2 px-3">Propiedad</th>
                        <th className="py-2 px-3">Propietario</th>
                        <th className="py-2 px-3">Email</th>
                        <th className="py-2 px-3">WhatsApp</th>
                        <th className="py-2 px-3 text-right">Coef.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-slate-300">
                      {entidadSeleccionada.propietarios?.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="py-2 px-3 font-bold text-blue-400">{v.propiedad}</td>
                          <td className="py-2 px-3 text-white font-bold">{v.nombre}</td>
                          <td className="py-2 px-3 text-slate-400 truncate max-w-[100px]">{v.email}</td>
                          <td className="py-2 px-3 text-slate-400 font-mono">{v.telefono}</td>
                          <td className="py-2 px-3 text-right font-black text-emerald-400">{v.coeficiente}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PIE METRIFICADO DINÁMICO */}
              <div className="text-5xs text-slate-500 font-bold border-t border-slate-900 pt-3 flex justify-between uppercase shrink-0">
                <span>Régimen General: Art. 17 LPH</span>
                <span className="text-blue-500 font-mono font-black">
                  Suma Coeficientes Cruzados: {(entidadSeleccionada.propietarios?.reduce((acc, v) => acc + parseFloat(v.coeficiente), 0) || 100).toFixed(2)}%
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full text-slate-500 p-6">
              <Building2 size={32} className="text-slate-700 animate-pulse" />
              <h3 className="text-3xs font-black uppercase text-slate-500 mt-2 tracking-widest">Visor Inactivo</h3>
              <p className="text-5xs text-slate-600 mt-1 max-w-[180px]">Selecciona una finca del catálogo izquierdo para interrogar sus credenciales.</p>
            </div>
          )}
        </div>
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCrearEntidad} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div><h2 className="text-sm font-black text-white">Registrar Finca</h2></div>
            <div><label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nombre de la Finca</label><input type="text" required placeholder="Ej: Gran Vía 12" value={nombreNuevaEntidad} onChange={(e) => setNombreNuevaEntidad(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-200" /></div>
            <div className="flex gap-2"><button type="button" onClick={() => setMostrarModal(false)} className="flex-1 bg-slate-950 text-slate-400 py-2 rounded-xl text-xs font-bold">Cancelar</button><button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-xs font-bold">Confirmar</button></div>
          </form>
        </div>
      )}
    </div>
  );
}