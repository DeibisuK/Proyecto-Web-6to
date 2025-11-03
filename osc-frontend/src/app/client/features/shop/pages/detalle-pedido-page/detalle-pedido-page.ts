import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../../../core/services/order.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { OrderDetail, OrderStatus } from '../../../../../core/models/order.model';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-detalle-pedido-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-pedido-page.html',
  styleUrl: './detalle-pedido-page.css',
})
export class DetallePedidoPage implements OnInit, OnDestroy {
  private orderService = inject(OrderService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Almacena el pedido completo (info + detalles)
  pedido = signal<any>(null);
  isLoading = signal<boolean>(false);
  private refreshSubscription?: Subscription;

  // Estados del pedido para el timeline
  readonly estadosTimeline: OrderStatus[] = ['Pendiente', 'En Proceso', 'Enviado', 'Entregado'];

  ngOnInit(): void {
    const id = this.route.snapshot.params['id_pedido'];
    if (id) {
      this.cargarDetallePedido(parseInt(id));
      this.iniciarActualizacionAutomatica(parseInt(id));
      this.iniciarProgresionAutomatica(parseInt(id));
    }
  }

  ngOnDestroy(): void {
    this.detenerActualizacionAutomatica();
    this.detenerProgresionAutomatica();
  }

  private intervalProgresion?: any;

  /**
   * Inicia la progresión automática de estados cada 5 segundos
   */
  private iniciarProgresionAutomatica(id_pedido: number): void {
    this.intervalProgresion = setInterval(() => {
      const pedidoData = this.pedido();
      if (
        !pedidoData ||
        pedidoData.estado_pedido === 'Entregado' ||
        pedidoData.estado_pedido === 'Cancelado'
      ) {
        this.detenerProgresionAutomatica();
        return;
      }

      const siguienteEstado = this.getSiguienteEstado(pedidoData.estado_pedido);
      if (siguienteEstado) {
        this.orderService.actualizarEstado(id_pedido, siguienteEstado).subscribe({
          next: () => {
            // La actualización automática recogerá el cambio
          },
          error: (error) => {
            console.error('Error actualizando estado:', error);
          },
        });
      }
    }, 5000);
  }

  /**
   * Detiene la progresión automática
   */
  private detenerProgresionAutomatica(): void {
    if (this.intervalProgresion) {
      clearInterval(this.intervalProgresion);
    }
  }

  /**
   * Obtiene el siguiente estado en la secuencia
   */
  private getSiguienteEstado(estadoActual: OrderStatus): OrderStatus | null {
    const index = this.estadosTimeline.indexOf(estadoActual);
    if (index === -1 || index === this.estadosTimeline.length - 1) {
      return null;
    }
    return this.estadosTimeline[index + 1];
  }

  /**
   * Carga el detalle del pedido
   */
  cargarDetallePedido(id_pedido: number): void {
    this.isLoading.set(true);

    this.orderService.obtenerPedido(id_pedido).subscribe({
      next: (response) => {
        console.log('Detalle del pedido recibido:', response);
        console.log('Cantidad de items:', response?.detalles?.length);
        this.pedido.set(response);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error completo:', error);
        this.notificationService.error('Error al cargar el pedido');
        this.router.navigate(['/mis-pedidos']);
      },
    });
  }

  /**
   * Inicia actualización automática cada 5 segundos
   */
  private iniciarActualizacionAutomatica(id_pedido: number): void {
    this.refreshSubscription = interval(5000)
      .pipe(switchMap(() => this.orderService.obtenerPedido(id_pedido)))
      .subscribe({
        next: (response) => {
          this.pedido.set(response);
        },
        error: (error) => {
          console.error('Error en actualización automática:', error);
        },
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
   * Obtiene la información general del pedido
   */
  get pedidoInfo(): any {
    return this.pedido();
  }

  /**
   * Obtiene los detalles (items) del pedido
   */
  get pedidoDetalles(): any[] {
    const p = this.pedido();
    return p?.detalles || [];
  }

  /**
   * Calcula el subtotal
   */
  get subtotal(): number {
    const info = this.pedidoInfo;
    return info ? info.total / 1.15 : 0;
  }

  /**
   * Calcula el IVA
   */
  get iva(): number {
    const info = this.pedidoInfo;
    return info ? info.total - this.subtotal : 0;
  }

  /**
   * Obtiene el índice del estado actual en el timeline
   */
  getEstadoIndex(estado: OrderStatus): number {
    return this.estadosTimeline.indexOf(estado);
  }

  /**
   * Verifica si un estado ya fue completado
   */
  isEstadoCompletado(estado: OrderStatus): boolean {
    const info = this.pedidoInfo;
    if (!info) return false;

    const estadoActual = info.estado_pedido;

    // Si está cancelado, ningún estado está completado
    if (estadoActual === 'Cancelado') return false;

    const indexActual = this.getEstadoIndex(estadoActual);
    const indexEstado = this.getEstadoIndex(estado);

    return indexEstado <= indexActual;
  }

  /**
   * Verifica si un estado es el actual
   */
  isEstadoActual(estado: OrderStatus): boolean {
    const info = this.pedidoInfo;
    return info ? info.estado_pedido === estado : false;
  }

  /**
   * Obtiene la clase CSS según el estado
   */
  getEstadoClass(estado: OrderStatus): string {
    const clases: Record<OrderStatus, string> = {
      Pendiente: 'estado-pendiente',
      'En Proceso': 'estado-en-proceso',
      Enviado: 'estado-enviado',
      Entregado: 'estado-entregado',
      Cancelado: 'estado-cancelado',
    };
    return clases[estado] || '';
  }

  /**
   * Obtiene el ícono según el estado
   */
  getEstadoIcon(estado: OrderStatus): string {
    const iconos: Record<OrderStatus, string> = {
      Pendiente: 'schedule',
      'En Proceso': 'sync',
      Enviado: 'local_shipping',
      Entregado: 'check_circle',
      Cancelado: 'cancel',
    };
    return iconos[estado] || 'info';
  }

  /**
   * Obtiene la descripción de la variante
   */
  getVariantDescription(item: any): string {
    const parts: string[] = [];
    if (item.color) parts.push(item.color);
    if (item.talla) parts.push(`Talla ${item.talla}`);
    return parts.length > 0 ? parts.join(' • ') : '';
  }

  /**
   * Cancela el pedido
   */
  cancelarPedido(): void {
    const info = this.pedidoInfo;
    if (!info) return;

    if (info.estado_pedido !== 'Pendiente') {
      this.notificationService.error('Solo puedes cancelar pedidos pendientes');
      return;
    }

    const factura = info.uuid_factura || info.factura || info.id_pedido;
    const confirmacion = confirm(`¿Estás seguro de que deseas cancelar el pedido #${factura}?`);
    if (!confirmacion) return;

    this.orderService.cancelarPedido(info.id_pedido).subscribe({
      next: () => {
        this.notificationService.success('Pedido cancelado exitosamente');
        this.cargarDetallePedido(info.id_pedido);
      },
      error: (error) => {
        this.notificationService.error('Error al cancelar el pedido');
        console.error('Error cancelando pedido:', error);
      },
    });
  }

  /**
   * Volver a la lista de pedidos
   */
  volverALista(): void {
    this.router.navigate(['/mis-pedidos']);
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
      minute: '2-digit',
    });
  }

  /**
   * Formatea el precio
   */
  formatPrice(price: number): string {
    return price.toFixed(2);
  }
}
