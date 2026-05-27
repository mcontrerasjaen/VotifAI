import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Users, Radio, FileText, BarChart3, PieChart, Plus, Vote, ChevronRight, Timer, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useVotifaiStore } from '../../store.jsx';


// 🛡️ COMPONENTE HEADER PANEL (Exportación nombrada para evitar duplicar el default)
export function HeaderDashboard({ admin }) {
  return (
    <header className="w-full bg-[#0d1117] text-white h-16 px-6 flex justify-between items-center border-b border-slate-800 shrink-0">
      {/* Lado Izquierdo: Logotipo y Contexto */}
      <div className="flex items-center gap-3">
        <span className="text-xl font-black tracking-wider text-indigo-400">Votif<span className="text-white">AI</span></span>
        <div className="h-4 w-[1px] bg-slate-700"></div>
        <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
          Consola Maestro de Gestión de Carteras
        </span>
      </div>

      {/* Lado Derecho: Datos del Administrador de Fincas */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-200">
            {admin?.nombre || 'Cargando Administrador...'}
          </p>
          <p className="text-xs text-indigo-400 font-mono">
            {admin?.despacho || 'Despacho Profesional'}
          </p>
        </div>

        {/* Avatar dinámico con las iniciales */}
        <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-400">
          {admin?.nombre ? admin.nombre.substring(0, 2).toUpperCase() : 'AF'}
        </div>
      </div>
    </header>
  );
}

// 🏢 COMPONENTE PRINCIPAL
export default function Dashboard() {
  const navigate = useNavigate();
  const { fincaId } = useParams();

  // 🔑 EXTRAEMOS EL ESTADO REAL DEL SAAS DESDE EL PROVIDER INSTITUCIONAL
  const { state } = useVotifaiStore() || { state: { tenant: null } };
  const tenantGlobal = state?.tenant;

  const [mercado, setMercado] = useState('comunidad');
  const [puntoActivo, setPuntoActivo] = useState(0);
  const [escuchandoIA, setEscuchandoIA] = useState(false);

  const [nuevoPuntoTexto, setNuevoPuntoTexto] = useState('');
  const [mostrarFormularioPunto, setMostrarFormularioPunto] = useState(false);

  const [puntosExpandidos, setPuntosExpandidos] = useState({ 0: true });
  const [mostrarModalConvocatoria, setMostrarModalConvocatoria] = useState(false);

  const [mostrarModalVoto, setMostrarModalVoto] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(60);
  const [votosRegistrados, setVotosRegistrados] = useState(0);
  const totalAsistentesSala = 48;

  // 🏢 ESTADOS REALES CONECTADOS A NEON
  const [datosAdmin, setDatosAdmin] = useState(null);
  const [fincasReales, setFincasReales] = useState([]);
  const [fincaSeleccionada, setFincaSeleccionada] = useState(null);
  const [cargandoFincas, setCargandoFincas] = useState(true);

  // 📁 BASE DE DATOS DE PUNTOS
  const [juntasData, setJuntasData] = useState({
    comunidad: {
      puntos: [
        { id: 1, t: "Aprobación de la reforma urgente de impermeabilización del tejado, reparación integral de las bajantes de la letra C y consolidación de grietas en la fachada norte por razones de estanqueidad estructural.", si: 0, no: 0, abs: 0, estado: "Debatiendo" },
        { id: 2, t: "Instalación de cámaras de seguridad con grabación 4K continua y sensores de movimiento perimetrales en los tres accesos al garaje comunitario.", si: 0, no: 0, abs: 0, estado: "Pendiente" },
        { id: 3, t: "Renovación del contrato de mantenimiento técnico del ascensor principal con la empresa Otis, incluyendo cobertura de piezas de desgaste 24/7.", si: 0, no: 0, abs: 0, estado: "Pendiente" }
      ]
    }
  });
  // 📡 EFECTO UNIFICADO CON EL REDUCER CENTRAL DE ACCIONES
  useEffect(() => {
    let idRealDeNeon = tenantGlobal?.tenantId;

    if (!idRealDeNeon) {
      const sesionGuardada = localStorage.getItem('votifai_tenant');
      if (sesionGuardada) {
        try {
          const parsed = JSON.parse(sesionGuardada);
          idRealDeNeon = parsed?.tenantId;
        } catch (e) {
          console.error("Error leyendo caché de sesión:", e);
        }
      }
    }

    if (!idRealDeNeon) {
      return;
    }

    fetch(`/api/entities/${idRealDeNeon}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error en la pasarela de red.");
        return res.json();
      })
      .then((data) => {
        if (data.administrador) {
          setDatosAdmin(data.administrador);
        }

        if (data.fincas && data.fincas.length > 0) {
          setFincasReales(data.fincas);
          setFincaSeleccionada(data.fincas[0]);
        }
        setCargandoFincas(false);
      })
      .catch((err) => {
        console.error("Fallo al recuperar catálogo de Neon:", err);
        setCargandoFincas(false);
      });
  }, [tenantGlobal]);

  // 🔄 CONSTRUCCIÓN DINÁMICA DE LA FINCA SELECCIONADA
  const datos = fincaSeleccionada ? {
    entidad: fincaSeleccionada.nombre,
    convocatoria: "Junta General Extraordinaria (Neon Cloud)",
    cuorum: "100%",
    subCuorum: `Finca con CIF: ${fincaSeleccionada.cif}`,
    coeficiente: `Dirección: ${fincaSeleccionada.direccion}`,
    puntos: juntasData['comunidad']?.puntos || []
  } : {
    entidad: "Cargando entorno...",
    convocatoria: "Buscando asambleas...",
    cuorum: "0.00%",
    subCuorum: "Buscando fincas en la nube...",
    coeficiente: "—",
    puntos: juntasData['comunidad']?.puntos || []
  };

  const handleAñadirPunto = (e) => {
    e.preventDefault();
    if (!nuevoPuntoTexto.trim()) return;
    const nuevosPuntos = [...datos.puntos, { id: datos.puntos.length + 1, t: nuevoPuntoTexto, si: 0, no: 0, abs: 0, estado: "Pendiente" }];
    setJuntasData({ ...juntasData, [mercado]: { ...juntasData[mercado], puntos: nuevosPuntos } });
    setNuevoPuntoTexto(''); setMostrarFormularioPunto(false); setPuntoActivo(nuevosPuntos.length - 1);
  };

  const handleAvanzarFlujoPunto = () => {
    const punto = datos.puntos[puntoActivo];
    if (!punto) return;
    if (punto.estado === 'Debatiendo' || punto.estado === 'Pendiente') {
      setTiempoRestante(60); setVotosRegistrados(0); setMostrarModalVoto(true);
      const puntosActualizados = datos.puntos.map((p, idx) => idx === puntoActivo ? { ...p, estado: 'Votando' } : p);
      setJuntasData({ ...juntasData, [mercado]: { ...juntasData[mercado], puntos: puntosActualizados } });
      return;
    }
    if (punto.estado === 'Cerrado' && puntoActivo < datos.puntos.length - 1) {
      const sigIdx = puntoActivo + 1;
      setPuntoActivo(sigIdx);
      setPuntosExpandidos(prev => ({ ...prev, [sigIdx]: true }));
    }
  };

  const handleClausurarEscrutinioManual = () => {
    setMostrarModalVoto(false);
    const puntosActualizados = datos.puntos.map((p, idx) => idx === puntoActivo ? { ...p, estado: 'Cerrado', si: 68, no: 22, abs: 10 } : p);
    if (puntoActivo < datos.puntos.length - 1 && puntosActualizados[puntoActivo + 1]) {
      puntosActualizados[puntoActivo + 1].estado = 'Debatiendo';
    }
    setJuntasData({ ...juntasData, [mercado]: { ...juntasData[mercado], puntos: puntosActualizados } });
  };

  const toggleExpandirTarjeta = (index) => {
    setPuntosExpandidos(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col h-screen overflow-hidden relative">

      {/* 🆕 NAV SUPERIOR CON EL HEADER QUE INTEGRA LOS DATOS DEL ADMIN REAL */}
      <HeaderDashboard admin={tenantGlobal?.admin || datosAdmin} />

      {/* NAV SECUNDARIO DE CONTEXTO */}
      <nav className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white"><Shield size={18} /></div>
          <div>
            <span className="text-base font-black text-white">Votif<span className="text-blue-500">AI</span></span>
            <span className="text-4xs bg-slate-900 text-slate-400 font-bold px-2 py-0.5 rounded-full border border-slate-800 ml-2 uppercase">Sala de Control</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button" onClick={() => setMostrarModalConvocatoria(true)}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-blue-400 text-5xs font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow"
          >
            <FileText size={12} /> Ver Convocatoria Oficial
          </button>

          <div className="bg-slate-900 p-0.5 rounded-lg flex border border-slate-800">
            <button onClick={() => { setMercado('comunidad'); setPuntoActivo(0); }} className={`px-3 py-1 rounded-md text-3xs font-black uppercase tracking-wider transition-all ${mercado === 'comunidad' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Fincas</button>
            <button onClick={() => { setMercado('empresa'); setPuntoActivo(0); }} className={`px-3 py-1 rounded-md text-3xs font-black uppercase tracking-wider transition-all ${mercado === 'empresa' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Empresas</button>
          </div>
        </div>
      </nav>

      {/* CUERPO TRES COLUMNAS PANORÁMICO */}
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden p-4 gap-4">

        {/* COLUMNA 1: GESTIÓN DEL ORDEN DEL DÍA */}
        <aside className="w-full lg:w-96 bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col h-full overflow-hidden shrink-0">

          {/* 🛡️ CABECERA INSTITUCIONAL DEL ADMINISTRADOR */}
          <div className="p-3 mb-4 border border-slate-800 bg-slate-950 rounded-xl shadow-inner shrink-0">
            <div className="flex items-center gap-1.5 text-[9px] font-black text-blue-400 uppercase tracking-widest">
              <Shield size={11} className="text-blue-500" /> Entorno de Gestión Activo
            </div>
            <h3 className="text-xs font-black text-white mt-1 truncate">
              {cargandoFincas ? "Verificando Despacho..." : datosAdmin ? datosAdmin.nombre_entidad : tenantGlobal?.nombreEntidad || "Administrador General"}
            </h3>
            <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
              {datosAdmin ? datosAdmin.email_maestro : tenantGlobal?.email || "Conectando con Neon Cloud..."}
            </p>
          </div>

          {/* 🏢 SELECTOR INTERACTIVO DE FINCAS EN CARTERA */}
          <div className="mb-4 shrink-0">
            <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Fincas en Cartera</h4>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {cargandoFincas ? (
                <span className="text-5xs text-slate-600">Cargando catálogo...</span>
              ) : fincasReales.length === 0 ? (
                <span className="text-5xs text-rose-400">Sin fincas en Neon.</span>
              ) : (
                fincasReales.map((finca) => (
                  <button
                    key={finca.id}
                    onClick={() => setFincaSeleccionada(finca)}
                    className={`px-2.5 py-1 rounded-lg text-4xs font-bold transition-all border ${fincaSeleccionada?.id === finca.id
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-black'
                        : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800'
                      }`}
                  >
                    {finca.nombre}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mb-3 shrink-0 border-t border-slate-900 pt-3">
            <h2 className="text-3xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Vote size={14} className="text-blue-500" /> Puntos a Tratar ({datos.puntos.length})
            </h2>
            <button
              onClick={() => setMostrarFormularioPunto(!mostrarFormularioPunto)}
              className={`p-1 rounded-md border transition-colors ${mostrarFormularioPunto ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
            >
              <Plus size={12} />
            </button>
          </div>

          <AnimatePresence>
            {mostrarFormularioPunto && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAñadirPunto}
                className="bg-slate-950 border border-slate-800 p-3 rounded-xl mb-3 space-y-2 overflow-hidden shrink-0"
              >
                <textarea
                  required
                  placeholder="Ej: Renovación del servicio de conserjería..."
                  value={nuevoPuntoTexto}
                  onChange={(e) => setNuevoPuntoTexto(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-4xs text-slate-200 focus:outline-none resize-none h-12"
                />
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setMostrarFormularioPunto(false)} className="text-5xs font-bold text-slate-500">Cancelar</button>
                  <button type="submit" className="bg-blue-600 text-white text-5xs font-black px-3 py-1 rounded-md">Incluir</button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* LISTADO DE PUNTOS CON ACORDEÓN DINÁMICO */}
          <div className="space-y-2.5 overflow-y-auto flex-grow pr-1 custom-scrollbar">
            {datos.puntos.map((punto, index) => {
              const estaExpandido = !!puntosExpandidos[index];
              const esElActivo = index === puntoActivo;

              return (
                <div key={punto.id} className={`w-full rounded-xl border transition-all flex flex-col overflow-hidden ${esElActivo ? 'bg-blue-600/10 border-blue-500 shadow-lg' : 'bg-slate-950 border-slate-900'}`}>
                  <div onClick={() => setPuntoActivo(index)} className="p-3 flex justify-between items-start gap-2 cursor-pointer select-none">
                    <div className="text-3xs font-bold text-slate-200 line-clamp-1 flex-grow">{punto.id}. {punto.t}</div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleExpandirTarjeta(index); }}
                      className="text-slate-500 hover:text-white p-0.5 rounded transition-colors bg-slate-900 border border-slate-850 shrink-0"
                    >
                      {estaExpandido ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                    {estaExpandido && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-3 pb-3 pt-1 border-t border-slate-900/60 bg-slate-950/40 text-4xs leading-relaxed text-slate-400 font-medium whitespace-pre-line"
                      >
                        {punto.t}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="px-3 pb-2.5 pt-1.5 flex justify-between items-center text-5xs font-black uppercase tracking-wider bg-slate-950/20 border-t border-slate-900/20 shrink-0">
                    <span className={esElActivo ? 'text-blue-400' : 'text-slate-600'}>EXP-00{punto.id}</span>
                    <span className={`px-2 py-0.5 rounded font-black ${punto.estado === 'Votando' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' : punto.estado === 'Debatiendo' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : punto.estado === 'Cerrado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 text-slate-500'}`}>
                      {punto.estado}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* COLUMNA 2: MONITOR CENTRAL */}
        <section className="flex-grow bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col h-full overflow-hidden justify-between">
          <div className="space-y-5 overflow-y-auto flex-grow pr-1 custom-scrollbar">
            <div className="border-b border-slate-900 pb-4">
              <span className="text-4xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{datos.convocatoria}</span>
              <h2 className="text-base font-black text-white mt-1">{datos.entidad}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 shadow-inner">
                <span className="text-4xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Users size={12} className="text-blue-500" /> Cuórum de Cabezas</span>
                <div className="text-2xl font-black text-white mt-1">{datos.cuorum}</div>
                <p className="text-4xs text-slate-500 font-medium mt-0.5">{datos.subCuorum}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 shadow-inner">
                <span className="text-4xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><PieChart size={12} className="text-indigo-500" /> Coeficiente Total</span>
                <div className="text-2xl font-black text-white mt-1">{datos.coeficiente}</div>
                <p className="text-4xs text-emerald-500 font-semibold mt-0.5">✓ Cuórum legal válido</p>
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-900 space-y-4">
              <h3 className="text-3xs font-black uppercase tracking-widest text-slate-400">Recuento de Voto Consolidados — Tema {datos.puntos[puntoActivo]?.id}</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-3xs font-bold mb-1"><span className="text-emerald-400">A Favor (SÍ)</span><span>{datos.puntos[puntoActivo]?.si || 0}%</span></div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800"><motion.div initial={{ width: 0 }} animate={{ width: `${datos.puntos[puntoActivo]?.si || 0}%` }} className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" /></div>
                </div>
                <div>
                  <div className="flex justify-between text-3xs font-bold mb-1"><span className="text-rose-400">En Contra (NO)</span><span>{datos.puntos[puntoActivo]?.no || 0}%</span></div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800"><motion.div initial={{ width: 0 }} animate={{ width: `${datos.puntos[puntoActivo]?.no || 0}%` }} className="bg-gradient-to-r from-rose-500 to-pink-400 h-full rounded-full" /></div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button" onClick={handleAvanzarFlujoPunto}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-3xs font-black uppercase tracking-widest border transition-all ${datos.puntos[puntoActivo]?.estado === 'Debatiendo' || datos.puntos[puntoActivo]?.estado === 'Pendiente' ? 'bg-amber-600 border-amber-500 text-white' :
                    datos.puntos[puntoActivo]?.estado === 'Votando' ? 'bg-blue-600 border-blue-500 text-white animate-pulse' : 'bg-slate-900 border-slate-800 text-blue-400 font-bold'
                  }`}
                disabled={datos.puntos[puntoActivo]?.estado === 'Cerrado' && puntoActivo === datos.puntos.length - 1}
              >
                {(datos.puntos[puntoActivo]?.estado === 'Debatiendo' || datos.puntos[puntoActivo]?.estado === 'Pendiente') && '⚡ Abrir Votación Móvil para este Punto'}
                {datos.puntos[puntoActivo]?.estado === 'Votando' && '🔍 Monitorizar Escrutinio en Directo'}
                {datos.puntos[puntoActivo]?.estado === 'Cerrado' && puntoActivo < datos.puntos.length - 1 ? <>Pasar al Siguiente Punto a Tratar <ChevronRight size={14} /></> : ''}
                {datos.puntos[puntoActivo]?.estado === 'Cerrado' && puntoActivo === datos.puntos.length - 1 ? '✓ Todos los puntos del orden cerrados' : ''}
              </button>
            </div>
          </div>
        </section>

        {/* COLUMNA 3: ESPACIO PARA DIARIZACIÓN DE VOZ / TRANSMISIÓN POR IA */}
        <section className="w-full lg:w-80 bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col h-full overflow-hidden shrink-0">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-4">
            <Radio size={16} className={`${escuchandoIA ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`} />
            <h3 className="text-3xs font-black uppercase tracking-widest text-slate-400">Transcripción y Diarización IA</h3>
          </div>
          <div className="flex-grow flex flex-col justify-center items-center text-center p-4 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
            <Radio size={32} className={`mb-2 ${escuchandoIA ? 'text-rose-500 animate-bounce' : 'text-slate-700'}`} />
            <p className="text-4xs text-slate-400 font-medium">Asistente Conversacional Listo</p>
            <button
              onClick={() => setEscuchandoIA(!escuchandoIA)}
              className={`mt-4 px-4 py-2 rounded-xl text-5xs font-black uppercase tracking-wider transition-all border ${escuchandoIA ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
            >
              {escuchandoIA ? 'Detener Audio en Vivo' : 'Iniciar Captura de Sala'}
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}