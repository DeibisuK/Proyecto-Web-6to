/**
 * Modelos de pedidos que reflejan la estructura del backend
 */

/**
 * Estados posibles de un pedido
 */
export type OrderStatus = 'Pendiente' | 'En Proceso' | 'Enviado' | 'Entregado' | 'Cancelado';

/**
 * Item individual de un pedido
 */
export interface OrderItem {
  id_detalle: number;
  id_pedido: number;
  id_variante: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;

  // Información de la variante (desde JOIN)
  sku?: string;
  nombre_producto?: string;
  imagen_producto?: string;
  color?: string;
  talla?: string;
}

/**
 * Pedido completo
 */
export interface Order {
  id_pedido: number;
  uid: string;
  factura: string; // UUID
  total: number;
  estado_pedido: OrderStatus;
  id_metodo_pago: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];

  // Información adicional del método de pago
  nombre_metodo_pago?: string;
}

/**
 * Request para crear pedido desde el carrito
 */
export interface CreateOrderFromCartRequest {
  id_metodo_pago: number;
}

/**
 * Request para crear pedido directamente (sin carrito)
 */
export interface CreateOrderRequest {
  id_metodo_pago: number;
  items: {
    id_variante: number;
    cantidad: number;
  }[];
}

/**
 * Request para actualizar estado del pedido
 */
export interface UpdateOrderStatusRequest {
  estado_pedido: OrderStatus;
}

/**
 * Response al obtener detalle de pedido (desde vw_pedidos_detalle)
 */
export interface OrderDetail {
  id_pedido: number;
  uid: string;
  factura: string;
  total: number;
  estado_pedido: OrderStatus;
  id_metodo_pago: number;
  nombre_metodo_pago: string;
  pedido_created_at: string;
  pedido_updated_at: string;
  id_detalle: number;
  id_variante: number;
  sku: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  nombre_producto: string;
  imagen_producto: string;
  color: string | null;
  talla: string | null;
}
