import * as metodoPagoService from '../services/metodo_pago.service.js';
import { enmascararTarjeta } from '../utils/crypto.js';

// Obtener todos los métodos de pago de un usuario
export const getMetodosPagoByUser = async (req, res) => {
    try {
        const { firebase_uid } = req.params;
        
        if (!firebase_uid) {
            return res.status(400).json({ error: 'Firebase UID es requerido' });
        }

        const metodos = await metodoPagoService.getMetodosPagoByUser(firebase_uid);
        
        // Ocultar información sensible para la respuesta
        const metodosSeguros = metodos.map(metodo => ({
            ...metodo,
            numero_tarjeta: enmascararTarjeta(metodo.numero_tarjeta),
            cvv: '***' // Nunca enviar CVV
        }));

        res.json(metodosSeguros);
    } catch (error) {
        console.error('Error al obtener métodos de pago:', error);
        res.status(500).json({ error: 'No se pudieron obtener los métodos de pago' });
    }
};

// Obtener un método de pago por ID
export const getMetodoPagoById = async (req, res) => {
    try {
        const { id } = req.params;
        const { firebase_uid } = req.query; // Para validar propiedad

        if (!firebase_uid) {
            return res.status(400).json({ error: 'Firebase UID es requerido' });
        }

        const metodo = await metodoPagoService.getMetodoPagoByIdAndUser(id, firebase_uid);
        
        if (!metodo) {
            return res.status(404).json({ error: 'Método de pago no encontrado' });
        }

        // Ocultar información sensible
        const metodoSeguro = {
            ...metodo,
            numero_tarjeta: enmascararTarjeta(metodo.numero_tarjeta),
            cvv: '***'
        };

        res.json(metodoSeguro);
    } catch (error) {
        console.error('Error al obtener método de pago:', error);
        res.status(500).json({ error: 'No se pudo obtener el método de pago' });
    }
};

// Crear un nuevo método de pago
export const createMetodoPago = async (req, res) => {
    try {
        const {
            firebase_uid,
            numero_tarjeta,
            fecha_expiracion,
            cvv
        } = req.body;

        // Validaciones básicas
        if (!firebase_uid || !numero_tarjeta || !fecha_expiracion || !cvv) {
            return res.status(400).json({ 
                error: 'Firebase UID, número de tarjeta, fecha de expiración y CVV son requeridos' 
            });
        }

        // Validar formato de número de tarjeta (solo números y espacios)
        const numeroLimpio = numero_tarjeta.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(numeroLimpio)) {
            return res.status(400).json({ 
                error: 'Número de tarjeta no válido' 
            });
        }

        // Validar CVV (3 o 4 dígitos)
        if (!/^\d{3,4}$/.test(cvv)) {
            return res.status(400).json({ 
                error: 'CVV no válido' 
            });
        }

        // Validar fecha de expiración (formato MM/YY o MM/YYYY)
        if (!/^(0[1-9]|1[0-2])\/\d{2,4}$/.test(fecha_expiracion)) {
            return res.status(400).json({ 
                error: 'Fecha de expiración no válida (formato: MM/YY)' 
            });
        }

        const nuevoMetodo = await metodoPagoService.createMetodoPago({
            firebase_uid,
            numero_tarjeta: numeroLimpio, // Guardar sin espacios
            fecha_expiracion,
            cvv
        });

        // Respuesta segura
        const metodoSeguro = {
            ...nuevoMetodo,
            numero_tarjeta: enmascararTarjeta(nuevoMetodo.numero_tarjeta),
            cvv: '***'
        };

        res.status(201).json({
            message: 'Método de pago creado correctamente',
            metodo: metodoSeguro
        });
    } catch (error) {
        console.error('Error al crear método de pago:', error);
        res.status(500).json({ error: 'No se pudo crear el método de pago' });
    }
};

// Actualizar un método de pago
export const updateMetodoPago = async (req, res) => {
    try {
        const { id } = req.params;
        const { firebase_uid, numero_tarjeta, fecha_expiracion, cvv } = req.body;

        if (!firebase_uid) {
            return res.status(400).json({ error: 'Firebase UID es requerido' });
        }

        // Verificar que el método pertenece al usuario
        const isOwner = await metodoPagoService.validateMethodOwnership(id, firebase_uid);
        if (!isOwner) {
            return res.status(403).json({ error: 'No tienes permiso para actualizar este método' });
        }

        // Validar número de tarjeta si se proporciona
        if (numero_tarjeta) {
            const numeroLimpio = numero_tarjeta.replace(/\s/g, '');
            if (!/^\d{13,19}$/.test(numeroLimpio)) {
                return res.status(400).json({ 
                    error: 'Número de tarjeta no válido' 
                });
            }
        }

        // Validar CVV si se proporciona
        if (cvv && !/^\d{3,4}$/.test(cvv)) {
            return res.status(400).json({ 
                error: 'CVV no válido' 
            });
        }

        // Validar fecha de expiración si se proporciona
        if (fecha_expiracion && !/^(0[1-9]|1[0-2])\/\d{2,4}$/.test(fecha_expiracion)) {
            return res.status(400).json({ 
                error: 'Fecha de expiración no válida (formato: MM/YY)' 
            });
        }

        const updateData = {
            numero_tarjeta: numero_tarjeta ? numero_tarjeta.replace(/\s/g, '') : undefined,
            fecha_expiracion,
            cvv
        };

        const metodoActualizado = await metodoPagoService.updateMetodoPago(id, updateData);
        
        if (!metodoActualizado) {
            return res.status(404).json({ error: 'Método de pago no encontrado' });
        }

        // Respuesta segura
        const metodoSeguro = {
            ...metodoActualizado,
            numero_tarjeta: enmascararTarjeta(metodoActualizado.numero_tarjeta),
            cvv: '***'
        };

        res.json({
            message: 'Método de pago actualizado correctamente',
            metodo: metodoSeguro
        });
    } catch (error) {
        console.error('Error al actualizar método de pago:', error);
        res.status(500).json({ error: 'No se pudo actualizar el método de pago' });
    }
};

// Eliminar un método de pago
export const deleteMetodoPago = async (req, res) => {
    try {
        const { id } = req.params;
        const { firebase_uid } = req.query;

        if (!firebase_uid) {
            return res.status(400).json({ error: 'Firebase UID es requerido' });
        }

        // Verificar que el método pertenece al usuario
        const isOwner = await metodoPagoService.validateMethodOwnership(id, firebase_uid);
        if (!isOwner) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar este método' });
        }

        await metodoPagoService.deleteMetodoPago(id);
        res.json({ message: 'Método de pago eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar método de pago:', error);
        res.status(500).json({ error: 'No se pudo eliminar el método de pago' });
    }
};
