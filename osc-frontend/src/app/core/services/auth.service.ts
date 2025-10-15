// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { Auth, onAuthStateChanged, signOut, User } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);

  // Mantiene el usuario actual
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  user$ = this.currentUserSubject.asObservable(); // Observable público

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
}
