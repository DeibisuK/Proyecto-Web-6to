export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  foto_perfil?: string;
  rol: RolUsuario;
  fecha_registro: string;
  estado: EstadoUsuario;
}

export type RolUsuario = 'admin' | 'superadmin' | 'arbitro' | 'cliente';
export type EstadoUsuario = 'activo' | 'inactivo' | 'bloqueado';

export interface RolInfo {
  value: RolUsuario;
  label: string;
  color: string;
}
