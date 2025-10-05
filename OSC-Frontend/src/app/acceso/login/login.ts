import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
    @Output() cerrarModal = new EventEmitter<void>();

  usuario = '';
  password = '';
  isClosing = false;

  cerrar() {
    this.isClosing = true;
    setTimeout(() => {
      this.cerrarModal.emit();
    }, 300); // Esperar a que termine la animación
  }

  login() {
    console.log('Login con:', this.usuario);
    // Si login exitoso:
    this.cerrar();
  }


}
