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
import { BehaviorSubject, map, firstValueFrom, ReplaySubject } from 'rxjs';
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

  // Emits once Firebase has reported the initial auth state (either user or null).
  // Helps consumers avoid racing on the initial null value.
  authReady$ = new ReplaySubject<boolean>(1);

  constructor() {
    // Seed the current user from the Auth instance in case it's already available
    // This avoids a race where consumers (e.g. route guards) subscribe and take(1)
    // before the async onAuthStateChanged callback fires.
    try {
      const maybeUser = (this.auth as any).currentUser ?? null;
      this.currentUserSubject.next(maybeUser);
    } catch (err) {
      // Defensive: if reading currentUser throws for some reason, keep null
      console.debug('AuthService: failed to read auth.currentUser during init', err);
    }

    // Escucha los cambios de sesión (Firebase lo maneja automáticamente)
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
      // Notify that the initial auth state has been received (first call)
      try {
        // First emission of authReady$ will signal readiness. Use next(true)
        // and complete so consumers know it won't emit again.
        this.authReady$.next(true);
        this.authReady$.complete();
      } catch (err) {
        // ignore if already closed
      }
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
      // Wait for backend to create user and (gateway) possibly sync claims
      const resp = await firstValueFrom(this.userApi.createUser(payload));
      // If the backend synced claims, force refresh token so client has updated claims
      try {
        // force refresh id token to pick up any newly set custom claims
        await credential.user.getIdToken(true);
      } catch (err) {
        console.error('Error forcing token refresh after registration', err);
      }
      console.log('User record created in backend', resp);
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
    // sign in with popup
    const credential = await signInWithPopup(this.auth, provider);

    // detect if this is a new user and create record in backend if needed
    try {
      // dynamic import to avoid circular or heavy imports at top
      const { getAdditionalUserInfo } = await import('@angular/fire/auth');
      const info = getAdditionalUserInfo(credential as any);
      const isNew = info && (info as any).isNewUser;
      if (isNew) {
        const user = credential.user;
        const payload = {
          uid: user.uid,
          nombre: user.displayName || null,
          email: user.email || null,
          id_rol: 2, // default role
        };
        try {
          const resp = await firstValueFrom(this.userApi.createUser(payload));
          console.log('Created backend user for provider sign-in', resp);
        } catch (err) {
          console.error('Failed to create backend user after provider sign-in', err);
        }

        // Force refresh token so any claims set by gateway are present
        try {
          await user.getIdToken(true);
        } catch (err) {
          console.error('Error forcing token refresh after provider sign-in', err);
        }
      }
    } catch (err) {
      console.error('Error handling provider sign-in new user flow', err);
    }

    return credential;
  }
}
