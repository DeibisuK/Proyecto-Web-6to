import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartidosAdminService, Partido } from '../partidos/partidos.service';

@Component({
  selector: 'app-historial',
  imports: [CommonModule, FormsModule],
  templateUrl: './historial.html',
  styleUrl: './historial.css',
})
export class Historial implements OnInit {
  private partidoService = inject(PartidosAdminService);

  partidos = signal<Partido[]>([]);
  partidosFiltrados = signal<Partido[]>([]);
  cargando = signal(false);

  // Filtros
  busqueda = signal('');
  filtroTorneo = signal('');
  filtroSede = signal('');
  filtroDeporte = signal('');
  filtroEstado = signal('todos');
  fechaDesde = signal('');
  fechaHasta = signal('');

  // Paginación
  paginaActual = signal(1);
  elementosPorPagina = 15;

  torneos = signal<{id_torneo: number, nombre: string}[]>([]);
  sedes = signal<{id_sede: number, nombre: string}[]>([]);
  deportes = signal<{id_deporte: number, nombre: string}[]>([]);

  ngOnInit(): void {
    this.cargarPartidos();
  }

  cargarPartidos(): void {
    this.cargando.set(true);
    this.partidoService.obtenerPartidos().subscribe({
      next: (response: any) => {
        const partidos = response.data || response;
        this.partidos.set(partidos);
        this.aplicarFiltros();
        this.extraerOpcionesFiltro();
        this.cargando.set(false);
      },
      error: (error: any) => {
        console.error('Error al cargar historial:', error);
        this.cargando.set(false);
      }
    });
  }

  extraerOpcionesFiltro(): void {
    const partidos = this.partidos();

    // Extraer torneos únicos
    const torneosUnicos = [...new Map(
      partidos
        .filter(p => p.torneo_nombre)
        .map(p => [p.torneo_nombre, { id_torneo: p.id_partido, nombre: p.torneo_nombre! }])
    ).values()];
    this.torneos.set(torneosUnicos);

    // Extraer sedes únicas
    const sedesUnicas = [...new Map(
      partidos
        .filter(p => p.sede_nombre)
        .map(p => [p.sede_nombre, { id_sede: p.id_partido, nombre: p.sede_nombre! }])
    ).values()];
    this.sedes.set(sedesUnicas);

    // Extraer deportes únicos
    const deportesUnicos = [...new Map(
      partidos
        .filter(p => p.nombre_deporte)
        .map(p => [p.nombre_deporte, { id_deporte: p.id_partido, nombre: p.nombre_deporte! }])
    ).values()];
    this.deportes.set(deportesUnicos);
  }

  aplicarFiltros(): void {
    let resultado = [...this.partidos()];

    // Filtro de búsqueda
    const busqueda = this.busqueda().toLowerCase();
    if (busqueda) {
      resultado = resultado.filter(p =>
        p.nombre_equipo_local?.toLowerCase().includes(busqueda) ||
        p.nombre_equipo_visitante?.toLowerCase().includes(busqueda) ||
        p.torneo_nombre?.toLowerCase().includes(busqueda) ||
        p.nombre_cancha?.toLowerCase().includes(busqueda) ||
        p.nombre_arbitro?.toLowerCase().includes(busqueda)
      );
    }

    // Filtro de torneo
    if (this.filtroTorneo()) {
      resultado = resultado.filter(p => p.torneo_nombre === this.filtroTorneo());
    }

    // Filtro de sede
    if (this.filtroSede()) {
      resultado = resultado.filter(p => p.sede_nombre === this.filtroSede());
    }

    // Filtro de deporte
    if (this.filtroDeporte()) {
      resultado = resultado.filter(p => p.nombre_deporte === this.filtroDeporte());
    }

    // Filtro de estado
    if (this.filtroEstado() !== 'todos') {
      resultado = resultado.filter(p => p.estado_partido === this.filtroEstado());
    }

    // Filtro de fechas
    if (this.fechaDesde()) {
      resultado = resultado.filter(p => p.fecha_partido >= this.fechaDesde());
    }
    if (this.fechaHasta()) {
      resultado = resultado.filter(p => p.fecha_partido <= this.fechaHasta());
    }

    // Ordenar por fecha más reciente primero
    resultado.sort((a, b) => {
      const fechaA = new Date(a.fecha_partido + ' ' + a.hora_inicio);
      const fechaB = new Date(b.fecha_partido + ' ' + b.hora_inicio);
      return fechaB.getTime() - fechaA.getTime();
    });

    this.partidosFiltrados.set(resultado);
    this.paginaActual.set(1); // Reset a primera página al filtrar
  }

  limpiarFiltros(): void {
    this.busqueda.set('');
    this.filtroTorneo.set('');
    this.filtroSede.set('');
    this.filtroDeporte.set('');
    this.filtroEstado.set('todos');
    this.fechaDesde.set('');
    this.fechaHasta.set('');
    this.aplicarFiltros();
  }

  get partidosPaginados(): Partido[] {
    const inicio = (this.paginaActual() - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.partidosFiltrados().slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.partidosFiltrados().length / this.elementosPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual.set(pagina);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getEstadoClase(estado: string): string {
    const clases: {[key: string]: string} = {
      'finalizado': 'finalizado',
      'en_curso': 'en-curso',
      'pausado': 'pausado',
      'programado': 'programado',
      'cancelado': 'cancelado'
    };
    return clases[estado] || '';
  }

  getEstadoTexto(estado: string): string {
    const textos: {[key: string]: string} = {
      'finalizado': 'Finalizado',
      'en_curso': 'En Curso',
      'pausado': 'Pausado',
      'programado': 'Programado',
      'cancelado': 'Cancelado'
    };
    return textos[estado] || estado;
  }

  exportarCSV(): void {
    const headers = ['Fecha', 'Hora', 'Torneo', 'Deporte', 'Equipo Local', 'Resultado', 'Equipo Visitante', 'Cancha', 'Sede', 'Árbitro', 'Estado'];
    const rows = this.partidosFiltrados().map(p => [
      p.fecha_partido,
      p.hora_inicio || '',
      p.torneo_nombre || '',
      p.nombre_deporte || '',
      p.nombre_equipo_local || '',
      `${p.resultado_local || 0} - ${p.resultado_visitante || 0}`,
      p.nombre_equipo_visitante || '',
      p.nombre_cancha || '',
      p.sede_nombre || '',
      p.nombre_arbitro || 'Sin asignar',
      this.getEstadoTexto(p.estado_partido)
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historial-partidos-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
