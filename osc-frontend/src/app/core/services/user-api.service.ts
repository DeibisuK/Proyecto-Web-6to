import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './url';

export interface BackendUserPayload {
  uid: string;
  nombre?: string | null;
  apellido?: string | null;
  email?: string | null;
  id_rol?: number | null;
}

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private http = inject(HttpClient);

  // Create or update a user record in the user-service via API gateway (/u)
  createUser(payload: BackendUserPayload) {
    // The gateway proxies /u -> user-service
    return this.http.post(`${API_URL}/u/users/`, payload);
  }
}
