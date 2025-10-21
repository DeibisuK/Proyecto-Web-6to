import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../shared/url';
import { ContactoRequest } from '../models/contacto.model';

@Injectable({
  providedIn: 'root'
})
export class ContactoService {
  private apiUrl = `${API_URL}/u/contacto`;

  constructor(private http: HttpClient) {}

  enviarContacto(data: ContactoRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
