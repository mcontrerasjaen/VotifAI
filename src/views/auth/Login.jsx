import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, KeyRound, User, Home, Building, Mail, Lock } from 'lucide-react';

export default function Login() {
  const { perfil } = useParams(); 
  const navigate = useNavigate();
  const esComunidad = perfil === 'comunidad';

  // Datos para Comunidad de Vecinos
  const [codigoJunta, setCodigoJunta] = useState('');
  const [nombreVecino, setNombreVecino] = useState('');
  const [pisoPuerta, setPisoPuerta] = useState('');

  // Datos para Área Corporativa
  const [cifEmpresa, setCifEmpresa] = useState('');
  const [emailSocio, setEmailSocio] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (esComunidad) {
      console.log("Datos Vecino:", { codigoJunta, nombreVecino, pisoPuerta });
      navigate('/voto-vecino');
    } else {
      console.log("Datos Socio:", { cifEmpresa, emailSocio, password });
      navigate('/hub'); // Le lleva al Hub SaaS Multi-inquilino
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 antialiased">
      
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs text-slate-400 hover:text-white font-bold transition-colors bg-slate-950 px-4 py-2 rounded-xl border border-slate-800"
      >
        <ArrowLeft size={14} /> Volver
      </button>

      <div className="w-full max-w-md bg-slate-950 rounded-3xl shadow-2xl overflow-hidden border border-slate-800/60">
        
        <div className="p-6 text-center border-b border-slate-900 bg-slate-950">
          <div className="flex justify-center items-center gap-2 mb-1">
            <ShieldCheck size={24} className="text-blue-500" />
            <span className="text-xl font-black text-white">Votif<span className="text-blue-500">AI</span></span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {esComunidad ? 'Acreditación para Junta de Propietarios' : 'Identificación de Accionista o Consejero'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {esComunidad ? (
            /* FORMULARIO VECINAL */
            <div className="space-y-4">
              <div>
                <label className="block text-3xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">1. Código de Convocatoria</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3.5 text-slate-500" size={16} />
                  <input
                    type="text" required placeholder="Ej: VAI-7721-M" value={codigoJunta}
                    onChange={(e) => setCodigoJunta(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs font-mono tracking-widest text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-3xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">2. Nombre y Apellidos</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-slate-500" size={16} />
                  <input
                    type="text" required placeholder="Ej: Carmen Ortiz" value={nombreVecino}
                    onChange={(e) => setNombreVecino(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-3xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">3. Propiedad o Coeficiente</label>
                <div className="relative">
                  <Home className="absolute left-3 top-3.5 text-slate-500" size={16} />
                  <input
                    type="text" required placeholder="Ej: Piso 2ºA, Garaje 12" value={pisoPuerta}
                    onChange={(e) => setPisoPuerta(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* FORMULARIO CORPORATIVO */
            <div className="space-y-4">
              <div>
                <label className="block text-3xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">1. CIF de la Sociedad</label>
                <div className="relative">
                  <Building className="absolute left-3 top-3.5 text-slate-500" size={16} />
                  <input
                    type="text" required placeholder="Ej: A-82345678" value={cifEmpresa}
                    onChange={(e) => setCifEmpresa(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs font-mono uppercase text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-3xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">2. Correo Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-slate-500" size={16} />
                  <input
                    type="email" required placeholder="socio@empresa.com" value={emailSocio}
                    onChange={(e) => setEmailSocio(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-3xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">3. Clave de Acceso</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-slate-500" size={16} />
                  <input
                    type="password" required placeholder="••••••••" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all mt-6 shadow-lg shadow-blue-600/10 active:scale-98"
          >
            Verificar Identidad y Acceder
          </button>
        </form>
      </div>
    </div>
  );
}