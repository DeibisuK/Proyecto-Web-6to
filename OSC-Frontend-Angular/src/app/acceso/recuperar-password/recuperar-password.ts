import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './recuperar-password.html',
  styleUrl: './recuperar-password.css'
})
export class RecuperarPassword {
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() volverLogin = new EventEmitter<void>();
  
  email = '';
  isClosing = false;

  cerrarModalRecuperacion() {
    this.isClosing = true;
    setTimeout(() => {
      this.cerrarModal.emit();
    }, 300);
  }

  volverAlLogin() {
    this.isClosing = true;
    setTimeout(() => {
      this.volverLogin.emit();
    }, 300);
  }

  enviarSolicitudRecuperacion() {
    console.log('Enviando solicitud a:', this.email);
    // Aquí iría la lógica de envío
    this.cerrarModalRecuperacion();
  }
}
