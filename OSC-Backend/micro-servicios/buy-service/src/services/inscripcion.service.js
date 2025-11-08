import pool from '../config/db.js';

class InscripcionService {
    /**
     * Obtiene todas las inscripciones de un usuario con información detallada del torneo
     */
    async obtenerInscripcionesUsuario(firebaseUid) {
        const client = await pool.connect();
        try {
            const query = `
                SELECT 
                    it.id_inscripcion,
                    it.id_torneo,
                    it.id_equipo,
                    it.fecha_inscripcion,
                    it.estado as estado_inscripcion,
                    it.monto_pagado,
                    
                    -- Información del torneo
                    t.nombre as torneo_nombre,
                    t.descripcion as torneo_descripcion,
                    t.fecha_inicio,
                    t.fecha_fin,
                    t.estado as torneo_estado,
                    t.url_imagen as torneo_imagen,
                    t.premio,
                    t.max_equipos,
                    t.costo_inscripcion,
                    
                    -- Deporte
                    d.nombre_deporte,
                    d.url_imagen as deporte_imagen,
                    
                    -- Equipo
                    e.nombre_equipo,
                    e.logo_url as equipo_logo,
                    
                    -- Grupo (si está asignado)
                    gt.nombre_grupo,
                    
                    -- Estadísticas del equipo en el torneo
                    (
                        SELECT COUNT(*) 
                        FROM torneos_partidos tp 
                        WHERE tp.id_torneo = t.id_torneo 
                        AND (tp.equipo_local = e.id_equipo OR tp.equipo_visitante = e.id_equipo)
                        AND tp.estado_partido = 'finalizado'
                    ) as partidos_jugados,
                    
                    (
                        SELECT COUNT(*) 
                        FROM torneos_partidos tp 
                        WHERE tp.id_torneo = t.id_torneo 
                        AND (tp.equipo_local = e.id_equipo OR tp.equipo_visitante = e.id_equipo)
                        AND tp.estado_partido IN ('programado', 'por_jugar')
                    ) as partidos_pendientes,
                    
                    -- Próximo partido
                    (
                        SELECT json_build_object(
                            'id_partido', tp.id_partido,
                            'fecha_hora', tp.fecha_hora,
                            'rival', CASE 
                                WHEN tp.equipo_local = e.id_equipo THEN er.nombre_equipo
                                ELSE el.nombre_equipo
                            END,
                            'rival_logo', CASE 
                                WHEN tp.equipo_local = e.id_equipo THEN er.logo_url
                                ELSE el.logo_url
                            END,
                            'es_local', CASE WHEN tp.equipo_local = e.id_equipo THEN true ELSE false END
                        )
                        FROM torneos_partidos tp
                        LEFT JOIN equipos el ON tp.equipo_local = el.id_equipo
                        LEFT JOIN equipos er ON tp.equipo_visitante = er.id_equipo
                        WHERE tp.id_torneo = t.id_torneo 
                        AND (tp.equipo_local = e.id_equipo OR tp.equipo_visitante = e.id_equipo)
                        AND tp.estado_partido IN ('programado', 'por_jugar')
                        AND tp.fecha_hora >= NOW()
                        ORDER BY tp.fecha_hora ASC
                        LIMIT 1
                    ) as proximo_partido,
                    
                    -- Equipos inscritos
                    (
                        SELECT COUNT(*) 
                        FROM inscripciones_torneo it2 
                        WHERE it2.id_torneo = t.id_torneo 
                        AND it2.estado = 'confirmada'
                    ) as equipos_inscritos
                    
                FROM inscripciones_torneo it
                INNER JOIN torneos t ON it.id_torneo = t.id_torneo
                INNER JOIN deportes d ON t.id_deporte = d.id_deporte
                INNER JOIN equipos e ON it.id_equipo = e.id_equipo
                LEFT JOIN grupos_torneo gt ON it.id_grupo = gt.id_grupo
                WHERE e.firebase_uid = $1
                ORDER BY 
                    CASE 
                        WHEN t.estado = 'en_curso' THEN 1
                        WHEN t.estado = 'inscripcion_abierta' THEN 2
                        WHEN t.estado = 'finalizado' THEN 3
                        ELSE 4
                    END,
                    t.fecha_inicio DESC
            `;

            const result = await client.query(query, [firebaseUid]);
            return result.rows;

        } finally {
            client.release();
        }
    }

    /**
     * Verifica que un equipo pertenezca a un usuario
     */
    async verificarPropiedadEquipo(idEquipo, firebaseUid) {
        const client = await pool.connect();
        try {
            const query = `
                SELECT 1 
                FROM equipos 
                WHERE id_equipo = $1 
                AND firebase_uid = $2
            `;
            const result = await client.query(query, [idEquipo, firebaseUid]);
            return result.rows.length > 0;

        } finally {
            client.release();
        }
    }

    /**
     * Verifica que un torneo esté disponible para inscripción
     */
    async verificarTorneoDisponible(idTorneo) {
        const client = await pool.connect();
        try {
            const query = `
                SELECT 
                    t.estado,
                    t.max_equipos,
                    (SELECT COUNT(*) FROM inscripciones_torneo WHERE id_torneo = t.id_torneo AND estado = 'confirmada') as inscritos
                FROM torneos t
                WHERE t.id_torneo = $1
            `;
            const result = await client.query(query, [idTorneo]);

            if (result.rows.length === 0) {
                return { disponible: false, mensaje: 'Torneo no encontrado' };
            }

            const torneo = result.rows[0];

            if (torneo.estado !== 'inscripcion_abierta') {
                return { disponible: false, mensaje: 'El torneo no está aceptando inscripciones' };
            }

            if (torneo.inscritos >= torneo.max_equipos) {
                return { disponible: false, mensaje: 'El torneo ha alcanzado el máximo de equipos' };
            }

            return { disponible: true };

        } finally {
            client.release();
        }
    }

    /**
     * Verifica si ya existe una inscripción para ese equipo en el torneo
     */
    async verificarInscripcionExistente(idTorneo, idEquipo) {
        const client = await pool.connect();
        try {
            const query = `
                SELECT 1 
                FROM inscripciones_torneo 
                WHERE id_torneo = $1 
                AND id_equipo = $2
                AND estado IN ('pendiente', 'confirmada')
            `;
            const result = await client.query(query, [idTorneo, idEquipo]);
            return result.rows.length > 0;

        } finally {
            client.release();
        }
    }

    /**
     * Crea una nueva inscripción
     */
    async crearInscripcion(datos) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Insertar inscripción
            const insertQuery = `
                INSERT INTO inscripciones_torneo (
                    id_torneo, 
                    id_equipo, 
                    fecha_inscripcion, 
                    estado,
                    monto_pagado
                )
                VALUES ($1, $2, NOW(), 'pendiente', 0)
                RETURNING *
            `;
            const result = await client.query(insertQuery, [datos.id_torneo, datos.id_equipo]);
            const inscripcion = result.rows[0];

            // Si se proporcionaron jugadores, registrarlos
            if (datos.jugadores && datos.jugadores.length > 0) {
                for (const jugador of datos.jugadores) {
                    const jugadorQuery = `
                        INSERT INTO jugadores (
                            id_equipo,
                            nombre,
                            apellido,
                            numero_camiseta,
                            posicion
                        )
                        VALUES ($1, $2, $3, $4, $5)
                        ON CONFLICT (id_equipo, numero_camiseta) DO NOTHING
                    `;
                    await client.query(jugadorQuery, [
                        datos.id_equipo,
                        jugador.nombre,
                        jugador.apellido,
                        jugador.numero_camiseta,
                        jugador.posicion
                    ]);
                }
            }

            await client.query('COMMIT');
            return inscripcion;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Verifica que una inscripción pertenezca al usuario
     */
    async verificarPropiedadInscripcion(idInscripcion, firebaseUid) {
        const client = await pool.connect();
        try {
            const query = `
                SELECT 1 
                FROM inscripciones_torneo it
                INNER JOIN equipos e ON it.id_equipo = e.id_equipo
                WHERE it.id_inscripcion = $1 
                AND e.firebase_uid = $2
            `;
            const result = await client.query(query, [idInscripcion, firebaseUid]);
            return result.rows.length > 0;

        } finally {
            client.release();
        }
    }

    /**
     * Verifica si se puede cancelar una inscripción
     */
    async verificarPuedeCancelar(idInscripcion) {
        const client = await pool.connect();
        try {
            const query = `
                SELECT t.estado, t.fecha_inicio
                FROM inscripciones_torneo it
                INNER JOIN torneos t ON it.id_torneo = t.id_torneo
                WHERE it.id_inscripcion = $1
            `;
            const result = await client.query(query, [idInscripcion]);

            if (result.rows.length === 0) {
                return { puede: false, mensaje: 'Inscripción no encontrada' };
            }

            const { estado, fecha_inicio } = result.rows[0];

            if (estado === 'en_curso' || estado === 'finalizado') {
                return { puede: false, mensaje: 'No se puede cancelar una inscripción de un torneo que ya comenzó o finalizó' };
            }

            // Verificar si falta menos de 24 horas para el inicio
            const horasRestantes = (new Date(fecha_inicio) - new Date()) / (1000 * 60 * 60);
            if (horasRestantes < 24) {
                return { puede: false, mensaje: 'No se puede cancelar la inscripción con menos de 24 horas antes del inicio' };
            }

            return { puede: true };

        } finally {
            client.release();
        }
    }

    /**
     * Cancela una inscripción
     */
    async cancelarInscripcion(idInscripcion) {
        const client = await pool.connect();
        try {
            const query = `
                UPDATE inscripciones_torneo 
                SET estado = 'cancelada'
                WHERE id_inscripcion = $1
            `;
            await client.query(query, [idInscripcion]);

        } finally {
            client.release();
        }
    }
}

export default new InscripcionService();
