import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {
  contactForm = {
    nombres: '',
    email: '',
    telefono: '',
    sede: '',
    tipo: '',
    mensaje: ''
  };

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
}
