import React, { useState, useEffect, useRef } from 'react';
import { Song, ThemeMode } from '../types';
import { THEMES } from '../utils/theme';
import { globalAudioPlayer } from '../utils/audioPlayer';

interface ChordViewerModalProps {
  song: Song;
  onClose: () => void;
  currentTheme: ThemeMode;
  isAdmin?: boolean;
  onEditSong?: (song: Song) => void;
}

const MUSICAL_KEYS = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];

export const ChordViewerModal: React.FC<ChordViewerModalProps> = ({ song, onClose, currentTheme, isAdmin = false, onEditSong }) => {
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

          <div className="flex items-center gap-2">
            {isAdmin && onEditSong && (
              <button
                onClick={() => {
                  onClose();
                  onEditSong(song);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
                title="Editar letra y acordes de este canto"
              >
                <span className="material-symbols-outlined text-[15px]">edit</span>
                <span>Editar Acordes</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
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

        {/* Modal Footer with Streaming Links */}
        <div className="p-3 bg-[#060b1b] border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <a
              href={song.spotifyUrl || `https://open.spotify.com/search/Voces%20en%20Cristo%20${encodeURIComponent(song.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#1DB954]/20 hover:bg-[#1DB954]/30 text-[#1ED760] border border-[#1DB954]/40 font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Escuchar en Spotify"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              <span>Spotify</span>
            </a>

            <a
              href={song.amazonMusicUrl || `https://music.amazon.com/search/Voces+en+Cristo+${encodeURIComponent(song.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#00A8E1]/20 hover:bg-[#00A8E1]/30 text-[#00A8E1] border border-[#00A8E1]/40 font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Escuchar en Amazon Music"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M13.9 11.7c-.1-.7-.6-1.2-1.6-1.2-.9 0-1.5.5-1.7 1.2h3.3zm-3.3 2.1c0 .8.6 1.3 1.6 1.3.8 0 1.3-.3 1.6-.9h1.7c-.4 1.4-1.6 2.2-3.3 2.2-2.1 0-3.5-1.4-3.5-3.6 0-2.2 1.4-3.6 3.4-3.6 2.2 0 3.5 1.5 3.5 3.6v.9h-5zm-5.4-3.8h1.9v7.1H5.2v-7.1zm.9-1.5c-.7 0-1.2-.5-1.2-1.2 0-.7.5-1.2 1.2-1.2.7 0 1.2.5 1.2 1.2 0 .7-.5 1.2-1.2 1.2zm13.1 5.3c0-1.4-.9-2.3-2.3-2.3-.9 0-1.6.4-2 1.1v-1h-1.8v7.1h1.9v-3.7c0-.8.5-1.4 1.3-1.4.7 0 1 .4 1 1.2v3.9h1.9v-4.9z"/>
              </svg>
              <span>Amazon Music</span>
            </a>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">print</span>
            <span>Imprimir Cifrado</span>
          </button>
        </div>
      </div>
    </div>
  );
};
