import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Notification {
  id: string;
  subject: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  date: Date;
  read: boolean;
  expanded?: boolean;
}

@Component({
  selector: 'app-bandeja-notificaciones',
  imports: [CommonModule, FormsModule],
  templateUrl: './bandeja-notificaciones.html',
  styleUrl: './bandeja-notificaciones.css',
})
export class BandejaNotificaciones implements OnInit {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  filterType: string = 'all';
  searchQuery: string = '';

  ngOnInit(): void {
    this.loadNotifications();
    this.applyFilters();
  }

  loadNotifications(): void {
    this.notifications = [
      {
        id: '1',
        subject: 'Nueva reserva confirmada',
        description: 'Se ha confirmado una nueva reserva para la Cancha de Fútbol 5 el día 25 de noviembre a las 18:00 horas. El cliente Juan Pérez ha completado el pago exitosamente.',
        type: 'success',
        date: new Date(Date.now() - 1000 * 60 * 5),
        read: false,
        expanded: false
      },
      {
        id: '2',
        subject: 'Pago pendiente de verificación',
        description: 'El pago del pedido #ORD-2024-045 está pendiente de verificación. Monto: $150.00. Por favor, revisa el estado del pago en la plataforma de procesamiento.',
        type: 'warning',
        date: new Date(Date.now() - 1000 * 60 * 30),
        read: false,
        expanded: false
      },
      {
        id: '3',
        subject: 'Mantenimiento programado',
        description: 'Se realizará mantenimiento en la Cancha de Tenis #2 el próximo martes 26 de noviembre de 08:00 a 12:00. Durante este periodo, la cancha no estará disponible para reservas.',
        type: 'info',
        date: new Date(Date.now() - 1000 * 60 * 60 * 2),
        read: false,
        expanded: false
      },
      {
        id: '4',
        subject: 'Producto agotado - Acción requerida',
        description: 'El producto "Pelota de Fútbol Profesional" está agotado. Quedan 0 unidades en inventario. Se recomienda realizar un nuevo pedido a proveedores lo antes posible.',
        type: 'error',
        date: new Date(Date.now() - 1000 * 60 * 60 * 5),
        read: true,
        expanded: false
      },
      {
        id: '5',
        subject: 'Nuevo torneo registrado',
        description: 'Se ha registrado un nuevo torneo: "Copa de Verano 2025" con 16 equipos inscritos. El torneo comenzará el 5 de diciembre y finalizará el 20 de diciembre. Revisa el calendario de partidos.',
        type: 'success',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24),
        read: true,
        expanded: false
      },
      {
        id: '6',
        subject: 'Actualización del sistema',
        description: 'Nuevas funcionalidades disponibles en el sistema de gestión: Dashboard mejorado, reportes personalizables y sistema de notificaciones en tiempo real. Revisa el panel de novedades para más detalles.',
        type: 'info',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        read: true,
        expanded: false
      },
      {
        id: '7',
        subject: 'Cancelación de reserva',
        description: 'El cliente María García ha cancelado su reserva para la Cancha de Pádel #1 programada para hoy a las 16:00. Se ha procesado el reembolso automáticamente.',
        type: 'warning',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        read: true,
        expanded: false
      },
      {
        id: '8',
        subject: 'Facturación mensual generada',
        description: 'Se ha generado la facturación mensual correspondiente a octubre 2024. Total: $24,850.00. Puedes descargar el reporte completo desde el panel de reportes.',
        type: 'success',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        read: true,
        expanded: false
      }
    ];
  }

  applyFilters(): void {
    this.filteredNotifications = this.notifications.filter(notification => {
      const matchesType = this.filterType === 'all' ||
        (this.filterType === 'unread' && !notification.read) ||
        (this.filterType !== 'all' && this.filterType !== 'unread' && notification.type === this.filterType);

      const matchesSearch = !this.searchQuery ||
        notification.subject.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        notification.description.toLowerCase().includes(this.searchQuery.toLowerCase());

      return matchesType && matchesSearch;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  toggleNotification(notification: Notification): void {
    notification.expanded = !notification.expanded;
    if (notification.expanded && !notification.read) {
      notification.read = true;
    }
  }

  markAsRead(notification: Notification): void {
    notification.read = true;
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.applyFilters();
  }

  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();
    const index = this.notifications.findIndex(n => n.id === notification.id);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.applyFilters();
    }
  }

  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      info: 'info',
      success: 'check_circle',
      warning: 'warning',
      error: 'error'
    };
    return icons[type] || 'notifications';
  }

  getFormattedDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }
}
