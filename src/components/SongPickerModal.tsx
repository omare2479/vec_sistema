import React, { useState } from 'react';
import { Song, ThemeMode } from '../types';
import { THEMES } from '../utils/theme';
import { X, Search, Music, BookOpen, Sparkles, ChevronRight, Eye } from 'lucide-react';

interface SongPickerModalProps {
  currentTheme: ThemeMode;
  songs: Song[];
  selectedSongId?: string;
  onSelectSong: (song: Song) => void;
  onOpenChordModal: (song: Song) => void;
  onOpenStageMode?: (index: number) => void;
  onClose: () => void;
}

export const SongPickerModal: React.FC<SongPickerModalProps> = ({
  currentTheme,
  songs,
  selectedSongId,
  onSelectSong,
  onOpenChordModal,
  onOpenStageMode,
  onClose,
}) => {
  const theme = THEMES[currentTheme];
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'todos' | 'adoracion' | 'animacion' | 'propios'>('todos');

  const filtered = songs.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rhythmNote.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.currentKey.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (categoryFilter === 'todos') return true;
    if (categoryFilter === 'adoracion') return s.category === 'adoracion';
    if (categoryFilter === 'animacion') return s.category === 'animacion';
    if (categoryFilter === 'propios') return s.category === 'propios' || s.isOriginalVEC;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#090f24] border border-white/20 rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.35)] shrink-0">
              <div className="w-full h-full bg-[#0a1128] rounded-[10px] flex items-center justify-center text-amber-400">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <span>Cancionero del Ministerio VEC</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {songs.length} cantos
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Selecciona cualquier canto para ver sus acordes, tono y pista
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar selector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Categories */}
        <div className="p-3.5 sm:p-4 border-b border-white/10 bg-black/40 flex flex-col gap-2.5">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, tono, ritmo o momento..."
              className="w-full pl-10 pr-4 py-2 bg-black/60 border border-white/15 rounded-xl text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              onClick={() => setCategoryFilter('todos')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === 'todos'
                  ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
              }`}
            >
              Todos ({songs.length})
            </button>
            <button
              onClick={() => setCategoryFilter('adoracion')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                categoryFilter === 'adoracion'
                  ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
              }`}
            >
              🙏 Adoración
            </button>
            <button
              onClick={() => setCategoryFilter('animacion')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                categoryFilter === 'animacion'
                  ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
              }`}
            >
              🔥 Animación
            </button>
            <button
              onClick={() => setCategoryFilter('propios')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                categoryFilter === 'propios'
                  ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
              }`}
            >
              ✨ Propios VEC
            </button>
          </div>
        </div>

        {/* Songs List */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 flex flex-col gap-2 scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
              <Music className="w-10 h-10 text-slate-600 stroke-[1.5]" />
              <p className="text-sm font-bold text-white">No se encontraron cantos</p>
              <p className="text-xs text-slate-400">Intenta con otro término de búsqueda o categoría</p>
            </div>
          ) : (
            filtered.map((song) => {
              const isSelected = song.id === selectedSongId;
              const originalIndex = songs.findIndex((s) => s.id === song.id);

              return (
                <div
                  key={song.id}
                  className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400 shadow-md'
                      : 'bg-black/40 border-white/10 hover:bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div
                    onClick={() => {
                      onSelectSong(song);
                      onClose();
                    }}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-black/60 border border-white/15 flex items-center justify-center shrink-0 text-amber-400 font-mono text-xs font-bold group-hover:border-amber-400/50">
                      {song.orderNumber || '🎵'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                          {song.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          {song.currentKey || 'Sol'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            song.category === 'adoracion'
                              ? 'bg-amber-500/20 text-amber-300'
                              : song.category === 'animacion'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-sky-500/20 text-sky-300'
                          }`}
                        >
                          {song.categoryLabel || song.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {song.subtitle} • {song.rhythmNote}
                      </p>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => {
                        onSelectSong(song);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                      title="Ver este canto en el repertorio"
                    >
                      <span>Ver Canto</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        onOpenChordModal(song);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 border border-white/15 text-xs font-bold transition-all cursor-pointer"
                      title="Abrir acordes y pista musical"
                    >
                      <span>Acordes</span>
                    </button>

                    {onOpenStageMode && originalIndex !== -1 && (
                      <button
                        onClick={() => {
                          onOpenStageMode(originalIndex);
                          onClose();
                        }}
                        className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
                        title="Abrir en Modo Escenario"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs text-slate-400">
          <span>Mostrando {filtered.length} de {songs.length} cantos</span>
          <button
            onClick={onClose}
            className="px-4 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-semibold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
