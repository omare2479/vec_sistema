import React, { useState, useRef } from 'react';
import { ThemeMode } from '../types';
import { THEMES } from '../utils/theme';
import { CalendarEvent } from '../utils/comunidadStorage';
import {
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  PlusCircle,
  Edit2,
  Trash2,
  Sparkles,
  Music,
  Flame,
  Church
} from 'lucide-react';

interface EventsSliderModalProps {
  currentTheme: ThemeMode;
  events: CalendarEvent[];
  isAdmin?: boolean;
  onClose: () => void;
  onOpenNewEvent: () => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
}

const TYPE_CONFIG: Record<CalendarEvent['type'], { label: string; badge: string; icon: React.ReactNode; defaultImg: string }> = {
  concierto: {
    label: 'Concierto VEC',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: <Music className="w-3.5 h-3.5" />,
    defaultImg: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80',
  },
  adoracion: {
    label: 'Adoración Eucarística',
    badge: 'bg-yellow-400/25 text-yellow-300 border-yellow-400/50 shadow-[0_0_12px_rgba(250,204,21,0.3)]',
    icon: <Flame className="w-3.5 h-3.5 text-yellow-400" />,
    defaultImg: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&auto=format&fit=crop&q=80',
  },
  misa: {
    label: 'Santa Misa',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: <Church className="w-3.5 h-3.5 text-emerald-400" />,
    defaultImg: 'https://images.unsplash.com/photo-1548625361-12590f0580ea?w=800&auto=format&fit=crop&q=80',
  },
  ensayo: {
    label: 'Ensayo General',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    icon: <Music className="w-3.5 h-3.5 text-blue-400" />,
    defaultImg: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
  },
  vigilia: {
    label: 'Vigilia',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
    defaultImg: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?w=800&auto=format&fit=crop&q=80',
  },
  presentacion: {
    label: 'Presentación Especial',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" />,
    defaultImg: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80',
  },
};

function formatEventDisplayDate(dateStr: string) {
  if (!dateStr) return { dayName: 'DÍA', dayNum: '--', monthName: 'MES', year: '' };
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').toUpperCase();
      const dayNum = parts[2];
      const monthName = d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase();
      return { dayName, dayNum, monthName, year: parts[0] };
    }
  } catch {}
  return { dayName: 'DÍA', dayNum: '25', monthName: 'OCT', year: '2026' };
}

export const EventsSliderModal: React.FC<EventsSliderModalProps> = ({
  currentTheme,
  events,
  isAdmin,
  onClose,
  onOpenNewEvent,
  onEditEvent,
  onDeleteEvent,
}) => {
  const theme = THEMES[currentTheme];
  const [filter, setFilter] = useState<'todos' | 'concierto' | 'adoracion' | 'misa' | 'ensayo'>('todos');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredEvents = events.filter((ev) => {
    if (filter === 'todos') return true;
    return ev.type === filter;
  });

  const scrollToIndex = (idx: number) => {
    if (!scrollContainerRef.current) return;
    const clamped = Math.max(0, Math.min(idx, filteredEvents.length - 1));
    const container = scrollContainerRef.current;
    const cardWidth = container.firstElementChild?.clientWidth || 320;
    container.scrollTo({
      left: clamped * (cardWidth + 16),
      behavior: 'smooth',
    });
    setCurrentIndex(clamped);
  };

  const handleNext = () => scrollToIndex(currentIndex + 1);
  const handlePrev = () => scrollToIndex(currentIndex - 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl bg-[#090e1e] border border-white/20 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <div className="w-full h-full bg-[#0a1128] rounded-[10px] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  Agenda & Próximos Eventos VEC
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {filteredEvents.length} {filteredEvents.length === 1 ? 'evento' : 'eventos'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Conciertos, Noches de Adoración, Misas Dominicales y Ensayos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => {
                  onClose();
                  onOpenNewEvent();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs shadow-md transition-all hover:scale-105 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Programar Evento</span>
                <span className="sm:hidden">Programar</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 border-b border-white/10 bg-black/40 flex items-center justify-between gap-2 overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-1.5 shrink-0">
            {(['todos', 'concierto', 'adoracion', 'misa', 'ensayo'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setFilter(cat);
                  setCurrentIndex(0);
                  if (scrollContainerRef.current) scrollContainerRef.current.scrollLeft = 0;
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${
                  filter === cat
                    ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {cat === 'todos' ? 'Todos los Eventos' : cat === 'adoracion' ? 'Adoración' : cat}
              </button>
            ))}
          </div>

          {/* Navigation Controls */}
          {filteredEvents.length > 1 && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 text-white flex items-center justify-center transition-all cursor-pointer"
                title="Evento anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-slate-400 font-medium px-1">
                {currentIndex + 1} / {filteredEvents.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentIndex >= filteredEvents.length - 1}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 text-white flex items-center justify-center transition-all cursor-pointer"
                title="Siguiente evento"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Sliding Cards Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <Calendar className="w-12 h-12 text-slate-600 stroke-[1.5]" />
              <h3 className="text-base font-bold text-white">No hay eventos en esta categoría</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Puedes programar un concierto, adoración, misa o ensayo con su fecha, hora y foto.
              </p>
              {isAdmin && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenNewEvent();
                  }}
                  className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Programar Evento Ahora</span>
                </button>
              )}
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 pt-1 scrollbar-thin scroll-smooth"
            >
              {filteredEvents.map((ev, idx) => {
                const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.concierto;
                const photo = ev.imageUrl || cfg.defaultImg;
                const dateParts = formatEventDisplayDate(ev.date);

                return (
                  <div
                    key={ev.id}
                    className="snap-center shrink-0 w-[290px] sm:w-[350px] bg-black/60 border border-white/15 rounded-2xl overflow-hidden flex flex-col shadow-xl hover:border-amber-400/40 transition-all group"
                  >
                    {/* Event Photo Header with overlay badges */}
                    <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-900">
                      <img
                        src={photo}
                        alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = cfg.defaultImg;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border backdrop-blur-md ${cfg.badge}`}
                        >
                          {cfg.icon}
                          <span>{cfg.label}</span>
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase backdrop-blur-md ${
                            ev.status === 'confirmado'
                              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                              : ev.status === 'cancelado'
                              ? 'bg-red-500/25 text-red-300 border border-red-500/40'
                              : 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {ev.status}
                        </span>
                      </div>

                      {/* Date Bento Overlay Box at bottom of photo */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-2.5">
                        <div className="w-12 h-12 rounded-xl bg-black/80 border border-amber-400/50 backdrop-blur-md flex flex-col items-center justify-center shadow-lg text-center">
                          <span className="text-[9px] font-extrabold text-amber-400 tracking-wider">
                            {dateParts.dayName}
                          </span>
                          <span className="text-base font-black text-white leading-none">
                            {dateParts.dayNum}
                          </span>
                          <span className="text-[9px] font-bold text-amber-300">
                            {dateParts.monthName}
                          </span>
                        </div>
                        <div className="flex flex-col text-white">
                          <span className="text-xs font-semibold flex items-center gap-1 drop-shadow">
                            <Clock className="w-3.5 h-3.5 text-amber-300" />
                            {ev.time} {ev.endTime ? `• ${ev.endTime}` : ''}
                          </span>
                          <span className="text-[10px] text-slate-300 drop-shadow">
                            Año {dateParts.year}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Event Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                      <div className="flex flex-col gap-1.5">
                        <h3 className="text-base font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                          {ev.title}
                        </h3>

                        <div className="flex items-start gap-1.5 text-xs text-amber-300/90 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{ev.location}</span>
                        </div>

                        {ev.description && (
                          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mt-1">
                            {ev.description}
                          </p>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">
                          {idx === 0 ? '✨ Próximo en cartelera' : `Evento #${idx + 1}`}
                        </span>

                        {isAdmin && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                onClose();
                                onEditEvent(ev);
                              }}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                              title="Editar evento o cambiar foto"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={() => onDeleteEvent(ev.id)}
                              className="p-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 transition-all cursor-pointer"
                              title="Eliminar evento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dots Indicator */}
          {filteredEvents.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-3">
              {filteredEvents.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToIndex(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === currentIndex ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Ir al evento ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
