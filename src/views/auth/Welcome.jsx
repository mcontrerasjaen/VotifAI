import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 antialiased selection:bg-blue-500">
      <div className="w-full max-w-xl text-center space-y-6">
        
        {/* Logotipo Central */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-2">
          <div className="inline-flex items-center gap-3 bg-slate-950 px-6 py-3 rounded-2xl border border-slate-800 shadow-xl">
            <ShieldCheck size={32} className="text-blue-500" />
            <span className="text-3xl font-black tracking-tight text-white">Votif<span className="text-blue-500">AI</span></span>
          </div>
          <p className="text-sm text-slate-400 max-w-sm mx-auto font-medium">
            Plataforma de gobernanza inteligente y votaciones con certificación legal.
          </p>
        </motion.div>

        {/* Selección de Perfiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <motion.button
            whileHover={{ scale: 1.01, y: -2 }} whileActive={{ scale: 0.99 }}
            onClick={() => navigate('/login/comunidad')}
            className="group relative bg-slate-950 border border-slate-800 hover:border-blue-500/50 p-6 rounded-3xl text-left shadow-2xl transition-all flex flex-col justify-between h-48 overflow-hidden"
          >
            <div className="bg-blue-600/10 text-blue-400 p-3 rounded-2xl w-fit border border-blue-500/10"><Users size={22} /></div>
            <div>
              <h3 className="text-base font-black text-white group-hover:text-blue-400 transition-colors">Comunidad de Vecinos</h3>
              <p className="text-2xs text-slate-400 mt-1 leading-snug">Entra a tu junta asignada introduciendo el código de tu convocatoria.</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01, y: -2 }} whileActive={{ scale: 0.99 }}
            onClick={() => navigate('/login/empresa')}
            className="group relative bg-slate-950 border border-slate-800 hover:border-indigo-500/50 p-6 rounded-3xl text-left shadow-2xl transition-all flex flex-col justify-between h-48 overflow-hidden"
          >
            <div className="bg-indigo-600/10 text-indigo-400 p-3 rounded-2xl w-fit border border-indigo-500/10"><Building2 size={22} /></div>
            <div>
              <h3 className="text-base font-black text-white group-hover:text-indigo-400 transition-colors">Área Corporativa</h3>
              <p className="text-2xs text-slate-400 mt-1 leading-snug">Acceso privado para socios comerciales, accionistas y consejeros delegados.</p>
            </div>
          </motion.button>
        </div>

        {/* BANNER INFERIOR DE REGISTRO AUTÓNOMO SAAS */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-left"
        >
          <div>
            <h4 className="text-xs font-bold text-white">¿Quieres dar de alta tu propia Organización?</h4>
            <p className="text-3xs text-slate-400 mt-0.5">Crea tu cuenta profesional para dar cobertura a tus propias carteras de clientes.</p>
          </div>
          <button 
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-blue-400 border border-slate-800 text-2xs font-bold px-4 py-2 rounded-xl transition-all whitespace-nowrap active:scale-98"
          >
            Registrar mi Despacho
          </button>
        </motion.div>

        <p className="text-4xs text-slate-500 tracking-widest uppercase flex items-center justify-center gap-1 pt-2">
          <ShieldCheck size={10} /> Entorno de gobernanza digital securizado
        </p>
      </div>
    </div>
  );
}