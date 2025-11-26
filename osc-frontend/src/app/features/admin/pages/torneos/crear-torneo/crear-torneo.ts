import { Component, OnInit, signal, afterNextRender, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TorneosAdminService, Torneo } from '../torneos.service';
import { NotificationService } from '@core/services/notification.service';
import { DeporteService } from '@shared/services/index';
import { Deporte } from '@shared/models/index';
import { UserApiService } from '@shared/services/user-api.service';
import { Usuario } from '@shared/models/usuario.model';

@Component({
  selector: 'app-crear-torneo',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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
  dropdownArbitroAbierto = signal<boolean>(false);

  deporteSeleccionado = signal<string>('Selecciona un deporte');
  tipoSeleccionado = signal<string>('Grupo + Eliminatoria');
  estadoSeleccionado = signal<string>('Abierto');
  arbitroSeleccionado = signal<string>('Sin asignar');

  // Árbitros desde la BD
  arbitros: Usuario[] = [];

  // Control de participantes
  cantidadParticipantes: number = 4;
  potenciasEquipos = [2, 4, 8, 16, 32, 64];

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
    private userApiService: UserApiService,
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
      max_equipos: [4, [Validators.required, Validators.min(2), Validators.max(64)]],
      tipo_torneo: ['grupo-eliminatoria', Validators.required],
      estado: ['abierto', Validators.required],
      id_arbitro: [null]
    });

    afterNextRender(() => {
      this.configurarCierreDropdowns();
    }, { injector: this.injector });
  }

  ngOnInit(): void {
    this.cargarDeportes();
    this.cargarArbitros();

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

  cargarArbitros(): void {
    console.log('🔍 [CREAR-TORNEO] Cargando árbitros...');
    this.userApiService.getAllUsersFromDB().subscribe({
      next: (usuarios) => {
        console.log('📋 [CREAR-TORNEO] Usuarios recibidos:', usuarios);
        console.log('📋 [CREAR-TORNEO] Primer usuario:', usuarios[0]);

        // Filtrar solo usuarios con rol "Arbitro" (id_rol = 3 o rol = 'Arbitro')
        this.arbitros = usuarios.filter(u => {
          const esArbitro = u.rol === 'Arbitro' || (u as any).id_rol === 3;
          if (esArbitro) {
            console.log('✅ [CREAR-TORNEO] Árbitro encontrado:', {
              id_usuario: u.id_usuario,
              nombre: u.nombre,
              apellido: (u as any).apellido,
              rol: u.rol,
              id_rol: (u as any).id_rol
            });
          }
          return esArbitro;
        });

        console.log(`✅ [CREAR-TORNEO] Total árbitros filtrados: ${this.arbitros.length}`);

        // Si estamos en modo edición y ya hay un árbitro asignado, actualizar el texto
        const idArbitroActual = this.torneoForm.get('id_arbitro')?.value;
        console.log('🔍 [CREAR-TORNEO] ID árbitro actual del form:', idArbitroActual);

        if (idArbitroActual) {
          const arbitro = this.arbitros.find(a => a.id_usuario === idArbitroActual);
          console.log('🔍 [CREAR-TORNEO] Árbitro encontrado para ID', idArbitroActual, ':', arbitro);

          if (arbitro) {
            const nombreCompleto = `${arbitro.nombre || ''} ${(arbitro as any).apellido || ''}`.trim() || 'Sin asignar';
            console.log('✅ [CREAR-TORNEO] Nombre árbitro seleccionado:', nombreCompleto);
            this.arbitroSeleccionado.set(nombreCompleto);
          }
        }
      },
      error: (err) => {
        console.error('❌ [CREAR-TORNEO] Error al cargar árbitros:', err);
        this.notificationService.notify({
          message: 'Error al cargar la lista de árbitros',
          type: 'error'
        });
      }
    });
  }  cargarTorneo(): void {
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
              ? this.formatearFechaHoraParaInput(torneo.fecha_cierre_inscripcion)
              : '',
            max_equipos: torneo.max_equipos,
            tipo_torneo: torneo.tipo_torneo,
            estado: torneo.estado,
            id_arbitro: torneo.id_arbitro || null
          });

          // Actualizar cantidad de participantes si es potencia de 2
          if (torneo.max_equipos && this.potenciasEquipos.includes(torneo.max_equipos)) {
            this.cantidadParticipantes = torneo.max_equipos;
          }

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

          // Actualizar árbitro si existe (se actualizará cuando cargarArbitros termine)
          // La actualización real se hace en cargarArbitros() después de cargar la lista
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

  formatearFechaHoraParaInput(fechaHora: string): string {
    const date = new Date(fechaHora);
    // Formato: yyyy-MM-ddThh:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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

    console.log('💾 [CREAR-TORNEO] Datos a enviar:', torneoData);
    console.log('💾 [CREAR-TORNEO] ID Árbitro a enviar:', torneoData.id_arbitro);

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

  toggleDropdownArbitro(): void {
    this.dropdownArbitroAbierto.set(!this.dropdownArbitroAbierto());
    if (this.dropdownArbitroAbierto()) {
      this.dropdownDeporteAbierto.set(false);
      this.dropdownTipoAbierto.set(false);
      this.dropdownEstadoAbierto.set(false);
    }
  }

  seleccionarArbitro(arbitro: Usuario | null): void {
    console.log('🎯 [CREAR-TORNEO] Árbitro seleccionado:', arbitro);

    if (arbitro) {
      console.log('📝 [CREAR-TORNEO] Asignando id_usuario al form:', arbitro.id_usuario);
      this.torneoForm.patchValue({ id_arbitro: arbitro.id_usuario });

      const nombre = (arbitro.nombre || '').trim();
      const apellido = ((arbitro as any).apellido || '').trim();
      const nombreCompleto = `${nombre} ${apellido}`.trim();

      console.log('📝 [CREAR-TORNEO] Nombre completo árbitro:', nombreCompleto);
      this.arbitroSeleccionado.set(nombreCompleto || 'Sin asignar');
    } else {
      console.log('📝 [CREAR-TORNEO] Quitando árbitro (null)');
      this.torneoForm.patchValue({ id_arbitro: null });
      this.arbitroSeleccionado.set('Sin asignar');
    }

    console.log('📝 [CREAR-TORNEO] Valor actual del form:', this.torneoForm.value);
    this.dropdownArbitroAbierto.set(false);
  }

  cambiarCantidadParticipantes(direccion: 'aumentar' | 'disminuir'): void {
    const indiceActual = this.potenciasEquipos.indexOf(this.cantidadParticipantes);

    if (direccion === 'aumentar' && indiceActual < this.potenciasEquipos.length - 1) {
      this.cantidadParticipantes = this.potenciasEquipos[indiceActual + 1];
      this.torneoForm.patchValue({ max_equipos: this.cantidadParticipantes });
    } else if (direccion === 'disminuir' && indiceActual > 0) {
      this.cantidadParticipantes = this.potenciasEquipos[indiceActual - 1];
      this.torneoForm.patchValue({ max_equipos: this.cantidadParticipantes });
    }
  }

  configurarCierreDropdowns(): void {
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-deporte') &&
          !target.closest('.dropdown-tipo') &&
          !target.closest('.dropdown-estado') &&
          !target.closest('.dropdown-arbitro')) {
        this.dropdownDeporteAbierto.set(false);
        this.dropdownTipoAbierto.set(false);
        this.dropdownEstadoAbierto.set(false);
        this.dropdownArbitroAbierto.set(false);
      }
    });
  }
}
