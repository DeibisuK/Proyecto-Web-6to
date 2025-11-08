import InscripcionService from '../services/inscripcion.service.js';

/**
 * Obtiene todas las inscripciones de un usuario
 */
export const getInscripcionesUsuario = async (req, res) => {
    try {
        const { uid } = req.params;
        
        // Verificar que el usuario solo pueda ver sus propias inscripciones
        if (req.user.uid !== uid && req.user.rol !== 1) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver estas inscripciones'
            });
        }

        const inscripciones = await InscripcionService.obtenerInscripcionesUsuario(uid);
        
        res.status(200).json({
            success: true,
            data: inscripciones,
            count: inscripciones.length
        });
    } catch (error) {
        console.error('Error al obtener inscripciones del usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener inscripciones del usuario',
            error: error.message
        });
    }
};

/**
 * Crea una nueva inscripción a un torneo
 */
export const crearInscripcion = async (req, res) => {
    try {
        const { id_torneo, id_equipo, jugadores } = req.body;
        const firebaseUid = req.user.uid;

        // Validaciones básicas
        if (!id_torneo || !id_equipo) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos: id_torneo e id_equipo son obligatorios'
            });
        }

        // Verificar que el equipo pertenezca al usuario
        const equipoValido = await InscripcionService.verificarPropiedadEquipo(id_equipo, firebaseUid);
        if (!equipoValido) {
            return res.status(403).json({
                success: false,
                message: 'El equipo no pertenece al usuario autenticado'
            });
        }

        // Verificar que el torneo esté en inscripción abierta
        const torneoDisponible = await InscripcionService.verificarTorneoDisponible(id_torneo);
        if (!torneoDisponible.disponible) {
            return res.status(400).json({
                success: false,
                message: torneoDisponible.mensaje
            });
        }

        // Verificar que no exista una inscripción previa
        const inscripcionExistente = await InscripcionService.verificarInscripcionExistente(id_torneo, id_equipo);
        if (inscripcionExistente) {
            return res.status(400).json({
                success: false,
                message: 'El equipo ya está inscrito en este torneo'
            });
        }

        // Crear la inscripción
        const nuevaInscripcion = await InscripcionService.crearInscripcion({
            id_torneo,
            id_equipo,
            jugadores: jugadores || [],
            firebase_uid: firebaseUid
        });

        res.status(201).json({
            success: true,
            message: 'Inscripción creada exitosamente',
            data: nuevaInscripcion
        });
    } catch (error) {
        console.error('Error al crear inscripción:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear inscripción',
            error: error.message
        });
    }
};

/**
 * Cancela una inscripción existente
 */
export const cancelarInscripcion = async (req, res) => {
    try {
        const { id } = req.params;
        const firebaseUid = req.user.uid;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de inscripción inválido'
            });
        }

        // Verificar que la inscripción pertenezca al usuario
        const inscripcionValida = await InscripcionService.verificarPropiedadInscripcion(parseInt(id), firebaseUid);
        if (!inscripcionValida) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para cancelar esta inscripción'
            });
        }

        // Verificar que el torneo aún permita cancelaciones
        const puedeCancelar = await InscripcionService.verificarPuedeCancelar(parseInt(id));
        if (!puedeCancelar.puede) {
            return res.status(400).json({
                success: false,
                message: puedeCancelar.mensaje
            });
        }

        // Cancelar la inscripción
        await InscripcionService.cancelarInscripcion(parseInt(id));

        res.status(200).json({
            success: true,
            message: 'Inscripción cancelada exitosamente'
        });
    } catch (error) {
        console.error('Error al cancelar inscripción:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cancelar inscripción',
            error: error.message
        });
    }
};
