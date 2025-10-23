export interface ProductosResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: Producto[];
}

export interface ProductoCard{
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  categoria: string;
  deporte: string;
  marca: string;
  color: string;
  nuevo?: boolean;
  oferta?: boolean;
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
