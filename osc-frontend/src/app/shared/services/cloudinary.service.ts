import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CloudinaryUploadResponse {
  success: boolean;
  url: string;
  public_id: string;
}

export interface CloudinaryDeleteResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/i`;

  /**
   * Sube una imagen de producto a Cloudinary
   * @param file - Archivo de imagen a subir
   * @returns Observable con la URL de la imagen subida
   */
  uploadProductImage(file: File): Observable<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('imagen', file);

    return this.http.post<CloudinaryUploadResponse>(
      `${this.baseUrl}/admin/upload-producto`,
      formData
    );
  }

  /**
   * Sube múltiples imágenes de productos a Cloudinary
   * @param files - Array de archivos de imagen a subir
   * @returns Observable con array de URLs de las imágenes subidas
   */
  uploadProductImages(files: File[]): Observable<CloudinaryUploadResponse[]> {
    // Crear un array de observables para subir cada imagen
    const uploadObservables = files.map(file => this.uploadProductImage(file));

    // Combinar todos los observables en uno solo que emite cuando todos terminan
    return new Observable(observer => {
      const results: CloudinaryUploadResponse[] = [];
      let completed = 0;

      uploadObservables.forEach((obs, index) => {
        obs.subscribe({
          next: (response) => {
            results[index] = response;
            completed++;

            if (completed === files.length) {
              observer.next(results);
              observer.complete();
            }
          },
          error: (error) => {
            observer.error(error);
          }
        });
      });

      // Si no hay archivos, completar inmediatamente
      if (files.length === 0) {
        observer.next([]);
        observer.complete();
      }
    });
  }

  /**
   * Sube una imagen de cancha a Cloudinary
   * @param file - Archivo de imagen a subir
   * @returns Observable con la URL de la imagen subida
   */
  uploadCanchaImage(file: File): Observable<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('imagen', file);

    return this.http.post<CloudinaryUploadResponse>(
      `${this.baseUrl}/admin/upload-cancha`,
      formData
    );
  }

  /**
   * Sube un logo de equipo a Cloudinary
   * @param file - Archivo de imagen a subir
   * @returns Observable con la URL de la imagen subida
   */
  uploadEquipoLogo(file: File): Observable<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('logo', file);

    return this.http.post<CloudinaryUploadResponse>(
      `${this.baseUrl}/admin/upload-equipo`,
      formData
    );
  }

  /**
   * Elimina una imagen de Cloudinary usando su public_id
   * @param publicId - ID público de la imagen en Cloudinary
   * @returns Observable con la confirmación de eliminación
   */
  deleteImage(publicId: string): Observable<CloudinaryDeleteResponse> {
    return this.http.request<CloudinaryDeleteResponse>('DELETE',
      `${this.baseUrl}/admin/delete-imagen/`,
      {
        body: { public_id: publicId }
      }
    );
  }
}
