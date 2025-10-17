import crypto from 'crypto';

// IMPORTANTE: La clave debe tener exactamente 32 caracteres para AES-256
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'clave-muy-segura-de-32-chars!!';
const ALGORITHM = 'aes-256-cbc';

/**
 * Encripta un texto usando AES-256-CBC
 * @param {string} texto - Texto a encriptar
 * @returns {string} - Texto encriptado en formato "iv:contenido"
 */
export const encriptar = (texto) => {
    try {
        const iv = crypto.randomBytes(16);
        const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32), 'utf8');
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        
        let encriptado = cipher.update(texto, 'utf8', 'hex');
        encriptado += cipher.final('hex');
        
        // Retorna: iv:datosEncriptados
        return `${iv.toString('hex')}:${encriptado}`;
    } catch (error) {
        console.error('Error al encriptar:', error);
        throw new Error('Error en el proceso de encriptación');
    }
};

/**
 * Desencripta un texto encriptado con AES-256-CBC
 * @param {string} textoEncriptado - Texto en formato "iv:contenido"
 * @returns {string} - Texto desencriptado
 */
export const desencriptar = (textoEncriptado) => {
    try {
        const partes = textoEncriptado.split(':');
        if (partes.length !== 2) {
            throw new Error('Formato de texto encriptado inválido');
        }
        
        const iv = Buffer.from(partes[0], 'hex');
        const contenido = partes[1];
        const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32), 'utf8');
        
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        
        let desencriptado = decipher.update(contenido, 'hex', 'utf8');
        desencriptado += decipher.final('utf8');
        
        return desencriptado;
    } catch (error) {
        console.error('Error al desencriptar:', error);
        throw new Error('Error en el proceso de desencriptación');
    }
};

/**
 * Enmascara un número de tarjeta mostrando solo los últimos 4 dígitos
 * @param {string} numeroTarjeta - Número completo de tarjeta
 * @returns {string} - Número enmascarado (ej: ****1234)
 */
export const enmascararTarjeta = (numeroTarjeta) => {
    if (!numeroTarjeta || numeroTarjeta.length < 4) {
        return '****';
    }
    return `****${numeroTarjeta.slice(-4)}`;
};
