import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NotificationService } from '@core/services/notification.service';
import { ReportsService } from '../../../../shared/services/reports.service';

interface ReportOption {
  id: string;
  label: string;
}

interface ReportCategory {
  id: string;
  title: string;
  iconName: string;
  options: ReportOption[];
}

interface RecentReport {
  name: string;
  type: 'pdf' | 'excel';
  date: Date;
  category: string;
  option: string;
}

@Component({
  selector: 'app-reportes',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes implements OnInit {
  private notificationService = inject(NotificationService);
  private reportsService = inject(ReportsService);

  showFilters = false;
  selectedMonth = -1; // -1 representa 'Todos los meses'
  selectedYear = 2025;
  expandedCategory: string | null = null;  // Inicialmente ninguno expandido

  months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  years = [2023, 2024, 2025];

  recentReports: RecentReport[] = [];

  reportCategories: ReportCategory[] = [
    {
      id: 'canchas',
      title: 'Canchas',
      iconName: 'sports_soccer',
      options: [
        { id: 'listar-canchas', label: 'Listar Canchas' },
        { id: 'mas-utilizadas', label: 'Canchas Más Utilizadas' },
        { id: 'mejor-puntuadas', label: 'Canchas Mejor Puntuadas' },
        { id: 'ingresos-cancha', label: 'Ingresos por Cancha' },
        { id: 'tasa-ocupacion', label: 'Tasa de Ocupación' }
      ]
    },
    {
      id: 'arbitros',
      title: 'Árbitros',
      iconName: 'sports',
      options: [
        { id: 'listar-arbitros', label: 'Listar Árbitros' },
        { id: 'mas-partidos', label: 'Árbitros con Más Partidos' },
        { id: 'arbitros-deporte', label: 'Árbitros por Deporte' },
        { id: 'disponibilidad', label: 'Disponibilidad de Árbitros' }
      ]
    },
    {
      id: 'ingresos',
      title: 'Ingresos',
      iconName: 'attach_money',
      options: [
        { id: 'listar-ingresos', label: 'Listar Ingresos' },
        { id: 'ingresos-totales', label: 'Ingresos Totales' },
        { id: 'ingresos-categoria', label: 'Ingresos por Categoría' },
        { id: 'ingresos-deporte', label: 'Ingresos por Deporte' },
        { id: 'proyeccion', label: 'Proyección de Ingresos' }
      ]
    },
    {
      id: 'productos',
      title: 'Productos',
      iconName: 'inventory_2',
      options: [
        { id: 'listar-productos', label: 'Listar Productos' },
        { id: 'mas-vendidos', label: 'Productos Más Vendidos' },
        { id: 'bajo-stock', label: 'Productos con Bajo Stock' },
        { id: 'productos-categoria', label: 'Productos por Categoría' },
        { id: 'rentabilidad', label: 'Rentabilidad de Productos' }
      ]
    },
    {
      id: 'equipos',
      title: 'Equipos',
      iconName: 'groups',
      options: [
        { id: 'listar-equipos', label: 'Listar Equipos' },
        { id: 'mas-activos', label: 'Equipos Más Activos' },
        { id: 'equipos-deporte', label: 'Equipos por Deporte' },
        { id: 'equipos-torneos', label: 'Equipos en Torneos' }
      ]
    },
    {
      id: 'partidos',
      title: 'Partidos',
      iconName: 'event',
      options: [
        { id: 'listar-partidos', label: 'Listar Partidos' },
        { id: 'partidos-estado', label: 'Partidos por Estado' },
        { id: 'partidos-deporte', label: 'Partidos por Deporte' },
        { id: 'partidos-torneo', label: 'Partidos de Torneo' }
      ]
    },
    {
      id: 'reservas',
      title: 'Reservas',
      iconName: 'calendar_today',
      options: [
        { id: 'listar-reservas', label: 'Listar Reservas' },
        { id: 'reservas-estado', label: 'Reservas por Estado' },
        { id: 'cancelaciones', label: 'Cancelaciones' },
        { id: 'reservas-deporte', label: 'Reservas por Deporte' },
        { id: 'reservas-dia', label: 'Reservas por Día de Semana' }
      ]
    },
    {
      id: 'sedes',
      title: 'Sedes',
      iconName: 'location_on',
      options: [
        { id: 'listar-sedes', label: 'Listar Sedes' },
        { id: 'sedes-mas-utilizadas', label: 'Sedes Más Utilizadas' },
        { id: 'sedes-por-ciudad', label: 'Sedes por Ciudad' },
        { id: 'ingresos-por-sede', label: 'Ingresos por Sede' }
      ]
    },
    {
      id: 'torneos',
      title: 'Torneos',
      iconName: 'emoji_events',
      options: [
        { id: 'listar-torneos', label: 'Listar Torneos' },
        { id: 'torneos-activos', label: 'Torneos Activos' },
        { id: 'torneos-deporte', label: 'Torneos por Deporte' },
        { id: 'equipos-torneo', label: 'Equipos por Torneo' }
      ]
    },
    {
      id: 'usuarios',
      title: 'Usuarios',
      iconName: 'group',
      options: [
        { id: 'listar-usuarios', label: 'Listar Usuarios' },
        { id: 'nuevos-usuarios', label: 'Nuevos Usuarios' },
        { id: 'usuarios-frecuentes', label: 'Usuarios Frecuentes' },
        { id: 'usuarios-por-deporte', label: 'Usuarios por Deporte' },
      ]
    }
  ];

  ngOnInit() {
    this.loadRecentReports();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  clearFilters() {
    this.selectedMonth = -1; // Todos los meses
    this.selectedYear = 2025;
  }

  get hasActiveFilters(): boolean {
    return this.selectedMonth !== -1 || this.selectedYear !== new Date().getFullYear();
  }

  loadRecentReports() {
    const stored = localStorage.getItem('recentReports');
    if (stored) {
      this.recentReports = JSON.parse(stored);
      // Mantener solo los últimos 5 reportes
      this.recentReports = this.recentReports.slice(0, 5);
    }
  }

  saveRecentReport(report: RecentReport) {
    this.recentReports.unshift(report);
    // Mantener solo los últimos 5
    this.recentReports = this.recentReports.slice(0, 5);
    localStorage.setItem('recentReports', JSON.stringify(this.recentReports));
  }

  getTimeSinceDownload(date: Date): string {
    const now = new Date();
    const downloadDate = new Date(date);
    const diffMs = now.getTime() - downloadDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  }

  toggleCategory(categoryId: string) {
    this.expandedCategory = this.expandedCategory === categoryId ? null : categoryId;
    console.log('toggleCategory:', categoryId, '| expandedCategory:', this.expandedCategory);
  }

  isCategoryExpanded(categoryId: string): boolean {
    const isExpanded = this.expandedCategory === categoryId;
    return isExpanded;
  }

  handleExport(categoryId: string, optionId: string, type: string, label: string) {
    // Preparar filtros: si selectedMonth es -1 (Todos), no enviar el mes
    const filters: any = {
      year: this.selectedYear
    };

    // Solo agregar el mes si no es "Todos" (-1)
    if (this.selectedMonth !== -1) {
      filters.month = this.selectedMonth + 1; // +1 porque los meses en JS son 0-11 y en SQL son 1-12
    }

    const periodo = this.selectedMonth === -1
      ? `año ${this.selectedYear}`
      : `${this.months[this.selectedMonth]} ${this.selectedYear}`;

    const formatLabel = type === 'pdf' ? 'PDF' : 'Excel';
    const loadingKey = `report-${Date.now()}`;
    this.notificationService.loading(`Generando reporte ${formatLabel}: ${label} (${periodo})`, loadingKey);

    // Llamar al backend
    this.reportsService.generateReport({
      category: categoryId,
      option: optionId,
      filters,
      format: type.toLowerCase() as 'pdf' | 'excel'
    }).subscribe({
      next: (blob) => {
        // Descargar el archivo
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const extension = type.toLowerCase() === 'pdf' ? 'pdf' : 'xlsx';
        const filename = `Reporte_${label.replace(/\s+/g, '_')}_${periodo.replace(/\s+/g, '_')}.${extension}`;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);

        // Guardar en reportes recientes
        this.saveRecentReport({
          name: filename,
          type: type.toLowerCase() as 'pdf' | 'excel',
          date: new Date(),
          category: categoryId,
          option: optionId
        });

        // Dismiss loading toast y mostrar success
        this.notificationService.dismiss();
        setTimeout(() => {
          this.notificationService.success(`Reporte ${formatLabel} generado exitosamente`);
        }, 100);
      },
      error: (error) => {
        console.error('Error generando reporte:', error);
        // Dismiss loading toast y mostrar error
        this.notificationService.dismiss();
        setTimeout(() => {
          this.notificationService.error('Error al generar el reporte. Por favor intente nuevamente.');
        }, 100);
      }
    });
  }
}
