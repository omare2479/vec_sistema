import React, { useState, useMemo } from 'react';
import { ThemeMode, PrayerIntention, GalleryPhoto, UserAccount } from '../types';
import { THEMES } from '../utils/theme';
import { BAND_MEMBERS, UPCOMING_SCHEDULE, INITIAL_PRAYER_INTENTIONS } from '../data/mockData';
import { RandomMemoryWidget } from './RandomMemoryWidget';
import { Image as ImageIcon, Sparkles, Shuffle, Upload, ArrowRight } from 'lucide-react';

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
