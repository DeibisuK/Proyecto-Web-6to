import { Component, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SystemNotificationService, SystemNotification } from '../../../../core/services/system-notification.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  @Output() sidebarToggled = new EventEmitter<boolean>();

  private notificationService = inject(SystemNotificationService);
  private authService = inject(AuthService);

  isCollapsed = false;
  showNotifications = false;

  // Usar signals del servicio
  notifications = signal<SystemNotification[]>([]);
  unreadCount = signal<number>(0);

  ngOnInit(): void {
    // Suscribirse a cambios de usuario para iniciar polling
    this.authService.user$.subscribe(user => {
      if (user?.uid) {
        this.notificationService.startPolling(user.uid);
        this.loadNotifications(user.uid);
      }
    });

    // Usar signals del servicio directamente
    this.notifications = this.notificationService.notifications;
    this.unreadCount = this.notificationService.unreadCount;
  }

  loadNotifications(uid: string): void {
    this.notificationService.getNotifications({ uid }).subscribe();
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.sidebarToggled.emit(this.isCollapsed);
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  markAsRead(notification: SystemNotification): void {
    this.authService.user$.subscribe(user => {
      if (user?.uid) {
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
            console.log('✅ Todas las notificaciones marcadas como leídas');
          },
          error: (error) => console.error('❌ Error al marcar todas:', error)
        });
      }
    });
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

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Hace unos segundos';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
    if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`;

    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
}
