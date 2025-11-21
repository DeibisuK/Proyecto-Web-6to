import { Component, OnInit, signal, afterNextRender, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TorneosAdminService, Torneo } from '../torneos.service';
import { NotificationService } from '@core/services/notification.service';
import { DeporteService } from '@shared/services/index';
import { Deporte } from '@shared/models/index';

@Component({
  selector: 'app-crear-torneo',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-torneo.html',
  styleUrl: './crear-torneo.css'
})
export class CrearTorneo implements OnInit {
  torneoForm: FormGroup;
  deportes: Deporte[] = [];
  esEdicion: boolean = false;
  idTorneo?: number;
  cargando: boolean = false;

  // Señales para dropdowns
  dropdownDeporteAbierto = signal<boolean>(false);
  dropdownTipoAbierto = signal<boolean>(false);
  dropdownEstadoAbierto = signal<boolean>(false);

  deporteSeleccionado = signal<string>('Selecciona un deporte');
  tipoSeleccionado = signal<string>('Grupo + Eliminatoria');
  estadoSeleccionado = signal<string>('Abierto');

  tiposTorneo = [
    { value: 'grupo-eliminatoria', label: 'Grupo + Eliminatoria' },
    { value: 'eliminatoria-directa', label: 'Eliminatoria Directa' },
    { value: 'todos-contra-todos', label: 'Todos contra Todos' },
    { value: 'liga', label: 'Liga' }
  ];

  estadosPosibles = [
    { value: 'abierto', label: 'Abierto' },
    { value: 'en_curso', label: 'En Curso' },
    { value: 'cerrado', label: 'Cerrado' },
    { value: 'finalizado', label: 'Finalizado' }
  ];

  constructor(
    private fb: FormBuilder,
    private torneosService: TorneosAdminService,
    private deporteService: DeporteService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private injector: Injector
  ) {
    this.torneoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      id_deporte: [null, Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      fecha_cierre_inscripcion: [''],
      max_equipos: [null, [Validators.min(2), Validators.max(128)]],
      tipo_torneo: ['grupo-eliminatoria', Validators.required],
      estado: ['abierto', Validators.required]
    });

    afterNextRender(() => {
      this.configurarCierreDropdowns();
    }, { injector: this.injector });
  }

  ngOnInit(): void {
    this.cargarDeportes();

    // Verificar si es edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.esEdicion = true;
        this.idTorneo = parseInt(params['id']);
        this.cargarTorneo();
      }
    });

    // Configurar fecha mínima (hoy)
    const hoy = new Date().toISOString().split('T')[0];
    this.torneoForm.patchValue({
      fecha_inicio: hoy
    });
  }

  cargarDeportes(): void {
    this.deporteService.getDeportes().subscribe({
      next: (data) => {
        this.deportes = data;
      },
      error: (err) => {
        this.notificationService.notify({
          message: 'Error al cargar los deportes',
          type: 'error'
        });
      }
    });
  }

  cargarTorneo(): void {
    if (!this.idTorneo) return;

    this.cargando = true;
    this.torneosService.obtenerTorneoPorId(this.idTorneo).subscribe({
      next: (response) => {
        if (response.success && !Array.isArray(response.data)) {
          const torneo = response.data;

          // Formatear fechas para el input
          this.torneoForm.patchValue({
            nombre: torneo.nombre,
            descripcion: torneo.descripcion || '',
            id_deporte: torneo.id_deporte,
            fecha_inicio: this.formatearFechaParaInput(torneo.fecha_inicio),
            fecha_fin: this.formatearFechaParaInput(torneo.fecha_fin),
            fecha_cierre_inscripcion: torneo.fecha_cierre_inscripcion
              ? this.formatearFechaParaInput(torneo.fecha_cierre_inscripcion)
              : '',
            max_equipos: torneo.max_equipos,
            tipo_torneo: torneo.tipo_torneo,
            estado: torneo.estado
          });

          // Actualizar labels de dropdowns
          const deporte = this.deportes.find(d => d.id_deporte === torneo.id_deporte);
          if (deporte) {
            this.deporteSeleccionado.set(deporte.nombre_deporte);
          }

          const tipo = this.tiposTorneo.find(t => t.value === torneo.tipo_torneo);
          if (tipo) {
            this.tipoSeleccionado.set(tipo.label);
          }

          const estado = this.estadosPosibles.find(e => e.value === torneo.estado);
          if (estado) {
            this.estadoSeleccionado.set(estado.label);
          }
        }
        this.cargando = false;
      },
      error: (err) => {
        this.notificationService.notify({
          message: 'Error al cargar el torneo',
          type: 'error'
        });
        this.cargando = false;
        this.volver();
      }
    });
  }

  formatearFechaParaInput(fecha: string): string {
    const date = new Date(fecha);
    return date.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.torneoForm.invalid) {
      this.marcarCamposComoTocados();
      this.notificationService.notify({
        message: 'Por favor completa todos los campos requeridos',
        type: 'error'
      });
      return;
    }

    // Validar fechas
    const fechaInicio = new Date(this.torneoForm.value.fecha_inicio);
    const fechaFin = new Date(this.torneoForm.value.fecha_fin);
    const fechaCierre = this.torneoForm.value.fecha_cierre_inscripcion
      ? new Date(this.torneoForm.value.fecha_cierre_inscripcion)
      : null;

    if (fechaFin <= fechaInicio) {
      this.notificationService.notify({
        message: 'La fecha de fin debe ser posterior a la fecha de inicio',
        type: 'error'
      });
      return;
    }

    if (fechaCierre && fechaCierre >= fechaInicio) {
      this.notificationService.notify({
        message: 'La fecha de cierre de inscripción debe ser anterior a la fecha de inicio',
        type: 'error'
      });
      return;
    }

    this.cargando = true;

    const torneoData = {
      ...this.torneoForm.value,
      max_equipos: this.torneoForm.value.max_equipos || null,
      fecha_cierre_inscripcion: this.torneoForm.value.fecha_cierre_inscripcion || null
    };

    const operacion = this.esEdicion && this.idTorneo
      ? this.torneosService.actualizarTorneo(this.idTorneo, torneoData)
      : this.torneosService.crearTorneo(torneoData);

    operacion.subscribe({
      next: (response) => {
        this.notificationService.notify({
          message: this.esEdicion
            ? 'Torneo actualizado exitosamente'
            : 'Torneo creado exitosamente',
          type: 'success'
        });
        this.cargando = false;
        this.volver();
      },
      error: (err) => {
        this.notificationService.notify({
          message: err.error?.message || 'Error al guardar el torneo',
          type: 'error'
        });
        this.cargando = false;
      }
    });
  }

  marcarCamposComoTocados(): void {
    Object.keys(this.torneoForm.controls).forEach(key => {
      this.torneoForm.get(key)?.markAsTouched();
    });
  }

  volver(): void {
    this.router.navigate(['/admin/torneos']);
  }

  get f() {
    return this.torneoForm.controls;
  }

  // Métodos para dropdowns
  toggleDropdownDeporte(): void {
    this.dropdownDeporteAbierto.set(!this.dropdownDeporteAbierto());
    if (this.dropdownDeporteAbierto()) {
      this.dropdownTipoAbierto.set(false);
      this.dropdownEstadoAbierto.set(false);
    }
  }

  seleccionarDeporte(deporte: Deporte): void {
    this.torneoForm.patchValue({ id_deporte: deporte.id_deporte });
    this.deporteSeleccionado.set(deporte.nombre_deporte);
    this.dropdownDeporteAbierto.set(false);
  }

  toggleDropdownTipo(): void {
    this.dropdownTipoAbierto.set(!this.dropdownTipoAbierto());
    if (this.dropdownTipoAbierto()) {
      this.dropdownDeporteAbierto.set(false);
      this.dropdownEstadoAbierto.set(false);
    }
  }

  seleccionarTipo(tipo: { value: string; label: string }): void {
    this.torneoForm.patchValue({ tipo_torneo: tipo.value });
    this.tipoSeleccionado.set(tipo.label);
    this.dropdownTipoAbierto.set(false);
  }

  toggleDropdownEstado(): void {
    this.dropdownEstadoAbierto.set(!this.dropdownEstadoAbierto());
    if (this.dropdownEstadoAbierto()) {
      this.dropdownDeporteAbierto.set(false);
      this.dropdownTipoAbierto.set(false);
    }
  }

  seleccionarEstado(estado: { value: string; label: string }): void {
    this.torneoForm.patchValue({ estado: estado.value });
    this.estadoSeleccionado.set(estado.label);
    this.dropdownEstadoAbierto.set(false);
  }

  configurarCierreDropdowns(): void {
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-deporte') &&
          !target.closest('.dropdown-tipo') &&
          !target.closest('.dropdown-estado')) {
        this.dropdownDeporteAbierto.set(false);
        this.dropdownTipoAbierto.set(false);
        this.dropdownEstadoAbierto.set(false);
      }
    });
  }
}
