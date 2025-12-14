import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '@shared/services/index';
import { OrderService } from '@shared/services/index';
import { MetodoPagoService } from '@shared/services/index';
import { NotificationService } from '@core/services/notification.service';
import { AuthService } from '@core/services/auth.service';
import { MetodoPago } from '@shared/models/index';

interface CartItemDetail {
  id_item: number;
  id_carrito: number;
  id_variante: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  sku: string;
  nombre_producto: string;
  imagen_producto: string;
  color: string | null;
  talla: string | null;
  stock_variante: number;
}

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.css',
})
export class CheckoutPage implements OnInit {
  private carritoService = inject(CarritoService);
  private orderService = inject(OrderService);
  private metodoPagoService = inject(MetodoPagoService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Señales para el estado
  cartItems = signal<CartItemDetail[]>([]);
  total = signal<number>(0);
  metodosPago = signal<MetodoPago[]>([]);
  metodoSeleccionado = signal<number | null>(null);
  isLoading = signal<boolean>(false);
  isProcessing = signal<boolean>(false);

  // Cashback
  cashbackDisponible = signal<number>(0);
  usarCashback = signal<boolean>(false);
  cashbackAplicado = signal<number>(0);

  ngOnInit(): void {
    this.cargarDatosCheckout();
  }

  /**
   * Carga todos los datos necesarios para el checkout
   */
  private cargarDatosCheckout(): void {
    this.isLoading.set(true);

    // Suscribirse al carrito
    this.carritoService.items$.subscribe({
      next: (items) => {
        this.cartItems.set(items);
        if (items.length === 0) {
          // Si el carrito está vacío, redirigir a tienda sin notificación
          this.router.navigate(['/tienda']);
        }
      },
    });

    this.carritoService.total$.subscribe({
      next: (total) => this.total.set(total),
    });

    // Cargar métodos de pago y cashback del usuario
    const uid = this.authService.currentUser?.uid;
    if (uid) {
      // Cargar métodos de pago
      this.metodoPagoService.getMetodosPagoByUser(uid).subscribe({
        next: (metodos) => {
          this.metodosPago.set(metodos);

          // Si solo hay un método, seleccionarlo automáticamente
          if (metodos.length === 1) {
            this.metodoSeleccionado.set(metodos[0].id_metodo_pago);
          }
        },
        error: (error) => {
          this.notificationService.error('Error al cargar métodos de pago');
        },
      });

      // Cargar cashback disponible
      this.metodoPagoService.getCashback(uid).subscribe({
        next: (response) => {
          this.cashbackDisponible.set(response.cashback || 0);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.isLoading.set(false);
        },
      });
    } else {
      this.isLoading.set(false);
      this.notificationService.error('Debes iniciar sesión para continuar');
      this.router.navigate(['/inicio'], { queryParams: { openLogin: 'true' } });
    }
  }

  /**
   * Calcula el subtotal (sin IVA)
   */
  get subtotal(): number {
    return this.total() / 1.15;
  }

  /**
   * Calcula el IVA (15%)
   */
  get iva(): number {
    return this.total() - this.subtotal;
  }

  /**
   * Calcula el cashback que recibirá (5% del total)
   */
  get cashbackARecibir(): number {
    return this.totalFinal * 0.05;
  }

  /**
   * Calcula el total final después de aplicar cashback
   */
  get totalFinal(): number {
    return Math.max(0, this.total() - this.cashbackAplicado());
  }

  /**
   * Toggle para usar cashback
   */
  toggleUsarCashback(): void {
    this.usarCashback.set(!this.usarCashback());
    if (this.usarCashback()) {
      // Aplicar el cashback disponible hasta el máximo del total
      const cashbackAAplicar = Math.min(this.cashbackDisponible(), this.total());
      this.cashbackAplicado.set(cashbackAAplicar);
    } else {
      this.cashbackAplicado.set(0);
    }
  }

  /**
   * Obtiene la descripción de la variante
   */
  getVariantDescription(item: CartItemDetail): string {
    const parts: string[] = [];
    if (item.color) parts.push(item.color);
    if (item.talla) parts.push(`Talla ${item.talla}`);
    return parts.length > 0 ? parts.join(' • ') : '';
  }

  /**
   * Selecciona un método de pago
   */
  seleccionarMetodo(id_metodo_pago: number): void {
    this.metodoSeleccionado.set(id_metodo_pago);
  }

  /**
   * Navega a la página para agregar un nuevo método de pago
   */
  agregarMetodoPago(): void {
    this.router.navigate(['/metodos-de-pago']);
  }

  /**
   * Vuelve a la tienda
   */
  volverATienda(): void {
    this.router.navigate(['/tienda']);
  }

  /**
   * Procesa el pedido
   */
  procesarPedido(): void {
    const metodoId = this.metodoSeleccionado();

    if (!metodoId) {
      this.notificationService.error('Debes seleccionar un método de pago');
      return;
    }

    if (this.cartItems().length === 0) {
      this.router.navigate(['/tienda']);
      return;
    }

    this.isProcessing.set(true);

    this.orderService.crearPedidoDesdeCarrito(metodoId).subscribe({
      next: (response) => {
        this.isProcessing.set(false);
        this.notificationService.success('¡Pedido creado exitosamente!');

        // Limpiar el carrito local
        this.carritoService.limpiarEstadoLocal();

        // Redirigir a la página del pedido
        const idPedido = response.pedido.id_pedido;
        this.router.navigate(['/mis-pedidos', idPedido]);
      },
      error: (error) => {
        this.isProcessing.set(false);
        const mensaje = error.error?.message || 'Error al procesar el pedido';
        this.notificationService.error(mensaje);
      },
    });
  }
}
