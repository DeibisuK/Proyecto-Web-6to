import { Component, inject, OnInit, signal, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SedeService } from '@shared/services/index';
import { ContactoService } from '@shared/services/index';
import { NotificationService } from '@core/services/notification.service';
import { Sedes } from '@shared/models/index';
import { ContactoForm } from '@shared/models/index';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnInit {
  contactForm: ContactoForm = {
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    sede: '',
    tipo: '',
    mensaje: '',
  };
  private sedeService = inject(SedeService);
  charCount = 0;
  sedesDisponibles: Sedes[] = [];
  sedesAgrupadas = signal<{ nombre: string; sedes: Sedes[] }[]>([]);
  sedes: string[] = []; // Se llenará desde el backend

  readonly tipos = [
    'Consulta General',
    'Reserva de Cancha',
    'Compra de Productos',
    'Evento Privado',
    'Reclamo',
  ];

  // Signals para dropdowns personalizados
  dropdownSedeAbierto = signal<boolean>(false);
  dropdownTipoAbierto = signal<boolean>(false);
  sedeSeleccionada = signal<string>('');
  tipoSeleccionado = signal<string>('');

  constructor(
    private http: HttpClient,
    private contactoService: ContactoService,
    private notificationService: NotificationService
  ) {
    // Configurar cierre de dropdowns al hacer click fuera
    afterNextRender(() => {
      this.configurarCierreDropdowns();
    });
  }

  ngOnInit() {
    this.updateCharCount();
    this.cargarSedes();
  }

  cargarSedes() {
    setTimeout(() => {
      this.sedeService.getSedes().subscribe({
        next: (sedes: Sedes[]) => {
          console.log('Sedes cargadas:', sedes);
          this.sedesDisponibles = sedes;
          const agrupadas = this.agruparSedesPorCiudad(sedes);
          this.sedesAgrupadas.set(agrupadas);
          console.log('Sedes agrupadas:', this.sedesAgrupadas());
        },
        error: (error: any) => {
          console.error('Error al cargar sedes:', error);
          this.notificationService.notify({
            message: 'No se pudieron cargar las sedes disponibles',
            type: 'error',
          });
        },
      });
    }, 200); // Retraso de 200 ms
  }

  agruparSedesPorCiudad(sedes: Sedes[]): { nombre: string; sedes: Sedes[] }[] {
    const ciudadesMap: { [ciudad: string]: { nombre: string; sedes: Sedes[] } } = {};

    for (const sede of sedes) {
      const ciudadNombre = sede.ciudad?.trim() || 'Sin ciudad';

      if (!ciudadesMap[ciudadNombre]) {
        ciudadesMap[ciudadNombre] = { nombre: ciudadNombre, sedes: [] };
      }

      ciudadesMap[ciudadNombre].sedes.push(sede);
    }

    return Object.values(ciudadesMap);
  }

  onSubmit() {
    // Validar formulario
    if (
      !this.contactForm.nombres ||
      !this.contactForm.apellidos ||
      !this.contactForm.email ||
      !this.contactForm.telefono ||
      !this.contactForm.sede ||
      !this.contactForm.tipo ||
      !this.contactForm.mensaje
    ) {
      this.notificationService.notify({
        message: 'Por favor complete todos los campos requeridos correctamente',
        type: 'error',
      });
      return;
    }

    // Validar email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.contactForm.email)) {
      this.notificationService.notify({
        message: 'Por favor ingrese un email válido',
        type: 'error',
      });
      return;
    }

    // Preparar datos para enviar
    const dataToSend = {
      nombres: this.contactForm.nombres,
      apellidos: this.contactForm.apellidos,
      telefono: this.contactForm.telefono,
      email: this.contactForm.email,
      asunto: `${this.contactForm.tipo} - ${this.contactForm.sede}`,
      mensaje: this.contactForm.mensaje,
    };

    // Enviar formulario
    this.contactoService.enviarContacto(dataToSend).subscribe({
      next: () => {
        this.notificationService.notify({
          message: '¡Mensaje enviado! Te contactaremos pronto.',
          type: 'success',
        });
        this.resetForm();
      },
      error: (error: any) => {
        this.notificationService.notify({
          message: 'No se pudo enviar el mensaje. Por favor intente nuevamente',
          type: 'error',
        });
      },
    });
  }

  resetForm() {
    this.contactForm = {
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      sede: '',
      tipo: '',
      mensaje: '',
    };
    this.charCount = 0;
  }

  validatePhone(event: any) {
    const input = event.target;
    const value = input.value;
    // Solo permitir números, espacios, guiones, paréntesis y el símbolo +
    const filteredValue = value.replace(/[^0-9+\-\s\(\)]/g, '');
    if (value !== filteredValue) {
      input.value = filteredValue;
      this.contactForm.telefono = filteredValue;
    }
  }

  updateCharCount() {
    this.charCount = this.contactForm.mensaje.length;
  }

  getCharCounterClass(): string {
    if (this.charCount >= 450) {
      return 'danger';
    } else if (this.charCount >= 400) {
      return 'warning';
    }
    return '';
  }

  // ===== Métodos para dropdowns personalizados =====

  toggleDropdownSede() {
    this.dropdownSedeAbierto.update(estado => !estado);
    if (this.dropdownSedeAbierto()) {
      this.dropdownTipoAbierto.set(false);
      console.log('Dropdown sede abierto. Sedes agrupadas:', this.sedesAgrupadas());
      console.log('Tipos disponibles:', this.tipos);
    }
  }

  toggleDropdownTipo() {
    this.dropdownTipoAbierto.update(estado => !estado);
    if (this.dropdownTipoAbierto()) {
      this.dropdownSedeAbierto.set(false);
      console.log('Dropdown tipo abierto. Tipos:', this.tipos);
    }
  }

  seleccionarSede(sede: Sedes) {
    const nombreSede = (sede as any).nombre || sede.nombre_sede;
    this.contactForm.sede = nombreSede;
    this.sedeSeleccionada.set(nombreSede);
    this.dropdownSedeAbierto.set(false);
  }

  getNombreSede(sede: Sedes): string {
    return (sede as any).nombre || sede.nombre_sede;
  }

  seleccionarTipo(tipo: string) {
    this.contactForm.tipo = tipo;
    this.tipoSeleccionado.set(tipo);
    this.dropdownTipoAbierto.set(false);
  }

  private configurarCierreDropdowns() {
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const dropdownSede = target.closest('.dropdown-sede');
      const dropdownTipo = target.closest('.dropdown-tipo');

      // Cerrar dropdown de sede si el click fue fuera
      if (!dropdownSede && this.dropdownSedeAbierto()) {
        this.dropdownSedeAbierto.set(false);
      }

      // Cerrar dropdown de tipo si el click fue fuera
      if (!dropdownTipo && this.dropdownTipoAbierto()) {
        this.dropdownTipoAbierto.set(false);
      }
    });
  }
}
