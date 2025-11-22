import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerInitials: string;
  type: 'reservation' | 'product';
  sport: string;
  date: Date;
  time: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  selected?: boolean;
}

interface Sale {
  id: string;
  orderId: string;
  customerName: string;
  customerInitials: string;
  paymentMethod: 'card' | 'paypal' | 'transfer' | 'cash';
  date: Date;
  subtotal: number;
  taxes: number;
  total: number;
}

@Component({
  selector: 'app-list-pedidos',
  imports: [CommonModule, FormsModule],
  templateUrl: './list-pedidos.html',
  styleUrl: './list-pedidos.css',
})
export class ListPedidos implements OnInit {
  // Tab Management
  activeTab: 'orders' | 'sales' = 'orders';

  // Stats
  todayOrders: number = 47;
  monthlySales: number = 24850;
  pendingOrders: number = 12;
  completedOrders: number = 892;

  // Filters
  searchQuery: string = '';
  statusFilter: string = '';
  sportFilter: string = '';
  dateFilter: string = 'month';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalOrders: number = 156;

  // Data
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  sales: Sale[] = [];
  filteredSales: Sale[] = [];

  // Sales Summary
  grossTotal: number = 28500;
  discounts: number = 1420;
  taxes: number = 3248;
  netTotal: number = 30328;

  // Modal
  showOrderModal: boolean = false;
  selectedOrder: Order | null = null;

  ngOnInit(): void {
    this.loadMockData();
    this.applyFilters();
  }

  // Tab Navigation
  setActiveTab(tab: 'orders' | 'sales'): void {
    this.activeTab = tab;
    this.resetFilters();
  }

  // Data Loading
  loadMockData(): void {
    this.orders = [
      {
        id: 'ORD-2024-001',
        customerName: 'María García',
        customerEmail: 'maria.garcia@email.com',
        customerInitials: 'MG',
        type: 'reservation',
        sport: 'Fútbol',
        date: new Date(),
        time: '18:00 - 19:00',
        total: 45.00,
        status: 'delivered'
      },
      {
        id: 'ORD-2024-002',
        customerName: 'Carlos López',
        customerEmail: 'carlos.lopez@email.com',
        customerInitials: 'CL',
        type: 'product',
        sport: 'Pádel',
        date: new Date(),
        time: '10:30',
        total: 128.50,
        status: 'pending'
      },
      {
        id: 'ORD-2024-003',
        customerName: 'Ana Martínez',
        customerEmail: 'ana.martinez@email.com',
        customerInitials: 'AM',
        type: 'reservation',
        sport: 'Tenis',
        date: new Date(),
        time: '09:00 - 10:00',
        total: 35.00,
        status: 'processing'
      },
      {
        id: 'ORD-2024-004',
        customerName: 'Pedro Ruiz',
        customerEmail: 'pedro.ruiz@email.com',
        customerInitials: 'PR',
        type: 'reservation',
        sport: 'Basketball',
        date: new Date(),
        time: '20:00 - 21:30',
        total: 60.00,
        status: 'delivered'
      },
      {
        id: 'ORD-2024-005',
        customerName: 'Laura Sánchez',
        customerEmail: 'laura.sanchez@email.com',
        customerInitials: 'LS',
        type: 'product',
        sport: 'Fútbol',
        date: new Date(),
        time: '14:20',
        total: 89.99,
        status: 'cancelled'
      }
    ];

    this.sales = [
      {
        id: 'VTA-2024-001',
        orderId: 'ORD-2024-001',
        customerName: 'María García',
        customerInitials: 'MG',
        paymentMethod: 'card',
        date: new Date(),
        subtotal: 45.00,
        taxes: 5.40,
        total: 50.40
      },
      {
        id: 'VTA-2024-002',
        orderId: 'ORD-2024-004',
        customerName: 'Pedro Ruiz',
        customerInitials: 'PR',
        paymentMethod: 'paypal',
        date: new Date(),
        subtotal: 60.00,
        taxes: 7.20,
        total: 67.20
      },
      {
        id: 'VTA-2024-003',
        orderId: 'ORD-2024-002',
        customerName: 'Carlos López',
        customerInitials: 'CL',
        paymentMethod: 'transfer',
        date: new Date(),
        subtotal: 128.50,
        taxes: 15.42,
        total: 143.92
      }
    ];
  }

  // Filtering
  applyFilters(): void {
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = !this.searchQuery ||
        order.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = !this.statusFilter || order.status === this.statusFilter;
      const matchesSport = !this.sportFilter || order.sport.toLowerCase() === this.sportFilter;
      return matchesSearch && matchesStatus && matchesSport;
    });

    this.filteredSales = this.sales;
  }

  onSearch(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.sportFilter = '';
    this.applyFilters();
  }

  // Pagination
  get totalPages(): number {
    return Math.ceil(this.totalOrders / this.itemsPerPage);
  }

  get pages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= Math.min(this.totalPages, 5); i++) {
      pages.push(i);
    }
    return pages;
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.itemsPerPage, this.totalOrders);
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
    this.filteredOrders.forEach(order => order.selected = checked);
  }

  // Status Labels
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      processing: 'En proceso',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  }

  getPaymentLabel(method: string): string {
    const labels: Record<string, string> = {
      card: 'Tarjeta',
      paypal: 'PayPal',
      transfer: 'Transferencia',
      cash: 'Efectivo'
    };
    return labels[method] || method;
  }

  // Actions
  exportData(): void {
    console.log('Exporting data...');
  }

  openNewOrderModal(): void {
    console.log('Opening new order modal...');
  }

  viewOrder(order: Order | string): void {
    if (typeof order === 'string') {
      this.selectedOrder = this.orders.find(o => o.id === order) || null;
    } else {
      this.selectedOrder = order;
    }
    this.showOrderModal = true;
  }

  editOrder(order: Order): void {
    console.log('Editing order:', order.id);
  }

  cancelOrder(order: Order): void {
    if (confirm(`¿Está seguro de cancelar el pedido ${order.id}?`)) {
      order.status = 'cancelled';
    }
  }

  viewInvoice(sale: Sale): void {
    console.log('Viewing invoice:', sale.id);
  }

  printInvoice(sale: Sale): void {
    console.log('Printing invoice:', sale.id);
  }

  closeModal(): void {
    this.showOrderModal = false;
    this.selectedOrder = null;
  }
}
