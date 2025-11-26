import { Component, Input, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TiempoRealService } from '../../../../shared/services/tiempo-real.service';
import { EstadoPartidoTiempoReal } from '../../../../shared/interfaces/match.interfaces';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tiempo-real-control',
  imports: [CommonModule, FormsModule],
  templateUrl: './tiempo-real-control.html',
  styleUrl: './tiempo-real-control.css',
})
export class TiempoRealControl implements OnInit, OnDestroy {
  @Input() idPartido!: number;

  private tiempoRealService = inject(TiempoRealService);
  private subscription?: Subscription;

  estado = signal<EstadoPartidoTiempoReal | null>(null);
  cargando = signal<boolean>(false);
  periodo = signal<number>(1);

  ngOnInit(): void {
    this.cargarEstado();
    this.iniciarWatcher();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  cargarEstado(): void {
    this.cargando.set(true);
    this.tiempoRealService.getEstadoPartido(this.idPartido).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.estado.set(response.data);
          this.periodo.set(response.data.periodo_actual || 1);
        }
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar estado:', error);
        this.cargando.set(false);
      }
    });
  }

  iniciarWatcher(): void {
    this.subscription = this.tiempoRealService.watchEstadoPartido(this.idPartido, 3000).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.estado.set(response.data);
        }
      },
      error: (error) => console.error('Error en watcher:', error)
    });
  }

  iniciarCronometro(): void {
    this.cargando.set(true);
    this.tiempoRealService.iniciarCronometro({
      id_partido: this.idPartido,
      periodo: this.periodo()
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.cargarEstado();
        }
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al iniciar:', error);
        alert('Error al iniciar el cronómetro');
        this.cargando.set(false);
      }
    });
  }

  pausarCronometro(): void {
    this.tiempoRealService.pausarCronometro(this.idPartido).subscribe({
      next: () => this.cargarEstado(),
      error: (error) => {
        console.error('Error al pausar:', error);
        alert('Error al pausar el cronómetro');
      }
    });
  }

  detenerCronometro(): void {
    if (!confirm('¿Finalizar el partido?')) return;

    this.tiempoRealService.detenerCronometro(this.idPartido).subscribe({
      next: () => this.cargarEstado(),
      error: (error) => {
        console.error('Error al detener:', error);
        alert('Error al detener el cronómetro');
      }
    });
  }

  reiniciarCronometro(): void {
    if (!confirm('¿Reiniciar el tiempo a 0?')) return;

    this.tiempoRealService.reiniciarCronometro(this.idPartido).subscribe({
      next: () => this.cargarEstado(),
      error: (error) => {
        console.error('Error al reiniciar:', error);
        alert('Error al reiniciar el cronómetro');
      }
    });
  }

  formatearTiempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  }

  get estadoCss(): string {
    const est = this.estado()?.estado;
    if (est === 'corriendo') return 'running';
    if (est === 'pausado') return 'paused';
    if (est === 'detenido' || est === 'finalizado') return 'stopped';
    return 'not-started';
  }
}
