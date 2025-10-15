import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact implements OnInit {
  contactForm = {
    nombres: '',
    email: '',
    telefono: '',
    sede: '',
    tipo: '',
    mensaje: ''
  };

  charCount = 0;

  ngOnInit() {
    this.updateCharCount();
  }

  sedes = [
    'Sede Norte',
    'Sede Sur', 
    'Sede Centro',
    'Sede Este'
  ];

  tipos = [
    'Consulta General',
    'Reserva de Cancha',
    'Compra de Productos',
    'Evento Privado',
    'Reclamo'
  ];

  onSubmit() {
    console.log('Formulario enviado:', this.contactForm);
    // Aquí iría la lógica para enviar el formulario
    alert('¡Mensaje enviado correctamente!');
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
}
