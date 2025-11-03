import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Sede } from '../../../../core/models/sede.model';
import { SedeService } from '../../../../core/services/sede.service';
import { NotificationService } from '../../../../core/services/notification.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-crear-sede',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-sede.html',
  styleUrl: './crear-sede.css'
})
export class CrearSede implements OnInit, AfterViewInit, OnDestroy {
  sedeForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  latitud: number = -3.258095;
  longitud: number = -79.959908;

  private map!: L.Map;
  private marker!: L.Marker;

  estados: string[] = ['Activo', 'Mantenimiento', 'Inactivo'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private sedeService: SedeService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.cargarSede(id);
    }
  }

  ngAfterViewInit(): void {
    // Aquí se inicializaría el mapa de Google Maps
    // Por ahora solo mostramos un placeholder
    this.initMap();
  }

  inicializarFormulario(): void {
    this.sedeForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      ciudad: [{ value: '', disabled: true }],
      direccion: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(5)]],
      telefono: ['', [Validators.pattern(/^[\d\s\-\+]+$/), Validators.maxLength(20)]],
      email: ['', [Validators.email]],
      estado: ['Activo', Validators.required]
    });
  }

  cargarSede(id: number): void {
    this.sedeService.getSedeById(id).subscribe({
      next: (sede) => {
        this.latitud = sede.latitud || this.latitud;
        this.longitud = sede.longitud || this.longitud;

        this.sedeForm.patchValue({
          nombre: sede.nombre,
          ciudad: sede.ciudad,
          direccion: sede.direccion,
          telefono: sede.telefono,
          email: sede.email,
          estado: sede.estado
        });

        this.initMap();
      },
      error: (err) => {
        this.notificationService.notify({
          message: 'No se pudo cargar la sede',
          type: 'error'
        });
        this.router.navigate(['/admin/sedes']);
      }
    });
  }

  initMap(): void {
    // Destruir mapa anterior si existe
    if (this.map) {
      this.map.remove();
    }

    // Crear el mapa centrado en las coordenadas actuales
    this.map = L.map('map').setView([this.latitud, this.longitud], 15);

    // Agregar capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Crear icono personalizado para el marcador
    const customIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Agregar marcador arrastrable
    this.marker = L.marker([this.latitud, this.longitud], {
      icon: customIcon,
      draggable: true
    }).addTo(this.map);

    // Evento cuando se mueve el marcador
    this.marker.on('dragend', (event: any) => {
      const position = event.target.getLatLng();
      this.latitud = position.lat;
      this.longitud = position.lng;
      this.getDireccionDesdeCoordenadas(this.latitud, this.longitud);
    });

    // Evento click en el mapa para mover el marcador
    this.map.on('click', (event: any) => {
      const { lat, lng } = event.latlng;
      this.latitud = lat;
      this.longitud = lng;
      this.marker.setLatLng([lat, lng]);
      this.getDireccionDesdeCoordenadas(lat, lng);
    });

    // Obtener dirección inicial
    if (!this.isEditMode || !this.sedeForm.get('direccion')?.value) {
      this.getDireccionDesdeCoordenadas(this.latitud, this.longitud);
    }
  }

  private getDireccionDesdeCoordenadas(lat: number, lon: number): void {
    // Usar OpenStreetMap Nominatim para geocodificación inversa (gratis)
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

    fetch(url, {
      headers: {
        'User-Agent': 'OSC-Sports-App/1.0 (contact@oscsports.com)' // Nominatim requiere User-Agent
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.address) {
          const direccion = data.display_name;
          const ciudad = data.address.city || data.address.town || data.address.village || data.address.county || 'Machala';

          this.sedeForm.patchValue({
            direccion: direccion,
            ciudad: ciudad
          });
        }
      })
      .catch((error) => {
        // Fallback
        this.sedeForm.patchValue({
          direccion: `Coordenadas: ${lat.toFixed(6)}, ${lon.toFixed(6)}`,
          ciudad: 'Machala'
        });
      });
  }

  onSubmit(): void {
    if (this.sedeForm.invalid) {
      this.notificationService.notify({
        message: 'Por favor completa todos los campos requeridos correctamente',
        type: 'error'
      });
      Object.keys(this.sedeForm.controls).forEach(key => {
        const control = this.sedeForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isLoading = true;

    const sedeData: Sede = {
      nombre: this.sedeForm.get('nombre')?.value,
      direccion: this.sedeForm.get('direccion')?.value,
      ciudad: this.sedeForm.get('ciudad')?.value,
      telefono: this.sedeForm.get('telefono')?.value || undefined,
      email: this.sedeForm.get('email')?.value || undefined,
      estado: this.sedeForm.get('estado')?.value,
      latitud: this.latitud,
      longitud: this.longitud
    };

    this.notificationService.notify({
      message: this.isEditMode ? 'Actualizando sede...' : 'Creando sede...',
      type: 'loading'
    });

    const operation = this.isEditMode
      ? this.sedeService.updateSede(Number(this.route.snapshot.params['id']), sedeData)
      : this.sedeService.createSede(sedeData);

    operation.subscribe({
      next: () => {
        this.notificationService.notify({
          message: this.isEditMode ? 'Sede actualizada correctamente' : 'Sede creada correctamente',
          type: 'success'
        });

        setTimeout(() => {
          this.router.navigate(['/admin/sedes']);
        }, 1500);
      },
      error: (err) => {
        this.notificationService.notify({
          message: `Error al ${this.isEditMode ? 'actualizar' : 'crear'} la sede: ${err.error?.message || 'Error desconocido'}`,
          type: 'error'
        });
        this.isLoading = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/admin/sedes']);
  }

  ngOnDestroy(): void {
    // Limpiar el mapa al destruir el componente
    if (this.map) {
      this.map.remove();
    }
  }

  // Getters para validación en template
  get nombre() { return this.sedeForm.get('nombre')!; }
  get direccion() { return this.sedeForm.get('direccion')!; }
  get telefono() { return this.sedeForm.get('telefono')!; }
  get email() { return this.sedeForm.get('email')!; }

  getMapPlaceholder(): string {
    return `https://via.placeholder.com/800x400/2ECC71/FFFFFF?text=Mapa+Google+Maps+API+%7C+Lat:+${this.latitud.toFixed(4)}+Lng:+${this.longitud.toFixed(4)}`;
  }
}
