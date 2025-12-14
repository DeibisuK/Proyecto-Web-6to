import { Component, OnInit, signal, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Cancha, Sede, TipoSuperficie, EstadoCancha } from '@shared/models/index';
import { SedeService } from '@shared/services/index';
import { NotificationService } from '@core/services/notification.service';
import { CanchaService } from '@shared/services/index';
import { environment } from '@env/environment';

@Component({
  selector: 'app-crear-cancha',
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-cancha.html',
  styleUrl: './crear-cancha.css',
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
    estado: 'Disponible',
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
    { id: 5, nombre: 'Pádel' },
  ];

  sedes: Sede[] = [];

  tiposSuperficie: TipoSuperficie[] = [
    'Cemento',
    'Césped Natural',
    'Césped Sintético',
    'Parquet',
    'Arcilla',
  ];

  estadosCancha: EstadoCancha[] = ['Disponible', 'Mantenimiento', 'Reservado', 'Fuera de Servicio'];

  // Signals para dropdowns personalizados
  dropdownDeporteAbierto = signal<boolean>(false);
  dropdownSedeAbierto = signal<boolean>(false);
  dropdownSuperficieAbierto = signal<boolean>(false);
  dropdownEstadoAbierto = signal<boolean>(false);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private canchaService: CanchaService,
    private sedeService: SedeService,
    private notificationService: NotificationService
  ) {
    afterNextRender(() => {
      this.configurarCierreDropdowns();
    });
  }

  ngOnInit() {
    this.cargarSedes();

    // Verificar si estamos en modo edición
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.cargarCancha(id);
    }
  }

  cargarSedes() {
    this.sedeService.getSedes().subscribe({
      next: (data) => {
        this.sedes = data
          .filter((sede) => sede.id_sede !== undefined)
          .map((sede) => ({
            id_sede: sede.id_sede!,
            nombre_sede: sede.nombre_sede,
            direccion: sede.direccion || '',
          }));
      },
      error: (error) => {
        this.notificationService.error('Error al cargar las sedes');
      },
    });
  }

  cargarCancha(id: number) {
    this.canchaService.getCanchaById(id).subscribe({
      next: (data) => {
        this.canchaData = data;
        if (data.imagen_url) {
          this.imagenPreview = data.imagen_url;
        }
      },
      error: (error) => {
        this.notificationService.error('Error al cargar la cancha');
        this.router.navigate(['/admin/canchas']);
      },
    });
  }

  guardarCancha() {
    if (!this.validarFormulario()) {
      return;
    }

    this.isLoading = true;

    // Si hay una imagen para subir, primero subirla a Cloudinary
    if (this.imagenFile) {
      this.subirImagenYGuardar();
    } else {
      // Si no hay imagen nueva, guardar directamente
      this.ejecutarGuardado();
    }
  }

  subirImagenYGuardar(): void {
    const formData = new FormData();
    formData.append('imagen', this.imagenFile!);

    this.http
      .post<{ success: boolean; url: string }>(
        `${environment.apiUrl}/i/admin/upload-cancha`,
        formData
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.canchaData.imagen_url = response.url;
            this.ejecutarGuardado();
          } else {
            this.notificationService.error('Error al subir la imagen');
            this.isLoading = false;
          }
        },
        error: (error) => {
          this.notificationService.error('Error al subir la imagen');
          this.isLoading = false;
        },
      });
  }

  ejecutarGuardado(): void {
    const operacion = this.isEditMode
      ? this.canchaService.updateCancha(this.canchaData.id_cancha!, this.canchaData)
      : this.canchaService.createCancha(this.canchaData);

    operacion.subscribe({
      next: () => {
        this.notificationService.success(
          this.isEditMode ? 'Cancha actualizada correctamente' : 'Cancha creada correctamente'
        );
        setTimeout(() => {
          this.router.navigate(['/admin/canchas']);
        }, 1500);
      },
      error: (error) => {
        this.notificationService.error(error.error?.message || 'Error al guardar la cancha');
        this.isLoading = false;
      },
    });
  }

  validarFormulario(): boolean {
    if (!this.canchaData.nombre_cancha.trim()) {
      this.notificationService.error('El nombre de la cancha es obligatorio');
      return false;
    }

    if (!this.canchaData.id_sede || this.canchaData.id_sede === 0) {
      this.notificationService.error('Debes seleccionar una sede');
      return false;
    }

    if (this.canchaData.largo <= 0 || this.canchaData.ancho <= 0) {
      this.notificationService.error('Las dimensiones deben ser mayores a 0');
      return false;
    }

    if (this.canchaData.tarifa < 0) {
      this.notificationService.error('La tarifa no puede ser negativa');
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
        this.notificationService.error('Solo se permiten archivos JPG, PNG o WEBP');
        return;
      }

      // Validar tamaño (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (file.size > maxSize) {
        this.notificationService.error('La imagen no debe superar los 5MB');
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

  obtenerNombreDeporte(id: number): string {
    return this.deportes.find((d) => d.id === id)?.nombre || '';
  }

  // ===== Métodos para dropdowns personalizados =====

  toggleDropdownDeporte() {
    this.dropdownDeporteAbierto.update((estado) => !estado);
    if (this.dropdownDeporteAbierto()) {
      this.dropdownSedeAbierto.set(false);
      this.dropdownSuperficieAbierto.set(false);
      this.dropdownEstadoAbierto.set(false);
    }
  }

  toggleDropdownSede() {
    this.dropdownSedeAbierto.update((estado) => !estado);
    if (this.dropdownSedeAbierto()) {
      this.dropdownDeporteAbierto.set(false);
      this.dropdownSuperficieAbierto.set(false);
      this.dropdownEstadoAbierto.set(false);
    }
  }

  toggleDropdownSuperficie() {
    this.dropdownSuperficieAbierto.update((estado) => !estado);
    if (this.dropdownSuperficieAbierto()) {
      this.dropdownDeporteAbierto.set(false);
      this.dropdownSedeAbierto.set(false);
      this.dropdownEstadoAbierto.set(false);
    }
  }

  toggleDropdownEstado() {
    this.dropdownEstadoAbierto.update((estado) => !estado);
    if (this.dropdownEstadoAbierto()) {
      this.dropdownDeporteAbierto.set(false);
      this.dropdownSedeAbierto.set(false);
      this.dropdownSuperficieAbierto.set(false);
    }
  }

  seleccionarDeporte(deporte: any) {
    this.canchaData.id_deporte = deporte.id;
    this.dropdownDeporteAbierto.set(false);
  }

  seleccionarSede(sede: Sede) {
    this.canchaData.id_sede = sede.id_sede!;
    this.dropdownSedeAbierto.set(false);
  }

  seleccionarSuperficie(superficie: TipoSuperficie) {
    this.canchaData.tipo_superficie = superficie;
    this.dropdownSuperficieAbierto.set(false);
  }

  seleccionarEstado(estado: EstadoCancha) {
    this.canchaData.estado = estado;
    this.dropdownEstadoAbierto.set(false);
  }

  getNombreDeporte(): string {
    const deporte = this.deportes.find((d) => d.id === this.canchaData.id_deporte);
    return deporte ? deporte.nombre : 'Selecciona un deporte';
  }

  getNombreSede(): string {
    const sede = this.sedes.find((s) => s.id_sede === this.canchaData.id_sede);
    return sede ? sede.nombre_sede : 'Seleccione una sede...';
  }

  private configurarCierreDropdowns() {
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const dropdownDeporte = target.closest('.dropdown-deporte');
      const dropdownSede = target.closest('.dropdown-sede');
      const dropdownSuperficie = target.closest('.dropdown-superficie');
      const dropdownEstado = target.closest('.dropdown-estado');

      if (!dropdownDeporte && this.dropdownDeporteAbierto()) {
        this.dropdownDeporteAbierto.set(false);
      }
      if (!dropdownSede && this.dropdownSedeAbierto()) {
        this.dropdownSedeAbierto.set(false);
      }
      if (!dropdownSuperficie && this.dropdownSuperficieAbierto()) {
        this.dropdownSuperficieAbierto.set(false);
      }
      if (!dropdownEstado && this.dropdownEstadoAbierto()) {
        this.dropdownEstadoAbierto.set(false);
      }
    });
  }
}
