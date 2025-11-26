import { Component, OnInit, signal, afterNextRender, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TorneosAdminService, Torneo } from '../torneos.service';
import { NotificationService } from '@core/services/notification.service';
import { DeporteService, SedeService } from '@shared/services/index';
import { Deporte, Sedes } from '@shared/models/index';

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
  dropdownSedeAbierto = signal<boolean>(false);

  deporteSeleccionado = signal<string>('Selecciona un deporte');
  tipoSeleccionado = signal<string>('Grupo + Eliminatoria');
  estadoSeleccionado = signal<string>('Abierto');
  sedeSeleccionada = signal<string>('Selecciona una sede');

  // Sedes desde la BD
  sedes: Sedes[] = [];

  // Días de la semana
  diasSemana = [
    { value: 'lunes', label: 'Lunes', checked: false },
    { value: 'martes', label: 'Martes', checked: false },
    { value: 'miercoles', label: 'Miércoles', checked: false },
    { value: 'jueves', label: 'Jueves', checked: false },
    { value: 'viernes', label: 'Viernes', checked: false },
    { value: 'sabado', label: 'Sábado', checked: false },
    { value: 'domingo', label: 'Domingo', checked: false }
  ];

  // Duraciones aproximadas por deporte (en horas)
  duracionesPorDeporte: { [key: string]: number } = {
    'Fútbol': 2,
    'Fútbol 7': 1.5,
    'Básquetbol': 2,
    'Vóleibol': 1.5,
    'Tenis': 2,
    'Pádel': 1.5,
    'default': 2
  };

  // Horarios de inicio disponibles (cada hora de 08:00 a 20:00)
  horariosInicio = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  horarioInicioSeleccionado: string = '18:00';
  horariosCalculados = signal<string[]>([]);
  fechaFinCalculada = signal<string>('');

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
    private sedeService: SedeService,
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
      fecha_fin: [''],
      fecha_cierre_inscripcion: [''],
      max_equipos: [4, [Validators.required, Validators.min(2), Validators.max(64)]],
      tipo_torneo: ['grupo-eliminatoria', Validators.required],
      estado: ['abierto', Validators.required],
      id_sede: [null, Validators.required],
      dias_juego: [[]],
      horario_inicio: ['18:00', Validators.required],
      partidos_por_dia: [3, [Validators.min(1), Validators.max(10)]],
      fecha_fin_calculada: [null]
    });

    afterNextRender(() => {
      this.configurarCierreDropdowns();
    }, { injector: this.injector });
  }

  ngOnInit(): void {
    this.cargarDeportes();
    this.cargarSedes();

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

    // Actualizar validador de partidos_por_dia cuando cambie max_equipos o tipo_torneo
    this.torneoForm.get('max_equipos')?.valueChanges.subscribe(() => {
      this.actualizarMaxPartidosPorDia();
    });
    this.torneoForm.get('tipo_torneo')?.valueChanges.subscribe(() => {
      this.actualizarMaxPartidosPorDia();
    });
  }

  getMaxPartidosPorDia(): number {
    const maxEquipos = this.torneoForm.get('max_equipos')?.value || 4;
    const tipoTorneo = this.torneoForm.get('tipo_torneo')?.value;

    let totalPartidos = 0;

    if (tipoTorneo === 'eliminatoria-directa') {
      totalPartidos = maxEquipos - 1; // n-1 partidos
    } else if (tipoTorneo === 'todos-contra-todos' || tipoTorneo === 'liga') {
      totalPartidos = (maxEquipos * (maxEquipos - 1)) / 2; // n(n-1)/2
    } else {
      // grupo-eliminatoria: estimación
      totalPartidos = Math.ceil(maxEquipos * 1.5);
    }

    // Máximo realista: total de partidos (no tiene sentido más)
    return Math.max(1, totalPartidos);
  }

  actualizarMaxPartidosPorDia(): void {
    const maxPermitido = this.getMaxPartidosPorDia();
    const partidosActual = this.torneoForm.get('partidos_por_dia')?.value || 3;

    // Si el valor actual excede el máximo, ajustarlo
    if (partidosActual > maxPermitido) {
      this.torneoForm.patchValue({ partidos_por_dia: Math.min(3, maxPermitido) });
    }

    // Actualizar validadores
    this.torneoForm.get('partidos_por_dia')?.setValidators([
      Validators.min(1),
      Validators.max(maxPermitido)
    ]);
    this.torneoForm.get('partidos_por_dia')?.updateValueAndValidity();

    this.calcularHorariosDisponibles();
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

  cargarSedes(): void {
    this.sedeService.getSedes().subscribe({
      next: (data) => {
        this.sedes = data;
      },
      error: (err) => {
        this.notificationService.notify({
          message: 'Error al cargar las sedes',
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
            fecha_fin: torneo.fecha_fin ? this.formatearFechaParaInput(torneo.fecha_fin) : '',
            fecha_cierre_inscripcion: torneo.fecha_cierre_inscripcion
              ? this.formatearFechaHoraParaInput(torneo.fecha_cierre_inscripcion)
              : '',
            max_equipos: torneo.max_equipos,
            tipo_torneo: torneo.tipo_torneo,
            estado: torneo.estado,
            id_sede: (torneo as any).id_sede || null,
            dias_juego: (torneo as any).dias_juego || [],
            horario_inicio: (torneo as any).horario_inicio || '18:00',
            partidos_por_dia: (torneo as any).partidos_por_dia || 3,
            fecha_fin_calculada: (torneo as any).fecha_fin_calculada || null
          });

          // Actualizar días de juego checkboxes
          if ((torneo as any).dias_juego && Array.isArray((torneo as any).dias_juego)) {
            this.diasSemana.forEach(dia => {
              dia.checked = (torneo as any).dias_juego.includes(dia.value);
            });
          }

          // Actualizar horario de inicio
          if ((torneo as any).horario_inicio) {
            this.horarioInicioSeleccionado = (torneo as any).horario_inicio;
          }

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

          const sede = this.sedes.find(s => s.id_sede === (torneo as any).id_sede);
          if (sede) {
            this.sedeSeleccionada.set(sede.nombre_sede);
          }

          // Calcular fecha fin si tiene los datos necesarios
          this.calcularFechaFin();
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
    const fechaCierre = this.torneoForm.value.fecha_cierre_inscripcion
      ? new Date(this.torneoForm.value.fecha_cierre_inscripcion)
      : null;

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
      fecha_fin: this.torneoForm.value.fecha_fin_calculada || this.torneoForm.value.fecha_inicio,
      max_equipos: this.torneoForm.value.max_equipos || null,
      fecha_cierre_inscripcion: this.torneoForm.value.fecha_cierre_inscripcion || null,
      horarios_disponibles: this.horariosCalculados() // Array calculado automáticamente
    };

    console.log('💾 [CREAR-TORNEO] Datos a enviar:', torneoData);

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
    this.calcularHorariosDisponibles();
    this.calcularFechaFin();
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
    this.calcularFechaFin();
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

  toggleDropdownSede(): void {
    this.dropdownSedeAbierto.set(!this.dropdownSedeAbierto());
    if (this.dropdownSedeAbierto()) {
      this.dropdownDeporteAbierto.set(false);
      this.dropdownTipoAbierto.set(false);
      this.dropdownEstadoAbierto.set(false);
    }
  }

  seleccionarSede(sede: Sedes): void {
    this.torneoForm.patchValue({ id_sede: sede.id_sede });
    this.sedeSeleccionada.set(sede.nombre_sede);
    this.dropdownSedeAbierto.set(false);
    this.calcularFechaFin();
  }

  toggleDiaJuego(dia: { value: string; label: string; checked: boolean }): void {
    dia.checked = !dia.checked;
    const diasSeleccionados = this.diasSemana.filter(d => d.checked).map(d => d.value);
    this.torneoForm.patchValue({ dias_juego: diasSeleccionados });
    this.calcularFechaFin();
  }

  seleccionarHorarioInicio(horario: string): void {
    this.horarioInicioSeleccionado = horario;
    this.torneoForm.patchValue({ horario_inicio: horario });
    this.calcularHorariosDisponibles();
    this.calcularFechaFin();
  }

  calcularHorariosDisponibles(): void {
    const deporteId = this.torneoForm.get('id_deporte')?.value;
    const deporteSeleccionadoObj = this.deportes.find(d => d.id_deporte === deporteId);
    const nombreDeporte = deporteSeleccionadoObj?.nombre_deporte || 'default';

    const duracion = this.duracionesPorDeporte[nombreDeporte] || this.duracionesPorDeporte['default'];
    const partidosPorDia = this.torneoForm.get('partidos_por_dia')?.value || 1;
    const horarioInicio = this.horarioInicioSeleccionado;

    if (!horarioInicio) {
      this.horariosCalculados.set([]);
      return;
    }

    const horarios: string[] = [];
    const [hora, minuto] = horarioInicio.split(':').map(Number);

    for (let i = 0; i < partidosPorDia; i++) {
      const horaPartido = hora + (i * duracion);
      const horaFormateada = String(Math.floor(horaPartido)).padStart(2, '0');
      const minutoFormateado = String(minuto).padStart(2, '0');
      horarios.push(`${horaFormateada}:${minutoFormateado}`);
    }

    this.horariosCalculados.set(horarios);
  }

  getDuracionDeporte(): number {
    const deporteId = this.torneoForm.get('id_deporte')?.value;
    const deporteObj = this.deportes.find(d => d.id_deporte === deporteId);
    const nombreDeporte = deporteObj?.nombre_deporte || 'default';
    return this.duracionesPorDeporte[nombreDeporte] || this.duracionesPorDeporte['default'];
  }

  calcularFechaFin(): void {
    const fechaInicio = this.torneoForm.get('fecha_inicio')?.value;
    const maxEquipos = this.torneoForm.get('max_equipos')?.value;
    const diasJuego = this.torneoForm.get('dias_juego')?.value || [];
    const partidosPorDia = this.torneoForm.get('partidos_por_dia')?.value || 3;

    if (!fechaInicio || !maxEquipos || diasJuego.length === 0 || partidosPorDia === 0) {
      this.fechaFinCalculada.set('');
      this.torneoForm.patchValue({ fecha_fin_calculada: null });
      return;
    }

    // Calcular total de partidos aproximado (depende del tipo de torneo)
    let totalPartidos = 0;
    const tipoTorneo = this.torneoForm.get('tipo_torneo')?.value;

    if (tipoTorneo === 'eliminatoria-directa') {
      totalPartidos = maxEquipos - 1; // n-1 partidos en eliminatoria directa
    } else if (tipoTorneo === 'todos-contra-todos' || tipoTorneo === 'liga') {
      totalPartidos = (maxEquipos * (maxEquipos - 1)) / 2; // n(n-1)/2
    } else {
      // grupo-eliminatoria: estimación (grupos + eliminatoria)
      totalPartidos = Math.ceil(maxEquipos * 1.5);
    }

    // Calcular días necesarios
    const diasNecesarios = Math.ceil(totalPartidos / (partidosPorDia * diasJuego.length));
    const semanasNecesarias = Math.ceil(diasNecesarios / diasJuego.length);

    // Calcular fecha fin
    const fecha = new Date(fechaInicio);
    fecha.setDate(fecha.getDate() + (semanasNecesarias * 7));

    const fechaFinStr = fecha.toISOString().split('T')[0];
    this.fechaFinCalculada.set(fechaFinStr);
    this.torneoForm.patchValue({ fecha_fin_calculada: fechaFinStr });
  }

  cambiarCantidadParticipantes(direccion: 'aumentar' | 'disminuir'): void {
    const indiceActual = this.potenciasEquipos.indexOf(this.cantidadParticipantes);

    if (direccion === 'aumentar' && indiceActual < this.potenciasEquipos.length - 1) {
      this.cantidadParticipantes = this.potenciasEquipos[indiceActual + 1];
      this.torneoForm.patchValue({ max_equipos: this.cantidadParticipantes });
      this.calcularHorariosDisponibles();
      this.calcularFechaFin();
    } else if (direccion === 'disminuir' && indiceActual > 0) {
      this.cantidadParticipantes = this.potenciasEquipos[indiceActual - 1];
      this.torneoForm.patchValue({ max_equipos: this.cantidadParticipantes });
      this.calcularHorariosDisponibles();
      this.calcularFechaFin();
    }
  }

  configurarCierreDropdowns(): void {
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-deporte') &&
          !target.closest('.dropdown-tipo') &&
          !target.closest('.dropdown-estado') &&
          !target.closest('.dropdown-sede')) {
        this.dropdownDeporteAbierto.set(false);
        this.dropdownTipoAbierto.set(false);
        this.dropdownEstadoAbierto.set(false);
        this.dropdownSedeAbierto.set(false);
      }
    });
  }
}
