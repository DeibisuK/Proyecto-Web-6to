import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Equipo } from '@shared/models/index';
import { EquipoService } from '@shared/services/index';
import { NotificationService } from '@core/services/notification.service';
import { DeporteService } from '@shared/services/index';
import { Deporte } from '@shared/models/index';
import { environment } from '@env/environment';

@Component({
  selector: 'app-crear-equipo',
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-equipo.html',
  styleUrl: './crear-equipo.css',
})
export class CrearEquipo implements OnInit {
  @Input() equipoEditar?: Equipo;
  @Output() equipoGuardado = new EventEmitter<Equipo>();
  @Output() cerrarModal = new EventEmitter<void>();

  equipoData = {
    nombre_equipo: '',
    descripcion: '',
    logo_url: '',
    id_deporte: null as number | null,
  };

  deportes: Deporte[] = [];

  logoPreview: string | null = null;
  selectedFile: File | null = null;
  isLoading = false;
  isEditMode = false;
  equipoId: number | null = null;

  constructor(
    private http: HttpClient,
    private equipoService: EquipoService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private deporteService: DeporteService
  ) {}

  ngOnInit() {
    this.deporteService.getDeportes().subscribe({
      next: (deportes) => {
        this.deportes = deportes;
      },
      error: (error) => {
        console.error('Error al cargar deportes:', error);
        this.notificationService.error('Error al cargar deportes');
      },
    });

    // Verificar si estamos en modo edición por ruta
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.equipoId = parseInt(id);
      this.cargarEquipo(this.equipoId);
    } else if (this.equipoEditar) {
      // Modo edición por modal (Input)
      this.isEditMode = true;
      this.equipoId = this.equipoEditar.id_equipo;
      this.equipoData = {
        nombre_equipo: this.equipoEditar.nombre_equipo,
        descripcion: this.equipoEditar.descripcion,
        logo_url: this.equipoEditar.logo_url || '',
        id_deporte: this.equipoEditar.id_deporte || null,
      };
      if (this.equipoEditar.logo_url) {
        this.logoPreview = this.equipoEditar.logo_url;
      }
    }
  }

  cargarEquipo(id: number) {
    this.equipoService.getEquipoById(id).subscribe({
      next: (equipo) => {
        this.equipoData = {
          nombre_equipo: equipo.nombre_equipo,
          descripcion: equipo.descripcion,
          logo_url: equipo.logo_url || '',
          id_deporte: equipo.id_deporte || null,
        };
        if (equipo.logo_url) {
          this.logoPreview = equipo.logo_url;
        }
      },
      error: (error) => {
        console.error('Error al cargar equipo:', error);
        this.notificationService.error('Error al cargar el equipo');
        this.router.navigate(['/mis-equipos']);
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        this.notificationService.error('Solo se permiten archivos JPG, PNG, WEBP o SVG');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.error('La imagen no debe superar los 5MB');
        return;
      }

      this.selectedFile = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.logoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  eliminarLogo(): void {
    this.logoPreview = null;
    this.selectedFile = null;
    this.equipoData.logo_url = '';
  }

  async guardarEquipo() {
    if (!this.equipoData.nombre_equipo.trim()) {
      this.notificationService.error('El nombre del equipo es obligatorio');
      return;
    }

    this.isLoading = true;

    try {
      // Si hay una imagen para subir, primero subirla a Cloudinary
      if (this.selectedFile) {
        await this.subirLogo();
      }

      // Ejecutar guardado del equipo
      this.ejecutarGuardado();
    } catch (error) {
      console.error('Error al guardar equipo:', error);
      this.notificationService.error('Error al guardar el equipo');
      this.isLoading = false;
    }
  }

  async subirLogo(): Promise<void> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('logo', this.selectedFile!);

      this.http
        .post<{ success: boolean; url: string }>(
          `${environment.apiUrl}/i/client/upload-equipo`,
          formData
        )
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.equipoData.logo_url = response.url;
              resolve();
            } else {
              reject(new Error('Error al subir la imagen'));
            }
          },
          error: (error) => {
            console.error('Error al subir logo:', error);
            reject(error);
          },
        });
    });
  }

  ejecutarGuardado(): void {
    const equipoParaGuardar: Equipo = {
      id_equipo: this.equipoId || 0,
      nombre_equipo: this.equipoData.nombre_equipo.trim(),
      descripcion: this.equipoData.descripcion.trim(),
      logo_url: this.equipoData.logo_url || undefined,
      id_deporte: this.equipoData.id_deporte || undefined,
    };

    const operacion =
      this.isEditMode && this.equipoId
        ? this.equipoService.updateEquipo(this.equipoId, equipoParaGuardar)
        : this.equipoService.createEquipo(equipoParaGuardar);

    operacion.subscribe({
      next: (equipo) => {
        this.notificationService.success(
          this.isEditMode ? 'Equipo actualizado correctamente' : 'Equipo creado correctamente'
        );

        // Emitir evento con el equipo guardado
        this.equipoGuardado.emit(equipo);

        // Si es modal, cerrar
        if (this.equipoEditar || !this.route.snapshot.params['id']) {
          this.cerrar();
        } else {
          // Si es ruta, navegar a lista
          setTimeout(() => {
            this.router.navigate(['/mis-equipos']);
          }, 1500);
        }
      },
      error: (error) => {
        console.error('Error al guardar equipo:', error);
        this.notificationService.error('Error al guardar el equipo');
        this.isLoading = false;
      },
    });
  }

  cerrar() {
    this.cerrarModal.emit();
  }
}
