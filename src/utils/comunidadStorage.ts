/**
 * comunidadStorage.ts
 * Persistencia en Supabase (nube) + localStorage (fallback) para:
 * Miembros, Eventos de Calendario, Intenciones de Oraci�n y Redes Sociales
 */

import { supabase } from './supabaseClient';

// --- Tipos -----------------------------------------------------------------

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
  type: 'ensayo' | 'presentacion' | 'misa' | 'concierto' | 'vigilia' | 'adoracion';
  date: string;
  time: string;
  endTime?: string;
  location: string;
  description: string;
  imageUrl?: string;
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

// --- Claves localStorage (fallback) ----------------------------------------

const MEMBERS_KEY   = 'vec_community_members_v2';
const EVENTS_KEY    = 'vec_calendar_events_v2';
const PRAYERS_KEY   = 'vec_prayer_intentions_v2';
const SOCIAL_KEY    = 'vec_social_links_editable_v2';

// --- Datos por defecto ------------------------------------------------------

export const DEFAULT_MEMBERS: CommunityMember[] = [
  { id: 'm1', name: 'Director Orlando Guillen', description: 'Direccion General & Produccion Musical', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', order: 0, createdAt: '2026-01-10' },
  { id: 'm2', name: 'Sofia Valenzuela',         description: 'Voz Principal & Animacion',              imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80', order: 1, createdAt: '2026-01-10' },
  { id: 'm3', name: 'Lucas Arismendi',           description: 'Guitarra Acustica & Electrica',          imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80', order: 2, createdAt: '2026-01-10' },
  { id: 'm4', name: 'Camila Morales',            description: 'Bajo Electrico & Coros',                 imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', order: 3, createdAt: '2026-01-10' },
  { id: 'm5', name: 'Ignacio Vega',              description: 'Bateria & Percusion Menor',              imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80', order: 4, createdAt: '2026-01-10' },
  { id: 'm6', name: 'Valentina Rios',            description: 'Coros & Salmista',                       imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80', order: 5, createdAt: '2026-01-10' },
];

export const DEFAULT_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Ensayo General - Banda & Coros',
    type: 'ensayo',
    date: '2026-10-23',
    time: '19:00',
    endTime: '21:30',
    location: 'Salón Parroquial San Juan Bosco',
    description: 'Ajuste de dinámicas, afinación, soundcheck y oración comunitaria.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    status: 'confirmado',
    createdAt: '2026-01-10'
  },
  {
    id: 'evt-2',
    title: 'Noche de Adoración Eucarística & Alabanza',
    type: 'adoracion',
    date: '2026-10-24',
    time: '20:00',
    endTime: '22:30',
    location: 'Templo Parroquial',
    description: 'Exposición del Santísimo Sacramento, cantos de intimidad y oración contemplativa.',
    imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&auto=format&fit=crop&q=80',
    status: 'confirmado',
    createdAt: '2026-01-10'
  },
  {
    id: 'evt-3',
    title: 'Gran Concierto VEC: Voces en Cristo',
    type: 'concierto',
    date: '2026-10-25',
    time: '19:30',
    endTime: '22:00',
    location: 'Auditorio San Juan Bosco',
    description: 'Setlist de 10 cantos enérgicos, luces, coro completo y testimonio musical.',
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
    status: 'confirmado',
    createdAt: '2026-01-10'
  },
  {
    id: 'evt-4',
    title: 'Santa Misa Dominical de Acción de Gracias',
    type: 'misa',
    date: '2026-10-26',
    time: '11:30',
    endTime: '13:00',
    location: 'Templo Parroquial',
    description: 'Repertorio litúrgico del domingo: Entrada, Salmo, Ofertorio y Comunión.',
    imageUrl: 'https://images.unsplash.com/photo-1548625361-12590f0580ea?w=600&auto=format&fit=crop&q=80',
    status: 'proximo',
    createdAt: '2026-01-10'
  },
];

export const DEFAULT_PRAYERS: PrayerIntentionStored[] = [
  { id: 'pi-1', author: 'Familia Ramirez Gomez',  location: 'Parroquia San Juan Bosco',  intention: 'Por la pronta salud de nuestra abuela Carmen.',                                     category: 'salud',     date: 'Hace 3 horas', prayersCount: 28, hasPrayed: false, createdAt: Date.now() - 10800000 },
  { id: 'pi-2', author: 'Pastoral Juvenil VEC',   location: 'Comunidad de Jovenes',      intention: 'Por los frutos del proximo Concierto de Alabanza.',                                 category: 'comunidad', date: 'Ayer',         prayersCount: 45, hasPrayed: true,  createdAt: Date.now() - 86400000 },
  { id: 'pi-3', author: 'Hermana Teresa M.',       location: 'Vocaciones Eucaristicas',   intention: 'Por las vocaciones consagradas y los musicos que sirven al altar.',                category: 'vocacion',  date: 'Hace 2 dias',  prayersCount: 34, hasPrayed: false, createdAt: Date.now() - 172800000 },
  { id: 'pi-4', author: 'Familia Morales Castro',  location: 'Comunidad Parroquial',      intention: 'Damos gracias a Dios y pedimos fortaleza en la fe para nuestros hijos.',           category: 'familia',   date: 'Hace 3 dias',  prayersCount: 21, hasPrayed: false, createdAt: Date.now() - 259200000 },
];

export const DEFAULT_SOCIAL_LINKS: SocialLinkEditable[] = [
  { id: 'facebook',  name: 'Facebook',      url: 'https://www.facebook.com/profile.php?id=100066983563027&locale=es_LA', handle: 'Voces en Cristo',        enabled: true },
  { id: 'instagram', name: 'Instagram',     url: 'https://www.instagram.com/voces_en_cristo/',                           handle: '@voces_en_cristo',        enabled: true },
  { id: 'tiktok',    name: 'TikTok',        url: 'https://www.tiktok.com/@vocesencristo',                                handle: '@vocesencristo',          enabled: true },
  { id: 'youtube',   name: 'YouTube',       url: 'https://www.youtube.com/@vocesenCristo-s4x',                          handle: '@vocesenCristo-s4x',      enabled: true },
  { id: 'spotify',   name: 'Spotify',       url: 'https://open.spotify.com/search/Voces%20en%20Cristo',                 handle: 'Voces en Cristo',         enabled: true },
  { id: 'amazon',    name: 'Amazon Music',  url: 'https://music.amazon.com/search/Voces+en+Cristo',                     handle: 'Voces en Cristo',         enabled: true },
];

// --- Helpers localStorage ---------------------------------------------------

function lsGet<T>(key: string): T | null {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; }
}
function lsSet(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ---------------------------------------------------------------------------
//  MIEMBROS
// ---------------------------------------------------------------------------

function mapDbToMember(row: Record<string,unknown>): CommunityMember {
  return {
    id:          row.id as string,
    name:        row.name as string,
    description: (row.description as string) || '',
    imageUrl:    (row.image_url as string) || '',
    order:       Number(row.sort_order ?? 0),
    createdAt:   (row.created_at as string) || new Date().toISOString(),
  };
}
function mapMemberToDb(m: CommunityMember) {
  return { id: m.id, name: m.name, description: m.description, image_url: m.imageUrl, sort_order: m.order, created_at: m.createdAt };
}

/** Sync fallback */
export function loadMembers(): CommunityMember[] {
  return lsGet<CommunityMember[]>(MEMBERS_KEY) ?? DEFAULT_MEMBERS;
}

/** Async cloud load � call this on mount */
export async function loadMembersFromCloud(): Promise<CommunityMember[]> {
  try {
    const { data, error } = await supabase.from('community_members').select('*').order('sort_order', { ascending: true });
    if (!error && data && data.length > 0) {
      const members = data.map(mapDbToMember);
      lsSet(MEMBERS_KEY, members);
      return members;
    }
    if (!error && data && data.length === 0) {
      await saveMembersToCloud(DEFAULT_MEMBERS);
      lsSet(MEMBERS_KEY, DEFAULT_MEMBERS);
      return DEFAULT_MEMBERS;
    }
  } catch (e) { console.warn('loadMembersFromCloud error:', e); }
  return loadMembers();
}

export function saveMembers(members: CommunityMember[]): void {
  lsSet(MEMBERS_KEY, members);
}

export async function saveMembersToCloud(members: CommunityMember[]): Promise<void> {
  lsSet(MEMBERS_KEY, members);
  try {
    const rows = members.map(mapMemberToDb);
    await supabase.from('community_members').upsert(rows, { onConflict: 'id' });
  } catch (e) { console.warn('saveMembersToCloud error:', e); }
}

export async function deleteMemberFromCloud(id: string): Promise<void> {
  try { await supabase.from('community_members').delete().eq('id', id); } catch (e) { console.warn('deleteMember error:', e); }
}

// ---------------------------------------------------------------------------
//  EVENTOS DE CALENDARIO
// ---------------------------------------------------------------------------

function mapDbToEvent(row: Record<string,unknown>): CalendarEvent {
  return {
    id:          row.id as string,
    title:       row.title as string,
    type:        (row.type as CalendarEvent['type']) || 'ensayo',
    date:        (row.event_date as string) || '',
    time:        (row.event_time as string) || '',
    endTime:     (row.end_time as string) || undefined,
    location:    (row.location as string) || '',
    description: (row.description as string) || '',
    imageUrl:    (row.image_url as string) || (row.imageUrl as string) || undefined,
    status:      (row.status as CalendarEvent['status']) || 'proximo',
    createdAt:   (row.created_at as string) || new Date().toISOString(),
  };
}

function mapEventToDb(e: CalendarEvent, includeImage = true) {
  const row: Record<string, unknown> = {
    id: e.id,
    title: e.title,
    type: e.type,
    event_date: e.date,
    event_time: e.time,
    end_time: e.endTime || null,
    location: e.location,
    description: e.description,
    status: e.status,
    created_at: e.createdAt,
  };
  if (includeImage && e.imageUrl !== undefined) {
    row.image_url = e.imageUrl;
  }
  return row;
}

export function loadCalendarEvents(): CalendarEvent[] {
  return lsGet<CalendarEvent[]>(EVENTS_KEY) ?? DEFAULT_CALENDAR_EVENTS;
}

export async function loadCalendarEventsFromCloud(): Promise<CalendarEvent[]> {
  try {
    const { data, error } = await supabase.from('calendar_events').select('*').order('event_date', { ascending: true });
    if (!error && data && data.length > 0) {
      const events = data.map(mapDbToEvent);
      lsSet(EVENTS_KEY, events);
      return events;
    }
    if (!error && data && data.length === 0) {
      await saveCalendarEventsToCloud(DEFAULT_CALENDAR_EVENTS);
      lsSet(EVENTS_KEY, DEFAULT_CALENDAR_EVENTS);
      return DEFAULT_CALENDAR_EVENTS;
    }
  } catch (e) { console.warn('loadCalendarEventsFromCloud error:', e); }
  return loadCalendarEvents();
}

export function saveCalendarEvents(events: CalendarEvent[]): void {
  lsSet(EVENTS_KEY, events);
}

export async function saveCalendarEventsToCloud(events: CalendarEvent[]): Promise<void> {
  lsSet(EVENTS_KEY, events);
  try {
    const rows = events.map(e => mapEventToDb(e, true));
    const { error } = await supabase.from('calendar_events').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.warn('saveCalendarEventsToCloud error, attempting fallback without image_url:', error.message);
      const fallbackRows = events.map(e => mapEventToDb(e, false));
      await supabase.from('calendar_events').upsert(fallbackRows, { onConflict: 'id' });
    }
  } catch (e) {
    console.warn('saveCalendarEventsToCloud error:', e);
  }
}

export async function deleteCalendarEventFromCloud(id: string): Promise<void> {
  try { await supabase.from('calendar_events').delete().eq('id', id); } catch (e) { console.warn('deleteEvent error:', e); }
}

/**
 * Devuelve el próximo evento de calendario más cercano a la fecha y hora actual.
 */
export function getNearestUpcomingEvent(events: CalendarEvent[]): CalendarEvent | null {
  if (!events || events.length === 0) return null;
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Eventos activos (no cancelados) de hoy o posteriores
  const activeEvents = events.filter(e => e.status !== 'cancelado');
  const futureEvents = activeEvents.filter(e => e.date >= todayStr);

  if (futureEvents.length > 0) {
    return [...futureEvents].sort((a, b) => {
      const cmp = a.date.localeCompare(b.date);
      return cmp !== 0 ? cmp : a.time.localeCompare(b.time);
    })[0];
  }

  // Si no hay futuros, retornar el más reciente
  return [...activeEvents].sort((a, b) => b.date.localeCompare(a.date))[0] || events[0] || null;
}

// ---------------------------------------------------------------------------
//  INTENCIONES DE ORACI�N
// ---------------------------------------------------------------------------

function mapDbToPrayer(row: Record<string,unknown>): PrayerIntentionStored {
  return {
    id:           row.id as string,
    author:       (row.author as string) || 'Anonimo',
    location:     (row.location as string) || '',
    intention:    (row.intention as string) || '',
    category:     (row.category as PrayerIntentionStored['category']) || 'comunidad',
    date:         (row.date_label as string) || 'Reciente',
    prayersCount: Number(row.prayers_count ?? 0),
    hasPrayed:    false,
    createdAt:    Number(row.created_ts ?? Date.now()),
  };
}
function mapPrayerToDb(p: PrayerIntentionStored) {
  return { id: p.id, author: p.author, location: p.location, intention: p.intention, category: p.category, date_label: p.date, prayers_count: p.prayersCount, created_ts: p.createdAt };
}

export function loadPrayerIntentions(): PrayerIntentionStored[] {
  return lsGet<PrayerIntentionStored[]>(PRAYERS_KEY) ?? DEFAULT_PRAYERS;
}

export async function loadPrayerIntentionsFromCloud(): Promise<PrayerIntentionStored[]> {
  try {
    const { data, error } = await supabase.from('prayer_intentions').select('*').order('created_ts', { ascending: false });
    if (!error && data && data.length > 0) {
      const prayers = data.map(mapDbToPrayer);
      lsSet(PRAYERS_KEY, prayers);
      return prayers;
    }
    if (!error && data && data.length === 0) {
      await savePrayerIntentionsToCloud(DEFAULT_PRAYERS);
      lsSet(PRAYERS_KEY, DEFAULT_PRAYERS);
      return DEFAULT_PRAYERS;
    }
  } catch (e) { console.warn('loadPrayerIntentionsFromCloud error:', e); }
  return loadPrayerIntentions();
}

export function savePrayerIntentions(intentions: PrayerIntentionStored[]): void {
  lsSet(PRAYERS_KEY, intentions);
}

export async function savePrayerIntentionsToCloud(intentions: PrayerIntentionStored[]): Promise<void> {
  lsSet(PRAYERS_KEY, intentions);
  try {
    const rows = intentions.map(mapPrayerToDb);
    await supabase.from('prayer_intentions').upsert(rows, { onConflict: 'id' });
  } catch (e) { console.warn('savePrayerIntentionsToCloud error:', e); }
}

// ---------------------------------------------------------------------------
//  REDES SOCIALES
// ---------------------------------------------------------------------------

export function loadSocialLinks(): SocialLinkEditable[] {
  const saved = lsGet<SocialLinkEditable[]>(SOCIAL_KEY);
  if (!saved) return DEFAULT_SOCIAL_LINKS;
  return DEFAULT_SOCIAL_LINKS.map(def => {
    const found = saved.find(p => p.id === def.id);
    return found ? { ...def, ...found } : def;
  });
}

export async function loadSocialLinksFromCloud(): Promise<SocialLinkEditable[]> {
  try {
    const { data, error } = await supabase.from('social_links').select('*');
    if (!error && data && data.length > 0) {
      const links: SocialLinkEditable[] = DEFAULT_SOCIAL_LINKS.map(def => {
        const found = data.find((r: Record<string,unknown>) => r.id === def.id);
        if (!found) return def;
        return { id: def.id, name: def.name, url: found.url as string || def.url, handle: found.handle as string || def.handle, enabled: found.enabled !== false };
      });
      lsSet(SOCIAL_KEY, links);
      return links;
    }
    if (!error && data && data.length === 0) {
      await saveSocialLinksToCloud(DEFAULT_SOCIAL_LINKS);
      lsSet(SOCIAL_KEY, DEFAULT_SOCIAL_LINKS);
      return DEFAULT_SOCIAL_LINKS;
    }
  } catch (e) { console.warn('loadSocialLinksFromCloud error:', e); }
  return loadSocialLinks();
}

export function saveSocialLinks(links: SocialLinkEditable[]): void {
  lsSet(SOCIAL_KEY, links);
}

export async function saveSocialLinksToCloud(links: SocialLinkEditable[]): Promise<void> {
  lsSet(SOCIAL_KEY, links);
  try {
    const rows = links.map(l => ({ id: l.id, name: l.name, url: l.url, handle: l.handle, enabled: l.enabled }));
    await supabase.from('social_links').upsert(rows, { onConflict: 'id' });
  } catch (e) { console.warn('saveSocialLinksToCloud error:', e); }
}
