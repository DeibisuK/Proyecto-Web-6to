import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CanchaService } from '../../../../../core/services/canchas.service';
import { SedeService } from '../../../../../core/services/sede.service';
import { Sede } from '../../../../../core/models/sede.model';
import { Cancha } from '../../../../../core/models/canchas.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-detalle-reservar-cancha',
  imports:[CommonModule, FormsModule],
  templateUrl: './detalle-reservar-cancha.html',
  styleUrls: ['./detalle-reservar-cancha.css']
})
export class DetalleReservarCancha implements OnInit {

  cancha?: Cancha;
  sede?: Sede;

  fechaSeleccionada: string = '';
  duracionSeleccionada: number = 1;
  horariosDisponibles: { hora: string, reservado: boolean }[] = [];
  horarioSeleccionado: any = null;
  totalPagar: number = 0;

  constructor(
    private route: ActivatedRoute,
    private canchaService: CanchaService,
    private sedeService: SedeService
  ) {}

  ngOnInit(): void {
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

  /** Simula la confirmación de reserva */
  confirmarReserva(): void {
    if (!this.cancha || !this.horarioSeleccionado || !this.fechaSeleccionada) {
      alert('⚠️ Por favor selecciona fecha y horario antes de confirmar.');
      return;
    }

    alert(`✅ Reserva confirmada para la cancha "${this.cancha.nombre_cancha}" 
el día ${this.fechaSeleccionada} a las ${this.horarioSeleccionado.hora}.`);
  }
}
