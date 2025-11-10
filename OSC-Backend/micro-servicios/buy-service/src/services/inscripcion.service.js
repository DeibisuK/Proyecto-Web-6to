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
                    it.aprobado,
                    it.registrado_por,
                    
                    -- Información del torneo
                    t.nombre as torneo_nombre,
                    t.descripcion as torneo_descripcion,
                    t.fecha_inicio,
                    t.fecha_fin,
                    t.fecha_cierre_inscripcion,
                    t.estado as torneo_estado,
                    t.max_equipos,
                    t.tipo_torneo,
                    
                    -- Deporte
                    d.nombre_deporte,
                    d.url_imagen as deporte_imagen,
                    
                    -- Equipo
                    e.nombre_equipo,
                    e.logo_url as equipo_logo,
                    e.descripcion as equipo_descripcion,
                    
                    -- Grupo (si está asignado a través de grupo_equipos)
                    (
                        SELECT gt.nombre
                        FROM grupo_equipos ge
                        INNER JOIN grupos_torneo gt ON ge.id_grupo = gt.id_grupo
                        WHERE ge.id_equipo = e.id_equipo
                        AND gt.id_fase IN (
                            SELECT id_fase 
                            FROM fases_torneo 
                            WHERE id_torneo = t.id_torneo
                        )
                        LIMIT 1
                    ) as nombre_grupo,
                    
                    (
                        SELECT gt.id_grupo
                        FROM grupo_equipos ge
                        INNER JOIN grupos_torneo gt ON ge.id_grupo = gt.id_grupo
                        WHERE ge.id_equipo = e.id_equipo
                        AND gt.id_fase IN (
                            SELECT id_fase 
                            FROM fases_torneo 
                            WHERE id_torneo = t.id_torneo
                        )
                        LIMIT 1
                    ) as id_grupo,
                    
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
                            'fecha_hora_inicio', tp.fecha_hora_inicio,
                            'rival', CASE 
                                WHEN tp.equipo_local = e.id_equipo THEN er.nombre_equipo
                                ELSE el.nombre_equipo
                            END,
                            'rival_logo', CASE 
                                WHEN tp.equipo_local = e.id_equipo THEN er.logo_url
                                ELSE el.logo_url
                            END,
                            'es_local', CASE WHEN tp.equipo_local = e.id_equipo THEN true ELSE false END,
                            'sede', s.nombre,
                            'cancha', c.nombre_cancha
                        )
                        FROM torneos_partidos tp
                        LEFT JOIN equipos el ON tp.equipo_local = el.id_equipo
                        LEFT JOIN equipos er ON tp.equipo_visitante = er.id_equipo
                        LEFT JOIN sedes s ON tp.id_sede = s.id_sede
                        LEFT JOIN canchas c ON tp.id_cancha = c.id_cancha
                        WHERE tp.id_torneo = t.id_torneo 
                        AND (tp.equipo_local = e.id_equipo OR tp.equipo_visitante = e.id_equipo)
                        AND tp.estado_partido IN ('programado', 'por_jugar')
                        AND tp.fecha_hora_inicio >= NOW()
                        ORDER BY tp.fecha_hora_inicio ASC
                        LIMIT 1
                    ) as proximo_partido,
                    
                    -- Equipos inscritos
                    (
                        SELECT COUNT(*) 
                        FROM inscripciones_torneo it2 
                        WHERE it2.id_torneo = t.id_torneo 
                        AND it2.aprobado = true
                    ) as equipos_inscritos
                    
                FROM inscripciones_torneo it
                INNER JOIN torneos t ON it.id_torneo = t.id_torneo
                INNER JOIN deportes d ON t.id_deporte = d.id_deporte
                INNER JOIN equipos e ON it.id_equipo = e.id_equipo
                WHERE e.firebase_uid = $1
                ORDER BY 
                    CASE 
                        WHEN t.estado = 'en_curso' THEN 1
                        WHEN t.estado = 'abierto' THEN 2
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
                    t.fecha_cierre_inscripcion,
                    (SELECT COUNT(*) FROM inscripciones_torneo WHERE id_torneo = t.id_torneo AND aprobado = true) as inscritos
                FROM torneos t
                WHERE t.id_torneo = $1
            `;
            const result = await client.query(query, [idTorneo]);

            if (result.rows.length === 0) {
                return { disponible: false, mensaje: 'Torneo no encontrado' };
            }

            const torneo = result.rows[0];

            if (torneo.estado !== 'abierto') {
                return { disponible: false, mensaje: 'El torneo no está aceptando inscripciones' };
            }

            // Verificar si pasó la fecha de cierre de inscripción
            if (torneo.fecha_cierre_inscripcion && new Date(torneo.fecha_cierre_inscripcion) < new Date()) {
                return { disponible: false, mensaje: 'El período de inscripción ha cerrado' };
            }

            if (torneo.max_equipos && torneo.inscritos >= torneo.max_equipos) {
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
                AND estado IN ('inscrito', 'activo')
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

            // Obtener el id_user del firebase_uid para registrado_por
            const userQuery = `
                SELECT id_user 
                FROM usuarios 
                WHERE uid = $1
            `;
            const userResult = await client.query(userQuery, [datos.firebase_uid]);
            const registradoPor = userResult.rows[0]?.id_user || null;

            // Insertar inscripción
            const insertQuery = `
                INSERT INTO inscripciones_torneo (
                    id_torneo, 
                    id_equipo, 
                    fecha_inscripcion, 
                    estado,
                    registrado_por,
                    aprobado
                )
                VALUES ($1, $2, NOW(), 'inscrito', $3, true)
                RETURNING *
            `;
            const result = await client.query(insertQuery, [
                datos.id_torneo, 
                datos.id_equipo, 
                registradoPor
            ]);
            const inscripcion = result.rows[0];

            // Si se proporcionaron jugadores, registrarlos
            if (datos.jugadores && datos.jugadores.length > 0) {
                for (const jugador of datos.jugadores) {
                    const jugadorQuery = `
                        INSERT INTO jugadores (
                            id_equipo,
                            nombre,
                            apellido,
                            numero,
                            posicion_pref
                        )
                        VALUES ($1, $2, $3, $4, $5)
                        ON CONFLICT (id_equipo, numero) DO NOTHING
                    `;
                    await client.query(jugadorQuery, [
                        datos.id_equipo,
                        jugador.nombre,
                        jugador.apellido,
                        jugador.numero_camiseta || jugador.numero,
                        jugador.posicion || jugador.posicion_pref
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
                SELECT t.estado, t.fecha_inicio, it.estado as estado_inscripcion
                FROM inscripciones_torneo it
                INNER JOIN torneos t ON it.id_torneo = t.id_torneo
                WHERE it.id_inscripcion = $1
            `;
            const result = await client.query(query, [idInscripcion]);

            if (result.rows.length === 0) {
                return { puede: false, mensaje: 'Inscripción no encontrada' };
            }

            const { estado, fecha_inicio, estado_inscripcion } = result.rows[0];

            if (estado_inscripcion === 'eliminado' || estado_inscripcion === 'cancelado') {
                return { puede: false, mensaje: 'La inscripción ya fue cancelada' };
            }

            if (estado === 'en_curso' || estado === 'finalizado' || estado === 'cerrado') {
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
                SET estado = 'cancelado'
                WHERE id_inscripcion = $1
                RETURNING *
            `;
            const result = await client.query(query, [idInscripcion]);
            return result.rows[0];

        } finally {
            client.release();
        }
    }
}

export default new InscripcionService();
