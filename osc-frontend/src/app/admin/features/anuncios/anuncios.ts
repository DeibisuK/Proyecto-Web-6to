import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Anuncio } from '../../../core/models/anuncio.model';

@Component({
  selector: 'app-anuncios',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './anuncios.html',
  styleUrl: './anuncios.css'
})
export class Anuncios implements OnInit {
  anuncioForm!: FormGroup;
  anuncios: Anuncio[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarAnuncios();
  }

  inicializarFormulario(): void {
    const ahora = new Date();
    const en24Horas = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

    this.anuncioForm = this.fb.group({
      mensaje: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      color_texto: ['#ffffff', Validators.required],
      color_inicio: ['#2ECC71', Validators.required],
      color_fin: ['#27AE60', Validators.required],
      fecha_inicio: [this.formatDateTimeLocal(ahora), Validators.required],
      fecha_fin: [this.formatDateTimeLocal(en24Horas), Validators.required],
      estado: ['Inactivo', Validators.required]
    });
  }

  cargarAnuncios(): void {
    // Datos de ejemplo
    this.anuncios = [
      {
        id: 1,
        mensaje: '¡Reserva tu cancha de fútbol con 20% de descuento este fin de semana!',
        color_texto: '#ffffff',
        color_inicio: '#2ECC71',
        color_fin: '#27AE60',
        fecha_inicio: '2025-10-15T10:00',
        fecha_fin: '2025-10-20T23:59',
        estado: 'Activo',
        creado_en: '2025-10-15T08:00:00',
        actualizado_en: '2025-10-15T08:00:00'
      },
      {
        id: 2,
        mensaje: 'Mantenimiento programado para las canchas 3 y 4 el próximo lunes',
        color_texto: '#000000',
        color_inicio: '#F39C12',
        color_fin: '#E67E22',
        fecha_inicio: '2025-10-18T09:00',
        fecha_fin: '2025-10-18T18:00',
        estado: 'Inactivo',
        creado_en: '2025-10-14T15:30:00',
        actualizado_en: '2025-10-14T15:30:00'
      },
      {
        id: 3,
        mensaje: 'Torneo relámpago de baloncesto - ¡Inscripciones abiertas!',
        color_texto: '#ffffff',
        color_inicio: '#3498DB',
        color_fin: '#2980B9',
        fecha_inicio: '2025-10-16T08:00',
        fecha_fin: '2025-10-25T20:00',
        estado: 'Activo',
        creado_en: '2025-10-13T12:00:00',
        actualizado_en: '2025-10-13T12:00:00'
      }
    ];
  }

  onSubmit(): void {
    if (this.anuncioForm.valid) {
      const nuevoAnuncio: Anuncio = {
        id: this.anuncios.length + 1,
        ...this.anuncioForm.value,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      };

      this.anuncios.unshift(nuevoAnuncio);
      
      // Notificación de éxito
      this.mostrarNotificacion('Anuncio creado exitosamente', 'success');
      
      // Resetear formulario
      this.anuncioForm.reset({
        color_texto: '#ffffff',
        color_inicio: '#2ECC71',
        color_fin: '#27AE60',
        estado: 'Inactivo'
      });
      
      // Reinicializar fechas
      const ahora = new Date();
      const en24Horas = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
      this.anuncioForm.patchValue({
        fecha_inicio: this.formatDateTimeLocal(ahora),
        fecha_fin: this.formatDateTimeLocal(en24Horas)
      });
    } else {
      this.mostrarNotificacion('Por favor completa todos los campos correctamente', 'error');
    }
  }

  cambiarEstado(id: number, nuevoEstado: 'Activo' | 'Inactivo'): void {
    const anuncio = this.anuncios.find(a => a.id === id);
    if (anuncio) {
      anuncio.estado = nuevoEstado;
      anuncio.actualizado_en = new Date().toISOString();
      this.mostrarNotificacion(
        `Anuncio ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'} correctamente`,
        'success'
      );
    }
  }

  eliminarAnuncio(id: number): void {
    const index = this.anuncios.findIndex(a => a.id === id);
    if (index !== -1) {
      this.anuncios.splice(index, 1);
      this.mostrarNotificacion('Anuncio eliminado exitosamente', 'success');
    }
  }

  formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  formatDateTimeDisplay(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error'): void {
    window.dispatchEvent(
      new CustomEvent('showToast', {
        detail: { message: mensaje, type: tipo }
      })
    );
  }
}
