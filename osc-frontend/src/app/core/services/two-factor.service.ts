import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';

const API_URL = `${environment.apiUrl}/u`;

interface TwoFactorGenerateResponse {
  success: boolean;
  requiere2FA: boolean;
  mensaje: string;
  expiracion?: string;
  error?: string;
}

interface TwoFactorVerifyResponse {
  success: boolean;
  mensaje: string;
  tokenDispositivo?: string;
  error?: string;
  razon?: string;
}

interface TwoFactorResendResponse {
  success: boolean;
  mensaje: string;
  expiracion?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class TwoFactorService {
  private http = inject(HttpClient);

  /**
   * Genera y envía un código 2FA al usuario
   */
  async generarCodigo(uid: string, email: string, nombre: string): Promise<TwoFactorGenerateResponse> {
    try {
      // Verificar si tiene dispositivo confiable en localStorage
      if (this.tieneDispositivoConfiable() && this.verificarDispositivoValido(uid)) {
        return {
          success: true,
          requiere2FA: false,
          mensaje: 'Dispositivo confiable'
        };
      }

      const response = await firstValueFrom(
        this.http.post<TwoFactorGenerateResponse>(
          `${API_URL}/two-factor/generate`,
          { uid, email, nombre }
        )
      );

      return response;
    } catch (error: any) {
      console.error('Error al generar código 2FA:', error);
      return {
        success: false,
        requiere2FA: true,
        mensaje: 'Error al generar código',
        error: error.message
      };
    }
  }

  /**
   * Verifica el código 2FA ingresado
   */
  async verificarCodigo(
    uid: string,
    codigo: string,
    mantenerSesion: boolean
  ): Promise<TwoFactorVerifyResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<TwoFactorVerifyResponse>(
          `${API_URL}/two-factor/verify`,
          { uid, codigo }
        )
      );

      // Si mantenerSesion está activo, guardar en localStorage
      if (response.success && mantenerSesion) {
        this.guardarDispositivoConfiable(uid);
      }

      return response;
    } catch (error: any) {
      console.error('Error al verificar código 2FA:', error);
      return {
        success: false,
        mensaje: 'Error al verificar código',
        error: error.error?.error || error.message
      };
    }
  }

  /**
   * Reenvía un código 2FA
   */
  async reenviarCodigo(uid: string): Promise<TwoFactorResendResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<TwoFactorResendResponse>(
          `${API_URL}/two-factor/resend`,
          { uid }
        )
      );

      return response;
    } catch (error: any) {
      console.error('Error al reenviar código 2FA:', error);
      return {
        success: false,
        mensaje: 'Error al reenviar código',
        error: error.error?.error || error.message
      };
    }
  }

  /**
   * Guarda el dispositivo como confiable en localStorage
   */
  private guardarDispositivoConfiable(uid: string): void {
    try {
      const dispositivos = this.obtenerDispositivosConfiables();
      dispositivos[uid] = Date.now();
      localStorage.setItem('osc_trusted_devices', JSON.stringify(dispositivos));
    } catch (error) {
      console.error('Error al guardar dispositivo confiable:', error);
    }
  }

  /**
   * Obtiene todos los dispositivos confiables
   */
  private obtenerDispositivosConfiables(): Record<string, number> {
    try {
      const data = localStorage.getItem('osc_trusted_devices');
      return data ? JSON.parse(data) : {};
    } catch (error) {
      return {};
    }
  }

  /**
   * Verifica si el dispositivo es confiable para el UID específico
   */
  private verificarDispositivoValido(uid: string): boolean {
    try {
      const dispositivos = this.obtenerDispositivosConfiables();
      const timestamp = dispositivos[uid];

      if (!timestamp) return false;

      // Dispositivo válido por 30 días
      const treintaDias = 30 * 24 * 60 * 60 * 1000;
      return (Date.now() - timestamp) < treintaDias;
    } catch (error) {
      return false;
    }
  }

  /**
   * Elimina el dispositivo confiable
   */
  eliminarDispositivoConfiable(uid?: string): void {
    try {
      if (uid) {
        const dispositivos = this.obtenerDispositivosConfiables();
        delete dispositivos[uid];
        localStorage.setItem('osc_trusted_devices', JSON.stringify(dispositivos));
      } else {
        localStorage.removeItem('osc_trusted_devices');
      }
    } catch (error) {
      console.error('Error al eliminar dispositivo:', error);
    }
  }

  /**
   * Verifica si hay un dispositivo confiable guardado
   */
  tieneDispositivoConfiable(): boolean {
    const dispositivos = this.obtenerDispositivosConfiables();
    return Object.keys(dispositivos).length > 0;
  }
}
