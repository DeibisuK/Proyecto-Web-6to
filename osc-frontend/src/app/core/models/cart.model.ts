/**
 * Modelos del carrito de compras que reflejan la estructura del backend
 */

/**
 * Item individual del carrito
 */
export interface CartItem {
  id_item: number;
  id_carrito: number;
  id_variante: number;
  cantidad: number;
  precio_unitario: number;
  created_at: string;
  updated_at: string;

  // Información de la variante (desde JOIN con vista)
  sku?: string;
  nombre_producto?: string;
  imagen_producto?: string;
  color?: string;
  talla?: string;
  stock_variante?: number;
}

/**
 * Carrito del usuario con items detallados
 */
export interface Cart {
  id_carrito: number;
  uid: string;
  created_at: string;
  updated_at: string;
  items: CartItem[];
  total?: number;
}

/**
 * Resumen del carrito (desde vw_carrito_resumen)
 */
export interface CartSummary {
  id_carrito: number;
  uid: string;
  total_items: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
}

/**
 * Request para agregar item al carrito
 */
export interface AddToCartRequest {
  id_variante: number;
  cantidad: number;
}

/**
 * Request para actualizar cantidad de un item
 */
export interface UpdateCartItemRequest {
  cantidad: number;
}

/**
 * Response al obtener items del carrito (desde vw_carrito_items_detalle)
 */
export interface CartItemDetail {
  id_item: number;
  id_carrito: number;
  id_variante: number;
  sku: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  nombre_producto: string;
  imagen_producto: string;
  color: string | null;
  talla: string | null;
  stock_variante: number;
  created_at: string;
  updated_at: string;
}
