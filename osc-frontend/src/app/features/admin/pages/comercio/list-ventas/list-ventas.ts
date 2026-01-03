import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PedidosService, Pedido, VentasStats } from '../../../../../shared/services/pedidos.service';

@Component({
  selector: 'app-list-ventas',
  imports: [CommonModule, FormsModule],
  templateUrl: './list-ventas.html',
  styleUrl: './list-ventas.css',
})
export class ListVentas implements OnInit {
  private pedidosService = inject(PedidosService);

  // Stats
  totalVentas: number = 0;
  ventasHoy: number = 0;
  ventasMes: number = 0;
  ventasCompletadas: number = 0;

  // Filters
  searchQuery: string = '';
  statusFilter: string = '';
  dateFilter: string = 'month';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Data
  ventas: Pedido[] = [];
  filteredVentas: Pedido[] = [];

  // Modal
  showDetailModal: boolean = false;
  selectedVenta: Pedido | null = null;

  ngOnInit(): void {
    this.loadVentas();
    this.loadStats();
  }

  // Data Loading
  loadVentas(): void {
    this.pedidosService.getAllPedidos().subscribe({
      next: (pedidos) => {
        // Solo mostrar pedidos entregados como ventas
        this.ventas = pedidos.filter(p => p.estado_pedido === 'Entregado');
        this.applyFilters();
      },
      error: (err) => console.error('Error al cargar ventas:', err)
    });
  }

  loadStats(): void {
    this.pedidosService.getVentasStats().subscribe({
      next: (stats) => {
        this.totalVentas = stats.completados;
        this.ventasHoy = stats.ventas_hoy;
        this.ventasMes = stats.ventas_mes;
        this.ventasCompletadas = stats.completados;
      },
      error: (err) => console.error('Error al cargar estadísticas:', err)
    });
  }

  // Filtering
  applyFilters(): void {
    this.filteredVentas = this.ventas.filter(venta => {
      const matchesSearch = !this.searchQuery ||
        venta.id_pedido.toString().includes(this.searchQuery) ||
        venta.nombre_usuario?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        venta.email_usuario?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        venta.uuid_factura.toLowerCase().includes(this.searchQuery.toLowerCase());

      return matchesSearch;
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.applyFilters();
  }

  // Pagination
  get totalPages(): number {
    return Math.ceil(this.filteredVentas.length / this.itemsPerPage);
  }

  get paginatedVentas(): Pedido[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredVentas.slice(start, end);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.itemsPerPage - 1, this.filteredVentas.length);
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  // Helpers
  getCustomerInitials(name: string | null | undefined): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  // Actions
  exportData(): void {
    console.log('Exporting ventas data...');
  }

  viewDetail(venta: Pedido): void {
    this.selectedVenta = venta;
    this.showDetailModal = true;
  }

  printInvoice(venta: Pedido): void {
    console.log('Printing invoice for:', venta.id_pedido);
    // Implementar impresión
  }

  closeModal(): void {
    this.showDetailModal = false;
    this.selectedVenta = null;
  }
}

