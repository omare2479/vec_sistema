import { useState, useEffect } from 'react';
import { MainNavTab, ThemeMode, Song, UserAccount, GalleryPhoto } from './types';
import { THEMES } from './utils/theme';
import {
  loadAllSongs,
  loadSongsFromStorageSync,
  saveSongsToStorage,
  deleteSongFromCloud,
} from './utils/songStorage';
import {
  loadUsersFromStorage,
  saveUsersToStorage,
  loadCurrentSession,
  saveCurrentSession,
  fetchUsersFromCloud,
  saveUserToCloud,
  deleteUserFromCloud,
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
import { Image as ImageIcon, Sparkles, Shuffle, Shield, Lock, ArrowLeft } from 'lucide-react';

const STORAGE_CUSTOM_IMAGE_KEY = 'vec_custom_ministry_image_v1';
const STORAGE_WALLPAPER_MODE_KEY = 'vec_wallpaper_mode_v1';

export default function App() {
  const [currentNav, setCurrentNav] = useState<MainNavTab>('repertorio');
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('zafiro');

  // Song state with centralized persistence (localStorage + Supabase cloud)
  const [songs, setSongs] = useState<Song[]>(() => loadSongsFromStorageSync());

  // User Accounts & Authentication State - Carga directa libre sin usuario
  const [users, setUsers] = useState<UserAccount[]>(() => loadUsersFromStorage());
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Authenticated administrator flag (only admin_central or admin)
  const isAdmin = Boolean(currentUser && (currentUser.role === 'admin_central' || currentUser.role === 'admin'));

  // Entrance modal: open ONLY on demand when clicking "Acceso Admin"
  const [isEntranceOpen, setIsEntranceOpen] = useState(false);

  // Ministry Image State (defaults to /vec.jpg, can be customized or restored by admins)
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

  // Modal states
  const [selectedChordSong, setSelectedChordSong] = useState<Song | null>(null);
  const [isAddSongOpen, setIsAddSongOpen] = useState(false);
  const [stageModeIndex, setStageModeIndex] = useState<number | null>(null);

  const theme = THEMES[currentTheme];

  // Load photos, songs, and users from cloud on mount
  useEffect(() => {
    // 0. Purgar cualquier residuo de sesiones o cuentas antiguas
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('vec_ministerio_session_v1');
        localStorage.removeItem('vec_ministerio_session_v2');
        localStorage.removeItem('vec_ministerio_users_v1');
        localStorage.removeItem('vec_ministerio_users_v2');
      } catch {
        // ignore
      }
    }

    // 1. Cargar fotos de galería
    loadAllGalleryPhotos().then((photos) => {
      setGalleryPhotos(photos);
      if (photos.length > 0) {
        setRandomPhotoIndex(Math.floor(Math.random() * photos.length));
      }
    });

    // 2. Cargar canciones centralizadas
    loadAllSongs().then((cloudSongs) => {
      if (cloudSongs && cloudSongs.length > 0) {
        setSongs(cloudSongs);
      }
    });

    // 3. Cargar usuarios oficiales administradores (depurando usuarios antiguos)
    const cleanAdmins = loadUsersFromStorage();
    setUsers(cleanAdmins);
    saveUsersToStorage(cleanAdmins);

    fetchUsersFromCloud().then((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        setUsers(cloudUsers);
        saveUsersToStorage(cloudUsers);
      }
    });
  }, []);

  // Soft timer to rotate random photo in the background every 25 seconds
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

  // --- Centralized Song Actions (Admin Only) ---
  const handleUpdateSongKey = (songId: string, newKey: string) => {
    if (!isAdmin) return;
    setSongs((prev) => {
      const next = prev.map((s) => (s.id === songId ? { ...s, currentKey: newKey } : s));
      saveSongsToStorage(next);
      return next;
    });
  };

  const handleAddSong = (newSong: Song) => {
    if (!isAdmin) return;
    setSongs((prev) => {
      const next = [newSong, ...prev];
      saveSongsToStorage(next);
      return next;
    });
  };

  const handleDeleteSong = (songId: string) => {
    if (!isAdmin) return;
    setSongs((prev) => {
      const next = prev.filter((s) => s.id !== songId);
      saveSongsToStorage(next);
      return next;
    });
    deleteSongFromCloud(songId);
  };

  // --- Centralized Gallery Actions (Admin Only) ---
  const handleAddGalleryPhotos = async (newPhotos: GalleryPhoto[]) => {
    if (!isAdmin) return;
    const updated = [...newPhotos, ...galleryPhotos];
    setGalleryPhotos(updated);
    await saveMultipleGalleryPhotos(updated);
  };

  const handleDeleteGalleryPhoto = async (id: string) => {
    if (!isAdmin) return;
    const updated = galleryPhotos.filter((p) => p.id !== id);
    setGalleryPhotos(updated);
    await deletePhotoFromStorage(id);
  };

  const handleResetGalleryPhotos = async () => {
    if (!isAdmin) return;
    await resetGalleryStorage();
    const fresh = await loadAllGalleryPhotos();
    setGalleryPhotos(fresh);
  };

  const handleRefreshPhotos = async () => {
    const fresh = await loadAllGalleryPhotos();
    if (fresh && fresh.length > 0) {
      setGalleryPhotos(fresh);
    }
  };

  // --- Ministry Image Actions (Admin Only) ---
  const handleSaveMinistryImage = (newImage: string) => {
    if (!isAdmin) return;
    setMinistryImage(newImage);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_CUSTOM_IMAGE_KEY, newImage);
    }
  };

  const handleResetMinistryImage = () => {
    if (!isAdmin) return;
    setMinistryImage('/vec.jpg');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_CUSTOM_IMAGE_KEY);
    }
  };

  // --- Authentication Handlers ---
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    saveCurrentSession(user);
    setIsEntranceOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveCurrentSession(null);
    if (currentNav === 'usuarios') {
      setCurrentNav('repertorio');
    }
  };

  // --- Admin Account Management (Admin Only) ---
  const handleCreateUser = async (newAccount: UserAccount) => {
    if (!isAdmin) return;
    setUsers((prev) => {
      const next = [newAccount, ...prev];
      saveUsersToStorage(next);
      return next;
    });
    await saveUserToCloud(newAccount);
  };

  const handleUpdateUser = async (id: string, updates: Partial<UserAccount>) => {
    if (!isAdmin) return;
    let updatedAccount: UserAccount | null = null;
    setUsers((prev) => {
      const next = prev.map((u) => {
        if (u.id === id) {
          updatedAccount = { ...u, ...updates };
          return updatedAccount;
        }
        return u;
      });
      saveUsersToStorage(next);
      return next;
    });

    if (currentUser?.id === id) {
      const updated = { ...currentUser, ...updates };
      setCurrentUser(updated);
      saveCurrentSession(updated);
    }

    if (updatedAccount) {
      await saveUserToCloud(updatedAccount);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!isAdmin) return;
    setUsers((prev) => {
      const next = prev.filter((u) => u.id !== id);
      saveUsersToStorage(next);
      return next;
    });

    await deleteUserFromCloud(id);

    if (currentUser?.id === id) {
      handleLogout();
    }
  };

  const handleRefreshUsers = async () => {
    const cloudUsers = await fetchUsersFromCloud();
    if (cloudUsers && cloudUsers.length > 0) {
      setUsers(cloudUsers);
      saveUsersToStorage(cloudUsers);
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

      {/* Central Ministry Wallpaper */}
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

      {/* Fixed Application Header with Navigation */}
      <Header
        currentNav={currentNav}
        onNavChange={setCurrentNav}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        currentUser={currentUser}
        ministryImage={ministryImage}
        onOpenLoginModal={() => setIsEntranceOpen(true)}
        onOpenChangeImageModal={() => {
          if (isAdmin) setIsChangeImageOpen(true);
        }}
        onLogout={handleLogout}
        onOpenGallery={() => setIsGalleryOpen(true)}
        photoCount={galleryPhotos.length}
        isAdmin={isAdmin}
      />

      {/* Main Screen Content */}
      <main className="flex-1 w-full pt-20 sm:pt-24 pb-16 px-3 sm:px-4 flex flex-col items-center relative z-20">
        {currentNav === 'repertorio' && (
          <RepertorioConciertoView
            currentTheme={currentTheme}
            songs={songs}
            onUpdateSongKey={handleUpdateSongKey}
            onAddSong={handleAddSong}
            onDeleteSong={handleDeleteSong}
            onOpenChordModal={(song) => setSelectedChordSong(song)}
            onOpenAddModal={() => {
              if (isAdmin) setIsAddSongOpen(true);
            }}
            onOpenStageMode={(idx) => setStageModeIndex(idx)}
            photos={galleryPhotos}
            onOpenGallery={() => setIsGalleryOpen(true)}
            isAdmin={isAdmin}
          />
        )}

        {currentNav === 'comunidad' && (
          <ComunidadView
            currentTheme={currentTheme}
            photos={galleryPhotos}
            users={users}
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
          isAdmin ? (
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
              onRefreshUsers={handleRefreshUsers}
            />
          ) : (
            <div className="w-full max-w-lg mt-12 p-8 rounded-3xl bg-[#091129]/95 border border-white/15 text-center flex flex-col items-center gap-4 shadow-2xl backdrop-blur-xl animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-lg">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">Panel de Administración Exclusivo</h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
                Esta sección está reservada exclusivamente para directores y administradores de Voces en Cristo. Los visitantes pueden consultar los cantos, audios, partituras y comunidad libremente sin iniciar sesión.
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap justify-center">
                <button
                  onClick={() => setIsEntranceOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <Shield className="w-4 h-4" />
                  <span>Acceso de Administrador</span>
                </button>
                <button
                  onClick={() => setCurrentNav('repertorio')}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-white/15"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver al Repertorio</span>
                </button>
              </div>
            </div>
          )
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
            {isAdmin ? (
              <button
                onClick={() => setCurrentNav('usuarios')}
                className="hover:text-amber-400 transition-colors cursor-pointer text-amber-300 font-bold"
              >
                Panel de Administración
              </button>
            ) : (
              <button
                onClick={() => setIsEntranceOpen(true)}
                className="hover:text-amber-400 transition-colors cursor-pointer text-slate-400 flex items-center gap-1"
              >
                <Shield className="w-3 h-3 text-amber-400" />
                <span>Acceso Admin</span>
              </button>
            )}
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
          onOpenChangeImageModal={() => {
            if (isAdmin) setIsChangeImageOpen(true);
          }}
          onClose={() => setIsEntranceOpen(false)}
          canCloseWithoutLogin={true}
        />
      )}

      {/* Change Ministry Image Modal (Admin Only) */}
      {isAdmin && isChangeImageOpen && (
        <ChangeMinistryImageModal
          currentTheme={currentTheme}
          currentImage={ministryImage}
          onSaveImage={handleSaveMinistryImage}
          onResetToDefault={handleResetMinistryImage}
          onClose={() => setIsChangeImageOpen(false)}
        />
      )}

      {/* Chord & Lyrics Viewer Modal (Public Read-Only) */}
      {selectedChordSong && (
        <ChordViewerModal
          song={selectedChordSong}
          currentTheme={currentTheme}
          onClose={() => setSelectedChordSong(null)}
        />
      )}

      {/* Add Song to Setlist Modal (Admin Only) */}
      {isAdmin && isAddSongOpen && (
        <AddSongModal
          currentTheme={currentTheme}
          onClose={() => setIsAddSongOpen(false)}
          onAddSong={handleAddSong}
        />
      )}

      {/* Stage Teleprompter Fullscreen Mode (Public Read-Only) */}
      {stageModeIndex !== null && (
        <StageModeModal
          songs={songs}
          initialSongIndex={stageModeIndex}
          currentTheme={currentTheme}
          onClose={() => setStageModeIndex(null)}
        />
      )}

      {/* Gallery Modal */}
      {isGalleryOpen && (
        <GalleryModal
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          currentTheme={currentTheme}
          photos={galleryPhotos}
          onAddPhotos={handleAddGalleryPhotos}
          onDeletePhoto={handleDeleteGalleryPhoto}
          onResetToDefault={handleResetGalleryPhotos}
          onSetAsWallpaper={isAdmin ? handleSaveMinistryImage : undefined}
          onRefreshPhotos={handleRefreshPhotos}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
