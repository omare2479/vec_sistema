import React, { useState, useRef } from 'react';
import { ThemeMode } from '../types';
import { THEMES } from '../utils/theme';
import { CalendarEvent } from '../utils/comunidadStorage';
import { compressImage } from '../utils/imageCompressor';
import { X, Calendar, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';

interface CalendarEventModalProps {
  currentTheme: ThemeMode;
  event?: CalendarEvent | null;
  onSave: (event: Omit<CalendarEvent, 'id' | 'createdAt'> & { id?: string }) => void;
  onClose: () => void;
}

const EVENT_TYPE_OPTIONS: { type: CalendarEvent['type']; label: string; defaultImg: string }[] = [
  {
    type: 'concierto',
    label: 'Concierto VEC',
    defaultImg: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
  },
  {
    type: 'adoracion',
    label: 'Adoración Eucarística',
    defaultImg: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&auto=format&fit=crop&q=80',
  },
  {
    type: 'misa',
    label: 'Santa Misa',
    defaultImg: 'https://images.unsplash.com/photo-1548625361-12590f0580ea?w=600&auto=format&fit=crop&q=80',
  },
  {
    type: 'ensayo',
    label: 'Ensayo General',
    defaultImg: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  },
  {
    type: 'vigilia',
    label: 'Vigilia',
    defaultImg: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?w=600&auto=format&fit=crop&q=80',
  },
  {
    type: 'presentacion',
    label: 'Presentación',
    defaultImg: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
  },
];

export const CalendarEventModal: React.FC<CalendarEventModalProps> = ({ currentTheme, event, onSave, onClose }) => {
  const theme = THEMES[currentTheme];
  const [title, setTitle] = useState(event?.title || '');
  const [type, setType] = useState<CalendarEvent['type']>(event?.type || 'concierto');
  const [date, setDate] = useState(event?.date || '');
  const [time, setTime] = useState(event?.time || '');
  const [endTime, setEndTime] = useState(event?.endTime || '');
  const [location, setLocation] = useState(event?.location || '');
  const [description, setDescription] = useState(event?.description || '');
  const [imageUrl, setImageUrl] = useState(event?.imageUrl || '');
  const [status, setStatus] = useState<CalendarEvent['status']>(event?.status || 'confirmado');
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectType = (newType: CalendarEvent['type']) => {
    setType(newType);
    if (!imageUrl) {
      const match = EVENT_TYPE_OPTIONS.find(o => o.type === newType);
      if (match) setImageUrl(match.defaultImg);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const compressed = await compressImage(file, 800, 0.7);
      setImageUrl(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageUrl((ev.target?.result as string) || '');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !time || !location.trim()) return;

    // Si no tiene imagen propia, asignar una por defecto según el tipo
    const finalImage = imageUrl || EVENT_TYPE_OPTIONS.find(o => o.type === type)?.defaultImg || '';

    onSave({
      id: event?.id,
      title: title.trim(),
      type,
      date,
      time,
      endTime: endTime || undefined,
      location: location.trim(),
      description: description.trim(),
      imageUrl: finalImage,
      status,
    });
  };

  const inputClass = "w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-500";
  const labelClass = "block text-xs text-slate-300 font-semibold mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0a1128] border border-white/20 rounded-2xl shadow-2xl p-4 sm:p-5 flex flex-col gap-4 max-h-[92vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {event ? 'Editar Evento / Actividad' : 'Programar Concierto, Adoración o Misa'}
              </h3>
              <p className="text-[11px] text-slate-400">Agenda actividades del ministerio con foto y detalles</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Tipo de Actividad */}
          <div>
            <label className={labelClass}>Tipo de Actividad *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => handleSelectType(opt.type)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                    type === opt.type
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-extrabold'
                      : 'bg-white/5 text-slate-300 border-white/15 hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Foto del Evento */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/15 flex flex-col gap-2">
            <label className={labelClass}>Foto o Portada del Evento</label>
            <div className="flex items-center gap-3">
              <div className="relative w-28 h-20 rounded-lg overflow-hidden border border-white/20 bg-slate-900 shrink-0">
                {imageUrl ? (
                  <img src={imageUrl} alt="Evento preview" className="w-full h-full object-cover" onError={() => setImageUrl('')} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-1">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-[9px]">Sin foto</span>
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir Foto</span>
                  </button>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-all cursor-pointer"
                      title="Quitar foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  type="url"
                  placeholder="O pega una URL: https://..."
                  value={imageUrl.startsWith('data:') ? '' : imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs bg-black/50 border border-white/10 rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Título */}
          <div>
            <label className={labelClass}>Título del Evento *</label>
            <input
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej. Concierto VEC: Alabanza Viva o Noche de Adoración"
              className={inputClass}
            />
          </div>

          {/* Fecha y Horas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className={labelClass}>Fecha *</label>
              <input required type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hora inicio *</label>
              <input required type="time" value={time} onChange={e => setTime(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hora fin</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Lugar y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2">
              <label className={labelClass}>Lugar / Parroquia *</label>
              <input
                required
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Ej. Auditorio San Juan Bosco, Templo Parroquial"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <select value={status} onChange={e => setStatus(e.target.value as CalendarEvent['status'])} className={inputClass}>
                <option value="confirmado">Confirmado</option>
                <option value="proximo">Próximo</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Descripción / Notas */}
          <div>
            <label className={labelClass}>Descripción / Cantos / Setlist</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detalles del repertorio, momento eucarístico, ensayo previo, requisitos..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl font-extrabold text-xs ${theme.tabActiveBg} ${theme.tabActiveText} shadow-lg transition-all hover:scale-[1.02] cursor-pointer`}
            >
              {event ? 'Guardar Cambios' : 'Agendar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
