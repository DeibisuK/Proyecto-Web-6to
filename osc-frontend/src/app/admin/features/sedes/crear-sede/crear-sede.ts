import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Sede } from '../../../../core/models/sede.model';

@Component({
  selector: 'app-crear-sede',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-sede.html',
  styleUrl: './crear-sede.css'
})
export class CrearSede implements OnInit, AfterViewInit {
  sedeForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  latitud: number = -12.046374;
  longitud: number = -77.042793;
  
  estados: string[] = ['Activo', 'Mantenimiento', 'Inactivo'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
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
      telefono: ['', [Validators.pattern(/^[\d\s\-]+$/), Validators.maxLength(15)]],
      email: ['', [Validators.email]],
      estado: ['Activo', Validators.required]
    });
  }

  cargarSede(id: number): void {
    // Aquí iría la llamada al servicio
    // Por ahora, datos de ejemplo
    const sedeEjemplo: Sede = {
      id_sede: id,
      nombre: 'Sede Centro',
      direccion: 'Av. Principal 123, Centro Histórico',
      ciudad: 'Lima',
      telefono: '01-234-5678',
      email: 'centro@portsconnect.com',
      estado: 'Activo',
      latitud: -12.046374,
      longitud: -77.042793
    };

    this.latitud = sedeEjemplo.latitud!;
    this.longitud = sedeEjemplo.longitud!;

    this.sedeForm.patchValue({
      nombre: sedeEjemplo.nombre,
      ciudad: sedeEjemplo.ciudad,
      direccion: sedeEjemplo.direccion,
      telefono: sedeEjemplo.telefono,
      email: sedeEjemplo.email,
      estado: sedeEjemplo.estado
    });

    // Actualizar el mapa con las coordenadas cargadas
    this.initMap();
  }

  initMap(): void {
    // Aquí se inicializaría Google Maps
    // Por ahora solo simulamos el mapa con un placeholder
    console.log('Mapa inicializado en:', this.latitud, this.longitud);
    
    // Simular geocodificación inversa para obtener dirección y ciudad
    setTimeout(() => {
      if (!this.isEditMode || !this.sedeForm.get('direccion')?.value) {
        this.sedeForm.patchValue({
          direccion: `Calle Ejemplo ${Math.floor(Math.random() * 1000)}, Distrito`,
          ciudad: 'Machala'
        });
      }
    }, 500);
  }

  onSubmit(): void {
    if (this.sedeForm.invalid) {
      this.mostrarNotificacion('Por favor completa todos los campos requeridos', 'error');
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
      id_sede: 0,
      nombre: this.sedeForm.get('nombre')?.value,
      direccion: this.sedeForm.get('direccion')?.value,
      ciudad: this.sedeForm.get('ciudad')?.value,
      telefono: this.sedeForm.get('telefono')?.value || undefined,
      email: this.sedeForm.get('email')?.value || undefined,
      estado: this.sedeForm.get('estado')?.value,
      latitud: this.latitud,
      longitud: this.longitud
    };

    // Aquí iría la llamada al servicio
    setTimeout(() => {
      this.mostrarNotificacion(
        this.isEditMode ? 'Sede actualizada correctamente' : 'Sede creada correctamente',
        'success'
      );
      
      setTimeout(() => {
        this.router.navigate(['/admin/sedes']);
      }, 1500);
      
      this.isLoading = false;
    }, 1000);
  }

  cancelar(): void {
    this.router.navigate(['/admin/sedes']);
  }

  // Getters para validación en template
  get nombre() { return this.sedeForm.get('nombre')!; }
  get direccion() { return this.sedeForm.get('direccion')!; }
  get telefono() { return this.sedeForm.get('telefono')!; }
  get email() { return this.sedeForm.get('email')!; }

  getMapPlaceholder(): string {
    return `https://via.placeholder.com/800x400/2ECC71/FFFFFF?text=Mapa+Google+Maps+API+%7C+Lat:+${this.latitud.toFixed(4)}+Lng:+${this.longitud.toFixed(4)}`;
  }

  private mostrarNotificacion(message: string, type: 'success' | 'error'): void {
    window.dispatchEvent(
      new CustomEvent('showToast', {
        detail: { message, type }
      })
    );
  }
}
