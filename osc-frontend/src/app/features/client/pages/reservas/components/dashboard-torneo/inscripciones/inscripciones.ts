import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InscripcionesService } from '../services/inscripciones.service';
import { AuthService } from '@core/services/auth.service';
import { Inscripcion } from '../models/torneo.models';
import { ConfirmacionModalComponent, type ConfirmacionConfig } from '../modals';

type EstadoTab = 'activas' | 'pendientes' | 'finalizadas';

@Component({
  selector: 'app-inscripciones',
  standalone: true,
  imports: [CommonModule, ConfirmacionModalComponent],
  templateUrl: './inscripciones.html',
  styleUrls: ['./inscripciones.css', '../shared-styles.css']
})
export class Inscripciones implements OnInit {
  private inscripcionesService = inject(InscripcionesService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading: boolean = true;
  activeTab: EstadoTab = 'activas';
  inscripciones: Inscripcion[] = [];
  error: string | null = null;

  // Modal de confirmación
  showConfirmacionModal: boolean = false;
  confirmacionConfig: ConfirmacionConfig | null = null;
  inscripcionPendienteCancelar: Inscripcion | null = null;

  ngOnInit(): void {
    this.loadInscripciones();
  }

  /**
   * Carga las inscripciones del usuario desde el backend
   */
  loadInscripciones(): void {
    this.isLoading = true;
    this.error = null;

    const user = this.authService.currentUser;
    if (!user?.uid) {
      this.error = 'Usuario no autenticado';
      this.isLoading = false;
      return;
    }

    this.inscripcionesService.getInscripcionesUsuario(user.uid).subscribe({
      next: (inscripciones) => {
        this.inscripciones = inscripciones;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar inscripciones:', error);
        this.error = 'Error al cargar las inscripciones. Intenta nuevamente.';
        this.isLoading = false;
      }
    });
  }

  setActiveTab(tab: 'activas' | 'pendientes' | 'finalizadas'): void {
    this.activeTab = tab;
  }

  getFilteredInscripciones(): Inscripcion[] {
    return this.inscripcionesService.filtrarPorEstado(this.inscripciones, this.activeTab);
  }

  getActiveCount(): number {
    return this.inscripcionesService.contarPorEstado(this.inscripciones).activas;
  }

  getPendingCount(): number {
    return this.inscripcionesService.contarPorEstado(this.inscripciones).pendientes;
  }

  getStatusBadgeClass(estado: string): string {
    switch (estado) {
      case 'confirmada':
        return 'badge-success';
      case 'pendiente':
        return 'badge-warning';
      case 'cancelada':
      case 'finalizado':
        return 'badge-info';
      default:
        return 'badge-info';
    }
  }

  getStatusText(estado: string): string {
    switch (estado) {
      case 'confirmada':
        return 'ACTIVA';
      case 'pendiente':
        return 'PENDIENTE';
      case 'cancelada':
        return 'CANCELADA';
      case 'finalizado':
        return 'FINALIZADA';
      default:
        return estado.toUpperCase();
    }
  }

  /**
   * Obtiene el título para el estado vacío según la tab activa
   */
  getEmptyStateTitle(): string {
    switch (this.activeTab) {
      case 'activas':
        return 'No tienes inscripciones activas';
      case 'pendientes':
        return 'No tienes inscripciones pendientes';
      case 'finalizadas':
        return 'No tienes inscripciones finalizadas';
      default:
        return 'No tienes inscripciones';
    }
  }

  /**
   * Obtiene el mensaje para el estado vacío según la tab activa
   */
  getEmptyStateMessage(): string {
    switch (this.activeTab) {
      case 'activas':
        return 'Inscríbete a un torneo y comienza a competir';
      case 'pendientes':
        return 'Tus inscripciones pendientes de confirmación aparecerán aquí';
      case 'finalizadas':
        return 'Los torneos en los que has participado aparecerán aquí';
      default:
        return 'Aún no te has inscrito a ningún torneo';
    }
  }

  /**
   * Abre el wizard para crear una nueva inscripción
   */
  openNewInscriptionWizard(): void {
    // Navegar a la vista de torneos para seleccionar uno
    this.router.navigate(['/client/reservas/dashboard-torneo/torneos']);
  }

  /**
   * Ver detalles del próximo partido
   */
  verProximoPartido(inscripcion: Inscripcion, event: Event): void {
    event.stopPropagation();
    if (inscripcion.proximo_partido?.id_partido) {
      this.router.navigate(['/client/reservas/dashboard-torneo/partido', inscripcion.proximo_partido.id_partido]);
    }
  }

  /**
   * Cancelar una inscripción con confirmación
   */
  cancelInscription(inscripcion: Inscripcion, event: Event): void {
    event.stopPropagation();

    // Verificar si puede cancelar (24 horas antes)
    if (!this.inscripcionesService.puedeCancelar(inscripcion)) {
      this.confirmacionConfig = {
        titulo: 'No se puede cancelar',
        mensaje: 'No puedes cancelar esta inscripción. Solo se permiten cancelaciones con al menos 24 horas de anticipación.',
        textoConfirmar: 'Entendido',
        textoCancelar: '',
        tipo: 'warning',
        icono: 'warning'
      };
      this.showConfirmacionModal = true;
      return;
    }

    // Guardar inscripción para cancelar después de confirmar
    this.inscripcionPendienteCancelar = inscripcion;

    // Mostrar modal de confirmación
    this.confirmacionConfig = {
      titulo: 'Cancelar Inscripción',
      mensaje: `¿Estás seguro de que deseas cancelar tu inscripción a "${inscripcion.torneo_nombre}"?\n\nEsta acción no se puede deshacer.`,
      textoConfirmar: 'Sí, cancelar',
      textoCancelar: 'No, mantener',
      tipo: 'danger',
      icono: 'danger'
    };
    this.showConfirmacionModal = true;
  }

  onConfirmacionModalConfirmar(): void {
    if (this.inscripcionPendienteCancelar) {
      this.ejecutarCancelacion(this.inscripcionPendienteCancelar);
    }
    this.showConfirmacionModal = false;
    this.confirmacionConfig = null;
    this.inscripcionPendienteCancelar = null;
  }

  onConfirmacionModalCancelar(): void {
    this.showConfirmacionModal = false;
    this.confirmacionConfig = null;
    this.inscripcionPendienteCancelar = null;
  }

  onConfirmacionModalCerrar(): void {
    this.showConfirmacionModal = false;
    this.confirmacionConfig = null;
    this.inscripcionPendienteCancelar = null;
  }

  private ejecutarCancelacion(inscripcion: Inscripcion): void {
    this.isLoading = true;

    this.inscripcionesService.cancelarInscripcion(inscripcion.id_inscripcion).subscribe({
      next: () => {
        // Mostrar modal de éxito
        this.confirmacionConfig = {
          titulo: '¡Inscripción cancelada!',
          mensaje: 'Tu inscripción ha sido cancelada exitosamente.',
          textoConfirmar: 'Aceptar',
          textoCancelar: '',
          tipo: 'success',
          icono: 'success'
        };
        this.showConfirmacionModal = true;

        // Recargar las inscripciones
        this.loadInscripciones();
      },
      error: (error) => {
        console.error('Error al cancelar inscripción:', error);

        // Mostrar modal de error
        this.confirmacionConfig = {
          titulo: 'Error al cancelar',
          mensaje: error.error?.message || 'Error al cancelar la inscripción. Intenta nuevamente.',
          textoConfirmar: 'Entendido',
          textoCancelar: '',
          tipo: 'danger',
          icono: 'danger'
        };
        this.showConfirmacionModal = true;
        this.isLoading = false;
      }
    });
  }

  /**
   * Obtiene el progreso del torneo para mostrar barra de progreso
   */
  getProgreso(inscripcion: Inscripcion): number {
    return this.inscripcionesService.calcularProgresoTorneo(inscripcion);
  }

  /**
   * Formatea la fecha del próximo partido
   */
  getProximoPartidoFecha(inscripcion: Inscripcion): string {
    return this.inscripcionesService.formatearFechaProximoPartido(inscripcion);
  }

  /**
   * Verifica si la inscripción puede ser cancelada
   */
  puedeCancelar(inscripcion: Inscripcion): boolean {
    return this.inscripcionesService.puedeCancelar(inscripcion);
  }

  /**
   * Obtiene el mensaje explicando por qué NO se puede cancelar
   */
  getMensajeNoPuedeCancelar(inscripcion: Inscripcion): string {
    // Si ya está cancelada
    if (inscripcion.estado_inscripcion === 'cancelado') {
      return 'Inscripción ya cancelada';
    }

    const ahora = new Date();
    const fechaInicio = new Date(inscripcion.fecha_inicio);
    const fechaFin = inscripcion.fecha_fin ? new Date(inscripcion.fecha_fin) : null;

    // Si el torneo ya pasó su fecha de fin
    if (fechaFin && fechaFin < ahora) {
      return 'El torneo ha finalizado';
    }

    // Si el torneo ya finalizó (por estado)
    if (inscripcion.torneo_estado === 'finalizado') {
      return 'El torneo ha finalizado';
    }

    // Si el torneo está en curso
    if (inscripcion.torneo_estado === 'en_curso') {
      return 'El torneo ya comenzó';
    }

    // Si el torneo ya comenzó por fecha
    if (fechaInicio < ahora) {
      return 'El torneo ya comenzó';
    }

    // Si el torneo está cerrado (inscripciones cerradas)
    if (inscripcion.torneo_estado === 'cerrado') {
      return 'Las inscripciones están cerradas';
    }

    // Verificar las horas restantes
    const horasRestantes = (fechaInicio.getTime() - ahora.getTime()) / (1000 * 60 * 60);

    if (horasRestantes < 24 && horasRestantes >= 0) {
      const horasRedondeadas = Math.floor(horasRestantes);
      const minutos = Math.floor((horasRestantes - horasRedondeadas) * 60);
      return `Faltan menos de 24h (quedan ${horasRedondeadas}h ${minutos}min)`;
    }

    // Si llegamos aquí con horas negativas, el torneo ya pasó
    if (horasRestantes < 0) {
      return 'El torneo ya comenzó';
    }

    return 'No disponible';
  }

  /**
   * Obtiene el rango de fechas del torneo
   */
  getRangoFechas(inscripcion: Inscripcion): string {
    const inicio = new Date(inscripcion.fecha_inicio);
    const fin = inscripcion.fecha_fin ? new Date(inscripcion.fecha_fin) : null;

    const formatoFecha = (fecha: Date) => {
      return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    };

    if (fin) {
      return `${formatoFecha(inicio)} - ${formatoFecha(fin)}`;
    }
    return formatoFecha(inicio);
  }
}
