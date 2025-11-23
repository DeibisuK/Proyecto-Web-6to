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
      subject: 'Producto enviado',
      description: 'Tu pedido #ORD-2024-038 ha sido enviado. Número de seguimiento: TRK123456789',
      type: 'info',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false
    },
    {
      id: '4',
      subject: 'Torneo próximo',
      description: 'Tu equipo participará en el torneo "Copa de Verano 2025" el próximo sábado.',
      type: 'info',
      date: new Date(Date.now() - 1000 * 60 * 60 * 5),
      read: true
    },
    {
      id: '5',
      subject: 'Descuento especial',
      description: '¡Tienes un 20% de descuento en tu próxima compra! Código: VERANO2025',
      type: 'success',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true
    }
  ];

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
    private sedeService: SedeService
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
  }

  closeCart() {
    this.showCart = false;
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

      Swal.fire({
        title: '¡Hasta pronto!',
        text: 'Has cerrado sesión exitosamente',
        icon: 'success',
        confirmButtonColor: '#2ECC71',
        timer: 2000,
        showConfirmButton: false
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
}
