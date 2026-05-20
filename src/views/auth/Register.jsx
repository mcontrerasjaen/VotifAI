import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Building2, Users, ArrowRight, Mail, Lock, CheckCircle } from 'lucide-react';
import { useVotifaiStore } from '../../store.jsx';

export default function Register() {
  const navigate = useNavigate();
  const [tipoOrganizacion, setTipoOrganizacion] = useState('administrador'); // 'administrador' o 'empresa'
  const [nombreEntidad, setNombreEntidad] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState('pro'); // 'basic' o 'pro'

  const handleRegister = (e) => {
    e.preventDefault();
    console.log("Inicializando nuevo Tenant en VotifAI:", {
      tipoOrganizacion,
      nombreEntidad,
      email,
      plan
    });
    // Al registrarse, el sistema le concede acceso directo a su Hub privado
    navigate('/hub');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 antialiased">
      
      {/* Botón Flotante Volver */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 text-xs text-slate-400 hover:text-white font-bold transition-colors bg-slate-950 px-4 py-2 rounded-xl border border-slate-800"
      >
        ← Volver
      </button>

      <div className="w-full max-w-2xl bg-slate-950 rounded-3xl shadow-2xl overflow-hidden border border-slate-800/80 grid grid-cols-1 md:grid-cols-12">
        
        {/* COLUMNA IZQUIERDA: BENEFICIOS (5 Columnas) */}
        <div className="md:col-span-5 bg-gradient-to-br from-blue-600 to-indigo-900 p-6 flex flex-col justify-between text-white border-b md:border-b-0 md:border-r border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={24} className="text-blue-200" />
              <span className="text-xl font-black tracking-tight">Votif<span className="text-blue-300">AI</span></span>
            </div>
            <h2 className="text-sm font-bold mt-4 leading-tight">Digitaliza la gobernanza de tu organización.</h2>
            <p className="text-4xs text-blue-100/70 mt-2 leading-relaxed">
              Activa tu espacio multi-inquilino privado en un par de clics. Gestiona votos cruzados y redacta actas automáticas con Inteligencia Artificial.
            </p>
          </div>

          <div className="space-y-2 mt-6 md:mt-0 text-4xs border-t border-white/10 pt-4 font-medium text-blue-100/90">
            <div className="flex items-center gap-2"><CheckCircle size={12} className="text-emerald-400" /> Cumplimiento LPH y LSC</div>
            <div className="flex items-center gap-2"><CheckCircle size={12} className="text-emerald-400" /> Actas por IA automatizadas</div>
            <div className="flex items-center gap-2"><CheckCircle size={12} className="text-emerald-400" /> Encriptación de voto AES-256</div>
          </div>
        </div>

        {/* COLUMNA DERECHA: FORMULARIO (7 Columnas) */}
        <form onSubmit={handleRegister} className="md:col-span-7 p-6 space-y-4 flex flex-col justify-center">
          <div>
            <h1 className="text-base font-black text-white">Registro de Organización</h1>
            <p className="text-3xs text-slate-400 mt-0.5">Configura las credenciales de tu suscripción SaaS.</p>
          </div>

          {/* SELECTOR DE PERFIL PROFESIONAL */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setTipoOrganizacion('administrador')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 text-3xs font-bold rounded-lg transition-all uppercase tracking-wider ${tipoOrganizacion === 'administrador' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Users size={12} /> Admin. Fincas
            </button>
            <button
              type="button"
              onClick={() => setTipoOrganizacion('empresa')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 text-3xs font-bold rounded-lg transition-all uppercase tracking-wider ${tipoOrganizacion === 'empresa' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Building2 size={12} /> Corporación
            </button>
          </div>

          {/* INPUTS DE RECOPILACIÓN */}
          <div className="space-y-3">
            <div>
              <label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                {tipoOrganizacion === 'administrador' ? 'Nombre del Despacho de Administración' : 'Razón Social / Nombre de Empresa'}
              </label>
              <input
                type="text" required placeholder="Ej: Fincas Castellana S.L." value={nombreEntidad}
                onChange={(e) => setNombreEntidad(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email Maestro del Administrador</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-500" size={14} />
                <input
                  type="email" required placeholder="gestion@votifai.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1">Contraseña de Control de Cuenta</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-500" size={14} />
                <input
                  type="password" required placeholder="••••••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* OPCIONES DE MONETIZACIÓN INTEGRADA */}
          <div>
            <label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Selecciona tu Tarifa SaaS</label>
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => setPlan('basic')}
                className={`p-3 bg-slate-900 rounded-xl border cursor-pointer transition-all ${plan === 'basic' ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 hover:border-slate-700'}`}
              >
                <div className="text-4xs font-bold text-white">Plan Flexible</div>
                <div className="text-xs font-black text-slate-200 mt-0.5">19€<span className="text-4xs font-normal text-slate-500"> / junta</span></div>
              </div>
              <div 
                onClick={() => setPlan('pro')}
                className={`p-3 bg-slate-900 rounded-xl border cursor-pointer transition-all ${plan === 'pro' ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 hover:border-slate-700'}`}
              >
                <div className="text-4xs font-bold text-blue-400">Plan Premium Ilimitado 🔥</div>
                <div className="text-xs font-black text-slate-200 mt-0.5">149€<span className="text-4xs font-normal text-slate-500"> / mes</span></div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all mt-3 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10 active:scale-98"
          >
            Dar de alta mi Organización <ArrowRight size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}