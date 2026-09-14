import React, { useState, useEffect } from 'react';
import { Sparkles, Shuffle, Eye, Image as ImageIcon, Calendar } from 'lucide-react';
import { ThemeMode, GalleryPhoto } from '../types';
import { THEMES } from '../utils/theme';

interface RandomMemoryWidgetProps {
  currentTheme: ThemeMode;
  photos: GalleryPhoto[];
  onOpenGallery: () => void;
  onSelectPhoto?: (photo: GalleryPhoto) => void;
  variant?: 'compact' | 'card' | 'badge';
  autoRotateIntervalSec?: number;
}

export const RandomMemoryWidget: React.FC<RandomMemoryWidgetProps> = ({
  currentTheme,
  photos,
  onOpenGallery,
  onSelectPhoto,
  variant = 'card',
  autoRotateIntervalSec = 25,
}) => {
  const theme = THEMES[currentTheme];
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isFading, setIsFading] = useState<boolean>(false);

  useEffect(() => {
    if (photos.length <= 1 || autoRotateIntervalSec <= 0) return;
    const timer = setInterval(() => {
      handleNextRandom();
    }, autoRotateIntervalSec * 1000);

    return () => clearInterval(timer);
  }, [photos.length, autoRotateIntervalSec]);

  const handleNextRandom = () => {
    if (photos.length <= 1) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentIdx((prev) => {
        let next = Math.floor(Math.random() * photos.length);
        if (next === prev && photos.length > 1) {
          next = (prev + 1) % photos.length;
        }
        return next;
      });
      setIsFading(false);
    }, 250);
  };

  const photo = photos[currentIdx] || photos[0];
  if (!photo) return null;

  if (variant === 'badge') {
    return (
      <button
        onClick={onOpenGallery}
        className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/15 border border-white/15 text-xs text-amber-300 transition-all cursor-pointer group"
        title="Ver Galería de Fotos VEC"
      >
        <div className="w-5 h-5 rounded-md overflow-hidden shrink-0 border border-amber-400/40">
          <img
            src={photo.imageUrl}
            alt={photo.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/vec.jpg';
            }}
          />
        </div>
        <span className="font-semibold hidden lg:inline">Galería ({photos.length})</span>
        <Shuffle
          className="w-3 h-3 text-slate-400 group-hover:text-amber-300 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleNextRandom();
          }}
        />
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`p-2.5 rounded-xl ${theme.cardBg} border ${theme.cardBorder} flex items-center justify-between gap-3 shadow-md`}>
        <div
          className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
          onClick={() => (onSelectPhoto ? onSelectPhoto(photo) : onOpenGallery())}
        >
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-amber-400/40 relative shadow">
            <img
              src={photo.imageUrl}
              alt={photo.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${isFading ? 'opacity-30' : 'opacity-100'}`}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/vec.jpg';
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                Recuerdo VEC
              </span>
              <span className="text-[10px] text-slate-400 truncate">{photo.category}</span>
            </div>
            <p className="text-xs font-bold text-white truncate hover:text-amber-300 transition-colors">
              {photo.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleNextRandom}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-amber-300 transition-colors cursor-pointer"
            title="Cambiar a otra foto aleatoria"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenGallery}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 transition-colors cursor-pointer"
            title="Abrir galería completa"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Card Variant (Full Featured)
  return (
    <div className={`relative overflow-hidden rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl group transition-all duration-300`}>
      <div className="relative h-44 sm:h-52 w-full overflow-hidden">
        <img
          src={photo.imageUrl}
          alt={photo.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ${
            isFading ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
          }`}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/vec.jpg';
          }}
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-between p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 backdrop-blur-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Momento VEC Aleatorio
              </span>
              <span className="text-[10px] text-slate-300 bg-black/60 px-2 py-0.5 rounded-md border border-white/10 backdrop-blur-sm capitalize">
                {photo.category}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleNextRandom}
                className="px-2.5 py-1 rounded-xl bg-black/60 hover:bg-amber-400 hover:text-black text-amber-300 border border-white/15 backdrop-blur-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow"
                title="Mostrar otra foto aleatoria del ministerio"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Aleatorio</span>
              </button>

              <button
                onClick={onOpenGallery}
                className="p-1.5 rounded-xl bg-black/60 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-all cursor-pointer shadow"
                title="Ver todas las fotos en la galería"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div
            className="cursor-pointer"
            onClick={() => (onSelectPhoto ? onSelectPhoto(photo) : onOpenGallery())}
          >
            <h4 className="text-base sm:text-lg font-extrabold text-white group-hover:text-amber-300 transition-colors leading-tight">
              {photo.title}
            </h4>
            {photo.description && (
              <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                {photo.description}
              </p>
            )}
            <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
              {photo.date ? (
                <span className="flex items-center gap-1 text-slate-300">
                  <Calendar className="w-3 h-3 text-amber-400" />
                  {photo.date}
                </span>
              ) : (
                <span>Ministerio Voces en Cristo</span>
              )}
              <span className="text-amber-400 flex items-center gap-1 font-semibold group-hover:underline">
                <Eye className="w-3 h-3" />
                Ver en grande
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
