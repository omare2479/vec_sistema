import React, { useState } from 'react';
import {
  Crown,
  Shield,
  User,
  UserPlus,
  Search,
  KeyRound,
  Trash2,
  Edit2,
  CheckCircle2,
  Lock,
  Phone,
  Music,
  Calendar,
  Sparkles,
  AlertTriangle,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Camera,
  RotateCcw
} from 'lucide-react';
import { UserAccount, UserRole, ThemeMode } from '../types';
import { THEMES } from '../utils/theme';

interface UserManagementViewProps {
  currentTheme: ThemeMode;
  users: UserAccount[];
  currentUser: UserAccount | null;
  ministryImage?: string;
  onOpenChangeImageModal?: () => void;
  onResetMinistryImage?: () => void;
  onCreateUser: (user: UserAccount) => void;
  onUpdateUser: (id: string, updates: Partial<UserAccount>) => void;
  onDeleteUser: (id: string) => void;
  onOpenEntranceModal: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentTheme,
  users,
  currentUser,
  ministryImage = '/vec.jpg',
  onOpenChangeImageModal,
  onResetMinistryImage,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onOpenEntranceModal,
}) => {
  const theme = THEMES[currentTheme];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | UserRole>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [visiblePasswordUserId, setVisiblePasswordUserId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('usuario');
  const [formInstrument, setFormInstrument] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState<'activo' | 'inactivo'>('activo');

  const isCentralAdmin = currentUser?.role === 'admin_central';
  const isAdminOrHigher = isCentralAdmin || currentUser?.role === 'admin';

  // Metrics
  const totalCount = users.length;
  const centralAdminsCount = users.filter((u) => u.role === 'admin_central').length;
  const adminsCount = users.filter((u) => u.role === 'admin').length;
  const standardUsersCount = users.filter((u) => u.role === 'usuario').length;

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.instrument.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole =
      selectedRoleFilter === 'all' ? true : u.role === selectedRoleFilter;

    return matchesSearch && matchesRole;
  });

  const resetForm = () => {
    setFormName('');
    setFormUsername('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('usuario');
    setFormInstrument('');
    setFormPhone('');
    setFormNotes('');
    setFormStatus('activo');
    setEditingUserId(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (user: UserAccount) => {
    setEditingUserId(user.id);
    setFormName(user.name);
    setFormUsername(user.username);
    setFormEmail(user.email || '');
    setFormPassword(user.password);
    setFormRole(user.role);
    setFormInstrument(user.instrument);
    setFormPhone(user.phone || '');
    setFormNotes(user.notes || '');
    setFormStatus(user.status);
    setIsCreateModalOpen(true);
  };

  const handleSubmitAccountForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUsername.trim() || !formPassword.trim()) {
      alert('Por favor completa nombre, usuario y contraseña.');
      return;
    }

    if (editingUserId) {
      // Update existing
      onUpdateUser(editingUserId, {
        name: formName.trim(),
        username: formUsername.trim().toLowerCase(),
        email: formEmail.trim() || undefined,
        password: formPassword.trim(),
        role: formRole,
        instrument: formInstrument.trim() || 'Ministerio Musical',
        phone: formPhone.trim() || undefined,
        notes: formNotes.trim() || undefined,
        status: formStatus,
      });
      setFeedbackMsg(`Cuenta de "${formName}" actualizada exitosamente.`);
    } else {
      // Create new
      const exists = users.some(
        (u) => u.username.toLowerCase() === formUsername.trim().toLowerCase()
      );
      if (exists) {
        alert('Ese nombre de usuario ya está registrado. Elige otro.');
        return;
      }

      const newAccount: UserAccount = {
        id: `usr-${Date.now()}`,
        name: formName.trim(),
        username: formUsername.trim().toLowerCase(),
        email: formEmail.trim() || undefined,
        password: formPassword.trim(),
        role: formRole,
        instrument: formInstrument.trim() || 'Ministerio Musical',
        phone: formPhone.trim() || undefined,
        notes: formNotes.trim() || undefined,
        status: formStatus,
        createdAt: new Date().toISOString().split('T')[0],
        avatarUrl:
          formRole === 'admin_central'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            : formRole === 'admin'
            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      };
      onCreateUser(newAccount);
      setFeedbackMsg(`¡Nueva cuenta creada: ${newAccount.name} (${getRoleBadgeInfo(newAccount.role).label})!`);
    }

    setIsCreateModalOpen(false);
    resetForm();
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleDelete = (user: UserAccount) => {
    if (user.role === 'admin_central' && centralAdminsCount <= 1) {
      alert('No puedes eliminar al único Administrador Central del sistema.');
      return;
    }
    if (window.confirm(`¿Estás seguro de eliminar la cuenta de ${user.name} (${user.username})?`)) {
      onDeleteUser(user.id);
      setFeedbackMsg(`Cuenta de ${user.name} eliminada.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const getRoleBadgeInfo = (role: UserRole) => {
    switch (role) {
      case 'admin_central':
        return {
          label: 'Administrador Central',
          icon: Crown,
          bg: 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
          badgeText: 'Director General',
        };
      case 'admin':
        return {
          label: 'Administrador',
          icon: Shield,
          bg: 'bg-sky-500/20 text-sky-300 border-sky-400/40 shadow-[0_0_12px_rgba(56,189,248,0.2)]',
          badgeText: 'Coordinador',
        };
      case 'usuario':
        return {
          label: 'Usuario / Músico',
          icon: User,
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
          badgeText: 'Participante',
        };
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-fadeIn">
      {/* Top Banner: Panel de Cuentas */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0a1b42] via-[#091536] to-[#080d24] border border-white/20 p-6 sm:p-7 shadow-[0_10px_35px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Crown className="w-3.5 h-3.5" />
              <span>Gestión Ministerial de Accesos</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Cuentas de Usuarios & Administradores
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Crea, administra y otorga roles de <span className="text-amber-300 font-semibold">Administrador Central</span>, <span className="text-sky-300 font-semibold">Administrador</span> y <span className="text-emerald-300 font-semibold">Usuarios / Músicos</span> para cada participante de Voces en Cristo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Crear Cuenta Nueva</span>
            </button>

            {onOpenChangeImageModal && (
              <button
                onClick={onOpenChangeImageModal}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer hover:border-amber-400/40"
                title="Cambiar o personalizar la imagen oficial del Ministerio VEC"
              >
                <Camera className="w-3.5 h-3.5 text-amber-300" />
                <span>Cambiar Imagen</span>
              </button>
            )}

            <button
              onClick={onOpenEntranceModal}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Ver la pantalla de entrada con efecto de aparición"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Pantalla de Entrada</span>
            </button>
          </div>
        </div>

        {/* Feedback alert toast */}
        {feedbackMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Ministry Official Image Configuration Strip */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/30 p-3.5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3.5">
            <div className="relative w-14 h-14 aspect-square rounded-xl overflow-hidden border-2 border-amber-400/50 shadow-md bg-black shrink-0">
              <img
                src={ministryImage || '/vec.jpg'}
                alt="Imagen Oficial VEC"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/vec.jpg';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Imagen Oficial del Ministerio</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  ministryImage === '/vec.jpg' || ministryImage === '/vec_logo_splash.jpg'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-sky-500/20 text-sky-300 border-sky-400/30'
                }`}>
                  {ministryImage === '/vec.jpg' || ministryImage === '/vec_logo_splash.jpg'
                    ? 'Original (/vec.jpg)'
                    : 'Personalizada'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 max-w-md">
                La imagen original permanece protegida. Puedes cambiarla subiendo una nueva foto o volver a la original cuando desees.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {onOpenChangeImageModal && (
              <button
                type="button"
                onClick={onOpenChangeImageModal}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Cambiar Imagen</span>
              </button>
            )}
            {onResetMinistryImage && ministryImage !== '/vec.jpg' && (
              <button
                type="button"
                onClick={onResetMinistryImage}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                title="Volver a la imagen original /vec.jpg"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Restablecer</span>
              </button>
            )}
          </div>
        </div>

        {/* Summary Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Participantes</span>
            <span className="text-2xl font-black text-white mt-1">{totalCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 flex flex-col">
            <span className="text-[11px] text-amber-300 uppercase font-semibold flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-400" />
              Admin Central
            </span>
            <span className="text-2xl font-black text-amber-300 mt-1">{centralAdminsCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-400/20 flex flex-col">
            <span className="text-[11px] text-sky-300 uppercase font-semibold flex items-center gap-1">
              <Shield className="w-3 h-3 text-sky-400" />
              Administradores
            </span>
            <span className="text-2xl font-black text-sky-300 mt-1">{adminsCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20 flex flex-col">
            <span className="text-[11px] text-emerald-300 uppercase font-semibold flex items-center gap-1">
              <User className="w-3 h-3 text-emerald-400" />
              Usuarios / Músicos
            </span>
            <span className="text-2xl font-black text-emerald-300 mt-1">{standardUsersCount}</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/40 border border-white/10 p-3 rounded-2xl">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, usuario o instrumento..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:border-amber-400 outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedRoleFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              selectedRoleFilter === 'all'
                ? 'bg-white/20 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Todos ({totalCount})
          </button>
          <button
            onClick={() => setSelectedRoleFilter('admin_central')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
              selectedRoleFilter === 'admin_central'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Crown className="w-3 h-3 text-amber-400" />
            Central ({centralAdminsCount})
          </button>
          <button
            onClick={() => setSelectedRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
              selectedRoleFilter === 'admin'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-3 h-3 text-sky-400" />
            Admin ({adminsCount})
          </button>
          <button
            onClick={() => setSelectedRoleFilter('usuario')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
              selectedRoleFilter === 'usuario'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-3 h-3 text-emerald-400" />
            Usuarios ({standardUsersCount})
          </button>
        </div>
      </div>

      {/* Accounts List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredUsers.map((user) => {
          const roleInfo = getRoleBadgeInfo(user.role);
          const RoleIcon = roleInfo.icon;
          const isCurrentUser = currentUser?.id === user.id;
          const isPasswordVisible = visiblePasswordUserId === user.id;

          return (
            <div
              key={user.id}
              className={`rounded-2xl p-4 sm:p-5 border transition-all duration-300 bg-[#09112a]/90 backdrop-blur-md relative overflow-hidden flex flex-col justify-between ${
                isCurrentUser
                  ? 'border-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.15)]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {isCurrentUser && (
                <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 font-black text-[10px] px-3 py-0.5 rounded-bl-xl uppercase tracking-wider">
                  Tu Sesión Actual
                </div>
              )}

              <div>
                {/* Header: Avatar, Name, Role Badge */}
                <div className="flex items-start gap-3.5">
                  <div className="relative">
                    <img
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={user.name}
                      className="w-13 h-13 rounded-2xl object-cover border border-white/20 shadow-md"
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 p-1 rounded-full border border-black text-slate-950 ${
                        user.role === 'admin_central'
                          ? 'bg-amber-400'
                          : user.role === 'admin'
                          ? 'bg-sky-400'
                          : 'bg-emerald-400'
                      }`}
                    >
                      <RoleIcon className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 pr-12">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white truncate">{user.name}</h3>
                      {user.status === 'activo' ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Activo" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-500 shrink-0" title="Inactivo" />
                      )}
                    </div>

                    <div className="text-xs text-amber-300/90 font-medium flex items-center gap-1 mt-0.5">
                      <Music className="w-3 h-3 shrink-0" />
                      <span className="truncate">{user.instrument}</span>
                    </div>

                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${roleInfo.bg}">
                      <RoleIcon className="w-3 h-3" />
                      <span>{roleInfo.label}</span>
                    </div>
                  </div>
                </div>

                {/* Account Credentials & Details */}
                <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-semibold">Usuario:</span>
                    <span className="font-mono text-slate-200 font-semibold truncate block mt-0.5">
                      {user.username}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-black/30 border border-white/5 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 block font-semibold">Contraseña:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setVisiblePasswordUserId(isPasswordVisible ? null : user.id)
                        }
                        className="text-slate-400 hover:text-slate-200 cursor-pointer"
                        title={isPasswordVisible ? 'Ocultar' : 'Mostrar contraseña'}
                      >
                        {isPasswordVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                    <span className="font-mono text-amber-300 font-bold block mt-0.5">
                      {isPasswordVisible ? user.password : '••••••••'}
                    </span>
                  </div>
                </div>

                {/* Contact and Registered Date */}
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span className="flex items-center gap-1 truncate">
                    {user.phone ? (
                      <>
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{user.phone}</span>
                      </>
                    ) : (
                      <span>{user.email || 'Sin correo asignado'}</span>
                    )}
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{user.createdAt}</span>
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                {/* Role quick toggle for Central Admin */}
                {isCentralAdmin ? (
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-slate-400 mr-1 hidden sm:inline">Rol:</span>
                    <select
                      value={user.role}
                      onChange={(e) =>
                        onUpdateUser(user.id, { role: e.target.value as UserRole })
                      }
                      className="bg-black/50 border border-white/15 text-slate-200 text-xs rounded-lg px-2 py-1 outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="usuario">Usuario</option>
                      <option value="admin">Administrador</option>
                      <option value="admin_central">Admin Central</option>
                    </select>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Rol asignado por el Director
                  </span>
                )}

                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(user)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Editar cuenta y contraseña"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Editar</span>
                  </button>

                  {isAdminOrHigher && (
                    <button
                      type="button"
                      onClick={() => handleDelete(user)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      title="Eliminar participante"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT ACCOUNT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#0a122c] border border-white/20 rounded-3xl p-6 shadow-2xl overflow-hidden animate-scaleIn">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingUserId ? 'Editar Cuenta Ministerial' : 'Crear Nueva Cuenta'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ingresa los datos del participante y asigna su rol
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAccountForm} className="space-y-4 mt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="ej. Daniel Santisteban"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Usuario de Acceso *
                  </label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="ej. daniel.teclado"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Contraseña del usuario"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs outline-none focus:border-amber-400 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Instrumento / Ministerio *
                  </label>
                  <input
                    type="text"
                    value={formInstrument}
                    onChange={(e) => setFormInstrument(e.target.value)}
                    placeholder="ej. Guitarra Eléctrica, Voz, Salmista"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Correo Electrónico (Opcional)
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="ej. participante@vec.catolico"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Teléfono / WhatsApp (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+51 987 654 321"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Seleccionar Nivel de Acceso / Rol:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormRole('usuario')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      formRole === 'usuario'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <User className="w-3.5 h-3.5" />
                      <span>Usuario</span>
                    </div>
                    <span className="text-[10px] text-slate-400 leading-tight">
                      Músico / Salmista
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormRole('admin')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      formRole === 'admin'
                        ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Admin</span>
                    </div>
                    <span className="text-[10px] text-slate-400 leading-tight">
                      Coordinador Musical
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormRole('admin_central')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      formRole === 'admin_central'
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Crown className="w-3.5 h-3.5" />
                      <span>Admin Central</span>
                    </div>
                    <span className="text-[10px] text-slate-400 leading-tight">
                      Director General
                    </span>
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-4 pt-1">
                <label className="text-xs font-semibold text-slate-300">Estado de la Cuenta:</label>
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="activo"
                      checked={formStatus === 'activo'}
                      onChange={() => setFormStatus('activo')}
                      className="text-amber-400"
                    />
                    <span>Activo</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="inactivo"
                      checked={formStatus === 'inactivo'}
                      onChange={() => setFormStatus('inactivo')}
                      className="text-amber-400"
                    />
                    <span>En pausa</span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/15 text-slate-300 hover:bg-white/5 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all cursor-pointer"
                >
                  {editingUserId ? 'Guardar Cambios' : 'Crear Cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
