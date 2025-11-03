import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RolUsuario, Usuario } from '@shared/models/index';
import { environment } from '../../../environments/environment';

export interface BackendUserPayload {
  uid: string;
  nombre?: string | null;
  apellido?: string | null;
  email?: string | null;
  id_rol?: number | null;
}

export interface CombinedUser {
  uid: string | null;
  email: string;
  displayName?: string;
  photoURL?: string | null;
  emailVerified: boolean;
  disabled: boolean;
  customClaims: {
    role?: RolUsuario;
    id_rol?: number;
  };
  providerData: any[];
  metadata: {
    creationTime: string | null;
    lastSignInTime: string | null;
  };
  source: 'firebase+db' | 'firebase-only' | 'db-only';
}

export interface AllUsersResponse {
  total: number;
  firebaseCount: number;
  dbCount: number;
  users: CombinedUser[];
}

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private http = inject(HttpClient);

  // Create or update a user record in the user-service via API gateway (/u)
  createUser(payload: BackendUserPayload) {
    // The gateway proxies /u -> user-service
    return this.http.post(`${environment.apiUrl}/u/users/`, payload);
  }

  getUserByUid(uid: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${environment.apiUrl}/u/users/${uid}`);
  }

  // Get all users (Firebase + Database combined)
  getAllUsers(): Observable<AllUsersResponse> {
    return this.http.get<AllUsersResponse>(`${environment.apiUrl}/u/admin/all-users`);
  }

  // Get all users from database with roles
  getAllUsersFromDB(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${environment.apiUrl}/u/users`);
  }

  // Update user role
  updateUserRole(uid: string, id_rol: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/u/admin/assign-role`, { uid, id_rol });
  }

  // Delete user
  deleteUser(uid: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/u/users/${uid}`);
  }
}
