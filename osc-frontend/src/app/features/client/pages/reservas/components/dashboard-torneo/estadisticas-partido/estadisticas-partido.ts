import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PartidosService } from '../services/partidos.service';
import { DetallePartido, EventoPartido } from '../models/torneo.models';

interface Goleador {
  jugador_nombre: string;
  minuto: number;
  tipo: string; // 'gol' o 'autogol'
}

interface EstadisticasEquipo {
  nombre: string;
  logo?: string;
  goles: number;
  faltas: number;
  goleadores: Goleador[];
  superioridad: number;
}

interface MVP {
  jugador_nombre: string;
  goles: number;
  asistencias: number;
  puntuacion: number;
}

@Component({
  selector: 'app-estadisticas-partido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas-partido.html',
  styleUrls: ['./estadisticas-partido.css', '../shared-styles.css']
})
export class EstadisticasPartidoComponent implements OnInit {
  partidosService = inject(PartidosService); // Public for template access
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  partido: DetallePartido | null = null;
  isLoading: boolean = true;
  error: string | null = null;

  // Estadísticas calculadas
  equipoLocal: EstadisticasEquipo | null = null;
  equipoVisitante: EstadisticasEquipo | null = null;
  mvp: MVP | null = null;
  timeline: any[] = [];

  ngOnInit(): void {
    const idPartido = this.route.snapshot.paramMap.get('id');
    if (!idPartido || isNaN(parseInt(idPartido))) {
      this.error = 'ID de partido inválido';
      this.isLoading = false;
      return;
    }

    this.cargarDetallePartido(parseInt(idPartido));
  }

  cargarDetallePartido(idPartido: number): void {
    this.isLoading = true;
    this.error = null;

    this.partidosService.getDetallePartido(idPartido).subscribe({
      next: (detalle) => {
        this.partido = detalle;
        this.procesarEstadisticas();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar detalle del partido:', error);
        this.error = 'Error al cargar información del partido';
        this.isLoading = false;
      }
    });
  }

  procesarEstadisticas(): void {
    if (!this.partido) return;

    const eventos = this.partido.eventos || [];

    // Procesar estadísticas del equipo local
    this.equipoLocal = {
      nombre: this.partido.partido.equipo_local_nombre,
      logo: this.partido.partido.equipo_local_logo,
      goles: this.partido.partido.goles_local || 0,
      faltas: this.contarFaltas(eventos, this.partido.partido.equipo_local_id),
      goleadores: this.obtenerGoleadores(eventos, this.partido.partido.equipo_local_id),
      superioridad: this.calcularSuperioridad(
        this.partido.partido.goles_local || 0,
        this.partido.partido.goles_visitante || 0
      )
    };

    // Procesar estadísticas del equipo visitante
    this.equipoVisitante = {
      nombre: this.partido.partido.equipo_visitante_nombre,
      logo: this.partido.partido.equipo_visitante_logo,
      goles: this.partido.partido.goles_visitante || 0,
      faltas: this.contarFaltas(eventos, this.partido.partido.equipo_visitante_id),
      goleadores: this.obtenerGoleadores(eventos, this.partido.partido.equipo_visitante_id),
      superioridad: this.calcularSuperioridad(
        this.partido.partido.goles_visitante || 0,
        this.partido.partido.goles_local || 0
      )
    };

    // Calcular MVP
    this.calcularMVP();

    // Crear timeline de eventos
    this.crearTimeline();
  }

  contarFaltas(eventos: EventoPartido[], idEquipo: number): number {
    if (!eventos || eventos.length === 0) return 0;
    return eventos.filter(e =>
      (e.tipo_evento === 'tarjeta_amarilla' || e.tipo_evento === 'tarjeta_roja') &&
      e.id_equipo === idEquipo
    ).length;
  }

  obtenerGoleadores(eventos: EventoPartido[], idEquipo: number): Goleador[] {
    if (!eventos || eventos.length === 0) return [];

    return eventos
      .filter(e => e.tipo_evento === 'gol' && e.id_equipo === idEquipo)
      .map(e => ({
        jugador_nombre: e.jugador_nombre || 'Desconocido',
        minuto: e.minuto || 0,
        tipo: 'gol'
      }))
      .sort((a, b) => a.minuto - b.minuto);
  }

  calcularSuperioridad(golesEquipo: number, golesRival: number): number {
    const totalGoles = golesEquipo + golesRival;
    if (totalGoles === 0) return 50;
    return Math.round((golesEquipo / totalGoles) * 100);
  }

  calcularMVP(): void {
    if (!this.partido || !this.partido.eventos || this.partido.eventos.length === 0) {
      this.mvp = null;
      return;
    }

    const eventos = this.partido.eventos;
    const jugadores: Map<string, { goles: number; asistencias: number }> = new Map();

    eventos.forEach((e: EventoPartido) => {
      const nombre = e.jugador_nombre || 'Desconocido';
      if (!jugadores.has(nombre)) {
        jugadores.set(nombre, { goles: 0, asistencias: 0 });
      }

      const stats = jugadores.get(nombre)!;
      if (e.tipo_evento === 'gol') {
        stats.goles++;
      }
      // Note: 'asistencia' no está en EventoPartido type, pero lo manejamos por si acaso
    });

    // Calcular puntuación MVP: goles * 3 + asistencias * 2
    let mejorJugador: MVP | null = null;
    let mejorPuntuacion = 0;

    jugadores.forEach((stats, nombre) => {
      const puntuacion = (stats.goles * 3) + (stats.asistencias * 2);
      if (puntuacion > mejorPuntuacion) {
        mejorPuntuacion = puntuacion;
        mejorJugador = {
          jugador_nombre: nombre,
          goles: stats.goles,
          asistencias: stats.asistencias,
          puntuacion: puntuacion
        };
      }
    });

    this.mvp = mejorJugador;
  }

  crearTimeline(): void {
    if (!this.partido || !this.partido.eventos) {
      this.timeline = [];
      return;
    }

    this.timeline = this.partido.eventos
      .map((e: EventoPartido) => ({
        ...e,
        minuto: e.minuto || 0,
        jugador_nombre: e.jugador_nombre || 'Desconocido'
      }))
      .sort((a: any, b: any) => a.minuto - b.minuto);
  }

  getIconoEvento(tipoEvento: string): string {
    switch (tipoEvento) {
      case 'gol':
        return '⚽';
      case 'autogol':
        return '🚫';
      case 'falta':
        return '⚠️';
      case 'tarjeta_amarilla':
        return '🟨';
      case 'tarjeta_roja':
        return '🟥';
      case 'asistencia':
        return '🎯';
      default:
        return '📝';
    }
  }

  getColorEvento(tipoEvento: string): string {
    switch (tipoEvento) {
      case 'gol':
        return '#22c55e';
      case 'autogol':
        return '#ef4444';
      case 'falta':
        return '#f59e0b';
      case 'tarjeta_amarilla':
        return '#eab308';
      case 'tarjeta_roja':
        return '#dc2626';
      case 'asistencia':
        return '#3b82f6';
      default:
        return '#9ca3af';
    }
  }

  getTiempoTranscurrido(): number {
    if (!this.partido) return 0;
    const totalMinutos = 90; // Partido completo
    return this.partido.partido.estado_partido === 'finalizado' ? 100 : 0;
  }

  goBack(): void {
    this.router.navigate(['../torneos'], { relativeTo: this.route });
  }
}
