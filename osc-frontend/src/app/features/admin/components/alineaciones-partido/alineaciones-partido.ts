import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlineacionesService } from '../../../../shared/services/alineaciones.service';
import { Alineacion, SustitucionRequest } from '../../../../shared/interfaces/match.interfaces';

@Component({
  selector: 'app-alineaciones-partido',
  imports: [CommonModule, FormsModule],
  templateUrl: './alineaciones-partido.html',
  styleUrl: './alineaciones-partido.css',
})
export class AlineacionesPartido implements OnInit {
  @Input() idPartido!: number;

  private alineacionesService = inject(AlineacionesService);

  alineaciones = signal<Alineacion[]>([]);
  cargando = signal<boolean>(false);
  equipoFiltro = signal<number | undefined>(undefined);

  // Modal de sustitución
  mostrarModalSustitucion = signal<boolean>(false);
  sustitucionData: SustitucionRequest = {
    id_partido: 0,
    id_equipo: 0,
    id_jugador_sale: 0,
    id_jugador_entra: 0,
    minuto: 0
  };

  ngOnInit(): void {
    this.sustitucionData.id_partido = this.idPartido;
    this.cargarAlineaciones();
  }

  cargarAlineaciones(): void {
    this.cargando.set(true);
    const idEquipo = this.equipoFiltro();

    this.alineacionesService.getAlineacionByPartido(this.idPartido, idEquipo).subscribe({
      next: (response) => {
        if (response.success) {
          this.alineaciones.set(response.data);
        }
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar alineaciones:', error);
        this.cargando.set(false);
      }
    });
  }

  get titulares(): Alineacion[] {
    return this.alineaciones().filter(a => a.es_titular && !a.minuto_salida);
  }

  get suplentes(): Alineacion[] {
    return this.alineaciones().filter(a => !a.es_titular || a.minuto_salida);
  }

  abrirModalSustitucion(idEquipo: number): void {
    this.sustitucionData.id_equipo = idEquipo;
    this.mostrarModalSustitucion.set(true);
  }

  cerrarModalSustitucion(): void {
    this.mostrarModalSustitucion.set(false);
    this.sustitucionData = {
      id_partido: this.idPartido,
      id_equipo: 0,
      id_jugador_sale: 0,
      id_jugador_entra: 0,
      minuto: 0
    };
  }

  registrarSustitucion(): void {
    if (!this.sustitucionData.id_jugador_sale || !this.sustitucionData.id_jugador_entra) {
      alert('Seleccione ambos jugadores');
      return;
    }

    this.cargando.set(true);
    this.alineacionesService.registrarSustitucion(this.sustitucionData).subscribe({
      next: (response) => {
        if (response.success) {
          this.cargarAlineaciones();
          this.cerrarModalSustitucion();
          alert('Sustitución registrada exitosamente');
        }
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al registrar sustitución:', error);
        alert('Error al registrar la sustitución');
        this.cargando.set(false);
      }
    });
  }

  getEquiposUnicos(): number[] {
    const equipos = new Set(this.alineaciones().map(a => a.id_equipo));
    return Array.from(equipos);
  }

  getJugadoresPorEquipo(idEquipo: number): Alineacion[] {
    return this.alineaciones().filter(a => a.id_equipo === idEquipo);
  }

  getNombreEquipo(idEquipo: number): string {
    const alineacion = this.alineaciones().find(a => a.id_equipo === idEquipo);
    return alineacion?.nombre_equipo || `Equipo ${idEquipo}`;
  }

  getTitularesPorEquipo(idEquipo: number): Alineacion[] {
    return this.alineaciones().filter(a =>
      a.id_equipo === idEquipo && a.es_titular && !a.minuto_salida
    );
  }

  getSuplentePorEquipo(idEquipo: number): Alineacion[] {
    return this.alineaciones().filter(a =>
      a.id_equipo === idEquipo && (!a.es_titular || a.minuto_salida)
    );
  }
}
