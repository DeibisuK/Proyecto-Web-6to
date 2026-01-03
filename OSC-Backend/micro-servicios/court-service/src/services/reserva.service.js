import * as model from '../models/reserva.model.js';
import { v4 as uuidv4 } from 'uuid';

export const getAll = async () => {
    return await model.findAll();
};

export const getAllComplete = async () => {
    return await model.findAllComplete();
};

export const getById = async (id) => {
    return await model.findById(id);
};

export const getByUserId = async (id_usuario) => {
    return await model.findByUserId(id_usuario);
};

export const getByCanchaId = async (id_cancha) => {
    return await model.findByCanchaId(id_cancha);
};

export const create = async (reserva) => {
    // Validaciones
    if (!['virtual', 'efectivo', 'transferencia'].includes(reserva.tipo_pago)) {
        throw new Error('Tipo de pago inválido. Debe ser: virtual, efectivo o transferencia');
    }

    // Validar pago virtual
    if (reserva.tipo_pago === 'virtual' && !reserva.id_metodo_pago) {
        throw new Error('Debe especificar un método de pago para pagos virtuales');
    }

    // Validar pagos físicos
    if (reserva.tipo_pago !== 'virtual' && reserva.id_metodo_pago) {
        throw new Error('Los pagos físicos no deben tener método de pago asociado');
    }

    // Verificar disponibilidad
    // TODO: Crear función verificar_disponibilidad_cancha en PostgreSQL
    // const disponible = await model.verificarDisponibilidad(
    //     reserva.id_cancha,
    //     reserva.fecha_reserva,
    //     reserva.hora_inicio,
    //     reserva.duracion_minutos
    // );
    // if (!disponible) {
    //     throw new Error('La cancha no está disponible en el horario seleccionado');
    // }

    // Generar token QR único
    reserva.token_acceso_qr = uuidv4();

    // Establecer valores por defecto
    reserva.estado_pago = reserva.estado_pago || 'pendiente';
    
    return await model.create(reserva);
};

export const update = async (id, reserva) => {
    return await model.update(id, reserva);
};

export const remove = async (id) => {
    return await model.remove(id);
};

export const verificarDisponibilidad = async (id_cancha, fecha_reserva, hora_inicio, duracion_minutos) => {
    return await model.verificarDisponibilidad(id_cancha, fecha_reserva, hora_inicio, duracion_minutos);
};
