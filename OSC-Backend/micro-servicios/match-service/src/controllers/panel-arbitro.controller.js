import PanelArbitroService from '../services/panel-arbitro.service.js';

/**
 * Obtener partidos asignados al árbitro autenticado
 * GET /m/arbitro/partidos
 */
export const obtenerMisPartidos = async (req, res) => {
    try {
        const { estado, fecha_desde, fecha_hasta } = req.query;
        
        // El id_arbitro viene del token JWT después de autenticación
        // req.user.uid → buscar id_user en usuarios
        const pool = (await import('../config/db.js')).default;
        const userResult = await pool.query(
            'SELECT id_user FROM usuarios WHERE uid = $1',
            [req.user.uid]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const idArbitro = userResult.rows[0].id_user;

        const filtros = {
            estado,
            fecha_desde,
            fecha_hasta
        };

        const partidos = await PanelArbitroService.obtenerPartidosAsignados(idArbitro, filtros);

        res.status(200).json({
            success: true,
            data: partidos,
            total: partidos.length
        });
    } catch (error) {
        console.error('Error al obtener partidos del árbitro:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener partidos',
            error: error.message
        });
    }
};

/**
 * Iniciar un partido
 * POST /m/arbitro/partidos/:id/iniciar
 */
export const iniciarPartido = async (req, res) => {
    try {
        const { id } = req.params;

        const pool = (await import('../config/db.js')).default;
        const userResult = await pool.query(
            'SELECT id_user FROM usuarios WHERE uid = $1',
            [req.user.uid]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const idArbitro = userResult.rows[0].id_user;

        const partido = await PanelArbitroService.iniciarPartido(parseInt(id), idArbitro);

        res.status(200).json({
            success: true,
            message: 'Partido iniciado exitosamente',
            data: partido
        });
    } catch (error) {
        console.error('Error al iniciar partido:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error al iniciar partido'
        });
    }
};

/**
 * Pausar un partido
 * POST /m/arbitro/partidos/:id/pausar
 */
export const pausarPartido = async (req, res) => {
    try {
        const { id } = req.params;

        const pool = (await import('../config/db.js')).default;
        const userResult = await pool.query(
            'SELECT id_user FROM usuarios WHERE uid = $1',
            [req.user.uid]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const idArbitro = userResult.rows[0].id_user;

        const partido = await PanelArbitroService.pausarPartido(parseInt(id), idArbitro);

        res.status(200).json({
            success: true,
            message: 'Partido pausado',
            data: partido
        });
    } catch (error) {
        console.error('Error al pausar partido:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error al pausar partido'
        });
    }
};

/**
 * Reanudar un partido
 * POST /m/arbitro/partidos/:id/reanudar
 */
export const reanudarPartido = async (req, res) => {
    try {
        const { id } = req.params;

        const pool = (await import('../config/db.js')).default;
        const userResult = await pool.query(
            'SELECT id_user FROM usuarios WHERE uid = $1',
            [req.user.uid]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const idArbitro = userResult.rows[0].id_user;

        const partido = await PanelArbitroService.reanudarPartido(parseInt(id), idArbitro);

        res.status(200).json({
            success: true,
            message: 'Partido reanudado',
            data: partido
        });
    } catch (error) {
        console.error('Error al reanudar partido:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error al reanudar partido'
        });
    }
};

/**
 * Registrar un evento en el partido (gol, tarjeta, etc.)
 * POST /m/arbitro/partidos/:id/eventos
 */
export const registrarEvento = async (req, res) => {
    try {
        const { id } = req.params;
        const eventoData = req.body;

        // Validaciones básicas
        if (!eventoData.tipo_evento || !eventoData.id_equipo) {
            return res.status(400).json({
                success: false,
                message: 'tipo_evento e id_equipo son requeridos'
            });
        }

        const pool = (await import('../config/db.js')).default;
        const userResult = await pool.query(
            'SELECT id_user FROM usuarios WHERE uid = $1',
            [req.user.uid]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const idArbitro = userResult.rows[0].id_user;

        const evento = await PanelArbitroService.registrarEvento(
            parseInt(id), 
            idArbitro, 
            eventoData
        );

        res.status(201).json({
            success: true,
            message: 'Evento registrado exitosamente',
            data: evento
        });
    } catch (error) {
        console.error('Error al registrar evento:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error al registrar evento'
        });
    }
};

/**
 * Finalizar un partido
 * POST /m/arbitro/partidos/:id/finalizar
 */
export const finalizarPartido = async (req, res) => {
    try {
        const { id } = req.params;
        const datosFinalizacion = req.body;

        const pool = (await import('../config/db.js')).default;
        const userResult = await pool.query(
            'SELECT id_user FROM usuarios WHERE uid = $1',
            [req.user.uid]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const idArbitro = userResult.rows[0].id_user;

        const partido = await PanelArbitroService.finalizarPartido(
            parseInt(id), 
            idArbitro, 
            datosFinalizacion
        );

        res.status(200).json({
            success: true,
            message: 'Partido finalizado exitosamente',
            data: partido
        });
    } catch (error) {
        console.error('Error al finalizar partido:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error al finalizar partido'
        });
    }
};

/**
 * Obtener eventos de un partido
 * GET /m/arbitro/partidos/:id/eventos
 */
export const obtenerEventos = async (req, res) => {
    try {
        const { id } = req.params;

        const eventos = await PanelArbitroService.obtenerEventosPartido(parseInt(id));

        res.status(200).json({
            success: true,
            data: eventos,
            total: eventos.length
        });
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener eventos',
            error: error.message
        });
    }
};
