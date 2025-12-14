export interface Usuario {
  id_usuario: number;
  uid?: string;
  nombre: string;
  apellido: string;
  email: string;
  foto_perfil?: string;
  cashback?: number;
  rol: RolUsuario;
  fecha_registro: string;
  estado: EstadoUsuario;
  source?: 'firebase+db' | 'firebase-only' | 'db-only';
  emailVerified?: boolean;
  providerData?: any[];
}

export type RolUsuario = 'Admin' | 'Cliente' | 'Arbitro';
export type EstadoUsuario = 'activo' | 'inactivo' | 'bloqueado';

export interface RolInfo {
  value: RolUsuario;
  label: string;
  color: string;
  id: number;
}
