export interface FiltrosProducto {
  q?: string; // búsqueda libre
  categoria?: string | string[]; // id o nombre, o lista
  deporte?: string; // id o nombre
  marca?: string | string[]; // id o nombre, o lista
  precioMin?: number;
  precioMax?: number;
  tallas?: string[];
  color?: string[];
  is_new?: boolean;
  ordenamiento?: 'relevancia' | 'precio-asc' | 'precio-desc' | 'nombre';
  pagina?: number;
  porPagina?: number;
}
