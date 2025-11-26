import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventosPartidoService } from '../../../../shared/services/eventos-partido.service';
import { ConfiguracionEventosService } from '../../../../shared/services/configuracion-eventos.service';
import { Evento, ConfiguracionEvento, RegistrarEventoRequest } from '../../../../shared/interfaces/match.interfaces';

@Component({
  selector: 'app-eventos-partido',
  imports: [CommonModule, FormsModule],
  templateUrl: './eventos-partido.html',
  styleUrl: './eventos-partido.css',
})
export class EventosPartido implements OnInit {
  @Input() idPartido!: number;
  @Input() idDeporte: number = 1; // Default: Fútbol

  private eventosService = inject(EventosPartidoService);
  private configService = inject(ConfiguracionEventosService);

  eventos = signal<Evento[]>([]);
  eventosConfig = signal<ConfiguracionEvento[]>([]);
  cargando = signal<boolean>(false);

  // Formulario
  nuevoEvento: RegistrarEventoRequest = {
    id_partido: 0,
    id_equipo: 0,
    id_jugador: undefined,
    tipo_evento: '',
    minuto: 0,
    periodo: 1,
    detalles: {}
  };

  ngOnInit(): void {
    this.nuevoEvento.id_partido = this.idPartido;
    this.cargarEventosConfig();
    this.cargarEventos();
  }

  cargarEventosConfig(): void {
    this.configService.getEventosByDeporte(this.idDeporte).subscribe({
      next: (response) => {
        if (response.success) {
          this.eventosConfig.set(response.data);
        }
      },
      error: (error) => console.error('Error al cargar configuración:', error)
    });
  }

  cargarEventos(): void {
    this.cargando.set(true);
    this.eventosService.getEventosByPartido(this.idPartido).subscribe({
      next: (response) => {
        if (response.success) {
          this.eventos.set(response.data);
        }
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar eventos:', error);
        this.cargando.set(false);
      }
    });
  }

  registrarEvento(): void {
    if (!this.nuevoEvento.tipo_evento || !this.nuevoEvento.id_equipo) {
      alert('Complete todos los campos requeridos');
      return;
    }

    this.cargando.set(true);
    this.eventosService.registrarEvento(this.nuevoEvento).subscribe({
      next: (response) => {
        if (response.success) {
          this.cargarEventos();
          this.resetFormulario();
          alert('Evento registrado exitosamente');
        }
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al registrar evento:', error);
        alert('Error al registrar el evento');
        this.cargando.set(false);
      }
    });
  }

  registrarEventoRapido(tipoEvento: string, idEquipo: number): void {
    this.nuevoEvento.tipo_evento = tipoEvento;
    this.nuevoEvento.id_equipo = idEquipo;
    // Aquí se podría abrir un modal para completar detalles
    this.registrarEvento();
  }

  eliminarEvento(idEvento: number): void {
    if (!confirm('¿Eliminar este evento?')) return;

    this.eventosService.eliminarEvento(this.idPartido, idEvento).subscribe({
      next: (response) => {
        if (response.success) {
          this.cargarEventos();
        }
      },
      error: (error) => {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el evento');
      }
    });
  }

  resetFormulario(): void {
    this.nuevoEvento = {
      id_partido: this.idPartido,
      id_equipo: 0,
      id_jugador: undefined,
      tipo_evento: '',
      minuto: 0,
      periodo: 1,
      detalles: {}
    };
  }

  getEventoIcon(tipoEvento: string): string {
    const config = this.eventosConfig().find(e => e.tipo_evento === tipoEvento);
    return config?.icono || '⚽';
  }

  getEventoColor(tipoEvento: string): string {
    const config = this.eventosConfig().find(e => e.tipo_evento === tipoEvento);
    return config?.color || '#667eea';
  }
}
