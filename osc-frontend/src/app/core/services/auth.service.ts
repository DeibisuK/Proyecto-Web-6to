// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import {
  Auth,
  onAuthStateChanged,
  signOut,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  sendEmailVerification,
  UserCredential,
  signInWithPopup,
} from '@angular/fire/auth';
import { BehaviorSubject, map } from 'rxjs';
import { UserApiService } from './user-api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private userApi = inject(UserApiService);

  // Mantiene el usuario actual
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  user$ = this.currentUserSubject.asObservable(); // Observable público

  // Observable práctico que indica si hay un usuario autenticado
  isAuthenticated$ = this.user$.pipe(map((u) => !!u));

  constructor() {
    // Escucha los cambios de sesión (Firebase lo maneja automáticamente)
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  async logout() {
    await signOut(this.auth);
  }

  // Return ID token (nullable)
  async getIdToken(forceRefresh = false): Promise<string | null> {
    const user = this.currentUser;
    if (!user) return null;
    try {
      return await user.getIdToken(forceRefresh);
    } catch (err) {
      console.error('Error getting ID token', err);
      return null;
    }
  }

  // Convenience methods used by UI components
  async loginWithEmail(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  /**
   * Register a new user with email + password and optionally set the display name.
   * If displayName is provided, update the user's profile after creation.
   */
  async registerWithEmail(
    email: string,
    password: string,
    displayName?: string
  ): Promise<UserCredential> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    if (displayName) {
      try {
        // AngularFire's updateProfile is a thin wrapper around firebase/auth updateProfile
        // @ts-ignore - user type compatibility
        await updateProfile(credential.user as any, { displayName });
        // update local subject so UI reflects name immediately
        const current = this.currentUserSubject.value;
        if (current && current.uid === credential.user.uid) {
          // create a shallow clone with updated displayName
          const updated = Object.assign(Object.create(Object.getPrototypeOf(current)), current);
          // @ts-ignore
          updated.displayName = displayName;
          this.currentUserSubject.next(updated);
        }
      } catch (err) {
        console.error('Error setting displayName after registration', err);
        // Not fatal for account creation; rethrow if you want to fail the whole flow
      }
    }
    // After creating the Firebase user, persist minimal user info in our backend
    try {
      const uid = credential.user.uid;
      const payload = {
        uid,
        nombre: displayName || null,
        email: credential.user.email || null,
        // default role id (adjust as needed)
        id_rol: 2,
      };
      // fire and forget; the gateway will forward Authorization header if present
      this.userApi.createUser(payload).subscribe({
        next: () => console.log('User record created in backend'),
        error: (e) => console.error('Failed to create user record in backend', e),
      });
    } catch (err) {
      console.error('Error persisting user to backend', err);
    }
    return credential;
  }

  async sendPasswordReset(email: string): Promise<void> {
    return firebaseSendPasswordResetEmail(this.auth, email);
  }

  // Send verification email to current user (if available)
  async sendEmailVerification(): Promise<void> {
    const user = this.currentUser;
    if (!user) throw new Error('No authenticated user');
    try {
      // Use AngularFire's wrapped function which runs inside Angular's injection/zone context
      // @ts-ignore - AngularFire's User type is compatible here
      return await sendEmailVerification(this.currentUser as any);
    } catch (err) {
      console.error('Error sending verification email', err);
      throw err;
    }
  }

  // Map firebase error codes to user-friendly messages
  formatAuthError(err: any): { code: string; message: string } {
    const code = err?.code || 'auth/unknown';
    let message = 'Ocurrió un error';
    switch (code) {
      case 'auth/user-not-found':
        message = 'Usuario no encontrado.';
        break;
      case 'auth/wrong-password':
        message = 'Contraseña incorrecta.';
        break;
      case 'auth/email-already-in-use':
        message = 'El correo ya está en uso.';
        break;
      case 'auth/invalid-email':
        message = 'Correo inválido.';
        break;
      case 'auth/too-many-requests':
        message = 'Demasiados intentos. Intenta más tarde.';
        break;
      case 'auth/account-exists-with-different-credential':
        message = 'Cuenta existe con diferente proveedor. Usa otro método.';
        break;
      default:
        message = err?.message || message;
    }
    return { code, message };
  }

  // Provider sign-in (Google, Facebook, etc.)
  async signInWithPopupProvider(provider: any): Promise<UserCredential> {
    return signInWithPopup(this.auth, provider);
  }
}
