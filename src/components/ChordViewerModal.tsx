import React, { useState, useEffect, useRef } from 'react';
import { Song, ThemeMode } from '../types';
import { THEMES } from '../utils/theme';
import { globalAudioPlayer } from '../utils/audioPlayer';

interface ChordViewerModalProps {
  song: Song;
  onClose: () => void;
  currentTheme: ThemeMode;
}

const MUSICAL_KEYS = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];

export const ChordViewerModal: React.FC<ChordViewerModalProps> = ({ song, onClose, currentTheme }) => {
  const theme = THEMES[currentTheme];
  const [currentKey, setCurrentKey] = useState(song.currentKey || 'Sol');
  const [instrument, setInstrument] = useState<'guitar' | 'piano'>('guitar');
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);

  const transpose = (delta: number) => {
    const idx = MUSICAL_KEYS.indexOf(currentKey);
    const validIdx = idx === -1 ? 7 : idx;
    const newIdx = (validIdx + delta + MUSICAL_KEYS.length) % MUSICAL_KEYS.length;
    const newKey = MUSICAL_KEYS[newIdx];
    setCurrentKey(newKey);
    globalAudioPlayer.playNoteTone(newKey);
  };

  useEffect(() => {
    let animationFrameId: number;
    if (isAutoScrolling && contentRef.current) {
      const scrollStep = () => {
        if (contentRef.current) {
          contentRef.current.scrollTop += scrollSpeed * 0.7;
        }
        animationFrameId = requestAnimationFrame(scrollStep);
      };
      animationFrameId = requestAnimationFrame(scrollStep);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [isAutoScrolling, scrollSpeed]);

  const defaultLyrics = song.lyricsAndChords || `[Intro] ${currentKey} - C - D - ${currentKey}

[Verso 1]
${currentKey}               C
Ven ante su altar con corazón agradecido,
D                    ${currentKey}
canta con gozo al Señor de la vida.
${currentKey}               C
En su presencia no hay temor ni soledad,
D                 ${currentKey}
su gracia y amor nunca fallarán.

[Coro]
C        D           ${currentKey}
Santo, digno es el Cordero,
C        D           Em
gloria y honra para siempre.
C        D           ${currentKey}
Te adoramos con el alma,
C          D        ${currentKey}
Cristo Jesús, nuestro Salvador.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0a1128] border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#060b1b]">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${theme.primaryBadge}`}>
                {song.categoryLabel}
              </span>
              <span className="text-xs text-slate-400">Tono original: {song.originalKey}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1">{song.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Toolbar: Transposition, Instrument, Auto-Scroll */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#0e1738] border-b border-white/10 text-xs">
          {/* Tone transposition stepper */}
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-medium">Tono actual:</span>
            <div className="inline-flex items-center bg-black/40 border border-white/20 rounded-lg p-0.5">
              <button
                onClick={() => transpose(-1)}
                className="w-7 h-7 rounded flex items-center justify-center text-slate-200 hover:bg-white/10 active:scale-95 transition-all"
                title="Bajar medio tono"
              >
                <span className="material-symbols-outlined text-[15px]">remove</span>
              </button>
              <span className="w-12 text-center font-bold text-amber-400 text-sm">{currentKey}</span>
              <button
                onClick={() => transpose(1)}
                className="w-7 h-7 rounded flex items-center justify-center text-slate-200 hover:bg-white/10 active:scale-95 transition-all"
                title="Subir medio tono"
              >
                <span className="material-symbols-outlined text-[15px]">add</span>
              </button>
            </div>
          </div>

          {/* Instrument Toggle */}
          <div className="flex items-center bg-black/40 p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => setInstrument('guitar')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                instrument === 'guitar' ? 'bg-amber-400 text-amber-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">music_note</span>
              Guitarra
            </button>
            <button
              onClick={() => setInstrument('piano')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                instrument === 'piano' ? 'bg-amber-400 text-amber-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">piano</span>
              Teclado
            </button>
          </div>

          {/* Auto Scroll */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsAutoScrolling(!isAutoScrolling)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                isAutoScrolling
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                  : 'bg-white/5 text-slate-300 border-white/15 hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {isAutoScrolling ? 'pause' : 'arrow_downward'}
              </span>
              <span>Auto-scroll</span>
            </button>
            {isAutoScrolling && (
              <select
                value={scrollSpeed}
                onChange={(e) => setScrollSpeed(Number(e.target.value))}
                className="bg-black/60 border border-white/20 text-xs rounded px-1.5 py-1 text-slate-200"
              >
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            )}
          </div>
        </div>

        {/* Chord Diagrams Banner */}
        <div className="px-4 py-2 bg-black/30 border-b border-white/5 flex items-center gap-4 text-xs text-slate-300 overflow-x-auto">
          <span className="font-semibold text-amber-300 shrink-0">Acordes clave:</span>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-white/10 rounded font-mono font-bold text-sky-300">{currentKey}</span>
            <span className="px-2 py-0.5 bg-white/10 rounded font-mono font-bold text-sky-300">Do (C)</span>
            <span className="px-2 py-0.5 bg-white/10 rounded font-mono font-bold text-sky-300">Re (D)</span>
            <span className="px-2 py-0.5 bg-white/10 rounded font-mono font-bold text-sky-300">Mi m (Em)</span>
            <span className="px-2 py-0.5 bg-white/10 rounded font-mono font-bold text-sky-300">Lam (Am)</span>
          </div>
        </div>

        {/* Lyrics & Chords Viewable Content */}
        <div ref={contentRef} className="p-4 sm:p-6 overflow-y-auto flex-1 font-mono text-sm leading-relaxed whitespace-pre bg-[#070d22]">
          {defaultLyrics}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#060b1b] border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-400">Arreglo oficial del Ministerio Voces en Cristo</span>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">print</span>
            <span>Imprimir Cifrado</span>
          </button>
        </div>
      </div>
    </div>
  );
};
