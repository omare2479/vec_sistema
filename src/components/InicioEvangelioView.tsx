import React, { useState } from 'react';
import { ThemeMode } from '../types';
import { THEMES } from '../utils/theme';

interface InicioEvangelioViewProps {
  currentTheme: ThemeMode;
  onGoToRepertorio: () => void;
}

export const InicioEvangelioView: React.FC<InicioEvangelioViewProps> = ({
  currentTheme,
  onGoToRepertorio,
}) => {
  const theme = THEMES[currentTheme];
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Afinación de instrumentos a 440 Hz', checked: true },
    { id: 2, text: 'Verificación de microfonía de voces y retornos in-ear', checked: true },
    { id: 3, text: 'Revisión del Salmo Responsorial del día con el salmista', checked: false },
    { id: 4, text: 'Oración previa comunitaria en sacristía o capilla', checked: false },
    { id: 5, text: 'Batería y bajo ajustados al tempo de comunión', checked: false },
  ]);

  const toggleCheck = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  return (
    <div className="w-full max-w-[720px] mx-auto flex flex-col gap-6 relative z-20 animate-fadeIn">
      {/* Liturgical Day Indicator Banner */}
      <div className={`p-5 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl flex flex-col gap-4`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_#10b981]"></span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Año Litúrgico • Ciclo A
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-xs font-bold text-emerald-300">
            Color Litúrgico: Verde Esperanza
          </span>
        </div>

        <div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold ${theme.textMain}`}>
            Evangelio del Día & Meditación Espiritual
          </h1>
          <p className={`text-xs sm:text-sm ${theme.textMuted} mt-1`}>
            "El que canta, ora dos veces" — San Agustín. La Palabra que ilumina el ministerio musical.
          </p>
        </div>

        {/* Liturgical calendar quick stat */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
          <div className="p-3 bg-black/40 border border-white/10 rounded-xl">
            <span className={`text-[10px] ${theme.textMuted} block`}>Tiempo Eclesial</span>
            <span className="text-sm font-bold text-white">Semana Tiempo Ordinario</span>
          </div>
          <div className="p-3 bg-black/40 border border-white/10 rounded-xl">
            <span className={`text-[10px] ${theme.textMuted} block`}>Santoral</span>
            <span className="text-sm font-bold text-amber-300">Santa Cecilia & San Juan Bosco</span>
          </div>
          <div className="p-3 bg-black/40 border border-white/10 rounded-xl col-span-2 sm:col-span-1">
            <span className={`text-[10px] ${theme.textMuted} block`}>Misión Pastoral</span>
            <span className="text-sm font-bold text-sky-300">Alabanza & Servicio</span>
          </div>
        </div>
      </div>

      {/* Gospel Reading Section */}
      <div className={`p-5 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl flex flex-col gap-4`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <span className="material-symbols-outlined text-[24px]">auto_stories</span>
          </div>
          <div>
            <span className="text-[11px] text-amber-400 uppercase font-bold tracking-wider">
              Lectura del Santo Evangelio
            </span>
            <h2 className={`text-lg sm:text-xl font-bold ${theme.textMain}`}>
              San Mateo 18, 19-20
            </h2>
          </div>
        </div>

        <blockquote className="p-4 bg-black/40 border-l-4 border-amber-400 rounded-r-xl text-sm sm:text-base leading-relaxed text-slate-200 italic font-serif">
          «Les aseguro también que si dos de ustedes se ponen de acuerdo en la tierra para pedir cualquier cosa, la obtendrán de mi Padre celestial. Porque donde dos o tres están reunidos en mi nombre, allí estoy yo en medio de ellos.»
        </blockquote>

        <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
          <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            Reflexión para Músicos y Cantores
          </h3>
          <p className={`text-xs sm:text-sm leading-relaxed ${theme.textMuted}`}>
            Nuestra música no es un simple espectáculo, es un canal sagrado donde Cristo se hace presente en medio de la asamblea. Cuando afinamos nuestros instrumentos, afinamos también el corazón para servir con humildad, fraternidad y alegría. Que cada acorde sea una oración viva que eleve las almas al trono del Señor.
          </p>
        </div>
      </div>

      {/* Oración del Músico Católico */}
      <div className={`p-5 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl flex flex-col gap-4`}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400 text-[22px]">favorite</span>
          <h2 className={`text-lg sm:text-xl font-bold ${theme.textMain}`}>
            Oración del Músico Católico
          </h2>
        </div>

        <div className="p-4 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm leading-relaxed text-slate-300 font-sans">
          <p className="mb-2">
            «Señor Jesús, Tú que nos llamaste a ser <strong>Voces en Cristo</strong>, bendice nuestras voces, manos e instrumentos.
          </p>
          <p className="mb-2">
            Que la música que interpretemos no busque el aplauso del mundo, sino la gloria de tu Santo Nombre y la conversión de los corazones.
          </p>
          <p>
            Madre María, patrona de nuestro ministerio, acompáñanos siempre bajo tu manto de amor. Amén.»
          </p>
        </div>
      </div>

      {/* Checklist de Preparación antes de Misa o Concierto */}
      <div className={`p-5 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl flex flex-col gap-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-lg sm:text-xl font-bold ${theme.textMain}`}>
              Checklist de Servicio Ministerial
            </h2>
            <p className={`text-xs sm:text-sm ${theme.textMuted}`}>
              Revisión previa obligatoria para el equipo musical y sonido.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-400 font-mono">
            {checklist.filter((i) => i.checked).length} / {checklist.length} Listo
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {checklist.map((item) => (
            <label
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className="flex items-center gap-3 p-3 bg-black/40 border border-white/10 rounded-xl hover:bg-white/5 transition-colors cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => {}}
                className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span className={`text-xs sm:text-sm font-medium ${item.checked ? 'text-slate-400 line-through' : theme.textMain}`}>
                {item.text}
              </span>
            </label>
          ))}
        </div>

        <div className="pt-2">
          <button
            onClick={onGoToRepertorio}
            className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition-all hover:brightness-110 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer ${theme.tabActiveBg} ${theme.tabActiveText}`}
          >
            <span>Ver Setlist del Concierto</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
