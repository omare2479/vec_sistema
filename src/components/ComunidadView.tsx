import React, { useState, useMemo } from 'react';
import { ThemeMode, PrayerIntention, GalleryPhoto, UserAccount } from '../types';
import { THEMES } from '../utils/theme';
import { BAND_MEMBERS, UPCOMING_SCHEDULE, INITIAL_PRAYER_INTENTIONS } from '../data/mockData';
import { RandomMemoryWidget } from './RandomMemoryWidget';
import { Image as ImageIcon, Sparkles, Shuffle, Upload, ArrowRight, ExternalLink, Headphones, Music, Share2, Globe } from 'lucide-react';
import { VEC_SOCIAL_LINKS } from '../data/socialMediaData';

interface ComunidadViewProps {
  currentTheme: ThemeMode;
  photos?: GalleryPhoto[];
  users?: UserAccount[];
  onOpenGallery?: () => void;
  onSelectPhoto?: (photo: GalleryPhoto) => void;
}

export const ComunidadView: React.FC<ComunidadViewProps> = ({
  currentTheme,
  photos = [],
  users = [],
  onOpenGallery,
  onSelectPhoto,
}) => {
  const theme = THEMES[currentTheme];
  const [intentions, setIntentions] = useState<PrayerIntention[]>(INITIAL_PRAYER_INTENTIONS);
  const [showAddIntentionModal, setShowAddIntentionModal] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<'salud' | 'familia' | 'vocacion' | 'comunidad'>('comunidad');

  // Preview photos (up to 4 items from the gallery, rotating or shuffled)
  const [randomSeed, setRandomSeed] = useState(0);
  const previewPhotos = useMemo(() => {
    if (photos.length === 0) return [];
    // Pick 4 photos
    return photos.slice(0, 4);
  }, [photos, randomSeed]);

  const handleTogglePrayed = (id: string) => {
    setIntentions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const hasPrayed = !item.hasPrayed;
          return {
            ...item,
            hasPrayed,
            prayersCount: item.prayersCount + (hasPrayed ? 1 : -1),
          };
        }
        return item;
      })
    );
  };

  const handleAddIntention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newInt: PrayerIntention = {
      id: `pi-${Date.now()}`,
      author: newAuthor.trim() || 'Fiel en Oración',
      location: 'Comunidad VEC',
      intention: newText.trim(),
      category: newCategory,
      date: 'Justo ahora',
      prayersCount: 1,
      hasPrayed: true,
    };

    setIntentions([newInt, ...intentions]);
    setNewAuthor('');
    setNewText('');
    setShowAddIntentionModal(false);
  };

  return (
    <div className="w-full max-w-[720px] mx-auto flex flex-col gap-6 relative z-20 animate-fadeIn">
      {/* Community Hero Header */}
      <div className={`relative overflow-hidden rounded-2xl ${theme.cardBg} p-5 sm:p-6 shadow-2xl border ${theme.cardBorder}`}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-[0_0_8px_#f59e0b]"></span>
            <span className={`text-xs uppercase tracking-wider font-bold ${theme.primaryText}`}>
              Fraternidad & Servicio Misionero
            </span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold ${theme.textMain}`}>
            Comunidad & Músicos de Voces en Cristo
          </h1>
          <p className={`text-sm leading-relaxed ${theme.textMuted}`}>
            Más que una banda, somos una familia en oración. Conoce a los integrantes del ministerio, nuestras actividades litúrgicas y únete en intercesión con la asamblea.
          </p>
        </div>

        {/* Dynamic Gallery Preview & Random Memory */}
        <div className="flex flex-col gap-3 mt-5 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                Galería de Fotos & Recuerdos
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {photos.length} Fotos
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setRandomSeed((s) => s + 1)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Mostrar otras fotos aleatorias"
              >
                <Shuffle className="w-3 h-3" />
                <span>Aleatorio</span>
              </button>

              {onOpenGallery && (
                <button
                  onClick={onOpenGallery}
                  className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition-all shadow cursor-pointer"
                >
                  <span>Ver todas</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Random Memory Card */}
          {photos.length > 0 && (
            <RandomMemoryWidget
              currentTheme={currentTheme}
              photos={photos}
              onOpenGallery={onOpenGallery || (() => {})}
              onSelectPhoto={onSelectPhoto}
              variant="card"
              autoRotateIntervalSec={20}
            />
          )}

          {/* 4-Item Photo Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-1">
            {previewPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => (onSelectPhoto ? onSelectPhoto(photo) : onOpenGallery && onOpenGallery())}
                className="relative h-28 rounded-xl overflow-hidden border border-white/10 group cursor-pointer shadow hover:border-amber-400/50 transition-all"
              >
                <img
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  src={photo.imageUrl}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/vec.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-between p-2">
                  <span className="text-[9px] uppercase font-bold text-amber-300/90 self-start bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
                    {photo.category}
                  </span>
                  <span className="text-[11px] font-bold text-white line-clamp-1 leading-tight group-hover:text-amber-300 transition-colors">
                    {photo.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Redes Sociales Oficiales & Plataformas de Streaming */}
      <div className={`p-5 sm:p-6 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} shadow-2xl flex flex-col gap-4 backdrop-blur-xl relative overflow-hidden`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_#10b981] animate-pulse"></span>
              <span className="text-[11px] text-emerald-400 uppercase font-black tracking-wider">
                Música en Vivo & Comunidad Digital
              </span>
            </div>
            <h2 className={`text-lg sm:text-xl font-black ${theme.textMain} mt-0.5`}>
              Nuestras Redes Sociales & Plataformas de Streaming
            </h2>
            <p className={`text-xs sm:text-sm ${theme.textMuted}`}>
              Síguenos en nuestras cuentas oficiales para enterarte de vigilias, ensayos y escuchar nuestra música católica.
            </p>
          </div>
        </div>

        {/* Canto Destacado Banner: "Todo mi amor" en Spotify */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#0a1835] to-emerald-950/60 border border-emerald-400/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center text-[#1ED760] shrink-0 shadow-lg">
              <Music className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-black px-2 py-0.2 rounded-full bg-[#1DB954]/20 text-[#1ED760] border border-[#1DB954]/30">
                  Canto Oficial
                </span>
                <span className="text-xs font-bold text-amber-300">Disponible en Spotify</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                «Todo mi amor» — Voces en Cristo
              </h3>
              <p className="text-[11px] text-slate-300">
                Canción de adoración y entrega eucarística disponible para escuchar y añadir a tus listas.
              </p>
            </div>
          </div>

          <a
            href="https://open.spotify.com/search/Voces%20en%20Cristo%20Todo%20mi%20amor"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105 shrink-0 cursor-pointer"
          >
            <span>Escuchar en Spotify</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Grid de Redes Sociales y Plataformas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {/* Facebook */}
          <a
            href="https://www.facebook.com/profile.php?id=100066983563027&locale=es_LA"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/25 transition-all flex items-center justify-between group cursor-pointer shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1877F2]/20 border border-[#1877F2]/40 flex items-center justify-center text-[#1877F2] shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white group-hover:text-blue-300 transition-colors">
                  Facebook Oficial
                </span>
                <span className="text-[11px] text-blue-300/80 font-medium">Voces en Cristo</span>
                <span className="text-[10px] text-slate-400">Comunidad & Eventos</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/voces_en_cristo/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-all flex items-center justify-between group cursor-pointer shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-purple-500/20 border border-rose-500/40 flex items-center justify-center text-[#E4405F] shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white group-hover:text-rose-300 transition-colors">
                  Instagram
                </span>
                <span className="text-[11px] text-rose-300/80 font-medium">@voces_en_cristo</span>
                <span className="text-[10px] text-slate-400">Fotos & Vigilias</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </a>

          {/* TikTok */}
          <a
            href="https://www.tiktok.com/@vocesencristo"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/25 transition-all flex items-center justify-between group cursor-pointer shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black/60 border border-pink-500/40 flex items-center justify-center text-[#EE1D52] shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01v8.86c0 2.21-1.04 4.35-2.86 5.62-1.78 1.25-4.14 1.63-6.24 1.01-2.17-.63-3.99-2.22-4.83-4.32-.86-2.14-.62-4.66.63-6.57 1.24-1.92 3.39-3.07 5.68-3.08.38 0 .76.03 1.14.09v4.18c-.4-.14-.83-.2-1.25-.17-1.17.06-2.23.75-2.73 1.8-.5 1.05-.35 2.34.39 3.23.73.89 1.93 1.34 3.06 1.13 1.14-.21 2.05-1.11 2.24-2.26.06-.39.08-.79.08-1.18V0h.01z"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white group-hover:text-pink-300 transition-colors">
                  TikTok Oficial
                </span>
                <span className="text-[11px] text-pink-300/80 font-medium">@vocesencristo</span>
                <span className="text-[10px] text-slate-400">Alabanzas & Ensayos</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </a>

          {/* Spotify Canal */}
          <a
            href="https://open.spotify.com/search/Voces%20en%20Cristo"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-all flex items-center justify-between group cursor-pointer shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center text-[#1ED760] shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors">
                  Spotify
                </span>
                <span className="text-[11px] text-emerald-300/80 font-medium">Voces en Cristo</span>
                <span className="text-[10px] text-slate-400">Discografía Oficial</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </a>

          {/* Amazon Music */}
          <a
            href="https://music.amazon.com/search/Voces+en+Cristo"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 transition-all flex items-center justify-between group cursor-pointer shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00A8E1]/20 border border-[#00A8E1]/40 flex items-center justify-center text-[#00A8E1] shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M13.9 11.7c-.1-.7-.6-1.2-1.6-1.2-.9 0-1.5.5-1.7 1.2h3.3zm-3.3 2.1c0 .8.6 1.3 1.6 1.3.8 0 1.3-.3 1.6-.9h1.7c-.4 1.4-1.6 2.2-3.3 2.2-2.1 0-3.5-1.4-3.5-3.6 0-2.2 1.4-3.6 3.4-3.6 2.2 0 3.5 1.5 3.5 3.6v.9h-5zm-5.4-3.8h1.9v7.1H5.2v-7.1zm.9-1.5c-.7 0-1.2-.5-1.2-1.2 0-.7.5-1.2 1.2-1.2.7 0 1.2.5 1.2 1.2 0 .7-.5 1.2-1.2 1.2zm13.1 5.3c0-1.4-.9-2.3-2.3-2.3-.9 0-1.6.4-2 1.1v-1h-1.8v7.1h1.9v-3.7c0-.8.5-1.4 1.3-1.4.7 0 1 .4 1 1.2v3.9h1.9v-4.9z"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white group-hover:text-sky-300 transition-colors">
                  Amazon Music
                </span>
                <span className="text-[11px] text-sky-300/80 font-medium">Voces en Cristo</span>
                <span className="text-[10px] text-slate-400">Canciones & Álbumes</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </a>

          {/* YouTube */}
          <a
            href="https://www.youtube.com/channel/UCYy7O_ld1yvbsOiWlzu0zTQ"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 transition-all flex items-center justify-between group cursor-pointer shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF0000]/20 border border-[#FF0000]/40 flex items-center justify-center text-[#FF0000] shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white group-hover:text-red-300 transition-colors">
                  YouTube Oficial
                </span>
                <span className="text-[11px] text-red-300/80 font-medium">Voces en Cristo</span>
                <span className="text-[10px] text-slate-400">Alabanzas &amp; Transmisiones</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </a>
        </div>
      </div>

      {/* Band Roster */}
      <div className={`p-4 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl flex flex-col gap-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-lg sm:text-xl font-bold ${theme.textMain}`}>
              Integrantes del Ministerio Musical
            </h2>
            <p className={`text-xs sm:text-sm ${theme.textMuted}`}>
              Músicos y salmistas consagrados al servicio de la alabanza católica.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-amber-300 font-bold shrink-0">
            {users.length > 0 ? users.filter((u) => u.status === 'activo').length : BAND_MEMBERS.length} Servidores
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(users.length > 0
            ? users.filter((u) => u.status === 'activo')
            : BAND_MEMBERS
          ).map((item) => {
            const isUserAccount = 'username' in item;
            const name = item.name;
            const role = isUserAccount
              ? item.role === 'admin_central'
                ? 'Director General / Admin Central'
                : item.role === 'admin'
                ? 'Coordinador / Admin'
                : 'Músico / Salmista'
              : (item as any).role;
            const instrument = item.instrument;
            const photoUrl = isUserAccount
              ? (item as UserAccount).avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              : (item as any).imageUrl;

            return (
              <div
                key={item.id}
                className="p-3.5 bg-black/40 border border-white/10 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-colors shadow-sm"
              >
                <img
                  alt={name}
                  className="w-12 h-12 rounded-full object-cover shrink-0 border border-amber-400/40"
                  src={photoUrl}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className={`text-sm font-bold truncate ${theme.textMain}`}>{name}</h3>
                  </div>
                  <p className="text-xs font-semibold text-amber-400 truncate">{role}</p>
                  <p className={`text-[11px] ${theme.textMuted} truncate`}>{instrument}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar & Next Rehearsals */}
      <div className={`p-4 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl flex flex-col gap-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-lg sm:text-xl font-bold ${theme.textMain}`}>
              Calendario de Ensayos & Presentaciones
            </h2>
            <p className={`text-xs sm:text-sm ${theme.textMuted}`}>
              Próximas convocatorias para el ministerio y equipo de audio.
            </p>
          </div>
          <span className="material-symbols-outlined text-amber-400 text-[24px]">event</span>
        </div>

        <div className="flex flex-col gap-3">
          {UPCOMING_SCHEDULE.map((item) => (
            <div
              key={item.id}
              className="p-3.5 bg-black/40 border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex flex-col items-center justify-center text-center shrink-0">
                  <span className="text-[10px] text-amber-400 uppercase font-bold">Día</span>
                  <span className="text-xs font-extrabold text-white leading-none">
                    {item.dateStr.split(' ')[1] || '25'}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-bold ${theme.textMain}`}>{item.title}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-amber-300/90 font-medium">{item.location}</p>
                  <p className={`text-[11px] ${theme.textMuted}`}>{item.timeStr}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <span className="material-symbols-outlined text-slate-400 text-[18px]">notifications_active</span>
                <span className="text-xs text-slate-300 font-medium">Recordatorio activo</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Muro de Oración (Prayer Wall) */}
      <div className={`p-4 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl flex flex-col gap-4`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[20px]">church</span>
              <h2 className={`text-lg sm:text-xl font-bold ${theme.textMain}`}>
                Muro de Oración Comunitaria
              </h2>
            </div>
            <p className={`text-xs sm:text-sm ${theme.textMuted}`}>
              Llevamos las intenciones de la comunidad en cada canto y comunión.
            </p>
          </div>

          <button
            onClick={() => setShowAddIntentionModal(true)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all hover:brightness-110 active:scale-95 cursor-pointer ${theme.tabActiveBg} ${theme.tabActiveText}`}
          >
            <span className="material-symbols-outlined text-[16px]">volunteer_activism</span>
            <span>Enviar Intención</span>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {intentions.map((intent) => (
            <div
              key={intent.id}
              className="p-4 bg-black/40 border border-white/10 rounded-xl flex flex-col gap-2 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-300">{intent.author}</span>
                <span className={`text-[11px] ${theme.textMuted}`}>{intent.date}</span>
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed ${theme.textMain}`}>
                "{intent.intention}"
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-[11px] text-slate-400">{intent.location}</span>
                <button
                  onClick={() => handleTogglePrayed(intent.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    intent.hasPrayed
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {intent.hasPrayed ? 'favorite' : 'favorite_border'}
                  </span>
                  <span>{intent.prayersCount} Unidos en oración</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Intention Modal */}
      {showAddIntentionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-[#0a1128] border border-white/20 rounded-2xl shadow-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">volunteer_activism</span>
                Petición de Oración
              </h3>
              <button
                onClick={() => setShowAddIntentionModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddIntention} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre o Familia</label>
                <input
                  type="text"
                  placeholder="Ej. Familia Soto o Anónimo"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Motivo de Oración *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Escribe tu intención para que el ministerio y la asamblea oren por ti..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddIntentionModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 rounded-lg font-bold ${theme.primaryGradient} text-black shadow-md`}
                >
                  Publicar en el Muro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
