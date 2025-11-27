import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { SystemNotificationService, SystemNotification } from '../../../../core/services/system-notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-arbitro-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './arbitro-layout.html',
  styleUrl: './arbitro-layout.css'
})
export class ArbitroLayout implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private authService = inject(AuthService);

  showSidebar = false;
  showNotifications = false;
  showUserMenu = false;
  imageError = false;

  notifications: SystemNotification[] = [];

  user = this.authService.currentUser;

  constructor(
    private router: Router,
    private systemNotificationService: SystemNotificationService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.user$.subscribe((u) => {
        this.user = u;
        this.imageError = false;

        if (u?.uid) {
          // Iniciar polling automático
          this.systemNotificationService.startPolling(u.uid);

          // Cargar notificaciones iniciales (solo de origen 'partido' o 'arbitro')
          this.systemNotificationService.getNotifications({
            uid: u.uid,
            origen: 'partido',
            limit: 20
          }).subscribe(notifs => {
            this.notifications = notifs;
          });
        }
      })
    );
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
    this.subscriptions.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notifications-wrapper')) {
      this.showNotifications = false;
    }
    if (!target.closest('.user-dropdown')) {
      this.showUserMenu = false;
    }
  }

  get unreadCount(): number {
    return this.systemNotificationService.unreadCount();
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  markAsRead(notification: SystemNotification): void {
    if (!this.user?.uid) return;

    this.systemNotificationService.markAsRead(notification.id_notificacion, this.user.uid)
      .subscribe(() => {
        notification.leida = true;

        // Navegar si hay URL de acción
        if (notification.url_accion) {
          this.router.navigate([notification.url_accion]);
          this.closeNotifications();
        }
      });
  }

  markAllAsRead(): void {
    if (!this.user?.uid) return;

    this.systemNotificationService.markAllAsRead(this.user.uid)
      .subscribe(() => {
        this.notifications.forEach(n => n.leida = true);
      });
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

  getTimeAgo(date: string | Date): string {
    return this.systemNotificationService.getTimeAgo(date);
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
    if (this.showSidebar) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  async logout(): Promise<void> {
    const Swal = (window as any).Swal;

    if (!Swal) {
      const confirmacion = confirm('¿Estás seguro de que deseas cerrar sesión?');
      if (confirmacion) {
        await this.authService.logout();
        this.router.navigate(['/inicio']);
      }
      return;
    }

    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas salir de tu cuenta?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2ECC71',
      cancelButtonColor: '#95A5A6',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title',
        confirmButton: 'swal-custom-confirm',
        cancelButton: 'swal-custom-cancel'
      }
    });

    if (result.isConfirmed) {
      await this.authService.logout();
      this.router.navigate(['/inicio']);
    }
  }

  getUserDisplayName(): string {
    if (!this.user) return 'Árbitro';
    if (this.user.displayName) return this.user.displayName;
    if (this.user.email) return this.user.email.split('@')[0];
    return 'Árbitro';
  }

  onImageError(): void {
    this.imageError = true;
  }
}
