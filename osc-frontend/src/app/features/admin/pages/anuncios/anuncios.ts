import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AnuncioService, Anuncio } from '../../../../core/services/anuncio.service';

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
  isLoading = true;

  constructor(
    private fb: FormBuilder,
    private anuncioService: AnuncioService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarAnuncios();

    // Suscribirse a cambios en anuncios
    this.anuncioService.anunciosUpdated$.subscribe(() => {
      this.cargarAnuncios();
    });
  }

  inicializarFormulario(): void {
    this.anuncioForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      tipo: ['info', Validators.required]
    });
  }

  cargarAnuncios(): void {
    this.isLoading = true;
    this.anuncioService.getAllAnuncios().subscribe({
      next: (anuncios) => {
        this.anuncios = anuncios;
        this.isLoading = false;
        console.log('✅ Anuncios cargados:', anuncios.length);
      },
      error: (error) => {
        console.error('❌ Error al cargar anuncios:', error);
        this.mostrarNotificacion('Error al cargar anuncios', 'error');
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.anuncioForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const nuevoAnuncio = {
        titulo: this.anuncioForm.value.titulo,
        descripcion: this.anuncioForm.value.descripcion,
        tipo: this.anuncioForm.value.tipo,
        activo: true
      };

      this.anuncioService.createAnuncio(nuevoAnuncio).subscribe({
        next: (anuncio) => {
          console.log('✅ Anuncio creado:', anuncio);
          this.mostrarNotificacion('Anuncio creado exitosamente', 'success');
          this.anuncioForm.reset({ tipo: 'info' });
          this.isSubmitting = false;
          // Recargar inmediatamente la lista
          this.cargarAnuncios();
        },
        error: (error) => {
          console.error('❌ Error al crear anuncio:', error);
          this.mostrarNotificacion('Error al crear anuncio', 'error');
          this.isSubmitting = false;
        }
      });
    } else {
      this.mostrarNotificacion('Por favor completa todos los campos correctamente', 'error');
    }
  }

  resetForm(): void {
    this.anuncioForm.reset({ tipo: 'info' });
  }

  getTipoIcon(tipo: string): string {
    return this.anuncioService.getTipoIcon(tipo);
  }

  getTipoLabel(tipo: string): string {
    return this.anuncioService.getTipoLabel(tipo);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const ahora = new Date();
    const diff = ahora.getTime() - date.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (dias < 0) {
      return 'Recién creado';
    } else if (dias === 0) {
      const horas = Math.floor(diff / (1000 * 60 * 60));
      if (horas === 0) {
        const minutos = Math.floor(diff / (1000 * 60));
        return minutos <= 1 ? 'Recién creado' : `Hace ${minutos} minutos`;
      }
      return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
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
