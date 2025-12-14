import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FacebookAuthProvider, GoogleAuthProvider } from '@angular/fire/auth';
import { NotificationService } from '@core/services/notification.service';
import { AuthService } from '@core/services/auth.service';
import { TwoFactorService } from '@core/services/two-factor.service';
import { TwoFactorVerify } from '../two-factor-verify/two-factor-verify';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, TwoFactorVerify],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private authService = inject(AuthService);
  private twoFactorService = inject(TwoFactorService);
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

  // Estado 2FA
  mostrar2FA = false;
  usuarioTemporal: any = null;

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
      // Paso 1: Autenticar con Firebase
      const credential = await this.authService.loginWithEmail(this.usuario, this.password);
      const user = credential.user;

      // Paso 2: Solicitar código 2FA
      const resultado2FA = await this.twoFactorService.generarCodigo(
        user.uid,
        user.email || this.usuario,
        user.displayName || 'Usuario'
      );

      if (!resultado2FA.success) {
        // Error al generar código
        await this.authService.logout();
        this.notificationService.notify({
          message: 'Error al enviar código de verificación',
          type: 'error',
        });
        return;
      }

      if (!resultado2FA.requiere2FA) {
        // Dispositivo confiable - login completo
        this.cerrar();
        this.notificationService.notify({
          message: 'Inicio de sesión correcto',
          type: 'success',
        });
        return;
      }

      // Paso 3: Mostrar modal de verificación 2FA
      // IMPORTANTE: Cerrar sesión de Firebase temporalmente hasta que verifique el código
      await this.authService.logout();

      this.usuarioTemporal = {
        uid: user.uid,
        email: user.email || this.usuario,
        nombre: user.displayName || 'Usuario'
      };
      this.mostrar2FA = true;

    } catch (error: any) {
      const { message } = this.authService.formatAuthError(error);
      this.notificationService.notify({
        message: `Error en el inicio: ${message}`,
        type: 'error',
      });
    }
  }

  async on2FAVerificado(event: { tokenDispositivo?: string }) {
    // Re-autenticar con Firebase después de verificar el código
    if (this.usuarioTemporal) {
      try {
        await this.authService.loginWithEmail(this.usuario, this.password);
      } catch (error) {
        console.error('Error al re-autenticar:', error);
      }
    }

    this.mostrar2FA = false;
    this.usuarioTemporal = null;
    this.cerrar();
    this.notificationService.notify({
      message: 'Inicio de sesión exitoso',
      type: 'success',
    });
  }

  on2FACancelado() {
    this.mostrar2FA = false;
    this.usuarioTemporal = null;
    // No hace falta cerrar sesión porque ya la cerramos antes de mostrar el modal
    this.notificationService.notify({
      message: 'Verificación cancelada',
      type: 'error',
    });
  }
}
