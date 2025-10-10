import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
    @Output() cerrarModal = new EventEmitter<void>();
    @Output() abrirRecuperarPassword = new EventEmitter<void>();

  usuario = '';
  password = '';
  isClosing = false;
  isRegisterMode = false;
  isAnimating = false;

  // Propiedades para el formulario de registro
  nombre = '';
  email = '';
  passwordRegistro = '';
  confirmarPassword = '';

  cerrar() {
    this.isClosing = true;
    setTimeout(() => {
      this.cerrarModal.emit();
    }, 300); // Esperar a que termine la animación
  }

  abrirRecuperacion() {
    this.isClosing = true;
    setTimeout(() => {
      this.abrirRecuperarPassword.emit();
    }, 300);
  }

  toggleForm() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.isRegisterMode = !this.isRegisterMode;
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 800);
  }

  login() {
    console.log('Login con:', this.usuario);
    // Si login exitoso:
    this.cerrar();
  }

  register() {
    console.log('Registro con:', this.nombre, this.email);
    // Si registro exitoso:
    this.cerrar();
  }
}
