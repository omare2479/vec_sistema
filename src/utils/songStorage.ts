import { Song } from '../types';
import { INITIAL_CONCERT_SONGS } from '../data/mockData';
import { supabase } from './supabaseClient';

const LOCAL_STORAGE_SONGS_KEY = 'vec_ministerio_songs_v2';

// Mapear de fila Supabase a Song
function mapDbToSong(row: any): Song {
  return {
    id: row.id,
    orderNumber: row.order_number || '01',
    title: row.title,
    subtitle: row.subtitle || '',
    category: row.category || 'adoracion',
    categoryLabel: row.category_label || 'Adoración',
    duration: row.duration || '4:00 min',
    originalKey: row.original_key || 'Sol',
    currentKey: row.current_key || row.original_key || 'Sol',
    tempoBpm: row.tempo_bpm ? Number(row.tempo_bpm) : undefined,
    rhythmNote: row.rhythm_note || '',
    arrangementNote: row.arrangement_note || '',
    badgeType: row.badge_type || undefined,
    introTags: Array.isArray(row.intro_tags) ? row.intro_tags : [],
    isOriginalVEC: row.is_original_vec ?? false,
    audioDurationSeconds: row.audio_duration_seconds ? Number(row.audio_duration_seconds) : undefined,
    lyricsAndChords: row.lyrics_and_chords || undefined,
    composer: row.composer || undefined,
    attachedDocName: row.attached_doc_name || undefined,
    attachedDocUrl: row.attached_doc_url || undefined,
    attachedDocType: row.attached_doc_type || undefined,
    spotifyUrl: row.spotify_url || (row.title?.toLowerCase().includes('todo mi amor') ? 'https://open.spotify.com/search/Voces%20en%20Cristo%20Todo%20mi%20amor' : undefined),
    amazonMusicUrl: row.amazon_music_url || (row.title?.toLowerCase().includes('todo mi amor') ? 'https://music.amazon.com/search/Voces+en+Cristo' : undefined),
  };
}

// Mapear de Song a fila Supabase
function mapSongToDb(s: Song) {
  return {
    id: s.id,
    order_number: s.orderNumber,
    title: s.title,
    subtitle: s.subtitle,
    category: s.category,
    category_label: s.categoryLabel,
    duration: s.duration,
    original_key: s.originalKey,
    current_key: s.currentKey,
    tempo_bpm: s.tempoBpm || null,
    rhythm_note: s.rhythmNote,
    arrangement_note: s.arrangementNote,
    badge_type: s.badgeType || null,
    intro_tags: s.introTags || [],
    is_original_vec: s.isOriginalVEC ?? false,
    audio_duration_seconds: s.audioDurationSeconds || null,
    lyrics_and_chords: s.lyricsAndChords || null,
    composer: s.composer || null,
    attached_doc_name: s.attachedDocName || null,
    attached_doc_url: s.attachedDocUrl || null,
    attached_doc_type: s.attachedDocType || null,
  };
}

/**
 * Asegura que canciones originales oficiales como Todo mi amor estén presentes
 */
function ensureEssentialSongs(songsList: Song[]): Song[] {
  const hasTodoMiAmor = songsList.some((s) => s.title.toLowerCase().includes('todo mi amor'));
  if (!hasTodoMiAmor) {
    const todoMiAmor = INITIAL_CONCERT_SONGS.find((s) => s.id === 'song-todo-mi-amor');
    if (todoMiAmor) {
      return [todoMiAmor, ...songsList];
    }
  }
  return songsList;
}

/**
 * Carga canciones desde localStorage o Supabase si está disponible.
 */
export async function loadAllSongs(): Promise<Song[]> {
  // 1. Intentar cargar desde Supabase si existe la tabla
  try {
    const { data, error } = await supabase
      .from('ministry_songs')
      .select('*')
      .order('order_number', { ascending: true });

    if (!error && data && data.length > 0) {
      const cloudSongs = ensureEssentialSongs(data.map(mapDbToSong));
      try {
        localStorage.setItem(LOCAL_STORAGE_SONGS_KEY, JSON.stringify(cloudSongs));
      } catch (err) {
        console.warn('Error guardando canciones en localStorage:', err);
      }
      return cloudSongs;
    }

    // Si la tabla en Supabase está vacía, subir el repertorio inicial
    if (!error && (!data || data.length === 0)) {
      await saveMultipleSongsToCloud(INITIAL_CONCERT_SONGS);
    }
  } catch (err) {
    console.warn('Consulta a Supabase songs falló, usando local:', err);
  }

  // 2. Fallback a localStorage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SONGS_KEY) || localStorage.getItem('vec_ministerio_songs_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const enriched = ensureEssentialSongs(parsed);
        localStorage.setItem(LOCAL_STORAGE_SONGS_KEY, JSON.stringify(enriched));
        return enriched;
      }
    }
  } catch (err) {
    console.warn('Error leyendo canciones de localStorage:', err);
  }

  // 3. Fallback inicial por defecto
  try {
    localStorage.setItem(LOCAL_STORAGE_SONGS_KEY, JSON.stringify(INITIAL_CONCERT_SONGS));
  } catch {
    // ignore
  }
  return INITIAL_CONCERT_SONGS;
}

export function loadSongsFromStorageSync(): Song[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SONGS_KEY) || localStorage.getItem('vec_ministerio_songs_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return ensureEssentialSongs(parsed);
      }
    }
  } catch {
    // ignore
  }
  return INITIAL_CONCERT_SONGS;
}

export async function saveSongsToStorage(songs: Song[]): Promise<void> {
  // 1. Guardar en localStorage inmediatamente
  try {
    localStorage.setItem(LOCAL_STORAGE_SONGS_KEY, JSON.stringify(songs));
  } catch (err) {
    console.warn('Error guardando canciones en localStorage:', err);
  }

  // 2. Replicar en Supabase
  await saveMultipleSongsToCloud(songs);
}

async function saveMultipleSongsToCloud(songs: Song[]): Promise<void> {
  try {
    const rows = songs.map(mapSongToDb);
    await supabase.from('ministry_songs').upsert(rows, { onConflict: 'id' });
  } catch (err) {
    console.warn('Error al guardar canciones en Supabase:', err);
  }
}

export async function deleteSongFromCloud(songId: string): Promise<void> {
  try {
    await supabase.from('ministry_songs').delete().eq('id', songId);
  } catch (err) {
    console.warn('Error eliminando canción en Supabase:', err);
  }
}
