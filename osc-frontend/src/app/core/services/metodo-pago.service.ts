import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MetodoPago, MetodoPagoRequest, MetodoPagoResponse } from '../../client/shared/models/metodo-pago.model';

@Injectable({
  providedIn: 'root'
})
export class MetodoPagoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/metodos-pago'; // URL del user-service

  // Obtener todos los métodos de pago de un usuario
  getMetodosPagoByUser(firebase_uid: string): Observable<MetodoPago[]> {
    return this.http.get<MetodoPago[]>(`${this.apiUrl}/user/${firebase_uid}`);
  }

  // Obtener un método de pago por ID
  getMetodoPagoById(id: number, firebase_uid: string): Observable<MetodoPago> {
    return this.http.get<MetodoPago>(`${this.apiUrl}/${id}?firebase_uid=${firebase_uid}`);
  }

  // Crear un nuevo método de pago (se encripta en el backend)
  addMetodoPago(metodo: MetodoPagoRequest): Observable<MetodoPagoResponse> {
    return this.http.post<MetodoPagoResponse>(this.apiUrl, metodo);
  }

  // Actualizar un método de pago
  updateMetodoPago(id: number, metodo: MetodoPagoRequest): Observable<MetodoPagoResponse> {
    return this.http.put<MetodoPagoResponse>(`${this.apiUrl}/${id}`, metodo);
  }

  // Eliminar un método de pago
  deleteMetodoPago(id: number, firebase_uid: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}?firebase_uid=${firebase_uid}`);
  }

  // ========== UTILIDADES DEL FRONTEND ==========

  /**
   * Detecta el tipo de tarjeta basándose en el número
   * (Solo para UI, la detección real se hace en el backend)
   */
  detectarTipoTarjeta(numeroTarjeta: string): string {
    const numero = numeroTarjeta.replace(/\s/g, '');
    const primerosCuatro = numero.substring(0, 4);
    
    if (numero.startsWith('4')) {
      return 'Visa';
    } else if (numero.startsWith('5') || (numero.startsWith('2') && parseInt(primerosCuatro) >= 2221 && parseInt(primerosCuatro) <= 2720)) {
      return 'Mastercard';
    } else if (numero.startsWith('34') || numero.startsWith('37')) {
      return 'American Express';
    } else if (numero.startsWith('6011') || numero.startsWith('644') || numero.startsWith('645') || numero.startsWith('646') || numero.startsWith('647') || numero.startsWith('648') || numero.startsWith('649') || numero.startsWith('65')) {
      return 'Discover';
    } else if (numero.startsWith('30') || numero.startsWith('36') || numero.startsWith('38')) {
      return 'Diners Club';
    } else if (numero.startsWith('35')) {
      return 'JCB';
    } else if (numero.startsWith('1')) {
      return 'Tarjeta de Crédito';
    } else if (numero.startsWith('9')) {
      return 'Tarjeta Virtual';
    } else if (numero.startsWith('8')) {
      return 'Tarjeta Corporativa';
    } else if (numero.startsWith('7')) {
      return 'Tarjeta de Débito';
    } else if (numero.startsWith('0')) {
      return 'Tarjeta Prepago';
    } else {
      const primerDigito = numero.charAt(0);
      switch (primerDigito) {
        case '2':
          return 'Tarjeta Bancaria';
        case '3':
          return 'Tarjeta de Servicios';
        case '6':
          return 'Tarjeta de Comercio';
        default:
          return 'Tarjeta de Pago';
      }
    }
  }

  /**
   * Valida el formato del número de tarjeta (13-19 dígitos)
   */
  validarNumeroTarjeta(numeroTarjeta: string): boolean {
    const numero = numeroTarjeta.replace(/\s/g, '');
    return /^\d{13,19}$/.test(numero);
  }

  /**
   * Valida el formato del CVV (3-4 dígitos)
   */
  validarCVV(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv);
  }

  /**
   * Formatea el número de tarjeta con espacios cada 4 dígitos
   */
  formatearNumeroTarjeta(numeroTarjeta: string): string {
    const numero = numeroTarjeta.replace(/\s/g, '');
    return numero.replace(/(\d{4})/g, '$1 ').trim();
  }

  /**
   * Enmascara el número de tarjeta mostrando solo los últimos 4 dígitos
   */
  enmascararNumeroTarjeta(numeroTarjeta: string): string {
    const numero = numeroTarjeta.replace(/\s/g, '');
    if (numero.length >= 4) {
      return `****${numero.slice(-4)}`;
    }
    return '****';
  }
}
