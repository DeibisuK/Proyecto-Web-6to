import db from '../config/db.js';
import { encriptar, desencriptar } from '../utils/crypto.js';

// Función para detectar el banco basado en el número de tarjeta
export const detectarBanco = (numeroTarjeta) => {
    const numero = numeroTarjeta.replace(/\s/g, ''); // Remover espacios
    const primerosCuatro = numero.substring(0, 4);
    
    // Patrones de bancos principales
    if (numero.startsWith('4')) {
        return 'Visa';
    } else if (numero.startsWith('5') || (numero.startsWith('2') && parseInt(primerosCuatro) >= 2221 && parseInt(primerosCuatro) <= 2720)) {
        return 'Mastercard';
    } else if (numero.startsWith('34') || numero.startsWith('37')) {
        return 'American Express';
    } else if (numero.startsWith('6011') || numero.startsWith('644') || numero.startsWith('645') || numero.startsWith('646') || numero.startsWith('647') || numero.startsWith('648') || numero.startsWith('649') || numero.startsWith('65')) {
        return 'Discover';
    } else if (numero.startsWith('30') || numero.startsWith('36') || numero.startsWith('38')) {
        return 'Diners Club';
    } else if (numero.startsWith('35')) {
        return 'JCB';
    } else {
        return 'Banco Desconocido';
    }
};

// Función para detectar el tipo de tarjeta
export const detectarTipoTarjeta = (numeroTarjeta) => {
    const numero = numeroTarjeta.replace(/\s/g, '');
    const primerosCuatro = numero.substring(0, 4);
    
    if (numero.startsWith('4')) {
        return 'Visa';
    } else if (numero.startsWith('5') || (numero.startsWith('2') && parseInt(primerosCuatro) >= 2221 && parseInt(primerosCuatro) <= 2720)) {
        return 'Mastercard';
    } else if (numero.startsWith('34') || numero.startsWith('37')) {
        return 'American Express';
    } else if (numero.startsWith('6011') || numero.startsWith('644') || numero.startsWith('645') || numero.startsWith('646') || numero.startsWith('647') || numero.startsWith('648') || numero.startsWith('649') || numero.startsWith('65')) {
        return 'Discover';
    } else if (numero.startsWith('30') || numero.startsWith('36') || numero.startsWith('38')) {
        return 'Diners Club';
    } else if (numero.startsWith('35')) {
        return 'JCB';
    } else if (numero.startsWith('1')) {
        return 'Tarjeta de Crédito';
    } else if (numero.startsWith('9')) {
        return 'Tarjeta Virtual';
    } else if (numero.startsWith('8')) {
        return 'Tarjeta Corporativa';
    } else if (numero.startsWith('7')) {
        return 'Tarjeta de Débito';
    } else if (numero.startsWith('0')) {
        return 'Tarjeta Prepago';
    } else {
        const primerDigito = numero.charAt(0);
        switch (primerDigito) {
            case '2':
                return 'Tarjeta Bancaria';
            case '3':
                return 'Tarjeta de Servicios';
            case '6':
                return 'Tarjeta de Comercio';
            default:
                return 'Tarjeta de Pago';
        }
    }
};

// Obtener todos los métodos de pago de un usuario (DESENCRIPTADOS)
export const findByFirebaseUid = async (firebase_uid) => {
    const result = await db.query(
        'SELECT * FROM metodos_pago WHERE firebase_uid = $1 ORDER BY fecha_creacion DESC',
        [firebase_uid]
    );
    
    // DESENCRIPTAR datos sensibles antes de devolver
    return result.rows.map(metodo => ({
        ...metodo,
        numero_tarjeta: desencriptar(metodo.numero_tarjeta),
        cvv: desencriptar(metodo.cvv)
    }));
};

// Obtener un método de pago por ID (DESENCRIPTADO)
export const findById = async (id) => {
    const result = await db.query(
        'SELECT * FROM metodos_pago WHERE id_metodo_pago = $1',
        [id]
    );
    
    if (result.rows[0]) {
        return {
            ...result.rows[0],
            numero_tarjeta: desencriptar(result.rows[0].numero_tarjeta),
            cvv: desencriptar(result.rows[0].cvv)
        };
    }
    
    return result.rows[0];
};

// Obtener un método de pago por ID y usuario (DESENCRIPTADO)
export const findByIdAndUser = async (id, firebase_uid) => {
    const result = await db.query(
        'SELECT * FROM metodos_pago WHERE id_metodo_pago = $1 AND firebase_uid = $2',
        [id, firebase_uid]
    );
    
    if (result.rows[0]) {
        return {
            ...result.rows[0],
            numero_tarjeta: desencriptar(result.rows[0].numero_tarjeta),
            cvv: desencriptar(result.rows[0].cvv)
        };
    }
    
    return result.rows[0];
};

// Crear un nuevo método de pago (ENCRIPTADO)
export const insert = async ({
    firebase_uid,
    numero_tarjeta,
    fecha_expiracion,
    cvv
}) => {
    const banco = detectarBanco(numero_tarjeta);
    const tipo_tarjeta = detectarTipoTarjeta(numero_tarjeta);
    
    // CIFRAR datos sensibles antes de guardar
    const numeroEncriptado = encriptar(numero_tarjeta);
    const cvvEncriptado = encriptar(cvv);
    
    const result = await db.query(
        `INSERT INTO metodos_pago 
        (firebase_uid, numero_tarjeta, fecha_expiracion, cvv, banco, tipo_tarjeta) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *`,
        [firebase_uid, numeroEncriptado, fecha_expiracion, cvvEncriptado, banco, tipo_tarjeta]
    );
    
    // Devolver desencriptado
    return {
        ...result.rows[0],
        numero_tarjeta: numero_tarjeta,
        cvv: cvv
    };
};

// Actualizar un método de pago (ENCRIPTADO)
export const update = async (id, {
    numero_tarjeta,
    fecha_expiracion,
    cvv
}) => {
    const banco = detectarBanco(numero_tarjeta);
    const tipo_tarjeta = detectarTipoTarjeta(numero_tarjeta);
    
    // CIFRAR datos sensibles antes de actualizar
    const numeroEncriptado = encriptar(numero_tarjeta);
    const cvvEncriptado = encriptar(cvv);
    
    const result = await db.query(
        `UPDATE metodos_pago 
        SET numero_tarjeta = $1, fecha_expiracion = $2, cvv = $3, banco = $4, tipo_tarjeta = $5
        WHERE id_metodo_pago = $6 
        RETURNING *`,
        [numeroEncriptado, fecha_expiracion, cvvEncriptado, banco, tipo_tarjeta, id]
    );
    
    // Devolver desencriptado
    if (result.rows[0]) {
        return {
            ...result.rows[0],
            numero_tarjeta: numero_tarjeta,
            cvv: cvv
        };
    }
    
    return result.rows[0];
};

// Eliminar un método de pago
export const remove = async (id) => {
    await db.query('DELETE FROM metodos_pago WHERE id_metodo_pago = $1', [id]);
};
