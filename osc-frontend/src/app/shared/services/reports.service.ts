import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

interface ReportRequest {
  category: string;
  option: string;
  filters: {
    year: number;
    month?: number;
  };
  format: 'pdf' | 'excel';
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/r/reports`;

  /**
   * Genera un reporte en formato PDF o Excel
   * @param request Datos del reporte a generar
   * @returns Observable con el blob del archivo
   */
  generateReport(request: ReportRequest): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/generate`, request, {
      responseType: 'blob'
    });
  }

  /**
   * Genera la factura en PDF de un pedido
   * @param idPedido ID del pedido
   * @param qrUrl URL para generar el código QR
   * @returns Observable con el blob del PDF
   */
  generarFacturaPedido(idPedido: number, qrUrl: string): Observable<Blob> {
    return this.http.post(
      `${this.apiUrl}/factura-pedido`,
      { id_pedido: idPedido, qr_url: qrUrl },
      { responseType: 'blob' }
    );
  }

  /**
   * Genera la factura en PDF de una reserva
   * @param idReserva ID de la reserva
   * @param qrUrl URL para generar el código QR
   * @returns Observable con el blob del PDF
   */
  generarFacturaReserva(idReserva: number, qrUrl: string): Observable<Blob> {
    return this.http.post(
      `${this.apiUrl}/factura-reserva`,
      { id_reserva: idReserva, qr_url: qrUrl },
      { responseType: 'blob' }
    );
  }
}
