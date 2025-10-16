import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

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
  send = false

  auth = inject(AuthService);

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
    this.auth.sendPasswordReset(this.email).then(() => {
      this.send = true;
    }).catch((error) => {
      console.error('Error al enviar el correo de recuperación:', error);
    });
  }
}
