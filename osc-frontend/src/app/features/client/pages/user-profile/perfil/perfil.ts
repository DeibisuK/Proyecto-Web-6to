import { Component, OnInit, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { User, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential, RecaptchaVerifier } from '@angular/fire/auth';
import { NotificationService } from '@core/services/notification.service';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit, AfterViewInit, OnDestroy {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);
  private auth = inject(Auth);

  user: User | null = null;
  userRole: string = '';
  creationTime: string = '';
  lastSignInTime: string = '';
  providerData: any[] = [];
  showDefaultAvatar: boolean = false;

  isEditing: boolean = false;
  isChangingPassword: boolean = false;

  profileForm: FormGroup;
  passwordForm: FormGroup;

  // 2FA State
  is2FAEnabled: boolean = false;
  isEnrolling2FA: boolean = false;
  verificationId: string = '';
  phoneNumber: string = '';
  verificationCode: string = '';
  recaptchaVerifier: RecaptchaVerifier | null = null;

  // Re-auth State
  showReauthModal: boolean = false;
  reauthPassword: string = '';

  constructor() {
    this.profileForm = this.fb.group({
      displayName: ['', Validators.required]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.user = user;
      if (user) {
        this.loadUserData();
        this.check2FAStatus();
      }
    });
  }

  ngAfterViewInit() {
    // Inicializar RecaptchaVerifier invisible
  }

  ngOnDestroy() {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
    }
  }

  initRecaptcha() {
    if (this.recaptchaVerifier) return;

    // Limpiar el contenedor si existe contenido previo para evitar "reCAPTCHA has already been rendered"
    const element = document.getElementById('recaptcha-container-profile');
    if (element) {
      element.innerHTML = '';
    }

    try {
      this.recaptchaVerifier = new RecaptchaVerifier(this.auth, 'recaptcha-container-profile', {
        size: 'invisible'
      });
    } catch (error) {
      console.error('Error al inicializar reCAPTCHA', error);
    }
  }

  loadUserData() {
    if (!this.user) return;

    this.profileForm.patchValue({
      displayName: this.user.displayName || ''
    });

    this.providerData = this.user.providerData || [];

    // Formatear fechas
    if (this.user.metadata.creationTime) {
      this.creationTime = new Date(this.user.metadata.creationTime).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    if (this.user.metadata.lastSignInTime) {
      this.lastSignInTime = new Date(this.user.metadata.lastSignInTime).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // Obtener rol (esto dependerá de cómo almacenes los roles)
    this.getUserRole();
  }

  async getUserRole() {
    if (!this.user) return;

    try {
      const token = await this.user.getIdTokenResult();
      this.userRole = token.claims['role'] as string || 'cliente';
    } catch (error) {
      this.userRole = 'cliente';
    }
  }

  check2FAStatus() {
    this.is2FAEnabled = this.authService.get2FAStatus();
  }

  async start2FAEnrollment() {
    if (!this.phoneNumber) {
      this.notificationService.error('Ingresa un número de teléfono válido');
      return;
    }

    try {
      this.initRecaptcha();
      if (!this.recaptchaVerifier) return;

      const verificationId = await this.authService.enroll2FA(this.phoneNumber, this.recaptchaVerifier);
      this.verificationId = verificationId;
      this.isEnrolling2FA = true;
      this.notificationService.success('Código enviado. Revisa tu SMS.');
    } catch (error: any) {
      console.error('Error enviando código 2FA', error);

      if (error.code === 'auth/requires-recent-login' || error.message?.includes('CREDENTIAL_TOO_OLD_LOGIN_AGAIN')) {
        this.notificationService.error('Por seguridad, necesitas confirmar tu contraseña.');
        this.showReauthModal = true;
        if (this.recaptchaVerifier) {
          this.recaptchaVerifier.clear();
          this.recaptchaVerifier = null;
        }
        return;
      }

      if (error.message?.includes('UNVERIFIED_EMAIL')) {
        this.notificationService.error('Debes verificar tu correo electrónico antes de activar el 2FA.');
        // Opcional: Podríamos mostrar un botón o hacerlo automáticamente,
        // pero mejor dejamos que el usuario lo solicite explícitamente si agregamos un botón en la UI.
        if (this.recaptchaVerifier) {
          this.recaptchaVerifier.clear();
          this.recaptchaVerifier = null;
        }
        return;
      }

      this.notificationService.error(error.message || 'Error al enviar código');
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
        this.recaptchaVerifier = null;
      }
    }
  }

  async sendVerificationEmail() {
    if (!this.user) return;
    try {
      await this.authService.sendEmailVerification();
      this.notificationService.success('Correo de verificación enviado. Revisa tu bandeja de entrada.');
    } catch (error: any) {
      console.error('Error enviando verificación', error);
      if (error.code === 'auth/too-many-requests' || error.message?.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) {
        this.notificationService.error('Demasiados intentos. Por favor espera unos minutos antes de intentar de nuevo.');
        return;
      }

      if (error.code === 'auth/invalid-app-credential' || error.message?.includes('INVALID_APP_CREDENTIAL')) {
        this.notificationService.error('Error de configuración: Dominio no autorizado o problema con reCAPTCHA. Intenta usar un número de prueba.');
        return;
      }

      this.notificationService.error(error.message || 'Error al enviar código');
    }
  }

  async confirmReauth() {
    if (!this.user || !this.reauthPassword) return;

    try {
      const credential = EmailAuthProvider.credential(this.user.email!, this.reauthPassword);
      await reauthenticateWithCredential(this.user, credential);

      this.showReauthModal = false;
      this.reauthPassword = '';
      this.notificationService.success('Autenticación exitosa. Intentando enviar código nuevamente...');

      // Retry enrollment
      await this.start2FAEnrollment();

    } catch (error: any) {
      console.error('Error re-authenticating', error);
      if (error.code === 'auth/wrong-password') {
        this.notificationService.error('Contraseña incorrecta');
      } else {
        this.notificationService.error('Error al autenticar');
      }
    }
  }

  cancelReauth() {
    this.showReauthModal = false;
    this.reauthPassword = '';
  }

  async verify2FA() {
    if (!this.verificationCode) {
      this.notificationService.error('Ingresa el código de verificación');
      return;
    }

    try {
      await this.authService.verifyAndEnroll2FA(this.verificationId, this.verificationCode);
      this.notificationService.success('2FA habilitado correctamente');
      this.isEnrolling2FA = false;
      this.verificationCode = '';
      this.phoneNumber = '';
      this.check2FAStatus();
    } catch (error: any) {
      console.error('Error verificando 2FA', error);
      const { message } = this.authService.formatAuthError(error);
      this.notificationService.error(message);
    }
  }

  async disable2FA() {
    if (!confirm('¿Estás seguro de desactivar la autenticación de dos factores?')) return;

    try {
      await this.authService.disable2FA();
      this.notificationService.success('2FA desactivado');
      this.check2FAStatus();
    } catch (error: any) {
      console.error('Error desactivando 2FA', error);
      this.notificationService.error('Error al desactivar 2FA');
    }
  }

  cancelEnrollment() {
    this.isEnrolling2FA = false;
    this.verificationCode = '';
    this.verificationId = '';
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
  }

  async updateProfile() {
    if (!this.user || this.profileForm.invalid) return;

    try {
      await updateProfile(this.user, {
        displayName: this.profileForm.value.displayName
      });

      this.notificationService.success('Perfil actualizado correctamente');
      this.isEditing = false;

      // Recargar datos
      this.loadUserData();
    } catch (error: any) {
      this.notificationService.error('Error al actualizar el perfil');
    }
  }

  async changePassword() {
    if (!this.user || this.passwordForm.invalid) return;

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.notificationService.error('Las contraseñas no coinciden');
      return;
    }

    try {
      // Reautenticar usuario
      const credential = EmailAuthProvider.credential(
        this.user.email!,
        currentPassword
      );

      await reauthenticateWithCredential(this.user, credential);

      // Cambiar contraseña
      await updatePassword(this.user, newPassword);

      this.notificationService.success('Contraseña actualizada correctamente');
      this.isChangingPassword = false;
      this.passwordForm.reset();
    } catch (error: any) {
      this.notificationService.error('Error cambiando contraseña');

      if (error.code === 'auth/wrong-password') {
        this.notificationService.error('Contraseña actual incorrecta');
      } else {
        this.notificationService.error('Error al cambiar la contraseña');
      }
    }
  }

  canChangePassword(): boolean {
    return this.providerData.some(p => p.providerId === 'password');
  }

  getProviderName(providerId: string): string {
    const providers: { [key: string]: string } = {
      'password': 'Correo electrónico',
      'google.com': 'Google',
      'facebook.com': 'Facebook',
      'github.com': 'GitHub',
      'phone': 'Teléfono'
    };
    return providers[providerId] || providerId;
  }

  getProviderIcon(providerId: string): string {
    const icons: { [key: string]: string } = {
      'password': 'assets/icons/email-icon.png',
      'google.com': 'assets/icons/google-icon.png',
      'facebook.com': 'assets/icons/facebook-icon.png',
      'github.com': 'assets/icons/github-icon.png',
      'phone': 'assets/icons/phone-icon.png'
    };
    return icons[providerId] || 'assets/icons/default-icon.png';
  }

  handleImageError(event: any) {
    this.showDefaultAvatar = true;
  }

  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }
}
