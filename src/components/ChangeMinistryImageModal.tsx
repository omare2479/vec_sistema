import React, { useState, useRef } from 'react';
import {
  Image,
  Upload,
  Link as LinkIcon,
  RotateCcw,
  Check,
  AlertCircle,
  X,
  Sparkles,
  Info
} from 'lucide-react';
import { ThemeMode } from '../types';
import { THEMES } from '../utils/theme';

interface ChangeMinistryImageModalProps {
  currentTheme: ThemeMode;
  currentImage: string;
  onSaveImage: (newImageUrl: string) => void;
  onResetToDefault: () => void;
  onClose: () => void;
}

export const ChangeMinistryImageModal: React.FC<ChangeMinistryImageModalProps> = ({
  currentTheme,
  currentImage,
  onSaveImage,
  onResetToDefault,
  onClose,
}) => {
  const theme = THEMES[currentTheme];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string>(currentImage);
  const [urlInput, setUrlInput] = useState<string>('');
  const [activeMode, setActiveMode] = useState<'upload' | 'url'>('upload');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isDefaultImage = currentImage === '/vec.jpg' || currentImage === '/vec_logo_splash.jpg';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP, etc.).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('La imagen excede 8 MB. Por favor elige una imagen más ligera.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setPreviewUrl(result);
        setSuccess('¡Imagen cargada exitosamente! Haz clic en "Guardar Imagen".');
      }
    };
    reader.onerror = () => {
      setError('Ocurrió un error al leer el archivo. Intenta con otra imagen.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setError('Por favor ingresa un enlace URL válido.');
      return;
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) {
      setError('La URL debe comenzar con http:// o https://');
      return;
    }
    setPreviewUrl(trimmed);
    setSuccess('URL aplicada en la vista previa. Haz clic en "Guardar Imagen".');
  };

  const handleSave = () => {
    if (!previewUrl) {
      setError('No hay imagen seleccionada para guardar.');
      return;
    }
    onSaveImage(previewUrl);
    setSuccess('¡Imagen del Ministerio actualizada con éxito!');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleReset = () => {
    onResetToDefault();
    setPreviewUrl('/vec.jpg');
    setUrlInput('');
    setSuccess('Se ha restablecido a la imagen original intacta (/vec.jpg).');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-xl">
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${theme.glowColor}, transparent 70%)`,
        }}
      />

      <div className="relative w-full max-w-2xl bg-[#091126] border border-white/20 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden my-auto backdrop-blur-2xl z-10 p-5 sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Image className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Imagen Oficial del Ministerio
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 font-semibold uppercase">
                  VEC
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                La imagen se guarda tal cual (100% original, sin filtros ni modificaciones de diseño, con máxima calidad)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-5 items-start">
          {/* Left Column: Preview of the image in the sacred frame */}
          <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-black/40 border border-white/10">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Vista Previa (Tal Cual)
            </span>

            <div className="relative group my-1">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 opacity-60 blur-sm" />
              <div className="relative w-44 aspect-square rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 bg-slate-950 flex items-center justify-center p-1">
                <img
                  src={previewUrl}
                  alt="Vista previa VEC"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={() => {
                    setError('No se pudo cargar la imagen desde la fuente indicada.');
                  }}
                />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isDefaultImage ? 'Imagen Original VEC (/vec.jpg)' : 'Imagen Personalizada (Fiel 100%)'}</span>
            </div>

            {/* Small Header logo preview */}
            <div className="mt-3 w-full pt-3 border-t border-white/10 flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-amber-400/40 shadow bg-black shrink-0 p-0.5">
                <img src={previewUrl} alt="Logo miniatura" className="w-full h-full object-contain" />
              </div>
              <span className="text-[10px] text-slate-400">Cómo se verá en la cabecera</span>
            </div>
          </div>

          {/* Right Column: Controls to Upload, Use URL, or Reset */}
          <div className="md:col-span-7 flex flex-col gap-4">
            {/* Mode Tabs */}
            <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('upload');
                  setError(null);
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeMode === 'upload'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Subir Archivo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveMode('url');
                  setError(null);
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeMode === 'url'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Enlace Web (URL)</span>
              </button>
            </div>

            {/* Subir Archivo Mode */}
            {activeMode === 'upload' && (
              <div className="flex flex-col gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-white/25 hover:border-amber-400/70 bg-white/5 hover:bg-white/10 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-400/15 group-hover:bg-amber-400/25 text-amber-300 flex items-center justify-center transition-transform group-hover:scale-110">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-white">
                    Haz clic aquí para seleccionar una nueva foto
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Compatible con JPG, PNG, WEBP de alta calidad
                  </span>
                </button>
              </div>
            )}

            {/* Enlace URL Mode */}
            {activeMode === 'url' && (
              <form onSubmit={handleApplyUrl} className="flex flex-col gap-2.5">
                <label className="text-xs font-medium text-slate-300">
                  Pega la dirección web de la imagen:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://ejemplo.com/mi-imagen-vec.jpg"
                    className="flex-1 bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all cursor-pointer"
                  >
                    Probar
                  </button>
                </div>
              </form>
            )}

            {/* Explanatory notes: Future-proofing guarantee */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5 text-slate-300 text-[11px] leading-relaxed">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">
                  ¿Cómo cambiar la imagen en el futuro?
                </strong>
                <p>
                  1. <strong>Desde aquí:</strong> Puedes subir un archivo nuevo o pegar una URL en cualquier momento.
                </p>
                <p className="mt-1">
                  2. <strong>En el código / archivos:</strong> El archivo raíz se encuentra en <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">/public/vec.jpg</code>. Sustituir ese archivo actualizará la imagen por defecto para siempre.
                </p>
              </div>
            </div>

            {/* Bottom Actions: Save, Reset to original, Cancel */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Imagen del Ministerio</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                title="Volver a la imagen original intacta /vec.jpg"
                className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Restablecer Original</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
