import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Producto, ProductosResponse, ProductoDetalle } from '../models/producto';
import { FiltrosProducto } from '../models/filtros-producto';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from '../../../../shared/url';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  constructor(private http: HttpClient) {}

  // Datos para probar
  private productosDemo: Producto[] = [
    {
      id: '1',
      nombre: 'Camiseta Deportiva Pro',
      descripcion: 'Camiseta transpirable de alto rendimiento',
      caracteristicas: ['Material transpirable', 'Secado rápido', 'Tejido ligero'],
      precio: 29.99,
      imagen:
        'https://soccerpost.com/cdn/shop/files/ScreenShot2024-09-25at3.39.16PM_clipped_rev_1_dbc321c4-6664-42e0-aaac-cfcb196d6119_grande.png?v=1748665344',
      categoria: 'ropa',
      deporte: 'futbol',
      marca: 'Nike',
      color: 'blanco',
      tallas: ['S', 'M', 'L', 'XL'],
      stock: 15,
      descuento: 0,
      nuevo: true,
    },
    {
      id: '2',
      nombre: 'Balón de Fútbol Pro',
      descripcion: 'Balón oficial de competición',
      caracteristicas: ['Cuero sintético', 'Cosido a máquina', 'Tamaño oficial'],
      precio: 49.99,
      precioAnterior: 59.99,
      imagen:
        'https://soccerpost.com/cdn/shop/files/ScreenShot2024-02-05at12.39.25PM_clipped_rev_1.png?v=1707510302',
      categoria: 'equipamiento',
      deporte: 'futbol',
      marca: 'Adidas',
      color: 'blanco',
      tallas: ['5'],
      stock: 20,
      descuento: 10,
      oferta: true,
    },
    {
      id: '3',
      nombre: 'Raqueta de Tenis Pro',
      descripcion: 'Raqueta profesional de alto rendimiento',
      caracteristicas: ['Fibra de carbono', 'Control preciso', 'Peso ligero'],
      precio: 159.99,
      imagen:
        'https://imagedelivery.net/0tt38OLkrSmHRt7hdItWEA/d339d1ea-04df-457b-3f46-e734ad7b2b00/public',
      categoria: 'equipamiento',
      deporte: 'tenis',
      marca: 'Wilson',
      color: 'negro',
      tallas: ['standard'],
      stock: 8,
      descuento: 0,
      nuevo: true,
    },
    {
      id: '4',
      nombre: 'Shorts de Tenis Premium',
      descripcion: 'Shorts deportivos con bolsillos para pelotas',
      caracteristicas: ['Tejido elástico', 'Bolsillos profundos', 'Anti-humedad'],
      precio: 34.99,
      imagen:
        'https://www.topspin.com.mx/wp-content/uploads/2024/06/Pantalon_corto_Tenis_Club_3_bandas_Negro_HS3253_01_laydown-1.webp',
      categoria: 'ropa',
      deporte: 'tenis',
      marca: 'Nike',
      color: 'azul',
      tallas: ['S', 'M', 'L'],
      stock: 25,
      descuento: 0,
    },
    {
      id: '5',
      nombre: 'Zapatillas de Pádel Elite',
      descripcion: 'Máximo agarre y estabilidad',
      caracteristicas: ['Suela especial', 'Refuerzo lateral', 'Sistema de amortiguación'],
      precio: 89.99,
      precioAnterior: 119.99,
      imagen:
        'https://www.padelnuestro.com/media/catalog/product/1/0/1042A241_101_MJR_1000_1000_1_f8f4.jpg?optimize=high&bg-color=255,255,255&fit=bounds&height=&width=&canvas=',
      categoria: 'calzado',
      deporte: 'padel',
      marca: 'Asics',
      color: 'amarillo',
      tallas: ['40', '41', '42', '43', '44'],
      stock: 12,
      descuento: 25,
      oferta: true,
    },
    {
      id: '6',
      nombre: 'Pala de Pádel Carbono',
      descripcion: 'Pala profesional de alto rendimiento',
      caracteristicas: ['100% Carbono', 'Balance medio', 'Forma diamante'],
      precio: 299.99,
      imagen: 'https://www.bullpadel.com/12143-home_default/pala-bullpadel-vertex-04-24.jpg',
      categoria: 'equipamiento',
      deporte: 'padel',
      marca: 'Bullpadel',
      color: 'rojo',
      tallas: ['standard'],
      stock: 5,
      descuento: 0,
      nuevo: true,
    },
    {
      id: '7',
      nombre: 'Medias de Fútbol Pro',
      descripcion: 'Medias oficiales de competición',
      caracteristicas: ['Compresión graduada', 'Anti-ampollas', 'Tejido técnico'],
      precio: 14.99,
      imagen:
        'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,e_sharpen:95,w_2000,h_2000/global/703441/03/fnd/PER/fmt/png/Medias-de-f%C3%BAtbol-LIGA-para-hombre',
      categoria: 'ropa',
      deporte: 'futbol',
      marca: 'Puma',
      color: 'negro',
      tallas: ['36-39', '40-43', '44-47'],
      stock: 50,
      descuento: 0,
    },
    {
      id: '8',
      nombre: 'Pelota de Tenis Pack',
      descripcion: 'Pack de 3 pelotas oficiales',
      caracteristicas: ['Aprobadas ITF', 'Alta durabilidad', 'Núcleo HD'],
      precio: 9.99,
      imagen: 'https://thesportshop.ec/wp-content/uploads/2025/01/Penn-Pelotas-tennis-x3.png',
      categoria: 'equipamiento',
      deporte: 'tenis',
      marca: 'Penn',
      color: 'amarillo',
      tallas: ['standard'],
      stock: 100,
      descuento: 0,
    },
    {
      id: '9',
      nombre: 'Guantes de Portero',
      descripcion: 'Guantes profesionales con protección',
      caracteristicas: ['Grip avanzado', 'Protección dedos', 'Material impermeable'],
      precio: 45.99,
      precioAnterior: 59.99,
      imagen: 'https://m.media-amazon.com/images/I/71U8QC0kExL._AC_SL1001_.jpg',
      categoria: 'equipamiento',
      deporte: 'futbol',
      marca: 'Reusch',
      color: 'verde',
      tallas: ['8', '9', '10'],
      stock: 15,
      descuento: 20,
      oferta: true,
    },
    {
      id: '10',
      nombre: 'Bolsa de Pádel Premium',
      descripcion: 'Bolsa espaciosa con compartimentos',
      caracteristicas: ['Múltiples bolsillos', 'Material resistente', 'Correa ajustable'],
      precio: 69.99,
      imagen:
        'https://tennisexpress.mx/cdn/shop/products/paletero-head-pro-x-2023_720x.png?v=1680816955',
      categoria: 'accesorios',
      deporte: 'padel',
      marca: 'Head',
      color: 'azul',
      tallas: ['standard'],
      stock: 10,
      descuento: 0,
    },
    {
      id: '11',
      nombre: 'Muñequeras Tenis Pro',
      descripcion: 'Pack de 2 muñequeras absorbentes',
      caracteristicas: ['Alta absorción', 'Ajuste cómodo', 'Secado rápido'],
      precio: 12.99,
      imagen: 'https://somos-tenis.cl/wp-content/uploads/2021/08/B720007-2.jpg',
      categoria: 'accesorios',
      deporte: 'tenis',
      marca: 'Babolat',
      color: 'negro',
      tallas: ['standard'],
      stock: 30,
      descuento: 0,
    },
    {
      id: '12',
      nombre: 'Botines de Fútbol Speed',
      descripcion: 'Botines para máxima velocidad',
      caracteristicas: ['Suela FG', 'Ultra ligeros', 'Ajuste dinámico'],
      precio: 179.99,
      precioAnterior: 199.99,
      imagen:
        'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/108409/01/fnd/PNA/fmt/png/Tacos-de-f%C3%BAtbol-para-hombre-PUMA-ULTRA-5-CARBON-SPEED-para-terreno-firme',
      categoria: 'calzado',
      deporte: 'futbol',
      marca: 'Puma',
      color: 'naranja',
      tallas: ['39', '40', '41', '42', '43', '44'],
      stock: 8,
      descuento: 10,
      oferta: true,
    },
  ];

  getProductos(): Observable<Producto[]> {
    return of(this.productosDemo);
  }

  /**
   * Método para obtener productos desde el backend con filtros múltiples
   * @param filtros - Objeto con los filtros a aplicar (todos opcionales)
   * @returns Observable con la respuesta paginada de productos
   *
   * Ejemplos de uso:
   * - Sin filtros: searchProductos({})
   * - Con marcas: searchProductos({ marcas: [1, 5] })
   * - Con categorías: searchProductos({ categorias: [1, 4] })
   * - Combinado: searchProductos({ marcas: [1], categorias: [1], is_new: true, sort: 'price_asc' })
   */
  searchProductos(filtros: FiltrosProducto = {}): Observable<ProductosResponse> {
    // API Gateway usa /p para el servicio de productos
    const url = `${API_URL}/p/client/productos/search`;

    // Construir el body con valores por defecto
    const body: FiltrosProducto = {
      page: filtros.page || 1,
      per_page: filtros.per_page || 24,
      ...filtros,
    };

    // Limpiar propiedades vacías o undefined
    Object.keys(body).forEach((key) => {
      const value = body[key as keyof FiltrosProducto];
      if (
        value === undefined ||
        value === null ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'string' && value.trim() === '')
      ) {
        delete body[key as keyof FiltrosProducto];
      }
    });

    return this.http.post<ProductosResponse>(url, body);
  }

  /**
   * Método simplificado para obtener todos los productos sin filtros
   * @param page - Número de página (default: 1)
   * @param perPage - Productos por página (default: 12)
   */
  getAllProductos(page: number = 1, perPage: number = 12): Observable<ProductosResponse> {
    return this.searchProductos({ page, per_page: perPage });
  }

  /**
   * Obtiene el detalle completo de un producto con todas sus variantes
   * @param id - ID del producto
   * @returns Observable con el detalle del producto incluyendo variantes, valores y opciones
   *
   * Ejemplo de uso:
   * ```typescript
   * this.productoService.getProductoDetalle(4).subscribe(producto => {
   *   console.log(producto.nombre);
   *   console.log(producto.variantes); // Array de variantes
   * });
   * ```
   */
  getProductoDetalle(id: number): Observable<ProductoDetalle> {
    const url = `${API_URL}/p/client/productos/${id}`;
    return this.http.get<ProductoDetalle>(url);
  }
}
