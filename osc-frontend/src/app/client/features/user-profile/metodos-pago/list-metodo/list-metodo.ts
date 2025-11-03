import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MetodoPagoService } from '../../../../../core/services/metodo-pago.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { MetodoPago } from '../../../../shared/models/metodo-pago.model';
import { CrearMetodo } from '../crear-metodo/crear-metodo';

@Component({
  selector: 'app-list-metodo',
  imports: [CommonModule, RouterModule, CrearMetodo],
  templateUrl: './list-metodo.html',
  styleUrl: './list-metodo.css'
})
export class ListMetodo implements OnInit {
  private metodoPagoService = inject(MetodoPagoService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  cards: MetodoPago[] = [];
  totalCards: number = 0;
  isModalOpen: boolean = false;
  isLoading: boolean = false;

  ngOnInit() {
    this.loadCards();
  }

  loadCards() {
    const currentUser = this.authService.currentUser;

    if (!currentUser) {
      this.notificationService.error('Debes iniciar sesión para ver tus métodos de pago');
      return;
    }

    this.isLoading = true;

    this.metodoPagoService.getMetodosPagoByUser(currentUser.uid).subscribe({
      next: (metodos) => {
        this.cards = metodos;
        this.totalCards = metodos.length;
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar los métodos de pago');
        this.isLoading = false;
      }
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onCardAdded(metodo: MetodoPago) {
    this.loadCards(); // Recargar lista
    this.closeModal();
  }

  deleteCard(card: MetodoPago) {
    const currentUser = this.authService.currentUser;

    if (!currentUser) {
      this.notificationService.error('Debes iniciar sesión');
      return;
    }

    if (confirm(`¿Estás seguro de eliminar la tarjeta terminada en ${card.numero_tarjeta.slice(-4)}?`)) {
      this.metodoPagoService.deleteMetodoPago(card.id_metodo_pago, currentUser.uid).subscribe({
        next: () => {
          this.notificationService.success('Tarjeta eliminada correctamente');
          this.loadCards();
        },
        error: (error) => {
          this.notificationService.error('No se pudo eliminar la tarjeta');
        }
      });
    }
  }

  // Obtener icono del tipo de tarjeta
  getCardIcon(tipoTarjeta: string): string {
    const iconMap: { [key: string]: string } = {
      'Visa': 'fab fa-cc-visa',
      'Mastercard': 'fab fa-cc-mastercard',
      'American Express': 'fab fa-cc-amex',
      'Discover': 'fab fa-cc-discover',
      'Diners Club': 'fab fa-cc-diners-club',
      'JCB': 'fab fa-cc-jcb',
      'Tarjeta de Crédito': 'fas fa-credit-card',
      'Tarjeta Virtual': 'fas fa-mobile-alt',
      'Tarjeta Corporativa': 'fas fa-building',
      'Tarjeta de Débito': 'fas fa-university',
      'Tarjeta Prepago': 'fas fa-gift',
      'Tarjeta Bancaria': 'fas fa-landmark',
      'Tarjeta de Servicios': 'fas fa-tools',
      'Tarjeta de Comercio': 'fas fa-store',
      'Tarjeta de Pago': 'fas fa-money-bill-wave'
    };
    return iconMap[tipoTarjeta] || 'fas fa-credit-card';
  }

  // Obtener color del tipo de tarjeta
  getCardColor(tipoTarjeta: string): string {
    const colorMap: { [key: string]: string } = {
      'Visa': '#1a1f71',
      'Mastercard': '#eb001b',
      'American Express': '#006fcf',
      'Discover': '#ff6000',
      'Diners Club': '#0079be',
      'JCB': '#005998',
      'Tarjeta de Crédito': '#28a745',
      'Tarjeta Virtual': '#17a2b8',
      'Tarjeta Corporativa': '#6c757d',
      'Tarjeta de Débito': '#fd7e14',
      'Tarjeta Prepago': '#e83e8c',
      'Tarjeta Bancaria': '#007bff',
      'Tarjeta de Servicios': '#6f42c1',
      'Tarjeta de Comercio': '#20c997',
      'Tarjeta de Pago': '#666'
    };
    return colorMap[tipoTarjeta] || '#666';
  }

  // Formatear fecha de expiración
  formatExpiryDate(fecha: string): string {
    if (!fecha) return '';
    // Si viene en formato YYYY-MM-DD, convertir a MM/YY
    if (fecha.includes('-')) {
      const parts = fecha.split('-');
      const year = parts[0].slice(-2);
      const month = parts[1];
      return `${month}/${year}`;
    }
    return fecha;
  }
}

