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
  INITIAL_USER_ACCOUNTS,
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
import { SongEditorModal } from './components/SongEditorModal';
import { Image as ImageIcon, Sparkles, Shuffle, Shield, Lock, ArrowLeft } from 'lucide-react';

const STORAGE_CUSTOM_IMAGE_KEY = 'vec_custom_ministry_image_v1';
const STORAGE_WALLPAPER_MODE_KEY = 'vec_wallpaper_mode_v1';

export default function App() {
  const [currentNav, setCurrentNav] = useState<MainNavTab>('repertorio');
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('zafiro');
  const [songToEdit, setSongToEdit] = useState<Song | null>(null);

  // Song state with centralized persistence (localStorage + Supabase cloud)
  const [songs, setSongs] = useState<Song[]>(() => loadSongsFromStorageSync());

  // User Accounts & Authentication State - Activo por defecto como Administrador
  const [users, setUsers] = useState<UserAccount[]>(() => loadUsersFromStorage());
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = loadCurrentSession();
    if (saved) return saved;
    const defaultAdmin = INITIAL_USER_ACCOUNTS[0];
    saveCurrentSession(defaultAdmin);
    return defaultAdmin;
  });

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

  const handleUpdateSong = (updatedSong: Song) => {
    if (!isAdmin) return;
    setSongs((prev) => {
      const next = prev.map((s) => (s.id === updatedSong.id ? updatedSong : s));
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
      try {
        localStorage.setItem(STORAGE_CUSTOM_IMAGE_KEY, newImage);
      } catch (err) {
        console.warn('Error al guardar la imagen en localStorage:', err);
      }
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
            onUpdateSong={handleUpdateSong}
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
            isAdmin={isAdmin}
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

          {/* Social Media & Music Streaming Official Icons */}
          <div className="flex items-center justify-center gap-3 pt-1 pb-1 flex-wrap">
            {/* Spotify */}
            <a
              href="https://open.spotify.com/search/Voces%20en%20Cristo"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-[#1DB954]/20 border border-white/10 hover:border-[#1DB954]/40 text-slate-300 hover:text-[#1ED760] transition-all hover:scale-110 shadow-sm"
              title="Escuchar en Spotify"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </a>

            {/* Amazon Music */}
            <a
              href="https://music.amazon.com/search/Voces+en+Cristo"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-[#00A8E1]/20 border border-white/10 hover:border-[#00A8E1]/40 text-slate-300 hover:text-[#00A8E1] transition-all hover:scale-110 shadow-sm"
              title="Escuchar en Amazon Music"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M13.9 11.7c-.1-.7-.6-1.2-1.6-1.2-.9 0-1.5.5-1.7 1.2h3.3zm-3.3 2.1c0 .8.6 1.3 1.6 1.3.8 0 1.3-.3 1.6-.9h1.7c-.4 1.4-1.6 2.2-3.3 2.2-2.1 0-3.5-1.4-3.5-3.6 0-2.2 1.4-3.6 3.4-3.6 2.2 0 3.5 1.5 3.5 3.6v.9h-5zm-5.4-3.8h1.9v7.1H5.2v-7.1zm.9-1.5c-.7 0-1.2-.5-1.2-1.2 0-.7.5-1.2 1.2-1.2.7 0 1.2.5 1.2 1.2 0 .7-.5 1.2-1.2 1.2zm13.1 5.3c0-1.4-.9-2.3-2.3-2.3-.9 0-1.6.4-2 1.1v-1h-1.8v7.1h1.9v-3.7c0-.8.5-1.4 1.3-1.4.7 0 1 .4 1 1.2v3.9h1.9v-4.9z"/>
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/profile.php?id=100066983563027&locale=es_LA"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-[#1877F2]/20 border border-white/10 hover:border-[#1877F2]/40 text-slate-300 hover:text-[#1877F2] transition-all hover:scale-110 shadow-sm"
              title="Facebook Oficial Voces en Cristo"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/voces_en_cristo/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-[#E4405F]/20 border border-white/10 hover:border-[#E4405F]/40 text-slate-300 hover:text-[#E4405F] transition-all hover:scale-110 shadow-sm"
              title="Instagram Oficial @voces_en_cristo"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@vocesencristo"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-[#EE1D52]/20 border border-white/10 hover:border-[#EE1D52]/40 text-slate-300 hover:text-[#EE1D52] transition-all hover:scale-110 shadow-sm"
              title="TikTok Oficial @vocesencristo"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01v8.86c0 2.21-1.04 4.35-2.86 5.62-1.78 1.25-4.14 1.63-6.24 1.01-2.17-.63-3.99-2.22-4.83-4.32-.86-2.14-.62-4.66.63-6.57 1.24-1.92 3.39-3.07 5.68-3.08.38 0 .76.03 1.14.09v4.18c-.4-.14-.83-.2-1.25-.17-1.17.06-2.23.75-2.73 1.8-.5 1.05-.35 2.34.39 3.23.73.89 1.93 1.34 3.06 1.13 1.14-.21 2.05-1.11 2.24-2.26.06-.39.08-.79.08-1.18V0h.01z"/>
              </svg>
            </a>
          </div>

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

      {/* Chord & Lyrics Viewer Modal (Public Read-Only, Admin can Edit) */}
      {selectedChordSong && (
        <ChordViewerModal
          song={selectedChordSong}
          currentTheme={currentTheme}
          isAdmin={isAdmin}
          onEditSong={(song) => {
            setSelectedChordSong(null);
            setSongToEdit(song);
          }}
          onClose={() => setSelectedChordSong(null)}
        />
      )}

      {/* Direct Song Editor Modal triggered from chord viewer */}
      {isAdmin && songToEdit && (
        <SongEditorModal
          currentTheme={currentTheme}
          song={songToEdit}
          onSave={(updated) => {
            handleUpdateSong(updated);
            setSongToEdit(null);
          }}
          onClose={() => setSongToEdit(null)}
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
