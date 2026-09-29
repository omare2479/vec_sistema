import React, { useState } from 'react';
import { ThemeMode } from '../types';
import { THEMES } from '../utils/theme';
import { CalendarEvent } from '../utils/comunidadStorage';
import { X, Calendar } from 'lucide-react';

interface CalendarEventModalProps {
  currentTheme: ThemeMode;
  event?: CalendarEvent | null;
  onSave: (event: Omit<CalendarEvent, 'id' | 'createdAt'> & { id?: string }) => void;
  onClose: () => void;
}

export const CalendarEventModal: React.FC<CalendarEventModalProps> = ({ currentTheme, event, onSave, onClose }) => {
  const theme = THEMES[currentTheme];
  const [title, setTitle] = useState(event?.title || '');
  const [type, setType] = useState<CalendarEvent['type']>(event?.type || 'ensayo');
  const [date, setDate] = useState(event?.date || '');
  const [time, setTime] = useState(event?.time || '');
  const [endTime, setEndTime] = useState(event?.endTime || '');
  const [location, setLocation] = useState(event?.location || '');
  const [description, setDescription] = useState(event?.description || '');
  const [status, setStatus] = useState<CalendarEvent['status']>(event?.status || 'proximo');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !time || !location.trim()) return;
    onSave({ id: event?.id, title: title.trim(), type, date, time, endTime: endTime || undefined, location: location.trim(), description: description.trim(), status });
  };

  const inputClass = "w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-500";
  const labelClass = "block text-xs text-slate-300 font-semibold mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0a1128] border border-white/20 rounded-2xl shadow-2xl p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            {event ? 'Editar Actividad' : 'Nueva Actividad'}
          </h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Tipo */}
          <div>
            <label className={labelClass}>Tipo de Actividad *</label>
            <div className="flex flex-wrap gap-2">
              {(['ensayo', 'presentacion', 'misa', 'concierto', 'vigilia'] as CalendarEvent['type'][]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all capitalize ${
                    type === t
                      ? 'bg-amber-500 text-slate-900 border-amber-400'
                      : 'bg-white/5 text-slate-300 border-white/15 hover:bg-white/10'
                  }`}
                >
                  {t === 'presentacion' ? 'Presentación' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className={labelClass}>Título *</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej. Ensayo General" className={inputClass} />
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Fecha *</label>
              <input required type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hora inicio *</label>
              <input required type="time" value={time} onChange={e => setTime(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Hora fin</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <select value={status} onChange={e => setStatus(e.target.value as CalendarEvent['status'])} className={inputClass}>
                <option value="proximo">Próximo</option>
                <option value="confirmado">Confirmado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Lugar */}
          <div>
            <label className={labelClass}>Lugar *</label>
            <input required value={location} onChange={e => setLocation(e.target.value)} placeholder="Ej. Salón Parroquial" className={inputClass} />
          </div>

          {/* Descripción */}
          <div>
            <label className={labelClass}>Descripción / Notas</label>
            <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalles, agenda, etc." className={`${inputClass} resize-none`} />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-sm font-semibold transition-colors">
              Cancelar
            </button>
            <button type="submit" className={`px-4 py-1.5 rounded-lg font-bold text-sm ${theme.tabActiveBg} ${theme.tabActiveText} shadow-md transition-all hover:brightness-110`}>
              {event ? 'Guardar Cambios' : 'Crear Actividad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
