import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { AnuncioService, Anuncio } from '../../../../core/services/anuncio.service';

@Component({
  selector: 'app-anuncios',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './anuncios.html',
  styleUrls: ['./anuncios.css']
})
export class Anuncios implements OnInit {
  anuncioForm!: FormGroup;
  anuncios: Anuncio[] = [];
  isSubmitting = false;
  isLoading = true;

  // Filtros
  filtroBusqueda: string = '';
  filtroTipo: string = 'todos';
  filtroEstado: string = 'todos';

  // Dropdowns filtros
  dropdownTipoAbierto = signal(false);
  dropdownEstadoAbierto = signal(false);
  tipoSeleccionado = signal('Todos los tipos');
  estadoSeleccionado = signal('Todos');

  // Dropdown formulario
  dropdownTipoFormAbierto = signal(false);

  // Computed para anuncios filtrados
  anunciosFiltrados = computed(() => {
    let resultado = this.anuncios;

    // Filtrar por búsqueda
    if (this.filtroBusqueda.trim()) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      resultado = resultado.filter(a =>
        a.titulo.toLowerCase().includes(busqueda) ||
        a.descripcion.toLowerCase().includes(busqueda)
      );
    }

    // Filtrar por tipo
    if (this.filtroTipo !== 'todos') {
      resultado = resultado.filter(a => a.tipo === this.filtroTipo);
    }

    // Filtrar por estado
    if (this.filtroEstado !== 'todos') {
      const esActivo = this.filtroEstado === 'activo';
      resultado = resultado.filter(a => a.activo === esActivo);
    }

    return resultado;
  });

  constructor(
    private fb: FormBuilder,
    private anuncioService: AnuncioService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarAnuncios();

    // Suscribirse a cambios en anuncios
    console.log('📡 Suscribiéndose a anunciosUpdated$');
    this.anuncioService.anunciosUpdated$.subscribe(() => {
      console.log('🔄 Detectado cambio en anuncios, recargando...');
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
    console.log('🎯 onSubmit llamado. Formulario válido:', this.anuncioForm.valid, 'Submitting:', this.isSubmitting);
    console.log('📝 Valores del formulario:', this.anuncioForm.value);

    if (this.anuncioForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const nuevoAnuncio = {
        titulo: this.anuncioForm.value.titulo,
        descripcion: this.anuncioForm.value.descripcion,
        tipo: this.anuncioForm.value.tipo,
        activo: true
      };

      console.log('📤 Enviando anuncio al backend:', nuevoAnuncio);

      this.anuncioService.createAnuncio(nuevoAnuncio).subscribe({
        next: (anuncio) => {
          console.log('✅ Anuncio creado:', anuncio);
          this.mostrarNotificacion('Anuncio creado exitosamente', 'success');
          this.anuncioForm.reset({ tipo: 'info' });
          this.isSubmitting = false;
          // FORZAR recarga inmediata
          console.log('🔄 Forzando recarga inmediata de anuncios');
          this.cargarAnuncios();
        },
        error: (error) => {
          console.error('❌ Error al crear anuncio:', error);
          this.mostrarNotificacion('Error al crear anuncio', 'error');
          this.isSubmitting = false;
        }
      });
    } else {
      console.warn('⚠️ Formulario inválido o ya está enviando');
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

  getTipoLabelForm(tipo: string): string {
    const labels: { [key: string]: string } = {
      'info': 'Información',
      'success': 'Éxito',
      'warning': 'Advertencia',
      'error': 'Error/Urgente',
      'promotion': 'Promoción'
    };
    return labels[tipo] || 'Información';
  }

  getTipoIconClass(tipo: string): string {
    const icons: { [key: string]: string } = {
      'info': 'fas fa-info-circle',
      'success': 'fas fa-check-circle',
      'warning': 'fas fa-exclamation-triangle',
      'error': 'fas fa-times-circle',
      'promotion': 'fas fa-tag'
    };
    return icons[tipo] || 'fas fa-info-circle';
  }

  toggleDropdownTipoForm(): void {
    this.dropdownTipoFormAbierto.update(val => !val);
  }

  seleccionarTipoForm(tipo: string): void {
    this.anuncioForm.patchValue({ tipo });
    this.dropdownTipoFormAbierto.set(false);
  }

  // Métodos de dropdown filtros
  toggleDropdownTipo(): void {
    this.dropdownTipoAbierto.update(val => !val);
    this.dropdownEstadoAbierto.set(false);
  }

  toggleDropdownEstado(): void {
    this.dropdownEstadoAbierto.update(val => !val);
    this.dropdownTipoAbierto.set(false);
  }

  seleccionarTipo(tipo: string): void {
    this.filtroTipo = tipo;
    const labels: { [key: string]: string } = {
      'todos': 'Todos los tipos',
      'info': 'Información',
      'success': 'Éxito',
      'warning': 'Advertencia',
      'error': 'Error/Urgente',
      'promotion': 'Promoción'
    };
    this.tipoSeleccionado.set(labels[tipo] || 'Todos los tipos');
    this.dropdownTipoAbierto.set(false);
    this.aplicarFiltros();
  }

  seleccionarEstado(estado: string): void {
    this.filtroEstado = estado;
    const labels: { [key: string]: string } = {
      'todos': 'Todos',
      'activo': 'Activos',
      'inactivo': 'Inactivos'
    };
    this.estadoSeleccionado.set(labels[estado] || 'Todos');
    this.dropdownEstadoAbierto.set(false);
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    // El computed se actualiza automáticamente
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroTipo = 'todos';
    this.filtroEstado = 'todos';
    this.tipoSeleccionado.set('Todos los tipos');
    this.estadoSeleccionado.set('Todos');
    this.dropdownTipoAbierto.set(false);
    this.dropdownEstadoAbierto.set(false);
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
