import { BandDocument } from '../types';

const DB_NAME = 'vec_ministry_documents_db';
const STORE_NAME = 'band_documents_store';
const DB_VERSION = 1;
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

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadAllDocuments(): Promise<BandDocument[]> {
  try {
    const db = await openDB();
    return new Promise<BandDocument[]>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = req.result as BandDocument[];
        if (results && results.length > 0) {
          resolve(results);
        } else {
          // Initialize with default documents
          saveAllDocuments(INITIAL_DOCUMENTS).then(() => {
            resolve(INITIAL_DOCUMENTS);
          });
        }
      };
      req.onerror = () => {
        resolve(loadFromLocalStorageFallback());
      };
    });
  } catch {
    return loadFromLocalStorageFallback();
  }
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
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(doc);
  } catch {
    // LocalStorage fallback (metadata only to avoid quota issues)
    if (typeof window !== 'undefined') {
      try {
        const current = loadFromLocalStorageFallback();
        const next = [doc, ...current.filter((d) => d.id !== doc.id)];
        const lightweight = next.map((d) => {
          if (d.dataUrl && d.dataUrl.length > 100000) {
            return { ...d, dataUrl: undefined };
          }
          return d;
        });
        localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(lightweight));
      } catch (err) {
        console.warn('LocalStorage save error:', err);
      }
    }
  }
}

export async function saveAllDocuments(docs: BandDocument[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    for (const d of docs) {
      store.put(d);
    }
  } catch {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(docs));
      } catch (err) {
        console.warn('LocalStorage save error:', err);
      }
    }
  }
}

export async function deleteDocument(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
  } catch {
    if (typeof window !== 'undefined') {
      const current = loadFromLocalStorageFallback();
      const filtered = current.filter((d) => d.id !== id);
      localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(filtered));
    }
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
    // Generate a downloadable document text / sample file
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
