import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Radio, FileText, BarChart3, PieChart, Plus, Vote, ChevronRight, Timer, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [mercado, setMercado] = useState('comunidad'); 
  const [puntoActivo, setPuntoActivo] = useState(0);
  const [escuchandoIA, setEscuchandoIA] = useState(false);
  
  const [nuevoPuntoTexto, setNuevoPuntoTexto] = useState('');
  const [mostrarFormularioPunto, setMostrarFormularioPunto] = useState(false);

  // ESTADO PARA SABER QUÉ TARJETAS ESTÁN EXPANDIDAS EN LA BARRA LATERAL
  const [puntosExpandidos, setPuntosExpandidos] = useState({ 0: true }); // El primer punto arranca abierto por defecto
  const [mostrarModalConvocatoria, setMostrarModalConvocatoria] = useState(false);

  // ESTADOS DEL MODAL DE CRONÓMETRO EN DIRECTO
  const [mostrarModalVoto, setMostrarModalVoto] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(60);
  const [votosRegistrados, setVotosRegistrados] = useState(0);
  const totalAsistentesSala = 48; 

  // SIMULADOR DE CUENTA ATRÁS
  useEffect(() => {
    let cronometro; let simuladorVotos;
    if (mostrarModalVoto && tiempoRestante > 0 && votosRegistrados < totalAsistentesSala) {
      cronometro = setInterval(() => setTiempoRestante(prev => prev - 1), 1000);
      simuladorVotos = setInterval(() => {
        setVotosRegistrados(prev => {
          const nuevosVotos = prev + Math.floor(Math.random() * 3) + 1;
          return nuevosVotos > totalAsistentesSala ? totalAsistentesSala : nuevosVotos;
        });
      }, 800);
    }
    return () => { clearInterval(cronometro); clearInterval(simuladorVotos); };
  }, [mostrarModalVoto, tiempoRestante, votosRegistrados]);

  // BASE DE DATOS DE PUNTOS DE LA ASAMBLEA
  const [juntasData, setJuntasData] = useState({
    comunidad: {
      entidad: "C.P. Paseo de la Castellana 42, Madrid",
      convocatoria: "Junta General Extraordinaria",
      cuorum: "74.20%",
      subCuorum: "48 de 62 propietarios en sala",
      coeficiente: "7.420 / 10.000",
      puntos: [
        { id: 1, t: "Aprobación de la reforma urgente de impermeabilización del tejado, reparación integral de las bajantes de la letra C y consolidación de grietas en la fachada norte por razones de estanqueidad estructural.", si: 0, no: 0, abs: 0, estado: "Debatiendo" },
        { id: 2, t: "Instalación de cámaras de seguridad con grabación 4K continua y sensores de movimiento perimetrales en los tres accesos al garaje comunitario.", si: 0, no: 0, abs: 0, estado: "Pendiente" },
        { id: 3, t: "Renovación del contrato de mantenimiento técnico del ascensor principal con la empresa Otis, incluyendo cobertura de piezas de desgaste 24/7.", si: 0, no: 0, abs: 0, estado: "Pendiente" }
      ]
    },
    empresa: {
      entidad: "Inversiones Tecnológicas VotifAI S.A.",
      convocatoria: "Junta General de Accionistas 2026",
      cuorum: "89.55%",
      subCuorum: "Capital Social verificado con derecho a voto",
      coeficiente: "1.245.000 €",
      puntos: [
        { id: 1, t: "Aprobación de la ampliación de capital Serie A por valor de 400.000€ mediante la emisión de nuevas acciones preferentes de clase B.", si: 0, no: 0, abs: 0, estado: "Debatiendo" },
        { id: 2, t: "Cese y nombramiento de los miembros del Consejo de Administración y fijación de la retribución anual del comité ejecutivo.", si: 0, no: 0, abs: 0, estado: "Pendiente" }
      ]
    }
  });

  const datos = juntasData[mercado];

  const handleAñadirPunto = (e) => {
    e.preventDefault();
    if (!nuevoPuntoTexto.trim()) return;
    const nuevosPuntos = [...datos.puntos, { id: datos.puntos.length + 1, t: nuevoPuntoTexto, si: 0, no: 0, abs: 0, estado: "Pendiente" }];
    setJuntasData({ ...juntasData, [mercado]: { ...datos, puntos: nuevosPuntos } });
    setNuevoPuntoTexto(''); setMostrarFormularioPunto(false); setPuntoActivo(nuevosPuntos.length - 1);
  };

  const handleAvanzarFlujoPunto = () => {
    const punto = datos.puntos[puntoActivo];
    if (punto.estado === 'Debatiendo' || punto.estado === 'Pendiente') {
      setTiempoRestante(60); setVotosRegistrados(0); setMostrarModalVoto(true);
      const puntosActualizados = datos.puntos.map((p, idx) => idx === puntoActivo ? { ...p, estado: 'Votando' } : p);
      setJuntasData({ ...juntasData, [mercado]: { ...datos, puntos: puntosActualizados } });
      return;
    }
    if (punto.estado === 'Cerrado' && puntoActivo < datos.puntos.length - 1) {
      const sigIdx = puntoActivo + 1;
      setPuntoActivo(sigIdx);
      // Expandimos automáticamente el nuevo punto al saltar a él
      setPuntosExpandidos(prev => ({ ...prev, [sigIdx]: true }));
    }
  };

  const handleClausurarEscrutinioManual = () => {
    setMostrarModalVoto(false);
    const puntosActualizados = datos.puntos.map((p, idx) => idx === puntoActivo ? { ...p, estado: 'Cerrado', si: 68, no: 22, abs: 10 } : p);
    if (puntoActivo < datos.puntos.length - 1) puntosActualizados[puntoActivo + 1].estado = 'Debatiendo';
    setJuntasData({ ...juntasData, [mercado]: { ...datos, puntos: puntosActualizados } });
  };

  // FUNCIÓN PARA CONMUTAR LA EXPANSIÓN INDIVIDUAL DE UNA CARD
  const toggleExpandirTarjeta = (index) => {
    setPuntosExpandidos(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col h-screen overflow-hidden relative">
      
      {/* NAV SUPERIOR PANORÁMICO */}
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
            <button onClick={() => { setMarket('comunidad'); setPuntoActivo(0); }} className={`px-3 py-1 rounded-md text-3xs font-black uppercase tracking-wider transition-all ${mercado === 'comunidad' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Fincas</button>
            <button onClick={() => { setMarket('empresa'); setPuntoActivo(0); }} className={`px-3 py-1 rounded-md text-3xs font-black uppercase tracking-wider transition-all ${mercado === 'empresa' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Empresas</button>
          </div>
        </div>
      </nav>

      {/* CUERPO TRES COLUMNAS PANORÁMICO */}
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden p-4 gap-4">
        
        {/* COLUMNA 1: GESTIÓN DEL ORDEN DEL DÍA CON CARDS AUTO-EXPANDIBLES */}
        <aside className="w-full lg:w-96 bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col h-full overflow-hidden shrink-0">
          <div className="flex justify-between items-center mb-3 shrink-0">
            <h2 className="text-3xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Vote size={14} className="text-blue-500" /> Puntos a Tratar ({datos.puntos.length})</h2>
            <button onClick={() => setMostrarFormularioPunto(!mostrarFormularioPunto)} className={`p-1 rounded-md border transition-colors ${mostrarFormularioPunto ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}><Plus size={12} /></button>
          </div>

          <AnimatePresence>
            {mostrarFormularioPunto && (
              <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={handleAñadirPunto} className="bg-slate-950 border border-slate-800 p-3 rounded-xl mb-3 space-y-2 overflow-hidden shrink-0">
                <textarea required placeholder="Ej: Renovación del servicio de conserjería..." value={nuevoPuntoTexto} onChange={(e) => setNuevoPuntoTexto(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-4xs text-slate-200 focus:outline-none resize-none h-12" />
                <div className="flex gap-2 justify-end"><button type="button" onClick={() => setMostrarFormularioPunto(false)} className="text-5xs font-bold text-slate-500">Cancelar</button><button type="submit" className="bg-blue-600 text-white text-5xs font-black px-3 py-1 rounded-md">Incluir</button></div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* LISTADO DE PUNTOS CON ACORDEÓN DINÁMICO */}
          <div className="space-y-2.5 overflow-y-auto flex-grow pr-1 custom-scrollbar">
            {datos.puntos.map((punto, index) => {
              const estaExpandido = !!puntosExpandidos[index];
              const esElActivo = index === puntoActivo;
              
              return (
                <div 
                  key={punto.id}
                  className={`w-full rounded-xl border transition-all flex flex-col overflow-hidden ${
                    esElActivo ? 'bg-blue-600/10 border-blue-500 shadow-lg' : 'bg-slate-950 border-slate-900'
                  }`}
                >
                  {/* CABECERA DE LA CARD (Siempre visible y clickeable) */}
                  <div 
                    onClick={() => { setPuntoActivo(index); }}
                    className="p-3 flex justify-between items-start gap-2 cursor-pointer select-none"
                  >
                    <div className="text-3xs font-bold text-slate-200 line-clamp-1 flex-grow">
                      {punto.id}. {punto.t}
                    </div>
                    {/* Botón interactivo de despliegue */}
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleExpandirTarjeta(index); }}
                      className="text-slate-500 hover:text-white p-0.5 rounded transition-colors bg-slate-900 border border-slate-850 shrink-0"
                    >
                      {estaExpandido ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>

                  {/* ⚡ CAJÓN INTEGRADO INFERIOR (TEXTO EXTENDIDO ANIMADO) ⚡ */}
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

                  {/* SUB-PIE DE LA CARD */}
                  <div className="px-3 pb-2.5 pt-1.5 flex justify-between items-center text-5xs font-black uppercase tracking-wider bg-slate-950/20 border-t border-slate-900/20 shrink-0">
                    <span className={esElActivo ? 'text-blue-400' : 'text-slate-600'}>EXP-00{punto.id}</span>
                    <span className={`px-2 py-0.5 rounded font-black ${punto.estado === 'Votando' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' : punto.estado === 'Debatiendo' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : punto.estado === 'Cerrado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 text-slate-500'}`}>{punto.estado}</span>
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
              <h3 className="text-3xs font-black uppercase tracking-widest text-slate-400">Recuento de Voto Consolidados — Tema {datos.puntos[puntoActivo].id}</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-3xs font-bold mb-1"><span className="text-emerald-400">A Favor (SÍ)</span><span>{datos.puntos[puntoActivo].si}%</span></div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800"><motion.div initial={{ width: 0 }} animate={{ width: `${datos.puntos[puntoActivo].si}%` }} className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" /></div>
                </div>
                <div>
                  <div className="flex justify-between text-3xs font-bold mb-1"><span className="text-rose-400">En Contra (NO)</span><span>{datos.puntos[puntoActivo].no}%</span></div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800"><motion.div initial={{ width: 0 }} animate={{ width: `${datos.puntos[puntoActivo].no}%` }} className="bg-gradient-to-r from-rose-500 to-pink-400 h-full rounded-full" /></div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button" onClick={handleAvanzarFlujoPunto}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-3xs font-black uppercase tracking-widest border transition-all ${
                  datos.puntos[puntoActivo].estado === 'Debatiendo' || datos.puntos[puntoActivo].estado === 'Pendiente' ? 'bg-amber-600 border-amber-500 text-white' : 
                  datos.puntos[puntoActivo].estado === 'Votando' ? 'bg-blue-600 border-blue-500 text-white animate-pulse' : 'bg-slate-900 border-slate-800 text-blue-400 font-bold'
                }`}
                disabled={datos.puntos[puntoActivo].estado === 'Cerrado' && puntoActivo === datos.puntos.length - 1}
              >
                {datos.puntos[puntoActivo].estado === 'Debatiendo' || datos.puntos[puntoActivo].estado === 'Pendiente' ? '⚡ Abrir Votación Móvil para este Punto' : ''}
                {datos.puntos[puntoActivo].estado === 'Votando' ? '🔍 Monitorizar Escrutinio en Directo' : ''}
                {datos.puntos[puntoActivo].estado === 'Cerrado' && puntoActivo < datos.puntos.length - 1 ? <>Pasar al Siguiente Punto a Tratar <ChevronRight size={14} /></> : ''}
                {datos.puntos[puntoActivo].estado === 'Cerrado' && puntoActivo === datos.puntos.length - 1 ? '✓ Todos los puntos del orden cerrados' : ''}
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-900 shrink-0">
            <button onClick={() => navigate('/acta-ia')} className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold py-3 rounded-xl text-3xs uppercase tracking-widest shadow-lg active:scale-99">
              🛑 Finalizar Junta y Procesar Acta Oficial por IA
            </button>
          </div>
        </section>

        {/* COLUMNA 3: COGNICIÓN IA */}
        <aside className="w-full lg:w-80 bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col h-full overflow-hidden shrink-0 justify-between">
          <div className="flex flex-col flex-grow overflow-hidden">
            <div className="mb-2"><h2 className="text-3xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><FileText size={14} className="text-purple-500" /> Transcripción Activa</h2></div>
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 font-mono text-4xs space-y-2.5 flex-grow overflow-y-auto custom-scrollbar my-2">
              <p className="text-slate-600">[Punto {datos.puntos[puntoActivo].id}]: {datos.puntos[puntoActivo].estado}.</p>
              {datos.puntos[puntoActivo].estado === 'Debatiendo' && <p className="text-purple-400 animate-pulse font-bold">● IA extrayendo argumentos del debate de sala...</p>}
            </div>
          </div>
          <button type="button" onClick={() => setEscuchandoIA(!escuchandoIA)} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-3xs font-bold uppercase tracking-wider border transition-all ${escuchandoIA ? 'bg-purple-950 text-purple-400 border-purple-800' : 'bg-slate-950 text-slate-400 border-slate-800'}`}>{escuchandoIA ? 'Pausar Escucha IA' : 'Activar Grabación'}</button>
        </aside>

      </div>

      {/* ========================================================================================= */}
      {/* 📄 MODAL: DOCUMENTO COMPLETO DE LA CONVOCATORIA (MANTENIDO INTEGRAL) 🚨 */}
      {/* ========================================================================================= */}
      <AnimatePresence>
        {mostrarModalConvocatoria && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl space-y-5 shadow-2xl flex flex-col max-h-[85vh]">
              <div className="border-b border-slate-800 pb-3 shrink-0">
                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5"><FileText size={14} className="text-blue-500" /> Documento Matriz de la Convocatoria Oficial</h3>
                <p className="text-5xs text-slate-500 mt-0.5 uppercase tracking-wider">{datos.convocatoria} — {datos.entidad}</p>
              </div>
              <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl text-3xs font-sans text-slate-300 leading-relaxed overflow-y-auto custom-scrollbar flex-grow space-y-4">
                <div className="text-center font-bold text-white uppercase border-b border-slate-900 pb-2">ORDEN DEL DÍA DE LA ASAMBLEA</div>
                {datos.puntos.map((punto) => (
                  <div key={punto.id} className="p-3 bg-slate-900/40 rounded-xl border border-slate-900/60 space-y-1">
                    <div className="font-black text-blue-400 uppercase tracking-wider text-4xs">PUNTO NÚMERO {punto.id}:</div>
                    <p className="text-slate-200 font-medium">{punto.t}</p>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setTemplateModalConvocatoria || setMostrarModalConvocatoria(false)} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-3xs uppercase tracking-widest hover:bg-blue-500 transition-colors shrink-0">Cerrar Convocatoria</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL CRONOMETRO DE VOTO (MANTENIDO) */}
      <AnimatePresence>
        {mostrarModalVoto && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-xl space-y-6 shadow-2xl">
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div><span className="text-4xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1 w-fit"><Radio size={10} className="animate-pulse" /> Escrutinio en Curso</span><h3 className="text-sm font-black text-white mt-1.5 line-clamp-1 pr-6">Punto {datos.puntos[puntoActivo].id}: {datos.puntos[puntoActivo].t}</h3></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border flex items-center gap-4 ${tiempoRestante <= 10 ? 'bg-rose-500/5 border-rose-500/30' : 'bg-slate-950 border-slate-800'}`}><div className={`p-3 rounded-xl ${tiempoRestante <= 10 ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-600/10 text-blue-400'}`}><Timer size={24} /></div><div><span className="text-5xs font-bold text-slate-500 uppercase tracking-widest block">Límite</span><div className={`text-2xl font-black font-mono ${tiempoRestante <= 10 ? 'text-rose-500' : 'text-white'}`}>00:{tiempoRestante < 10 ? `0${tiempoRestante}` : tiempoRestante}</div></div></div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center gap-4"><div className="bg-emerald-600/10 text-emerald-400 p-3 rounded-xl"><Users size={24} /></div><div><span className="text-5xs font-bold text-slate-500 uppercase tracking-widest block">Pendientes</span><div className="text-2xl font-black font-mono text-white">{totalAsistentesSala - votosRegistrados} <span className="text-4xs font-normal text-slate-500">/ {totalAsistentesSala}</span></div></div></div>
              </div>
              <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800"><div className="flex justify-between items-center text-4xs font-bold uppercase tracking-wider"><span className="text-slate-400">Participación en Directo</span><span className="text-blue-400">{Math.round((votosRegistrados / totalAsistentesSala) * 100)}%</span></div><div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800"><motion.div animate={{ width: `${(votosRegistrados / totalAsistentesSala) * 100}%` }} className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" /></div></div>
              <div className="flex gap-3 pt-2"><div className="text-5xs text-slate-500 flex gap-2 items-center leading-normal max-w-xs"><AlertCircle size={16} /> El cierre consolidará las mayorías de la asamblea.</div><button type="button" onClick={handleClausurarEscrutinioManual} className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black py-3 rounded-xl text-3xs uppercase tracking-widest shadow-lg">🔒 Cerrar Urna y Fijar Escrutinio</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}