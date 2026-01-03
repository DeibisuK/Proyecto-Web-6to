import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CanchaService } from '@shared/services/canchas.service';
import { NotificationService } from '@core/services/notification.service';
import { Cancha } from '@app/shared/models';

interface HorarioDisponible {
  id?: number;
  id_cancha: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  precio_hora: number;
  activo: boolean;
}

interface ConfiguracionCancha {
  cancha: Cancha;
  horarios: HorarioDisponible[];
  diasHabilitados: string[];
}

@Component({
  selector: 'app-configurar-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './configurar-horarios.html',
  styleUrl: './configurar-horarios.css',
})
export class ConfigurarHorarios implements OnInit {
  private fb = inject(FormBuilder);
  private canchaService = inject(CanchaService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  // Señales
  canchas = signal<Cancha[]>([]);
  canchaSeleccionada = signal<Cancha | null>(null);
  cargando = signal<boolean>(false);
  guardando = signal<boolean>(false);

  // Días de la semana
  diasSemana = [
    { valor: 'lunes', nombre: 'Lunes', icono: 'L' },
    { valor: 'martes', nombre: 'Martes', icono: 'M' },
    { valor: 'miercoles', nombre: 'Miércoles', icono: 'X' },
    { valor: 'jueves', nombre: 'Jueves', icono: 'J' },
    { valor: 'viernes', nombre: 'Viernes', icono: 'V' },
    { valor: 'sabado', nombre: 'Sábado', icono: 'S' },

  ];

  // Formulario
  configuracionForm!: FormGroup;

  // Horarios predefinidos
  horariosComunes = [
    { inicio: '09:00', fin: '22:00', label: 'Todo el día (9:00 - 22:00)' },
    { inicio: '09:00', fin: '13:00', label: 'Mañana (9:00 - 13:00)' },
    { inicio: '14:00', fin: '18:00', label: 'Tarde (14:00 - 18:00)' },
    { inicio: '18:00', fin: '22:00', label: 'Noche (18:00 - 22:00)' }
  ];

  // Plantilla seleccionada (para efecto visual)
  plantillaSeleccionada = signal<string | null>(null);

  ngOnInit(): void {
    console.log('🚀 ConfigurarHorarios - Iniciando componente');
    this.inicializarFormulario();
    console.log('✅ Formulario inicializado:', this.configuracionForm.value);
    this.cargarCanchas();
  }

  /**
   * Inicializa el formulario reactivo
   */
  inicializarFormulario(): void {
    this.configuracionForm = this.fb.group({
      id_cancha: ['', Validators.required],
      dias_habilitados: this.fb.array([]),
      horarios: this.fb.array([]),
      duracion_minima: [60, [Validators.required, Validators.min(15)]],
      cancelaciones_anticipadas: [24, [Validators.required, Validators.min(1)]]
    });
  }

  /**
   * Carga todas las canchas
   */
  cargarCanchas(): void {
    this.cargando.set(true);
    this.canchaService.getCanchas().subscribe({
      next: (data) => {
        this.canchas.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar canchas:', err);
        this.notificationService.error('Error al cargar las canchas');
        this.cargando.set(false);
      }
    });
  }

  /**
   * Cuando se selecciona una cancha
   */
  onCanchaChange(): void {
    const idCancha = this.configuracionForm.get('id_cancha')?.value;
    console.log('🔄 Cancha seleccionada:', idCancha);

    if (idCancha) {
      const cancha = this.canchas().find(c => c.id_cancha === parseInt(idCancha));
      this.canchaSeleccionada.set(cancha || null);

      if (cancha) {
        console.log('✅ Cancha encontrada:', cancha.nombre_cancha);
        // Cargar configuración existente si existe
        // TODO: Cargar desde backend
        this.inicializarDiasHabilitados();
      }
    } else {
      console.log('⚠️ No hay cancha seleccionada');
      this.canchaSeleccionada.set(null);
    }
  }

  /**
   * Inicializa días habilitados (todos por defecto)
   */
  inicializarDiasHabilitados(): void {
    const diasArray = this.configuracionForm.get('dias_habilitados') as FormArray;
    diasArray.clear();

    // Habilitar todos los días por defecto
    this.diasSemana.forEach(dia => {
      diasArray.push(this.fb.control(dia.valor));
    });
  }

  /**
   * Toggle día habilitado
   */
  toggleDia(dia: string): void {
    const diasArray = this.configuracionForm.get('dias_habilitados') as FormArray;
    const index = diasArray.value.indexOf(dia);

    if (index >= 0) {
      diasArray.removeAt(index);
    } else {
      diasArray.push(this.fb.control(dia));
    }
  }

  /**
   * Verifica si un día está habilitado
   */
  isDiaHabilitado(dia: string): boolean {
    const diasArray = this.configuracionForm.get('dias_habilitados') as FormArray;
    return diasArray.value.includes(dia);
  }

  /**
   * Agregar horario personalizado
   */
  agregarHorario(): void {
    const horariosArray = this.configuracionForm.get('horarios') as FormArray;
    console.log('📝 Agregando horario. Total actual:', horariosArray.length);
    horariosArray.push(this.fb.group({
      hora_inicio: ['09:00', Validators.required],
      hora_fin: ['22:00', Validators.required],
      activo: [true]
    }));
    console.log('✅ Horario agregado. Total ahora:', horariosArray.length);
  }

  /**
   * Aplicar plantilla rápida de horarios
   */
  aplicarPlantilla(tipo: 'mañana' | 'tarde' | 'noche' | 'completo'): void {
    // Marcar plantilla seleccionada
    this.plantillaSeleccionada.set(tipo);

    const horariosArray = this.configuracionForm.get('horarios') as FormArray;
    horariosArray.clear();

    const plantillas = {
      mañana: [
        { hora_inicio: '06:00', hora_fin: '07:00' },
        { hora_inicio: '07:00', hora_fin: '08:00' },
        { hora_inicio: '08:00', hora_fin: '09:00' },
        { hora_inicio: '09:00', hora_fin: '10:00' },
        { hora_inicio: '10:00', hora_fin: '11:00' },
        { hora_inicio: '11:00', hora_fin: '12:00' }
      ],
      tarde: [
        { hora_inicio: '12:00', hora_fin: '13:00' },
        { hora_inicio: '13:00', hora_fin: '14:00' },
        { hora_inicio: '14:00', hora_fin: '15:00' },
        { hora_inicio: '15:00', hora_fin: '16:00' },
        { hora_inicio: '16:00', hora_fin: '17:00' },
        { hora_inicio: '17:00', hora_fin: '18:00' }
      ],
      noche: [
        { hora_inicio: '18:00', hora_fin: '19:00' },
        { hora_inicio: '19:00', hora_fin: '20:00' },
        { hora_inicio: '20:00', hora_fin: '21:00' },
        { hora_inicio: '21:00', hora_fin: '22:00' },
        { hora_inicio: '22:00', hora_fin: '23:00' },
        { hora_inicio: '23:00', hora_fin: '00:00' }
      ],
      completo: [
        { hora_inicio: '06:00', hora_fin: '07:00' },
        { hora_inicio: '07:00', hora_fin: '08:00' },
        { hora_inicio: '08:00', hora_fin: '09:00' },
        { hora_inicio: '09:00', hora_fin: '10:00' },
        { hora_inicio: '10:00', hora_fin: '11:00' },
        { hora_inicio: '11:00', hora_fin: '12:00' },
        { hora_inicio: '12:00', hora_fin: '13:00' },
        { hora_inicio: '13:00', hora_fin: '14:00' },
        { hora_inicio: '14:00', hora_fin: '15:00' },
        { hora_inicio: '15:00', hora_fin: '16:00' },
        { hora_inicio: '16:00', hora_fin: '17:00' },
        { hora_inicio: '17:00', hora_fin: '18:00' },
        { hora_inicio: '18:00', hora_fin: '19:00' },
        { hora_inicio: '19:00', hora_fin: '20:00' },
        { hora_inicio: '20:00', hora_fin: '21:00' },
        { hora_inicio: '21:00', hora_fin: '22:00' },
        { hora_inicio: '22:00', hora_fin: '23:00' },
        { hora_inicio: '23:00', hora_fin: '00:00' }
      ]
    };

    plantillas[tipo].forEach(horario => {
      horariosArray.push(this.fb.group({
        hora_inicio: [horario.hora_inicio, Validators.required],
        hora_fin: [horario.hora_fin, Validators.required],
        activo: [true]
      }));
    });

    console.log(`✅ Plantilla "${tipo}" aplicada:`, horariosArray.length, 'horarios');
  }

  /**
   * Aplicar horario predefinido
   */
  aplicarHorarioPredefinido(horario: any): void {
    const horariosArray = this.configuracionForm.get('horarios') as FormArray;
    horariosArray.clear();

    horariosArray.push(this.fb.group({
      hora_inicio: [horario.inicio, Validators.required],
      hora_fin: [horario.fin, Validators.required],
      activo: [true]
    }));

    this.notificationService.success(`Horario aplicado: ${horario.label}`);
  }

  /**
   * Eliminar horario
   */
  eliminarHorario(index: number): void {
    const horariosArray = this.configuracionForm.get('horarios') as FormArray;
    horariosArray.removeAt(index);
  }

  /**
   * Obtener array de horarios
   */
  get horariosArray(): FormArray {
    return this.configuracionForm.get('horarios') as FormArray;
  }

  /**
   * Obtener cantidad de horarios de forma segura
   */
  getHorariosCount(): number {
    try {
      const horarios = this.configuracionForm.get('horarios') as FormArray;
      const count = horarios ? horarios.length : 0;
      console.log('🔢 Horarios count:', count);
      return count;
    } catch (error) {
      console.error('❌ Error obteniendo horarios count:', error);
      return 0;
    }
  }

  /**
   * Guardar configuración de horarios disponibles
   * IMPORTANTE: Esto NO crea reservas, solo configura los horarios disponibles de la cancha
   */
  guardarConfiguracion(): void {
    if (this.configuracionForm.invalid) {
      this.notificationService.error('Completa todos los campos requeridos');
      this.configuracionForm.markAllAsTouched();
      return;
    }


    const diasHabilitados = this.configuracionForm.get('dias_habilitados')?.value;
    if (diasHabilitados.length === 0) {
      this.notificationService.error('Debes habilitar al menos un día de la semana');
      return;
    }

    const horarios = this.configuracionForm.get('horarios')?.value;
    if (horarios.length === 0) {
      this.notificationService.error('Debes agregar al menos un horario disponible');
      return;
    }

    this.guardando.set(true);

    // Preparar datos para configurar horarios disponibles de la cancha
    const configuracionData = {
      id_cancha: this.configuracionForm.get('id_cancha')?.value,
      dias_habilitados: diasHabilitados,
      horarios: horarios,
      duracion_minima: this.configuracionForm.get('duracion_minima')?.value,
      cancelaciones_anticipadas: this.configuracionForm.get('cancelaciones_anticipadas')?.value
    };

    console.log('📤 Enviando configuración de horarios disponibles:', configuracionData);

    // Llamada REAL al backend
    const idCancha = configuracionData.id_cancha;
    this.canchaService.guardarHorariosDisponibles(idCancha, configuracionData).subscribe({
      next: (response) => {
        console.log('✅ Respuesta del servidor:', response);
        this.notificationService.success(`Horarios disponibles guardados: ${response.data.total_horarios} horarios insertados`);
        this.guardando.set(false);
        // Opcional: limpiar formulario o volver a la lista
        // this.router.navigate(['/admin/canchas']);
      },
      error: (error) => {
        console.error('❌ Error al guardar horarios disponibles:', error);
        this.notificationService.error(error.error?.message || 'Error al guardar los horarios disponibles');
        this.guardando.set(false);
      }
    });
  }

  /**
   * Vista previa de disponibilidad
   */
  generarVistaPrevia(): string {
    const diasHabilitados = this.configuracionForm.get('dias_habilitados')?.value || [];
    const horarios = this.configuracionForm.get('horarios')?.value || [];

    if (diasHabilitados.length === 0 || horarios.length === 0) {
      return 'Configura días y horarios para ver la vista previa';
    }

    const diasNombres = diasHabilitados.map((d: string) => {
      const dia = this.diasSemana.find(ds => ds.valor === d);
      return dia?.icono || '';
    }).join(' ');

    const horariosTexto = horarios.map((h: any) =>
      `${h.hora_inicio} - ${h.hora_fin}`
    ).join(', ');

    return `${diasNombres} | ${horariosTexto}`;
  }

  /**
   * Calcular slots totales por semana
   */
  calcularSlotsTotales(): number {
    const diasHabilitados = this.configuracionForm.get('dias_habilitados')?.value || [];
    const horarios = this.configuracionForm.get('horarios')?.value || [];

    if (diasHabilitados.length === 0 || horarios.length === 0) return 0;

    let totalMinutos = 0;
    horarios.forEach((h: any) => {
      const inicio = this.convertirHoraAMinutos(h.hora_inicio);
      const fin = this.convertirHoraAMinutos(h.hora_fin);
      totalMinutos += (fin - inicio);
    });

    // Asumiendo slots de 1 hora
    const slotsPorDia = totalMinutos / 60;
    return Math.floor(slotsPorDia * diasHabilitados.length);
  }

  /**
   * Convertir hora a minutos
   */
  convertirHoraAMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }

  /**
   * Formatear moneda
   */
  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(monto);
  }
}
