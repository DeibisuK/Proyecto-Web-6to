export interface FiltrosProducto {
  marcas?: number[];           // IDs de marcas (opcional)
  categorias?: number[];       // IDs de categorías (opcional)
  deportes?: number[];        // IDs de deportes (opcional)
  colores?: number[];          // IDs de valores de color (opcional)
  tallas?: number[];           // IDs de valores de talla (opcional)
  is_new?: boolean;            // Solo productos nuevos (opcional)
  q?: string;                  // Búsqueda por texto (opcional)
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'name_asc' | 'name_desc'; // Ordenamiento (opcional)
  precioMin?: number;          // Precio mínimo (opcional)
  precioMax?: number;          // Precio máximo (opcional)
  page?: number;               // Número de página (default: 1)
  per_page?: number;           // Productos por página (default: 24)
}
