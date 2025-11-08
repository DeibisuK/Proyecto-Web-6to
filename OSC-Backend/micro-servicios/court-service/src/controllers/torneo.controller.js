import TorneoService from '../services/torneo.service.js';

/**
 * Obtiene estadísticas del usuario autenticado
 * Retorna: inscripciones activas, próximos partidos, torneos ganados
 */
export const getEstadisticasUsuario = async (req, res) => {
    try {
        const firebaseUid = req.user.uid; // Del middleware authenticate
        
        const estadisticas = await TorneoService.obtenerEstadisticasUsuario(firebaseUid);
        
        res.status(200).json({
            success: true,
            data: estadisticas
        });
    } catch (error) {
        console.error('Error al obtener estadísticas del usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas del usuario',
            error: error.message
        });
    }
};

/**
 * Obtiene lista de torneos públicos con filtros opcionales
 * Query params: deporte, estado, busqueda, fecha, ordenar
 */
export const getTorneosPublicos = async (req, res) => {
    try {
        const {
            deporte,
            estado,
            busqueda,
            fecha,
            ordenar = 'fecha_desc'
        } = req.query;

        const filtros = {
            deporte: deporte ? parseInt(deporte) : null,
            estado,
            busqueda,
            fecha,
            ordenar
        };

        const torneos = await TorneoService.obtenerTorneosPublicos(filtros);
        
        res.status(200).json({
            success: true,
            data: torneos,
            count: torneos.length
        });
    } catch (error) {
        console.error('Error al obtener torneos públicos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener torneos públicos',
            error: error.message
        });
    }
};

/**
 * Obtiene los partidos de un torneo específico
 * Params: id (id_torneo)
 */
export const getPartidosPorTorneo = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de torneo inválido'
            });
        }

        const partidos = await TorneoService.obtenerPartidosPorTorneo(parseInt(id));
        
        res.status(200).json({
            success: true,
            data: partidos,
            count: partidos.length
        });
    } catch (error) {
        console.error('Error al obtener partidos del torneo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener partidos del torneo',
            error: error.message
        });
    }
};

/**
 * Obtiene la tabla de clasificación/posiciones de un torneo
 * Params: id (id_torneo)
 */
export const getClasificacionTorneo = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de torneo inválido'
            });
        }

        const clasificacion = await TorneoService.obtenerClasificacionTorneo(parseInt(id));
        
        res.status(200).json({
            success: true,
            data: clasificacion,
            count: clasificacion.length
        });
    } catch (error) {
        console.error('Error al obtener clasificación del torneo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener clasificación del torneo',
            error: error.message
        });
    }
};
