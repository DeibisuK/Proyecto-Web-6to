import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FacebookAuthProvider, GoogleAuthProvider } from '@angular/fire/auth';
import { NotificationService } from '@core/services/notification.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private authService = inject(AuthService);

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

  // Formulario de registro
  nombre = '';
  email = '';
  passwordRegistro = '';

  // -------------------- Modal --------------------
  abrirModal() {
    this.isClosing = false;
    this.resetForms();
  }

  cerrar() {
    this.isClosing = true;
    setTimeout(() => {
      this.cerrarModal.emit();
      this.resetForms();
    }, 300);
  }

  resetForms() {
    this.usuario = '';
    this.password = '';
    this.nombre = '';
    this.email = '';
    this.passwordRegistro = '';
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
      await this.authService.signInWithPopupProvider(provider);
      this.cerrar();
      this.notificationService.notify({
        message: 'Sesión iniciada con Google',
        type: 'success',
      });
    } catch (error) {
      this.notificationService.notify({
        message: 'Error al iniciar sesión con Google',
        type: 'error',
      });
    }
  }

  async loginConFacebook() {
    try {
      const provider = new FacebookAuthProvider();
      await this.authService.signInWithPopupProvider(provider);
      this.cerrar();
      this.notificationService.notify({
        message: 'Sesión iniciada con Facebook',
        type: 'success',
      });
    } catch (error) {
      this.notificationService.notify({
        message: `Error al iniciar sesión con Facebook: ${error}`,
        type: 'error',
      });
    }
  }

  async registroConEmail() {
    if (!this.email?.trim() || !this.passwordRegistro?.trim() || !this.nombre?.trim()) {
      this.notificationService.notify({
        message: 'Todos los campos son obligatorios.',
        type: 'error',
      });
      return;
    }

    try {
      await this.authService.registerWithEmail(this.email, this.passwordRegistro, this.nombre);
      this.cerrar();
      this.notificationService.notify({
        message: 'Registro completado',
        type: 'success',
      });
    } catch (error) {
      const { message } = this.authService.formatAuthError(error);
      this.notificationService.notify({
        message: `Error en el registro: ${message}`,
        type: 'error',
      });
    }
  }

  async loginConEmail() {
    if (!this.usuario?.trim() || !this.password?.trim()) {
      this.notificationService.notify({
        message: 'Usuario y contraseña son obligatorios.',
        type: 'error',
      });
      return;
    }
    try {
      await this.authService.loginWithEmail(this.usuario, this.password);
      this.cerrar();
      this.notificationService.notify({
        message: 'Inicio de sesión correcto',
        type: 'success',
      });
    } catch (error: any) {
      const { message } = this.authService.formatAuthError(error);
      this.notificationService.notify({
        message: `Error en el inicio: ${message}`,
        type: 'error',
      });
    }
  }
}
