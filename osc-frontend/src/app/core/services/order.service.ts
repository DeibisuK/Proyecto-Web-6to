import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import {
  Order,
  OrderDetail,
  CreateOrderFromCartRequest,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
} from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly API_URL = `${environment.apiUrl}/b/client/orders`;

  /**
   * Obtiene el UID del usuario actual
   */
  private getCurrentUid(): string | null {
    return this.authService.currentUser?.uid || null;
  }

  /**
   * Crea un pedido desde el carrito actual
   * @param id_metodo_pago ID del método de pago
   */
  crearPedidoDesdeCarrito(id_metodo_pago: number): Observable<{ message: string; pedido: Order }> {
    const uid = this.getCurrentUid();
    if (!uid) {
      throw new Error('Usuario no autenticado');
    }

    const body: CreateOrderFromCartRequest = { id_metodo_pago };
    return this.http.post<{ message: string; pedido: Order }>(`${this.API_URL}/user/${uid}`, body);
  }

  /**
   * Crea un pedido directo sin usar el carrito
   * @param orden Datos del pedido a crear
   */
  crearPedidoDirecto(orden: CreateOrderRequest): Observable<Order> {
    const uid = this.getCurrentUid();
    if (!uid) {
      throw new Error('Usuario no autenticado');
    }

    return this.http.post<Order>(`${this.API_URL}/user/${uid}`, orden);
  }

  /**
   * Obtiene todos los pedidos del usuario actual
   */
  obtenerPedidos(): Observable<Order[]> {
    const uid = this.getCurrentUid();
    if (!uid) {
      throw new Error('Usuario no autenticado');
    }

    return this.http.get<Order[]>(`${this.API_URL}/user/${uid}`);
  }

  /**
   * Obtiene el detalle de un pedido específico
   * @param id_pedido ID del pedido
   */
  obtenerPedido(id_pedido: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${id_pedido}`);
  }

  /**
   * Actualiza el estado de un pedido
   * @param id_pedido ID del pedido
   * @param estado_pedido Nuevo estado del pedido
   */
  actualizarEstado(id_pedido: number, estado_pedido: string): Observable<Order> {
    const body: UpdateOrderStatusRequest = {
      estado_pedido: estado_pedido as any,
    };
    return this.http.put<Order>(`${this.API_URL}/${id_pedido}/status`, body);
  }

  /**
   * Cancela un pedido (solo si está en estado Pendiente)
   * @param id_pedido ID del pedido
   */
  cancelarPedido(id_pedido: number): Observable<Order> {
    return this.actualizarEstado(id_pedido, 'Cancelado');
  }
}
