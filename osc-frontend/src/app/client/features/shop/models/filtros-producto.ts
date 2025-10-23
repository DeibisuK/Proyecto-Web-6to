export interface FiltrosProducto {
  marcas?: number[];           // IDs de marcas (opcional)
  categorias?: number[];       // IDs de categorías (opcional)
  deportes?: number[];        // IDs de deportes (opcional)
  is_new?: boolean;            // Solo productos nuevos (opcional)
  q?: string;                  // Búsqueda por texto (opcional)
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'name_asc' | 'name_desc'; // Ordenamiento (opcional)
  page?: number;               // Número de página (default: 1)
  per_page?: number;           // Productos por página (default: 24)
}
