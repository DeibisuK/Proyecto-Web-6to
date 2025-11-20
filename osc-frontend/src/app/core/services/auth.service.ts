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
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  getMultiFactorResolver,
  MultiFactorResolver,
  MultiFactorError,
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

  /**
   * Fuerza la actualización del token de Firebase para obtener claims actualizados
   * Útil después de cambios en roles, suscripciones u otros claims
   */
  async forceTokenRefresh(): Promise<void> {
    const user = this.currentUser;
    if (!user) return;

    try {
      await user.getIdToken(true); // Force refresh
      // Re-emitir el usuario para que los observables se re-evalúen
      this.currentUserSubject.next(user);
    } catch (err) {
      console.error('Error al forzar refresh del token', err);
      throw err;
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
      case 'auth/multi-factor-auth-required':
        message = 'Se requiere autenticación de dos factores.';
        break;
      case 'auth/invalid-verification-code':
        message = 'Código de verificación inválido.';
        break;
      case 'auth/code-expired':
        message = 'El código ha expirado.';
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

  // -------------------------------------------------------------------
  // Multi-Factor Authentication (2FA)
  // -------------------------------------------------------------------

  /**
   * Inicia el proceso de inscripción de 2FA enviando un código SMS.
   * @param phoneNumber Número de teléfono en formato E.164 (ej. +51999999999)
   * @param recaptchaVerifier Instancia de RecaptchaVerifier
   */
  async enroll2FA(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<string> {
    const user = this.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');

    const session = await multiFactor(user).getSession();
    const phoneInfoOptions = {
      phoneNumber,
      session,
    };
    const phoneAuthProvider = new PhoneAuthProvider(this.auth);
    return await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);
  }

  /**
   * Verifica el código SMS y finaliza la inscripción de 2FA.
   * @param verificationId ID de verificación obtenido en enroll2FA
   * @param verificationCode Código SMS ingresado por el usuario
   */
  async verifyAndEnroll2FA(verificationId: string, verificationCode: string): Promise<void> {
    const user = this.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');

    const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
    await multiFactor(user).enroll(multiFactorAssertion, 'Número de teléfono');
  }

  /**
   * Resuelve el desafío de 2FA durante el login.
   * @param resolver MultiFactorResolver obtenido del error auth/multi-factor-auth-required
   * @param verificationId ID de verificación (se obtiene al reenviar el código o usar el hint)
   * @param verificationCode Código SMS
   */
  async resolve2FA(
    resolver: MultiFactorResolver,
    verificationId: string,
    verificationCode: string
  ): Promise<UserCredential> {
    const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
    return await resolver.resolveSignIn(multiFactorAssertion);
  }

  /**
   * Deshabilita el 2FA para el usuario actual.
   */
  async disable2FA(): Promise<void> {
    const user = this.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');

    const enrolledFactors = multiFactor(user).enrolledFactors;
    if (enrolledFactors.length === 0) return;

    // Asumimos que solo hay un factor o eliminamos el primero/todos
    // Para este caso, eliminamos el factor de teléfono
    const factor = enrolledFactors.find((f) => f.factorId === PhoneMultiFactorGenerator.FACTOR_ID);
    if (factor) {
      await multiFactor(user).unenroll(factor);
    }
  }

  /**
   * Verifica si el usuario tiene 2FA habilitado.
   */
  get2FAStatus(): boolean {
    const user = this.currentUser;
    if (!user) return false;
    const enrolledFactors = multiFactor(user).enrolledFactors;
    return enrolledFactors.length > 0;
  }
}
