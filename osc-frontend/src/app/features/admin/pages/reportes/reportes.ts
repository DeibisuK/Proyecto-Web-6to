import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  date: string;
  size: string;
}

interface Toast {
  type: string;
  label: string;
}

@Component({
  selector: 'app-reportes',
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes implements OnInit {
  showFilters = false;
  selectedMonth = new Date().getMonth();
  selectedYear = 2024;
  expandedCategory: string | null = null;  // Inicialmente ninguno expandido
  toast: Toast | null = null;

  months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  years = [2023, 2024, 2025];

  reportCategories: ReportCategory[] = [
    {
      id: 'canchas',
      title: 'Canchas',
      iconName: 'track_changes',
      options: [
        { id: 'mas-usada', label: 'Cancha más utilizada' },
        { id: 'mejor-puntuada', label: 'Mejor puntuada' },
        { id: 'ingresos-cancha', label: 'Ingresos por cancha' },
        { id: 'ocupacion', label: 'Tasa de ocupación' },
        { id: 'horarios-pico', label: 'Horarios pico' }
      ]
    },
    {
      id: 'reservas',
      title: 'Reservas',
      iconName: 'calendar_today',
      options: [
        { id: 'total-reservas', label: 'Total de reservas' },
        { id: 'cancelaciones', label: 'Cancelaciones' },
        { id: 'reservas-deporte', label: 'Reservas por deporte' },
        { id: 'reservas-dia', label: 'Reservas por día' },
        { id: 'duracion-promedio', label: 'Duración promedio' }
      ]
    },
    {
      id: 'usuarios',
      title: 'Usuarios',
      iconName: 'group',
      options: [
        { id: 'nuevos-usuarios', label: 'Nuevos usuarios' },
        { id: 'usuarios-frecuentes', label: 'Usuarios frecuentes' },
        { id: 'retencion', label: 'Tasa de retención' },
        { id: 'usuarios-deporte', label: 'Usuarios por deporte' }
      ]
    },
    {
      id: 'ingresos',
      title: 'Ingresos',
      iconName: 'attach_money',
      options: [
        { id: 'ingresos-totales', label: 'Ingresos totales' },
        { id: 'ingresos-deporte', label: 'Ingresos por deporte' },
        { id: 'ticket-promedio', label: 'Ticket promedio' },
        { id: 'proyeccion', label: 'Proyección mensual' }
      ]
    }
  ];

  recentReports: RecentReport[] = [
    { name: 'Reporte Mensual - Octubre 2024', type: 'pdf', date: '01 Nov 2024', size: '2.4 MB' },
    { name: 'Análisis de Ocupación Q3', type: 'excel', date: '28 Oct 2024', size: '1.8 MB' },
    { name: 'Ingresos por Deporte - Sept', type: 'pdf', date: '15 Oct 2024', size: '1.2 MB' }
  ];

  ngOnInit() {
    // Inicialización si es necesaria
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  clearFilters() {
    this.selectedMonth = new Date().getMonth();
    this.selectedYear = 2024;
  }

  get hasActiveFilters(): boolean {
    return this.selectedMonth !== new Date().getMonth() || this.selectedYear !== 2024;
  }

  toggleCategory(categoryId: string) {
    this.expandedCategory = this.expandedCategory === categoryId ? null : categoryId;
    console.log('toggleCategory:', categoryId, '| expandedCategory:', this.expandedCategory);
  }

  isCategoryExpanded(categoryId: string): boolean {
    const isExpanded = this.expandedCategory === categoryId;
    return isExpanded;
  }

  showToast(type: string, label: string) {
    this.toast = { type, label };
    setTimeout(() => {
      this.toast = null;
    }, 3000);
  }

  handleExport(type: string, label: string) {
    this.showToast(type, label);
    console.log(`Generando ${type}: ${label}`);
  }
}
