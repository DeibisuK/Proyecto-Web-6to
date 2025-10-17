-- ====================================================================
-- SCRIPT PARA CREAR TABLA DE MÉTODOS DE PAGO
-- Base de datos: OSC-Backend
-- Tabla: metodos_pago
-- ====================================================================

-- Crear tabla de métodos de pago
CREATE TABLE IF NOT EXISTS metodos_pago (
    id_metodo_pago SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(255) NOT NULL,
    numero_tarjeta TEXT NOT NULL, -- TEXT porque será encriptado y será más largo
    fecha_expiracion VARCHAR(10) NOT NULL,
    cvv TEXT NOT NULL, -- TEXT porque será encriptado
    banco VARCHAR(100),
    tipo_tarjeta VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsquedas rápidas por usuario
CREATE INDEX IF NOT EXISTS idx_metodos_pago_usuario ON metodos_pago(firebase_uid);

-- Comentarios en la tabla y columnas
COMMENT ON TABLE metodos_pago IS 'Almacena los métodos de pago (tarjetas) de los usuarios';
COMMENT ON COLUMN metodos_pago.id_metodo_pago IS 'ID único del método de pago';
COMMENT ON COLUMN metodos_pago.firebase_uid IS 'UID del usuario en Firebase Auth';
COMMENT ON COLUMN metodos_pago.numero_tarjeta IS 'Número de tarjeta ENCRIPTADO';
COMMENT ON COLUMN metodos_pago.fecha_expiracion IS 'Fecha de expiración (formato MM/YY)';
COMMENT ON COLUMN metodos_pago.cvv IS 'CVV ENCRIPTADO';
COMMENT ON COLUMN metodos_pago.banco IS 'Banco emisor detectado automáticamente (Visa, Mastercard, etc.)';
COMMENT ON COLUMN metodos_pago.tipo_tarjeta IS 'Tipo de tarjeta detectado automáticamente';

-- Función para actualizar automáticamente fecha_actualizacion
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion_metodo_pago()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que ejecuta la función al actualizar
DROP TRIGGER IF EXISTS trg_actualizar_metodo_pago ON metodos_pago;
CREATE TRIGGER trg_actualizar_metodo_pago
BEFORE UPDATE ON metodos_pago
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_modificacion_metodo_pago();

-- ====================================================================
-- DATOS DE PRUEBA (OPCIONAL - Comentar en producción)
-- ====================================================================
-- NOTA: Estos son solo para pruebas. En producción deben ser insertados 
-- desde la API con encriptación.

-- INSERT INTO metodos_pago (firebase_uid, numero_tarjeta, fecha_expiracion, cvv, banco, tipo_tarjeta)
-- VALUES 
-- ('test_user_uid_123', 'DATOS_ENCRIPTADOS', '12/25', 'DATOS_ENCRIPTADOS', 'Visa', 'Visa');

-- ====================================================================
-- CONSULTAS ÚTILES
-- ====================================================================

-- Ver todos los métodos de pago de un usuario
-- SELECT * FROM metodos_pago WHERE firebase_uid = 'tu_firebase_uid';

-- Contar métodos de pago por usuario
-- SELECT firebase_uid, COUNT(*) as total_metodos 
-- FROM metodos_pago 
-- GROUP BY firebase_uid;

-- Ver métodos de pago ordenados por fecha
-- SELECT * FROM metodos_pago ORDER BY fecha_creacion DESC;

-- Eliminar métodos de pago antiguos (más de 2 años)
-- DELETE FROM metodos_pago 
-- WHERE fecha_actualizacion < NOW() - INTERVAL '2 years';
