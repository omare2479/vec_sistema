import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  Shield,
  User,
  Music,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  LogIn,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  X,
  Radio,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { UserAccount, UserRole, ThemeMode } from '../types';
import { THEMES } from '../utils/theme';

interface LoginEntranceModalProps {
  currentTheme: ThemeMode;
  users: UserAccount[];
  currentUser: UserAccount | null;
  ministryImage?: string;
  onLoginSuccess: (user: UserAccount) => void;
  onRegisterUser: (newAccount: UserAccount) => void;
  onOpenChangeImageModal?: () => void;
  onClose?: () => void;
  canCloseWithoutLogin?: boolean;
}

export const LoginEntranceModal: React.FC<LoginEntranceModalProps> = ({
  currentTheme,
  users,
  currentUser,
  ministryImage = '/vec.jpg',
  onLoginSuccess,
  onRegisterUser,
  onOpenChangeImageModal,
  onClose,
  canCloseWithoutLogin = false,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Registration Form States
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('usuario');
  const [regInstrument, setRegInstrument] = useState('Voz & Coros');

  const theme = THEMES[currentTheme];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMessage('Por favor ingresa tu usuario y contraseña.');
      return;
    }

    const matched = users.find(
      (u) =>
        (u.username.toLowerCase() === cleanUser || (u.email && u.email.toLowerCase() === cleanUser)) &&
        u.password === cleanPass
    );

    if (!matched) {
      setErrorMessage('Usuario o contraseña no válidos. Verifica tus credenciales asignadas por la Dirección.');
      return;
    }

    if (matched.status === 'inactivo') {
      setErrorMessage('Esta cuenta se encuentra inactiva. Comunícate con el Administrador Central.');
      return;
    }

    setSuccessMessage(`¡Bienvenido al Ministerio VEC, ${matched.name}!`);
    setTimeout(() => {
      onLoginSuccess(matched);
    }, 600);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regName.trim() || !regUsername.trim() || !regPassword.trim()) {
      setErrorMessage('Nombre, usuario y contraseña son requeridos.');
      return;
    }

    const usernameExists = users.some(
      (u) => u.username.toLowerCase() === regUsername.trim().toLowerCase()
    );

    if (usernameExists) {
      setErrorMessage('El nombre de usuario ya está registrado. Por favor elige otro.');
      return;
    }

    const newAccount: UserAccount = {
      id: `usr-${Date.now()}`,
      name: regName.trim(),
      username: regUsername.trim().toLowerCase(),
      email: regEmail.trim() || undefined,
      password: regPassword.trim(),
      role: regRole,
      instrument: regInstrument.trim() || 'Ministerio Musical',
      status: 'activo',
      createdAt: new Date().toISOString().split('T')[0],
      avatarUrl:
        regRole === 'admin_central'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : regRole === 'admin'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    };

    onRegisterUser(newAccount);
    setSuccessMessage(`¡Cuenta creada exitosamente como ${getRoleLabel(newAccount.role)}!`);
    setTimeout(() => {
      onLoginSuccess(newAccount);
    }, 700);
  };

  const handleQuickLogin = (account: UserAccount) => {
    setUsernameInput(account.username);
    setPasswordInput(account.password);
    setErrorMessage(null);
    setSuccessMessage(`Iniciando sesión como ${account.name} (${getRoleLabel(account.role)})...`);
    setTimeout(() => {
      onLoginSuccess(account);
    }, 450);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin_central':
        return 'Administrador Central';
      case 'admin':
        return 'Administrador';
      case 'usuario':
        return 'Participante / Usuario';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-xl">
      {/* Background Divine Radial Glow */}
      <div
        className="fixed inset-0 pointer-events-none opacity-50"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${theme.glowColor}, transparent 70%)`,
        }}
      />

      {/* Main Card with entrance animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl bg-[#070d1e]/95 border border-white/20 rounded-3xl shadow-[0_16px_70px_rgba(0,0,0,0.85)] overflow-hidden my-auto backdrop-blur-2xl z-10"
      >
        {/* Close button if user is already authenticated */}
        {canCloseWithoutLogin && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Cerrar y volver al ministerio"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          {/* LEFT COLUMN: The Official VEC Image with the Spectacular Apparition Effect */}
          <div className="lg:col-span-5 relative bg-gradient-to-b from-[#0a183d] via-[#071026] to-[#040817] p-6 sm:p-8 flex flex-col items-center justify-center text-center overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
            {/* Ambient animated rays / holy burst in background */}
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/40 via-sky-600/20 to-transparent pointer-events-none" />

            {/* Glowing Holy Halo around the apparition */}
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.35, 0.7, 0.35],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-amber-500/30 via-sky-400/30 to-rose-500/20 blur-3xl pointer-events-none"
            />

            {/* THE APPARITION CONTAINER */}
            <motion.div
              initial={{ opacity: 0, scale: 0.75, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{
                duration: 0.9,
                delay: 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative z-10 flex flex-col items-center"
            >
              {/* Image Frame with Golden/Sapphire Ring */}
              <div className="relative group">
                <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 opacity-75 blur-md animate-pulse" />
                <div className="relative w-56 sm:w-64 aspect-square rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.8)] border-2 border-white/30 bg-black flex items-center justify-center">
                  <img
                    src={ministryImage || "/vec.jpg"}
                    alt="VEC - Voces en Cristo"
                    className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback to default local vec.jpg
                      (e.target as HTMLImageElement).src = '/vec.jpg';
                    }}
                  />
                  {onOpenChangeImageModal && (
                    <button
                      type="button"
                      onClick={onOpenChangeImageModal}
                      title="Cambiar imagen oficial del Ministerio VEC"
                      className="absolute bottom-2 right-2 px-2.5 py-1.5 rounded-xl bg-black/80 hover:bg-black/95 border border-white/30 text-white/90 hover:text-amber-300 transition-all text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md cursor-pointer shadow-lg group/btn hover:border-amber-400/50"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400 group-hover/btn:scale-110 transition-transform" />
                      <span>Cambiar imagen</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Ministry Title & Badge */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-5 flex flex-col items-center"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-2 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Portal Ministerial VEC</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
                  VOCES EN CRISTO
                </h2>
                <p className="text-xs text-sky-200/80 mt-1 max-w-[240px]">
                  Alabanza, Adoración Eucarística y Santa Misa
                </p>
              </motion.div>
            </motion.div>

            {/* Quote of faith */}
            <div className="mt-4 pt-4 border-t border-white/10 text-[11px] text-slate-400 italic max-w-xs relative z-10">
              «Canten al Señor un cántico nuevo; resuene su alabanza en la asamblea de los fieles» (Salmo 149, 1)
            </div>
          </div>

          {/* RIGHT COLUMN: Authentication & Account Creation */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Header Navigation: Iniciar Sesión con Credenciales */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                    Acceso de Participantes
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ingresa con tu usuario y contraseña asignados por la Dirección
                  </p>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Acceso Protegido</span>
                </div>
              </div>

              {/* Alert Feedback Messages */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* FORMULARIO DE ACCESO EXCLUSIVO */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Usuario o Correo Electrónico
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="ej. admincentral o participante"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/15 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-white text-sm placeholder-slate-500 outline-none transition-all"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Contraseña
                      </label>
                      <span className="text-[11px] text-slate-400">
                        (Músicos y Directores)
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/15 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-white text-sm placeholder-slate-500 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all cursor-pointer active:scale-[0.99]"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Entrar al Ministerio</span>
                  </button>
                </form>

                {/* Nota de seguridad ministerial */}
                <div className="mt-5 p-3 rounded-2xl bg-black/30 border border-white/5 text-center">
                  <p className="text-[11px] text-slate-400">
                    🔒 <strong className="text-slate-300">Acceso Restringido:</strong> Cada músico o director debe ingresar únicamente con las credenciales asignadas por la Dirección Central.
                  </p>
                </div>
              </div>

            {/* Bottom info banner */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Servidor ministerial activo
              </span>
              <span>VEC v2.4 • Edición Concierto</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
