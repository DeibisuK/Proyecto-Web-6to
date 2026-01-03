import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReservaService, Reserva } from '@shared/services/reserva.service';
import { NotificationService } from '@core/services/notification.service';
import { ReportsService } from '@shared/services/reports.service';

type EstadoPago = 'pendiente' | 'pagado' | 'cancelado' | 'reembolsado' | 'Todos';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-reservas.html',
  styleUrl: './mis-reservas.css'
})
export class MisReservasComponent implements OnInit {
  private reservaService = inject(ReservaService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private reportsService = inject(ReportsService);

  reservas = signal<Reserva[]>([]);
  isLoading = signal<boolean>(false);
  filtroEstado = signal<EstadoPago>('Todos');

  // Estados disponibles para filtrar
  readonly estados: EstadoPago[] = [
    'Todos',
    'pendiente',
    'pagado',
    'cancelado',
    'reembolsado'
  ];

  ngOnInit(): void {
    this.cargarReservas();
  }

  /**
   * Carga las reservas del usuario
   */
  cargarReservas(): void {
    this.isLoading.set(true);

    this.reservaService.getMisReservas().subscribe({
      next: (reservas) => {
        this.reservas.set(reservas);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar reservas:', error);
        this.isLoading.set(false);
        this.notificationService.error('Error al cargar reservas');
      }
    });
  }

  /**
   * Filtra las reservas por estado
   */
  get reservasFiltradas(): Reserva[] {
    const estado = this.filtroEstado();
    if (estado === 'Todos') {
      return this.reservas();
    }
    return this.reservas().filter(r => r.estado_pago === estado);
  }

  /**
   * Cambia el filtro activo
   */
  cambiarFiltro(estado: EstadoPago): void {
    this.filtroEstado.set(estado);
  }

  /**
   * Cuenta reservas por estado
   */
  contarReservasPorEstado(estado: EstadoPago): number {
    if (estado === 'Todos') {
      return this.reservas().length;
    }
    return this.reservas().filter(r => r.estado_pago === estado).length;
  }

  /**
   * Retorna el icono material según el estado
   */
  getEstadoIcon(estado: string): string {
    const iconos: Record<string, string> = {
      'pendiente': 'schedule',
      'pagado': 'check_circle',
      'cancelado': 'cancel',
      'reembolsado': 'replay'
    };
    return iconos[estado] || 'help';
  }

  /**
   * Retorna la clase CSS según el estado
   */
  getEstadoClass(estado: string): string {
    return `estado-${estado.toLowerCase()}`;
  }

  /**
   * Formatea la fecha para mostrarla
   */
  formatFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('es-ES', options);
  }

  /**
   * Formatea el precio
   */
  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  /**
   * Navega al detalle de la reserva
   */
  verDetalle(idReserva: number): void {
    this.router.navigate(['/mis-reservas', idReserva]);
  }

  /**
   * Calcula la hora de finalización
   */
  calcularHoraFin(horaInicio: string, duracion: number): string {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const fechaInicio = new Date();
    fechaInicio.setHours(horas, minutos, 0);
    fechaInicio.setMinutes(fechaInicio.getMinutes() + duracion);
    return fechaInicio.toTimeString().substring(0, 5);
  }

  /**
   * Retorna el texto del tipo de pago
   */
  getTipoPagoTexto(tipo: string): string {
    const tipos: Record<string, string> = {
      'virtual': 'Pago Virtual',
      'efectivo': 'Efectivo',
      'transferencia': 'Transferencia'
    };
    return tipos[tipo] || tipo;
  }

  /**
   * Descarga la factura de la reserva
   */
  descargarFactura(reserva: Reserva, event: Event): void {
    event.stopPropagation();

    this.notificationService.loading('Generando factura...');

    const qrUrl = `${window.location.origin}/mis-reservas/${reserva.id_reserva}`;

    this.reportsService.generarFacturaReserva(reserva.id_reserva!, qrUrl).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `factura-reserva-${reserva.id_reserva}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);

        // Dismiss loading toast
        this.notificationService.dismiss();
        setTimeout(() => {
          this.notificationService.success('Factura descargada exitosamente');
        }, 100);
      },
      error: (error) => {
        console.error('Error al generar factura:', error);
        // Dismiss loading toast
        this.notificationService.dismiss();
        setTimeout(() => {
          this.notificationService.error('Error al generar la factura');
        }, 100);
      }
    });
  }
}
