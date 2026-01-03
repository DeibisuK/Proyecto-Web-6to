import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservaService, Reserva } from '@shared/services/reserva.service';
import { NotificationService } from '@core/services/notification.service';
import { ReportsService } from '@shared/services/reports.service';
import QRCode from 'qrcode';

@Component({
  selector: 'app-detalle-reserva-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-reserva-page.html',
  styleUrl: './detalle-reserva-page.css'
})
export class DetalleReservaPage implements OnInit {
  private reservaService = inject(ReservaService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reportsService = inject(ReportsService);

  reserva = signal<Reserva | null>(null);
  isLoading = signal<boolean>(false);
  qrCodeUrl = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.cargarDetalleReserva(parseInt(id));
    }
  }

  /**
   * Carga los detalles de la reserva
   */
  cargarDetalleReserva(idReserva: number): void {
    this.isLoading.set(true);

    this.reservaService.getMisReservas().subscribe({
      next: (reservas) => {
        const reservaEncontrada = reservas.find(r => r.id_reserva === idReserva);

        if (reservaEncontrada) {
          this.reserva.set(reservaEncontrada);
          this.generarQR(idReserva);
        } else {
          this.notificationService.error('Reserva no encontrada');
          this.router.navigate(['/mis-reservas']);
        }

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar reserva:', error);
        this.notificationService.error('Error al cargar los detalles');
        this.isLoading.set(false);
        this.router.navigate(['/mis-reservas']);
      }
    });
  }

  /**
   * Genera el código QR para la reserva
   */
  generarQR(idReserva: number): void {
    const qrData = `${window.location.origin}/mis-reservas/${idReserva}`;

    QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }).then((url) => {
      this.qrCodeUrl.set(url);
    }).catch((error) => {
      console.error('Error generando QR:', error);
    });
  }

  /**
   * Formatea la fecha
   */
  formatFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
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
   * Retorna la clase CSS según el estado de pago
   */
  getEstadoClass(estado: string): string {
    return `estado-${estado.toLowerCase()}`;
  }

  /**
   * Vuelve a la lista de reservas
   */
  volver(): void {
    this.router.navigate(['/mis-reservas']);
  }

  /**
   * Descarga la factura de la reserva
   */
  descargarFactura(): void {
    const reservaData = this.reserva();
    if (!reservaData) return;

    this.notificationService.loading('Generando factura...');

    const qrUrl = `${window.location.origin}/mis-reservas/${reservaData.id_reserva}`;

    this.reportsService.generarFacturaReserva(reservaData.id_reserva!, qrUrl).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `factura-reserva-${reservaData.id_reserva}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.notificationService.success('Factura descargada exitosamente');
      },
      error: (error) => {
        console.error('Error al generar factura:', error);
        this.notificationService.error('Error al generar la factura');
      }
    });
  }
}
