import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  LogIn,
  CheckCircle2,
  AlertCircle,
  X,
  Camera,
  ArrowLeft,
  Users
} from 'lucide-react';
import { UserAccount, UserRole, ThemeMode } from '../types';
import { THEMES } from '../utils/theme';
import { fetchUsersFromCloud } from '../data/userAccountsData';

interface LoginEntranceModalProps {
  currentTheme: ThemeMode;
  users: UserAccount[];
  currentUser: UserAccount | null;
  ministryImage?: string;
  onLoginSuccess: (user: UserAccount) => void;
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
  onOpenChangeImageModal,
  onClose,
  canCloseWithoutLogin = true,
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const theme = THEMES[currentTheme];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMessage('Por favor ingresa tu usuario y contraseña de administrador.');
      return;
    }

    setIsLoggingIn(true);

    // Validar contra lista local asegurando INITIAL_USER_ACCOUNTS
    let usersToCheck = [...users, ...INITIAL_USER_ACCOUNTS];
    try {
      const cloudPromise = fetchUsersFromCloud();
      const timeoutPromise = new Promise<null>((r) => setTimeout(() => r(null), 1200));
      const cloudUsers = await Promise.race([cloudPromise, timeoutPromise]);
      if (cloudUsers && cloudUsers.length > 0) {
        usersToCheck = [...cloudUsers, ...usersToCheck];
      }
    } catch {
      // Fallback local
    }

    const matched = usersToCheck.find(
      (u) =>
        (u.username.toLowerCase() === cleanUser || (u.email && u.email.toLowerCase() === cleanUser)) &&
        u.password === cleanPass
    );

    if (!matched) {
      setIsLoggingIn(false);
      setErrorMessage('Usuario o contraseña no válidos. Verifica tus credenciales de administrador.');
      return;
    }

    if (matched.status === 'inactivo') {
      setIsLoggingIn(false);
      setErrorMessage('Esta cuenta de administrador se encuentra inactiva.');
      return;
    }

    // Comprobar que sea Administrador
    if (matched.role !== 'admin_central' && matched.role !== 'admin') {
      setIsLoggingIn(false);
      setErrorMessage('Esta cuenta no cuenta con permisos de administración. Los visitantes pueden consultar todo el material libremente sin iniciar sesión.');
      return;
    }

    setSuccessMessage(`¡Bienvenido Administrador, ${matched.name}!`);
    setTimeout(() => {
      setIsLoggingIn(false);
      onLoginSuccess(matched);
    }, 600);
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
        initial={{ opacity: 0, scale: 0.9, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl bg-[#070d1e]/95 border border-white/20 rounded-3xl shadow-[0_16px_70px_rgba(0,0,0,0.85)] overflow-hidden my-auto backdrop-blur-2xl z-10"
      >
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Cerrar y volver a la vista pública"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
          {/* LEFT COLUMN: Identity Banner */}
          <div className="lg:col-span-5 relative bg-gradient-to-b from-[#0a183d] via-[#071026] to-[#040817] p-6 sm:p-8 flex flex-col items-center justify-center text-center overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/40 via-sky-600/20 to-transparent pointer-events-none" />

            {/* Glowing Halo */}
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.35, 0.65, 0.35],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-amber-500/30 via-sky-400/30 to-rose-500/20 blur-3xl pointer-events-none"
            />

            <div className="relative z-10 flex flex-col items-center">
              <div className="relative group">
                <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 opacity-75 blur-md animate-pulse" />
                <div className="relative w-52 sm:w-60 aspect-square rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.8)] border-2 border-white/30 bg-black flex items-center justify-center">
                  <img
                    src={ministryImage || "/vec.jpg"}
                    alt="VEC - Voces en Cristo"
                    className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/vec.jpg';
                    }}
                  />
                  {currentUser && (currentUser.role === 'admin_central' || currentUser.role === 'admin') && onOpenChangeImageModal && (
                    <button
                      type="button"
                      onClick={onOpenChangeImageModal}
                      title="Cambiar imagen oficial del Ministerio VEC"
                      className="absolute bottom-2 right-2 px-2.5 py-1.5 rounded-xl bg-black/80 hover:bg-black/95 border border-white/30 text-white/90 hover:text-amber-300 transition-all text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md cursor-pointer shadow-lg"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cambiar</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-col items-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-2 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Panel de Control</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  VOCES EN CRISTO
                </h2>
                <p className="text-xs text-sky-200/80 mt-1 max-w-[240px]">
                  Ministerio Musical Católico
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 text-[11px] text-slate-400 italic max-w-xs relative z-10">
              «Alabanza, Adoración Eucarística y Santa Misa»
            </div>
          </div>

          {/* RIGHT COLUMN: Admin Authentication */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Header Navigation */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <Lock className="w-5 h-5 text-amber-400" />
                    <span>Acceso de Administrador</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Exclusivo para la Dirección y Administradores autorizados
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Solo Admin</span>
                </div>
              </div>

              {/* Public notice banner */}
              <div className="mb-5 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-200 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-white">Acceso Público y Libre:</strong> Los visitantes no necesitan cuenta ni registro para ver cantos, partituras, audios o la galería. Este panel es únicamente para editar el contenido del ministerio.
                </div>
              </div>

              {/* Alert Messages */}
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

              {/* Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Usuario o Correo del Administrador
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="admincentral o coordinador"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/15 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-white text-sm placeholder-slate-500 outline-none transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Contraseña de Administrador
                    </label>
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
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 px-0.5">
                    <span>Clave inicial: <strong className="text-amber-300 font-mono">vec2026</strong></span>
                    <button
                      type="button"
                      onClick={() => {
                        setUsernameInput('admincentral');
                        setPasswordInput('vec2026');
                        setErrorMessage(null);
                      }}
                      className="text-amber-400 hover:underline cursor-pointer font-bold"
                    >
                      Autorrellenar clave
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all cursor-pointer active:scale-[0.99] ${isLoggingIn ? 'opacity-75 cursor-wait' : ''}`}
                >
                  {isLoggingIn ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                      <span>Verificando Administrador...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Ingresar al Panel de Administración</span>
                    </>
                  )}
                </button>
              </form>

              {/* Free visitor back button */}
              {onClose && (
                <div className="mt-4 pt-3 border-t border-white/10 text-center">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs text-slate-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Volver a la vista pública libre (Solo Lectura)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom info banner */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Servidor ministerial activo
              </span>
              <span>VEC • Gestión Centralizada</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
