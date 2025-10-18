import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './url';

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
  customClaims: any;
  providerData: any[];
  metadata: {
    creationTime: string | null;
    lastSignInTime: string | null;
  };
  id_user?: number;
  nombre?: string;
  apellido?: string;
  id_rol?: number;
  rol_nombre?: string;
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
    return this.http.post(`${API_URL}/u/users/`, payload);
  }

  // Get all users (Firebase + Database combined)
  getAllUsers(): Observable<AllUsersResponse> {
    return this.http.get<AllUsersResponse>(`${API_URL}/admin/all-users`);
  }

  // Get all users from database with roles
  getAllUsersFromDB(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/u/users`);
  }

  // Update user role
  updateUserRole(uid: string, id_rol: number): Observable<any> {
    return this.http.patch(`${API_URL}/u/users/${uid}/role`, { id_rol });
  }

  // Delete user
  deleteUser(uid: string): Observable<any> {
    return this.http.delete(`${API_URL}/u/users/${uid}`);
  }
}
