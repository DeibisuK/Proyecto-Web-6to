import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario, RolUsuario, RolInfo } from '../../../core/models/usuario.model';
import { NotificationService } from '../../../core/services/notification.service';

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
  filtroTipo: 'todos' | 'firebase-only' | 'db-only' | 'firebase+db' = 'todos';
  
  // Paginación
  currentPage = 1;
  itemsPerPage = 20;
  totalPages = 1;
  pages: number[] = [];
  
  // Loading
  isLoading = false;
  skeletonItems = Array(20).fill(0);
  
  // Estadísticas
  totalFirebase = 0;
  totalBD = 0;
  totalCombinado = 0;
  
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

  constructor(
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.cargarUsuariosMock();
  }

  cargarUsuariosMock() {
    // Datos de ejemplo cargados directamente en el componente
    this.usuarios = [
      {
        id_usuario: 1,
        uid: 'firebase-uid-1',
        nombre: 'Rebertida',
        apellido: 'De Cagada',
        email: 'nopasonada@ehm.com',
        foto_perfil: 'https://i.pinimg.com/736x/d5/9b/ed/d59bed6456fb7638e5dac8bab70eb294.jpg',
        rol: 'superadmin',
        fecha_registro: '2024-01-15T10:30:00',
        estado: 'activo',
        source: 'firebase+db',
        emailVerified: true,
        providerData: [{ providerId: 'google.com' }]
      }
    ];

    // Calcular estadísticas
    this.totalFirebase = this.usuarios.filter(u => u.source === 'firebase-only').length;
    this.totalBD = this.usuarios.filter(u => u.source === 'db-only').length;
    this.totalCombinado = this.usuarios.filter(u => u.source === 'firebase+db').length;

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
    this.filtroRol = value ? value as RolUsuario : null;
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

  abrirModalCambiarRol(usuario: Usuario) {
    this.usuarioSeleccionado = usuario;
    this.nuevoRol = usuario.rol;
    this.mostrarModalCambiarRol = true;
  }

  cambiarRolUsuario() {
    if (!this.usuarioSeleccionado || !this.nuevoRol) return;

    const index = this.usuarios.findIndex(u => u.id_usuario === this.usuarioSeleccionado!.id_usuario);
    if (index !== -1) {
      this.usuarios[index].rol = this.nuevoRol;
    }

    this.filtrarUsuarios();
    this.notificationService.success('Rol actualizado correctamente');
    this.cerrarModalCambiarRol();
  }

  quitarRol(usuario: Usuario) {
    if (usuario.rol === 'cliente') {
      this.notificationService.error('Los clientes ya tienen el rol base');
      return;
    }

    const index = this.usuarios.findIndex(u => u.id_usuario === usuario.id_usuario);
    if (index !== -1) {
      this.usuarios[index].rol = 'cliente';
    }

    this.filtrarUsuarios();
    this.notificationService.success('Rol removido correctamente');
  }

  confirmarEliminar(usuario: Usuario) {
    this.usuarioSeleccionado = usuario;
    this.mostrarModalEliminar = true;
  }

  eliminarUsuario() {
    if (!this.usuarioSeleccionado) return;

    this.usuarios = this.usuarios.filter(u => u.id_usuario !== this.usuarioSeleccionado!.id_usuario);
    this.filtrarUsuarios();

    this.notificationService.success('Usuario eliminado correctamente');
    this.cerrarModalEliminar();
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
    return `${usuario.nombre} ${usuario.apellido}`.trim() || usuario.email;
  }

  getProviderName(usuario: Usuario): string {
    if (!usuario.providerData || usuario.providerData.length === 0) {
      return 'Email';
    }
    
    const providers = usuario.providerData.map((p: any) => {
      if (p.providerId === 'google.com') return 'Google';
      if (p.providerId === 'facebook.com') return 'Facebook';
      if (p.providerId === 'password') return 'Email';
      return p.providerId;
    });
    
    return providers.join(', ');
  }

  getSourceLabel(source?: string): string {
    const labels: { [key: string]: string } = {
      'firebase+db': 'Firebase + BD',
      'firebase-only': 'Solo Firebase',
      'db-only': 'Solo BD'
    };
    return labels[source || ''] || 'Desconocido';
  }

  getSourceColor(source?: string): string {
    const colors: { [key: string]: string } = {
      'firebase+db': '#3498DB',
      'firebase-only': '#E67E22',
      'db-only': '#2ECC71'
    };
    return colors[source || ''] || '#95A5A6';
  }
}
