import React, { useState, useRef } from 'react';
import { ThemeMode, Song, BandDocument } from '../types';
import { THEMES } from '../utils/theme';
import { formatBytes } from '../utils/documentStorage';
import { uploadDocumentToSupabase } from '../utils/supabaseUpload';
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  FileCode,
  Music,
  Plus,
  Eye,
  Download,
  Layers,
} from 'lucide-react';

interface ImportSongDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeMode;
  onAddSong: (newSong: Song) => void;
  onAddDocument: (newDoc: BandDocument) => void;
}

export const ImportSongDocumentModal: React.FC<ImportSongDocumentModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onAddSong,
  onAddDocument,
}) => {
  const theme = THEMES[currentTheme];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [fileContentText, setFileContentText] = useState<string>('');
  const [fileExtension, setFileExtension] = useState<'pdf' | 'doc' | 'docx' | 'txt'>('pdf');

  // Form fields
  const [songTitle, setSongTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<'adoracion' | 'animacion' | 'propios' | 'liturgico'>('adoracion');
  const [selectedKey, setSelectedKey] = useState('Sol');
  const [rhythmNote, setRhythmNote] = useState('');
  const [addToBandFiles, setAddToBandFiles] = useState(true);
  const [addToSongList, setAddToSongList] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    setSuccess(null);
    setIsProcessing(true);

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'doc' && ext !== 'docx' && ext !== 'txt') {
      setError('Formato no compatible. Por favor sube un archivo PDF (.pdf), Word (.doc / .docx) o texto (.txt).');
      setIsProcessing(false);
      return;
    }

    setFileExtension(ext as any);
    setSelectedFile(file);

    // Auto-detect title from filename (strip extension and replace underscores/dashes)
    const rawName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const cleanTitle = rawName
      .replace(/[_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    setSongTitle(cleanTitle);
    setSubtitle(`Partitura / Cifrado importado de ${file.name}`);

    // Read as DataURL for storage and download
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setFileDataUrl(dataUrl);

      // If txt, also read text
      if (ext === 'txt') {
        const textReader = new FileReader();
        textReader.onload = (ev) => {
          setFileContentText((ev.target?.result as string) || '');
          setIsProcessing(false);
        };
        textReader.readAsText(file);
      } else {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setError('Error al leer el archivo. Intenta de nuevo.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Por favor selecciona primero un archivo PDF o DOC.');
      return;
    }
    if (!songTitle.trim()) {
      setError('El canto requiere un título.');
      return;
    }

    const categoryLabels: Record<string, string> = {
      adoracion: 'Adoración y Contemplación',
      animacion: 'Animación y Alabanza Viva',
      propios: 'Canto Propio VEC Original',
      liturgico: 'Liturgia & Santa Misa',
    };

    setIsProcessing(true);
    // Subir documento a la nube Supabase
    let finalDocUrl = await uploadDocumentToSupabase(selectedFile);
    if (!finalDocUrl) {
      finalDocUrl = fileDataUrl; // Fallback local
    }

    const docId = `doc-${Date.now()}`;
    const nowStr = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newDoc: BandDocument = {
      id: docId,
      name: selectedFile.name,
      type: fileExtension,
      sizeFormatted: formatBytes(selectedFile.size),
      sizeBytes: selectedFile.size,
      uploadedAt: nowStr,
      description: subtitle || `Archivo importado para el canto ${songTitle}`,
      dataUrl: finalDocUrl,
      textContent: fileContentText || undefined,
      associatedSongTitle: songTitle.trim(),
      isUserUploaded: true,
    };

    if (addToBandFiles) {
      onAddDocument(newDoc);
    }

    if (addToSongList) {
      const newSong: Song = {
        id: `song-${Date.now()}`,
        orderNumber: 'Set',
        title: songTitle.trim(),
        subtitle: subtitle.trim() || `Material en ${fileExtension.toUpperCase()}: ${selectedFile.name}`,
        category,
        categoryLabel: categoryLabels[category] || 'Adoración',
        duration: '5:00 min',
        originalKey: selectedKey,
        currentKey: selectedKey,
        rhythmNote: rhythmNote.trim() || `${selectedKey} Mayor • Doc ${fileExtension.toUpperCase()}`,
        arrangementNote: `Archivo adjunto: ${selectedFile.name} (${formatBytes(selectedFile.size)})`,
        introTags: [fileExtension.toUpperCase(), selectedKey + ' Mayor', 'Importado'],
        attachedDocName: selectedFile.name,
        attachedDocUrl: finalDocUrl,
        attachedDocType: fileExtension,
        lyricsAndChords: fileContentText || undefined,
      };

      onAddSong(newSong);
    }

    setIsProcessing(false);
    setSuccess(`¡Archivo ${selectedFile.name} subido a la nube e importado exitosamente!`);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#091126] border border-white/20 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden my-auto backdrop-blur-2xl z-10 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-[#060b1c] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Importar Canto o Partitura
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/30 uppercase">
                  PDF / DOC / DOCX
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Sube guiones, partituras o cifrados para integrarlos al repertorio y material de la banda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-5 text-xs text-slate-200">
          {/* Drag & Drop Upload Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-amber-400 bg-amber-400/15 scale-[1.01]'
                : selectedFile
                ? 'border-emerald-400/50 bg-emerald-950/20'
                : 'border-white/20 hover:border-amber-400/50 bg-black/40 hover:bg-white/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-white">{selectedFile.name}</p>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="px-2 py-0.5 rounded bg-white/10 font-mono font-bold uppercase text-amber-300">
                    {fileExtension}
                  </span>
                  <span>{formatBytes(selectedFile.size)}</span>
                </div>
                <p className="text-[11px] text-emerald-400/90 mt-1">
                  Archivo cargado correctamente. Haz clic para cambiar de archivo.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center text-amber-400 shadow-inner group-hover:scale-105 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold text-white">
                    Arrastra y suelta tu archivo PDF o DOC aquí
                  </p>
                  <p className="text-xs text-slate-400">
                    o haz clic para examinar en tu computadora o teléfono
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-1 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-bold">
                    PDF (.pdf)
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-300 text-[10px] font-bold">
                    Word (.doc / .docx)
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                    Texto / Acordes (.txt)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Song Metadata Form (active when file selected) */}
          {selectedFile && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Título del Canto *
                  </label>
                  <input
                    type="text"
                    required
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    placeholder="Ej. Cuan Grande es Dios"
                    className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Categoría Litúrgica / Tipo
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="adoracion">Adoración y Contemplación</option>
                    <option value="animacion">Animación y Alabanza Viva</option>
                    <option value="propios">Canto Propio VEC Original</option>
                    <option value="liturgico">Liturgia & Santa Misa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tono Musical (Tonalidad)
                  </label>
                  <select
                    value={selectedKey}
                    onChange={(e) => setSelectedKey(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'].map((k) => (
                      <option key={k} value={k}>
                        {k} Mayor
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Ritmo u Observaciones
                  </label>
                  <input
                    type="text"
                    value={rhythmNote}
                    onChange={(e) => setRhythmNote(e.target.value)}
                    placeholder="Ej. Balada 68 BPM, Acústico + Banda"
                    className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Descripción o Anotación
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ej. Set de adoración con guion para bajo y guitarra..."
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Destination checkboxes */}
              <div className="p-3 bg-black/30 border border-white/10 rounded-xl flex flex-col gap-2">
                <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                  ¿Dónde deseas registrar este archivo?
                </p>
                <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addToSongList}
                    onChange={(e) => setAddToSongList(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400 bg-black/50 border-white/20"
                  />
                  <span>
                    <strong>Agregar al Repertorio de Cantos</strong> (aparecerá en la lista de canciones y teleprompter)
                  </span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addToBandFiles}
                    onChange={(e) => setAddToBandFiles(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400 bg-black/50 border-white/20"
                  />
                  <span>
                    <strong>Guardar en Partituras & Material de la Banda</strong> (en la pestaña Archivos & Cifrados)
                  </span>
                </label>
              </div>

              {/* Feedback */}
              {error && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Completar Importación</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
