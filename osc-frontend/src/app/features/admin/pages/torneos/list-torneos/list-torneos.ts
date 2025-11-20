import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TorneosAdminService, Torneo, FiltrosTorneo } from '../torneos.service';
import { NotificationService } from '@core/services/notification.service';
import { DeporteService } from '@shared/services/index';
import { Deporte } from '@shared/models/index';

@Component({
  selector: 'app-list-torneos',
  imports: [CommonModule, FormsModule],
  templateUrl: './list-torneos.html',
  styleUrl: './list-torneos.css'
})
export class ListTorneos implements OnInit {
  torneos: Torneo[] = [];
  deportes: Deporte[] = [];

  // Filtros
  filtros: FiltrosTorneo = {
    page: 1,
    limit: 10,
    ordenar: 'recientes'
  };

  // Paginación
  totalPages: number = 0;
  totalTorneos: number = 0;

  // Estados
  estadosPosibles = [
    { value: '', label: 'Todos los estados' },
    { value: 'abierto', label: 'Abierto' },
    { value: 'en_curso', label: 'En curso' },
    { value: 'cerrado', label: 'Cerrado' },
    { value: 'finalizado', label: 'Finalizado' }
  ];

  // Ordenamiento
  opcionesOrden = [
    { value: 'recientes', label: 'Más recientes' },
    { value: 'fecha_asc', label: 'Fecha inicio (ascendente)' },
    { value: 'fecha_desc', label: 'Fecha inicio (descendente)' },
    { value: 'nombre', label: 'Nombre (A-Z)' },
    { value: 'inscritos', label: 'Más inscritos' }
  ];

  constructor(
    private torneosService: TorneosAdminService,
    private deporteService: DeporteService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDeportes();
    this.cargarTorneos();
  }

  cargarDeportes(): void {
    this.deporteService.getDeportes().subscribe({
      next: (data) => {
        this.deportes = data;
      },
      error: (err) => {
        console.error('Error al cargar deportes:', err);
      }
    });
  }

  cargarTorneos(): void {
    this.torneosService.listarTorneos(this.filtros).subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.torneos = response.data;

          if (response.pagination) {
            this.totalTorneos = response.pagination.total;
            this.totalPages = response.pagination.totalPages;
          }
        }
      },
      error: (err) => {
        this.notificationService.notify({
          message: 'No se pudieron cargar los torneos',
          type: 'error'
        });
        console.error('Error al cargar torneos:', err);
      }
    });
  }

  aplicarFiltros(): void {
    this.filtros.page = 1; // Reset a la primera página
    this.cargarTorneos();
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.filtros.page = pagina;
      this.cargarTorneos();
    }
  }

  limpiarFiltros(): void {
    this.filtros = {
      page: 1,
      limit: 10,
      ordenar: 'recientes'
    };
    this.cargarTorneos();
  }

  crearTorneo(): void {
    this.router.navigate(['/admin/crear-torneo']);
  }

  editarTorneo(torneo: Torneo): void {
    if (torneo.id_torneo) {
      this.router.navigate(['/admin/editar-torneo', torneo.id_torneo]);
    }
  }

  verEstadisticas(torneo: Torneo): void {
    if (torneo.id_torneo) {
      this.router.navigate(['/admin/torneos', torneo.id_torneo, 'estadisticas']);
    }
  }

  cambiarEstado(torneo: Torneo, nuevoEstado: string): void {
    if (!torneo.id_torneo) return;

    const confirmacion = confirm(`¿Cambiar el estado del torneo "${torneo.nombre}" a "${nuevoEstado}"?`);

    if (confirmacion) {
      this.notificationService.notify({
        message: 'Cambiando estado...',
        type: 'loading'
      });

      this.torneosService.cambiarEstado(torneo.id_torneo, nuevoEstado).subscribe({
        next: (response) => {
          this.notificationService.notify({
            message: `Estado cambiado exitosamente a: ${nuevoEstado}`,
            type: 'success'
          });
          this.cargarTorneos();
        },
        error: (err) => {
          this.notificationService.notify({
            message: err.error?.message || 'Error al cambiar el estado',
            type: 'error'
          });
        }
      });
    }
  }

  eliminarTorneo(torneo: Torneo): void {
    if (!torneo.id_torneo) return;

    const confirmacion = confirm(
      `¿Estás seguro de eliminar el torneo "${torneo.nombre}"?\n\n` +
      `Esta acción no se puede deshacer y eliminará todas las fases, grupos y partidos asociados.`
    );

    if (confirmacion) {
      this.notificationService.notify({
        message: 'Eliminando torneo...',
        type: 'loading'
      });

      this.torneosService.eliminarTorneo(torneo.id_torneo).subscribe({
        next: (response) => {
          this.notificationService.notify({
            message: 'Torneo eliminado exitosamente',
            type: 'success'
          });
          this.cargarTorneos();
        },
        error: (err) => {
          this.notificationService.notify({
            message: err.error?.message || 'Error al eliminar el torneo',
            type: 'error'
          });
        }
      });
    }
  }

  getEstadoClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'abierto': 'estado-abierto',
      'en_curso': 'estado-en-curso',
      'cerrado': 'estado-cerrado',
      'finalizado': 'estado-finalizado'
    };
    return clases[estado] || '';
  }

  getEstadoLabel(estado: string): string {
    const labels: { [key: string]: string } = {
      'abierto': 'Abierto',
      'en_curso': 'En Curso',
      'cerrado': 'Cerrado',
      'finalizado': 'Finalizado'
    };
    return labels[estado] || estado;
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getPaginaNumeros(): number[] {
    const paginas: number[] = [];
    const maxPaginas = 5;
    let inicio = Math.max(1, (this.filtros.page || 1) - Math.floor(maxPaginas / 2));
    let fin = Math.min(this.totalPages, inicio + maxPaginas - 1);

    if (fin - inicio < maxPaginas - 1) {
      inicio = Math.max(1, fin - maxPaginas + 1);
    }

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    return paginas;
  }
}
