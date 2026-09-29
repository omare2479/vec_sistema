import React, { useState, useEffect } from 'react';
import { ThemeMode } from '../types';
import { THEMES } from '../utils/theme';
import {
  fetchEvangelioDelDia,
  EvangelioData,
  getLiturgicalInfo,
} from '../utils/evangelioService';
import {
  BookOpen,
  Calendar,
  Sparkles,
  ExternalLink,
  Headphones,
  RefreshCw,
  Heart,
  CheckSquare,
  Globe,
  Radio,
  Share2,
  CheckCircle2,
  Loader2,
  Maximize2,
  Bookmark
} from 'lucide-react';

interface InicioEvangelioViewProps {
  currentTheme: ThemeMode;
  onGoToRepertorio: () => void;
}

export const InicioEvangelioView: React.FC<InicioEvangelioViewProps> = ({
  currentTheme,
  onGoToRepertorio,
}) => {
  const theme = THEMES[currentTheme];

  const [evangelio, setEvangelio] = useState<EvangelioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lectura' | 'widget_dominicos'>('lectura');
  const [copiedLink, setCopiedLink] = useState(false);

  // Checklist ministerial
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Afinación de instrumentos a 440 Hz (Guitarras, Bajo, Teclado)', checked: true },
    { id: 2, text: 'Verificación de microfonía de voces y retornos in-ear', checked: true },
    { id: 3, text: 'Revisión del Salmo Responsorial del día con el salmista', checked: false },
    { id: 4, text: 'Oración comunitaria en sacristía antes de iniciar el canto', checked: false },
    { id: 5, text: 'Batería y percusiones ajustadas al tempo de comunión', checked: false },
  ]);

  const loadEvangelio = async () => {
    setIsLoading(true);
    try {
      const data = await fetchEvangelioDelDia();
      setEvangelio(data);
    } catch (err) {
      console.warn('Error al cargar evangelio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvangelio();
  }, []);

  const toggleCheck = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleShare = () => {
    const url = 'https://www.dominicos.org/predicacion/evangelio-del-dia/hoy/';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-[760px] mx-auto flex flex-col gap-6 relative z-20 animate-fadeIn">
      {/* Liturgical Day Indicator Banner */}
      <div className={`p-5 sm:p-6 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} shadow-2xl flex flex-col gap-4 backdrop-blur-xl relative overflow-hidden`}>
        {/* Glow decoration */}
        <div
          className="absolute -top-20 -right-20 w-52 h-52 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: theme.glowColor }}
        />

        <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_10px_#10b981] animate-pulse"></span>
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
              {evangelio ? `${evangelio.tiempoLiturgico} • ${evangelio.cicloLiturgico}` : 'Calendario Litúrgico Católico'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${evangelio ? `${evangelio.colorLiturgicoBg} ${evangelio.colorLiturgicoBorder} ${evangelio.colorLiturgicoText}` : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'}`}>
              Color: {evangelio?.colorLiturgico || 'Verde Litúrgico'}
            </span>

            <button
              onClick={loadEvangelio}
              disabled={isLoading}
              title="Recargar Evangelio del día de Dominicos.org"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        <div className="relative z-10">
          <span className="text-[11px] font-bold text-amber-300/90 uppercase tracking-widest block mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{evangelio?.fechaFormateada || 'Evangelio de Hoy'}</span>
          </span>
          <h1 className={`text-2xl sm:text-3xl font-black ${theme.textMain} tracking-tight`}>
            Evangelio del Día & Palabra Viva
          </h1>
          <p className={`text-xs sm:text-sm ${theme.textMuted} mt-1.5 leading-relaxed`}>
            Sincronizado diariamente con las lecturas litúrgicas oficiales de la Iglesia Católica y la predicación de los Frailes Dominicos.
          </p>
        </div>

        {/* Quick Liturgical Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs relative z-10">
          <div className="p-3 bg-black/40 border border-white/10 rounded-2xl flex flex-col justify-between">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMuted}`}>
              Santoral de Hoy
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-amber-300 mt-1 line-clamp-2">
              {evangelio?.santoDelDia || 'Santos Arcángeles & Confesores'}
            </span>
          </div>

          <div className="p-3 bg-black/40 border border-white/10 rounded-2xl flex flex-col justify-between">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMuted}`}>
              Fuente Católica
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="text-xs font-bold text-sky-200 truncate">
                Dominicos.org
              </span>
            </div>
          </div>

          <div className="p-3 bg-black/40 border border-white/10 rounded-2xl col-span-2 sm:col-span-1 flex flex-col justify-between">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMuted}`}>
              Actualización
            </span>
            <span className="text-xs font-bold text-slate-200 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Hoy {evangelio?.ultimaActualizacion || '00:00'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Mode Selector Tabs (Lectura Espiritual VEC vs Widget Oficial Dominicos) */}
      <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('lectura')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'lectura'
                ? `${theme.tabActiveBg} ${theme.tabActiveText} shadow-md`
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Evangelio & Reflexión</span>
          </button>

          <button
            onClick={() => setActiveTab('widget_dominicos')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'widget_dominicos'
                ? `${theme.tabActiveBg} ${theme.tabActiveText} shadow-md`
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>Portal Dominicos en Vivo</span>
          </button>
        </div>

        {/* Quick Link to Dominicos */}
        <a
          href="https://www.dominicos.org/predicacion/evangelio-del-dia/hoy/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold transition-colors"
          title="Abrir la página oficial de los Dominicos en una nueva pestaña"
        >
          <span>dominicos.org</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* TAB 1: Lectura Litúrgica & Reflexión */}
      {activeTab === 'lectura' && (
        <div className={`p-5 sm:p-7 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} shadow-2xl flex flex-col gap-5 backdrop-blur-xl animate-fadeIn`}>
          {/* Header Cita Bíblica */}
          <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] text-amber-400 uppercase font-extrabold tracking-wider block">
                  Lectura del Santo Evangelio
                </span>
                <h2 className={`text-xl sm:text-2xl font-black ${theme.textMain} tracking-tight`}>
                  {evangelio?.citaEvangelio || 'San Mateo 18, 19-20'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer relative"
                title="Copiar enlace del Evangelio"
              >
                <Share2 className="w-4 h-4" />
                {copiedLink && (
                  <span className="absolute -bottom-7 right-0 text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                    ¡Copiado!
                  </span>
                )}
              </button>

              <a
                href="https://www.dominicos.org/predicacion/evangelio-del-dia/hoy/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 transition-colors cursor-pointer"
                title="Leer completo en Dominicos.org"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Lema o Frase del Evangelio */}
          {evangelio?.lemaOFrase && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-sky-500/10 to-transparent border border-amber-400/30 text-amber-200 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{evangelio.lemaOFrase}</span>
            </div>
          )}

          {/* Gospel Quote / Scripture Block */}
          <blockquote className="p-5 bg-black/50 border-l-4 border-amber-400 rounded-2xl text-sm sm:text-base leading-relaxed text-slate-100 font-serif italic shadow-inner">
            {evangelio?.pasajeEvangelio || (
              <>
                «Les aseguro también que si dos de ustedes se ponen de acuerdo en la tierra para pedir cualquier cosa, la obtendrán de mi Padre celestial. Porque donde dos o tres están reunidos en mi nombre, allí estoy yo en medio de ellos.»
              </>
            )}
          </blockquote>

          {/* Autor de la reflexión Dominicos */}
          {evangelio?.autorComentario && (
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 italic">
              <span>Comentario espiritual por:</span>
              <strong className="text-amber-300 not-italic font-semibold">{evangelio.autorComentario}</strong>
            </div>
          )}

          {/* Reflection for Musicians */}
          <div className="flex flex-col gap-2 pt-3 border-t border-white/10">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Meditación para Músicos y Salmistas de Voces en Cristo</span>
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${theme.textMuted}`}>
              Nuestra alabanza no es un simple espectáculo, es un puente de oración sagrado donde Cristo se hace presente en medio de su pueblo. Cuando afinamos nuestros instrumentos, afinamos también el corazón para servir con devoción, humildad y alegría fraterna. Que cada acorde y cada canto sea una ofrenda viva que eleve las almas ante el Señor.
            </p>
          </div>

          {/* Actions at the bottom of the reading */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <a
              href="https://www.dominicos.org/predicacion/evangelio-del-dia/hoy/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>Leer Evangelio y Homilía Completa en Dominicos</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://www.dominicos.org/predicacion/podcast/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold flex items-center gap-2 border border-white/15 transition-all"
            >
              <Headphones className="w-3.5 h-3.5 text-sky-400" />
              <span>Escuchar Podcast / Audio</span>
            </a>
          </div>
        </div>
      )}

      {/* TAB 2: Portal Oficial Dominicos (Widget Embebido en Vivo) */}
      {activeTab === 'widget_dominicos' && (
        <div className={`p-5 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} shadow-2xl flex flex-col gap-4 backdrop-blur-xl animate-fadeIn`}>
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>Portal Oficial Dominicos.org — Evangelio de Hoy</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Se actualiza automáticamente cada 24 horas directamente desde la Orden de Predicadores.
              </p>
            </div>

            <a
              href="https://www.dominicos.org/predicacion/evangelio-del-dia/hoy/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow"
            >
              <span>Abrir Pantalla Completa</span>
              <Maximize2 className="w-3 h-3" />
            </a>
          </div>

          {/* Embed iframe of Dominicos Widget */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-white/20 bg-[#12192f] shadow-2xl min-h-[460px]">
            <iframe
              src="https://widget.dominicos.org"
              title="Evangelio del Día - Dominicos.org"
              className="w-full h-[460px] border-0"
              loading="lazy"
            />
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-400 flex items-center justify-between flex-wrap gap-2">
            <span>¿Deseas leer también las lecturas del Antiguo Testamento y Salmo?</span>
            <a
              href="https://www.dominicos.org/predicacion/evangelio-del-dia/hoy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:text-amber-200 font-bold underline flex items-center gap-1"
            >
              <span>Ver Lecturas Completas en dominicos.org</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Oración del Músico Católico */}
      <div className={`p-5 sm:p-6 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl flex flex-col gap-4 backdrop-blur-xl`}>
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-400 fill-rose-400/20" />
          <h2 className={`text-lg sm:text-xl font-bold ${theme.textMain}`}>
            Oración del Músico Católico
          </h2>
        </div>

        <div className="p-4 bg-black/40 border border-white/10 rounded-2xl text-xs sm:text-sm leading-relaxed text-slate-200 font-sans">
          <p className="mb-2">
            «Señor Jesús, Tú que nos llamaste a ser <strong>Voces en Cristo</strong>, bendice nuestras voces, manos e instrumentos.
          </p>
          <p className="mb-2">
            Que la música que interpretemos no busque el aplauso del mundo, sino la gloria de tu Santo Nombre y la conversión de los corazones.
          </p>
          <p>
            Madre María, patrona de nuestro ministerio, cúbrenos siempre bajo tu manto de amor. Amén.»
          </p>
        </div>
      </div>

      {/* Checklist de Preparación antes de Misa o Concierto */}
      <div className={`p-5 sm:p-6 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl flex flex-col gap-4 backdrop-blur-xl`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-lg sm:text-xl font-bold ${theme.textMain} flex items-center gap-2`}>
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <span>Checklist de Servicio Ministerial</span>
            </h2>
            <p className={`text-xs sm:text-sm ${theme.textMuted}`}>
              Revisión técnica y espiritual previa obligatoria antes de iniciar la alabanza.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-400 font-mono px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30">
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
            className={`w-full py-3 rounded-2xl font-black text-xs shadow-lg transition-all hover:brightness-110 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer ${theme.tabActiveBg} ${theme.tabActiveText}`}
          >
            <span>Ir al Repertorio de Cantos & Concierto</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
