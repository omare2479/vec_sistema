/**
 * comunidadStorage.ts
 * Persistencia local para: Miembros, Eventos de Calendario, Intenciones de Oración y Redes Sociales
 */

export interface CommunityMember {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  order: number;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'ensayo' | 'presentacion' | 'misa' | 'concierto' | 'vigilia';
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  endTime?: string;
  location: string;
  description: string;
  status: 'confirmado' | 'proximo' | 'cancelado';
  createdAt: string;
}

export interface PrayerIntentionStored {
  id: string;
  author: string;
  location: string;
  intention: string;
  category: 'salud' | 'familia' | 'vocacion' | 'comunidad';
  date: string;
  prayersCount: number;
  hasPrayed?: boolean;
  createdAt: number;
}

export interface SocialLinkEditable {
  id: string;
  name: string;
  url: string;
  handle: string;
  enabled: boolean;
}

const MEMBERS_KEY = 'vec_community_members_v2';
const EVENTS_KEY = 'vec_calendar_events_v2';
const PRAYERS_KEY = 'vec_prayer_intentions_v2';
const SOCIAL_KEY = 'vec_social_links_editable_v2';

export const DEFAULT_MEMBERS: CommunityMember[] = [
  {
    id: 'm1',
    name: 'Director Orlando Guillén',
    description: 'Dirección General & Producción Musical',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    order: 0,
    createdAt: '2026-01-10',
  },
  {
    id: 'm2',
    name: 'Sofía Valenzuela',
    description: 'Voz Principal & Animación',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    order: 1,
    createdAt: '2026-01-10',
  },
  {
    id: 'm3',
    name: 'Lucas Arismendi',
    description: 'Guitarra Acústica & Eléctrica',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    order: 2,
    createdAt: '2026-01-10',
  },
  {
    id: 'm4',
    name: 'Camila Morales',
    description: 'Bajo Eléctrico & Coros',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    order: 3,
    createdAt: '2026-01-10',
  },
  {
    id: 'm5',
    name: 'Ignacio Vega',
    description: 'Batería & Percusión Menor',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    order: 4,
    createdAt: '2026-01-10',
  },
  {
    id: 'm6',
    name: 'Valentina Ríos',
    description: 'Coros & Salmista',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    order: 5,
    createdAt: '2026-01-10',
  },
];

export const DEFAULT_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Ensayo General - Concierto VEC',
    type: 'ensayo',
    date: '2026-10-23',
    time: '19:00',
    endTime: '21:30',
    location: 'Salón Parroquial San Juan Bosco',
    description: 'Ajuste de dinámicas en "Ven Espíritu de Dios", soundcheck de batería y oración previa.',
    status: 'confirmado',
    createdAt: '2026-01-10',
  },
  {
    id: 'evt-2',
    title: 'Prueba de Sonido (Soundcheck)',
    type: 'presentacion',
    date: '2026-10-25',
    time: '16:00',
    endTime: '18:00',
    location: 'Auditorio Principal',
    description: 'Revisión de microfonía de coros, niveles de guitarra acústica y bajo.',
    status: 'confirmado',
    createdAt: '2026-01-10',
  },
  {
    id: 'evt-3',
    title: 'Concierto de Alabanza & Adoración VEC',
    type: 'concierto',
    date: '2026-10-25',
    time: '19:30',
    endTime: '22:00',
    location: 'Auditorio San Juan Bosco',
    description: 'Setlist de 10 cantos, momento central con el Santísimo y testimonio de jóvenes.',
    status: 'confirmado',
    createdAt: '2026-01-10',
  },
  {
    id: 'evt-4',
    title: 'Misa Dominical de Acción de Gracias',
    type: 'misa',
    date: '2026-10-26',
    time: '11:30',
    endTime: '13:00',
    location: 'Templo Parroquial',
    description: 'Repertorio litúrgico del domingo, salmo cantado por Valentina.',
    status: 'proximo',
    createdAt: '2026-01-10',
  },
];

export const DEFAULT_PRAYERS: PrayerIntentionStored[] = [
  {
    id: 'pi-1',
    author: 'Familia Ramírez Gómez',
    location: 'Parroquia San Juan Bosco',
    intention: 'Por la pronta salud de nuestra abuela Carmen y para que el Señor llene de paz nuestro hogar en este tiempo de prueba.',
    category: 'salud',
    date: 'Hace 3 horas',
    prayersCount: 28,
    hasPrayed: false,
    createdAt: Date.now() - 10800000,
  },
  {
    id: 'pi-2',
    author: 'Pastoral Juvenil VEC',
    location: 'Comunidad de Jóvenes',
    intention: 'Por los frutos espirituales del próximo Concierto de Alabanza, para que muchos jóvenes se reencuentren con Cristo.',
    category: 'comunidad',
    date: 'Ayer',
    prayersCount: 45,
    hasPrayed: true,
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'pi-3',
    author: 'Hermana Teresa M.',
    location: 'Vocaciones Eucarísticas',
    intention: 'Por las vocaciones consagradas y sacerdotales de nuestra diócesis, y por los músicos católicos que sirven al altar.',
    category: 'vocacion',
    date: 'Hace 2 días',
    prayersCount: 34,
    hasPrayed: false,
    createdAt: Date.now() - 172800000,
  },
  {
    id: 'pi-4',
    author: 'Familia Morales Castro',
    location: 'Comunidad Parroquial',
    intention: 'Damos gracias a Dios por la unión familiar y pedimos fortaleza en la fe para nuestros hijos en sus estudios.',
    category: 'familia',
    date: 'Hace 3 días',
    prayersCount: 21,
    hasPrayed: false,
    createdAt: Date.now() - 259200000,
  },
];

export const DEFAULT_SOCIAL_LINKS: SocialLinkEditable[] = [
  { id: 'facebook', name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=100066983563027&locale=es_LA', handle: 'Voces en Cristo', enabled: true },
  { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/voces_en_cristo/', handle: '@voces_en_cristo', enabled: true },
  { id: 'tiktok', name: 'TikTok', url: 'https://www.tiktok.com/@vocesencristo', handle: '@vocesencristo', enabled: true },
  { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/@vocesenCristo-s4x', handle: '@vocesenCristo-s4x', enabled: true },
  { id: 'spotify', name: 'Spotify', url: 'https://open.spotify.com/search/Voces%20en%20Cristo', handle: 'Voces en Cristo', enabled: true },
  { id: 'amazon', name: 'Amazon Music', url: 'https://music.amazon.com/search/Voces+en+Cristo', handle: 'Voces en Cristo', enabled: true },
];

export function loadMembers(): CommunityMember[] {
  try {
    const raw = localStorage.getItem(MEMBERS_KEY);
    if (!raw) return DEFAULT_MEMBERS;
    const parsed = JSON.parse(raw) as CommunityMember[];
    return parsed.length > 0 ? parsed : DEFAULT_MEMBERS;
  } catch {
    return DEFAULT_MEMBERS;
  }
}
export function saveMembers(members: CommunityMember[]): void {
  try { localStorage.setItem(MEMBERS_KEY, JSON.stringify(members)); } catch {}
}

export function loadCalendarEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) return DEFAULT_CALENDAR_EVENTS;
    const parsed = JSON.parse(raw) as CalendarEvent[];
    return parsed.length > 0 ? parsed : DEFAULT_CALENDAR_EVENTS;
  } catch {
    return DEFAULT_CALENDAR_EVENTS;
  }
}
export function saveCalendarEvents(events: CalendarEvent[]): void {
  try { localStorage.setItem(EVENTS_KEY, JSON.stringify(events)); } catch {}
}

export function loadPrayerIntentions(): PrayerIntentionStored[] {
  try {
    const raw = localStorage.getItem(PRAYERS_KEY);
    if (!raw) return DEFAULT_PRAYERS;
    const parsed = JSON.parse(raw) as PrayerIntentionStored[];
    return parsed.length > 0 ? parsed : DEFAULT_PRAYERS;
  } catch {
    return DEFAULT_PRAYERS;
  }
}
export function savePrayerIntentions(intentions: PrayerIntentionStored[]): void {
  try { localStorage.setItem(PRAYERS_KEY, JSON.stringify(intentions)); } catch {}
}

export function loadSocialLinks(): SocialLinkEditable[] {
  try {
    const raw = localStorage.getItem(SOCIAL_KEY);
    if (!raw) return DEFAULT_SOCIAL_LINKS;
    const parsed = JSON.parse(raw) as SocialLinkEditable[];
    return DEFAULT_SOCIAL_LINKS.map(def => {
      const found = parsed.find(p => p.id === def.id);
      return found ? { ...def, ...found } : def;
    });
  } catch {
    return DEFAULT_SOCIAL_LINKS;
  }
}
export function saveSocialLinks(links: SocialLinkEditable[]): void {
  try { localStorage.setItem(SOCIAL_KEY, JSON.stringify(links)); } catch {}
}
