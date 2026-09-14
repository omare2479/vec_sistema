import { UserAccount } from '../types';
import { supabase } from '../utils/supabaseClient';

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr-central-1',
    username: 'admincentral',
    name: 'Director Orlando Guillén',
    email: 'oguillen@oefa.gob.pe',
    role: 'admin_central',
    instrument: 'Dirección General & Producción Musical',
    password: 'vec2026',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-10',
    status: 'activo',
    phone: '+51 987 654 321',
    notes: 'Administrador Central con permisos absolutos en el Ministerio VEC'
  },
  {
    id: 'usr-admin-1',
    username: 'coordinador',
    name: 'Carlos Méndez',
    email: 'coordinador@vec.catolico',
    role: 'admin',
    instrument: 'Coordinador Musical & Guitarra Líder',
    password: 'musica123',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-01',
    status: 'activo',
    phone: '+51 991 223 344',
    notes: 'Administrador de repertorios, partituras y tonalidades'
  },
  {
    id: 'usr-usuario-1',
    username: 'participante',
    name: 'Mariana Flores',
    email: 'mariana.voz@vec.catolico',
    role: 'usuario',
    instrument: 'Voz Principal & Salmista',
    password: 'canto123',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-15',
    status: 'activo',
    phone: '+51 977 445 566',
    notes: 'Participante ministerial activa en coro y adoración'
  },
  {
    id: 'usr-usuario-2',
    username: 'david.bajo',
    name: 'David Silva',
    email: 'david.bajo@vec.catolico',
    role: 'usuario',
    instrument: 'Bajo Eléctrico de 5 Cuerdas',
    password: 'bajo123',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-03-01',
    status: 'activo',
    phone: '+51 955 889 900',
    notes: 'Bajista oficial de conciertos de adoración'
  },
  {
    id: 'usr-usuario-3',
    username: 'lucia.teclado',
    name: 'Lucía Morales',
    email: 'lucia.piano@vec.catolico',
    role: 'usuario',
    instrument: 'Piano & Sintetizador Litúrgico',
    password: 'piano123',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-03-05',
    status: 'activo',
    phone: '+51 966 112 233',
    notes: 'Armonías y colchones de adoración'
  }
];

const STORAGE_USERS_KEY = 'vec_ministerio_users_v1';
const STORAGE_SESSION_KEY = 'vec_ministerio_session_v1';

// Mapear de base de datos Supabase a UserAccount
function mapDbToUser(row: any): UserAccount {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    email: row.email || undefined,
    role: row.role,
    instrument: row.instrument,
    password: row.password,
    avatarUrl: row.avatar_url || undefined,
    createdAt: row.created_at,
    status: row.status || 'activo',
    phone: row.phone || undefined,
    notes: row.notes || undefined,
  };
}

// Mapear de UserAccount a Supabase
function mapUserToDb(u: UserAccount) {
  return {
    id: u.id,
    username: u.username,
    name: u.name,
    email: u.email || null,
    role: u.role,
    instrument: u.instrument,
    password: u.password,
    avatar_url: u.avatarUrl || null,
    created_at: u.createdAt,
    status: u.status || 'activo',
    phone: u.phone || null,
    notes: u.notes || null,
  };
}

export function loadUsersFromStorage(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) return INITIAL_USER_ACCOUNTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_USER_ACCOUNTS;
  } catch {
    return INITIAL_USER_ACCOUNTS;
  }
}

/**
 * Carga los usuarios desde la nube de Supabase. Si la tabla está vacía, la inicializa con las cuentas por defecto.
 */
export async function fetchUsersFromCloud(): Promise<UserAccount[]> {
  try {
    const { data, error } = await supabase
      .from('ministry_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error al consultar usuarios en Supabase:', error.message);
      return loadUsersFromStorage();
    }

    if (data && data.length > 0) {
      const cloudUsers = data.map(mapDbToUser);
      // Actualizar copia local
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(cloudUsers));
      return cloudUsers;
    } else {
      // Si la base de datos está vacía, subir los iniciales a Supabase
      await syncAllUsersToCloud(INITIAL_USER_ACCOUNTS);
      return INITIAL_USER_ACCOUNTS;
    }
  } catch (err) {
    console.warn('Excepción al conectar con Supabase users:', err);
    return loadUsersFromStorage();
  }
}

export async function saveUserToCloud(user: UserAccount): Promise<void> {
  try {
    const dbRow = mapUserToDb(user);
    await supabase.from('ministry_users').upsert(dbRow, { onConflict: 'id' });
  } catch (err) {
    console.warn('Error al guardar usuario en Supabase:', err);
  }
}

export async function deleteUserFromCloud(userId: string): Promise<void> {
  try {
    await supabase.from('ministry_users').delete().eq('id', userId);
  } catch (err) {
    console.warn('Error al eliminar usuario en Supabase:', err);
  }
}

export async function syncAllUsersToCloud(usersList: UserAccount[]): Promise<void> {
  try {
    const rows = usersList.map(mapUserToDb);
    await supabase.from('ministry_users').upsert(rows, { onConflict: 'id' });
  } catch (err) {
    console.warn('Error en syncAllUsersToCloud:', err);
  }
}

export function saveUsersToStorage(users: UserAccount[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.warn('Error al guardar usuarios en localStorage', err);
  }
}

export function loadCurrentSession(): UserAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCurrentSession(user: UserAccount | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    }
  } catch (err) {
    console.warn('Error al persistir sesión', err);
  }
}
