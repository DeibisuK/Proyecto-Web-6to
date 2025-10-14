import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Equipo } from '../../../../../../core/models/equipo.model';

@Component({
  selector: 'app-crear-equipo',
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-equipo.html',
  styleUrl: './crear-equipo.css'
})
export class CrearEquipo {
  @Input() equipoEditar?: Equipo;
  @Output() equipoGuardado = new EventEmitter<Equipo>();
  @Output() cerrarModal = new EventEmitter<void>();

  equipoData = {
    nombre_equipo: '',
    descripcion: '',
    logo_url: '',
    id_deporte: null as number | null
  };

  logoPreview: string | null = null;
  selectedFile: File | null = null;
  isLoading = false;

  ngOnInit() {
    if (this.equipoEditar) {
      this.equipoData = {
        nombre_equipo: this.equipoEditar.nombre_equipo,
        descripcion: this.equipoEditar.descripcion,
        logo_url: this.equipoEditar.logo_url || '',
        id_deporte: this.equipoEditar.id_deporte || null
      };
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
      }

      this.selectedFile = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async guardarEquipo() {
    if (!this.equipoData.nombre_equipo.trim()) {
      return;
    }

    this.isLoading = true;

    try {
      // Aquí iría la lógica para subir la imagen a un servicio (ej: Cloudinary)
      // Por ahora usamos el preview o la URL existente
      const equipoParaGuardar: Equipo = {
        id_equipo: this.equipoEditar?.id_equipo || 0,
        nombre_equipo: this.equipoData.nombre_equipo.trim(),
        descripcion: this.equipoData.descripcion.trim(),
        logo_url: this.logoPreview || this.equipoData.logo_url || undefined,
        id_deporte: this.equipoData.id_deporte || undefined
      };

      // Simular delay de guardado
      await new Promise(resolve => setTimeout(resolve, 500));

      this.equipoGuardado.emit(equipoParaGuardar);
      this.cerrar();
    } catch (error) {
      console.error('Error al guardar equipo:', error);
      alert('Hubo un error al guardar el equipo. Por favor intenta nuevamente.');
    } finally {
      this.isLoading = false;
    }
  }

  cerrar() {
    this.cerrarModal.emit();
  }
}
