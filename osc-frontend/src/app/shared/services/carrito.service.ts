import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, of, throwError } from 'rxjs';
import { User } from '@angular/fire/auth';
import { environment } from '../../../environments/environment';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import {
  CartItemDetail,
  AddToCartRequest,
  UpdateCartItemRequest,
  CartSummary
} from '@shared/models/index';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  private readonly API_URL = `${environment.apiUrl}/b/client/cart`;

  // Estado local del carrito
  private items = new BehaviorSubject<CartItemDetail[]>([]);
  private total = new BehaviorSubject<number>(0);
  private cantidadTotal = new BehaviorSubject<number>(0);

  items$ = this.items.asObservable();
  total$ = this.total.asObservable();
  cantidadTotal$ = this.cantidadTotal.asObservable();

  constructor() {
    // Cargar carrito al inicializar si hay usuario autenticado
    this.authService.user$.subscribe((user: User | null) => {
      if (user?.uid) {
        this.cargarCarrito(user.uid);
      } else {
        this.limpiarEstadoLocal();
      }
    });
  }

  /**
   * Obtiene el UID del usuario actual
   */
  private getCurrentUid(): string | null {
    return this.authService.currentUser?.uid || null;
  }

  /**
   * Carga el carrito desde el backend
   */
  cargarCarrito(uid?: string): Observable<CartItemDetail[]> {
    const userUid = uid || this.getCurrentUid();
    if (!userUid) {
      return of([]);
    }

    return this.http.get<any>(`${this.API_URL}/${userUid}`).pipe(
      tap(response => {
        const items = Array.isArray(response) ? response : (response?.items || []);
        this.items.next(items);
        this.actualizarTotales(items);
      }),
      catchError(err => {
        this.notificationService.error('Error al cargar el carrito');
        this.limpiarEstadoLocal();
        return of([]);
      })
    );
  }

  /**
   * Agrega un item al carrito
   * @param id_variante ID de la variante del producto
   * @param cantidad Cantidad a agregar
   */
  agregarItem(id_variante: number, cantidad: number = 1): Observable<CartItemDetail> {
    const uid = this.getCurrentUid();

    if (!uid) {
      this.notificationService.error('Debes iniciar sesión para agregar productos al carrito');
      this.router.navigate(['/inicio'], { queryParams: { openLogin: 'true' } });
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const body: AddToCartRequest = { id_variante, cantidad };

    return this.http.post<CartItemDetail>(`${this.API_URL}/${uid}/items`, body).pipe(
      tap(() => {
        this.notificationService.success('Producto agregado al carrito');
        this.cargarCarrito(uid).subscribe();
      }),
      catchError(err => {
        this.notificationService.error(err.error?.message || 'Error al agregar al carrito');
        throw err;
      })
    );
  }

  /**
   * Actualiza la cantidad de un item del carrito
   */
  actualizarCantidad(id_item: number, cantidad: number): Observable<any> {
    if (cantidad <= 0) {
      return this.eliminarItem(id_item);
    }

    const body: UpdateCartItemRequest = { cantidad };

    return this.http.put(`${this.API_URL}/items/${id_item}`, body).pipe(
      tap(() => {
        const uid = this.getCurrentUid();
        if (uid) {
          this.cargarCarrito(uid).subscribe();
        }
      }),
      catchError((error) => {
        this.notificationService.error(error.error?.message || 'Error al actualizar cantidad');
        throw error;
      })
    );
  }

  /**
   * Elimina un item del carrito
   */
  eliminarItem(id_item: number): Observable<any> {
    const uid = this.getCurrentUid();
    if (!uid) {
      this.notificationService.error('Usuario no autenticado');
      throw new Error('Usuario no autenticado');
    }

    return this.http.delete(`${this.API_URL}/items/${id_item}`).pipe(
      tap(() => {
        this.notificationService.success('Producto eliminado del carrito');
        this.cargarCarrito(uid).subscribe();
      }),
      catchError(err => {
        this.notificationService.error('Error al eliminar producto');
        throw err;
      })
    );
  }

  /**
   * Vacía completamente el carrito
   */
  limpiarCarrito(): Observable<any> {
    const uid = this.getCurrentUid();
    if (!uid) {
      this.notificationService.error('Usuario no autenticado');
      throw new Error('Usuario no autenticado');
    }

    return this.http.delete(`${this.API_URL}/${uid}`).pipe(
      tap(() => {
        this.notificationService.success('Carrito vaciado');
        this.limpiarEstadoLocal();
      }),
      catchError(err => {
        this.notificationService.error('Error al vaciar carrito');
        throw err;
      })
    );
  }

  /**
   * Obtiene el resumen del carrito
   */
  obtenerResumen(): Observable<CartSummary | null> {
    const uid = this.getCurrentUid();
    if (!uid) {
      return of(null);
    }

    return this.http.get<CartSummary>(`${this.API_URL}/${uid}/summary`);
  }

  /**
   * Actualiza los totales del carrito
   */
  private actualizarTotales(items: CartItemDetail[]) {
    if (!Array.isArray(items)) {
      this.total.next(0);
      this.cantidadTotal.next(0);
      return;
    }

    const total = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const cantidad = items.reduce((sum, item) => sum + (item.cantidad || 0), 0);

    this.total.next(total);
    this.cantidadTotal.next(cantidad);
  }

  /**
   * Limpia el estado local del carrito (público para uso externo)
   */
  limpiarEstadoLocal() {
    this.items.next([]);
    this.total.next(0);
    this.cantidadTotal.next(0);
  }

  /**
   * Obtiene la cantidad total de items (para compatibilidad)
   */
  obtenerCantidadTotal(): Observable<number> {
    return this.cantidadTotal$;
  }
}
