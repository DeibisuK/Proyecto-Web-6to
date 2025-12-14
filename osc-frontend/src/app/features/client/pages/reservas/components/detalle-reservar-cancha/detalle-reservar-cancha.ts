import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CanchaService } from '@shared/services/index';
import { SedeService } from '@shared/services/index';
import { Sedes } from '@shared/models/index';
import { Cancha } from '@shared/models/index';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import QRCode from 'qrcode';

@Component({
  selector: 'app-detalle-reservar-cancha',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './detalle-reservar-cancha.html',
  styleUrls: ['./detalle-reservar-cancha.css']
})
export class DetalleReservarCancha implements OnInit, AfterViewInit {

  @ViewChild('qrCanvas', { static: false }) qrCanvas!: ElementRef<HTMLCanvasElement>;

  cancha?: Cancha;
  sede?: Sedes;

  fechaSeleccionada: string = '';
  minDate: string = '';
  duracionSeleccionada: number = 1;
  duracionTexto: string = '1 Hora';
  dropdownDuracionAbierto: boolean = false;
  opcionesDuracion = [
    { valor: 1, texto: '1 Hora' },
    { valor: 1.5, texto: '1.5 Horas' },
    { valor: 2, texto: '2 Horas' },
    { valor: 3, texto: '3 Horas' }
  ];
  horariosDisponibles: { hora: string, reservado: boolean }[] = [];
  horarioSeleccionado: any = null;
  totalPagar: number = 0;

  constructor(
    private route: ActivatedRoute,
    private canchaService: CanchaService,
    private sedeService: SedeService
  ) {}

  ngOnInit(): void {
    // ✅ Establecer la fecha mínima (hoy)
    const hoy = new Date();
    this.minDate = hoy.toISOString().split('T')[0];

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarCancha(id);
    }

    // Cargar horarios de ejemplo (simulación temporal)
    this.horariosDisponibles = [
      { hora: '09:00', reservado: false },
      { hora: '10:00', reservado: false },
      { hora: '11:00', reservado: true },
      { hora: '12:00', reservado: false },
      { hora: '13:00', reservado: false },
      { hora: '14:00', reservado: true },
      { hora: '17:00', reservado: false },
      { hora: '18:00', reservado: false },
      { hora: '19:00', reservado: false },
      { hora: '20:00', reservado: false },
      { hora: '21:00', reservado: false },
    ];
  }

  ngAfterViewInit(): void {
    // Genera el QR después de que la vista se inicialice
    setTimeout(() => this.generarQR(), 100);
  }

  /** Carga los datos de la cancha por ID desde la API */
  cargarCancha(id: number): void {
    this.canchaService.getCanchaById(id).subscribe({
      next: (data) => {
        this.cancha = data;

        // Si la cancha tiene id_sede, cargamos su información
        if (data.id_sede) {
          this.cargarSede(data.id_sede);
        }
      },
      error: (err) => {
        console.error('❌ Error cargando cancha:', err);
      }
    });
  }

  /** Carga la información de la sede asociada a la cancha */
  cargarSede(idSede: number): void {
    this.sedeService.getSedeById(idSede).subscribe({
      next: (sedeData) => {
        this.sede = sedeData;
      },
      error: (err) => {
        console.error('❌ Error cargando sede:', err);
      }
    });
  }

  /** Selecciona un horario disponible */
  seleccionarHorario(horario: any): void {
    if (!horario.reservado) {
      this.horarioSeleccionado = horario;
      this.calcularTotal();
    }
  }

  /** Calcula el total a pagar según duración y tarifa */
  calcularTotal(): void {
    if (this.cancha) {
      this.totalPagar = this.cancha.tarifa * this.duracionSeleccionada;
    }
  }

  /** Toggle dropdown de duración */
  toggleDropdownDuracion(): void {
    this.dropdownDuracionAbierto = !this.dropdownDuracionAbierto;
  }

  /** Seleccionar duración del dropdown */
  seleccionarDuracion(opcion: { valor: number, texto: string }): void {
    this.duracionSeleccionada = opcion.valor;
    this.duracionTexto = opcion.texto;
    this.dropdownDuracionAbierto = false;
    this.calcularTotal();
  }

  /** Simula la confirmación de reserva */
  confirmarReserva(): void {
    if (!this.cancha || !this.horarioSeleccionado || !this.fechaSeleccionada) {
      alert('⚠ Por favor selecciona fecha y horario antes de confirmar.');
      return;
    }

    alert(`✅ Reserva confirmada para la cancha "${this.cancha.nombre_cancha}"
el día ${this.fechaSeleccionada} a las ${this.horarioSeleccionado.hora}.`);
  }

  /** Genera la URL para el código QR */
  getReservaQrUrl(): string {
    const canchaId = this.route.snapshot.paramMap.get('id');
    return `${window.location.origin}/client/tienda/reservar-cancha/${canchaId}`;
  }

  /** Genera el código QR en el canvas */
  async generarQR(): Promise<void> {
    if (!this.qrCanvas) return;

    try {
      const url = this.getReservaQrUrl();
      await QRCode.toCanvas(this.qrCanvas.nativeElement, url, {
        width: 220,
        margin: 2,
        color: {
          dark: '#2ECC71',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
    } catch (error) {
      console.error('Error al generar QR:', error);
    }
  }
}
