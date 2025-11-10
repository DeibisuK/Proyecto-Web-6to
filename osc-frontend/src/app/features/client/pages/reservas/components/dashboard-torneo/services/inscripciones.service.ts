import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../../../../environments/environment';
import {
  Inscripcion,
  CrearInscripcionDTO,
  ApiResponse
} from '../models/torneo.models';

@Injectable({
  providedIn: 'root'
})
export class InscripcionesService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/b/client`;

  /**
   * Obtiene todas las inscripciones del usuario autenticado
   */
  getInscripcionesUsuario(firebaseUid: string): Observable<Inscripcion[]> {
    return this.http.get<ApiResponse<Inscripcion[]>>(
      `${this.API_URL}/inscripciones/usuario/${firebaseUid}`
    ).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Crea una nueva inscripción a un torneo
   */
  crearInscripcion(datos: CrearInscripcionDTO): Observable<Inscripcion> {
    return this.http.post<ApiResponse<Inscripcion>>(
      `${this.API_URL}/inscripciones/crear`,
      datos
    ).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Cancela una inscripción existente
   */
  cancelarInscripcion(idInscripcion: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(
      `${this.API_URL}/inscripciones/${idInscripcion}`
    ).pipe(
      map(() => undefined)
    );
  }

  /**
   * Filtra inscripciones por estado
   */
  filtrarPorEstado(inscripciones: Inscripcion[], estado: 'activas' | 'pendientes' | 'finalizadas'): Inscripcion[] {
    switch (estado) {
      case 'activas':
        return inscripciones.filter(i =>
          i.aprobado === true &&
          (i.torneo_estado === 'abierto' || i.torneo_estado === 'en_curso')
        );
      case 'pendientes':
        return inscripciones.filter(i => i.aprobado === false);
      case 'finalizadas':
        return inscripciones.filter(i =>
          i.torneo_estado === 'finalizado' || i.torneo_estado === 'cerrado'
        );
      default:
        return inscripciones;
    }
  }

  /**
   * Obtiene el color del badge según el estado de la inscripción
   */
  getColorEstadoInscripcion(estado: string, aprobado: boolean): string {
    if (!aprobado) return 'warning';

    const colores: Record<string, string> = {
      'inscrito': 'success',
      'activo': 'success',
      'eliminado': 'danger',
      'cancelado': 'danger'
    };
    return colores[estado] || 'secondary';
  }

  /**
   * Obtiene el texto formateado del estado de inscripción
   */
  getTextoEstadoInscripcion(estado: string, aprobado: boolean): string {
    if (!aprobado) return 'Pendiente de Aprobación';

    const textos: Record<string, string> = {
      'inscrito': 'Inscrito',
      'activo': 'Activo',
      'eliminado': 'Eliminado',
      'cancelado': 'Cancelado'
    };
    return textos[estado] || estado;
  }

  /**
   * Calcula el progreso del torneo (% de partidos jugados)
   */
  calcularProgresoTorneo(inscripcion: Inscripcion): number {
    const total = inscripcion.partidos_jugados + inscripcion.partidos_pendientes;
    if (total === 0) return 0;
    return Math.round((inscripcion.partidos_jugados / total) * 100);
  }

  /**
   * Verifica si se puede cancelar una inscripción
   */
  puedeCancelar(inscripcion: Inscripcion): boolean {
    // No se puede cancelar si ya está cancelado/eliminado o el torneo ya comenzó/finalizó
    if (inscripcion.estado_inscripcion === 'cancelado' || inscripcion.estado_inscripcion === 'eliminado') return false;
    if (inscripcion.torneo_estado === 'en_curso' || inscripcion.torneo_estado === 'finalizado') return false;

    // Verificar si faltan al menos 24 horas para el inicio
    const fechaInicio = new Date(inscripcion.fecha_inicio);
    const ahora = new Date();
    const horasRestantes = (fechaInicio.getTime() - ahora.getTime()) / (1000 * 60 * 60);

    return horasRestantes >= 24;
  }

  /**
   * Formatea la fecha del próximo partido
   */
  formatearFechaProximoPartido(inscripcion: Inscripcion): string {
    if (!inscripcion.proximo_partido) return 'Sin partidos programados';

    const fecha = new Date(inscripcion.proximo_partido.fecha_hora_inicio);
    const opciones: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    };

    return fecha.toLocaleDateString('es-ES', opciones);
  }

  /**
   * Obtiene el ícono según el estado del torneo
   */
  getIconoEstadoTorneo(estado: string): string {
    const iconos: Record<string, string> = {
      'abierto': '📋',
      'en_curso': '⚽',
      'cerrado': '🔒',
      'finalizado': '🏆'
    };
    return iconos[estado] || '📅';
  }

  /**
   * Cuenta inscripciones por estado
   */
  contarPorEstado(inscripciones: Inscripcion[]): {
    activas: number;
    pendientes: number;
    finalizadas: number;
  } {
    return {
      activas: this.filtrarPorEstado(inscripciones, 'activas').length,
      pendientes: this.filtrarPorEstado(inscripciones, 'pendientes').length,
      finalizadas: this.filtrarPorEstado(inscripciones, 'finalizadas').length
    };
  }
}
