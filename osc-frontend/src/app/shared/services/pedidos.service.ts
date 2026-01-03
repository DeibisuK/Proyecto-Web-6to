import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PedidoDetalle {
  id_detalle: number;
  id_variante: number;
  sku: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  nombre_producto: string;
  imagen_producto: string | null;
}

export interface Pedido {
  id_pedido: number;
  id_usuario: string;
  uuid_factura: string;
  total: number;
  estado_pedido: string;
  fecha_pedido: string;
  nombre_usuario: string;
  email_usuario: string;
  items: PedidoDetalle[];
  total_items: number;
  selected?: boolean;
}

export interface VentasStats {
  total_pedidos: number;
  pedidos_hoy: number;
  pendientes: number;
  completados: number;
  ventas_hoy: number;
  ventas_mes: number;
  ventas_totales: number;
}

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private http = inject(HttpClient);
  private buyServiceUrl = `${environment.apiGatewayUrl}/b`;

  // Admin: Obtener todos los pedidos
  getAllPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.buyServiceUrl}/admin/pedidos`);
  }

  // Admin: Obtener estadísticas de ventas
  getVentasStats(): Observable<VentasStats> {
    return this.http.get<VentasStats>(`${this.buyServiceUrl}/admin/ventas/stats`);
  }

  // Actualizar estado de pedido
  updatePedidoStatus(idPedido: number, estado: string): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.buyServiceUrl}/orders/${idPedido}/status`, {
      estado_pedido: estado
    });
  }
}
