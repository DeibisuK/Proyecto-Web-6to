import { Component, Input, Output, EventEmitter, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscripcionesService } from '../services/inscripciones.service';
import { type EquipoUsuario } from '../services/equipos.service';
import { NotificationService } from '@core/services/notification.service';

interface JugadorEquipo {
  id_usuario: number;
  nombre_completo: string;
  posicion?: string;
}

interface InscripcionFormData {
  id_equipo: number | null;
  notas?: string;
}

@Component({
  selector: 'app-inscripcion-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inscripcion-modal.html',
  styleUrls: ['./inscripcion-modal.css']
})
export class InscripcionModalComponent {
  @Input() isOpen: boolean = false;
  @Input() torneo: any = null; // Torneo interface
  @Input() equiposDisponibles: EquipoUsuario[] = []; // Equipos del usuario
  @Output() cerrar = new EventEmitter<void>();
  @Output() inscripcionExitosa = new EventEmitter<any>();

  private inscripcionesService = inject(InscripcionesService);
  private notificationService = inject(NotificationService);

  // State
  isSubmitting = signal(false);
  errorMessage = signal('');
  dropdownEquipoAbierto = signal(false);
  equipoSeleccionadoTexto = signal('Selecciona un equipo');

  // Form
  formData: InscripcionFormData = {
    id_equipo: null,
    notas: ''
  };

  equipoSeleccionado: EquipoUsuario | null = null;

  /**
   * Maneja el cambio de selección de equipo
   */
  onEquipoChange(event: any): void {
    const idEquipo = parseInt(event.target.value);
    this.formData.id_equipo = idEquipo || null;
    this.equipoSeleccionado = this.equiposDisponibles.find((e: EquipoUsuario) => e.id_equipo === idEquipo) || null;
  }

  /**
   * Toggle dropdown de equipos
   */
  toggleDropdownEquipo(): void {
    this.dropdownEquipoAbierto.set(!this.dropdownEquipoAbierto());
  }

  /**
   * Selecciona un equipo del dropdown
   */
  seleccionarEquipo(equipo: EquipoUsuario): void {
    this.formData.id_equipo = equipo.id_equipo;
    this.equipoSeleccionado = equipo;
    this.equipoSeleccionadoTexto.set(`${equipo.nombre_equipo} (${equipo.cantidad_jugadores || 0} jugadores)`);
    this.dropdownEquipoAbierto.set(false);
  }

  /**
   * Valida si el formulario puede enviarse
   */
  canSubmit(): boolean {
    return (
      this.formData.id_equipo !== null &&
      !this.isSubmitting()
    );
  }

  /**
   * Envía la inscripción
   */
  onSubmit(): void {
    if (!this.canSubmit() || !this.torneo) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const inscripcionData = {
      id_torneo: this.torneo.id_torneo,
      id_equipo: this.formData.id_equipo!,
      notas: this.formData.notas || undefined
    };
    this.inscripcionesService.crearInscripcion(inscripcionData).subscribe({
      next: (response) => {
        this.notificationService.success('¡Inscripción exitosa! Te has inscrito al torneo.');
        this.inscripcionExitosa.emit(response);
        this.resetForm();
        this.close();
      },
      error: (error) => {
        console.error('Error al crear inscripción:', error);
        const errorMsg = error.error?.message || 'Error al procesar la inscripción. Verifica que el torneo tenga cupos disponibles.';
        this.errorMessage.set(errorMsg);
        this.notificationService.error(errorMsg);
        this.isSubmitting.set(false);
      }
    });
  }

  /**
   * Cierra el modal
   */
  close(): void {
    if (!this.isSubmitting()) {
      this.cerrar.emit();
      this.resetForm();
    }
  }

  /**
   * Resetea el formulario
   */
  resetForm(): void {
    this.formData = {
      id_equipo: null,
      notas: ''
    };
    this.equipoSeleccionado = null;
    this.equipoSeleccionadoTexto.set('Selecciona un equipo');
    this.dropdownEquipoAbierto.set(false);
    this.errorMessage.set('');
    this.isSubmitting.set(false);
  }

  /**
   * Maneja click en backdrop
   * Desactivado: solo se cierra con el botón X
   */
  onBackdropClick(event: MouseEvent): void {
    // No cerrar al hacer click fuera - solo con botón X
    // if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
    //   this.close();
    // }
  }

  /**
   * Obtiene el costo formateado
   */
  getCostoFormateado(): string {
    // El campo costo_inscripcion no existe en el esquema actual
    return 'Gratis';
  }

  /**
   * Verifica si hay equipos disponibles
   */
  hasEquipos(): boolean {
    return this.equiposDisponibles.length > 0;
  }
}
