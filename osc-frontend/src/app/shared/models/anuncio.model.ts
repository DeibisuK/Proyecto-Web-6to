export interface Anuncio {
  id?: number;
  mensaje: string;
  color_texto: string;
  color_inicio: string;
  color_fin: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'Activo' | 'Inactivo';
  creado_en?: string;
  actualizado_en?: string;
}
