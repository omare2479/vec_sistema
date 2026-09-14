import React, { useState, useEffect, useRef } from 'react';
import { Song, ThemeMode } from '../types';
import { THEMES } from '../utils/theme';

interface StageModeModalProps {
  songs: Song[];
  initialSongIndex: number;
  onClose: () => void;
  currentTheme: ThemeMode;
}

export const StageModeModal: React.FC<StageModeModalProps> = ({
  songs,
  initialSongIndex,
  onClose,
  currentTheme,
}) => {
  const theme = THEMES[currentTheme];
  const [currentIndex, setCurrentIndex] = useState(initialSongIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const [fontSize, setFontSize] = useState<'md' | 'lg' | 'xl'>('lg');
  const stageContainerRef = useRef<HTMLDivElement>(null);

  const currentSong = songs[currentIndex] || songs[0];

  useEffect(() => {
    let animId: number;
    if (isPlaying && stageContainerRef.current) {
      const step = () => {
        if (stageContainerRef.current) {
          stageContainerRef.current.scrollTop += scrollSpeed * 0.8;
        }
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, scrollSpeed]);

  const fontSizeClasses = {
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col select-none animate-fadeIn">
      {/* Stage Header */}
      <div className="h-16 px-4 bg-[#0a0f24] border-b border-white/20 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 font-bold flex items-center gap-1 text-xs"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Salir de Escenario</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-bold text-xs">
              {currentSong.orderNumber}
            </span>
            <span className="font-extrabold text-white text-base sm:text-lg truncate max-w-[200px] sm:max-w-md">
              {currentSong.title}
            </span>
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-bold font-mono">
              Tono: {currentSong.currentKey}
            </span>
          </div>
        </div>

        {/* Stage controls: Prev / Next, Auto-Scroll, Text size */}
        <div className="flex items-center gap-2">
          {/* Font Size */}
          <div className="hidden sm:flex items-center bg-white/10 rounded-lg p-0.5 text-xs font-bold">
            <button
              onClick={() => setFontSize('md')}
              className={`px-2 py-1 rounded ${fontSize === 'md' ? 'bg-amber-400 text-black' : 'text-slate-300'}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-1 rounded ${fontSize === 'lg' ? 'bg-amber-400 text-black' : 'text-slate-300'}`}
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xl')}
              className={`px-2 py-1 rounded ${fontSize === 'xl' ? 'bg-amber-400 text-black' : 'text-slate-300'}`}
            >
              A++
            </button>
          </div>

          {/* Autoscroll */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
              isPlaying ? 'bg-emerald-500 text-black shadow-[0_0_12px_#10b981]' : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
            <span className="hidden sm:inline">{isPlaying ? 'Pausar' : 'Rodar'}</span>
          </button>

          {/* Song Navigator */}
          <div className="flex items-center gap-1">
            <button
              disabled={currentIndex <= 0}
              onClick={() => {
                setCurrentIndex((prev) => Math.max(0, prev - 1));
                if (stageContainerRef.current) stageContainerRef.current.scrollTop = 0;
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30"
              title="Canto anterior"
            >
              <span className="material-symbols-outlined text-[18px]">skip_previous</span>
            </button>
            <span className="text-xs text-slate-400 font-mono px-1">
              {currentIndex + 1}/{songs.length}
            </span>
            <button
              disabled={currentIndex >= songs.length - 1}
              onClick={() => {
                setCurrentIndex((prev) => Math.min(songs.length - 1, prev + 1));
                if (stageContainerRef.current) stageContainerRef.current.scrollTop = 0;
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30"
              title="Siguiente canto"
            >
              <span className="material-symbols-outlined text-[18px]">skip_next</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Lyrics Display Container */}
      <div
        ref={stageContainerRef}
        className={`flex-1 p-6 sm:p-12 overflow-y-auto font-mono ${fontSizeClasses[fontSize]} leading-loose whitespace-pre bg-[#040817] text-slate-100 selection:bg-amber-400 selection:text-black`}
      >
        <div className="max-w-3xl mx-auto pb-32">
          <div className="text-amber-400 font-bold mb-4 tracking-wider uppercase text-sm border-b border-amber-400/20 pb-2">
            {currentSong.rhythmNote} • {currentSong.arrangementNote}
          </div>
          {currentSong.lyricsAndChords || `[Intro] ${currentSong.currentKey} - Do - Re - ${currentSong.currentKey}

[Verso 1]
${currentSong.currentKey}               Do
Ven ante su altar con corazón agradecido,
Re                    ${currentSong.currentKey}
canta con gozo al Señor de la vida.
${currentSong.currentKey}               Do
En su presencia no hay temor ni soledad,
Re                 ${currentSong.currentKey}
su gracia y amor nunca fallarán.

[Coro]
Do        Re           ${currentSong.currentKey}
Santo, digno es el Cordero,
Do        Re           Mim
gloria y honra para siempre.
Do        Re           ${currentSong.currentKey}
Te adoramos con el alma,
Do          Re        ${currentSong.currentKey}
Cristo Jesús, nuestro Salvador.`}
        </div>
      </div>

      {/* Stage Bottom Bar */}
      <div className="h-10 px-4 bg-[#0a0f24] border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <span>Banda & Ministerio Voces en Cristo • Modo Concierto</span>
        <div className="flex items-center gap-2">
          <span>Velocidad:</span>
          <button
            onClick={() => setScrollSpeed(0.8)}
            className={`px-2 py-0.5 rounded ${scrollSpeed === 0.8 ? 'bg-amber-400 text-black font-bold' : 'text-slate-400'}`}
          >
            Lenta
          </button>
          <button
            onClick={() => setScrollSpeed(1.2)}
            className={`px-2 py-0.5 rounded ${scrollSpeed === 1.2 ? 'bg-amber-400 text-black font-bold' : 'text-slate-400'}`}
          >
            Media
          </button>
          <button
            onClick={() => setScrollSpeed(1.8)}
            className={`px-2 py-0.5 rounded ${scrollSpeed === 1.8 ? 'bg-amber-400 text-black font-bold' : 'text-slate-400'}`}
          >
            Rápida
          </button>
        </div>
      </div>
    </div>
  );
};
