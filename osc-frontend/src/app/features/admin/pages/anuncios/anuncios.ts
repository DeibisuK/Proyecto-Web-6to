import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Anuncio } from '../../../../shared/models/anuncio.model';

@Component({
  selector: 'app-anuncios',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './anuncios.html',
  styleUrls: ['./anuncios.css']
})
export class Anuncios implements OnInit {
  anuncioForm!: FormGroup;
  anuncios: Anuncio[] = [];
  isSubmitting = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarAnuncios();
  }

  inicializarFormulario(): void {
    this.anuncioForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      tipo: ['info', Validators.required]
    });
  }

  cargarAnuncios(): void {
    // Mock data para demostración
    this.anuncios = [
      {
        id: 1,
        titulo: '¡Nueva funcionalidad disponible!',
        descripcion: 'Ahora puedes crear equipos y gestionar tus torneos de forma más fácil.',
        tipo: 'info',
        creado_en: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        actualizado_en: new Date().toISOString()
      },
      {
        id: 2,
        titulo: '🎉 Promoción especial',
        descripcion: '50% de descuento en todas las inscripciones de torneos este mes.',
        tipo: 'promotion',
        creado_en: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        actualizado_en: new Date().toISOString()
      },
      {
        id: 3,
        titulo: 'Mantenimiento programado',
        descripcion: 'El sistema estará en mantenimiento el próximo sábado de 2:00 AM a 6:00 AM.',
        tipo: 'warning',
        creado_en: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        actualizado_en: new Date().toISOString()
      }
    ];
  }

  onSubmit(): void {
    if (this.anuncioForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const nuevoAnuncio: Anuncio = {
        id: this.anuncios.length + 1,
        titulo: this.anuncioForm.value.titulo,
        descripcion: this.anuncioForm.value.descripcion,
        tipo: this.anuncioForm.value.tipo,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      };

      // Simular delay de red
      setTimeout(() => {
        this.anuncios.unshift(nuevoAnuncio);
        this.mostrarNotificacion('Anuncio creado exitosamente', 'success');
        this.anuncioForm.reset({ tipo: 'info' });
        this.isSubmitting = false;
      }, 500);
    } else {
      this.mostrarNotificacion('Por favor completa todos los campos correctamente', 'error');
    }
  }

  resetForm(): void {
    this.anuncioForm.reset({ tipo: 'info' });
  }

  getTipoIcon(tipo: string): string {
    const iconos: { [key: string]: string } = {
      info: 'info',
      success: 'check_circle',
      warning: 'warning',
      error: 'error',
      promotion: 'local_offer'
    };
    return iconos[tipo] || 'notifications';
  }

  getTipoLabel(tipo: string): string {
    const labels: { [key: string]: string } = {
      info: 'Información',
      success: 'Éxito',
      warning: 'Advertencia',
      error: 'Error/Urgente',
      promotion: 'Promoción'
    };
    return labels[tipo] || 'Información';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const ahora = new Date();
    const diff = ahora.getTime() - date.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (dias === 0) {
      return 'Hoy';
    } else if (dias === 1) {
      return 'Ayer';
    } else if (dias < 7) {
      return `Hace ${dias} días`;
    } else {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error'): void {
    window.dispatchEvent(
      new CustomEvent('showToast', {
        detail: { message: mensaje, type: tipo }
      })
    );
  }
}
