import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Search,
  Trash2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Tag
} from 'lucide-react';
import { ThemeMode, GalleryPhoto, PhotoCategory } from '../types';
import { THEMES } from '../utils/theme';
import { uploadImageToSupabase } from '../utils/supabaseUpload';

interface GalleryModalProps {
  currentTheme: ThemeMode;
  photos: GalleryPhoto[];
  onClose: () => void;
  onAddPhotos: (newPhotos: GalleryPhoto[]) => void;
  onDeletePhoto: (id: string) => void;
  onResetToDefault: () => void;
  onSetAsWallpaper?: (imageUrl: string) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  currentTheme,
  photos,
  onClose,
  onAddPhotos,
  onDeletePhoto,
  onResetToDefault,
  onSetAsWallpaper,
}) => {
  const theme = THEMES[currentTheme];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeCategory, setActiveCategory] = useState<PhotoCategory>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const categories: { id: PhotoCategory; label: string }[] = [
    { id: 'todos', label: 'Todas las Fotos' },
    { id: 'conciertos', label: 'Conciertos en Vivo' },
    { id: 'ensayos', label: 'Ensayos & Banda' },
    { id: 'estudio', label: 'Estudio & TV' },
    { id: 'misiones', label: 'Misiones & Santa Misa' },
    { id: 'fraternidad', label: 'Fraternidad VEC' },
  ];

  const filteredPhotos = photos.filter((photo) => {
    const matchesCategory = activeCategory === 'todos' || photo.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      photo.title.toLowerCase().includes(q) ||
      (photo.description && photo.description.toLowerCase().includes(q)) ||
      (photo.tags && photo.tags.some((t) => t.toLowerCase().includes(q)));
    return matchesCategory && matchesSearch;
  });

  const handleProcessFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      setStatusMessage('Por favor selecciona archivos de imagen válidos (JPG, PNG, WEBP).');
      return;
    }

    setStatusMessage('Subiendo foto(s) a la nube Supabase...');
    const newPhotos: GalleryPhoto[] = [];

    for (let idx = 0; idx < fileArray.length; idx++) {
      const file = fileArray[idx];
      // Intenta subir a Supabase en la nube
      const publicUrl = await uploadImageToSupabase(file);

      // Si no hay red o bucket no configurado, usa fallback local dataUrl
      let finalImageUrl = publicUrl;
      if (!finalImageUrl) {
        finalImageUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || '');
          reader.readAsDataURL(file);
        });
      }

      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      newPhotos.push({
        id: `usr-p-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        title: cleanName.length > 2 ? cleanName : `Foto Ministerio VEC #${photos.length + idx + 1}`,
        description: `Foto del Ministerio VEC subida el ${new Date().toLocaleDateString('es-PE')}`,
        category: activeCategory === 'todos' ? 'conciertos' : activeCategory,
        date: new Date().toLocaleDateString('es-PE', { month: 'short', year: 'numeric' }),
        imageUrl: finalImageUrl,
        tags: ['VEC', 'Comunidad', 'Ministerio'],
        isUserUploaded: true,
        uploadedAt: Date.now() + idx,
      });
    }

    onAddPhotos(newPhotos);
    setStatusMessage(`¡${newPhotos.length} foto(s) guardadas exitosamente en la galería!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleProcessFiles(e.dataTransfer.files);
  };

  const handleRandomSelect = () => {
    if (photos.length === 0) return;
    const rand = photos[Math.floor(Math.random() * photos.length)];
    setSelectedPhoto(rand);
  };

  const handleNextLightbox = () => {
    if (!selectedPhoto) return;
    const currIdx = photos.findIndex((p) => p.id === selectedPhoto.id);
    const nextIdx = (currIdx + 1) % photos.length;
    setSelectedPhoto(photos[nextIdx]);
  };

  const handlePrevLightbox = () => {
    if (!selectedPhoto) return;
    const currIdx = photos.findIndex((p) => p.id === selectedPhoto.id);
    const prevIdx = (currIdx - 1 + photos.length) % photos.length;
    setSelectedPhoto(photos[prevIdx]);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fadeIn overflow-y-auto"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setIsDragging(false);
      }}
      onDrop={handleDrop}
    >
      <div
        className={`relative w-full max-w-5xl rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col max-h-[92vh] overflow-hidden my-auto`}
      >
        {/* Header Strip */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-md">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                Galería de Fotos & Recuerdos VEC
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {photos.length} Fotos
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Momentos en conciertos, grabaciones de estudio, ensayos y misiones parroquiales.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomSelect}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-sky-500/20 hover:from-amber-500/30 hover:to-sky-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Ver una foto aleatoria"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Foto Aleatoria</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Cerrar galería"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Upload Button, Search, Filters */}
        <div className="px-5 py-3 border-b border-white/10 bg-black/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? `${theme.tabActiveBg} ${theme.tabActiveText} shadow-sm font-bold`
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Actions: Search & Upload */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por título o tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition-colors"
              />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleProcessFiles(e.target.files)}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
              title="Subir fotos desde tu dispositivo"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir Fotos</span>
            </button>
          </div>
        </div>

        {/* Drag & Drop Alert or Status */}
        {statusMessage && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {isDragging && (
          <div className="mx-5 mt-3 p-6 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-500/15 text-amber-300 text-center font-bold text-sm animate-pulse flex flex-col items-center justify-center gap-2">
            <Upload className="w-8 h-8" />
            <span>¡Suelta aquí tus fotos para agregarlas a la galería de Voces en Cristo!</span>
          </div>
        )}

        {/* Photos Grid */}
        <div className="flex-1 p-5 overflow-y-auto min-h-[320px]">
          {filteredPhotos.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center gap-3 text-slate-400">
              <ImageIcon className="w-12 h-12 opacity-30 text-amber-400" />
              <p className="text-sm font-medium">No se encontraron fotos con este filtro o búsqueda.</p>
              <button
                onClick={() => {
                  setActiveCategory('todos');
                  setSearchQuery('');
                }}
                className="text-xs text-amber-400 hover:underline cursor-pointer"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/40 shadow-md hover:shadow-2xl hover:border-amber-400/50 transition-all duration-300 flex flex-col"
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/vec.jpg';
                    }}
                  />

                  {/* Gradient Overlay with Title */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity p-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-black/60 text-amber-300 border border-white/10 backdrop-blur-sm">
                        {photo.category}
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPhoto(photo);
                          }}
                          className="p-1.5 rounded-lg bg-black/60 hover:bg-amber-400 hover:text-black text-white transition-colors cursor-pointer shadow"
                          title="Ver en pantalla grande"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>

                        {photo.isUserUploaded && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('¿Deseas eliminar esta foto de la galería?')) {
                                onDeletePhoto(photo.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-black/60 hover:bg-rose-500 text-white transition-colors cursor-pointer shadow"
                            title="Eliminar foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div
                      className="cursor-pointer"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                        {photo.title}
                      </h3>
                      {photo.date && (
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {photo.date}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Reset Action */}
        <div className="px-5 py-3 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]"></span>
            <span>Las fotos se guardan automáticamente en tu navegador.</span>
          </div>

          <button
            onClick={() => {
              if (confirm('¿Restablecer la galería a las fotos predeterminadas del ministerio?')) {
                onResetToDefault();
                setStatusMessage('Galería restaurada a los valores de fábrica.');
                setTimeout(() => setStatusMessage(null), 3000);
              }
            }}
            className="flex items-center gap-1.5 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restablecer fotos iniciales</span>
          </button>
        </div>
      </div>

      {/* Lightbox / Fullscreen Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-3 sm:p-6 backdrop-blur-2xl animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Top Bar */}
          <div
            className="w-full max-w-5xl flex items-center justify-between text-white mb-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-amber-400 bg-amber-400/20 px-2.5 py-1 rounded-lg border border-amber-400/30">
                {selectedPhoto.category}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-200 line-clamp-1">
                {selectedPhoto.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {onSetAsWallpaper && (
                <button
                  onClick={() => {
                    onSetAsWallpaper(selectedPhoto.imageUrl);
                    setStatusMessage('¡Foto aplicada como fondo de pantalla central!');
                    setTimeout(() => setStatusMessage(null), 3000);
                  }}
                  className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 border border-amber-400/50 text-amber-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Establecer esta foto como fondo central del sistema"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Poner como fondo</span>
                </button>
              )}

              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Photo with Next/Prev navigation */}
          <div
            className="relative max-w-5xl max-h-[75vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handlePrevLightbox}
              className="absolute left-2 sm:-left-12 p-3 rounded-full bg-black/70 hover:bg-amber-500 hover:text-black text-white border border-white/20 transition-all cursor-pointer z-10"
              title="Foto anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img
              src={selectedPhoto.imageUrl}
              alt={selectedPhoto.title}
              className="max-w-full max-h-[72vh] object-contain rounded-xl shadow-[0_15px_60px_rgba(0,0,0,0.9)] border border-white/20"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/vec.jpg';
              }}
            />

            <button
              onClick={handleNextLightbox}
              className="absolute right-2 sm:-right-12 p-3 rounded-full bg-black/70 hover:bg-amber-500 hover:text-black text-white border border-white/20 transition-all cursor-pointer z-10"
              title="Foto siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Caption */}
          <div
            className="w-full max-w-2xl text-center mt-4 text-slate-300"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedPhoto.description && (
              <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
                {selectedPhoto.description}
              </p>
            )}
            {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
              <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
                {selectedPhoto.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] text-amber-300/80 bg-black/60 px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
