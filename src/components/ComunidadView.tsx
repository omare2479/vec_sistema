import React, { useState, useMemo, useEffect } from 'react';
import { ThemeMode, GalleryPhoto } from '../types';
import { THEMES } from '../utils/theme';
import { RandomMemoryWidget } from './RandomMemoryWidget';
import { MemberModal } from './MemberModal';
import { CalendarEventModal } from './CalendarEventModal';
import { PrayerWallModal } from './PrayerWallModal';
import {
  Image as ImageIcon, Shuffle, ArrowRight, ExternalLink, Music, Edit2, Trash2,
  PlusCircle, Calendar, UserPlus, Link, ChevronDown, X, Check, Heart
} from 'lucide-react';
import {
  CommunityMember, CalendarEvent, PrayerIntentionStored, SocialLinkEditable,
  loadMembers, saveMembers, loadCalendarEvents, saveCalendarEvents,
  loadPrayerIntentions, savePrayerIntentions, loadSocialLinks, saveSocialLinks,
  // Cloud (Supabase)
  loadMembersFromCloud, saveMembersToCloud, deleteMemberFromCloud,
  loadCalendarEventsFromCloud, saveCalendarEventsToCloud, deleteCalendarEventFromCloud,
  loadPrayerIntentionsFromCloud, savePrayerIntentionsToCloud,
  loadSocialLinksFromCloud, saveSocialLinksToCloud,
} from '../utils/comunidadStorage';

// ─── Social SVG Icons (Official brand logos) ──────────────────────────────

const SOCIAL_ICONS: Record<string, { svg: React.ReactNode; color: string; bg: string; border: string }> = {
  facebook: {
    color: '#1877F2', bg: 'bg-[#1877F2]/15', border: 'border-[#1877F2]/40',
    svg: <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  },
  instagram: {
    color: '#E4405F', bg: 'bg-rose-500/15', border: 'border-rose-500/40',
    svg: <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
  },
  tiktok: {
    color: '#EE1D52', bg: 'bg-pink-500/15', border: 'border-pink-500/40',
    svg: <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01v8.86c0 2.21-1.04 4.35-2.86 5.62-1.78 1.25-4.14 1.63-6.24 1.01-2.17-.63-3.99-2.22-4.83-4.32-.86-2.14-.62-4.66.63-6.57 1.24-1.92 3.39-3.07 5.68-3.08.38 0 .76.03 1.14.09v4.18c-.4-.14-.83-.2-1.25-.17-1.17.06-2.23.75-2.73 1.8-.5 1.05-.35 2.34.39 3.23.73.89 1.93 1.34 3.06 1.13 1.14-.21 2.05-1.11 2.24-2.26.06-.39.08-.79.08-1.18V0h.01z"/></svg>
  },
  youtube: {
    color: '#FF0000', bg: 'bg-red-500/15', border: 'border-red-500/40',
    svg: <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  },
  spotify: {
    color: '#1ED760', bg: 'bg-emerald-500/15', border: 'border-emerald-500/40',
    svg: <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
  },
  amazon: {
    color: '#00A8E1', bg: 'bg-sky-500/15', border: 'border-sky-500/40',
    svg: <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39.051.261.201-1.789 2.096-3.924 3.333-6.405 4.016-2.482.682-4.969.785-7.46.307-2.492-.479-4.65-1.482-6.477-3.007-.142-.113-.115-.21.076-.296l-.268-.5zm22.952-3.42c-.126.063-.238.04-.333-.043C21.9 13.48 20.11 12.03 17.85 11.26c-.297-.1-.437-.23-.376-.43.09-.294.258-.43.63-.43 2.052 0 4.052.41 5.784 1.23.228.105.37.27.42.47.05.2-.01.43-.17.6l-.14.12z"/></svg>
  },
};

// ─── Confirm Delete Dialog ────────────────────────────────────────────────

const ConfirmDialog: React.FC<{ message: string; onConfirm: () => void; onCancel: () => void }> = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
    <div className="bg-[#0a1128] border border-red-500/30 rounded-2xl p-5 max-w-xs w-full shadow-2xl flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Trash2 className="w-5 h-5 text-red-400 shrink-0" />
        <p className="text-sm text-white">{message}</p>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold transition-colors">
          Cancelar
        </button>
        <button onClick={onConfirm} className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors flex items-center gap-1">
          <Trash2 className="w-3 h-3" /> Eliminar
        </button>
      </div>
    </div>
  </div>
);

// ─── Props ─────────────────────────────────────────────────────────────────

interface ComunidadViewProps {
  currentTheme: ThemeMode;
  photos?: GalleryPhoto[];
  isAdmin?: boolean;
  onOpenGallery?: () => void;
  onSelectPhoto?: (photo: GalleryPhoto) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────

export const ComunidadView: React.FC<ComunidadViewProps> = ({
  currentTheme, photos = [], isAdmin = false, onOpenGallery, onSelectPhoto,
}) => {
  const theme = THEMES[currentTheme];

  // ─── Members State ───────────────────────────────────────────────────
  const [members, setMembers] = useState<CommunityMember[]>(() => loadMembers());
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<CommunityMember | null>(null);
  const [confirmDeleteMember, setConfirmDeleteMember] = useState<string | null>(null);

  // ─── Calendar State ──────────────────────────────────────────────────
  const [calEvents, setCalEvents] = useState<CalendarEvent[]>(() => loadCalendarEvents());
  const [showCalModal, setShowCalModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [confirmDeleteEvent, setConfirmDeleteEvent] = useState<string | null>(null);

  // ─── Prayer State ────────────────────────────────────────────────────
  const [intentions, setIntentions] = useState<PrayerIntentionStored[]>(() => loadPrayerIntentions());
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [showAddIntention, setShowAddIntention] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');
  const [newText, setNewText] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCategory, setNewCategory] = useState<PrayerIntentionStored['category']>('comunidad');

  // ─── Social Links State ──────────────────────────────────────────────
  const [socialLinks, setSocialLinks] = useState<SocialLinkEditable[]>(() => loadSocialLinks());
  const [showSocialEditor, setShowSocialEditor] = useState(false);
  const [editingSocial, setEditingSocial] = useState<SocialLinkEditable | null>(null);

  // ─── Gallery State ───────────────────────────────────────────────────
  const [randomSeed, setRandomSeed] = useState(0);
  const previewPhotos = useMemo(() => photos.slice(0, 4), [photos, randomSeed]);

  // ─── Load from cloud on mount ───────────────────────────────────────
  useEffect(() => {
    loadMembersFromCloud().then(data => { if (data.length > 0) setMembers(data); });
    loadCalendarEventsFromCloud().then(data => { if (data.length > 0) setCalEvents(data); });
    loadPrayerIntentionsFromCloud().then(data => { if (data.length > 0) setIntentions(data); });
    loadSocialLinksFromCloud().then(data => { if (data.length > 0) setSocialLinks(data); });
  }, []);

  // ─── Members Handlers ────────────────────────────────────────────────
  const handleSaveMember = (data: Omit<CommunityMember, 'id' | 'createdAt' | 'order'> & { id?: string }) => {
    setMembers(prev => {
      let next: CommunityMember[];
      if (data.id) {
        next = prev.map(m => m.id === data.id ? { ...m, ...data } as CommunityMember : m);
      } else {
        const newM: CommunityMember = {
          id: `member-${Date.now()}`,
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
          order: prev.length,
          createdAt: new Date().toISOString(),
        };
        next = [...prev, newM];
      }
      saveMembersToCloud(next);
      return next;
    });
    setShowMemberModal(false);
    setEditingMember(null);
  };
  const handleDeleteMember = (id: string) => {
    setMembers(prev => {
      const next = prev.filter(m => m.id !== id);
      saveMembersToCloud(next);
      deleteMemberFromCloud(id);
      return next;
    });
    setConfirmDeleteMember(null);
  };

  // ─── Calendar Handlers ────────────────────────────────────────────────
  const handleSaveEvent = (data: Omit<CalendarEvent, 'id' | 'createdAt'> & { id?: string }) => {
    setCalEvents(prev => {
      let next: CalendarEvent[];
      if (data.id) {
        next = prev.map(e => e.id === data.id ? { ...e, ...data } as CalendarEvent : e);
      } else {
        const newE: CalendarEvent = { id: `evt-${Date.now()}`, ...data, createdAt: new Date().toISOString() };
        next = [...prev, newE].sort((a, b) => a.date.localeCompare(b.date));
      }
      saveCalendarEventsToCloud(next);
      return next;
    });
    setShowCalModal(false);
    setEditingEvent(null);
  };
  const handleDeleteEvent = (id: string) => {
    setCalEvents(prev => {
      const next = prev.filter(e => e.id !== id);
      saveCalendarEventsToCloud(next);
      deleteCalendarEventFromCloud(id);
      return next;
    });
    setConfirmDeleteEvent(null);
  };

  // ─── Prayer Handlers ──────────────────────────────────────────────────
  const handleTogglePrayed = (id: string) => {
    setIntentions(prev => prev.map(i => {
      if (i.id !== id) return i;
      const hasPrayed = !i.hasPrayed;
      return { ...i, hasPrayed, prayersCount: i.prayersCount + (hasPrayed ? 1 : -1) };
    }));
  };
  const handleAddIntention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    const ni: PrayerIntentionStored = {
      id: `pi-${Date.now()}`,
      author: newAuthor.trim() || 'Fiel en Oración',
      location: newLocation.trim() || 'Comunidad VEC',
      intention: newText.trim(),
      category: newCategory,
      date: 'Justo ahora',
      prayersCount: 1,
      hasPrayed: true,
      createdAt: Date.now(),
    };
    setIntentions(prev => {
      const next = [ni, ...prev];
      savePrayerIntentionsToCloud(next);
      return next;
    });
    setNewAuthor(''); setNewText(''); setNewLocation('');
    setShowAddIntention(false);
  };

  // ─── Social Handlers ──────────────────────────────────────────────────
  const handleSaveSocial = (link: SocialLinkEditable) => {
    setSocialLinks(prev => {
      const next = prev.map(l => l.id === link.id ? link : l);
      saveSocialLinksToCloud(next);
      return next;
    });
    setEditingSocial(null);
  };

  // ─── Helpers ──────────────────────────────────────────────────────────
  const eventTypeLabel: Record<CalendarEvent['type'], string> = {
    ensayo: 'Ensayo',
    presentacion: 'Presentación',
    misa: 'Misa',
    concierto: 'Concierto',
    vigilia: 'Vigilia',
  };
  const eventTypeColor: Record<CalendarEvent['type'], string> = {
    ensayo: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    presentacion: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    misa: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    concierto: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    vigilia: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };
  const statusColor: Record<CalendarEvent['status'], string> = {
    confirmado: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    proximo: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    cancelado: 'bg-red-500/20 text-red-300 border-red-500/30',
  };
  const formatEventDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch { return dateStr; }
  };

  return (
    <div className="w-full max-w-[720px] mx-auto flex flex-col gap-6 relative z-20 animate-fadeIn">

      {/* ── 1. Hero / Galería ─────────────────────────────────────────── */}
      <div className={`relative overflow-hidden rounded-2xl ${theme.cardBg} p-5 sm:p-6 shadow-2xl border ${theme.cardBorder}`}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-[0_0_8px_#f59e0b]" />
            <span className={`text-xs uppercase tracking-wider font-bold ${theme.primaryText}`}>Fraternidad & Servicio Misionero</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold ${theme.textMain}`}>Comunidad & Músicos de Voces en Cristo</h1>
          <p className={`text-sm leading-relaxed ${theme.textMuted}`}>
            Más que una banda, somos una familia en oración. Conoce a los integrantes del ministerio, nuestras actividades litúrgicas y únete en intercesión con la asamblea.
          </p>
        </div>

        {/* Gallery Preview */}
        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                Galería de Fotos & Recuerdos
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">{photos.length} Fotos</span>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setRandomSeed(s => s + 1)} className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                <Shuffle className="w-3 h-3" /><span>Aleatorio</span>
              </button>
              {onOpenGallery && (
                <button onClick={onOpenGallery} className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition-all shadow">
                  <span>Ver todas</span><ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          {photos.length > 0 && (
            <RandomMemoryWidget currentTheme={currentTheme} photos={photos} onOpenGallery={onOpenGallery || (() => {})} onSelectPhoto={onSelectPhoto} variant="card" autoRotateIntervalSec={20} />
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-1">
            {previewPhotos.map(photo => (
              <div key={photo.id} onClick={() => onSelectPhoto ? onSelectPhoto(photo) : onOpenGallery?.()}
                className="relative h-28 rounded-xl overflow-hidden border border-white/10 group cursor-pointer shadow hover:border-amber-400/50 transition-all">
                <img alt={photo.title} src={photo.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/vec.jpg'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-between p-2">
                  <span className="text-[9px] uppercase font-bold text-amber-300/90 self-start bg-black/60 px-1.5 py-0.5 rounded border border-white/10">{photo.category}</span>
                  <span className="text-[11px] font-bold text-white line-clamp-1 leading-tight group-hover:text-amber-300 transition-colors">{photo.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Integrantes del Ministerio Musical (Miembros) ──────────── */}
      <div className={`p-4 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl flex flex-col gap-4`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[22px]">group</span>
              <h2 className={`text-lg sm:text-xl font-bold ${theme.textMain}`}>Integrantes del Ministerio Musical</h2>
            </div>
            <p className={`text-xs sm:text-sm ${theme.textMuted}`}>Músicos y salmistas consagrados al servicio de la alabanza católica.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-amber-300 font-bold shrink-0">{members.length} Miembros</span>
            {isAdmin && (
              <button onClick={() => { setEditingMember(null); setShowMemberModal(true); }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold shadow transition-all hover:scale-105 cursor-pointer">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Agregar miembro</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {members.map(member => (
            <div key={member.id} className="flex flex-col items-center gap-2.5 p-3.5 bg-black/35 border border-white/10 rounded-2xl hover:bg-white/5 transition-all group relative text-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-amber-400/50 bg-white/5 shadow-md shrink-0 group-hover:scale-105 transition-transform">
                <img alt={member.name} src={member.imageUrl} className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=150&auto=format&fit=crop&q=80'; }} />
              </div>
              <div className="min-w-0 flex flex-col items-center">
                <h3 className={`text-sm font-bold ${theme.textMain} leading-snug`}>{member.name}</h3>
                {member.description && (
                  <p className={`text-[11px] ${theme.textMuted} mt-0.5 leading-tight`}>{member.description}</p>
                )}
              </div>
              {isAdmin && (
                <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-white/10 w-full justify-center">
                  <button onClick={() => { setEditingMember(member); setShowMemberModal(true); }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Editar miembro o cambiar foto">
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button onClick={() => setConfirmDeleteMember(member.id)}
                    className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 transition-colors cursor-pointer"
                    title="Eliminar miembro">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Calendario de Ensayos & Presentaciones ─────────────────── */}
      <div className={`p-4 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl flex flex-col gap-4`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[22px]">event</span>
              <h2 className={`text-lg sm:text-xl font-bold ${theme.textMain}`}>Calendario de Ensayos & Presentaciones</h2>
            </div>
            <p className={`text-xs sm:text-sm ${theme.textMuted}`}>Próximas convocatorias para el ministerio y equipo de audio.</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button onClick={() => { setEditingEvent(null); setShowCalModal(true); }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold shadow transition-all hover:scale-105 cursor-pointer">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Nueva actividad</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {calEvents.map(ev => {
            const formattedDate = formatEventDate(ev.date);
            const dateParts = formattedDate.split(' ');
            return (
              <div key={ev.id} className="p-3.5 bg-black/40 border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex flex-col items-center justify-center text-center shrink-0">
                    <span className="text-[9px] text-amber-400 uppercase font-bold">{dateParts[0] || 'DÍA'}</span>
                    <span className="text-sm font-extrabold text-white leading-none">{dateParts[1] || ''}</span>
                    <span className="text-[9px] text-amber-300">{dateParts[2] || ''}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-sm font-bold ${theme.textMain}`}>{ev.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${eventTypeColor[ev.type]}`}>{eventTypeLabel[ev.type]}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${statusColor[ev.status]}`}>{ev.status}</span>
                    </div>
                    <p className="text-xs text-amber-300/90 font-medium mt-0.5">{ev.location}</p>
                    <p className={`text-[11px] ${theme.textMuted}`}>{ev.time}{ev.endTime ? ` - ${ev.endTime}` : ''}</p>
                    {ev.description && <p className={`text-[11px] ${theme.textMuted} mt-0.5 line-clamp-1`}>{ev.description}</p>}
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button onClick={() => { setEditingEvent(ev); setShowCalModal(true); }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Editar actividad">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setConfirmDeleteEvent(ev.id)}
                      className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 transition-colors cursor-pointer"
                      title="Eliminar actividad">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. Muro de Oración (Comprimido con botón «Ver muro») ─────── */}
      <div className={`p-4 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl flex flex-col gap-4`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[20px]">church</span>
              <h2 className={`text-lg sm:text-xl font-bold ${theme.textMain}`}>Muro de Oración Comunitaria</h2>
            </div>
            <p className={`text-xs sm:text-sm ${theme.textMuted}`}>Llevamos las intenciones de la comunidad en cada canto y comunión.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowAddIntention(true)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all hover:brightness-110 cursor-pointer ${theme.tabActiveBg} ${theme.tabActiveText}`}>
              <span className="material-symbols-outlined text-[16px]">volunteer_activism</span>
              <span>Enviar Intención</span>
            </button>
            <button onClick={() => setShowPrayerModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md bg-white/10 hover:bg-white/20 text-amber-300 transition-all border border-amber-400/30 cursor-pointer">
              <Heart className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver muro de oración ({intentions.length})</span>
            </button>
          </div>
        </div>

        {/* Resumen comprimido - solo 2 peticiones */}
        <div className="flex flex-col gap-2">
          {intentions.slice(0, 2).map(intent => (
            <div key={intent.id} className="p-3 bg-black/40 border border-white/10 rounded-xl flex flex-col gap-1 hover:bg-white/5 transition-colors">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-300">{intent.author}</span>
                <span className={`text-[11px] ${theme.textMuted}`}>{intent.date}</span>
              </div>
              <p className={`text-xs leading-relaxed ${theme.textMain} line-clamp-2`}>"{intent.intention}"</p>
            </div>
          ))}
          {intentions.length > 2 && (
            <button onClick={() => setShowPrayerModal(true)}
              className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
              <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver las {intentions.length} intenciones completas en el muro</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 5. Redes Sociales & Streaming (Parte Inferior) ──────────── */}
      <div className={`p-4 sm:p-5 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl`}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
            <h2 className={`text-sm font-black ${theme.textMain}`}>Redes Sociales & Streaming Oficiales</h2>
          </div>
          {isAdmin && (
            <button onClick={() => setShowSocialEditor(!showSocialEditor)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 text-xs font-semibold transition-colors cursor-pointer">
              <Link className="w-3 h-3" />{showSocialEditor ? 'Ocultar editor' : 'Editar enlaces'}
            </button>
          )}
        </div>

        {/* Solo iconos/logos como enlaces directos */}
        <div className="flex items-center justify-center flex-wrap gap-3.5 py-1">
          {socialLinks.filter(l => l.enabled).map(link => {
            const icon = SOCIAL_ICONS[link.id];
            if (!icon) return null;
            return (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                title={`${link.name}: ${link.handle}`}
                className={`w-12 h-12 rounded-2xl ${icon.bg} border ${icon.border} flex items-center justify-center transition-all hover:scale-110 hover:brightness-125 cursor-pointer shadow-md`}
                style={{ color: icon.color }}>
                {icon.svg}
              </a>
            );
          })}
        </div>

        {/* Admin: Social Editor */}
        {isAdmin && showSocialEditor && (
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
            <p className="text-xs text-slate-400 font-semibold mb-1">Editar enlaces de redes sociales</p>
            {socialLinks.map(link => (
              <div key={link.id} className="flex items-center gap-2">
                <div style={{ color: SOCIAL_ICONS[link.id]?.color || '#fff' }}
                  className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center bg-white/5">
                  {SOCIAL_ICONS[link.id]?.svg}
                </div>
                {editingSocial?.id === link.id ? (
                  <div className="flex-1 flex gap-2 flex-wrap">
                    <input value={editingSocial.url} onChange={e => setEditingSocial({ ...editingSocial, url: e.target.value })}
                      placeholder="URL" className="flex-1 min-w-0 px-2 py-1 bg-black/40 border border-white/20 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-400" />
                    <input value={editingSocial.handle} onChange={e => setEditingSocial({ ...editingSocial, handle: e.target.value })}
                      placeholder="Handle" className="w-32 px-2 py-1 bg-black/40 border border-white/20 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-400" />
                    <button onClick={() => handleSaveSocial(editingSocial!)} className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer">
                      <Check className="w-3 h-3" />
                    </button>
                    <button onClick={() => setEditingSocial(null)} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 text-xs cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white">{link.name}</span>
                      <span className="text-[10px] text-slate-400 truncate">{link.url}</span>
                    </div>
                    <button onClick={() => setEditingSocial({ ...link })}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors shrink-0 cursor-pointer">
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Spotify featured banner */}
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-emerald-950/80 via-[#0a1835] to-emerald-950/60 border border-emerald-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center text-[#1ED760] shrink-0">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-black px-1.5 rounded bg-[#1DB954]/20 text-[#1ED760] border border-[#1DB954]/30">Canto Oficial</span>
                <span className="text-xs font-bold text-amber-300">Spotify</span>
              </div>
              <p className="text-sm font-black text-white">«Todo mi amor» — Voces en Cristo</p>
            </div>
          </div>
          <a href="https://open.spotify.com/search/Voces%20en%20Cristo%20Todo%20mi%20amor" target="_blank" rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-black text-xs flex items-center gap-2 shadow-lg transition-all hover:scale-105 shrink-0 cursor-pointer">
            Escuchar <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────── */}
      {showMemberModal && isAdmin && (
        <MemberModal currentTheme={currentTheme} member={editingMember}
          onSave={handleSaveMember} onClose={() => { setShowMemberModal(false); setEditingMember(null); }} />
      )}

      {showCalModal && isAdmin && (
        <CalendarEventModal currentTheme={currentTheme} event={editingEvent}
          onSave={handleSaveEvent} onClose={() => { setShowCalModal(false); setEditingEvent(null); }} />
      )}

      {showPrayerModal && (
        <PrayerWallModal currentTheme={currentTheme} intentions={intentions}
          onTogglePrayed={handleTogglePrayed} onClose={() => setShowPrayerModal(false)} />
      )}

      {/* Add intention modal */}
      {showAddIntention && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-[#0a1128] border border-white/20 rounded-2xl shadow-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">volunteer_activism</span>
                Petición de Oración
              </h3>
              <button onClick={() => setShowAddIntention(false)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddIntention} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre o Familia</label>
                <input type="text" placeholder="Ej. Familia Soto o Anónimo" value={newAuthor} onChange={e => setNewAuthor(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Lugar / Parroquia</label>
                <input type="text" placeholder="Ej. Parroquia San Juan Bosco" value={newLocation} onChange={e => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Categoría</label>
                <div className="flex gap-2 flex-wrap">
                  {(['salud', 'familia', 'vocacion', 'comunidad'] as PrayerIntentionStored['category'][]).map(c => (
                    <button key={c} type="button" onClick={() => setNewCategory(c)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all capitalize cursor-pointer ${newCategory === c ? 'bg-amber-500 text-slate-900 border-amber-400' : 'bg-white/5 text-slate-300 border-white/15 hover:bg-white/10'}`}>
                      {c === 'vocacion' ? 'Vocación' : c.charAt(0).toUpperCase() + c.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Motivo de Oración *</label>
                <textarea required rows={3} placeholder="Escribe tu intención..." value={newText} onChange={e => setNewText(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button type="button" onClick={() => setShowAddIntention(false)} className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 font-semibold cursor-pointer">Cancelar</button>
                <button type="submit" className={`px-4 py-1.5 rounded-lg font-bold cursor-pointer ${theme.tabActiveBg} ${theme.tabActiveText} shadow-md`}>Publicar en el Muro</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm delete member */}
      {confirmDeleteMember && (
        <ConfirmDialog message="¿Eliminar este miembro del ministerio? Esta acción no se puede deshacer."
          onConfirm={() => handleDeleteMember(confirmDeleteMember)}
          onCancel={() => setConfirmDeleteMember(null)} />
      )}

      {/* Confirm delete event */}
      {confirmDeleteEvent && (
        <ConfirmDialog message="¿Eliminar esta actividad del calendario? Esta acción no se puede deshacer."
          onConfirm={() => handleDeleteEvent(confirmDeleteEvent)}
          onCancel={() => setConfirmDeleteEvent(null)} />
      )}
    </div>
  );
};
