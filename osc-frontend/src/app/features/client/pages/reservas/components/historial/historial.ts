import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Partido } from '@shared/models/index';

@Component({
  selector: 'app-historial',
  imports: [CommonModule],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class Historial {
  nombreEquipo = 'Insanos FC';

  partidos: Partido[] = [
    {
      id_partido: 1,
      equipo_local: {
        id_equipo: 1,
        nombre: 'Insanos FC',
        logo_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_-G6DvnfJNnIdjo8XltsMHVdIHbTpvRWyfQ&s'
      },
      equipo_visitante: {
        id_equipo: 2,
        nombre: 'Grasosos FC',
        logo_url: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Sdlg.png'
      },
      anotaciones_local: 3,
      anotaciones_visitante: 1,
      fecha_finalizacion: '2025-10-28',
      estado: 'finalizado'
    },
    {
      id_partido: 2,
      equipo_local: {
        id_equipo: 3,
        nombre: 'Tigres Del Norte',
        logo_url: 'https://a3.espncdn.com/combiner/i?img=%2Fphoto%2F2022%2F0620%2Fr1027243_1296x729_16%2D9.jpg'
      },
      equipo_visitante: {
        id_equipo: 1,
        nombre: 'Insanos FC',
        logo_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_-G6DvnfJNnIdjo8XltsMHVdIHbTpvRWyfQ&s'
      },
      anotaciones_local: 2,
      anotaciones_visitante: 2,
      fecha_finalizacion: '2025-10-25',
      estado: 'finalizado'
    },
    {
      id_partido: 3,
      equipo_local: {
        id_equipo: 1,
        nombre: 'Insanos FC',
        logo_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_-G6DvnfJNnIdjo8XltsMHVdIHbTpvRWyfQ&s'
      },
      equipo_visitante: {
        id_equipo: 4,
        nombre: 'Los Cracks',
        logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Barcelona_Sporting_Club_Logo.png/1150px-Barcelona_Sporting_Club_Logo.png'
      },
      anotaciones_local: 1,
      anotaciones_visitante: 4,
      fecha_finalizacion: '2025-10-20',
      estado: 'finalizado'
    }
  ];

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  obtenerResultado(partido: Partido): 'victoria' | 'empate' | 'derrota' {
    const esLocal = partido.equipo_local.nombre === this.nombreEquipo;
    const esVisitante = partido.equipo_visitante.nombre === this.nombreEquipo;

    if (esLocal) {
      if (partido.anotaciones_local > partido.anotaciones_visitante) return 'victoria';
      if (partido.anotaciones_local < partido.anotaciones_visitante) return 'derrota';
      return 'empate';
    } else if (esVisitante) {
      if (partido.anotaciones_visitante > partido.anotaciones_local) return 'victoria';
      if (partido.anotaciones_visitante < partido.anotaciones_local) return 'derrota';
      return 'empate';
    }
    return 'empate';
  }

  // Helper para convertir URLs de imagen a formato WebP
  toWebP(url: string): string {
    return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }

  // Helper para convertir URLs de imagen a formato AVIF
  toAVIF(url: string): string {
    return url.replace(/\.(jpg|jpeg|png)$/i, '.avif');
  }
}
