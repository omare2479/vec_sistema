import { GalleryPhoto } from '../types';
import { DEFAULT_GALLERY_PHOTOS } from '../data/defaultGalleryPhotos';

const DB_NAME = 'vec_ministry_gallery_db';
const DB_VERSION = 1;
const STORE_NAME = 'photos';
const LOCAL_STORAGE_KEY = 'vec_gallery_user_photos_v1';

// IndexedDB Helper
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no soportado en este entorno'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadAllGalleryPhotos(): Promise<GalleryPhoto[]> {
  try {
    const db = await openDB();
    const photos: GalleryPhoto[] = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as GalleryPhoto[]);
      req.onerror = () => reject(req.error);
    });

    if (photos && photos.length > 0) {
      // Sort by uploadedAt desc or id
      return photos.sort((a, b) => (b.uploadedAt || 0) - (a.uploadedAt || 0));
    }
  } catch {
    // Fallback to localStorage
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  // Return default 15 items if no custom ones saved yet
  return DEFAULT_GALLERY_PHOTOS;
}

export async function saveMultipleGalleryPhotos(photos: GalleryPhoto[]): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      photos.forEach((p) => store.put(p));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // LocalStorage fallback
    try {
      const existing = await loadAllGalleryPhotos();
      const map = new Map<string, GalleryPhoto>();
      existing.forEach((p) => map.set(p.id, p));
      photos.forEach((p) => map.set(p.id, p));
      const merged = Array.from(map.values());
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
    } catch {
      // ignore
    }
  }
}

export async function deleteGalleryPhoto(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    try {
      const existing = await loadAllGalleryPhotos();
      const filtered = existing.filter((p) => p.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    } catch {
      // ignore
    }
  }
}

export async function resetGalleryToDefault(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore
  }
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getRandomGalleryPhoto(photos: GalleryPhoto[]): GalleryPhoto | null {
  if (!photos || photos.length === 0) return null;
  const idx = Math.floor(Math.random() * photos.length);
  return photos[idx] || null;
}
