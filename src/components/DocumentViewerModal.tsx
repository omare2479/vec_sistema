import React from 'react';
import { BandDocument, ThemeMode } from '../types';
import { THEMES } from '../utils/theme';
import { downloadDocument } from '../utils/documentStorage';
import {
  FileText,
  Download,
  Printer,
  X,
  FileCode,
  Music,
  ExternalLink,
} from 'lucide-react';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: BandDocument | null;
  currentTheme: ThemeMode;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  currentTheme,
}) => {
  const theme = THEMES[currentTheme];

  if (!isOpen || !doc) return null;

  const isPdf = doc.type === 'pdf' || doc.name.toLowerCase().endsWith('.pdf');
  const isDoc = doc.type === 'doc' || doc.type === 'docx' || doc.name.toLowerCase().endsWith('.doc') || doc.name.toLowerCase().endsWith('.docx');

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-4xl h-[90vh] bg-[#091126] border border-white/20 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-white/10 bg-[#060b1c] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isPdf ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
            }`}>
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {doc.name}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {doc.sizeFormatted} • {doc.uploadedAt} • {doc.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => downloadDocument(doc)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer"
              title="Descargar archivo"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Descargar</span>
            </button>

            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
              title="Imprimir"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content View */}
        <div className="flex-1 bg-black/60 overflow-hidden relative flex flex-col">
          {isPdf && doc.dataUrl ? (
            <iframe
              src={doc.dataUrl}
              title={doc.name}
              className="w-full h-full border-0 bg-white"
            />
          ) : doc.textContent ? (
            <div className="p-6 overflow-y-auto h-full text-slate-200 font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {doc.textContent}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center text-amber-400 shadow-xl">
                <FileText className="w-8 h-8" />
              </div>
              <div className="max-w-md flex flex-col gap-2">
                <h4 className="text-base font-bold text-white">
                  Documento de Banda: {doc.name}
                </h4>
                <p className="text-xs text-slate-400">
                  {doc.description}
                </p>
                <p className="text-xs text-slate-500">
                  Formato: <span className="uppercase font-bold text-amber-300">{doc.type}</span> • Tamaño: {doc.sizeFormatted}
                </p>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => downloadDocument(doc)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar y Abrir Archivo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
