import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReservaService, Reserva } from '@shared/services/reserva.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-list-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './list-reservas.html',
  styleUrl: './list-reservas.css',
})
export class ListReservas implements OnInit {
  private reservaService = inject(ReservaService);
  private notificationService = inject(NotificationService);

  // Señales
  reservas = signal<Reserva[]>([]);
  reservasFiltradas = signal<Reserva[]>([]);
  cargando = signal<boolean>(true);
  dropdownEstadoAbierto = signal<boolean>(false);

  // Filtros
  filtroEstado: string = 'todos';
  filtroTipoPago: string = 'todos';
  filtroBusqueda: string = '';
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';

  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  totalPaginas: number = 1;

  // Modal de confirmación
  mostrarModalEliminar: boolean = false;
  reservaAEliminar?: Reserva;

  ngOnInit(): void {
    this.cargarReservas();
  }

  /**
   * Carga todas las reservas con información completa
   */
  cargarReservas(): void {
    this.cargando.set(true);
    this.reservaService.getAllReservasComplete().subscribe({
      next: (data) => {
        this.reservas.set(data);
        this.aplicarFiltros();
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar reservas:', err);
        this.notificationService.error('Error al cargar las reservas');
        this.cargando.set(false);
      }
    });
  }

  /**
   * Aplica todos los filtros activos
   */
  aplicarFiltros(): void {
    let resultado = [...this.reservas()];

    // Filtro por estado de pago
    if (this.filtroEstado !== 'todos') {
      resultado = resultado.filter(r => r.estado_pago === this.filtroEstado);
    }

    // Filtro por tipo de pago
    if (this.filtroTipoPago !== 'todos') {
      resultado = resultado.filter(r => r.tipo_pago === this.filtroTipoPago);
    }

    // Filtro por búsqueda (nombre cancha, usuario, email)
    if (this.filtroBusqueda.trim()) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      resultado = resultado.filter(r =>
        r.nombre_cancha?.toLowerCase().includes(busqueda) ||
        r.nombre_usuario?.toLowerCase().includes(busqueda) ||
        r.email_usuario?.toLowerCase().includes(busqueda) ||
        r.nombre_sede?.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por rango de fechas
    if (this.filtroFechaDesde) {
      resultado = resultado.filter(r => r.fecha_reserva >= this.filtroFechaDesde);
    }
    if (this.filtroFechaHasta) {
      resultado = resultado.filter(r => r.fecha_reserva <= this.filtroFechaHasta);
    }

    this.reservasFiltradas.set(resultado);
    this.calcularPaginacion();
  }

  /**
   * Calcula el total de páginas
   */
  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.reservasFiltradas().length / this.itemsPorPagina);
    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = 1;
    }
  }

  /**
   * Obtiene las reservas de la página actual
   */
  getReservasPaginadas(): Reserva[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.reservasFiltradas().slice(inicio, fin);
  }

  /**
   * Cambia de página
   */
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  /**
   * Limpia todos los filtros
   */
  limpiarFiltros(): void {
    this.filtroEstado = 'todos';
    this.filtroTipoPago = 'todos';
    this.filtroBusqueda = '';
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.aplicarFiltros();
  }

  /**
   * Actualiza el estado de pago de una reserva
   */
  actualizarEstado(reserva: Reserva, nuevoEstado: string): void {
    if (confirm(`¿Confirmar cambio de estado a "${nuevoEstado}"?`)) {
      this.reservaService.updateReserva(reserva.id_reserva!, { estado_pago: nuevoEstado as any }).subscribe({
        next: () => {
          this.notificationService.success('Estado actualizado correctamente');
          this.cargarReservas();
        },
        error: (err) => {
          console.error('Error al actualizar estado:', err);
          this.notificationService.error('Error al actualizar el estado');
        }
      });
    }
  }

  /**
   * Abre modal de confirmación de eliminación
   */
  confirmarEliminar(reserva: Reserva): void {
    this.reservaAEliminar = reserva;
    this.mostrarModalEliminar = true;
  }

  /**
   * Elimina una reserva
   */
  eliminarReserva(): void {
    if (this.reservaAEliminar) {
      this.reservaService.deleteReserva(this.reservaAEliminar.id_reserva!).subscribe({
        next: () => {
          this.notificationService.success('Reserva eliminada correctamente');
          this.mostrarModalEliminar = false;
          this.reservaAEliminar = undefined;
          this.cargarReservas();
        },
        error: (err) => {
          console.error('Error al eliminar reserva:', err);
          this.notificationService.error('Error al eliminar la reserva');
        }
      });
    }
  }

  /**
   * Cancela la eliminación
   */
  cancelarEliminar(): void {
    this.mostrarModalEliminar = false;
    this.reservaAEliminar = undefined;
  }

  /**
   * Exporta las reservas a CSV
   */
  exportarCSV(): void {
    const reservas = this.reservasFiltradas();
    if (reservas.length === 0) {
      this.notificationService.error('No hay reservas para exportar');
      return;
    }

    const headers = ['ID', 'Fecha', 'Hora', 'Cancha', 'Usuario', 'Monto', 'Estado', 'Tipo Pago'];
    const rows = reservas.map(r => [
      r.id_reserva,
      r.fecha_reserva,
      r.hora_inicio,
      r.nombre_cancha,
      r.nombre_usuario || r.email_usuario,
      r.monto_total,
      r.estado_pago,
      r.tipo_pago
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reservas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  /**
   * Control de dropdown de estado
   */
  toggleDropdownEstado(): void {
    this.dropdownEstadoAbierto.set(!this.dropdownEstadoAbierto());
  }

  seleccionarEstado(estado: string): void {
    this.filtroEstado = estado;
    this.aplicarFiltros();
    this.dropdownEstadoAbierto.set(false);
  }

  estadoSeleccionado(): string {
    switch (this.filtroEstado) {
      case 'pendiente': return 'Pendiente';
      case 'pagado': return 'Pagado';
      case 'cancelado': return 'Cancelado';
      case 'reembolsado': return 'Reembolsado';
      default: return 'Todos los estados';
    }
  }

  /**
   * Métodos auxiliares para el template
   */
  getEstadoPagoTexto(estado: string): string {
    return this.reservaService.getEstadoPagoTexto(estado);
  }

  getEstadoPagoClass(estado: string): string {
    return this.reservaService.getEstadoPagoClass(estado);
  }

  getTipoPagoTexto(tipo: string): string {
    return this.reservaService.getTipoPagoTexto(tipo);
  }

  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(monto);
  }
}
