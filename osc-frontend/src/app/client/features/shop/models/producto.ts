export interface ProductosResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: Productos[];
}

export interface Productos {
  id: number;                    // Cambio: number (el backend devuelve número)
  nombre: string;
  caracteristicas: string;
  id_categoria: number;          // Cambio: number
  nombre_categoria: string;
  id_deporte: number;            // Cambio: number
  deporte: string;
  id_marca: number;              // Cambio: number
  marca: string;
  es_nuevo: boolean;
  precio: number;
  precio_anterior: number;
  stock: number;
  imagen: string;
}

/**
 * Interfaz para valores de opciones de variantes (Color, Talla, etc.)
 */
export interface ValorOpcion {
  id_opcion: number;
  nombre_opcion: string;  // "Color", "Talla"
  id_valor: number;
  valor: string;          // "Rojo", "S", etc.
}

/**
 * Interfaz para una variante específica del producto
 * Cada variante tiene su propio SKU, precio, stock e imágenes
 */
export interface VarianteProducto {
  id_variante: number;
  sku: string;
  precio: number;
  precio_anterior: number | null;
  stock: number;
  imagenes: string[];     // Array de URLs de imágenes
  valores: ValorOpcion[]; // Array de valores (Color: Rojo, Talla: M)
}

/**
 * Interfaz para el detalle completo de un producto con todas sus variantes
 * Esta es la respuesta del endpoint GET /client/productos/:id
 */
export interface ProductoDetalle {
  id_producto: number;
  nombre: string;
  descripcion: string;
  id_categoria: number;
  nombre_categoria: string;
  id_deporte: number;
  nombre_deporte: string;
  id_marca: number;
  nombre_marca: string;
  es_nuevo: boolean;
  variantes: VarianteProducto[];
}

/**
 * Opciones únicas extraídas de las variantes
 * Útil para construir selectores en el UI
 */
export interface OpcionesProducto {
  id_opcion: number;
  nombre_opcion: string;
  valores: Array<{
    id_valor: number;
    valor: string;
  }>;
}




// INTERFAZ DE PRUEBA QUE ESTA OBSOLETA
export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  caracteristicas: string[];
  precio: number;
  precioAnterior?: number;
  imagen: string;
  categoria: string;
  deporte: string;
  marca: string;
  color: string;
  tallas: string[];
  stock: number;
  descuento?: number;
  nuevo?: boolean;
  oferta?: boolean;
}
