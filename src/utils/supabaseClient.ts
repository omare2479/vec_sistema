import { createClient } from '@supabase/supabase-js';

// Configuración pública de Supabase para el Ministerio VEC
export const SUPABASE_URL = 'https://kogtdchzhxfcwhwnbzob.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_fJehMk52QErVGe84xXoJuQ_7M2IdByo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Nombres de los buckets de almacenamiento en la nube
export const BUCKET_GALLERY = 'vec_gallery';
export const BUCKET_DOCUMENTS = 'vec_documents';
