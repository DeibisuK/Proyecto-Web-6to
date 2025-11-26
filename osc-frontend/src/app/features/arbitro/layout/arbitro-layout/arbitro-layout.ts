import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { Subscription } from 'rxjs';

interface Notification {
  id: string;
  subject: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  date: Date;
  read: boolean;
}

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

  notifications: Notification[] = [
    {
      id: '1',
      subject: 'Partido próximo',
      description: 'Tienes un partido asignado para hoy a las 18:00 en la Cancha 5.',
      type: 'warning',
      date: new Date(Date.now() - 1000 * 60 * 30),
      read: false
    },
    {
      id: '2',
      subject: 'Nuevo partido asignado',
      description: 'Se te ha asignado un partido para el torneo "Copa de Verano 2025".',
      type: 'info',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false
    },
    {
      id: '3',
      subject: 'Partido finalizado',
      description: 'El partido entre Tigres vs Leones ha sido finalizado correctamente.',
      type: 'success',
      date: new Date(Date.now() - 1000 * 60 * 60 * 5),
      read: true
    }
  ];

  user = this.authService.currentUser;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.user$.subscribe((u) => {
        this.user = u;
        this.imageError = false;
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
    return this.notifications.filter(n => !n.read).length;
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

  markAsRead(notification: Notification): void {
    notification.read = true;
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
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

  getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Hace unos segundos';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
    if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`;

    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
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
