export interface Equipo {
  id_equipo: number;
  logo_url?: string;
  nombre_equipo: string;
  descripcion: string;
  id_deporte?: number;
  id_usuario_creador?: number;
  firebase_uid?: string;
  nombre_creador?: string;
  email_creador?: string;
  nombre_deporte?: string;
}