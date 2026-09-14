import { BandDocument } from '../types';
import { supabase } from './supabaseClient';

const STORAGE_DOCS_KEY = 'vec_band_documents_list_v1';

export const INITIAL_DOCUMENTS: BandDocument[] = [
  {
    id: 'doc-setlist-1',
    name: 'Setlist_Concierto_Adoracion_VEC.pdf',
    type: 'pdf',
    sizeFormatted: '3.1 MB',
    sizeBytes: 3250585,
    uploadedAt: '12 Sep 2026',
    description: 'Guion maestro de concierto con cifrado armónico y tiempos de transición.',
    associatedSongTitle: 'Setlist Completo VEC',
    isUserUploaded: false,
  },
  {
    id: 'doc-vocales-2',
    name: 'Guia_Armonias_Vocales_VEC.pdf',
    type: 'pdf',
    sizeFormatted: '1.8 MB',
    sizeBytes: 1887436,
    uploadedAt: '10 Sep 2026',
    description: 'Partituras y arreglos vocales a tres voces (Soprano, Alto, Tenor).',
    associatedSongTitle: 'Arreglos Vocales',
    isUserUploaded: false,
  },
  {
    id: 'doc-tracks-3',
    name: 'Tracks_Clicks_Tempo_Bateria.zip',
    type: 'zip',
    sizeFormatted: '14.5 MB',
    sizeBytes: 15204352,
    uploadedAt: '08 Sep 2026',
    description: 'Metrónomos con click in-ear, claqueta y secuencias rítmicas de apoyo.',
    associatedSongTitle: 'Batería y Secuencias',
    isUserUploaded: false,
  },
];

function mapDbToDoc(row: any): BandDocument {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    sizeFormatted: row.size_formatted,
    sizeBytes: Number(row.size_bytes) || 0,
    uploadedAt: row.uploaded_at,
    description: row.description || '',
    dataUrl: row.data_url || undefined,
    textContent: row.text_content || undefined,
    associatedSongTitle: row.associated_song_title || undefined,
    isUserUploaded: row.is_user_uploaded ?? true,
  };
}

function mapDocToDb(d: BandDocument) {
  return {
    id: d.id,
    name: d.name,
    type: d.type,
    size_formatted: d.sizeFormatted,
    size_bytes: d.sizeBytes,
    uploaded_at: d.uploadedAt,
    description: d.description || null,
    data_url: d.dataUrl || null,
    text_content: d.textContent || null,
    associated_song_title: d.associatedSongTitle || null,
    is_user_uploaded: d.isUserUploaded ?? true,
  };
}

export async function loadAllDocuments(): Promise<BandDocument[]> {
  try {
    // 1. Cargar desde la nube de Supabase
    const { data, error } = await supabase
      .from('ministry_documents')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const cloudDocs = data.map(mapDbToDoc);
      localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(cloudDocs));
      return cloudDocs;
    }

    if (!error && (!data || data.length === 0)) {
      await saveAllDocuments(INITIAL_DOCUMENTS);
      return INITIAL_DOCUMENTS;
    }
  } catch (err) {
    console.warn('Fallo al conectar documentos con Supabase:', err);
  }

  // Fallback local
  return loadFromLocalStorageFallback();
}

function loadFromLocalStorageFallback(): BandDocument[] {
  if (typeof window === 'undefined') return INITIAL_DOCUMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_DOCS_KEY);
    if (!raw) return INITIAL_DOCUMENTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DOCUMENTS;
  } catch {
    return INITIAL_DOCUMENTS;
  }
}

export async function saveDocument(doc: BandDocument): Promise<void> {
  // 1. Guardar en Supabase en la nube
  try {
    const dbRow = mapDocToDb(doc);
    await supabase.from('ministry_documents').upsert(dbRow, { onConflict: 'id' });
  } catch (err) {
    console.warn('Error al guardar documento en Supabase:', err);
  }

  // 2. Respaldo local
  if (typeof window !== 'undefined') {
    try {
      const current = loadFromLocalStorageFallback();
      const next = [doc, ...current.filter((d) => d.id !== doc.id)];
      localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(next));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }
  }
}

export async function saveAllDocuments(docs: BandDocument[]): Promise<void> {
  try {
    const rows = docs.map(mapDocToDb);
    await supabase.from('ministry_documents').upsert(rows, { onConflict: 'id' });
  } catch (err) {
    console.warn('Error al guardar todos los documentos en Supabase:', err);
  }
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(docs));
    } catch {
      // ignore
    }
  }
}

export async function deleteDocument(id: string): Promise<void> {
  try {
    await supabase.from('ministry_documents').delete().eq('id', id);
  } catch (err) {
    console.warn('Error al eliminar documento en Supabase:', err);
  }
  if (typeof window !== 'undefined') {
    const current = loadFromLocalStorageFallback();
    const filtered = current.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(filtered));
  }
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function downloadDocument(doc: BandDocument): void {
  if (doc.dataUrl) {
    const a = document.createElement('a');
    a.href = doc.dataUrl;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    const content = doc.textContent || `Ministerio de Música Voces en Cristo (VEC)\n\nDocumento: ${doc.name}\nDescripción: ${doc.description}\nFecha: ${doc.uploadedAt}\n\nEste archivo está registrado en el cancionero oficial de Voces en Cristo.`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name.endsWith('.txt') ? doc.name : `${doc.name.replace(/\.[^/.]+$/, '')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
