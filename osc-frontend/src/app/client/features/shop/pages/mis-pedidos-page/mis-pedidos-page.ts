import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../../../../core/services/order.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { Order, OrderStatus } from '../../../../../core/models/order.model';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-mis-pedidos-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-pedidos-page.html',
  styleUrl: './mis-pedidos-page.css'
})
export class MisPedidosPage implements OnInit, OnDestroy {
  private orderService = inject(OrderService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  pedidos = signal<Order[]>([]);
  isLoading = signal<boolean>(false);
  filtroEstado = signal<OrderStatus | 'Todos'>('Todos');
  private refreshSubscription?: Subscription;

  // Estados disponibles para filtrar
  readonly estados: (OrderStatus | 'Todos')[] = [
    'Todos',
    'Pendiente',
    'En Proceso',
    'Enviado',
    'Entregado',
    'Cancelado'
  ];

  ngOnInit(): void {
    this.cargarPedidos();
    this.iniciarActualizacionAutomatica();
  }

  ngOnDestroy(): void {
    this.detenerActualizacionAutomatica();
  }

  /**
   * Carga los pedidos del usuario
   */
  cargarPedidos(): void {
    this.isLoading.set(true);

    this.orderService.obtenerPedidos().subscribe({
      next: (pedidos) => {
        this.pedidos.set(pedidos);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.notificationService.error('Error al cargar pedidos');
      }
    });
  }

  /**
   * Inicia actualización automática cada 5 segundos
   */
  private iniciarActualizacionAutomatica(): void {
    this.refreshSubscription = interval(5000)
      .pipe(
        switchMap(() => this.orderService.obtenerPedidos())
      )
      .subscribe({
        next: (pedidos) => {
          this.pedidos.set(pedidos);
        },
        error: (error) => {
          this.notificationService.error('Error en actualización automática');
        }
      });
  }

  /**
   * Detiene la actualización automática
   */
  private detenerActualizacionAutomatica(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  /**
   * Filtra pedidos según el estado seleccionado
   */
  get pedidosFiltrados(): Order[] {
    const estado = this.filtroEstado();
    if (estado === 'Todos') {
      return this.pedidos();
    }
    return this.pedidos().filter(p => p.estado_pedido === estado);
  }

  /**
   * Cambia el filtro de estado
   */
  cambiarFiltro(estado: OrderStatus | 'Todos'): void {
    this.filtroEstado.set(estado);
  }

  /**
   * Navega al detalle de un pedido
   */
  verDetalle(id_pedido: number): void {
    this.router.navigate(['/mis-pedidos', id_pedido]);
  }

  /**
   * Cancela un pedido (solo si está en estado Pendiente)
   */
  cancelarPedido(pedido: Order, event: Event): void {
    event.stopPropagation();

    if (pedido.estado_pedido !== 'Pendiente') {
      this.notificationService.error('Solo puedes cancelar pedidos pendientes');
      return;
    }

    const confirmacion = confirm(`¿Estás seguro de que deseas cancelar el pedido #${pedido.factura}?`);
    if (!confirmacion) return;

    this.orderService.cancelarPedido(pedido.id_pedido).subscribe({
      next: () => {
        this.notificationService.success('Pedido cancelado exitosamente');
        this.cargarPedidos();
      },
      error: (error) => {
        this.notificationService.error('Error al cancelar el pedido');
      }
    });
  }

  /**
   * Obtiene la clase CSS según el estado
   */
  getEstadoClass(estado: OrderStatus): string {
    const clases: Record<OrderStatus, string> = {
      'Pendiente': 'estado-pendiente',
      'En Proceso': 'estado-en-proceso',
      'Enviado': 'estado-enviado',
      'Entregado': 'estado-entregado',
      'Cancelado': 'estado-cancelado'
    };
    return clases[estado] || '';
  }

  /**
   * Obtiene el ícono según el estado
   */
  getEstadoIcon(estado: OrderStatus): string {
    const iconos: Record<OrderStatus, string> = {
      'Pendiente': 'schedule',
      'En Proceso': 'sync',
      'Enviado': 'local_shipping',
      'Entregado': 'check_circle',
      'Cancelado': 'cancel'
    };
    return iconos[estado] || 'info';
  }

  /**
   * Formatea la fecha
   */
  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formatea el precio
   */
  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  /**
   * Cuenta pedidos por estado
   */
  contarPedidosPorEstado(estado: OrderStatus | 'Todos'): number {
    if (estado === 'Todos') {
      return this.pedidos().length;
    }
    return this.pedidos().filter(p => p.estado_pedido === estado).length;
  }
}
