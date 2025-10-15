import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrearEquipo } from '../crear-equipo/crear-equipo';
import { Equipo } from '../../../../../../core/models/equipo.model';

@Component({
  selector: 'app-list-equipo',
  imports: [CommonModule, FormsModule, CrearEquipo],
  templateUrl: './list-equipo.html',
  styleUrl: './list-equipo.css'
})
export class ListEquipo implements OnInit {
  equipos: Equipo[] = [];
  equiposFiltrados: Equipo[] = [];
  searchTerm = '';
  mostrarModal = false;
  mostrarModalEliminar = false;
  equipoSeleccionado?: Equipo;
  equipoAEliminar?: Equipo;

  deportes: { [key: number]: string } = {
    1: 'Fútbol',
    2: 'Básquetbol',
    3: 'Tenis',
    4: 'Pádel'
  };

  ngOnInit() {
    this.cargarEquipos();
  }

  cargarEquipos() {
    this.equipos = [
      {
        id_equipo: 1,
        nombre_equipo: 'Los Insanos FC',
        descripcion: 'Equipo de fútbol de insanos',
        logo_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_-G6DvnfJNnIdjo8XltsMHVdIHbTpvRWyfQ&s',
        id_deporte: 1
      },
      {
        id_equipo: 2,
        nombre_equipo: 'Barcelona SC',
        descripcion: 'Equipo competitivo con más de 5 años de experiencia',
        logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Barcelona_Sporting_Club_Logo.png/1150px-Barcelona_Sporting_Club_Logo.png',
        id_deporte: 2
      }
    ];
    
    this.equiposFiltrados = [...this.equipos];
  }

  obtenerNombreDeporte(id: number): string {
    return this.deportes[id] || 'Sin especificar';
  }

  filtrarEquipos() {
    const term = this.searchTerm.toLowerCase().trim();
    
    if (!term) {
      this.equiposFiltrados = [...this.equipos];
      return;
    }

    this.equiposFiltrados = this.equipos.filter(equipo =>
      equipo.nombre_equipo.toLowerCase().includes(term) ||
      equipo.descripcion.toLowerCase().includes(term)
    );
  }

  abrirModalCrear() {
    this.equipoSeleccionado = undefined;
    this.mostrarModal = true;
    document.body.classList.add('modal-open');
  }

  editarEquipo(equipo: Equipo) {
    this.equipoSeleccionado = { ...equipo };
    this.mostrarModal = true;
    document.body.classList.add('modal-open');
  }

  eliminarEquipo(equipo: Equipo) {
    this.equipoAEliminar = equipo;
    this.mostrarModalEliminar = true;
    document.body.classList.add('modal-open');
  }

  confirmarEliminacion() {
    if (this.equipoAEliminar) {
      // Aquí conectarías con tu servicio para eliminar
      this.equipos = this.equipos.filter(e => e.id_equipo !== this.equipoAEliminar!.id_equipo);
      this.filtrarEquipos();
      
      console.log('Equipo eliminado:', this.equipoAEliminar.nombre_equipo);
    }
    this.cerrarModalEliminar();
  }

  onEquipoGuardado(equipo: Equipo) {
    if (this.equipoSeleccionado) {
      // Editar equipo existente
      const index = this.equipos.findIndex(e => e.id_equipo === equipo.id_equipo);
      if (index !== -1) {
        this.equipos[index] = equipo;
      }
    } else {
      // Crear nuevo equipo
      equipo.id_equipo = this.equipos.length > 0 
        ? Math.max(...this.equipos.map(e => e.id_equipo)) + 1 
        : 1;
      this.equipos.push(equipo);
    }
    
    this.filtrarEquipos();
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.equipoSeleccionado = undefined;
    document.body.classList.remove('modal-open');
  }

  cerrarModalEliminar() {
    this.mostrarModalEliminar = false;
    this.equipoAEliminar = undefined;
    document.body.classList.remove('modal-open');
  }
}
