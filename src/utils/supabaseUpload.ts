import { supabase, BUCKET_GALLERY, BUCKET_DOCUMENTS } from './supabaseClient';

/**
 * Sube una imagen a Supabase Storage y retorna la URL pública permanente.
 */
export async function uploadImageToSupabase(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filePath = `photos/${Date.now()}_${cleanFileName}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_GALLERY)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Supabase upload error (usando fallback local):', uploadError.message);
      return null;
    }

    const { data } = supabase.storage.from(BUCKET_GALLERY).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.warn('Error al subir a Supabase:', err);
    return null;
  }
}

/**
 * Sube un documento (PDF, DOCX, TXT, MP3) a Supabase Storage y retorna la URL pública.
 */
export async function uploadDocumentToSupabase(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filePath = `docs/${Date.now()}_${cleanFileName}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_DOCUMENTS)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Supabase doc upload error (usando fallback local):', uploadError.message);
      return null;
    }

    const { data } = supabase.storage.from(BUCKET_DOCUMENTS).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.warn('Error al subir documento a Supabase:', err);
    return null;
  }
}
