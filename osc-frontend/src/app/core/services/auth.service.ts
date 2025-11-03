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
import {
  BehaviorSubject,
  map,
  firstValueFrom,
  ReplaySubject,
  shareReplay,
  switchMap,
  Observable,
  from,
} from 'rxjs';
import { UserApiService } from '@shared/services/index';

interface CustomClaims {
  role?: string;
  id_rol?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private userApi = inject(UserApiService);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  user$ = this.currentUserSubject.asObservable();
  isAuthenticated$ = this.user$.pipe(map((u) => !!u));

  /** Indica cuando Firebase ha inicializado el estado de autenticación */
  authReady$ = new ReplaySubject<boolean>(1);

  /** Custom claims del usuario (incluye rol) */
  claims$: Observable<CustomClaims | null> = this.user$.pipe(
    switchMap((user) => {
      if (!user) return from(Promise.resolve(null));
      return from(user.getIdTokenResult()).pipe(
        map((tokenResult) => tokenResult.claims as CustomClaims)
      );
    }),
    shareReplay(1)
  );

  /** Verifica si el usuario tiene rol de administrador */
  isAdmin$ = this.claims$.pipe(
    map((claims) => claims?.role === 'Admin'),
    shareReplay(1)
  );

  /** Verifica si el usuario tiene rol de árbitro */
  isArbitro$ = this.claims$.pipe(
    map((claims) => claims?.role === 'Arbitro'),
    shareReplay(1)
  );

  constructor() {
    // Inicializa con el usuario actual si ya está disponible
    try {
      const maybeUser = (this.auth as any).currentUser ?? null;
      this.currentUserSubject.next(maybeUser);
    } catch (err) {
      console.debug('AuthService: error al leer auth.currentUser durante init', err);
    }

    // Escucha cambios en el estado de autenticación
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
      try {
        this.authReady$.next(true);
        this.authReady$.complete();
      } catch (err) {
        // Ya completado
      }
    });
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  async logout() {
    await signOut(this.auth);
  }

  /** Obtiene el token de ID del usuario actual */
  async getIdToken(forceRefresh = false): Promise<string | null> {
    const user = this.currentUser;
    if (!user) return null;
    try {
      return await user.getIdToken(forceRefresh);
    } catch (err) {
      console.error('Error al obtener ID token', err);
      return null;
    }
  }

  async loginWithEmail(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  /** Registra un nuevo usuario con email y contraseña */
  async registerWithEmail(
    email: string,
    password: string,
    displayName?: string
  ): Promise<UserCredential> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    if (displayName) {
      try {
        // @ts-ignore
        await updateProfile(credential.user as any, { displayName });
        // Actualiza el subject local para reflejar el nombre inmediatamente
        const current = this.currentUserSubject.value;
        if (current && current.uid === credential.user.uid) {
          const updated = Object.assign(Object.create(Object.getPrototypeOf(current)), current);
          // @ts-ignore
          updated.displayName = displayName;
          this.currentUserSubject.next(updated);
        }
      } catch (err) {
        console.error('Error al establecer displayName después del registro', err);
      }
    }

    // Persiste la información del usuario en el backend
    try {
      const uid = credential.user.uid;
      const payload = {
        uid,
        nombre: displayName || null,
        email: credential.user.email || null,
        id_rol: 2,
      };
      const resp = await firstValueFrom(this.userApi.createUser(payload));
      // Refresca el token para obtener los claims actualizados
      try {
        await credential.user.getIdToken(true);
      } catch (err) {
        console.error('Error al refrescar token después del registro', err);
      }
    } catch (err) {
      console.error('Error al persistir usuario en el backend', err);
    }
    return credential;
  }

  async sendPasswordReset(email: string): Promise<void> {
    return firebaseSendPasswordResetEmail(this.auth, email);
  }

  /** Envía email de verificación al usuario actual */
  async sendEmailVerification(): Promise<void> {
    const user = this.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');
    try {
      // @ts-ignore
      return await sendEmailVerification(this.currentUser as any);
    } catch (err) {
      console.error('Error al enviar email de verificación', err);
      throw err;
    }
  }

  /** Formatea errores de autenticación de Firebase a mensajes amigables */
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

  /** Inicia sesión con proveedor externo (Google, Facebook, etc.) */
  async signInWithPopupProvider(provider: any): Promise<UserCredential> {
    const credential = await signInWithPopup(this.auth, provider);

    // Si es un usuario nuevo, crea el registro en el backend
    try {
      const { getAdditionalUserInfo } = await import('@angular/fire/auth');
      const info = getAdditionalUserInfo(credential as any);
      const isNew = info && (info as any).isNewUser;
      if (isNew) {
        const user = credential.user;
        const payload = {
          uid: user.uid,
          nombre: user.displayName || null,
          email: user.email || null,
          id_rol: 2,
        };
        try {
          const resp = await firstValueFrom(this.userApi.createUser(payload));
        } catch (err) {
          console.error('Error al crear usuario en backend con proveedor', err);
        }

        // Refresca el token para obtener los claims
        try {
          await user.getIdToken(true);
        } catch (err) {
          console.error('Error al refrescar token después de login con proveedor', err);
        }
      }
    } catch (err) {
      console.error('Error al manejar nuevo usuario con proveedor', err);
    }

    return credential;
  }
}
