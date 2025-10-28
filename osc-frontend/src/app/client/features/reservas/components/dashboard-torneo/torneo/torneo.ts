import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Partido {
  equipo1: string;
  equipo2: string;
  logoEquipo1: string;
  logoEquipo2: string;
  golesEquipo1?: number;
  golesEquipo2?: number;
  estado: 'disponible' | 'finalizado' | 'en-curso';
  fecha?: string;
}

interface TorneoData {
  nombre: string;
  logo: string;
  jornada: string;
  partidos: Partido[];
}

@Component({
  selector: 'app-torneo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './torneo.html',
  styleUrls: ['./torneo.css']
})
export class Torneo implements OnInit {
  deporteSeleccionado: string = 'futbol';
  
  deportes = [
    { id: 'futbol', nombre: 'Futbol', icono: '⚽' },
    { id: 'padel', nombre: 'Padel', icono: '🎾' },
    { id: 'basket', nombre: 'Basket', icono: '🏀' }
  ];

  torneos: TorneoData[] = [];

  ngOnInit(): void {
    this.loadTorneos();
  }

  seleccionarDeporte(deporte: string): void {
    this.deporteSeleccionado = deporte;
    this.loadTorneos();
  }

  loadTorneos(): void {
    // Datos de ejemplo - TODO: Implementar la carga de torneos desde el servicio
    this.torneos = [
      {
        nombre: 'LaLiga',
        logo: '🔴',
        jornada: 'Jornada 1',
        partidos: [
          {
            equipo1: 'Sevilla',
            equipo2: 'Hoy',
            logoEquipo1: '⚪',
            logoEquipo2: '',
            golesEquipo1: 1,
            estado: 'disponible',
            fecha: 'Fin del partido'
          },
          {
            equipo1: 'Málaga',
            equipo2: 'Hoy',
            logoEquipo1: '🔵',
            logoEquipo2: '',
            golesEquipo1: 1,
            estado: 'disponible',
            fecha: 'Fin del partido'
          },
          {
            equipo1: 'FC Barcelona',
            equipo2: 'Hoy',
            logoEquipo1: '🔴🔵',
            logoEquipo2: '',
            golesEquipo1: 2,
            estado: 'disponible',
            fecha: 'Fin del partido'
          },
          {
            equipo1: 'Obrio',
            equipo2: 'Hoy',
            logoEquipo1: '⚪',
            logoEquipo2: '',
            golesEquipo1: 1,
            estado: 'disponible',
            fecha: 'Fin del partido'
          }
        ]
      },
      {
        nombre: 'Premier League',
        logo: '👑',
        jornada: 'Jornada 2',
        partidos: [
          {
            equipo1: 'Sevilla',
            equipo2: 'Hoy',
            logoEquipo1: '⚪',
            logoEquipo2: '',
            golesEquipo1: 1,
            estado: 'disponible',
            fecha: 'Fin del partido'
          },
          {
            equipo1: 'Málaga',
            equipo2: 'Hoy',
            logoEquipo1: '🔵',
            logoEquipo2: '',
            golesEquipo1: 1,
            estado: 'disponible',
            fecha: 'Fin del partido'
          },
          {
            equipo1: 'FC Barcelona',
            equipo2: 'Hoy',
            logoEquipo1: '🔴🔵',
            logoEquipo2: '',
            golesEquipo1: 2,
            estado: 'disponible',
            fecha: 'Fin del partido'
          },
          {
            equipo1: 'Obrio',
            equipo2: 'Hoy',
            logoEquipo1: '⚪',
            logoEquipo2: '',
            golesEquipo1: 1,
            estado: 'disponible',
            fecha: 'Fin del partido'
          }
        ]
      }
    ];
  }

  verClasificacion(torneo: string): void {
    console.log('Ver clasificación de:', torneo);
  }
}
