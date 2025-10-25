import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Equipo } from '../../../core/models/equipo.model';
import { EquipoService } from '../../../core/services/equipo.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Deporte } from '../../../core/models/deporte.model';
import { DeporteService } from '../../../core/services/deportes.service';

@Component({
  selector: 'app-equipos',
  imports: [CommonModule, FormsModule],
  templateUrl: './equipos.html',
  styleUrl: './equipos.css'
})
export class Equipos implements OnInit {
  equipos: Equipo[] = [];
  equiposFiltrados: Equipo[] = [];
  equiposPaginados: Equipo[] = [];

  searchTerm = '';
  filtroDeporte: number | null = null;

  // Paginación
  currentPage = 1;
  itemsPerPage = 20;
  totalPages = 1;
  pages: number[] = [];

  // Loading y modales
  isLoading = true;
  mostrarModalEliminar = false;
  mostrarModalEditar = false;
  equipoSeleccionado: Equipo | null = null;

  // Logo preview para modal de edición
  logoPreviewEdit: string | null = null;
  selectedFileEdit: File | null = null;

  // Skeleton loading
  skeletonItems = Array(20).fill(0);

  deporte: Deporte[] = [];

  constructor(
    private equipoService: EquipoService,
    private deporteService:DeporteService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    this.deporteService.getDeportes().subscribe({
      next: (deportes) => {
        this.deporte = deportes;
      },
      error: (error) => {
        console.error('Error al cargar deportes:', error);
        this.notificationService.error('Error al cargar los deportes');
      }
    });
    this.cargarEquipos();
  }

  cargarEquipos() {
    this.isLoading = true;
    // Admin ve TODOS los equipos
    this.equipoService.getEquipos().subscribe({
      next: (equipos) => {
        this.equipos = equipos;
        this.equiposFiltrados = [...equipos];
        this.isLoading = false;
        this.aplicarPaginacion();
      },
      error: (error) => {
        console.error('Error al cargar equipos:', error);
        this.notificationService.error('Error al cargar los equipos');
        this.isLoading = false;
      }
    });
  }

  filtrarEquipos() {
    this.equiposFiltrados = this.equipos.filter(equipo => {
      const matchSearch =
        equipo.nombre_equipo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        equipo.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchDeporte = !this.filtroDeporte || equipo.id_deporte === this.filtroDeporte;

      return matchSearch && matchDeporte;
    });

    this.currentPage = 1;
    this.aplicarPaginacion();
  }

  aplicarPaginacion() {
    this.totalPages = Math.ceil(this.equiposFiltrados.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.equiposPaginados = this.equiposFiltrados.slice(startIndex, endIndex);
  }

  onSearchChange(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.filtrarEquipos();
  }

  onFiltroDeporteChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.filtroDeporte = value ? parseInt(value) : null;
    this.filtrarEquipos();
  }

  cambiarPagina(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.aplicarPaginacion();
      // Scroll suave al inicio de la lista
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  obtenerNombreDeporte(id?: number): string {
    if (!id) return 'Sin especificar';
    return this.deporte.find(deporte => deporte.id_deporte === id)?.nombre_deporte || 'Desconocido';
  }

  abrirModalEditar(equipo: Equipo) {
    this.equipoSeleccionado = { ...equipo };
    this.logoPreviewEdit = null;
    this.selectedFileEdit = null;
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar() {
    this.mostrarModalEditar = false;
    this.equipoSeleccionado = null;
    this.logoPreviewEdit = null;
    this.selectedFileEdit = null;
  }

  onFileSelectedEdit(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFileEdit = input.files[0];

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreviewEdit = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFileEdit);
    }
  }

  guardarCambios() {
    if (!this.equipoSeleccionado) return;

    this.equipoService.updateEquipo(this.equipoSeleccionado.id_equipo, this.equipoSeleccionado).subscribe({
      next: () => {
        this.notificationService.success('Equipo actualizado exitosamente');
        this.cerrarModalEditar();
        this.cargarEquipos();
      },
      error: (error) => {
        console.error('Error al actualizar equipo:', error);
        this.notificationService.error('Error al actualizar el equipo');
      }
    });
  }

  confirmarEliminar(equipo: Equipo) {
    this.equipoSeleccionado = equipo;
    this.mostrarModalEliminar = true;
  }

  cerrarModalEliminar() {
    this.mostrarModalEliminar = false;
    this.equipoSeleccionado = null;
  }

  eliminarEquipo() {
    if (!this.equipoSeleccionado) return;

    this.equipoService.deleteEquipoAdmin(this.equipoSeleccionado.id_equipo).subscribe({
      next: () => {
        this.notificationService.success('Equipo eliminado exitosamente');
        this.cerrarModalEliminar();
        this.cargarEquipos();
      },
      error: (error) => {
        console.error('Error al eliminar equipo:', error);
        this.notificationService.error('Error al eliminar el equipo');
      }
    });
  }
}
