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

  // 2FA Challenge State
  is2FAChallenge = false;
  resolver: any = null;
  verificationId = '';
  verificationCode = '';
  recaptchaVerifier: any = null;
  maskedPhoneNumber = '';

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
    this.is2FAChallenge = false;
    this.resolver = null;
    this.verificationId = '';
    this.verificationCode = '';
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
    if (
      !this.email?.trim() ||
      !this.passwordRegistro?.trim() ||
      !this.nombre?.trim()
    ) {
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
      if (error.code === 'auth/multi-factor-auth-required') {
        await this.handle2FAChallenge(error);
        return;
      }

      const { message } = this.authService.formatAuthError(error);
      this.notificationService.notify({
        message: `Error en el inicio: ${message}`,
        type: 'error',
      });
    }
  }

  async handle2FAChallenge(error: any) {
    try {
      const { getMultiFactorResolver, PhoneAuthProvider, PhoneMultiFactorGenerator, RecaptchaVerifier } = await import('@angular/fire/auth');
      const { getAuth } = await import('@angular/fire/auth');

      this.resolver = getMultiFactorResolver(getAuth(), error);
      const hints = this.resolver.hints;

      // Asumimos que el primer hint es el teléfono (el único que implementamos)
      const phoneHint = hints.find((h: any) => h.factorId === PhoneMultiFactorGenerator.FACTOR_ID);

      if (!phoneHint) {
        this.notificationService.error('No se encontró un factor de autenticación soportado.');
        return;
      }

      this.maskedPhoneNumber = phoneHint.phoneNumber;
      this.is2FAChallenge = true;

      // Necesitamos inicializar el RecaptchaVerifier
      // Esperamos un momento para que el DOM se actualice y exista el contenedor
      setTimeout(async () => {
        if (!this.recaptchaVerifier) {
          try {
            this.recaptchaVerifier = new RecaptchaVerifier(getAuth(), 'recaptcha-container-login', {
              size: 'invisible'
            });
          } catch (e) {
            // Puede que ya exista o falle, lo manejamos
            console.log('Recaptcha init msg', e);
          }
        }

        const phoneAuthProvider = new PhoneAuthProvider(getAuth());
        try {
          this.verificationId = await phoneAuthProvider.verifyPhoneNumber(
            {
              multiFactorHint: phoneHint,
              session: this.resolver.session
            },
            this.recaptchaVerifier
          );
          this.notificationService.success('Código enviado a tu teléfono.');
        } catch (e: any) {
          this.notificationService.error('Error al enviar el código SMS: ' + e.message);
          this.is2FAChallenge = false;
        }
      }, 100);

    } catch (e) {
      console.error('Error handling 2FA', e);
      this.notificationService.error('Error inesperado en 2FA');
    }
  }

  async verify2FACode() {
    if (!this.verificationCode) return;

    try {
      await this.authService.resolve2FA(this.resolver, this.verificationId, this.verificationCode);
      this.cerrar();
      this.notificationService.success('Inicio de sesión correcto con 2FA');
    } catch (error: any) {
      const { message } = this.authService.formatAuthError(error);
      this.notificationService.error(message);
    }
  }
}
