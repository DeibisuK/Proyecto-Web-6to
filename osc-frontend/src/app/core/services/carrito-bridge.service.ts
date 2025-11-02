import { Injectable } from '@angular/core';
import { CarritoService } from '../../client/features/shop/services/carrito.service';

/**
 * Servicio puente para permitir que componentes React accedan a CarritoService
 */
@Injectable({
  providedIn: 'root'
})
export class CarritoBridgeService {
  constructor(private carritoService: CarritoService) {}

  // Exponer el servicio completo para que React pueda suscribirse
  getCarritoService() {
    return this.carritoService;
  }
}

// Singleton global para acceder desde React
let carritoServiceInstance: CarritoService | null = null;

export function setCarritoServiceInstance(service: CarritoService) {
  carritoServiceInstance = service;
}

export function getCarritoServiceInstance(): CarritoService {
  if (!carritoServiceInstance) {
    throw new Error('CarritoService no ha sido inicializado. Asegúrate de llamar a setCarritoServiceInstance primero.');
  }
  return carritoServiceInstance;
}
