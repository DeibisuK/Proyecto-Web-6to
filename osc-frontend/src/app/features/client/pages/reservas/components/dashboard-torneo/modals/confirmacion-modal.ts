import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmacionConfig {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  tipo?: 'danger' | 'warning' | 'info' | 'success';
  icono?: string;
}

@Component({
  selector: 'app-confirmacion-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmacion-modal.html',
  styleUrls: ['./confirmacion-modal.css', '../shared-styles.css']
})
export class ConfirmacionModalComponent {
  @Input() isOpen: boolean = false;
  @Input() config: ConfirmacionConfig = {
    titulo: 'Confirmar acción',
    mensaje: '¿Está seguro de realizar esta acción?',
    textoConfirmar: 'Confirmar',
    textoCancelar: 'Cancelar',
    tipo: 'warning'
  };

  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  onConfirmar(): void {
    this.confirmar.emit();
    this.close();
  }

  onCancelar(): void {
    this.cancelar.emit();
    this.close();
  }

  close(): void {
    this.isOpen = false;
    this.cerrar.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  getIconoSVG(): string {
    if (this.config.icono) return this.config.icono;

    const iconos: Record<string, string> = {
      'danger': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>`,
      'warning': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>`,
      'info': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>`,
      'success': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>`
    };

    return iconos[this.config.tipo || 'warning'] || iconos['warning'];
  }
}
