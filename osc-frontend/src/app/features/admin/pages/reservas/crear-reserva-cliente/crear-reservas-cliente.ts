import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ReservaService, Reserva } from '@shared/services/reserva.service';
import { CanchaService } from '@shared/services/canchas.service';
import { NotificationService } from '@core/services/notification.service';
import { Cancha } from '@app/shared/models';

interface Usuario {
  uid: string;
  nombre?: string;
  email?: string;
}

interface MetodoPago {
  id_metodo_pago: number;
  tipo_tarjeta: string;
  banco: string;
  numero_tarjeta: string;
}

@Component({
  selector: 'app-crear-reservas-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './crear-reservas-cliente.html',
  styleUrl: './crear-reservas-cliente.css',
})
export class CrearReservasCliente implements OnInit {
  private fb = inject(FormBuilder);
  private reservaService = inject(ReservaService);
  private canchaService = inject(CanchaService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  // Señales
  canchas = signal<Cancha[]>([]);
  usuarios = signal<Usuario[]>([]);
  metodosPago = signal<MetodoPago[]>([]);
  horariosDisponibles = signal<string[]>([]);
  cargando = signal<boolean>(false);
  verificandoDisponibilidad = signal<boolean>(false);

  // Formulario
  reservaForm!: FormGroup;

  // Datos calculados
  montoTotal: number = 0;
  horaFin: string = '';
  canchaSeleccionada?: Cancha;

  // Opciones de duración
  opcionesDuracion = [
    { valor: 60, texto: '1 Hora' },
    { valor: 90, texto: '1.5 Horas' },
    { valor: 120, texto: '2 Horas' },
    { valor: 180, texto: '3 Horas' }
  ];

  // Fecha mínima (hoy)
  fechaMinima: string = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarCanchas();
    this.generarHorariosDisponibles();

    // Simular carga de usuarios (en producción debería venir del backend)
    this.usuarios.set([
      { uid: 'uid-test-1', nombre: 'Juan Pérez', email: 'juan@example.com' },
      { uid: 'uid-test-2', nombre: 'María García', email: 'maria@example.com' },
    ]);
  }

  /**
   * Inicializa el formulario reactivo
   */
  inicializarFormulario(): void {
    this.reservaForm = this.fb.group({
      id_cancha: ['', Validators.required],
      id_usuario: ['', Validators.required],
      fecha_reserva: [this.fechaMinima, Validators.required],
      hora_inicio: ['', Validators.required],
      duracion_minutos: [60, Validators.required],
      tipo_pago: ['efectivo', Validators.required],
      id_metodo_pago: [null],
      estado_pago: ['pendiente', Validators.required],
      notas: ['']
    });

    // Suscripciones a cambios
    this.reservaForm.get('id_cancha')?.valueChanges.subscribe(() => {
      this.onCanchaChange();
    });

    this.reservaForm.get('duracion_minutos')?.valueChanges.subscribe(() => {
      this.calcularMontoYHoraFin();
    });

    this.reservaForm.get('hora_inicio')?.valueChanges.subscribe(() => {
      this.calcularMontoYHoraFin();
      this.verificarDisponibilidadAutomatica();
    });

    this.reservaForm.get('fecha_reserva')?.valueChanges.subscribe(() => {
      this.verificarDisponibilidadAutomatica();
    });

    this.reservaForm.get('tipo_pago')?.valueChanges.subscribe((tipo) => {
      this.onTipoPagoChange(tipo);
    });
  }

  /**
   * Carga todas las canchas disponibles
   */
  cargarCanchas(): void {
    this.canchaService.getCanchas().subscribe({
      next: (data) => {
        this.canchas.set(data);
      },
      error: (err) => {
        console.error('Error al cargar canchas:', err);
        this.notificationService.error('Error al cargar las canchas');
      }
    });
  }

  /**
   * Maneja el cambio de cancha seleccionada
   */
  onCanchaChange(): void {
    const idCancha = this.reservaForm.get('id_cancha')?.value;
    if (idCancha) {
      this.canchaSeleccionada = this.canchas().find(c => c.id_cancha === parseInt(idCancha));
      this.calcularMontoYHoraFin();

      // Cargar métodos de pago del usuario si es necesario
      if (this.reservaForm.get('tipo_pago')?.value === 'virtual') {
        this.cargarMetodosPago();
      }
    }
  }

  /**
   * Maneja el cambio de tipo de pago
   */
  onTipoPagoChange(tipo: string): void {
    const metodoControl = this.reservaForm.get('id_metodo_pago');

    if (tipo === 'virtual') {
      metodoControl?.setValidators(Validators.required);
      this.cargarMetodosPago();
    } else {
      metodoControl?.clearValidators();
      metodoControl?.setValue(null);
    }

    metodoControl?.updateValueAndValidity();
  }

  /**
   * Carga los métodos de pago del usuario seleccionado
   */
  cargarMetodosPago(): void {
    // En producción esto debería cargar desde el backend
    // basándose en el id_usuario seleccionado
    this.metodosPago.set([
      { id_metodo_pago: 1, tipo_tarjeta: 'Visa', banco: 'Santander', numero_tarjeta: '****1234' },
      { id_metodo_pago: 2, tipo_tarjeta: 'Mastercard', banco: 'BBVA', numero_tarjeta: '****5678' },
    ]);
  }

  /**
   * Genera horarios disponibles (9:00 - 22:00 cada hora)
   */
  generarHorariosDisponibles(): void {
    const horarios: string[] = [];
    for (let hora = 9; hora <= 22; hora++) {
      horarios.push(`${hora.toString().padStart(2, '0')}:00`);
    }
    this.horariosDisponibles.set(horarios);
  }

  /**
   * Calcula el monto total y la hora de fin
   */
  calcularMontoYHoraFin(): void {
    if (!this.canchaSeleccionada) return;

    const duracion = this.reservaForm.get('duracion_minutos')?.value;
    const horaInicio = this.reservaForm.get('hora_inicio')?.value;

    // Calcular monto
    this.montoTotal = this.reservaService.calcularMontoTotal(
      this.canchaSeleccionada.tarifa,
      duracion
    );

    // Calcular hora fin
    if (horaInicio) {
      this.horaFin = this.reservaService.calcularHoraFin(horaInicio, duracion);
    }
  }

  /**
   * Verifica disponibilidad automáticamente al cambiar fecha/hora
   */
  verificarDisponibilidadAutomatica(): void {
    const form = this.reservaForm.value;

    if (form.id_cancha && form.fecha_reserva && form.hora_inicio && form.duracion_minutos) {
      this.verificarDisponibilidad();
    }
  }

  /**
   * Verifica si la cancha está disponible en el horario seleccionado
   */
  verificarDisponibilidad(): void {
    const form = this.reservaForm.value;

    if (!form.id_cancha || !form.fecha_reserva || !form.hora_inicio || !form.duracion_minutos) {
      this.notificationService.error('Completa todos los campos de reserva');
      return;
    }

    this.verificandoDisponibilidad.set(true);

    this.reservaService.verificarDisponibilidad(
      parseInt(form.id_cancha),
      form.fecha_reserva,
      form.hora_inicio,
      form.duracion_minutos
    ).subscribe({
      next: (response) => {
        this.verificandoDisponibilidad.set(false);

        if (response.disponible) {
          this.notificationService.success('✓ Horario disponible');
        } else {
          this.notificationService.error('✗ Horario no disponible. Selecciona otro.');
        }
      },
      error: (err) => {
        console.error('Error al verificar disponibilidad:', err);
        this.verificandoDisponibilidad.set(false);
        this.notificationService.error('Error al verificar disponibilidad');
      }
    });
  }

  /**
   * Crea la reserva
   */
  crearReserva(): void {
    if (this.reservaForm.invalid) {
      this.notificationService.error('Completa todos los campos requeridos');
      this.reservaForm.markAllAsTouched();
      return;
    }

    this.cargando.set(true);

    const reserva: Reserva = {
      ...this.reservaForm.value,
      id_cancha: parseInt(this.reservaForm.value.id_cancha),
      monto_total: this.montoTotal
    };

    this.reservaService.createReserva(reserva).subscribe({
      next: (response) => {
        this.cargando.set(false);
        this.notificationService.success('Reserva creada exitosamente');
        this.router.navigate(['/admin/reservas']);
      },
      error: (err) => {
        console.error('Error al crear reserva:', err);
        this.cargando.set(false);
        this.notificationService.error(err.error?.message || 'Error al crear la reserva');
      }
    });
  }

  /**
   * Cancela la creación y vuelve al listado
   */
  cancelar(): void {
    if (confirm('¿Descartar los cambios?')) {
      this.router.navigate(['/admin/reservas']);
    }
  }

  /**
   * Formatea moneda
   */
  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(monto);
  }
}
