import React, { useState, useRef } from 'react';
import { Song, ThemeMode } from '../types';
import { THEMES } from '../utils/theme';
import { FileText, Upload, CheckCircle, Paperclip } from 'lucide-react';

interface AddSongModalProps {
  onClose: () => void;
  onAddSong: (newSong: Song) => void;
  currentTheme: ThemeMode;
}

export const AddSongModal: React.FC<AddSongModalProps> = ({ onClose, onAddSong, currentTheme }) => {
  const theme = THEMES[currentTheme];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<'adoracion' | 'animacion' | 'propios' | 'liturgico'>('adoracion');
  const [key, setKey] = useState('Sol');
  const [duration, setDuration] = useState('5:00 min');
  const [rhythmNote, setRhythmNote] = useState('');
  const [arrangementNote, setArrangementNote] = useState('');

  // Optional Attached PDF / DOC File
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedDataUrl, setAttachedDataUrl] = useState<string>('');

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachedFile(file);

      // If title is blank, fill from file name
      if (!title) {
        const raw = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setTitle(raw.replace(/[_-]/g, ' ').trim());
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachedDataUrl((ev.target?.result as string) || '');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const categoryLabels: Record<string, string> = {
      adoracion: 'Adoración y Contemplación',
      animacion: 'Animación y Alabanza Viva',
      propios: 'Canto Propio VEC Original',
      liturgico: 'Liturgia & Santa Misa'
    };

    const ext = attachedFile ? (attachedFile.name.split('.').pop()?.toLowerCase() as any) : undefined;

    const newSong: Song = {
      id: `song-${Date.now()}`,
      orderNumber: 'Set',
      title: title.trim(),
      subtitle: subtitle.trim() || (attachedFile ? `Material importado de: ${attachedFile.name}` : 'Canto programado para el servicio del ministerio.'),
      category,
      categoryLabel: categoryLabels[category] || 'Adoración',
      duration,
      originalKey: key,
      currentKey: key,
      rhythmNote: rhythmNote.trim() || `${key} Mayor • Arreglo Banda`,
      arrangementNote: arrangementNote.trim() || (attachedFile ? `Archivo adjunto: ${attachedFile.name}` : 'Arreglo acústico y banda completa'),
      introTags: [attachedFile ? (ext?.toUpperCase() || 'DOC') : 'Nuevo', key + ' Mayor'],
      attachedDocName: attachedFile?.name,
      attachedDocUrl: attachedDataUrl || undefined,
      attachedDocType: ext,
    };

    onAddSong(newSong);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0c1430] border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#070c20] shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-[22px]">add_circle</span>
            <h2 className="text-lg font-bold text-white">Agendar Canto al Setlist</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-xs overflow-y-auto">
          {/* Optional PDF/DOC Upload Shortcut */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-amber-400/10 hover:bg-amber-400/15 border border-amber-400/30 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelected}
              className="hidden"
            />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                <Paperclip className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {attachedFile ? attachedFile.name : '¿Tienes el canto en PDF o Word?'}
                </p>
                <p className="text-[11px] text-amber-300/80">
                  {attachedFile ? 'Archivo vinculado al canto' : 'Haz clic para adjuntar archivo PDF, DOC o TXT'}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold text-[11px] shrink-0"
            >
              {attachedFile ? 'Cambiar' : 'Importar'}
            </button>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nombre del Canto *</label>
            <input
              type="text"
              required
              placeholder="Ej. Cuan Grande es Dios, Sumérgeme..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Descripción o Momento</label>
            <input
              type="text"
              placeholder="Ej. Invocación al Espíritu Santo, momento de sanación..."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-2.5 py-2 bg-black/40 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="adoracion">Adoración</option>
                <option value="animacion">Animación</option>
                <option value="propios">Propio VEC</option>
                <option value="liturgico">Litúrgico</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tono Principal</label>
              <select
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full px-2.5 py-2 bg-black/40 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si', 'Re m', 'Mi m', 'La m'].map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Duración Aprox.</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nota de Ritmo / Tempo</label>
            <input
              type="text"
              placeholder="Ej. Sol Mayor • Clímax con Banda o 120 BPM"
              value={rhythmNote}
              onChange={(e) => setRhythmNote(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-lg font-bold ${theme.primaryGradient} text-black shadow-lg hover:brightness-110 active:scale-95 transition-all`}
            >
              Guardar en Setlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
