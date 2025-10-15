import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Sede } from '../../../../core/models/sede.model';

@Component({
  selector: 'app-list-sede',
  imports: [CommonModule, RouterLink],
  templateUrl: './list-sede.html',
  styleUrl: './list-sede.css'
})
export class ListSede implements OnInit {
  sedes: Sede[] = [];
  sedesFiltradas: Sede[] = [];
  searchTerm: string = '';
  estadoFiltro: string = '';

  ngOnInit(): void {
    this.cargarSedes();
  }

  cargarSedes(): void {
    this.sedes = [
      {
        id_sede: 1,
        nombre: 'Sede Centro',
        direccion: 'Av. Principal 123',
        ciudad: 'Machala',
        telefono: '01-234-5678',
        email: 'centro@oscgmail.com',
        estado: 'Activo',
        latitud: -12.345678,
        longitud: -12.345678
      },
      {
        id_sede: 2,
        nombre: 'Sede Pasaje',
        direccion: 'Av. 16 de Junio lateral al Malecon',
        ciudad: 'Guayaquil',
        telefono: '01-345-6789',
        email: 'centro@oscgmail.com',
        estado: 'Activo',
        latitud: -12.345678,
        longitud: -12.345678
      },
      {
        id_sede: 3,
        nombre: 'Sede Perusalen',
        direccion: 'Av. Principal 10 de Agosto',
        ciudad: 'Huaquillas',
        telefono: '01-456-7890',
        email: 'perusalen@oscgmail.com',
        estado: 'Activo',
        latitud: -12.345678,
        longitud: -12.345678
      },
      {
        id_sede: 4,
        nombre: 'Sede Tia',
        direccion: 'Diagonal al Tia',
        ciudad: 'Lima',
        telefono: '01-567-8901',
        email: 'sedeTia@oscgmail.com',
        estado: 'Mantenimiento',
        latitud: -12.345678,
        longitud: -12.345678
      }
    ];
    
    this.sedesFiltradas = [...this.sedes];
  }

  filtrarSedes(): void {
    this.sedesFiltradas = this.sedes.filter(sede => {
      const matchSearch = !this.searchTerm || 
        sede.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        sede.direccion.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        sede.ciudad?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchEstado = !this.estadoFiltro || sede.estado === this.estadoFiltro;

      return matchSearch && matchEstado;
    });
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.filtrarSedes();
  }

  onEstadoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.estadoFiltro = select.value;
    this.filtrarSedes();
  }

  eliminarSede(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta sede?')) {
      const index = this.sedes.findIndex(s => s.id_sede === id);
      if (index !== -1) {
        this.sedes.splice(index, 1);
        this.filtrarSedes();
        this.mostrarNotificacion('Sede eliminada correctamente', 'success');
      }
    }
  }

  getMapUrl(latitud?: number, longitud?: number): string {
    if (!latitud || !longitud) {
      return 'https://via.placeholder.com/400x200/2ECC71/FFFFFF?text=Mapa+No+Disponible';
    }
    // Placeholder para Google Maps - cuando integres la API real, usa esta URL
    return `https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_webp,s_webp/agenciadepublicidadecuador.com/wp-content/uploads/2019/02/google-maps.png`;
  }

  private mostrarNotificacion(message: string, type: 'success' | 'error'): void {
    window.dispatchEvent(
      new CustomEvent('showToast', {
        detail: { message, type }
      })
    );
  }
}
