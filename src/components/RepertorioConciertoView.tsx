import React, { useState, useEffect, useRef } from 'react';
import { Song, ThemeMode, RepertorioSubTab, LiturgicalMoment, GalleryPhoto, BandDocument } from '../types';
import { THEMES } from '../utils/theme';
import { INITIAL_CONCERT_SONGS, LITURGICAL_MOMENTS } from '../data/mockData';
import { globalAudioPlayer, formatTimeSeconds } from '../utils/audioPlayer';
import { loadAllDocuments, saveDocument, deleteDocument, downloadDocument, formatBytes } from '../utils/documentStorage';
import { RandomMemoryWidget } from './RandomMemoryWidget';
import { ImportSongDocumentModal } from './ImportSongDocumentModal';
import { DocumentViewerModal } from './DocumentViewerModal';
import { FileText, Upload, Trash2, Eye, Download, Plus, CheckCircle, FileCode } from 'lucide-react';

interface RepertorioConciertoViewProps {
  currentTheme: ThemeMode;
  onOpenChordModal: (song: Song) => void;
  onOpenAddModal: () => void;
  onOpenStageMode: (index: number) => void;
  songs: Song[];
  onUpdateSongKey: (songId: string, newKey: string) => void;
  onAddSong?: (newSong: Song) => void;
  photos?: GalleryPhoto[];
  onOpenGallery?: () => void;
}

const MUSICAL_KEYS = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];

export const RepertorioConciertoView: React.FC<RepertorioConciertoViewProps> = ({
  currentTheme,
  onOpenChordModal,
  onOpenAddModal,
  onOpenStageMode,
  songs,
  onUpdateSongKey,
  onAddSong,
  photos = [],
  onOpenGallery,
}) => {
  const theme = THEMES[currentTheme];
  const [activeSubTab, setActiveSubTab] = useState<RepertorioSubTab>('concierto');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');

  // Documents State (PDF / DOC / DOCX for the band)
  const [documents, setDocuments] = useState<BandDocument[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<BandDocument | null>(null);
  const quickFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAllDocuments().then((docs) => setDocuments(docs));
  }, []);

  const handleAddDocument = async (newDoc: BandDocument) => {
    setDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);
    await saveDocument(newDoc);
  };

  const handleDeleteDocument = async (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    await deleteDocument(id);
  };

  const handleQuickFileUpload = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'doc' && ext !== 'docx' && ext !== 'txt') {
      alert('Por favor selecciona un archivo PDF (.pdf), Word (.doc/.docx) o texto (.txt).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const rawName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const cleanTitle = rawName.replace(/[_-]/g, ' ').replace(/\s+/g, ' ').trim();
      const newDoc: BandDocument = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: ext as any,
        sizeFormatted: formatBytes(file.size),
        sizeBytes: file.size,
        uploadedAt: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
        description: `Material cargado para el ministerio: ${cleanTitle}`,
        dataUrl,
        associatedSongTitle: cleanTitle,
        isUserUploaded: true,
      };
      handleAddDocument(newDoc);

      // Also create a song if onAddSong provided
      if (onAddSong) {
        const newSong: Song = {
          id: `song-${Date.now()}`,
          orderNumber: 'Set',
          title: cleanTitle,
          subtitle: `Canto importado desde documento: ${file.name}`,
          category: 'adoracion',
          categoryLabel: 'Adoración y Contemplación',
          duration: '5:00 min',
          originalKey: 'Sol',
          currentKey: 'Sol',
          rhythmNote: `Sol Mayor • Doc ${ext.toUpperCase()}`,
          arrangementNote: `Archivo adjunto: ${file.name} (${formatBytes(file.size)})`,
          introTags: [ext.toUpperCase(), 'Sol Mayor', 'Importado'],
          attachedDocName: file.name,
          attachedDocUrl: dataUrl,
          attachedDocType: ext as any,
        };
        onAddSong(newSong);
      }
    };
    reader.readAsDataURL(file);
  };

  // Audio Player State for Song 04 (Voces en Cristo)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentTime, setCurrentTime] = useState(102); // 01:42
  const [totalDuration, setTotalDuration] = useState(250); // 04:10
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);

  // Selected liturgical moment modal state
  const [selectedMoment, setSelectedMoment] = useState<LiturgicalMoment | null>(null);

  useEffect(() => {
    globalAudioPlayer.setCallbacks(
      (curr, tot) => {
        setCurrentTime(curr);
        setTotalDuration(tot);
      },
      (playing) => {
        setIsPlayingAudio(playing);
      }
    );
  }, []);

  const handleTogglePlay = () => {
    globalAudioPlayer.toggle();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    const newSeconds = percent * totalDuration;
    globalAudioPlayer.seek(newSeconds);
  };

  const handleSpeedCycle = () => {
    const speeds = [1.0, 1.25, 1.5];
    const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    globalAudioPlayer.setPlaybackRate(nextSpeed);
  };

  const handleTranspose = (song: Song, delta: number) => {
    const currentKey = song.currentKey || 'Sol';
    let idx = MUSICAL_KEYS.indexOf(currentKey);
    if (idx === -1) idx = 7;
    const newIdx = (idx + delta + MUSICAL_KEYS.length) % MUSICAL_KEYS.length;
    const newKey = MUSICAL_KEYS[newIdx];
    onUpdateSongKey(song.id, newKey);
    globalAudioPlayer.playNoteTone(newKey);
  };

  // Filtered songs for Concert view
  const filteredSongs = songs.filter((song) => {
    const matchesSearch =
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.rhythmNote.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.currentKey.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'todos') return true;
    if (selectedFilter === 'adoracion') return song.category === 'adoracion';
    if (selectedFilter === 'animacion') return song.category === 'animacion';
    if (selectedFilter === 'propios') return song.category === 'propios' || song.isOriginalVEC;
    return true;
  });

  return (
    <div className="w-full max-w-[720px] mx-auto flex flex-col gap-6 relative z-20">
      {/* 1. Ministry Identity Banner (Matches Reference Image Exactly) */}
      <div className={`relative w-full overflow-hidden rounded-2xl ${theme.cardBg} p-4 sm:p-6 shadow-2xl border ${theme.cardBorder} backdrop-blur-md`}>
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: theme.glowColor }}></div>
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-rose-900/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-4">
          {/* Tags & Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/40 border border-white/10">
              <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]"></span>
              <span className={`text-[11px] uppercase tracking-wider font-bold ${theme.primaryText}`}>
                VEC • Voces en Cristo
              </span>
            </div>
            <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${theme.cardBorder} ${theme.accentBadgeBg} ${theme.accentBadgeText}`}>
              Ministerio Musical Cristiano Católico
            </span>
          </div>

          {/* Main Title & Bio Clarification */}
          <div className="flex flex-col gap-1">
            <h1 className={`text-2xl sm:text-3xl tracking-tight font-extrabold drop-shadow-sm ${theme.textMain}`}>
              Banda & Ministerio Voces en Cristo
            </h1>
            <p className={`text-sm sm:text-base leading-relaxed ${theme.textMuted}`}>
              Música católica contemporánea, alabanza enérgica, noches de adoración eucarística y preparación del servicio litúrgico.
            </p>
          </div>

          {/* Event Stats Bento Box */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="bg-black/50 border border-white/10 backdrop-blur-md rounded-xl p-3 flex flex-col gap-1 shadow-inner">
              <span className={`text-[11px] font-medium ${theme.textMuted}`}>Próximo Evento</span>
              <span className={`text-base sm:text-lg font-bold truncate ${theme.primaryText}`}>
                Concierto VEC
              </span>
            </div>
            <div className="bg-black/50 border border-white/10 backdrop-blur-md rounded-xl p-3 flex flex-col gap-1 shadow-inner">
              <span className={`text-[11px] font-medium ${theme.textMuted}`}>Fecha & Hora</span>
              <span className={`text-base sm:text-lg font-bold truncate ${theme.textMain}`}>
                Sáb 25 • 19:30
              </span>
            </div>
            <div className="bg-black/50 border border-white/10 backdrop-blur-md rounded-xl p-3 flex flex-col gap-1 shadow-inner">
              <span className={`text-[11px] font-medium ${theme.textMuted}`}>Cantos Agendados</span>
              <span className={`text-base sm:text-lg font-bold text-amber-300`}>
                {songs.length} cantos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dedicated Quick Action: Tiempos Litúrgicos y Misas direct banner */}
      <div className={`flex flex-wrap items-center justify-between p-4 bg-gradient-to-r from-black/60 via-white/5 to-black/60 rounded-2xl shadow-xl border ${theme.cardBorder} gap-3`}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <span className="material-symbols-outlined text-[24px]">menu_book</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-bold ${theme.textMain}`}>Tiempos Litúrgicos & Santa Misa</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-black">
                Acceso Rápido
              </span>
            </div>
            <p className={`text-xs ${theme.textMuted}`}>
              Cantos para la Santa Misa (Entrada, Salmo, Ofertorio, Comunión) y tiempos litúrgicos disponibles aquí.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveSubTab('liturgicos')}
          className={`px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all hover:brightness-110 active:scale-95 shrink-0 flex items-center gap-1.5 cursor-pointer ${theme.tabActiveBg} ${theme.tabActiveText}`}
        >
          <span>Explorar Misa</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      {/* 3. 4 Sub-Tabs Navigation Requested in Prompt */}
      <div className="w-full bg-black/60 p-1.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button
            onClick={() => setActiveSubTab('concierto')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
              activeSubTab === 'concierto'
                ? `${theme.tabActiveBg} ${theme.tabActiveText} font-bold shadow-md`
                : `${theme.textMuted} hover:bg-white/5 hover:${theme.textMain}`
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">music_note</span>
            <span className="truncate">Repertorio Concierto</span>
          </button>

          <button
            onClick={() => setActiveSubTab('liturgicos')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
              activeSubTab === 'liturgicos'
                ? `${theme.tabActiveBg} ${theme.tabActiveText} font-bold shadow-md`
                : `${theme.textMuted} hover:bg-white/5 hover:${theme.textMain}`
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            <span className="truncate">Liturgia & Misa</span>
          </button>

          <button
            onClick={() => setActiveSubTab('propios')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
              activeSubTab === 'propios'
                ? `${theme.tabActiveBg} ${theme.tabActiveText} font-bold shadow-md`
                : `${theme.textMuted} hover:bg-white/5 hover:${theme.textMain}`
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">star</span>
            <span className="truncate">Cantos VEC</span>
          </button>

          <button
            onClick={() => setActiveSubTab('archivos')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
              activeSubTab === 'archivos'
                ? `${theme.tabActiveBg} ${theme.tabActiveText} font-bold shadow-md`
                : `${theme.textMuted} hover:bg-white/5 hover:${theme.textMain}`
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">folder</span>
            <span className="truncate">Archivos & Cifrados</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: REPERTORIO CONCIERTO (PRIMARY ACTIVE VIEW) */}
      {/* ========================================================================= */}
      {activeSubTab === 'concierto' && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {/* Event Header & Add Song Button */}
          <div className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-black/40 border ${theme.cardBorder} backdrop-blur-sm shadow-lg`}>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-[0_0_8px_#f59e0b]"></span>
                <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                  En Cartelera
                </span>
              </div>
              <h2 className={`text-lg sm:text-xl font-bold ${theme.textMain}`}>
                Concierto de Alabanza y Adoración VEC
              </h2>
              <p className={`text-xs ${theme.textMuted}`}>
                Auditorio San Juan Bosco • {songs.length} cantos programados en el setlist
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs font-bold transition-all border border-amber-400/40 shadow-sm cursor-pointer"
                title="Importar partitura o cifrado en archivo PDF o Word (.doc/.docx)"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Importar PDF / DOC</span>
              </button>

              <button
                onClick={() => onOpenStageMode(0)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15"
                title="Abrir teleprompter de escenario"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>Modo Escenario</span>
              </button>

              <button
                onClick={onOpenAddModal}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all hover:brightness-110 active:scale-95 cursor-pointer ${theme.tabActiveBg} ${theme.tabActiveText}`}
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Agendar Cantos</span>
              </button>
            </div>
          </div>

          {/* Random Ministry Photo Inspiration */}
          {photos.length > 0 && (
            <RandomMemoryWidget
              currentTheme={currentTheme}
              photos={photos}
              onOpenGallery={onOpenGallery || (() => {})}
              variant="compact"
              autoRotateIntervalSec={30}
            />
          )}

          {/* Search & Category Filters */}
          <div className="flex flex-col gap-3 p-4 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-sm shadow-md">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400/80 text-[20px]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, ritmo, tono o momento del concierto..."
                className={`w-full pl-11 pr-4 py-2.5 bg-black/60 border border-white/15 rounded-xl ${theme.textMain} placeholder:text-slate-400/60 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 shadow-inner`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <span className="material-symbols-outlined text-[16px]">clear</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className={`text-[11px] ${theme.textMuted} shrink-0 mr-1`}>Filtrar:</span>
              <button
                onClick={() => setSelectedFilter('todos')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedFilter === 'todos'
                    ? `${theme.tabActiveBg} ${theme.tabActiveText} shadow-sm`
                    : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                }`}
              >
                Todos ({songs.length})
              </button>
              <button
                onClick={() => setSelectedFilter('adoracion')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  selectedFilter === 'adoracion'
                    ? `${theme.tabActiveBg} ${theme.tabActiveText} font-bold shadow-sm`
                    : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                }`}
              >
                🙏 Adoración y Contemplación
              </button>
              <button
                onClick={() => setSelectedFilter('animacion')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  selectedFilter === 'animacion'
                    ? `${theme.tabActiveBg} ${theme.tabActiveText} font-bold shadow-sm`
                    : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                }`}
              >
                🔥 Animación y Alabanza Viva
              </button>
              <button
                onClick={() => setSelectedFilter('propios')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  selectedFilter === 'propios'
                    ? `${theme.tabActiveBg} ${theme.tabActiveText} font-bold shadow-sm`
                    : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                }`}
              >
                ✨ Cantos VEC Originales
              </button>
            </div>
          </div>

          {/* Song Cards Stack */}
          <div className="flex flex-col gap-4">
            {filteredSongs.map((song, index) => {
              const isHimnoSong = song.title.includes('Voces en Cristo');

              return (
                <article
                  key={song.id}
                  className={`relative flex flex-col gap-3 p-4 sm:p-5 rounded-2xl shadow-xl transition-all duration-200 border ${
                    isHimnoSong
                      ? 'border-2 border-amber-400/60 bg-gradient-to-br from-[#121c44] via-[#0d1637] to-[#070d22] shadow-[0_0_24px_rgba(245,158,11,0.15)]'
                      : 'border-white/15 bg-gradient-to-br from-black/40 via-white/5 to-black/60 hover:border-amber-400/40'
                  }`}
                >
                  {/* Top Bar: Order & Category + Duration & Key Note */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
                          isHimnoSong
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black'
                            : song.category === 'adoracion'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : song.category === 'animacion'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}
                      >
                        {song.orderNumber} • {song.categoryLabel}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-black/40 border border-white/10 text-slate-300">
                        {song.duration}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                      {song.rhythmNote}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h2 className={`text-lg sm:text-xl font-bold ${theme.textMain} flex items-center gap-2`}>
                      <span>{song.title}</span>
                      {isHimnoSong && (
                        <span className="material-symbols-outlined text-amber-400 text-[18px]">verified</span>
                      )}
                    </h2>
                    <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${theme.textMuted}`}>
                      {song.subtitle}
                    </p>
                  </div>

                  {/* Interactive Controls Bar: Transpose, Chords Viewer, Audio Demo */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 mt-1 bg-black/50 border border-white/10 p-3 rounded-xl">
                    {/* Tono Stepper */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${theme.textMuted}`}>Tono:</span>
                      <div className="inline-flex items-center bg-black/60 border border-white/20 rounded-lg p-0.5">
                        <button
                          onClick={() => handleTranspose(song, -1)}
                          className="w-7 h-7 rounded flex items-center justify-center text-slate-200 hover:bg-white/15 active:scale-95 transition-all"
                          title="Bajar medio tono (-1)"
                        >
                          <span className="material-symbols-outlined text-[15px]">remove</span>
                        </button>
                        <span className="w-11 text-center text-xs font-bold text-amber-400 font-mono">
                          {song.currentKey}
                        </span>
                        <button
                          onClick={() => handleTranspose(song, 1)}
                          className="w-7 h-7 rounded flex items-center justify-center text-slate-200 hover:bg-white/15 active:scale-95 transition-all"
                          title="Subir medio tono (+1)"
                        >
                          <span className="material-symbols-outlined text-[15px]">add</span>
                        </button>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {song.introTags && song.introTags.length > 0 && (
                        <div className="hidden md:flex items-center gap-1.5">
                          {song.introTags.map((tag, tIdx) => (
                            <span key={tIdx} className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-slate-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => onOpenChordModal(song)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 border border-white/15 text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">queue_music</span>
                        <span>Pista & Acordes</span>
                      </button>

                      <button
                        onClick={() => onOpenStageMode(index)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                        title="Ver en pantalla completa de escenario"
                      >
                        <span className="material-symbols-outlined text-[18px]">open_in_full</span>
                      </button>
                    </div>
                  </div>

                  {/* If this is Song 04: Render the Authentic Audio Player with real synthesis */}
                  {isHimnoSong && (
                    <div className="flex flex-col gap-2 pt-2 mt-1 bg-black/60 border border-amber-400/30 p-3 rounded-xl shadow-inner">
                      <div className="flex items-center justify-between gap-3">
                        <button
                          onClick={handleTogglePlay}
                          className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-black flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          title={isPlayingAudio ? 'Pausar maqueta' : 'Reproducir maqueta oficial VEC'}
                        >
                          <span className="material-symbols-outlined text-[24px]">
                            {isPlayingAudio ? 'pause' : 'play_arrow'}
                          </span>
                        </button>

                        <div className="flex-1 flex flex-col gap-1">
                          <div
                            onClick={handleSeek}
                            className="relative w-full h-2.5 bg-white/10 rounded-full overflow-hidden cursor-pointer group"
                            title="Avanzar o retroceder audio"
                          >
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-sky-400 rounded-full transition-all duration-150 group-hover:brightness-125"
                              style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono">
                            <span className="text-amber-400 font-semibold">{formatTimeSeconds(currentTime)}</span>
                            <span className="text-[10px] text-amber-300/80 font-bold uppercase tracking-wider">
                              Maqueta Oficial VEC Banda
                            </span>
                            <span>{formatTimeSeconds(totalDuration)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={handleSpeedCycle}
                            className="px-2 py-0.5 rounded bg-white/10 text-slate-300 hover:text-white text-[11px] font-mono font-bold border border-white/15"
                            title="Velocidad de reproducción"
                          >
                            {playbackSpeed}x
                          </button>
                          <button
                            onClick={() => setIsLooping(!isLooping)}
                            className={`p-1 rounded transition-colors ${
                              isLooping ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                            }`}
                            title="Repetir tema"
                          >
                            <span className="material-symbols-outlined text-[17px]">repeat</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}

            {filteredSongs.length === 0 && (
              <div className="p-8 text-center bg-black/30 border border-white/10 rounded-2xl">
                <span className="material-symbols-outlined text-slate-400 text-4xl mb-2">search_off</span>
                <p className="text-sm font-semibold text-slate-300">No se encontraron cantos con ese filtro</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedFilter('todos');
                  }}
                  className="mt-3 px-4 py-1.5 rounded-lg bg-white/10 text-xs text-amber-300 font-bold hover:bg-white/20"
                >
                  Restablecer búsqueda
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: TIEMPOS LITURGICOS & SANTA MISA */}
      {/* ========================================================================= */}
      {activeSubTab === 'liturgicos' && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className={`p-4 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl flex flex-col gap-4`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]"></span>
                  <span className="text-[11px] text-amber-400 uppercase font-bold tracking-wider">
                    Repertorio para la Santa Misa
                  </span>
                </div>
                <h2 className={`text-lg sm:text-xl font-bold ${theme.textMain} mt-0.5`}>
                  Tiempos Litúrgicos & Ritos Eucarísticos
                </h2>
                <p className={`text-xs sm:text-sm ${theme.textMuted}`}>
                  Esquema completo organizado según las rúbricas y tiempos de la Iglesia.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-amber-300 font-bold shrink-0">
                8 Momentos
              </span>
            </div>

            {/* Moments Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LITURGICAL_MOMENTS.map((moment) => (
                <div
                  key={moment.id}
                  onClick={() => setSelectedMoment(moment)}
                  className="p-4 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between hover:bg-white/10 hover:border-amber-400/40 transition-all cursor-pointer shadow-md group"
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-[24px] ${moment.accentColor} group-hover:scale-110 transition-transform`}>
                      {moment.icon}
                    </span>
                    <div>
                      <p className={`text-sm font-bold ${theme.textMain}`}>{moment.name}</p>
                      <span className={`text-[11px] ${theme.textMuted} line-clamp-1`}>
                        {moment.description}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 ${moment.accentColor}`}>
                    {moment.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Liturgical Seasons Guide */}
            <div className="p-4 bg-black/50 border border-white/10 rounded-xl mt-2">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                Recomendaciones por Tiempo Litúrgico
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200">
                  <span className="font-bold block">Tiempo Ordinario</span>
                  <span className="text-[10px] text-emerald-300/80">Cantos de camino, reino y comunidad</span>
                </div>
                <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-200">
                  <span className="font-bold block">Adviento & Cuaresma</span>
                  <span className="text-[10px] text-purple-300/80">Sobriedad, penitencia y espera</span>
                </div>
                <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200">
                  <span className="font-bold block">Pascua & Resurrección</span>
                  <span className="text-[10px] text-amber-300/80">¡Aleluya! Júbilo y gloria solemne</span>
                </div>
                <div className="p-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200">
                  <span className="font-bold block">Pentecostés</span>
                  <span className="text-[10px] text-red-300/80">Fuego y efusión del Espíritu</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal for selected Liturgical Moment */}
          {selectedMoment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
              <div className="w-full max-w-lg bg-[#0a1128] border border-white/20 rounded-2xl shadow-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[24px] ${selectedMoment.accentColor}`}>
                      {selectedMoment.icon}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white">{selectedMoment.name}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedMoment(null)}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300">{selectedMoment.description}</p>

                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    Cantos Sugeridos para este momento ({selectedMoment.recommendedSongs.length})
                  </span>
                  {selectedMoment.recommendedSongs.map((hymn, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{hymn.title}</p>
                        <span className="text-[10px] text-slate-400">
                          {hymn.liturgicalSeason} • Tempo: {hymn.tempo}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-white/10 text-amber-400 font-mono text-xs font-bold">
                        {hymn.key}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedMoment(null)}
                  className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors mt-2"
                >
                  Entendido
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: CANTOS VEC PROPIOS */}
      {/* ========================================================================= */}
      {activeSubTab === 'propios' && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className={`p-4 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl flex flex-col gap-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-lg sm:text-xl font-bold ${theme.textMain}`}>
                  Composiciones Propias de Voces en Cristo
                </h2>
                <p className={`text-xs sm:text-sm ${theme.textMuted}`}>
                  Música original inspirada en la oración comunitaria y testimonios del grupo.
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${theme.primaryBadge}`}>
                6 Canciones VEC
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {songs
                .filter((s) => s.isOriginalVEC || s.category === 'propios')
                .map((vecSong) => (
                  <div
                    key={vecSong.id}
                    className="flex flex-wrap items-center justify-between p-3.5 bg-black/40 border border-white/10 rounded-xl hover:bg-white/10 hover:border-amber-400/30 transition-all gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-amber-400 text-[24px]">stars</span>
                      <div>
                        <p className={`text-sm font-bold ${theme.textMain}`}>{vecSong.title}</p>
                        <span className={`text-xs ${theme.textMuted}`}>
                          {vecSong.subtitle} • Tono: <strong className="text-amber-400 font-mono">{vecSong.currentKey}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenChordModal(vecSong)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 border border-amber-400/30 text-amber-300 font-bold text-xs hover:bg-amber-400 hover:text-black transition-all cursor-pointer"
                      >
                        Ver Acordes
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: ARCHIVOS & CIFRADOS */}
      {/* ========================================================================= */}
      {activeSubTab === 'archivos' && (
        <div className="flex flex-col gap-5 animate-fadeIn">
          <div className={`p-4 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl flex flex-col gap-5`}>
            {/* Header with Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className={`text-lg sm:text-xl font-bold ${theme.textMain} flex items-center gap-2`}>
                  Partituras & Material de la Banda
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 uppercase">
                    {documents.length} Archivos
                  </span>
                </h2>
                <p className={`text-xs sm:text-sm ${theme.textMuted}`}>
                  Sube y descarga guiones de concierto, partituras en PDF, letras en Word (.doc/.docx) y pistas.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* User Requested: Prominent PDF / DOC Import Button */}
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title="Importar archivo PDF o Word para los cantos"
                >
                  <Upload className="w-4 h-4" />
                  <span>+ Importar Archivo PDF / DOC</span>
                </button>

                <button
                  onClick={() => alert('Descarga iniciada: Pack_Completo_Concierto_VEC.zip (38 MB)')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110 active:scale-95 cursor-pointer bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15`}
                >
                  <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
                  <span>Pack Concierto (.ZIP)</span>
                </button>
              </div>
            </div>

            {/* Quick Upload Drag & Drop Box */}
            <div
              onClick={() => quickFileInputRef.current?.click()}
              className="p-4 sm:p-5 rounded-2xl border-2 border-dashed border-amber-400/30 hover:border-amber-400/60 bg-amber-500/5 hover:bg-amber-500/10 transition-all flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer group"
            >
              <input
                ref={quickFileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleQuickFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <div className="flex items-center gap-3.5 text-left">
                <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    ¿Tienes un nuevo archivo PDF, Word (.DOC/.DOCX) o Acordes?
                  </h4>
                  <p className="text-xs text-slate-400">
                    Haz clic aquí o arrastra tu archivo para importarlo al instante en el cancionero
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-xs font-bold shrink-0 transition-all"
              >
                Seleccionar Archivo
              </button>
            </div>

            {/* Documents List */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Documentos y Partituras Disponibles
              </h3>

              {documents.map((doc) => {
                const isPdf = doc.type === 'pdf' || doc.name.toLowerCase().endsWith('.pdf');
                const isWord = doc.type === 'doc' || doc.type === 'docx' || doc.name.toLowerCase().endsWith('.doc') || doc.name.toLowerCase().endsWith('.docx');
                const isZip = doc.type === 'zip' || doc.name.toLowerCase().endsWith('.zip');

                return (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 bg-black/40 border border-white/10 rounded-2xl hover:bg-white/5 transition-all gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isPdf
                            ? 'bg-rose-950/70 border border-rose-500/50 text-rose-300'
                            : isWord
                            ? 'bg-sky-950/70 border border-sky-500/50 text-sky-300'
                            : isZip
                            ? 'bg-amber-950/70 border border-amber-500/50 text-amber-300'
                            : 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-300'
                        }`}
                      >
                        {isPdf ? (
                          <FileText className="w-5 h-5" />
                        ) : isWord ? (
                          <FileCode className="w-5 h-5" />
                        ) : (
                          <span className="material-symbols-outlined text-[24px]">
                            {isZip ? 'folder_zip' : 'description'}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-sm font-bold truncate ${theme.textMain}`}>
                            {doc.name}
                          </p>
                          {doc.isUserUploaded && (
                            <span className="text-[10px] px-2 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                              Importado
                            </span>
                          )}
                          <span className="text-[10px] px-1.5 py-0.2 rounded uppercase font-mono font-bold bg-white/10 text-slate-300">
                            {doc.type}
                          </span>
                        </div>
                        <p className={`text-xs ${theme.textMuted} mt-0.5 line-clamp-1`}>
                          {doc.sizeFormatted} • {doc.uploadedAt} • {doc.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => setViewingDoc(doc)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Ver o previsualizar documento"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ver</span>
                      </button>

                      <button
                        onClick={() => downloadDocument(doc)}
                        className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Descargar archivo a tu dispositivo"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar</span>
                      </button>

                      {doc.isUserUploaded && (
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:border-rose-500/30 border border-white/10 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                          title="Eliminar archivo importado"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick action for musicians: Launch stage teleprompter */}
            <div className="pt-2">
              <button
                onClick={() => onOpenStageMode(0)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">monitor</span>
                <span>Abrir Modo Teleprompter de Escenario (Pantalla Completa)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals for Document Import & Viewing */}
      <ImportSongDocumentModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        currentTheme={currentTheme}
        onAddDocument={handleAddDocument}
        onAddSong={(newSong) => {
          if (onAddSong) {
            onAddSong(newSong);
          }
        }}
      />

      <DocumentViewerModal
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        document={viewingDoc}
        currentTheme={currentTheme}
      />
    </div>
  );
};
