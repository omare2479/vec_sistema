import { UserAccount } from '../types';
import { supabase } from '../utils/supabaseClient';

// Única cuenta oficial inicial de Administrador Central
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

/**
 * Carga usuarios administradores desde localStorage, eliminando cualquier cuenta que no sea administrador.
 */
export function loadUsersFromStorage(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) return INITIAL_USER_ACCOUNTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Filtrar estrictamente solo cuentas con rol de administrador
      const onlyAdmins = parsed.filter((u: UserAccount) => u.role === 'admin_central' || u.role === 'admin');
      if (onlyAdmins.length > 0) {
        return onlyAdmins;
      }
    }
    return INITIAL_USER_ACCOUNTS;
  } catch {
    return INITIAL_USER_ACCOUNTS;
  }
}

/**
 * Carga los administradores desde Supabase si está disponible.
 */
export async function fetchUsersFromCloud(): Promise<UserAccount[]> {
  try {
    const { data, error } = await supabase
      .from('ministry_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const cloudAdmins = data
        .map(mapDbToUser)
        .filter((u: UserAccount) => u.role === 'admin_central' || u.role === 'admin');

      if (cloudAdmins.length > 0) {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(cloudAdmins));
        return cloudAdmins;
      }
    }
  } catch (err) {
    console.warn('Excepción al conectar con Supabase users:', err);
  }

  return loadUsersFromStorage();
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

export function saveUsersToStorage(users: UserAccount[]): void {
  try {
    // Asegurar que solo se guarden administradores
    const onlyAdmins = users.filter((u) => u.role === 'admin_central' || u.role === 'admin');
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(onlyAdmins.length > 0 ? onlyAdmins : INITIAL_USER_ACCOUNTS));
  } catch (err) {
    console.warn('Error al guardar usuarios en localStorage', err);
  }
}

/**
 * Carga la sesión actual. Si no es administrador, la invalida para que el acceso sea libre como visitante.
 */
export function loadCurrentSession(): UserAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.role === 'admin_central' || parsed.role === 'admin')) {
      return parsed;
    }
    localStorage.removeItem(STORAGE_SESSION_KEY);
    return null;
  } catch {
    return null;
  }
}

export function saveCurrentSession(user: UserAccount | null): void {
  try {
    if (user && (user.role === 'admin_central' || user.role === 'admin')) {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    }
  } catch (err) {
    console.warn('Error al persistir sesión', err);
  }
}
