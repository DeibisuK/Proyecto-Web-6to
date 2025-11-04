import express from 'express';
import SuscripcionController from '../controllers/suscripcion.controller.js';
import ClaimsController from '../controllers/claims.controller.js';

const router = express.Router();

/**
 * Rutas públicas (no requieren autenticación)
 */

// Obtener todos los planes disponibles
router.get('/planes', SuscripcionController.obtenerPlanes);

/**
 * Rutas protegidas (requieren autenticación)
 * El middleware authenticate debe ser aplicado en app.js
 */

// Verificar estado de suscripción del usuario
router.get('/estado', SuscripcionController.verificarEstado);

// Simular pago y activar suscripción
router.post('/simular-pago', SuscripcionController.simularPago);

// Cancelar suscripción activa
router.post('/cancelar', SuscripcionController.cancelarSuscripcion);

// Sincronizar estado con Firebase
router.post('/sincronizar', SuscripcionController.sincronizarConFirebase);

// Obtener historial de suscripciones
router.get('/historial', SuscripcionController.obtenerHistorial);

// **NUEVAS RUTAS DE CLAIMS**
// Obtener mis claims actuales
router.get('/mis-claims', ClaimsController.obtenerMisClaims);

// Re-sincronizar claims preservando los existentes
router.post('/re-sincronizar-claims', ClaimsController.reSincronizar);

export default router;
