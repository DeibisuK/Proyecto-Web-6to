import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  ProductosResponse,
  ProductoDetalle,
  CreateProductoDto,
  UpdateProductoDto,
  UpdateVarianteDto,
} from '@shared/models/index';
import { FiltrosProducto } from '@shared/models/index';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  http = inject(HttpClient);

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
    const url = `${environment.apiUrl}/p/client/productos/search`;

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
    const url = `${environment.apiUrl}/p/client/productos/${id}`;
    return this.http.get<ProductoDetalle>(url);
  }

  /**
   * Obtiene el detalle completo de un producto usando el endpoint admin.
   * Este endpoint normalmente requiere autorización (token) y devuelve
   * la misma forma de datos que el endpoint cliente.
   * @param id - ID del producto
   */
  getProductoDetalleAdmin(id: number): Observable<ProductoDetalle> {
    const url = `${environment.apiUrl}/p/admin/productos/${id}`;
    return this.http.get<ProductoDetalle>(url);
  }

  /**
   * Crea sólo el producto (endpoint admin).
   * Retorna el objeto devuelto por el backend (ej. { id_producto })
   *
   * @param producto - Datos del producto a crear
   * @returns Observable con la respuesta del backend
   */
  createProducto(producto: CreateProductoDto): Observable<any> {
    const url = `${environment.apiUrl}/p/admin/productos`;
    return this.http.post(url, producto);
  }

  /**
   * Crea una o múltiples variantes para un producto (endpoint admin).
   * body puede ser un objeto variante o un array de variantes.
   */
  createVariantes(productId: number, variantes: any[] | any): Observable<any> {
    const url = `${environment.apiUrl}/p/admin/productos/${productId}/variantes`;
    const body = Array.isArray(variantes) ? variantes : variantes;
    return this.http.post(url, body);
  }

  /**
   * Obtiene las opciones globales y sus valores (admin)
   */
  getOpciones(): Observable<any[]> {
    const url = `${environment.apiUrl}/p/admin/productos/opciones`;
    return this.http.get<any[]>(url);
  }

  /**
   * Actualiza un producto (endpoint admin)
   *
   * @param id - ID del producto a actualizar
   * @param producto - Datos parciales del producto a actualizar
   * @returns Observable con la respuesta del backend
   */
  updateProducto(id: number, producto: UpdateProductoDto): Observable<any> {
    const url = `${environment.apiUrl}/p/admin/productos/${id}`;
    return this.http.put(url, producto);
  }

  /**
   * Elimina un producto (endpoint admin)
   */
  deleteProducto(id: number): Observable<any> {
    const url = `${environment.apiUrl}/p/admin/productos/${id}`;
    return this.http.delete(url);
  }

  /**
   * Actualiza una variante específica (endpoint admin)
   * @param idProducto - ID del producto
   * @param idVariante - ID de la variante a actualizar
   * @param variante - Datos parciales de la variante (sku, precio, stock, url_images)
   * @returns Observable con la variante actualizada
   */
  updateVariante(idProducto: number, idVariante: number, variante: UpdateVarianteDto): Observable<any> {
    const url = `${environment.apiUrl}/p/admin/productos/${idProducto}/variantes/${idVariante}`;
    return this.http.put(url, variante);
  }

  /**
   * Elimina una variante específica (endpoint admin)
   * @param idProducto - ID del producto
   * @param idVariante - ID de la variante a eliminar
   * @returns Observable con la confirmación de eliminación
   */
  deleteVariante(idProducto: number, idVariante: number): Observable<any> {
    const url = `${environment.apiUrl}/p/admin/productos/${idProducto}/variantes/${idVariante}`;
    return this.http.delete(url);
  }
}
