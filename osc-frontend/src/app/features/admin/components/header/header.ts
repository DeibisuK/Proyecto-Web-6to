import { Component, Input, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { SystemNotificationService, SystemNotification } from '@core/services/system-notification.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  @Input() currentPageTitle: string = 'Dashboard';

  private notificationService = inject(SystemNotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  user: any = null;
  showUserMenu = false;
  showNotifications = false;
  imageError = false;

  // Usar signals del servicio directamente mediante getters
  get notifications() {
    return this.notificationService.notifications;
  }

  get unreadCount() {
    return this.notificationService.unreadCount;
  }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      this.imageError = false; // Reset error state when user changes

      if (user?.uid) {
        this.notificationService.startPolling(user.uid);
      }
    });
  }

  // Método eliminado ya que startPolling lo hace automáticamente
  // loadNotifications(uid: string): void {
  //   this.notificationService.getNotifications({ uid }).subscribe();
  // }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-info') && !target.closest('.notifications-wrapper')) {
      this.showUserMenu = false;
      this.showNotifications = false;
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false; // Cerrar notificaciones si se abre el menú de usuario
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false; // Cerrar menú de usuario si se abren notificaciones
  }

  markAsRead(notification: SystemNotification): void {
    if (this.user?.uid && !notification.leida) {
      // Guardar estado original para revertir si falla
      const currentNotifs = this.notificationService.notifications();

      // Actualizar UI inmediatamente (NO mutar el objeto original)
      const updatedNotifs = currentNotifs.map(n =>
        n.id_notificacion === notification.id_notificacion ? { ...n, leida: true } : n
      );
      this.notificationService.notifications.set(updatedNotifs);

      // Hacer llamada al backend
      this.notificationService.markAsRead(notification.id_notificacion, this.user.uid).subscribe({
        next: () => console.log('✅ Notificación marcada como leída'),
        error: (error) => {
          console.error('❌ Error al marcar notificación:', error);
          // Revertir cambio si falla
          this.notificationService.notifications.set(currentNotifs);
        }
      });
    }
  }

  markAllAsRead(): void {
    if (this.user?.uid) {
      // Actualizar UI inmediatamente
      const currentNotifs = this.notificationService.notifications();
      const updatedNotifs = currentNotifs.map(n => ({ ...n, leida: true }));
      this.notificationService.notifications.set(updatedNotifs);

      // Hacer llamada al backend
      this.notificationService.markAllAsRead(this.user.uid).subscribe({
        next: () => console.log('✅ Todas las notificaciones marcadas como leídas'),
        error: (error) => {
          console.error('❌ Error al marcar todas:', error);
          // Revertir cambio si falla
          this.notificationService.notifications.set(currentNotifs);
        }
      });
    }
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

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Hace unos segundos';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
    if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`;

    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  verPerfil(): void {
    this.showUserMenu = false;
    this.router.navigate(['/ver-perfil']);
  }

  salirModoAdmin(): void {
    this.showUserMenu = false;
    this.router.navigate(['/inicio']);
  }

  cerrarSesion(): void {
    this.showUserMenu = false;
    this.authService.logout();
    this.router.navigate(['/inicio']);
  }

  getUserName(): string {
    if (this.user?.displayName) {
      return this.user.displayName;
    }
    if (this.user?.email) {
      return this.user.email.split('@')[0];
    }
    return 'Administrador';
  }

  onImageError(): void {
    // Cuando la imagen falla al cargar, marcamos el error para mostrar el placeholder
    this.imageError = true;
  }
}
