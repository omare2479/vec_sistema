import { useState, useEffect } from 'react';
import { MainNavTab, ThemeMode, Song, UserAccount, GalleryPhoto } from './types';
import { THEMES } from './utils/theme';
import { INITIAL_CONCERT_SONGS } from './data/mockData';
import {
  loadUsersFromStorage,
  saveUsersToStorage,
  loadCurrentSession,
  saveCurrentSession,
} from './data/userAccountsData';
import {
  loadAllGalleryPhotos,
  saveMultipleGalleryPhotos,
  deleteGalleryPhoto as deletePhotoFromStorage,
  resetGalleryToDefault as resetGalleryStorage,
} from './utils/galleryStorage';
import { Header } from './components/Header';
import { SideWatermarks } from './components/SideWatermarks';
import { RepertorioConciertoView } from './components/RepertorioConciertoView';
import { ComunidadView } from './components/ComunidadView';
import { InicioEvangelioView } from './components/InicioEvangelioView';
import { UserManagementView } from './components/UserManagementView';
import { ChordViewerModal } from './components/ChordViewerModal';
import { AddSongModal } from './components/AddSongModal';
import { StageModeModal } from './components/StageModeModal';
import { LoginEntranceModal } from './components/LoginEntranceModal';
import { ChangeMinistryImageModal } from './components/ChangeMinistryImageModal';
import { GalleryModal } from './components/GalleryModal';
import { Image as ImageIcon, Sparkles, Shuffle } from 'lucide-react';

const STORAGE_CUSTOM_IMAGE_KEY = 'vec_custom_ministry_image_v1';
const STORAGE_WALLPAPER_MODE_KEY = 'vec_wallpaper_mode_v1';

export default function App() {
  const [currentNav, setCurrentNav] = useState<MainNavTab>('repertorio');
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('zafiro');
  const [songs, setSongs] = useState<Song[]>(INITIAL_CONCERT_SONGS);

  // Ministry Image State (defaults to the untouched original /vec.jpg, can be customized or restored)
  const [ministryImage, setMinistryImage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_CUSTOM_IMAGE_KEY) || '/vec.jpg';
    }
    return '/vec.jpg';
  });
  const [isChangeImageOpen, setIsChangeImageOpen] = useState(false);

  // Gallery Photos State & Random System Photos
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [wallpaperMode, setWallpaperMode] = useState<'logo' | 'random_photo'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(STORAGE_WALLPAPER_MODE_KEY) as 'logo' | 'random_photo') || 'logo';
    }
    return 'logo';
  });
  const [randomPhotoIndex, setRandomPhotoIndex] = useState<number>(0);

  // Load photos on mount
  useEffect(() => {
    loadAllGalleryPhotos().then((photos) => {
      setGalleryPhotos(photos);
      if (photos.length > 0) {
        setRandomPhotoIndex(Math.floor(Math.random() * photos.length));
      }
    });
  }, []);

  // Soft timer to rotate random photo in the background and across system every 25 seconds
  useEffect(() => {
    if (galleryPhotos.length <= 1) return;
    const interval = setInterval(() => {
      setRandomPhotoIndex((prev) => (prev + 1) % galleryPhotos.length);
    }, 25000);
    return () => clearInterval(interval);
  }, [galleryPhotos.length]);

  const handleToggleWallpaperMode = () => {
    setWallpaperMode((prev) => {
      const next = prev === 'logo' ? 'random_photo' : 'logo';
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_WALLPAPER_MODE_KEY, next);
      }
      return next;
    });
  };

  const handleShuffleBackgroundPhoto = () => {
    if (galleryPhotos.length <= 1) return;
    setRandomPhotoIndex((prev) => {
      let next = Math.floor(Math.random() * galleryPhotos.length);
      if (next === prev) next = (prev + 1) % galleryPhotos.length;
      return next;
    });
  };

  const handleAddGalleryPhotos = async (newPhotos: GalleryPhoto[]) => {
    const updated = [...newPhotos, ...galleryPhotos];
    setGalleryPhotos(updated);
    await saveMultipleGalleryPhotos(updated);
  };

  const handleDeleteGalleryPhoto = async (id: string) => {
    const updated = galleryPhotos.filter((p) => p.id !== id);
    setGalleryPhotos(updated);
    await deletePhotoFromStorage(id);
  };

  const handleResetGalleryPhotos = async () => {
    await resetGalleryStorage();
    const fresh = await loadAllGalleryPhotos();
    setGalleryPhotos(fresh);
  };

  // User Accounts & Authentication State
  const [users, setUsers] = useState<UserAccount[]>(() => loadUsersFromStorage());
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => loadCurrentSession());
  // Show entrance modal with apparition effect if not logged in or explicitly requested
  const [isEntranceOpen, setIsEntranceOpen] = useState<boolean>(() => !loadCurrentSession());

  // Modal states
  const [selectedChordSong, setSelectedChordSong] = useState<Song | null>(null);
  const [isAddSongOpen, setIsAddSongOpen] = useState(false);
  const [stageModeIndex, setStageModeIndex] = useState<number | null>(null);

  const theme = THEMES[currentTheme];

  const handleSaveMinistryImage = (newImage: string) => {
    setMinistryImage(newImage);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_CUSTOM_IMAGE_KEY, newImage);
    }
  };

  const handleResetMinistryImage = () => {
    setMinistryImage('/vec.jpg');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_CUSTOM_IMAGE_KEY);
    }
  };

  const handleUpdateSongKey = (songId: string, newKey: string) => {
    setSongs((prev) =>
      prev.map((s) => (s.id === songId ? { ...s, currentKey: newKey } : s))
    );
  };

  const handleAddSong = (newSong: Song) => {
    setSongs((prev) => [newSong, ...prev]);
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    saveCurrentSession(user);
    setIsEntranceOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveCurrentSession(null);
    setIsEntranceOpen(true);
  };

  const handleCreateUser = (newAccount: UserAccount) => {
    setUsers((prev) => {
      const next = [newAccount, ...prev];
      saveUsersToStorage(next);
      return next;
    });
  };

  const handleUpdateUser = (id: string, updates: Partial<UserAccount>) => {
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === id ? { ...u, ...updates } : u));
      saveUsersToStorage(next);
      return next;
    });

    if (currentUser?.id === id) {
      const updated = { ...currentUser, ...updates };
      setCurrentUser(updated);
      saveCurrentSession(updated);
    }
  };

  const handleDeleteUser = (id: string) => {
    setUsers((prev) => {
      const next = prev.filter((u) => u.id !== id);
      saveUsersToStorage(next);
      return next;
    });

    if (currentUser?.id === id) {
      handleLogout();
    }
  };

  return (
    <div className={`min-h-screen ${theme.bgClass} text-[#f0f6ff] transition-colors duration-300 relative flex flex-col selection:bg-amber-400 selection:text-amber-950`}>
      {/* Background Radial Glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 15%, ${theme.glowColor}, transparent 65%)`,
        }}
      />

      {/* Fondo de Pantalla Central del Ministerio VEC (Wallpaper en el centro del app) */}
      <div 
        id="vec-center-wallpaper"
        className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div className="relative w-72 h-72 sm:w-[460px] sm:h-[460px] md:w-[560px] md:h-[560px] lg:w-[650px] lg:h-[650px] opacity-20 sm:opacity-25 transition-all duration-700 select-none flex items-center justify-center">
          {wallpaperMode === 'random_photo' && galleryPhotos.length > 0 ? (
            <img
              key={galleryPhotos[randomPhotoIndex % galleryPhotos.length]?.id || 'rand-photo'}
              src={galleryPhotos[randomPhotoIndex % galleryPhotos.length]?.imageUrl || ministryImage || '/vec.jpg'}
              alt="Fondo Aleatorio Galería VEC"
              className="w-full h-full object-cover rounded-3xl filter drop-shadow-[0_0_90px_rgba(245,158,11,0.35)] transition-opacity duration-1000"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = ministryImage || '/vec.jpg';
              }}
            />
          ) : (
            <img
              src={ministryImage || "/vec.jpg"}
              alt="Fondo Central Voces en Cristo"
              className="w-full h-full object-contain filter drop-shadow-[0_0_90px_rgba(245,158,11,0.35)]"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/vec.jpg";
              }}
            />
          )}
        </div>
      </div>

      {/* Sacred Side Watermarks */}
      <SideWatermarks />

      {/* Fixed Application Header with Auth & Navigation */}
      <Header
        currentNav={currentNav}
        onNavChange={setCurrentNav}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        currentUser={currentUser}
        ministryImage={ministryImage}
        onOpenLoginModal={() => setIsEntranceOpen(true)}
        onOpenChangeImageModal={() => setIsChangeImageOpen(true)}
        onLogout={handleLogout}
        onOpenGallery={() => setIsGalleryOpen(true)}
        photoCount={galleryPhotos.length}
      />

      {/* Main Screen Content */}
      <main className="flex-1 w-full pt-20 sm:pt-24 pb-16 px-3 sm:px-4 flex flex-col items-center relative z-20">
        {currentNav === 'repertorio' && (
          <RepertorioConciertoView
            currentTheme={currentTheme}
            songs={songs}
            onUpdateSongKey={handleUpdateSongKey}
            onAddSong={handleAddSong}
            onOpenChordModal={(song) => setSelectedChordSong(song)}
            onOpenAddModal={() => setIsAddSongOpen(true)}
            onOpenStageMode={(idx) => setStageModeIndex(idx)}
            photos={galleryPhotos}
            onOpenGallery={() => setIsGalleryOpen(true)}
          />
        )}

        {currentNav === 'comunidad' && (
          <ComunidadView
            currentTheme={currentTheme}
            photos={galleryPhotos}
            onOpenGallery={() => setIsGalleryOpen(true)}
          />
        )}

        {currentNav === 'evangelio' && (
          <InicioEvangelioView
            currentTheme={currentTheme}
            onGoToRepertorio={() => setCurrentNav('repertorio')}
          />
        )}

        {currentNav === 'usuarios' && (
          <UserManagementView
            currentTheme={currentTheme}
            users={users}
            currentUser={currentUser}
            ministryImage={ministryImage}
            onOpenChangeImageModal={() => setIsChangeImageOpen(true)}
            onResetMinistryImage={handleResetMinistryImage}
            onCreateUser={handleCreateUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onOpenEntranceModal={() => setIsEntranceOpen(true)}
          />
        )}
      </main>

      {/* Floating Control: Toggle Wallpaper Logo / Random Ministry Photo */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 p-1 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/15 shadow-2xl">
        <button
          onClick={handleToggleWallpaperMode}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            wallpaperMode === 'random_photo'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title={wallpaperMode === 'random_photo' ? 'Cambiar a Fondo de Logotipo Oficial' : 'Cambiar a Fotos Aleatorias del Ministerio en el Fondo'}
        >
          {wallpaperMode === 'random_photo' ? (
            <>
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fondo: Fotos</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Fondo: Logo</span>
            </>
          )}
        </button>

        {wallpaperMode === 'random_photo' && (
          <button
            onClick={handleShuffleBackgroundPhoto}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 transition-colors cursor-pointer"
            title="Cambiar a otra foto aleatoria del ministerio"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={() => setIsGalleryOpen(true)}
          className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-300 hover:bg-amber-400/20 border border-amber-400/30 transition-colors cursor-pointer flex items-center gap-1.5"
          title="Abrir Galería de Fotos VEC"
        >
          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Galería</span>
          <span className="text-[10px] bg-amber-400/30 text-amber-200 px-1.5 py-0.2 rounded-full font-extrabold">
            {galleryPhotos.length}
          </span>
        </button>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 bg-black/60 py-6 px-4 text-center text-xs text-slate-400 relative z-20 mt-auto backdrop-blur-md">
        <div className="max-w-xl mx-auto flex flex-col gap-2">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]"></span>
            <span className="font-bold text-slate-200">VEC • Voces en Cristo</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Ministerio de Música Cristiana Católica • Alabanza, Adoración Eucarística y Santa Misa
          </p>
          <div className="flex items-center justify-center gap-4 text-slate-500 text-[11px] mt-1 flex-wrap">
            <span>© {new Date().getFullYear()} Voces en Cristo</span>
            <span>•</span>
            <button
              onClick={() => setCurrentNav('repertorio')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Repertorios
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentNav('comunidad')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Comunidad
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentNav('evangelio')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Evangelio
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentNav('usuarios')}
              className="hover:text-amber-400 transition-colors cursor-pointer text-amber-300/80"
            >
              Cuentas & Roles
            </button>
            <span>•</span>
            <button
              onClick={() => setIsEntranceOpen(true)}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Entrada Sagrada
            </button>
          </div>
        </div>
      </footer>

      {/* Entrance Screen Modal with Apparition Effect */}
      {isEntranceOpen && (
        <LoginEntranceModal
          currentTheme={currentTheme}
          users={users}
          currentUser={currentUser}
          ministryImage={ministryImage}
          onLoginSuccess={handleLoginSuccess}
          onRegisterUser={handleCreateUser}
          onOpenChangeImageModal={() => setIsChangeImageOpen(true)}
          onClose={() => setIsEntranceOpen(false)}
          canCloseWithoutLogin={currentUser !== null}
        />
      )}

      {/* Change Ministry Image Modal */}
      {isChangeImageOpen && (
        <ChangeMinistryImageModal
          currentTheme={currentTheme}
          currentImage={ministryImage}
          onSaveImage={handleSaveMinistryImage}
          onResetToDefault={handleResetMinistryImage}
          onClose={() => setIsChangeImageOpen(false)}
        />
      )}

      {/* Chord & Lyrics Viewer Modal */}
      {selectedChordSong && (
        <ChordViewerModal
          song={selectedChordSong}
          currentTheme={currentTheme}
          onClose={() => setSelectedChordSong(null)}
        />
      )}

      {/* Add Song to Setlist Modal */}
      {isAddSongOpen && (
        <AddSongModal
          currentTheme={currentTheme}
          onClose={() => setIsAddSongOpen(false)}
          onAddSong={handleAddSong}
        />
      )}

      {/* Stage Teleprompter Fullscreen Mode */}
      {stageModeIndex !== null && (
        <StageModeModal
          songs={songs}
          initialSongIndex={stageModeIndex}
          currentTheme={currentTheme}
          onClose={() => setStageModeIndex(null)}
        />
      )}

      {/* Gallery Modal with Upload, Fullscreen View, Wallpaper Setting, and Filters */}
      {isGalleryOpen && (
        <GalleryModal
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          currentTheme={currentTheme}
          photos={galleryPhotos}
          onAddPhotos={handleAddGalleryPhotos}
          onDeletePhoto={handleDeleteGalleryPhoto}
          onResetToDefault={handleResetGalleryPhotos}
          onSetAsWallpaper={(url) => {
            handleSaveMinistryImage(url);
          }}
        />
      )}
    </div>
  );
}
