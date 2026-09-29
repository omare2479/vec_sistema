import React, { useState } from 'react';
import { ThemeMode } from '../types';
import { THEMES } from '../utils/theme';
import { PrayerIntentionStored } from '../utils/comunidadStorage';
import { X, Heart, HandHeart } from 'lucide-react';

interface PrayerWallModalProps {
  currentTheme: ThemeMode;
  intentions: PrayerIntentionStored[];
  onTogglePrayed: (id: string) => void;
  onClose: () => void;
}

export const PrayerWallModal: React.FC<PrayerWallModalProps> = ({
  currentTheme,
  intentions,
  onTogglePrayed,
  onClose,
}) => {
  const theme = THEMES[currentTheme];

  const categoryColors: Record<string, string> = {
    salud: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
    familia: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    vocacion: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
    comunidad: 'text-sky-400 bg-sky-500/15 border-sky-500/30',
  };

  const categoryLabels: Record<string, string> = {
    salud: '💊 Salud',
    familia: '🏠 Familia',
    vocacion: '✝️ Vocación',
    comunidad: '🙏 Comunidad',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0a1128] border border-white/20 rounded-2xl shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-[22px]">church</span>
            <div>
              <h2 className="text-base font-bold text-white">Muro de Oración Comunitaria</h2>
              <p className="text-[11px] text-slate-400">{intentions.length} intenciones en oración</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Intentions list */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {intentions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <span className="material-symbols-outlined text-[48px] mb-3">volunteer_activism</span>
              <p className="text-sm">No hay intenciones aún. ¡Sé el primero en orar!</p>
            </div>
          )}
          {intentions.map((intent) => (
            <div key={intent.id} className="p-4 bg-black/40 border border-white/10 rounded-xl flex flex-col gap-2 hover:bg-white/5 transition-colors">
              <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-300">{intent.author}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${categoryColors[intent.category] || 'text-slate-400 bg-white/5 border-white/10'}`}>
                    {categoryLabels[intent.category] || intent.category}
                  </span>
                </div>
                <span className={`text-[11px] ${theme.textMuted}`}>{intent.date}</span>
              </div>
              <p className={`text-sm leading-relaxed ${theme.textMain}`}>"{intent.intention}"</p>
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-[11px] text-slate-400">{intent.location}</span>
                <button
                  onClick={() => onTogglePrayed(intent.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    intent.hasPrayed
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${intent.hasPrayed ? 'fill-amber-300' : ''}`} />
                  <span>{intent.prayersCount} Unidos en oración</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-sm font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
