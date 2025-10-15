import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth, createUserWithEmailAndPassword, FacebookAuthProvider, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from '@angular/fire/auth';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private auth: Auth = inject(Auth);

  private notificationService = inject(NotificationService);

  @Output() cerrarModal = new EventEmitter<void>();
  @Output() abrirRecuperarPassword = new EventEmitter<void>();

  // Formulario de login
  usuario = '';
  password = '';

  // Estado del modal y animaciones
  isClosing = false;
  isRegisterMode = false;
  isAnimating = false;
  isLogin = false;

  // Formulario de registro
  nombre = '';
  email = '';
  passwordRegistro = '';
  confirmarPassword = '';

  // -------------------- Modal --------------------
  abrirModal() {
    this.isClosing = false;
  }

  cerrar() {
    this.isClosing = true;
    setTimeout(() => this.cerrarModal.emit(), 300);
  }

  abrirRecuperacion() {
    this.isClosing = true;
    setTimeout(() => this.abrirRecuperarPassword.emit(), 300);
  }

  toggleForm() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.isRegisterMode = !this.isRegisterMode;
    setTimeout(() => (this.isAnimating = false), 800);
  }

  async loginConGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      this.notificationService.notify({ message: 'Sesión iniciada con Google', type: 'success', key: Date.now() });
      // El observable user$ se actualizará automáticamente
    } catch (error) {
      this.notificationService.notify({ message: 'Error al iniciar sesión con Google', type: 'error', key: Date.now() });
    }
  }

  async loginConFacebook() {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(this.auth, provider);

      // El observable user$ se actualizará automáticamente
      this.notificationService.notify({ message: 'Sesión iniciada con Facebook', type: 'success', key: Date.now() });
    } catch (error) {
      this.notificationService.notify({ message: 'Error al iniciar sesión con Facebook', type: 'error', key: Date.now() });
    }
  }

  async registroConEmail() {
    if (!this.email?.trim() || !this.passwordRegistro?.trim() || !this.confirmarPassword?.trim() || !this.nombre?.trim()) {
      this.notificationService.notify({ message: 'Todos los campos son obligatorios.', type: 'error', key: Date.now() });
      return;
    }
    if (this.passwordRegistro !== this.confirmarPassword) {
      this.notificationService.notify({ message: 'Las contraseñas no coinciden.', type: 'error', key: Date.now() });
      return;
    }
    try {
      const result = await createUserWithEmailAndPassword(this.auth, this.email, this.passwordRegistro);
      this.notificationService.notify({ message: 'Registro completado', type: 'success', key: Date.now() });
    } catch (error) {
      this.notificationService.notify({ message: 'Error en el registro', type: 'error', key: Date.now() });
    }
  }

  async loginConEmail() {
    if (!this.usuario?.trim() || !this.password?.trim()) {
      this.notificationService.notify({ message: 'Usuario y contraseña son obligatorios.', type: 'error', key: Date.now() });
      return;
    }
    try {
      const result = await signInWithEmailAndPassword(this.auth, this.usuario, this.password);
      this.notificationService.notify({ message: 'Inicio de sesión correcto', type: 'success', key: Date.now() });
    } catch (error) {
      this.notificationService.notify({ message: 'Error en el inicio de sesión', type: 'error', key: Date.now() });
    }
  }

}
