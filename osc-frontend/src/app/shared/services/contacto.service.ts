import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactoRequest } from '@shared/models/index';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactoService {
  private apiUrl = `${environment.apiUrl}/u/contacto`;

  constructor(private http: HttpClient) {}

  enviarContacto(data: ContactoRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
