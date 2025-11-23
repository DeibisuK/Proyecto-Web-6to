export interface Anuncio {
  id?: number;
  titulo: string;
  descripcion: string;
  tipo: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  creado_en?: string;
  actualizado_en?: string;
}
