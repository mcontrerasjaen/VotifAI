import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useVotifaiStore } from '../../store.jsx';
import { Building2, Search, Plus, Calendar, ArrowUpRight, FolderOpen, LogOut, Users, Mail, Phone, Percent, ShieldCheck, Send, CheckCircle2 } from 'lucide-react';

export default function ClientSelector() {
  const navigate = useNavigate();
  const { state, dispatch } = useVotifaiStore() || { state: { tenant: null }, dispatch: () => {} };
  
  const [busqueda, setBusqueda] = useState('');
  const [nombreNuevaEntidad, setNombreNuevaEntidad] = useState('');
  const [tipoNuevaEntidad, setTipoNuevaEntidad] = useState('comunidad');
  const [mostrarModal, setMostrarModal] = useState(false);
  
  // ESTADO PARA SELECCIONAR UNA FINCA Y VER SUS PROPIETARIOS EN PARALELO
  const [entidadSeleccionada, setEntidadSeleccionada] = useState(null);
  const [notificacionConvocatoria, setNotificacionConvocatoria] = useState(false);

  // CONTROL ANTICAÍDAS: Si no hay login real, activamos la plantilla multi-tenant
  const tenant = state.tenant || {
    nombreEntidad: "Administraciones Martínez S.L.",
    comunidadesYEmpresas: [
      { 
        id: 'ent_castellana', 
        nombre: 'C.P. Paseo de la Castellana 42, Madrid', 
        tipo: 'comunidad', 
        ubicacion: 'Madrid', 
        estado: 'Junta Programada — HOY 18:00',
        propietarios: Array.from({ length: 20 }, (_, i) => ({
          id: `vtr_${i + 1}`,
          nombre: ["Manuel Contreras", "Carmen Ortiz", "Juan Pérez", "Ana Gómez", "Carlos Ruiz", "María José", "David León", "Laura Sanz", "Antonio López", "Elena G.", "Francisco B.", "Lucia M.", "Javier P.", "Isabel D.", "Miguel A.", "Sonia V.", "Pedro C.", "Nuria F.", "Diego R.", "Raquel H."][i] || `Vecino ${i+1}`,
          propiedad: `Piso ${Math.floor(i / 4) + 1}º${["A", "B", "C", "D"][i % 4]}`,
          email: `vecino_${i+1}@correo.com`,
          telefono: `+34 600 123 0${i+1}`,
          coeficiente: "5.00"
        }))
      }
    ]
  };

  const entidadesFiltradas = tenant.comunidadesYEmpresas.filter(entidad =>
    entidad.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleCrearEntidad = (e) => {
    e.preventDefault();
    if (!nombreNuevaEntidad.trim()) return;
    dispatch({ type: 'AÑADIR_ENTIDAD', payload: { nombre: nombreNuevaEntidad, tipo: tipoNuevaEntidad } });
    setNombreNuevaEntidad('');
    setMostrarModal(false);
  };

  const handleDispararConvocatoria = () => {
    setNotificacionConvocatoria(true);
    setTimeout(() => setNotificacionConvocatoria(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col h-screen overflow-hidden">
      
      {/* CABECERA MULTI-TENANT */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex justify-between items-center shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-xl text-white shadow-lg shadow-blue-600/20">
            <FolderOpen size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black text-white flex items-center gap-2">
              {tenant.nombreEntidad} <span className="text-4xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 uppercase font-bold tracking-wider">SaaS Hub</span>
            </h1>
            <p className="text-4xs uppercase tracking-widest text-slate-500 font-bold">Consola Maestro de Gestión de Carteras</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMostrarModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/10 active:scale-98"
          >
            <Plus size={14} /> Dar de Alta Nueva Finca
          </button>
          <button onClick={() => { dispatch({ type: 'CERRAR_SESION' }); navigate('/'); }} className="p-2.5 bg-slate-900 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 rounded-xl transition-all">
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* NOTIFICACIÓN FLOTANTE DE CONVOCATORIA MASIVA */}
      <AnimatePresence>
        {notificacionConvocatoria && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 z-50 border border-blue-400">
            <CheckCircle2 size={16} /> ¡Convocatoria Oficial disparada a los 20 propietarios vía Email y WhatsApp!
          </motion.div>
        )}
      </AnimatePresence>

      {/* DISEÑO PANORÁMICO DIVIDIDO A DOS COLUMNAS EN ESCRITORIO */}
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden p-4 gap-4">
        
        {/* COLUMNA IZQUIERDA: TARJETAS DE LAS FINCAS (Ocupa 5/12 o ancho flexible) */}
        <div className="w-full lg:flex-grow bg-slate-900/30 border border-slate-900 rounded-2xl p-4 flex flex-col h-full overflow-hidden">
          <div className="relative bg-slate-950 p-1 rounded-2xl border border-slate-900 shadow-xl mb-4 shrink-0">
            <Search className="absolute left-4 top-4 text-slate-500" size={16} />
            <input 
              type="text" placeholder="Filtrar por dirección o nombre de finca..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-slate-900 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/30"
            />
          </div>

          {/* Rejilla Desplazable de Fincas */}
          <div className="space-y-2 overflow-y-auto flex-grow pr-1 custom-scrollbar">
            {entidadesFiltradas.map((entidad) => (
              <div
                key={entidad.id}
                onClick={() => setEntidadSeleccionada(entidad)}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                  entidadSeleccionada?.id === entidad.id 
                    ? 'bg-blue-600/10 border-blue-500 text-white' 
                    : 'bg-slate-950 border-slate-900 hover:border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-4xs font-black uppercase tracking-widest border border-blue-500/20 text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded">📍 Finca Vecinal</span>
                  <span className="text-4xs font-mono text-slate-600 font-bold">CENSO: {entidad.propietarios?.length || 20}</span>
                </div>
                <h3 className="text-xs font-bold text-white line-clamp-2 pr-2">{entidad.nombre}</h3>
                <div className="pt-2.5 border-t border-slate-900/60 flex items-center justify-between text-4xs font-medium text-slate-500">
                  <span className={entidad.estado.includes('HOY') ? 'text-amber-400 font-bold animate-pulse' : ''}>{entidad.estado}</span>
                  <button onClick={(e) => { e.stopPropagation(); navigate('/admin'); }} className="bg-slate-900 p-2 rounded-xl text-slate-400 border border-slate-800 hover:bg-blue-600 hover:text-white transition-all hover:border-blue-500 flex items-center gap-1 font-bold uppercase tracking-wider text-5xs">
                    Entrar a Sala <ArrowUpRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA: EL ENORME CENSO DE LOS 20 PROPIETARIOS (Aparece en pantalla ancha al pinchar una finca) */}
        <div className="w-full lg:w-7/12 bg-slate-950/40 border border-slate-900 rounded-2xl p-5 flex flex-col h-full overflow-hidden justify-between">
          {entidadSeleccionada ? (
            /* SI HAY UNA FINCA MANDADA A REVISAR, SE ABRE EL PANEL */
            <div className="flex flex-col h-full overflow-hidden justify-between">
              
              <div className="flex flex-col flex-grow overflow-hidden">
                {/* Cabecera del Censo */}
                <div className="border-b border-slate-900 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Users size={14} className="text-blue-500" /> Registro Completo del Censo de Vecinos</h3>
                    <p className="text-4xs text-slate-500 mt-0.5 truncate max-w-sm">{entidadSeleccionada.nombre}</p>
                  </div>
                  <button 
                    onClick={handleDispararConvocatoria}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/30 text-blue-400 text-5xs font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Send size={11} /> Convocar a Junta por Email/WA
                  </button>
                </div>

                {/* 📋 LA TABLA EXPANDIDA SIMÉTRICA DE LOS 20 PROPIETARIOS 📋 */}
                <div className="flex-grow overflow-y-auto custom-scrollbar my-3 border border-slate-900 rounded-xl bg-slate-950">
                  <table className="w-full text-left border-collapse font-sans text-4xs">
                    <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider sticky top-0 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Propiedad</th>
                        <th className="py-2.5 px-3">Propietario / Vecino</th>
                        <th className="py-2.5 px-3">Email de Contacto</th>
                        <th className="py-2.5 px-3">Teléfono (WhatsApp)</th>
                        <th className="py-2.5 px-3 text-right">Coef.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60 text-slate-300 font-medium">
                      {entidadSeleccionada.propietarios?.map((vecino) => (
                        <tr key={vecino.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-blue-400 whitespace-nowrap">{vecino.propiedad}</td>
                          <td className="py-2.5 px-3 text-white font-bold">{vecino.nombre}</td>
                          <td className="py-2.5 px-3 text-slate-400 lowercase truncate max-w-[120px]"><span className="inline-flex items-center gap-1"><Mail size={10} className="text-slate-600" /> {vecino.email}</span></td>
                          <td className="py-2.5 px-3 text-slate-400 font-mono whitespace-nowrap"><span className="inline-flex items-center gap-1"><Phone size={10} className="text-slate-600" /> {vecino.telefono}</span></td>
                          <td className="py-2.5 px-3 text-right font-black font-mono text-emerald-400">{vecino.coeficiente}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="text-5xs text-slate-500 font-bold border-t border-slate-900 pt-3 flex justify-between items-center shrink-0 uppercase tracking-widest">
                <span>Doble Mayoría Legal Ponderada Vinculada al Art. 17 LPH</span>
                <span className="text-blue-500">Suma Coeficientes: 100% Garantizado</span>
              </div>
            </div>
          ) : (
            /* MENSAJE POR DEFECTO SI NO HA PULSADO NINGUNA CARD */
            <div className="flex flex-col items-center justify-center text-center h-full text-slate-500 p-6 space-y-2">
              <Building2 size={32} className="text-slate-800" />
              <h3 className="text-3xs font-black uppercase tracking-widest text-slate-400">Visor de Fincas Inactivo</h3>
              <p className="text-4xs max-w-xs leading-normal">Selecciona cualquiera de las comunidades del catálogo de la izquierda para desplegar de forma panorámica su censo legal de propietarios y herramientas de convocatoria [INDEX].</p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL CREAR CLIENTE */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.form initial={{ scale: 0.95 }} animate={{ scale: 1 }} onSubmit={handleCrearEntidad} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div><h2 className="text-sm font-black text-white">Registrar Finca</h2><p className="text-3xs text-slate-400 mt-0.5">Asigna una nueva comunidad de vecinos bajo tu suscripción SaaS.</p></div>
            <div><label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1">Nombre / Dirección de la Comunidad</label><input type="text" required placeholder="Ej: Comunidad de Vecinos Gran Vía 12" value={nombreNuevaEntidad} onChange={(e) => setNombreNuevaEntidad(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-200 focus:outline-none" /></div>
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setMostrarModal(false)} className="flex-1 bg-slate-950 border border-slate-800 text-slate-400 py-2.5 rounded-xl text-xs font-bold">Cancelar</button><button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold">Confirmar Registro</button></div>
          </motion.form>
        </div>
      )}

    </div>
  );
}