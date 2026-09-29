import React, { useState, useRef } from 'react';
import { Song, ThemeMode } from '../types';
import { THEMES } from '../utils/theme';
import {
  Music, Save, X, Eye, Edit3, Plus, Sparkles, Sliders,
  HelpCircle, Check, ArrowRight
} from 'lucide-react';

interface SongEditorModalProps {
  currentTheme: ThemeMode;
  song?: Song | null;
  onSave: (song: Song) => void;
  onClose: () => void;
}

const MUSICAL_KEYS = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];

const QUICK_CHORDS = [
  'Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si',
  'C', 'D', 'E', 'F', 'G', 'A', 'B',
  'Lam', 'Rem', 'Mim', 'Fa#m', 'Sim', 'Solm',
  'Am', 'Dm', 'Em', 'F#m', 'Bm', 'Gm',
  'Sol7', 'Re7', 'La7', 'Do7', 'Mi7',
  'G7', 'D7', 'A7', 'C7', 'E7',
];

const QUICK_SECTIONS = ['[Intro]', '[Verso 1]', '[Verso 2]', '[Pre-Coro]', '[Coro]', '[Puente]', '[Solo]', '[Outro]'];

export const SongEditorModal: React.FC<SongEditorModalProps> = ({
  currentTheme,
  song,
  onSave,
  onClose,
}) => {
  const theme = THEMES[currentTheme];
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Form State
  const [title, setTitle] = useState(song?.title || '');
  const [subtitle, setSubtitle] = useState(song?.subtitle || '');
  const [category, setCategory] = useState<Song['category']>(song?.category || 'adoracion');
  const [originalKey, setOriginalKey] = useState(song?.originalKey || 'Sol');
  const [duration, setDuration] = useState(song?.duration || '4:30 min');
  const [tempoBpm, setTempoBpm] = useState<number | undefined>(song?.tempoBpm || 72);
  const [rhythmNote, setRhythmNote] = useState(song?.rhythmNote || 'Balada Adoración • 4/4');
  const [arrangementNote, setArrangementNote] = useState(song?.arrangementNote || 'Acústico y Banda Completa');
  const [spotifyUrl, setSpotifyUrl] = useState(song?.spotifyUrl || '');
  const [amazonMusicUrl, setAmazonMusicUrl] = useState(song?.amazonMusicUrl || '');

  // Lyrics and chords content
  const defaultTemplate = `[Intro] ${originalKey} - C - D - ${originalKey}

[Verso 1]
${originalKey}               C
Ven ante su altar con corazón agradecido,
D                    ${originalKey}
canta con gozo al Señor de la vida.
${originalKey}               C
En su presencia no hay temor ni soledad,
D                 ${originalKey}
su gracia y amor nunca fallarán.

[Coro]
C        D           ${originalKey}
Santo, digno es el Cordero,
C        D           Em
gloria y honra para siempre.
C        D           ${originalKey}
Te adoramos con el alma,
C          D        ${originalKey}
Cristo Jesús, nuestro Salvador.`;

  const [lyricsAndChords, setLyricsAndChords] = useState(song?.lyricsAndChords || defaultTemplate);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [previewKey, setPreviewKey] = useState(originalKey);

  // Helper to insert text at textarea cursor position
  const insertAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setLyricsAndChords((prev) => prev + '\n' + textToInsert);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;

    const newText = currentText.substring(0, start) + textToInsert + currentText.substring(end);
    setLyricsAndChords(newText);

    // Reposition cursor right after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const categoryLabels: Record<Song['category'], string> = {
      adoracion: 'Adoración y Contemplación',
      animacion: 'Animación y Alabanza Viva',
      propios: 'Canto Propio VEC Original',
      liturgico: 'Liturgia & Santa Misa',
    };

    const updatedSong: Song = {
      id: song?.id || `song-${Date.now()}`,
      orderNumber: song?.orderNumber || 'Set',
      title: title.trim(),
      subtitle: subtitle.trim() || 'Arreglo oficial para el ministerio',
      category,
      categoryLabel: categoryLabels[category],
      duration: duration.trim() || '4:30 min',
      originalKey,
      currentKey: song?.currentKey || originalKey,
      tempoBpm: tempoBpm || 72,
      rhythmNote: rhythmNote.trim() || `${originalKey} Mayor • 4/4`,
      arrangementNote: arrangementNote.trim() || 'Arreglo acústico y banda completa',
      introTags: [category === 'propios' ? 'VEC Original' : 'Repertorio', originalKey + ' Mayor'],
      isOriginalVEC: category === 'propios',
      lyricsAndChords,
      spotifyUrl: spotifyUrl.trim() || undefined,
      amazonMusicUrl: amazonMusicUrl.trim() || undefined,
    };

    onSave(updatedSong);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl bg-[#091129] border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#060b1b] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {song ? 'Editar Canto & Cifrado' : 'Subir Nueva Canción con Acordes'}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-semibold">
                  Modo Editor
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Escribe la letra y coloca los acordes exactamente encima de las sílabas deseadas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="inline-flex rounded-xl bg-black/40 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'editor'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'preview'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Vista Previa</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden">
          {/* Top metadata fields */}
          <div className="p-4 bg-[#0a1435] border-b border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-3 shrink-0 text-xs">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Título del Canto *</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. En Tu Presencia"
                className="w-full px-3 py-1.5 bg-black/40 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-slate-500 font-bold"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Song['category'])}
                className="w-full px-2.5 py-1.5 bg-black/40 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="adoracion">Adoración y Contemplación</option>
                <option value="animacion">Animación y Alabanza</option>
                <option value="propios">Canto Propio VEC</option>
                <option value="liturgico">Liturgia / Misa</option>
              </select>
            </div>

            {/* Key */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tono Original *</label>
              <select
                value={originalKey}
                onChange={(e) => {
                  setOriginalKey(e.target.value);
                  setPreviewKey(e.target.value);
                }}
                className="w-full px-2.5 py-1.5 bg-black/40 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 font-bold text-amber-300"
              >
                {MUSICAL_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            {/* Subtitle / Description */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Subtítulo / Autor</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ej. Canto para Comunión y Adoración al Santísimo"
                className="w-full px-3 py-1.5 bg-black/40 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-slate-500"
              />
            </div>

            {/* Duration & BPM */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Duración</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="5:00 min"
                  className="w-full px-2.5 py-1.5 bg-black/40 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tempo BPM</label>
                <input
                  type="number"
                  value={tempoBpm || ''}
                  onChange={(e) => setTempoBpm(Number(e.target.value) || undefined)}
                  placeholder="72"
                  className="w-full px-2.5 py-1.5 bg-black/40 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* Rhythm note */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Ritmo / Compás</label>
              <input
                type="text"
                value={rhythmNote}
                onChange={(e) => setRhythmNote(e.target.value)}
                placeholder="Balada • 4/4"
                className="w-full px-2.5 py-1.5 bg-black/40 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Main workspace (Editor vs Preview) */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#070c1e]">
            {activeTab === 'editor' ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Chord quick inserter bar */}
                <div className="p-2.5 bg-black/40 border-b border-white/10 flex flex-wrap items-center gap-1.5 overflow-x-auto shrink-0 text-xs">
                  <span className="text-[11px] font-bold text-amber-300 mr-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Insertar:
                  </span>

                  {/* Section badges */}
                  {QUICK_SECTIONS.map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => insertAtCursor(`\n${sec}\n`)}
                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-mono font-semibold transition-colors"
                      title={`Insertar sección ${sec}`}
                    >
                      {sec}
                    </button>
                  ))}

                  <div className="w-px h-4 bg-white/20 mx-1" />

                  {/* Quick chords */}
                  {QUICK_CHORDS.slice(0, 16).map((chord) => (
                    <button
                      key={chord}
                      type="button"
                      onClick={() => insertAtCursor(`${chord} `)}
                      className="px-2 py-0.5 rounded bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 text-[11px] font-mono font-bold transition-colors"
                      title={`Insertar acorde ${chord}`}
                    >
                      {chord}
                    </button>
                  ))}
                </div>

                {/* Textarea editor */}
                <div className="flex-1 relative p-3 sm:p-4 overflow-hidden flex flex-col">
                  <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                    <span>
                      Usa fuente monoespaciada para alinear los acordes sobre la letra:
                    </span>
                    <span className="text-amber-300 font-mono text-[10px]">
                      {lyricsAndChords.split('\n').length} líneas
                    </span>
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={lyricsAndChords}
                    onChange={(e) => setLyricsAndChords(e.target.value)}
                    placeholder="Escribe la letra y coloca los acordes arriba..."
                    className="flex-1 w-full bg-[#050814] text-slate-100 font-mono text-xs sm:text-sm p-4 rounded-xl border border-white/15 focus:outline-none focus:border-amber-400 leading-relaxed resize-none overflow-y-auto selection:bg-amber-400/30 shadow-inner"
                    spellCheck={false}
                  />
                </div>
              </div>
            ) : (
              /* Live Preview Styled exactly like ChordViewerModal */
              <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 bg-[#070d22]">
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 mb-3 text-xs flex-wrap gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{title || 'Título del canto'}</span>
                    <span className="text-amber-300">Tono original: {originalKey}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Vista previa del cifrado para músicos</span>
                  </div>
                </div>

                <div className="flex-1 bg-[#050814] p-5 rounded-xl border border-white/10 overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre text-slate-100 shadow-inner">
                  {lyricsAndChords || '(No hay letra ni acordes cargados aún)'}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-3 border-t border-white/10 bg-[#060b1b] flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Los cambios se guardan de forma permanente.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all hover:brightness-110 cursor-pointer ${theme.tabActiveBg} ${theme.tabActiveText}`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>{song ? 'Guardar Cambios' : 'Guardar y Publicar Canto'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
