export type ThemeMode = 'zafiro' | 'vino' | 'esmeralda';

export type MainNavTab = 'comunidad' | 'repertorio' | 'evangelio' | 'usuarios';

export type UserRole = 'admin_central' | 'admin' | 'usuario';

export interface UserAccount {
  id: string;
  username: string; // e.g. director.vec or oguillen@oefa.gob.pe
  name: string;
  email?: string;
  role: UserRole;
  instrument: string;
  password: string;
  avatarUrl?: string;
  createdAt: string;
  status: 'activo' | 'inactivo';
  phone?: string;
  notes?: string;
}

export type RepertorioSubTab = 'concierto' | 'liturgicos' | 'propios' | 'archivos';

export interface Song {
  id: string;
  orderNumber: string;
  title: string;
  subtitle: string;
  category: 'adoracion' | 'animacion' | 'propios' | 'liturgico';
  categoryLabel: string;
  duration: string;
  originalKey: string;
  currentKey: string;
  tempoBpm?: number;
  rhythmNote: string;
  arrangementNote: string;
  badgeType?: 'primary' | 'secondary' | 'accent' | 'warning';
  introTags?: string[];
  isOriginalVEC?: boolean;
  audioDurationSeconds?: number;
  lyricsAndChords?: string;
  composer?: string;
  attachedDocName?: string;
  attachedDocUrl?: string;
  attachedDocType?: 'pdf' | 'doc' | 'docx' | 'txt';
}

export interface LiturgicalMoment {
  id: string;
  name: string;
  description: string;
  count: number;
  icon: string;
  accentColor: string;
  recommendedSongs: {
    title: string;
    key: string;
    tempo: string;
    liturgicalSeason: string;
  }[];
}

export interface BandMember {
  id: string;
  name: string;
  role: string;
  instrument: string;
  bio: string;
  imageUrl: string;
  joinedYear: string;
}

export interface PrayerIntention {
  id: string;
  author: string;
  location: string;
  intention: string;
  category: 'salud' | 'familia' | 'vocacion' | 'comunidad';
  date: string;
  prayersCount: number;
  hasPrayed?: boolean;
}

export interface RehearsalEvent {
  id: string;
  title: string;
  type: 'ensayo' | 'misa' | 'concierto' | 'vigilia';
  dateStr: string;
  timeStr: string;
  location: string;
  status: 'confirmado' | 'proximo';
  agendaNotes: string[];
}

export type PhotoCategory = 'todos' | 'conciertos' | 'estudio' | 'ensayos' | 'misiones' | 'fraternidad';

export interface GalleryPhoto {
  id: string;
  title: string;
  description?: string;
  category: PhotoCategory;
  date?: string;
  imageUrl: string;
  tags?: string[];
  isUserUploaded?: boolean;
  uploadedAt?: number;
}

export interface BandDocument {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'docx' | 'txt' | 'zip';
  sizeFormatted: string;
  sizeBytes: number;
  uploadedAt: string;
  description: string;
  dataUrl?: string;
  textContent?: string;
  associatedSongTitle?: string;
  isUserUploaded?: boolean;
}

