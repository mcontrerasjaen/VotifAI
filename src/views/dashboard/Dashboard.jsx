import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Users, Radio, FileText, BarChart3, PieChart, Plus, Vote, ChevronRight, Timer, AlertCircle, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
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

  const [datosAdmin, setDatosAdmin] = useState(null);
  const [fincasReales, setFincasReales] = useState([]);
  const [fincaSeleccionada, setFincaSeleccionada] = useState(null);
  const [cargandoFincas, setCargandoFincas] = useState(true);

  const [transcripcionesIA, setTranscripcionesIA] = useState([]);

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

  // ⏱️ EFECTO CRONÓMETRO: Activa la cuenta atrás de 60s si el punto actual está "Votando"
  useEffect(() => {
    let intervalo = null;
    const puntoActual = juntasData['comunidad']?.puntos[puntoActivo];

    if (puntoActual?.estado === 'Votando' && tiempoRestante > 0) {
      intervalo = setInterval(() => {
        // 1. Reducimos el cronómetro un segundo
        setTiempoRestante((prev) => prev - 1);

        // 2. Simulamos la llegada de nuevos terminales móviles votando
        setVotosRegistrados((prev) => Math.min(prev + Math.floor(Math.random() * 3) + 1, totalAsistentesSala));

        // 3. Incrementamos los porcentajes de SÍ y NO de forma fluida y asíncrona
        setJuntasData((prevData) => {
          const puntosModificados = prevData['comunidad'].puntos.map((p, idx) => {
            if (idx === puntoActivo) {
              // Incrementamos un pequeño porcentaje aleatorio cuidando de no pasarnos del total
              const incrementoSi = Math.random() > 0.4 ? Math.floor(Math.random() * 3) + 1 : 0;
              const incrementoNo = Math.random() > 0.6 ? Math.floor(Math.random() * 2) + 1 : 0;

              const nuevoSi = Math.min((p.si || 0) + incrementoSi, 75); // Límite simulado para la demo
              const nuevoNo = Math.min((p.no || 0) + incrementoNo, 25);

              return { ...p, si: nuevoSi, no: nuevoNo };
            }
            return p;
          });
          return { ...prevData, comunidad: { ...prevData['comunidad'], puntos: puntosModificados } };
        });

      }, 1000);
    } else if (tiempoRestante === 0 && puntoActual?.estado === 'Votando') {
      // 🔒 Clausura automática y fijación de resultados definitivos al llegar a 0s
      handleClausurarEscrutinioManual();
    }

    return () => clearInterval(intervalo);
  }, [tiempoRestante, puntoActivo, juntasData]);

  useEffect(() => {
    let intervaloIA = null;

    // Diccionario de frases realistas según el punto activo de la junta
    const bibliotecaFrases = {
      0: [
        { ponente: "Presidente (Manuel C.)", texto: "La fachada norte tiene filtraciones graves y si no impermeabilizamos ya, la LPH nos puede hacer responsables subsidiarios por daños estructurales." },
        { ponente: "Vecino 1ºB (Carmen O.)", texto: "Yo estoy de acuerdo con el Presidente, en mi salón ya hay humedades por culpa de las bajantes de la letra C. Hay que arreglarlo con urgencia." },
        { ponente: "Vecino 2ºA (Carlos R.)", texto: "¿Pero se han pedido al menos tres presupuestos diferentes? No podemos aprobar la primera derrama que nos pongan sobre la mesa." }
      ],
      1: [
        { ponente: "Presidente (Manuel C.)", texto: "Pasamos al tema de las cámaras de seguridad para el garaje. Últimamente ha habido robos y con sensores perimetrales 4K estaríamos blindados." },
        { ponente: "Vecino 3ºA (Antonio L.)", texto: "A mí me preocupa la ley de protección de datos. ¿Quién va a custodiar esas grabaciones continuas? Necesitamos garantías jurídicas." },
        { ponente: "Vecino 1ºC (Juan P.)", texto: "Con que se guarden de forma encriptada 30 días y solo tenga acceso el administrador bajo denuncia es totalmente legal, yo voto que sí." }
      ],
      // 🆕 CASO 99: Turno Abierto de Ruegos y Preguntas al finalizar la junta
      99: [
        { ponente: "Vecino 4ºB (Laura S.)", texto: "Me gustaría solicitar formalmente que en la próxima junta ordinaria se trate el tema de pintar los descansillos de las plantas impares, que están muy deteriorados." },
        { ponente: "Vecino 1ºA (Manuel P.)", texto: "Yo quiero dejar constancia de quejas por ruidos en el patio interior los fines de semana a deshoras. Ruego se envíe un comunicado circular de recordatorio normativo." },
        { ponente: "Presidente (Manuel C.)", texto: "Tomamos nota de ambos ruegos en el borrador del acta. Si no hay más intervenciones de los vecinos censados, levantamos la sesión." }
      ]
    };

    if (escuchandoIA) {
      let indiceFrase = 0;
      const todosLosPuntosCerrados = juntasData['comunidad']?.puntos.every(p => p.estado === 'Cerrado');

      const frasesDisponibles = todosLosPuntosCerrados
        ? bibliotecaFrases[99]
        : (bibliotecaFrases[puntoActivo] || [
          { ponente: "Presidente", texto: "Se abre el turno de intervenciones libres para debatir el punto actual del orden del día." }
        ]);

      setTranscripcionesIA([]);

      intervaloIA = setInterval(() => {
        if (indiceFrase < frasesDisponibles.length && frasesDisponibles[indiceFrase]) {
          const fraseValida = frasesDisponibles[indiceFrase];

          setTranscripcionesIA((prev) => [...prev, fraseValida]);
          indiceFrase++;
        } else {
          clearInterval(intervaloIA);
          console.log("🎙️ [VotifAI IA] Cola de diarización de ruegos completada.");
        }
      }, 3500);
    } else {
      setTranscripcionesIA([]);
    }

    return () => {
      if (intervaloIA) clearInterval(intervaloIA);
    };
  }, [escuchandoIA, puntoActivo, juntasData]);

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

        {/* COLUMNA 2: MONITOR CENTRAL (Estructura Limpia y Temporizador Corregido) */}
        <section className="flex-grow bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col h-full overflow-hidden justify-between">
          <div className="space-y-5 overflow-y-auto flex-grow pr-1 custom-scrollbar">

            {/* CABECERA DE LA CONVOCATORIA */}
            <div className="border-b border-slate-900 pb-4">
              <span className="text-4xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{datos.convocatoria}</span>
              <h2 className="text-base font-black text-white mt-1">{datos.entidad}</h2>
            </div>

            {/* CONTADORES DE CUÓRUM Y COEFICIENTES */}
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

            {/* PANEL ANALÍTICO DE ESCRUTINIO + TEMPORIZADOR INTEGRADO */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-900 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <h3 className="text-3xs font-black uppercase tracking-widest text-slate-400">
                  Recuento de Voto Consolidados — Tema {datos.puntos[puntoActivo]?.id}
                </h3>

                {/* ⏱️ RELOJ REGRESIVO DINÁMICO CON CIERRE MANUAL ANTICIPADO */}
                {datos.puntos[puntoActivo]?.estado === 'Votando' ? (
                  <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg animate-fade-in">
                    <div className="flex items-center gap-1.5 animate-pulse">
                      <Timer size={12} className="text-amber-400" />
                      <span className="text-4xs font-mono font-black text-amber-400 uppercase tracking-widest">
                        Cierre en: <span className="text-white text-3xs font-bold">{tiempoRestante}s</span>
                      </span>
                    </div>

                    {/* 🆕 BOTÓN DE CLAUSURA ANTICIPADA EN CALIENTE */}
                    <button
                      type="button"
                      onClick={() => {
                        // Forzamos el cierre inmediato del escrutinio en Neon/Zustand
                        handleClausurarEscrutinioManual();
                        console.log("⏱️ [VotifAI] Cierre manual anticipado activado por el Administrador.");
                      }}
                      className="text-[9px] font-black bg-amber-500 hover:bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md uppercase tracking-wider transition-all active:scale-95 shadow shadow-amber-500/20"
                      title="Forzar cierre del escrutinio ahora"
                    >
                      Forzar Cierre
                    </button>
                  </div>
                ) : datos.puntos[puntoActivo]?.estado === 'Cerrado' ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
                    <span className="text-4xs font-mono font-black text-emerald-400 uppercase tracking-widest">
                      ✓ Escrutinio Clausurado
                    </span>
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
                    <span className="text-4xs font-mono font-black text-slate-500 uppercase tracking-widest">
                      Esperando Apertura
                    </span>
                  </div>
                )}
              </div>

              {/* BARÓMETRO DE PARTICIPACIÓN EN TIEMPO REAL */}
              {datos.puntos[puntoActivo]?.estado === 'Votando' && (
                <div className="flex justify-between items-center text-[10px] bg-slate-900/40 p-2.5 rounded-lg border border-slate-900/60 font-medium text-slate-400">
                  <span className="flex items-center gap-1.5"><Users size={11} className="text-blue-400" /> Terminales Móviles Emitiendo Voto:</span>
                  <span className="font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {votosRegistrados} / {totalAsistentesSala} Propietarios
                  </span>
                </div>
              )}

              {/* BARRAS DE PROGRESO DE VOTACIÓN (Limpias y Unificadas) */}
              <div className="space-y-4 pt-1">
                <div>
                  <div className="flex justify-between text-3xs font-bold mb-1">
                    <span className="text-emerald-400">A Favor (SÍ)</span>
                    <span className="font-mono">{datos.puntos[puntoActivo]?.si || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${datos.puntos[puntoActivo]?.si || 0}%` }}
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-3xs font-bold mb-1">
                    <span className="text-rose-400">En Contra (NO)</span>
                    <span className="font-mono">{datos.puntos[puntoActivo]?.no || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${datos.puntos[puntoActivo]?.no || 0}%` }}
                      className="bg-gradient-to-r from-rose-500 to-pink-400 h-full rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 🆕 BOTÓN DINÁMICO DE CONTROL DE FLUJO Y APERTURA DE RUEGOS */}
           <div className="pt-2 flex gap-3 items-end w-full">
              
              {/* Contenedor Izquierdo Dinámico: Conmuta entre el flujo paso a paso y la fase final de Ruegos */}
              <div className="flex-grow">
                {juntasData['comunidad']?.puntos.every(p => p.estado === 'Cerrado') ? (
                  /* ========================================================================= */
                  /* FASE FINAL: TODOS LOS PUNTOS CERRADOS -> APERTURA DE RUEGOS Y PREGUNTAS   */
                  /* ========================================================================= */
                  <div className="space-y-3 animate-fade-in w-full">
                    <div className="p-4 border border-dashed border-indigo-500/30 bg-indigo-500/5 rounded-xl flex items-center gap-3">
                      <Radio size={18} className="text-indigo-400 animate-pulse shrink-0" />
                      <div className="space-y-0.5">
                        <span className="block text-[9px] font-black text-indigo-400 uppercase tracking-widest">Fase de Asamblea Activa</span>
                        <p className="text-4xs text-slate-400 font-medium">
                          Escrutinio completado. Micrófonos abiertos de forma legal para el turno general de **Ruegos y Preguntas**.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        alert("✓ Acta de la Junta Extraordinaria sellada con HASH SHA-256 de forma vinculante. Enviando PDF certificado a los correos de los propietarios.");
                        navigate('/hub');
                      }}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-3xs font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/10 active:scale-98"
                    >
                      ✓ Clausurar Asamblea de Propietarios y Redactar Acta por IA
                    </button>
                  </div>
                ) : (
                  /* ========================================================================= */
                  /* FASE DE JUNTA: BOTÓN ORIGINAL DE FLUJO PASO A PASO                        */
                  /* ========================================================================= */
                  <button
                    type="button" onClick={handleAvanzarFlujoPunto}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-3xs font-black uppercase tracking-widest border transition-all ${
                      datos.puntos[puntoActivo]?.estado === 'Debatiendo' || datos.puntos[puntoActivo]?.estado === 'Pendiente' ? 'bg-amber-600 border-amber-500 text-white' :
                      datos.puntos[puntoActivo]?.estado === 'Votando' ? 'bg-blue-600 border-blue-500 text-white animate-pulse' : 'bg-slate-900 border-slate-800 text-blue-400 font-bold'
                    }`}
                  >
                    {(datos.puntos[puntoActivo]?.estado === 'Debatiendo' || datos.puntos[puntoActivo]?.estado === 'Pendiente') && '⚡ Abrir Votación Móvil para este Punto'}
                    {datos.puntos[puntoActivo]?.estado === 'Votando' && '🔍 Monitorizar Escrutinio en Directo'}
                    {datos.puntos[puntoActivo]?.estado === 'Cerrado' && puntoActivo < datos.puntos.length - 1 ? <>Pasar al Siguiente Punto a Tratar <ChevronRight size={14} /></> : ''}
                  </button>
                )}
              </div>

              {/* 🚪 BOTÓN DE RETORNO FIJO SIEMPRE UBICADO ABAJO A LA DERECHA */}
              <button
                type="button"
                onClick={() => navigate('/hub')}
                className="px-4 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-rose-400 rounded-xl text-3xs font-black uppercase tracking-widest transition-all shrink-0 shadow-md active:scale-97 flex items-center gap-1.5 h-[46px]"
                title="Abandonar la sala y volver al panel general de fincas"
              >
                <ArrowLeft size={12} /> Salir de la Sala
              </button>

            </div>

          </div>
        </section>

        {/* COLUMNA 3: CONSOLA DE TRANCRIPCIÓN Y DIARIZACIÓN DE VOZ POR IA */}
        <section className="w-full lg:w-80 bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col h-full overflow-hidden justify-between shrink-0">

          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <Radio size={15} className={`${escuchandoIA ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`} />
              <h3 className="text-3xs font-black uppercase tracking-widest text-slate-400">Transcripción e IA</h3>
            </div>
            {escuchandoIA && (
              <span className="text-[8px] font-mono bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded animate-pulse uppercase tracking-wider">
                ● LIVE REC
              </span>
            )}
          </div>

          {/* VISOR FLUJO EN VIVO DE INTERVENCIONES */}
          <div className="flex-grow overflow-y-auto pr-1 custom-scrollbar space-y-3 mb-4 min-h-[250px]">
            {transcripcionesIA.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-4 border border-dashed border-slate-800/60 rounded-xl bg-slate-950/20">
                <Radio size={28} className={`mb-2 ${escuchandoIA ? 'text-rose-500 animate-bounce' : 'text-slate-700'}`} />
                <p className="text-4xs text-slate-400 font-medium">Asistente Conversacional Listo</p>
                <p className="text-[9px] text-slate-600 mt-1 max-w-[150px]">Pulsa el capturador inferior para aislar las intervenciones de la sala.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {transcripcionesIA.map((dialogo, idx) => (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={idx}
                    className="p-2.5 bg-slate-950 border border-slate-900 rounded-xl space-y-1 shadow-sm"
                  >
                    <div className="flex justify-between items-center text-[9px] font-black text-indigo-400 font-mono tracking-wide uppercase">
                      <span>🎙️ {dialogo.ponente}</span>
                      <span className="text-slate-600 font-normal">Sincronizado</span>
                    </div>
                    <p className="text-4xs text-slate-300 leading-relaxed font-medium">
                      "{dialogo.texto}"
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* BOTÓN MAESTRO DE CAPTURA DE AUDIO */}
          <div className="shrink-0 border-t border-slate-900 pt-3">
            <button
              onClick={() => setEscuchandoIA(!escuchandoIA)}
              className={`w-full py-3 rounded-xl text-5xs font-black uppercase tracking-widest transition-all border ${escuchandoIA
                ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/10 active:scale-99'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                }`}
            >
              {escuchandoIA ? 'Detener Captura de Sala' : 'Iniciar Captura de Sala'}
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 📄 MODAL UNIFICADO DE CONVOCATORIA OFICIAL (Visor Inteligente Condicional) */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {mostrarModalConvocatoria && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.96, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 12 }}
                className="bg-slate-900 border border-slate-800 w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-4 transition-all"
              >
                {/* Cabecera del Contenedor Unificado */}
                <div className="p-5 border-b border-slate-800/80 bg-slate-950/40 flex justify-between items-center gap-6 shrink-0">
                  <div>
                    <span className="text-[9px] font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                      {fincaSeleccionada?.documento_adjunto ? "Visor de Documento Original Escaneado" : "Desglose Automatizado del Orden del Día"}
                    </span>
                    <h2 className="text-sm font-black text-white mt-1 tracking-tight">
                      Convocatoria Oficial: {datos.convocatoria}
                    </h2>
                    <p className="text-4xs text-slate-500 font-mono mt-0.5 uppercase tracking-wider">
                      Entorno Activo: <span className="text-slate-300 font-bold">{datos.entidad}</span>
                    </p>
                  </div>

                  <div className="bg-slate-950 p-2.5 border border-slate-800 rounded-2xl text-center min-w-[85px] shrink-0 shadow-inner">
                    <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Horario</span>
                    <span className="block text-3xs font-mono font-black text-white mt-0.5">HOY 18:00h</span>
                  </div>
                </div>

                {/* 🛠️ CUERPO CENTRAL INTELIGENTE CONMUTABLE (Todo en un único contenedor) */}
                <div className="flex-grow overflow-y-auto custom-scrollbar p-6 bg-slate-950/10 flex flex-col">

                  {fincaSeleccionada?.documento_adjunto ? (
                    /* ========================================================================= */
                    /* MODO A: EL ADMIN HA SUBIDO EL PDF -> VISOR ORIGINAL A PANTALLA COMPLETA */
                    /* ========================================================================= */
                    <div className="w-full h-full border border-slate-800 rounded-xl overflow-hidden bg-slate-950 flex-grow shadow-inner">
                      <iframe
                        src={`${fincaSeleccionada.documento_adjunto}#toolbar=0&navpanes=0`}
                        className="w-full h-full rounded-xl border-none"
                        title="PDF Convocatoria Original"
                      />
                    </div>
                  ) : (
                    /* ========================================================================= */
                    /* MODO B: SIN PDF -> RENDERIZADO DIGITAL ESTRUCTURADO POR PUNTOS A TRATAR   */
                    /* ========================================================================= */
                    <div className="space-y-4 flex-grow">
                      <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl space-y-1.5 shrink-0">
                        <h4 className="text-3xs font-black uppercase tracking-widest text-slate-400">Notificación Informativa Estándar</h4>
                        <p className="text-4xs text-slate-400 leading-relaxed font-medium">
                          A falta de documento físico escaneado por el despacho administrador, el motor digital de VotifAI expone los puntos legislativos fijados para el escrutinio cruzado ordinario:
                        </p>
                      </div>

                      {/* RECORRIDO DE LAS TARJETAS DE LOS PUNTOS */}
                      <div className="space-y-2.5">
                        {datos.puntos.map((punto) => (
                          <div
                            key={punto.id}
                            className="p-4 bg-slate-950 border border-slate-900 rounded-2xl flex items-start gap-4 hover:border-slate-800 transition-colors"
                          >
                            <span className="text-3xs font-mono font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 w-6 h-6 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                              {punto.id}
                            </span>
                            <div className="space-y-1 flex-grow">
                              <p className="text-3xs text-slate-200 leading-relaxed font-bold">
                                {punto.t}
                              </p>
                              <div className="flex gap-3 text-[9px] font-mono uppercase tracking-widest text-slate-500 font-medium">
                                <span>EXPEDIENTE: EXP-00{punto.id}</span>
                                <span>•</span>
                                <span className={punto.estado === 'Cerrado' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                                  FLUJO: {punto.estado}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Sello criptográfico legal de respaldo */}
                      <div className="border border-slate-850 bg-slate-900/40 p-4 rounded-2xl flex items-center gap-4 mt-2 shrink-0">
                        <Shield size={18} className="text-emerald-500 shrink-0" />
                        <div className="space-y-0.5">
                          <span className="block text-[8px] font-black text-emerald-400 uppercase tracking-widest">Sello Digital de Respaldo HASH-SHA256</span>
                          <p className="text-[10px] font-mono text-slate-500 tracking-tight break-all leading-none">
                            b4e789a1cdcefd2100874e1db8c8a14b3a1a5b8e9c7d6e5f4a3b2c1d0f9e8d7c
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Barra de acciones inferior */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setMostrarModalConvocatoria(false)}
                    className="bg-blue-600 hover:bg-blue-500 border border-blue-500 hover:border-blue-400 text-white text-3xs font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/10 active:scale-98"
                  >
                    Cerrar Convocatoria
                  </button>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}