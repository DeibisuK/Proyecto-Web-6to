import TorneoAdminService from '../services/torneo.admin.service.js';

/**
 * Listar todos los torneos con paginación y filtros
 */
export const listarTorneos = async (req, res) => {
    try {
        const {
            deporte,
            estado,
            busqueda,
            fecha_desde,
            fecha_hasta,
            ordenar = 'fecha_desc',
            page = 1,
            limit = 10
        } = req.query;

        const filtros = {
            deporte: deporte ? parseInt(deporte) : null,
            estado,
            busqueda,
            fecha_desde,
            fecha_hasta,
            ordenar,
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const resultado = await TorneoAdminService.listarTorneos(filtros);
        
        res.status(200).json({
            success: true,
            data: resultado.torneos,
            pagination: {
                total: resultado.total,
                page: filtros.page,
                limit: filtros.limit,
                totalPages: Math.ceil(resultado.total / filtros.limit)
            }
        });
    } catch (error) {
        console.error('Error al listar torneos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al listar torneos',
            error: error.message
        });
    }
};

/**
 * Obtener un torneo por ID con toda su información
 */
export const obtenerTorneoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de torneo inválido'
            });
        }

        const torneo = await TorneoAdminService.obtenerTorneoPorId(parseInt(id));
        
        if (!torneo) {
            return res.status(404).json({
                success: false,
                message: 'Torneo no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: torneo
        });
    } catch (error) {
        console.error('Error al obtener torneo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener torneo',
            error: error.message
        });
    }
};

/**
 * Crear un nuevo torneo
 */
export const crearTorneo = async (req, res) => {
    try {
        
        const {
            nombre,
            descripcion,
            id_deporte,
            fecha_inicio,
            fecha_fin,
            fecha_cierre_inscripcion,
            max_equipos,
            tipo_torneo,
            estado,
            id_arbitro
        } = req.body;

        // Obtener id_user del usuario autenticado usando su uid
        const pool = (await import('../config/db.js')).default;
        const userResult = await pool.query(
            'SELECT id_user FROM usuarios WHERE uid = $1',
            [req.user.uid]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Usuario no encontrado en la base de datos'
            });
        }

        const creado_por = userResult.rows[0].id_user;

        // Validaciones básicas
        if (!nombre || !id_deporte || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos: nombre, id_deporte, fecha_inicio y fecha_fin son obligatorios'
            });
        }

        // Validar que fecha_fin sea posterior a fecha_inicio
        if (new Date(fecha_fin) <= new Date(fecha_inicio)) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de fin debe ser posterior a la fecha de inicio'
            });
        }

        // Validar que fecha_cierre_inscripcion sea anterior a fecha_inicio
        if (fecha_cierre_inscripcion && new Date(fecha_cierre_inscripcion) >= new Date(fecha_inicio)) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de cierre de inscripción debe ser anterior a la fecha de inicio'
            });
        }

        const datosTorneo = {
            nombre: nombre.trim(),
            descripcion: descripcion?.trim() || null,
            id_deporte: parseInt(id_deporte),
            fecha_inicio,
            fecha_fin,
            fecha_cierre_inscripcion: fecha_cierre_inscripcion || null,
            max_equipos: max_equipos ? parseInt(max_equipos) : null,
            tipo_torneo: tipo_torneo || 'grupo-eliminatoria',
            estado: estado || 'abierto',
            creado_por: creado_por, // Obtenido de la BD usando uid
            id_arbitro: id_arbitro ? parseInt(id_arbitro) : null
        };

        const nuevoTorneo = await TorneoAdminService.crearTorneo(datosTorneo);

        res.status(201).json({
            success: true,
            message: 'Torneo creado exitosamente',
            data: nuevoTorneo
        });
    } catch (error) {
        console.error('Error al crear torneo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear torneo',
            error: error.message
        });
    }
};

/**
 * Actualizar un torneo existente
 */
export const actualizarTorneo = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de torneo inválido'
            });
        }

        const {
            nombre,
            descripcion,
            id_deporte,
            fecha_inicio,
            fecha_fin,
            fecha_cierre_inscripcion,
            max_equipos,
            tipo_torneo,
            estado,
            id_arbitro
        } = req.body;

        // Verificar que el torneo existe
        const torneoExistente = await TorneoAdminService.obtenerTorneoPorId(parseInt(id));
        if (!torneoExistente) {
            return res.status(404).json({
                success: false,
                message: 'Torneo no encontrado'
            });
        }

        // Validar fechas si se proporcionan
        const fechaInicio = fecha_inicio || torneoExistente.fecha_inicio;
        const fechaFin = fecha_fin || torneoExistente.fecha_fin;

        if (new Date(fechaFin) <= new Date(fechaInicio)) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de fin debe ser posterior a la fecha de inicio'
            });
        }

        if (fecha_cierre_inscripcion && new Date(fecha_cierre_inscripcion) >= new Date(fechaInicio)) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de cierre de inscripción debe ser anterior a la fecha de inicio'
            });
        }

        const datosActualizacion = {
            nombre: nombre?.trim(),
            descripcion: descripcion?.trim(),
            id_deporte: id_deporte ? parseInt(id_deporte) : undefined,
            fecha_inicio,
            fecha_fin,
            fecha_cierre_inscripcion,
            max_equipos: max_equipos ? parseInt(max_equipos) : undefined,
            tipo_torneo,
            estado,
            id_arbitro: id_arbitro !== undefined ? (id_arbitro ? parseInt(id_arbitro) : null) : undefined
        };

        // Remover campos undefined
        Object.keys(datosActualizacion).forEach(key => 
            datosActualizacion[key] === undefined && delete datosActualizacion[key]
        );

        const torneoActualizado = await TorneoAdminService.actualizarTorneo(parseInt(id), datosActualizacion);
        res.status(200).json({
            success: true,
            message: 'Torneo actualizado exitosamente',
            data: torneoActualizado
        });
    } catch (error) {
        console.error('Error al actualizar torneo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar torneo',
            error: error.message
        });
    }
};

/**
 * Eliminar un torneo
 */
export const eliminarTorneo = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de torneo inválido'
            });
        }

        // Verificar que el torneo existe
        const torneoExistente = await TorneoAdminService.obtenerTorneoPorId(parseInt(id));
        if (!torneoExistente) {
            return res.status(404).json({
                success: false,
                message: 'Torneo no encontrado'
            });
        }

        // Verificar si se puede eliminar (no tiene inscripciones o partidos jugados)
        const puedeEliminar = await TorneoAdminService.verificarPuedeEliminar(parseInt(id));
        if (!puedeEliminar.puede) {
            return res.status(400).json({
                success: false,
                message: puedeEliminar.mensaje
            });
        }

        await TorneoAdminService.eliminarTorneo(parseInt(id));

        res.status(200).json({
            success: true,
            message: 'Torneo eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar torneo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar torneo',
            error: error.message
        });
    }
};

/**
 * Cambiar el estado de un torneo
 */
export const cambiarEstadoTorneo = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de torneo inválido'
            });
        }

        if (!estado) {
            return res.status(400).json({
                success: false,
                message: 'El estado es requerido'
            });
        }

        const estadosValidos = ['abierto', 'en_curso', 'cerrado', 'finalizado'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({
                success: false,
                message: `Estado inválido. Estados válidos: ${estadosValidos.join(', ')}`
            });
        }

        // Verificar que el torneo existe
        const torneoExistente = await TorneoAdminService.obtenerTorneoPorId(parseInt(id));
        if (!torneoExistente) {
            return res.status(404).json({
                success: false,
                message: 'Torneo no encontrado'
            });
        }

        const torneoActualizado = await TorneoAdminService.cambiarEstado(parseInt(id), estado);

        res.status(200).json({
            success: true,
            message: `Estado del torneo cambiado a: ${estado}`,
            data: torneoActualizado
        });
    } catch (error) {
        console.error('Error al cambiar estado del torneo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar estado del torneo',
            error: error.message
        });
    }
};

/**
 * Obtener estadísticas completas de un torneo
 */
export const obtenerEstadisticasTorneo = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de torneo inválido'
            });
        }

        const estadisticas = await TorneoAdminService.obtenerEstadisticasTorneo(parseInt(id));
        
        if (!estadisticas) {
            return res.status(404).json({
                success: false,
                message: 'Torneo no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: estadisticas
        });
    } catch (error) {
        console.error('Error al obtener estadísticas del torneo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas del torneo',
            error: error.message
        });
    }
};
