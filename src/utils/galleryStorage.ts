import { GalleryPhoto, PhotoCategory } from '../types';
import { DEFAULT_GALLERY_PHOTOS } from '../data/defaultGalleryPhotos';
import { supabase } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'vec_gallery_user_photos_v1';

// Mapear de base de datos a GalleryPhoto
function mapDbToPhoto(row: any): GalleryPhoto {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    category: row.category as PhotoCategory,
    date: row.date || undefined,
    imageUrl: row.image_url,
    tags: row.tags || [],
    isUserUploaded: row.is_user_uploaded ?? true,
    uploadedAt: row.uploaded_at ? Number(row.uploaded_at) : undefined,
  };
}

// Mapear de GalleryPhoto a fila de Supabase
function mapPhotoToDb(p: GalleryPhoto) {
  return {
    id: p.id,
    title: p.title,
    description: p.description || null,
    category: p.category,
    date: p.date || null,
    image_url: p.imageUrl,
    tags: p.tags || [],
    is_user_uploaded: p.isUserUploaded ?? true,
    uploaded_at: p.uploadedAt || Date.now(),
  };
}

export async function loadAllGalleryPhotos(): Promise<GalleryPhoto[]> {
  try {
    // 1. Consultar a la nube de Supabase
    const { data, error } = await supabase
      .from('gallery_photos')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const cloudPhotos = data.map(mapDbToPhoto);
      // Guardar respaldo local
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudPhotos));
      return cloudPhotos;
    }

    // 2. Si la tabla en la nube está vacía, inicializar con las fotos por defecto del ministerio
    if (!error && (!data || data.length === 0)) {
      await saveMultipleGalleryPhotos(DEFAULT_GALLERY_PHOTOS);
      return DEFAULT_GALLERY_PHOTOS;
    }
  } catch (err) {
    console.warn('Fallo al conectar con fotos en la nube Supabase:', err);
  }

  // Fallback a localStorage
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

  return DEFAULT_GALLERY_PHOTOS;
}

export async function saveMultipleGalleryPhotos(photos: GalleryPhoto[]): Promise<void> {
  // 1. Guardar en Supabase en la nube
  try {
    const rows = photos.map(mapPhotoToDb);
    const { error } = await supabase.from('gallery_photos').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.error('Error al guardar fotos en Supabase:', error.message, error.details);
    }
  } catch (err) {
    console.error('Error de red al guardar fotos en Supabase:', err);
  }

  // 2. Respaldo en localStorage
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(photos));
  } catch {
    // ignore
  }
}

export async function deleteGalleryPhoto(id: string): Promise<void> {
  // 1. Eliminar de la nube de Supabase
  try {
    await supabase.from('gallery_photos').delete().eq('id', id);
  } catch (err) {
    console.warn('Error al borrar foto en Supabase:', err);
  }

  // 2. Actualizar local
  try {
    const existing = await loadAllGalleryPhotos();
    const filtered = existing.filter((p) => p.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

export async function resetGalleryToDefault(): Promise<void> {
  try {
    await supabase.from('gallery_photos').delete().neq('id', 'keep-all-reset');
    await saveMultipleGalleryPhotos(DEFAULT_GALLERY_PHOTOS);
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
