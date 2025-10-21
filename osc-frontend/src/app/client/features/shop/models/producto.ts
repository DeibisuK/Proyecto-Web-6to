export interface Productoa {
  id_producto: number;
  nombre: string;
  descripcion?: string;
  id_categoria?: number | null;
  nombre_categoria?: string | null;
  id_deporte?: number | null;
  nombre_deporte?: string | null;
  id_marca?: number | null;
  nombre_marca?: string | null;
  es_nuevo?: boolean;
  precio: number;
  precio_anterior?: number | null;
  stock?: number;
  images?: string[];
}

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
