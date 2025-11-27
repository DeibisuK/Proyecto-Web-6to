import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SystemNotificationService, SystemNotification } from '../../../../core/services/system-notification.service';
import { AuthService } from '../../../../core/services/auth.service';

// Extender la interfaz para agregar propiedad expanded
interface ExtendedNotification extends SystemNotification {
  expanded?: boolean;
}

@Component({
  selector: 'app-bandeja-notificaciones',
  imports: [CommonModule, FormsModule],
  templateUrl: './bandeja-notificaciones.html',
  styleUrl: './bandeja-notificaciones.css',
})
export class BandejaNotificaciones implements OnInit {
  private notificationService = inject(SystemNotificationService);
  private authService = inject(AuthService);

  notifications: ExtendedNotification[] = [];
  filteredNotifications: ExtendedNotification[] = [];
  filterType: string = 'all';
  searchQuery: string = '';
  isLoading = true;

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      if (user?.uid) {
        this.loadNotifications(user.uid);
      }
    });
  }

  loadNotifications(uid: string): void {
    this.isLoading = true;
    this.notificationService.getNotifications({ uid, limit: 100 }).subscribe({
      next: (notifications) => {
        this.notifications = notifications.map(n => ({ ...n, expanded: false }));
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar notificaciones:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let result = this.notifications;

    // Filtrar por tipo
    if (this.filterType === 'unread') {
      result = result.filter(n => !n.leida);
    } else if (this.filterType !== 'all') {
      result = result.filter(n => n.tipo === this.filterType);
    }

    // Filtrar por búsqueda
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(n =>
        n.asunto.toLowerCase().includes(query) ||
        n.descripcion.toLowerCase().includes(query)
      );
    }

    this.filteredNotifications = result;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  toggleNotification(notification: ExtendedNotification): void {
    notification.expanded = !notification.expanded;
    if (!notification.leida) {
      this.markAsRead(notification);
    }
  }

  markAsRead(notification: SystemNotification): void {
    this.authService.user$.subscribe(user => {
      if (user?.uid && !notification.leida) {
        this.notificationService.markAsRead(notification.id_notificacion, user.uid).subscribe({
          next: () => {
            console.log('✅ Notificación marcada como leída');
          },
          error: (error) => console.error('❌ Error al marcar notificación:', error)
        });
      }
    });
  }

  markAllAsRead(): void {
    this.authService.user$.subscribe(user => {
      if (user?.uid) {
        this.notificationService.markAllAsRead(user.uid).subscribe({
          next: () => {
            console.log('✅ Todas marcadas como leídas');
            this.loadNotifications(user.uid);
          },
          error: (error) => console.error('❌ Error:', error)
        });
      }
    });
  }

  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      info: 'info',
      success: 'check_circle',
      warning: 'warning',
      error: 'error',
      promotion: 'local_offer'
    };
    return icons[type] || 'notifications';
  }

  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.leida).length;
  }
}
