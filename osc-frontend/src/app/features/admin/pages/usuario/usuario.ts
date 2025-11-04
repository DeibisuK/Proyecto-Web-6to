import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario, RolUsuario, RolInfo } from '@shared/models/index';
import { NotificationService } from '@core/services/notification.service';
import { AuthService } from '@core/services/auth.service';
import {
  AllUsersResponse,
  CombinedUser,
  UserApiService,
} from '@shared/services/index';
import { Auth, user } from '@angular/fire/auth';

@Component({
  selector: 'app-usuario',
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario.html',
  styleUrl: './usuario.css',
})
export class UsuarioComponent implements OnInit {
  private userApiService = inject(UserApiService);
  private auth = inject(Auth);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  usuarios: Usuario[] = [];
  usuariosCombinados: AllUsersResponse | null = null;
  usuariosFiltrados: CombinedUser[] = [];
  usuariosPaginados: CombinedUser[] = [];

  searchTerm = '';
  filtroRol: RolUsuario | null = null;
  filtroTipo: 'todos' | 'firebase-only' | 'db-only' | 'firebase+db' = 'todos';

  // Paginación
  currentPage = 1;
  itemsPerPage = 20;
  totalPages = 1;
  pages: number[] = [];

  // Loading
  isLoading = true;
  skeletonItems = Array(12).fill(0); // Mostrar 12 skeletons

  // Estadísticas
  totalFirebase = 0;
  totalBD = 0;
  totalCombinado = 0;

  // Modales
  mostrarModalEliminar = false;
  mostrarModalCambiarRol = false;
  usuarioSeleccionado: CombinedUser | null = null;
  nuevoRol: RolUsuario | null = null;

  roles: RolInfo[] = [
    { value: 'Admin', label: 'Admin', color: '#3498DB', id: 1 },
    { value: 'Cliente', label: 'Cliente', color: '#2ECC71', id: 2 },
    { value: 'Arbitro', label: 'Árbitro', color: '#F39C12', id: 3 },
  ];

  // Mapeo de id_rol a nombre
  rolMap: { [key: number]: RolUsuario } = {
    1: 'Admin',
    2: 'Cliente',
    3: 'Arbitro',
  };

  ngOnInit() {
    this.cargarUsuariosFirebase();
  }

  async cargarUsuariosFirebase() {
    this.isLoading = true;
    try {
      const currentUser = this.auth.currentUser;
      this.userApiService.getAllUsers().subscribe({
        next: async (data) => {
          this.usuariosCombinados = data;

          if (currentUser) {
            this.usuarios = this.usuarios.filter((u) => u.uid !== currentUser.uid);
          }

          this.usuariosFiltrados = [...this.usuariosCombinados!.users];
          this.aplicarPaginacion();
          this.isLoading = false;
        },
      });
      // Filtrar el usuario actual de la lista
    } catch (error) {
      this.isLoading = false;
    }
  }

  filtrarUsuarios() {
    this.usuariosFiltrados = this.usuariosCombinados!.users.filter((usuario) => {
      const matchSearch =
        usuario.displayName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        usuario.email.toLowerCase().includes(this.searchTerm.toLowerCase());

  const matchRol = !this.filtroRol || usuario.customClaims?.role === this.filtroRol;

      const matchTipo = this.filtroTipo === 'todos' || usuario.source === this.filtroTipo;

      return matchSearch && matchRol && matchTipo;
    });

    this.currentPage = 1;
    this.aplicarPaginacion();
  }

  aplicarPaginacion() {
    this.totalPages = Math.ceil(this.usuariosFiltrados.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.usuariosPaginados = this.usuariosFiltrados.slice(startIndex, endIndex);
  }

  onSearchChange(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.filtrarUsuarios();
  }

  onFiltroRolChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.filtroRol = value ? (value as RolUsuario) : null;
    this.filtrarUsuarios();
  }

  onFiltroTipoChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.filtroTipo = value as any;
    this.filtrarUsuarios();
  }

  cambiarPagina(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.aplicarPaginacion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  abrirModalCambiarRol(usuario: CombinedUser) {
    this.usuarioSeleccionado = usuario;
    this.nuevoRol = usuario.customClaims?.role as RolUsuario;
    this.mostrarModalCambiarRol = true;
  }

  cambiarRolUsuario() {
    if (!this.usuarioSeleccionado || !this.nuevoRol) return;

    const rolInfo = this.roles.find((r) => r.value === this.nuevoRol);
    if (!rolInfo) {
      this.notificationService.error('Rol no válido');
      return;
    }

    const uid = this.usuarioSeleccionado.uid;
    if (!uid) {
      this.notificationService.error('Usuario sin UID');
      return;
    }

    this.userApiService.updateUserRole(uid, rolInfo.id).subscribe({
      next: async (data) => {
        // Actualizar en la lista combinada
        if (this.usuariosCombinados) {
          const index = this.usuariosCombinados.users.findIndex(
            (u) => u.uid === this.usuarioSeleccionado!.uid
          );
          if (index !== -1) {
            // Actualizar el rol en customClaims
            this.usuariosCombinados.users[index].customClaims.role = this.nuevoRol!;
            this.usuariosCombinados.users[index].customClaims.id_rol = rolInfo.id;
          }
        }

        // Si el usuario cambió su propio rol, refrescar el token
        if (uid === this.auth.currentUser?.uid) {
          try {
            await this.authService.forceTokenRefresh();
            console.log('[USUARIO] Token refrescado después de cambiar rol propio');
          } catch (error) {
            console.error('[USUARIO] Error al refrescar token:', error);
          }
        }

        this.filtrarUsuarios();
        this.notificationService.success('Rol actualizado correctamente');
        this.cerrarModalCambiarRol();
      },
      error: (error) => {
        this.notificationService.error('Error al actualizar el rol');
      },
    });
  }

  quitarRol(usuario: CombinedUser) {
    if (usuario.customClaims?.role === 'Cliente') {
      this.notificationService.error('Los clientes ya tienen el rol base');
      return;
    }
    const uid = usuario.uid;

    if (!uid) {
      this.notificationService.error('Usuario sin UID');
      return;
    }

    // id_rol 2 = Cliente
    this.userApiService.updateUserRole(uid, 2).subscribe({
      next: async (data) => {
        if (this.usuariosCombinados) {
          const index = this.usuariosCombinados.users.findIndex((u) => u.uid === usuario.uid);
          if (index !== -1) {
            this.usuariosCombinados.users[index].customClaims.role = 'Cliente';
            this.usuariosCombinados.users[index].customClaims.id_rol = 2;
          }
        }

        // Si el usuario cambió su propio rol, refrescar el token
        if (uid === this.auth.currentUser?.uid) {
          try {
            await this.authService.forceTokenRefresh();
            console.log('[USUARIO] Token refrescado después de quitar rol propio');
          } catch (error) {
            console.error('[USUARIO] Error al refrescar token:', error);
          }
        }

        this.filtrarUsuarios();
        this.notificationService.success('Rol removido correctamente');
      },
      error: (error) => {
        this.notificationService.error('Error al remover el rol');
      },
    });
  }

  confirmarEliminar(usuario: CombinedUser) {
    this.usuarioSeleccionado = usuario;
    this.mostrarModalEliminar = true;
  }

  eliminarUsuario() {
    if (!this.usuarioSeleccionado) return;

    const uid = this.usuarioSeleccionado.uid;
    if (!uid) {
      this.notificationService.error('Usuario sin UID');
      return;
    }

    this.userApiService.deleteUser(uid).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter((u) => u.uid !== this.usuarioSeleccionado!.uid);
        this.filtrarUsuarios();

        this.notificationService.success('Usuario eliminado correctamente');
        this.cerrarModalEliminar();
      },
      error: (error) => {
        this.notificationService.error('Error al eliminar el usuario');
        this.cerrarModalEliminar();
      },
    });
  }

  cerrarModalEliminar() {
    this.mostrarModalEliminar = false;
    this.usuarioSeleccionado = null;
  }

  cerrarModalCambiarRol() {
    this.mostrarModalCambiarRol = false;
    this.usuarioSeleccionado = null;
    this.nuevoRol = null;
  }

  getRolInfo(rol: RolUsuario): RolInfo {
    // Si no encuentra el rol, devolver un rol por defecto (Cliente)
    return this.roles.find((r) => r.value === rol) || this.roles[2];
  }

  getNombre(usuario: CombinedUser): string {
    return usuario.displayName || usuario.email;
  }

  onImageError(event: Event, usuario: CombinedUser) {
    const img = event.target as HTMLImageElement;
    img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      usuario.displayName || 'User'
    )}&background=random&size=200`;
  }
}
