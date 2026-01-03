import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface Reserva {
  id_reserva?: number;
  id_cancha: number;
  id_usuario: string;
  fecha_reserva: string;      // 'YYYY-MM-DD'
  hora_inicio: string;        // 'HH:MM'
  duracion_minutos: number;
  monto_total: number;
  estado_pago: 'pendiente' | 'pagado' | 'cancelado' | 'reembolsado';
  token_acceso_qr?: string;
  tipo_pago: 'virtual' | 'efectivo' | 'transferencia';
  id_metodo_pago?: number;
  comprobante_url?: string;
  notas?: string;
  fecha_registro?: string;

  // Propiedades extendidas (de JOIN)
  nombre_cancha?: string;
  tipo_deporte?: string;
  tarifa_cancha?: number;
  capacidad?: number;
  id_sede?: number;
  nombre_usuario?: string;
  email_usuario?: string;
  telefono_usuario?: string;
  nombre_sede?: string;
  direccion_sede?: string;
  telefono_sede?: string;
  banco?: string;
  tipo_tarjeta?: string;
  numero_tarjeta_oculto?: string;
  hora_fin?: string;
}

export interface DisponibilidadResponse {
  disponible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private http = inject(HttpClient);
  private adminUrl = `${environment.apiUrl}/c/admin/reservas`;
  private clientUrl = `${environment.apiUrl}/c/client/reservas`;

  // ==================== MÉTODOS ADMIN ====================

  /**
   * Obtiene todas las reservas (sin información extendida)
   */
  getAllReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.adminUrl);
  }

  /**
   * Obtiene todas las reservas con información completa (JOIN con canchas, usuarios, métodos de pago)
   */
  getAllReservasComplete(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.adminUrl}/complete`);
  }

  /**
   * Obtiene una reserva por ID
   */
  getReservaById(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.adminUrl}/${id}`);
  }

  /**
   * Obtiene todas las reservas de un usuario específico
   */
  getReservasByUsuario(id_usuario: string): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.adminUrl}/user/${id_usuario}`);
  }

  /**
   * Obtiene todas las reservas de una cancha específica
   */
  getReservasByCancha(id_cancha: number): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.adminUrl}/cancha/${id_cancha}`);
  }

  /**
   * Crea una nueva reserva
   */
  createReserva(reserva: Reserva): Observable<Reserva> {
    return this.http.post<Reserva>(this.adminUrl, reserva);
  }

  /**
   * Actualiza una reserva existente (generalmente estado_pago)
   */
  updateReserva(id: number, reserva: Partial<Reserva>): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.adminUrl}/${id}`, reserva);
  }

  /**
   * Elimina una reserva
   */
  deleteReserva(id: number): Observable<any> {
    return this.http.delete(`${this.adminUrl}/${id}`);
  }

  /**
   * Verifica la disponibilidad de una cancha en fecha y hora específicas
   */
  verificarDisponibilidad(
    id_cancha: number,
    fecha_reserva: string,
    hora_inicio: string,
    duracion_minutos: number
  ): Observable<DisponibilidadResponse> {
    const params = {
      id_cancha: id_cancha.toString(),
      fecha_reserva,
      hora_inicio,
      duracion_minutos: duracion_minutos.toString()
    };
    return this.http.get<DisponibilidadResponse>(`${this.adminUrl}/disponibilidad`, { params });
  }

  // ==================== MÉTODOS CLIENT ====================

  /**
   * Obtiene las reservas del usuario autenticado
   */
  getMisReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.clientUrl);
  }

  /**
   * Crea una reserva como cliente
   */
  createReservaCliente(reserva: Reserva): Observable<Reserva> {
    return this.http.post<Reserva>(this.clientUrl, reserva);
  }

  /**
   * Actualiza una reserva del cliente (ej: cancelar)
   */
  updateReservaCliente(id: number, reserva: Partial<Reserva>): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.clientUrl}/${id}`, reserva);
  }

  // ==================== MÉTODOS AUXILIARES ====================

  /**
   * Calcula el monto total basado en la tarifa por hora y duración
   */
  calcularMontoTotal(tarifaPorHora: number, duracionMinutos: number): number {
    const horas = duracionMinutos / 60;
    return tarifaPorHora * horas;
  }

  /**
   * Convierte duración en horas a minutos
   */
  horasAMinutos(horas: number): number {
    return horas * 60;
  }

  /**
   * Formatea la hora de fin sumando la duración
   */
  calcularHoraFin(horaInicio: string, duracionMinutos: number): string {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const totalMinutos = horas * 60 + minutos + duracionMinutos;
    const nuevasHoras = Math.floor(totalMinutos / 60) % 24;
    const nuevosMinutos = totalMinutos % 60;
    return `${nuevasHoras.toString().padStart(2, '0')}:${nuevosMinutos.toString().padStart(2, '0')}`;
  }

  /**
   * Obtiene el texto del estado de pago
   */
  getEstadoPagoTexto(estado: string): string {
    const estados: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'pagado': 'Confirmada',
      'cancelado': 'Cancelada',
      'reembolsado': 'Reembolsada'
    };
    return estados[estado] || 'Desconocido';
  }

  /**
   * Obtiene la clase CSS según el estado
   */
  getEstadoPagoClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'pendiente': 'badge-warning',
      'pagado': 'badge-success',
      'cancelado': 'badge-danger',
      'reembolsado': 'badge-info'
    };
    return clases[estado] || 'badge-secondary';
  }

  /**
   * Obtiene el texto del tipo de pago
   */
  getTipoPagoTexto(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'virtual': 'Pago con Tarjeta',
      'efectivo': 'Pago en Efectivo',
      'transferencia': 'Transferencia Bancaria'
    };
    return tipos[tipo] || 'Otro';
  }
}
