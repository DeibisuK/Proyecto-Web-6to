import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { User, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from '@angular/fire/auth';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);

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
      }
    });
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
      'github.com': 'GitHub'
    };
    return providers[providerId] || providerId;
  }

  getProviderIcon(providerId: string): string {
    const icons: { [key: string]: string } = {
      'password': 'assets/icons/email-icon.png',
      'google.com': 'assets/icons/google-icon.png',
      'facebook.com': 'assets/icons/facebook-icon.png',
      'github.com': 'assets/icons/github-icon.png'
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
