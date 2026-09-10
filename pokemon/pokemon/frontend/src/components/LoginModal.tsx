import React, { useState } from 'react';
import { AuthUser } from '../types';
import { api } from '../services/api';
import { LogIn, UserPlus, X, Shield, Sparkles, KeyRound, User, Lock, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [trainerName, setTrainerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const user = await api.login(username, password);
        onLoginSuccess(user);
        onClose();
      } else {
        const user = await api.register(username, password, trainerName || username);
        onLoginSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (user: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      const authUser = await api.login(user, pass);
      onLoginSuccess(authUser);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error en inicio de sesión rápido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-[#3B4CCA]/60 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Top Pokéball Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full border border-white/70 flex flex-col overflow-hidden relative shadow">
              <div className="bg-[#CC0000] h-1/2 w-full" />
              <div className="bg-white h-1/2 w-full" />
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-slate-900" />
              <div className="absolute inset-0 m-auto w-2.5 h-2.5 rounded-full bg-white border border-slate-900 shadow" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {mode === 'login' ? 'Acceso de Entrenador' : 'Crear Cuenta de Entrenador'}
              </h3>
              <p className="text-[11px] text-blue-300/70">
                {mode === 'login'
                  ? 'Inicia sesión para acceder a tu colección y funciones'
                  : 'Regístrate para comenzar tu viaje en PokéPulse'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-950 border-b border-slate-800 text-xs font-black">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              mode === 'login'
                ? 'bg-[#CC0000] text-white shadow-md shadow-red-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Iniciar Sesión</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              mode === 'register'
                ? 'bg-[#3B4CCA] text-white shadow-md shadow-blue-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Registrarse</span>
          </button>
        </div>

        {/* Quick Access Helper Buttons for Testing */}
        <div className="p-4 bg-indigo-950/30 border-b border-indigo-900/30">
          <span className="text-[10px] font-black uppercase text-indigo-300 block mb-2 tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FFCB05]" /> Accesos Rápidos Preconfigurados:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin123')}
              disabled={loading}
              className="px-2.5 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/40 hover:border-amber-400 text-amber-300 text-[11px] font-black flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>👑 Admin (CRUD)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('entrenador', 'pokemon123')}
              disabled={loading}
              className="px-2.5 py-1.5 rounded-xl bg-blue-950/60 border border-blue-500/40 hover:border-blue-400 text-blue-300 text-[11px] font-black flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>⚡ Entrenador</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Nombre de Usuario</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej. entrenador_rojo o admin"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#3B4CCA]"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Nombre Público de Entrenador</label>
              <div className="relative">
                <Sparkles className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={trainerName}
                  onChange={(e) => setTrainerName(e.target.value)}
                  placeholder="Ej. Red de Pueblo Paleta"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#3B4CCA]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#3B4CCA]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-xl font-black text-xs text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-gradient-to-r from-[#CC0000] to-[#E83030] hover:from-[#E83030] hover:to-[#FF4444] shadow-red-900/40'
                : 'bg-gradient-to-r from-[#3B4CCA] to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/40'
            } disabled:opacity-50`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : mode === 'login' ? (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Entrar a PokéPulse</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Crear y Entrar</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
