import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PedidosService, Pedido, VentasStats } from '../../../../../shared/services/pedidos.service';

@Component({
  selector: 'app-list-pedidos',
  imports: [CommonModule, FormsModule],
  templateUrl: './list-pedidos.html',
  styleUrl: './list-pedidos.css',
})
export class ListPedidos implements OnInit {
  private pedidosService = inject(PedidosService);

  // Tab Management
  activeTab: 'orders' | 'sales' = 'orders';

  // Stats
  todayOrders: number = 0;
  todaySales: number = 0;
  monthlySales: number = 0;
  pendingOrders: number = 0;
  completedOrders: number = 0;

  // Filters
  searchQuery: string = '';
  statusFilter: string = '';
  dateFilter: string = 'month';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalOrders: number = 0;

  // Data
  orders: Pedido[] = [];
  filteredOrders: Pedido[] = [];

  // Sales Summary (calculado de orders)
  grossTotal: number = 0;
  discounts: number = 0;
  taxes: number = 0;
  netTotal: number = 0;

  // Modal
  showOrderModal: boolean = false;
  selectedOrder: Pedido | null = null;

  ngOnInit(): void {
    this.loadPedidos();
    this.loadStats();
  }

  // Tab Navigation
  setActiveTab(tab: 'orders' | 'sales'): void {
    this.activeTab = tab;
    this.resetFilters();
  }

  // Data Loading
  loadPedidos(): void {
    this.pedidosService.getAllPedidos().subscribe({
      next: (pedidos) => {
        this.orders = pedidos;
        this.totalOrders = pedidos.length;
        this.applyFilters();
        this.calculateSalesSummary();
      },
      error: (err) => console.error('Error al cargar pedidos:', err)
    });
  }

  loadStats(): void {
    this.pedidosService.getVentasStats().subscribe({
      next: (stats) => {
        this.todayOrders = stats.pedidos_hoy;
        this.todaySales = stats.ventas_hoy;
        this.monthlySales = stats.ventas_mes;
        this.pendingOrders = stats.pendientes;
        this.completedOrders = stats.completados;
      },
      error: (err) => console.error('Error al cargar estadísticas:', err)
    });
  }

  calculateSalesSummary(): void {
    const entregados = this.orders.filter(o => o.estado_pedido === 'Entregado');
    this.grossTotal = entregados.reduce((sum, o) => sum + Number(o.total), 0);
    this.taxes = this.grossTotal * 0.12; // Ejemplo: 12% IVA
    this.netTotal = this.grossTotal + this.taxes;
  }

  // Filtering
  applyFilters(): void {
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = !this.searchQuery ||
        order.id_pedido.toString().includes(this.searchQuery) ||
        order.nombre_usuario?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        order.email_usuario?.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesStatus = !this.statusFilter || order.estado_pedido.toLowerCase() === this.statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
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
    return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
  }

  get pages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= Math.min(this.totalPages, 5); i++) {
      pages.push(i);
    }
    return pages;
  }

  get paginatedOrders(): Pedido[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredOrders.slice(start, end);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.itemsPerPage - 1, this.filteredOrders.length);
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

  // Selection
  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.paginatedOrders.forEach((order: any) => order.selected = checked);
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

  // Status Labels
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pendiente': 'Pendiente',
      'procesando': 'En proceso',
      'enviado': 'Enviado',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado',
      'Pendiente': 'Pendiente',
      'Procesando': 'En proceso',
      'Enviado': 'Enviado',
      'Entregado': 'Entregado',
      'Cancelado': 'Cancelado'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const lower = status.toLowerCase();
    if (lower.includes('pendiente')) return 'pending';
    if (lower.includes('procesando') || lower.includes('proceso')) return 'processing';
    if (lower.includes('enviado')) return 'shipped';
    if (lower.includes('entregado') || lower.includes('completado')) return 'delivered';
    if (lower.includes('cancelado')) return 'cancelled';
    return 'pending';
  }

  // Actions
  exportData(): void {
    console.log('Exporting data...');
  }

  openNewOrderModal(): void {
    console.log('Opening new order modal...');
  }

  viewOrder(order: Pedido): void {
    this.selectedOrder = order;
    this.showOrderModal = true;
  }

  cancelOrder(order: Pedido): void {
    if (confirm(`¿Está seguro de cancelar el pedido #${order.id_pedido}?`)) {
      this.pedidosService.updatePedidoStatus(order.id_pedido, 'Cancelado').subscribe({
        next: () => {
          order.estado_pedido = 'Cancelado';
          this.loadStats(); // Actualizar estadísticas
        },
        error: (err) => console.error('Error al cancelar pedido:', err)
      });
    }
  }

  closeModal(): void {
    this.showOrderModal = false;
    this.selectedOrder = null;
  }
}
