import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Cancha, Sede, TipoSuperficie, EstadoCancha } from '../../../../core/models/canchas.model';
import { SedeService } from '../../../../core/services/sede.service';
import { NotificationService } from '../../../../core/services/notification.service';

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

  sedes: Sede[] = [];

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
    private route: ActivatedRoute,
    private http: HttpClient,
    private canchaService: CanchaService,
    private sedeService: SedeService,
    private notificationService: NotificationService
  ) {}

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
          .filter(sede => sede.id_sede !== undefined)
          .map(sede => ({
            id_sede: sede.id_sede!,
            nombre_sede: sede.nombre,
            direccion: sede.direccion || ''
          }));
      },
      error: (error) => {
        console.error('Error al cargar sedes:', error);
        this.notificationService.error('Error al cargar las sedes');
      }
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
        console.error('Error al cargar cancha:', error);
        this.notificationService.error('Error al cargar la cancha');
        this.router.navigate(['/admin/canchas']);
      }
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

    this.http.post<{ success: boolean, url: string }>('http://localhost:3000/i/imagen/upload-cancha', formData)
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
          console.error('Error al subir imagen:', error);
          this.notificationService.error('Error al subir la imagen');
          this.isLoading = false;
        }
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
        console.error('Error al guardar cancha:', error);
        this.notificationService.error(error.error?.message || 'Error al guardar la cancha');
        this.isLoading = false;
      }
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
    return this.deportes.find(d => d.id === id)?.nombre || '';
  }
}
