// Busca o crea una categoría y retorna su id
export async function getOrCreateCategoryId(name: string): Promise<string> {
  const url = `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/categories`;
  // Buscar categoría
  const res = await authFetch(url);
  if (res.ok) {
    const allCats = await res.json();
    const found = allCats.find((c: any) => c.name.toLowerCase() === name.toLowerCase());
    if (found) return found.id;
  }
  // Crear categoría
  const res2 = await authFetch(url, {
    method: 'POST',
    body: JSON.stringify({ name })
  });
  if (res2.ok) {
    const created = await res2.json();
    return created.id;
  }
  throw new Error('No se pudo obtener o crear categoría');
}

// Crea un movimiento
export async function createMovement(data: { type: string; category_id: string; amount: number; date: string }) {
  const url = `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/movements`;
  const res = await authFetch(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al crear movimiento');
  return res.json();
}
// Edita un movimiento existente
export async function updateMovement(id: string, data: Partial<{ type: string; category_id: string; amount: number; date: string }>) {
  const res = await authFetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/movements/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al editar movimiento');
  return res.json();
}

// Elimina un movimiento existente
export async function deleteMovement(id: string) {
  const res = await authFetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/movements/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar movimiento');
  return res.json();
}
// Formatea números como pesos argentinos: 15.000,00 (sin $ y sin ceros a la izquierda)
export function formatPesoAR(n: number): string {
  // Elimina ceros a la izquierda convirtiendo a número
  const clean = Number(n);
  // Formatea con separador de miles y decimales argentinos
  return clean.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function authFetch(url: string, options: RequestInit = {}) {
  let token = await AsyncStorage.getItem('token');
  if (!token && typeof window !== 'undefined' && window.localStorage) {
    token = window.localStorage.getItem('token');
  }
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  const response = await fetch(url, { ...options, headers });

  // Logout automático si el backend responde 401
  if (response.status === 401) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('token');
      window.location.href = '/'; // o la ruta de login
    }
    await AsyncStorage.removeItem('token');
  }

  return response;
}
