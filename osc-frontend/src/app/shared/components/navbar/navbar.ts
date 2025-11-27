import { Component, OnInit, OnDestroy, ViewEncapsulation, inject, HostListener, ViewChild, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Login } from '@features/auth/login/login';
import { RecuperarPassword } from '@features/auth/recuperar-password/recuperar-password';
import { ReactWrapperComponent } from '@shared/react-wrapper/react-wrapper.component';
import Cart from '@shared/components/carrito/cart';
import { CarritoService } from '@shared/services/index';
import { setCarritoServiceInstance } from '@shared/services/index';
import { setRouterInstance } from '@shared/services/index';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '@core/services/auth.service';
import { SedeService } from '@shared/services/index';
import { Sedes } from '@shared/models/index';
import { NotificationService } from '@core/services/notification.service';
import { SystemNotificationService, SystemNotification } from '@core/services/system-notification.service';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    Login,
    RecuperarPassword,
    FormsModule,
    ReactWrapperComponent,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  encapsulation: ViewEncapsulation.None,
})
export class Navbar implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private authService = inject(AuthService);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  mostrarLogin = false;
  mostrarRecuperarPassword = false;
  searchTerm = '';
  showSidebar = false;
  showCart:boolean = false;
  cartItemCount = 0;
  showNotifications = false;
  showUserMenu = false;

  // Usar signals del servicio directamente (sin copias locales)
  get notifications() {
    return this.systemNotificationService.notifications;
  }

  get unreadCountSignal() {
    return this.systemNotificationService.unreadCount;
  }

  // Componente React del carrito
  CartComponent = Cart;

  // Props del carrito - creadas una sola vez para evitar re-renderizados
  cartProps = {
    mode: 'sidebar' as const,
    onClose: () => this.closeCart()
  };

  user = this.authService.currentUser;
  isAdmin$!: Observable<boolean>;
  isArbitro$!: Observable<boolean>;

  dropdowns = {
    productos: false,
    reservas: false,
    sedes: false,
    nosotros: false,
    servicios: false,
    usuario: false,
  };

  sedesAgrupadas: { nombre: string; sedes: Sedes[] }[] = [];

  constructor(
    private carritoService: CarritoService,
    private router: Router,
    private sedeService: SedeService,
    private notificationService: NotificationService,
    private systemNotificationService: SystemNotificationService
  ) {
    // Cierra el menú al cambiar el tamaño de la ventana
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.showSidebar) {
        this.toggleSidebar();
      }
    });
  }

  ngOnInit() {
    setCarritoServiceInstance(this.carritoService);
    setRouterInstance(this.router);

    this.subscriptions.add(
      this.authService.user$.subscribe((u) => {
        this.user = u;
        this.imageError = false; // Reset error state when user changes

        if (u) {
          this.carritoService.cargarCarrito(u.uid).subscribe();
        } else {
          this.carritoService.limpiarEstadoLocal();
        }
      })
    );

    this.isAdmin$ = this.authService.isAdmin$;
    this.isArbitro$ = this.authService.isArbitro$;

    const initialUrlTree = this.router.parseUrl(this.router.url || '');
    const initialOpen = initialUrlTree.queryParams['openLogin'] === 'true';
    if (initialOpen && !this.mostrarLogin) {
      this.abrirLoginModal();
      this.router.navigate([], { queryParams: { openLogin: null }, queryParamsHandling: 'merge' });
    }

    this.subscriptions.add(
      this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd)
      ).subscribe(() => {
        const urlTree = this.router.parseUrl(this.router.url || '');
        const shouldOpenLogin = urlTree.queryParams['openLogin'] === 'true';

        if (shouldOpenLogin && !this.mostrarLogin) {
          this.abrirLoginModal();
          this.router.navigate([], {
            queryParams: { openLogin: null },
            queryParamsHandling: 'merge',
            replaceUrl: true
          });
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
    );

    this.subscriptions.add(
      this.carritoService.obtenerCantidadTotal().subscribe((count) => {
        this.cartItemCount = count;
      })
    );

    this.cargarSedes();

    // Cargar notificaciones reales cuando el usuario inicia sesión
    this.subscriptions.add(
      this.authService.user$.subscribe((u) => {
        if (u?.uid) {
          // Iniciar polling automático (ya carga las notificaciones iniciales)
          this.systemNotificationService.startPolling(u.uid);
        }
      })
    );
  }

  cargarSedes() {

    this.sedeService.getSedes().subscribe({
      next: (sedes) => {
        this.sedesAgrupadas = this.agruparSedesPorCiudad(sedes);
      },
      error: (error) => {
        console.error('Error al cargar sedes en navbar:', error);
      },
    });
  }

  agruparSedesPorCiudad(sedes: Sedes[]): { nombre: string; sedes: Sedes[] }[] {
    const sedesActivas = sedes.filter(
      (s) => s.ciudad && (s.estado?.toLowerCase() === 'activo' || s.estado === 'Activo')
    );
    const ciudades = new Map<string, Sedes[]>();

    sedesActivas.forEach((sede) => {
      const ciudad = sede.ciudad!;
      if (!ciudades.has(ciudad)) {
        ciudades.set(ciudad, []);
      }
      ciudades.get(ciudad)!.push(sede);
    });

    return Array.from(ciudades.entries()).map(([nombre, sedes]) => ({
      nombre,
      sedes,
    }));
  }

  ngOnDestroy() {
    // Restaura el scroll cuando se destruye el componente
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

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Ctrl+K para enfocar el buscador
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.searchInput?.nativeElement.focus();
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
    if (!this.user?.uid || notification.leida) return;

    // Guardar estado original para revertir si falla
    const currentNotifs = this.systemNotificationService.notifications();

    // Actualizar UI inmediatamente (NO mutar el objeto original)
    const updatedNotifs = currentNotifs.map(n =>
      n.id_notificacion === notification.id_notificacion ? { ...n, leida: true } : n
    );
    this.systemNotificationService.notifications.set(updatedNotifs);

    // Hacer llamada al backend
    this.systemNotificationService.markAsRead(notification.id_notificacion, this.user.uid)
      .subscribe({
        next: () => {
          console.log('✅ Notificación marcada como leída');
          // Navegar si hay URL de acción
          if (notification.url_accion) {
            this.router.navigate([notification.url_accion]);
            this.closeNotifications();
          }
        },
        error: (error) => {
          console.error('❌ Error al marcar notificación:', error);
          // Revertir cambio si falla
          this.systemNotificationService.notifications.set(currentNotifs);
        }
      });
  }

  markAllAsRead(): void {
    if (!this.user?.uid) return;

    // Actualizar UI inmediatamente
    const currentNotifs = this.systemNotificationService.notifications();
    const updatedNotifs = currentNotifs.map(n => ({ ...n, leida: true }));
    this.systemNotificationService.notifications.set(updatedNotifs);

    // Hacer llamada al backend
    this.systemNotificationService.markAllAsRead(this.user.uid)
      .subscribe({
        next: () => console.log('✅ Todas marcadas como leídas'),
        error: (error) => {
          console.error('❌ Error al marcar todas:', error);
          // Revertir cambio si falla
          this.systemNotificationService.notifications.set(currentNotifs);
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

  getTimeAgo(date: string | Date): string {
    return this.systemNotificationService.getTimeAgo(date);
  }

  toggleDropdown(dropdown: keyof typeof this.dropdowns, show: boolean) {
    this.dropdowns[dropdown] = show;
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
    if (this.showSidebar) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  toggleCart() {
    this.showCart = !this.showCart;
    if (this.showCart) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeCart() {
    this.showCart = false;
    document.body.style.overflow = '';
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      // Navegar a la tienda con el término de búsqueda
      this.router.navigate(['/tienda'], {
        queryParams: { q: this.searchTerm.trim() }
      });
    }
  }

  async logout() {
    const Swal = (window as any).Swal;

    if (!Swal) {
      // Fallback si SweetAlert2 no está cargado
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

      // Usar toast en lugar de SweetAlert
      this.notificationService.notify({
        message: '¡Hasta pronto! Has cerrado sesión exitosamente',
        type: 'success'
      });
    }
  }

  abrirLoginModal() {
    this.mostrarLogin = true;
    document.body.classList.add('modal-open');
  }

  cerrarLoginModal() {
    this.mostrarLogin = false;
    document.body.classList.remove('modal-open');
  }

  abrirRecuperarPasswordModal() {
    this.mostrarLogin = false;
    this.mostrarRecuperarPassword = true;
    // El body ya tiene modal-open del modal anterior
  }

  cerrarRecuperarPasswordModal() {
    this.mostrarRecuperarPassword = false;
    document.body.classList.remove('modal-open');
  }

  volverAlLoginDesdeRecuperacion() {
    this.mostrarRecuperarPassword = false;
    this.mostrarLogin = true;
    // El body ya tiene modal-open
  }

  navegarSedesPorCiudad(ciudad: string) {
    this.router.navigate(['/todas-las-sedes'], {
      queryParams: { ciudad: ciudad },
    });
    this.toggleDropdown('sedes', false);
  }

  getUserDisplayName(): string {
    if (!this.user) return 'Usuario';
    if (this.user.displayName) return this.user.displayName;
    if (this.user.email) return this.user.email.split('@')[0];
    return 'Usuario';
  }

  imageError = false;

  onImageError(): void {
    // Cuando la imagen falla al cargar, marcamos el error para mostrar el placeholder
    this.imageError = true;
  }
}
