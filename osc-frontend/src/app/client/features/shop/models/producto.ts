export interface Productoa {
  id: string;
  nombre: string;
  descripcion: string;
  id_categoria: string;
  id_deporte: string;
  id_marca: number;
  //  descuento?: number;
  es_nuevo?: boolean;
  url_imagen: string;
  // oferta?: boolean;
  precio: number;
  precio_anterior: number;
  stock: number;
  id_primera_variante: number;
  sku_primera_variante: string;
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
