import express from 'express';
import * as metodoPagoController from '../controllers/metodo_pago.controller.js';

const router = express.Router();

// Obtener todos los métodos de pago de un usuario
router.get('/user/:firebase_uid', metodoPagoController.getMetodosPagoByUser);

// Obtener un método de pago por ID (requiere firebase_uid en query)
router.get('/:id', metodoPagoController.getMetodoPagoById);

// Crear un nuevo método de pago
router.post('/', metodoPagoController.createMetodoPago);

// Actualizar un método de pago
router.put('/:id', metodoPagoController.updateMetodoPago);

// Eliminar un método de pago (requiere firebase_uid en query)
router.delete('/:id', metodoPagoController.deleteMetodoPago);

export default router;
