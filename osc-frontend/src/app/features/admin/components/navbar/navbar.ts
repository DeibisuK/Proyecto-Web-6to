import { Component, Output, EventEmitter, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Notification {
  id: string;
  subject: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  date: Date;
  read: boolean;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  @Output() sidebarToggled = new EventEmitter<boolean>();
  isCollapsed = false;
  showNotifications = false;

  notifications: Notification[] = [
    {
      id: '1',
      subject: 'Nueva reserva confirmada',
      description: 'Se ha confirmado una nueva reserva para la Cancha de Fútbol 5 el día 25 de noviembre a las 18:00 horas.',
      type: 'success',
      date: new Date(Date.now() - 1000 * 60 * 5),
      read: false
    },
    {
      id: '2',
      subject: 'Pago pendiente de verificación',
      description: 'El pago del pedido #ORD-2024-045 está pendiente de verificación. Monto: $150.00',
      type: 'warning',
      date: new Date(Date.now() - 1000 * 60 * 30),
      read: false
    },
    {
      id: '3',
      subject: 'Mantenimiento programado',
      description: 'Se realizará mantenimiento en la Cancha de Tenis #2 el próximo martes 26 de noviembre de 08:00 a 12:00.',
      type: 'info',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false
    },
    {
      id: '4',
      subject: 'Producto agotado',
      description: 'El producto "Pelota de Fútbol Profesional" está agotado. Quedan 0 unidades en inventario.',
      type: 'error',
      date: new Date(Date.now() - 1000 * 60 * 60 * 5),
      read: true
    },
    {
      id: '5',
      subject: 'Nuevo torneo registrado',
      description: 'Se ha registrado un nuevo torneo: "Copa de Verano 2025" con 16 equipos inscritos.',
      type: 'success',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true
    },
    {
      id: '6',
      subject: 'Actualización del sistema',
      description: 'Nuevas funcionalidades disponibles en el sistema de gestión. Revisa el panel de novedades.',
      type: 'info',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      read: true
    }
  ];

  constructor() { }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notifications-wrapper')) {
      this.showNotifications = false;
    }
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.sidebarToggled.emit(this.isCollapsed);
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  markAsRead(notification: Notification): void {
    notification.read = true;
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
  }

  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      info: 'fa-info-circle',
      success: 'fa-check-circle',
      warning: 'fa-exclamation-triangle',
      error: 'fa-times-circle'
    };
    return icons[type] || 'fa-bell';
  }

  getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Hace unos segundos';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
    if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`;

    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
}
