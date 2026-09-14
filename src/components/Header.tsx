import React, { useState } from 'react';
import { MainNavTab, ThemeMode, UserAccount } from '../types';
import { THEMES } from '../utils/theme';
import { Crown, Shield, User, LogOut, Users, Sparkles, LogIn, Image as ImageIcon } from 'lucide-react';

interface HeaderProps {
  currentNav: MainNavTab;
  onNavChange: (nav: MainNavTab) => void;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  currentUser: UserAccount | null;
  ministryImage?: string;
  onOpenLoginModal: () => void;
  onOpenChangeImageModal?: () => void;
  onLogout: () => void;
  onOpenGallery?: () => void;
  photoCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentNav,
  onNavChange,
  currentTheme,
  onThemeChange,
  currentUser,
  ministryImage = '/vec.jpg',
  onOpenLoginModal,
  onOpenChangeImageModal,
  onLogout,
  onOpenGallery,
  photoCount = 15,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const theme = THEMES[currentTheme];

  const notifications = [
    {
      id: 1,
      title: 'Ensayo General Confirmado',
      desc: 'Jueves 23 a las 19:00 en Salón San Juan Bosco',
      time: 'Hace 1h',
      unread: true
    },
    {
      id: 2,
      title: 'Nuevo canto agendado',
      desc: 'Se agregó "Fiesta del Señor" al setlist del concierto',
      time: 'Hace 3h',
      unread: false
    },
    {
      id: 3,
      title: 'Partitura PDF disponible',
      desc: 'Setlist_Concierto_Adoracion_VEC.pdf actualizado',
      time: 'Ayer',
      unread: false
    }
  ];

  const getRoleBadge = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case 'admin_central':
        return {
          icon: Crown,
          label: 'Admin Central',
          badgeClass: 'text-amber-400 bg-amber-400/20 border-amber-400/40',
        };
      case 'admin':
        return {
          icon: Shield,
          label: 'Admin',
          badgeClass: 'text-sky-400 bg-sky-500/20 border-sky-400/40',
        };
      case 'usuario':
        return {
          icon: User,
          label: 'Músico',
          badgeClass: 'text-emerald-400 bg-emerald-500/20 border-emerald-400/40',
        };
    }
  };

  const roleBadge = getRoleBadge();
  const RoleIcon = roleBadge?.icon;

  return (
    <header className={`fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${theme.headerBg} shadow-[0_4px_24px_rgba(0,0,0,0.45)]`}>
      <div className="h-16 max-w-5xl mx-auto px-4 flex items-center justify-between gap-3">
        {/* Logo & Brand */}
        <button
          onClick={() => onNavChange('repertorio')}
          className="flex items-center gap-2.5 shrink-0 text-left cursor-pointer group"
          title="VEC - Voces en Cristo"
        >
          <div className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 shadow-lg border ${theme.logoBorder} flex items-center justify-center bg-black/40 transition-transform group-hover:scale-105 p-0.5`}>
            <img
              alt="Logo VEC - Voces en Cristo"
              className="w-full h-full object-contain"
              src={ministryImage || "/vec.jpg"}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/vec.jpg';
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className={`text-[19px] font-extrabold tracking-tight leading-tight flex items-center gap-1.5 ${theme.textMain}`}>
              VEC
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]"></span>
            </span>
            <span className={`text-[10px] tracking-widest uppercase font-bold ${theme.primaryText}`}>
              Voces en Cristo
            </span>
          </div>
        </button>

        {/* Navigation Tabs strictly ordered: 1. Comunidad VEC, 2. Repertorios & Concierto (activo), 3. Inicio & Evangelio, 4. Cuentas */}
        <nav className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => onNavChange('comunidad')}
            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
              currentNav === 'comunidad'
                ? `${theme.tabActiveBg} ${theme.tabActiveText} font-bold shadow-md`
                : `${theme.textMuted} hover:bg-white/10 hover:${theme.textMain}`
            }`}
          >
            Comunidad VEC
          </button>

          <button
            onClick={() => onNavChange('repertorio')}
            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              currentNav === 'repertorio'
                ? `${theme.tabActiveBg} ${theme.tabActiveText} font-bold shadow-md`
                : `${theme.textMuted} hover:bg-white/10 hover:${theme.textMain}`
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">album</span>
            <span>Repertorios & Concierto</span>
          </button>

          <button
            onClick={() => onNavChange('evangelio')}
            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
              currentNav === 'evangelio'
                ? `${theme.tabActiveBg} ${theme.tabActiveText} font-bold shadow-md`
                : `${theme.textMuted} hover:bg-white/10 hover:${theme.textMain}`
            }`}
          >
            Inicio & Evangelio
          </button>

          {/* Cuentas Tab */}
          <button
            onClick={() => onNavChange('usuarios')}
            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              currentNav === 'usuarios'
                ? `${theme.tabActiveBg} ${theme.tabActiveText} font-bold shadow-md`
                : `${theme.textMuted} hover:bg-white/10 hover:${theme.textMain}`
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Cuentas</span>
          </button>
        </nav>

        {/* Right Tools: Palette Selector, Notifications, User Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Gallery Modal Trigger */}
          {onOpenGallery && (
            <button
              onClick={onOpenGallery}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm group"
              title="Abrir Galería de Fotos VEC"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Fotos</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400/30 text-[10px] font-extrabold text-amber-200">
                {photoCount}
              </span>
            </button>
          )}

          {/* Theme Palette Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-white/15 bg-white/5 hover:bg-white/15 flex items-center gap-1.5 transition-all text-amber-300 cursor-pointer"
              title="Cambiar Paleta Litúrgica (Zafiro / Vino / Esmeralda)"
            >
              <span className="material-symbols-outlined text-[14px]">palette</span>
              <span className="hidden md:inline capitalize">{theme.name.split(' ')[0]}</span>
            </button>

            {showThemePicker && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#090f26] border border-white/20 p-1.5 shadow-2xl z-50 flex flex-col gap-1 text-xs">
                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Paleta Visual
                </span>
                <button
                  onClick={() => {
                    onThemeChange('zafiro');
                    setShowThemePicker(false);
                  }}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                    currentTheme === 'zafiro' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-sky-400"></span>
                  <span>Zafiro Celestial</span>
                </button>
                <button
                  onClick={() => {
                    onThemeChange('vino');
                    setShowThemePicker(false);
                  }}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                    currentTheme === 'vino' ? 'bg-rose-500/20 text-amber-200 font-bold' : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-rose-700"></span>
                  <span>Vino Litúrgico</span>
                </button>
                <button
                  onClick={() => {
                    onThemeChange('esmeralda');
                    setShowThemePicker(false);
                  }}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                    currentTheme === 'esmeralda' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span>Verde Esperanza</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notificaciones"
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#0a1128] border border-white/20 p-2 shadow-2xl z-50">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-white/10">
                  <span className="text-xs font-bold text-slate-200">Avisos del Ministerio</span>
                  <span className="text-[10px] text-amber-400 font-medium">1 nuevo</span>
                </div>
                <div className="flex flex-col divide-y divide-white/5 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2 text-left hover:bg-white/5 rounded transition-colors">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Login Button */}
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 transition-all cursor-pointer group"
              >
                <div className="relative">
                  <img
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-amber-400/40"
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  />
                  {RoleIcon && (
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-900 border border-black flex items-center justify-center">
                      <RoleIcon className="w-2.5 h-2.5 text-amber-400" />
                    </div>
                  )}
                </div>

                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-white truncate max-w-[90px]">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-amber-300 font-semibold leading-tight">
                    {roleBadge?.label}
                  </span>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#081028] border border-white/20 p-3 shadow-2xl z-50 animate-scaleIn">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                    <img
                      src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={currentUser.name}
                      className="w-11 h-11 rounded-xl object-cover border border-white/20 shadow-md"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{currentUser.name}</h4>
                      <p className="text-[10px] text-amber-300 font-mono">@{currentUser.username}</p>
                      <div className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border border-white/10 ${roleBadge?.badgeClass}`}>
                        {RoleIcon && <RoleIcon className="w-2.5 h-2.5" />}
                        <span>{roleBadge?.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="py-2 flex flex-col gap-1 text-xs">
                    <button
                      onClick={() => {
                        onNavChange('usuarios');
                        setShowUserMenu(false);
                      }}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>Gestión de Cuentas & Roles</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenLoginModal();
                        setShowUserMenu(false);
                      }}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <span>Ver Pantalla de Entrada Sagrada</span>
                    </button>

                    {onOpenChangeImageModal && (
                      <button
                        onClick={() => {
                          onOpenChangeImageModal();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4 text-emerald-400" />
                        <span>Cambiar Imagen del Ministerio</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar Sesión / Salir</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile subnavigation bar */}
      <div className="sm:hidden flex items-center justify-around border-t border-white/10 py-1.5 px-2 bg-black/40">
        <button
          onClick={() => onNavChange('comunidad')}
          className={`px-2 py-1 text-xs rounded font-medium ${
            currentNav === 'comunidad' ? 'text-amber-300 font-bold' : 'text-slate-400'
          }`}
        >
          Comunidad
        </button>
        <button
          onClick={() => onNavChange('repertorio')}
          className={`px-2 py-1 text-xs rounded font-medium ${
            currentNav === 'repertorio' ? 'text-amber-300 font-bold' : 'text-slate-400'
          }`}
        >
          Repertorios
        </button>
        {onOpenGallery && (
          <button
            onClick={onOpenGallery}
            className="px-2 py-1 text-xs rounded font-medium text-amber-300 flex items-center gap-1"
          >
            <ImageIcon className="w-3 h-3 text-amber-400" />
            <span>Fotos</span>
          </button>
        )}
        <button
          onClick={() => onNavChange('evangelio')}
          className={`px-2 py-1 text-xs rounded font-medium ${
            currentNav === 'evangelio' ? 'text-amber-300 font-bold' : 'text-slate-400'
          }`}
        >
          Evangelio
        </button>
        <button
          onClick={() => onNavChange('usuarios')}
          className={`px-2 py-1 text-xs rounded font-medium flex items-center gap-1 ${
            currentNav === 'usuarios' ? 'text-amber-300 font-bold' : 'text-slate-400'
          }`}
        >
          <Users className="w-3 h-3 text-amber-400" />
          <span>Cuentas</span>
        </button>
      </div>
    </header>
  );
};
