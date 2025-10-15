import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario, RolUsuario, RolInfo } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-usuario',
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario.html',
  styleUrl: './usuario.css'
})
export class UsuarioComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  usuariosPaginados: Usuario[] = [];
  
  searchTerm = '';
  filtroRol: RolUsuario | null = null;
  
  // Paginación
  currentPage = 1;
  itemsPerPage = 8;
  totalPages = 1;
  pages: number[] = [];
  
  // Modales
  mostrarModalEliminar = false;
  mostrarModalCambiarRol = false;
  usuarioSeleccionado: Usuario | null = null;
  nuevoRol: RolUsuario | null = null;
  
  roles: RolInfo[] = [
    { value: 'superadmin', label: 'Super Admin', color: '#9B59B6' },
    { value: 'admin', label: 'Admin', color: '#3498DB' },
    { value: 'arbitro', label: 'Árbitro', color: '#F39C12' },
    { value: 'cliente', label: 'Cliente', color: '#2ECC71' }
  ];

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    // Datos de ejemplo
    this.usuarios = [
      {
        id_usuario: 1,
        nombre: 'Gary',
        apellido: 'Barreiro',
        email: 'gbarreiro@gmail.com',
        foto_perfil: 'https://i.imgflip.com/57c2if.png?a488688',
        rol: 'superadmin',
        fecha_registro: '2024-01-15',
        estado: 'activo'
      },
      {
        id_usuario: 2,
        nombre: 'Jhon',
        apellido: 'Cruz',
        email: 'jcruz@gmail.com',
        foto_perfil: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPaAuD_3-b1o6rQJrpCPDnNs3vqHLUKXViTQ&s',
        rol: 'superadmin',
        fecha_registro: '2024-02-20',
        estado: 'activo'
      },
      {
        id_usuario: 3,
        nombre: 'Javier',
        apellido: 'Cellan',
        email: 'jcellan@gmail.com',
        foto_perfil: 'https://static0.cbrimages.com/wordpress/wp-content/uploads/2019/11/Anime-Funny-Deku.jpg',
        rol: 'superadmin',
        fecha_registro: '2024-03-10',
        estado: 'activo'
      },
      {
        id_usuario: 4,
        nombre: 'Ana',
        apellido: 'Martínez',
        email: 'ana.martinez@gmail.com',
        foto_perfil: 'https://i.pravatar.cc/150?img=45',
        rol: 'cliente',
        fecha_registro: '2024-04-05',
        estado: 'activo'
      },
      {
        id_usuario: 5,
        nombre: 'Luis',
        apellido: 'Travesti',
        email: 'ltravesti@gmail.com',
        foto_perfil: 'https://i.pravatar.cc/150?img=44',
        rol: 'arbitro',
        fecha_registro: '2024-05-15',
        estado: 'activo'
      }
    ];

    this.usuariosFiltrados = [...this.usuarios];
    this.aplicarPaginacion();
  }

  filtrarUsuarios() {
    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      const matchSearch = 
        usuario.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        usuario.apellido.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        usuario.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchRol = !this.filtroRol || usuario.rol === this.filtroRol;
      
      return matchSearch && matchRol;
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
    this.filtroRol = value ? value as RolUsuario : null;
    this.filtrarUsuarios();
  }

  cambiarPagina(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.aplicarPaginacion();
    }
  }

  abrirModalCambiarRol(usuario: Usuario) {
    this.usuarioSeleccionado = usuario;
    this.nuevoRol = usuario.rol;
    this.mostrarModalCambiarRol = true;
  }

  async cambiarRolUsuario() {
    if (!this.usuarioSeleccionado || !this.nuevoRol) return;

    try {
      // Aquí iría la llamada al servicio
      await this.simularOperacion();

      const index = this.usuarios.findIndex(u => u.id_usuario === this.usuarioSeleccionado!.id_usuario);
      if (index !== -1) {
        this.usuarios[index].rol = this.nuevoRol;
      }

      this.filtrarUsuarios();
      this.mostrarNotificacion('Rol actualizado correctamente', 'success');
      this.cerrarModalCambiarRol();

    } catch (error) {
      this.mostrarNotificacion('Error al cambiar el rol', 'error');
    }
  }

  async quitarRol(usuario: Usuario) {
    if (usuario.rol === 'cliente') {
      this.mostrarNotificacion('Los clientes ya tienen el rol base', 'error');
      return;
    }

    try {
      await this.simularOperacion();
      
      const index = this.usuarios.findIndex(u => u.id_usuario === usuario.id_usuario);
      if (index !== -1) {
        this.usuarios[index].rol = 'cliente';
      }

      this.filtrarUsuarios();
      this.mostrarNotificacion('Rol removido correctamente', 'success');

    } catch (error) {
      this.mostrarNotificacion('Error al quitar el rol', 'error');
    }
  }

  confirmarEliminar(usuario: Usuario) {
    this.usuarioSeleccionado = usuario;
    this.mostrarModalEliminar = true;
  }

  async eliminarUsuario() {
    if (!this.usuarioSeleccionado) return;

    try {
      await this.simularOperacion();

      this.usuarios = this.usuarios.filter(u => u.id_usuario !== this.usuarioSeleccionado!.id_usuario);
      this.filtrarUsuarios();

      this.mostrarNotificacion('Usuario eliminado correctamente', 'success');
      this.cerrarModalEliminar();

    } catch (error) {
      this.mostrarNotificacion('Error al eliminar usuario', 'error');
    }
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
    return this.roles.find(r => r.value === rol) || this.roles[3];
  }

  getNombreCompleto(usuario: Usuario): string {
    return `${usuario.nombre} ${usuario.apellido}`;
  }

  private simularOperacion(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  }

  private mostrarNotificacion(message: string, type: 'success' | 'error') {
    const event = new CustomEvent('showToast', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  }
}
