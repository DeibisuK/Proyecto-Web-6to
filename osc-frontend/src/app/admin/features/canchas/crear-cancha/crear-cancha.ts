import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Cancha, Sede, TipoSuperficie, EstadoCancha } from '../../../../core/models/canchas.model';

@Component({
  selector: 'app-crear-cancha',
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-cancha.html',
  styleUrl: './crear-cancha.css'
})
export class CrearCancha implements OnInit {
  canchaData: Cancha = {
    nombre_cancha: '',
    id_sede: 0,
    id_deporte: 1,
    largo: 30,
    ancho: 30,
    tarifa: 25,
    tipo_superficie: 'Cemento',
    estado: 'Disponible'
  };

  isEditMode = false;
  isLoading = false;
  imagenPreview: string | null = null;
  imagenFile: File | null = null;

  // Datos para los selects
  deportes = [
    { id: 1, nombre: 'Fútbol' },
    { id: 2, nombre: 'Básquetbol' },
    { id: 3, nombre: 'Voleibol' },
    { id: 4, nombre: 'Tenis' },
    { id: 5, nombre: 'Pádel' }
  ];

  sedes: Sede[] = [
    { id_sede: 1, nombre_sede: 'Sede Centro', direccion: 'Av. Principal 123' },
    { id_sede: 2, nombre_sede: 'Sede Norte', direccion: 'Calle Norte 456' },
    { id_sede: 3, nombre_sede: 'Sede Sur', direccion: 'Jr. Sur 789' }
  ];

  tiposSuperficie: TipoSuperficie[] = [
    'Cemento',
    'Césped Natural',
    'Césped Sintético',
    'Parquet',
    'Arcilla'
  ];

  estadosCancha: EstadoCancha[] = [
    'Disponible',
    'Mantenimiento',
    'Reservado',
    'Fuera de Servicio'
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Verificar si estamos en modo edición
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.cargarCancha(id);
    }
  }

  cargarCancha(id: number) {
    // Aquí iría la llamada al servicio
    // Por ahora, datos de ejemplo
    this.canchaData = {
      id_cancha: id,
      nombre_cancha: 'Cancha 1',
      id_sede: 1,
      id_deporte: 1,
      largo: 40,
      ancho: 25,
      tarifa: 30,
      tipo_superficie: 'Césped Sintético',
      estado: 'Disponible'
    };
  }

  async guardarCancha() {
    if (!this.validarFormulario()) {
      return;
    }

    this.isLoading = true;

    try {
      // Aquí iría la llamada al servicio
      await this.simularGuardado();

      // Mostrar notificación de éxito usando React component
      this.mostrarNotificacion(
        this.isEditMode ? 'Cancha actualizada correctamente' : 'Cancha creada correctamente',
        'success'
      );

      // Redirigir al listado
      setTimeout(() => {
        this.router.navigate(['/admin/canchas']);
      }, 1500);

    } catch (error) {
      this.mostrarNotificacion('Error al guardar la cancha', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  validarFormulario(): boolean {
    if (!this.canchaData.nombre_cancha.trim()) {
      this.mostrarNotificacion('El nombre de la cancha es obligatorio', 'error');
      return false;
    }

    if (!this.canchaData.id_sede || this.canchaData.id_sede === 0) {
      this.mostrarNotificacion('Debes seleccionar una sede', 'error');
      return false;
    }

    if (this.canchaData.largo <= 0 || this.canchaData.ancho <= 0) {
      this.mostrarNotificacion('Las dimensiones deben ser mayores a 0', 'error');
      return false;
    }

    if (this.canchaData.tarifa <= 0) {
      this.mostrarNotificacion('La tarifa debe ser mayor a 0', 'error');
      return false;
    }

    return true;
  }

  cancelar() {
    this.router.navigate(['/admin/canchas']);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        this.mostrarNotificacion('Solo se permiten archivos JPG, PNG o WEBP', 'error');
        return;
      }

      // Validar tamaño (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (file.size > maxSize) {
        this.mostrarNotificacion('La imagen no debe superar los 5MB', 'error');
        return;
      }

      this.imagenFile = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imagenPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  eliminarImagen(): void {
    this.imagenPreview = null;
    this.imagenFile = null;
    this.canchaData.imagen_url = undefined;
  }

  private simularGuardado(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }

  private mostrarNotificacion(message: string, type: 'success' | 'error') {
    // Emitir evento para el componente React
    const event = new CustomEvent('showToast', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  }

  obtenerNombreDeporte(id: number): string {
    return this.deportes.find(d => d.id === id)?.nombre || '';
  }
}
