export interface Usuario {
  id_usuario: number;
  uid?: string;
  nombre: string;
  apellido: string;
  email: string;
  foto_perfil?: string;
  rol: RolUsuario;
  fecha_registro: string;
  estado: EstadoUsuario;
  source?: 'firebase+db' | 'firebase-only' | 'db-only';
  emailVerified?: boolean;
  providerData?: any[];
}

export type RolUsuario = 'admin' | 'superadmin' | 'arbitro' | 'cliente';
export type EstadoUsuario = 'activo' | 'inactivo' | 'bloqueado';

export interface RolInfo {
  value: RolUsuario;
  label: string;
  color: string;
}
