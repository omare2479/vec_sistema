import React, { useState, useRef, useEffect } from 'react';
import { ThemeMode } from '../types';
import { THEMES } from '../utils/theme';
import { CommunityMember } from '../utils/comunidadStorage';
import { X, Upload, User } from 'lucide-react';

interface MemberModalProps {
  currentTheme: ThemeMode;
  member?: CommunityMember | null;
  onSave: (member: Omit<CommunityMember, 'id' | 'createdAt' | 'order'> & { id?: string }) => void;
  onClose: () => void;
}

export const MemberModal: React.FC<MemberModalProps> = ({ currentTheme, member, onSave, onClose }) => {
  const theme = THEMES[currentTheme];
  const [name, setName] = useState(member?.name || '');
  const [description, setDescription] = useState(member?.description || '');
  const [imageUrl, setImageUrl] = useState(member?.imageUrl || '');
  const [previewUrl, setPreviewUrl] = useState(member?.imageUrl || '');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(imageUrl);
  }, [imageUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImageUrl(result);
      setPreviewUrl(result);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: member?.id,
      name: name.trim(),
      description: description.trim(),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=300&auto=format&fit=crop&q=80',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#0a1128] border border-white/20 rounded-2xl shadow-2xl p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            {member ? 'Editar Miembro' : 'Agregar Miembro'}
          </h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Photo Upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-amber-400/40 bg-white/5 flex items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="w-full h-full object-cover" onError={() => setPreviewUrl('')} />
              ) : (
                <User className="w-10 h-10 text-slate-500" />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              {previewUrl ? 'Cambiar foto' : 'Subir foto'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <p className="text-[10px] text-slate-400">O pega una URL de imagen:</p>
            <input
              type="url"
              placeholder="https://..."
              value={imageUrl.startsWith('data:') ? '' : imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-1.5 bg-black/40 border border-white/15 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-slate-500"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Nombre completo *</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. María González"
              className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Instrumento / Rol / Descripción</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Guitarra acústica & Voz"
              className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-sm font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-1.5 rounded-lg font-bold text-sm ${theme.tabActiveBg} ${theme.tabActiveText} shadow-md transition-all hover:brightness-110`}
            >
              {member ? 'Guardar Cambios' : 'Agregar Miembro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
