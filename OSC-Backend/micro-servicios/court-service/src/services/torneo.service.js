import pool from '../config/db.js';

class TorneoService {
    /**
     * Obtiene estadísticas del usuario autenticado
     * Retorna inscripciones activas, próximos partidos, torneos ganados
     */
    async obtenerEstadisticasUsuario(firebaseUid) {
        const client = await pool.connect();
        try {
            // Obtener inscripciones activas
            const inscripcionesQuery = `
                SELECT COUNT(DISTINCT it.id_torneo) as total
                FROM inscripciones_torneo it
                INNER JOIN equipos e ON it.id_equipo = e.id_equipo
                WHERE e.firebase_uid = $1 
                AND it.aprobado = true
                AND EXISTS (
                    SELECT 1 FROM torneos t 
                    WHERE t.id_torneo = it.id_torneo 
                    AND t.estado IN ('abierto', 'en_curso')
                )
            `;
            const inscripciones = await client.query(inscripcionesQuery, [firebaseUid]);

            // Obtener próximos partidos
            const proximosPartidosQuery = `
                SELECT COUNT(*) as total
                FROM partidos_torneo tp
                INNER JOIN inscripciones_torneo it1 ON tp.id_equipo_local = it1.id_equipo
                INNER JOIN equipos e1 ON it1.id_equipo = e1.id_equipo
                WHERE e1.firebase_uid = $1
                AND tp.estado_partido IN ('programado', 'por_jugar')
                AND tp.fecha_partido >= CURRENT_DATE
                
                UNION ALL
                
                SELECT COUNT(*) as total
                FROM partidos_torneo tp
                INNER JOIN inscripciones_torneo it2 ON tp.id_equipo_visitante = it2.id_equipo
                INNER JOIN equipos e2 ON it2.id_equipo = e2.id_equipo
                WHERE e2.firebase_uid = $1
                AND tp.estado_partido IN ('programado', 'por_jugar')
                AND tp.fecha_partido >= CURRENT_DATE
            `;
            const proximosPartidos = await client.query(proximosPartidosQuery, [firebaseUid]);
            const totalProximosPartidos = proximosPartidos.rows.reduce((sum, row) => sum + parseInt(row.total), 0);

            // Obtener torneos ganados (campeón)
            // Nota: La tabla torneos no tiene columna equipo_campeon, se necesitaría agregar o calcular de otra forma
            const torneosGanadosQuery = `
                SELECT COUNT(DISTINCT t.id_torneo) as total
                FROM torneos t
                INNER JOIN inscripciones_torneo it ON t.id_torneo = it.id_torneo
                INNER JOIN equipos e ON it.id_equipo = e.id_equipo
                WHERE e.firebase_uid = $1
                AND t.estado = 'finalizado'
            `;
            const torneosGanados = await client.query(torneosGanadosQuery, [firebaseUid]);

            // Obtener victorias totales
            const victoriasQuery = `
                SELECT COUNT(*) as total 
                FROM partidos_torneo tp
                INNER JOIN inscripciones_torneo it ON (
                    (tp.id_equipo_local = it.id_equipo AND tp.resultado_local > tp.resultado_visitante)
                    OR
                    (tp.id_equipo_visitante = it.id_equipo AND tp.resultado_visitante > tp.resultado_local)
                )
                INNER JOIN equipos e ON it.id_equipo = e.id_equipo
                WHERE e.firebase_uid = $1
                AND tp.estado_partido = 'finalizado'
            `;
            const victorias = await client.query(victoriasQuery, [firebaseUid]);

            return {
                inscripcionesActivas: parseInt(inscripciones.rows[0].total),
                proximosPartidos: totalProximosPartidos,
                torneosGanados: parseInt(torneosGanados.rows[0].total),
                victorias: parseInt(victorias.rows[0].total)
            };

        } finally {
            client.release();
        }
    }

    /**
     * Obtiene torneos públicos con filtros opcionales
     */
    async obtenerTorneosPublicos(filtros = {}) {
        const client = await pool.connect();
        try {
            let query = `
                SELECT 
                    t.id_torneo,
                    t.nombre,
                    t.descripcion,
                    t.fecha_inicio,
                    t.fecha_fin,
                    t.fecha_cierre_inscripcion,
                    t.max_equipos,
                    t.estado,
                    t.tipo_torneo,
                    t.creado_por,
                    t.creado_en,
                    d.nombre_deporte,
                    d.url_imagen as deporte_imagen,
                    d.id_deporte,
                    (SELECT COUNT(*) FROM inscripciones_torneo it 
                     WHERE it.id_torneo = t.id_torneo 
                     AND it.aprobado = true) as equipos_inscritos,
                    CASE 
                        WHEN t.fecha_inicio > NOW() THEN 'próximo'
                        WHEN t.fecha_inicio <= NOW() AND t.fecha_fin >= NOW() THEN 'en_curso'
                        WHEN t.fecha_fin < NOW() THEN 'finalizado'
                        ELSE 'otro'
                    END as estado_calculado
                FROM torneos t
                INNER JOIN deportes d ON t.id_deporte = d.id_deporte
                WHERE 1=1
            `;
            const params = [];
            let paramCount = 1;

            // Filtro por deporte
            if (filtros.deporte) {
                query += ` AND t.id_deporte = $${paramCount}`;
                params.push(filtros.deporte);
                paramCount++;
            }

            // Filtro por estado
            if (filtros.estado) {
                if (filtros.estado === 'inscripcion_abierta' || filtros.estado === 'abierto') {
                    query += ` AND t.estado = 'abierto'`;
                } else if (filtros.estado === 'en_curso') {
                    query += ` AND t.estado = 'en_curso'`;
                } else if (filtros.estado === 'finalizado') {
                    query += ` AND t.estado = 'finalizado'`;
                } else if (filtros.estado === 'cerrado') {
                    query += ` AND t.estado = 'cerrado'`;
                }
            }

            // Filtro por búsqueda (nombre o descripción)
            if (filtros.busqueda) {
                query += ` AND (LOWER(t.nombre) LIKE $${paramCount} OR LOWER(t.descripcion) LIKE $${paramCount})`;
                params.push(`%${filtros.busqueda.toLowerCase()}%`);
                paramCount++;
            }

            // Filtro por fecha
            if (filtros.fecha) {
                query += ` AND DATE(t.fecha_inicio) >= $${paramCount}`;
                params.push(filtros.fecha);
                paramCount++;
            }

            // Ordenamiento
            switch (filtros.ordenar) {
                case 'fecha_asc':
                    query += ' ORDER BY t.fecha_inicio ASC';
                    break;
                case 'fecha_desc':
                    query += ' ORDER BY t.fecha_inicio DESC';
                    break;
                case 'nombre':
                    query += ' ORDER BY t.nombre ASC';
                    break;
                case 'popularidad':
                    query += ' ORDER BY equipos_inscritos DESC';
                    break;
                default:
                    query += ' ORDER BY t.fecha_inicio DESC';
            }

            const result = await client.query(query, params);
            return result.rows;

        } finally {
            client.release();
        }
    }

    /**
     * Obtiene los partidos de un torneo específico
     */
    async obtenerPartidosPorTorneo(idTorneo) {
        const client = await pool.connect();
        try {
            const query = `
                SELECT 
                    tp.id_partido,
                    tp.id_torneo,
                    tp.id_fase,
                    tp.id_grupo,
                    tp.fecha_partido,
                    tp.hora_inicio,
                    tp.estado_partido,
                    tp.resultado_local,
                    tp.resultado_visitante,
                    tp.id_cancha,
                    tp.id_sede,
                    tp.nota,
                    
                    -- Equipo local
                    el.id_equipo as equipo_local_id,
                    el.nombre_equipo as equipo_local_nombre,
                    el.logo_url as equipo_local_logo,
                    
                    -- Equipo visitante
                    ev.id_equipo as equipo_visitante_id,
                    ev.nombre_equipo as equipo_visitante_nombre,
                    ev.logo_url as equipo_visitante_logo,
                    
                    -- Cancha
                    c.nombre_cancha,
                    s.nombre as nombre_sede,
                    s.direccion as sede_direccion,
                    s.ciudad as sede_ciudad,
                    
                    -- Árbitro (la tabla arbitros no tiene nombre/apellido, solo id_usuario)
                    u.name_user as arbitro_nombre,
                    
                    -- Fase
                    f.nombre as nombre_fase,
                    
                    -- Grupo
                    g.nombre as nombre_grupo
                    
                FROM partidos_torneo tp
                LEFT JOIN equipos el ON tp.id_equipo_local = el.id_equipo
                LEFT JOIN equipos ev ON tp.id_equipo_visitante = ev.id_equipo
                LEFT JOIN canchas c ON tp.id_cancha = c.id_cancha
                LEFT JOIN sedes s ON tp.id_sede = s.id_sede
                LEFT JOIN usuarios u ON tp.id_arbitro = u.id_user AND u.id_rol = 3
                LEFT JOIN fases_torneo f ON tp.id_fase = f.id_fase
                LEFT JOIN grupos_torneo g ON tp.id_grupo = g.id_grupo
                WHERE tp.id_torneo = $1
                ORDER BY 
                    f.orden ASC,
                    g.nombre ASC,
                    tp.fecha_partido ASC, tp.hora_inicio ASC
            `;

            const result = await client.query(query, [idTorneo]);
            return result.rows;

        } finally {
            client.release();
        }
    }

    /**
     * Obtiene la tabla de clasificación/posiciones de un torneo
     */
    async obtenerClasificacionTorneo(idTorneo) {
        const client = await pool.connect();
        try {
            const query = `
                SELECT 
                    e.id_equipo,
                    e.nombre_equipo,
                    e.logo_url,
                    gt.nombre as nombre_grupo,
                    
                    -- Estadísticas calculadas
                    COUNT(CASE WHEN tp.estado_partido = 'finalizado' THEN 1 END) as partidos_jugados,
                    
                    COUNT(CASE 
                        WHEN tp.estado_partido = 'finalizado' AND (
                            (tp.id_equipo_local = e.id_equipo AND tp.resultado_local > tp.resultado_visitante) OR
                            (tp.id_equipo_visitante = e.id_equipo AND tp.resultado_visitante > tp.resultado_local)
                        ) THEN 1 
                    END) as victorias,
                    
                    COUNT(CASE 
                        WHEN tp.estado_partido = 'finalizado' AND tp.resultado_local = tp.resultado_visitante
                        THEN 1 
                    END) as empates,
                    
                    COUNT(CASE 
                        WHEN tp.estado_partido = 'finalizado' AND (
                            (tp.id_equipo_local = e.id_equipo AND tp.resultado_local < tp.resultado_visitante) OR
                            (tp.id_equipo_visitante = e.id_equipo AND tp.resultado_visitante < tp.resultado_local)
                        ) THEN 1 
                    END) as derrotas,
                    
                    -- Goles a favor
                    COALESCE(SUM(CASE 
                        WHEN tp.id_equipo_local = e.id_equipo THEN tp.resultado_local
                        WHEN tp.id_equipo_visitante = e.id_equipo THEN tp.resultado_visitante
                        ELSE 0
                    END), 0) as goles_favor,
                    
                    -- Goles en contra
                    COALESCE(SUM(CASE 
                        WHEN tp.id_equipo_local = e.id_equipo THEN tp.resultado_visitante
                        WHEN tp.id_equipo_visitante = e.id_equipo THEN tp.resultado_local
                        ELSE 0
                    END), 0) as goles_contra,
                    
                    -- Diferencia de goles
                    COALESCE(SUM(CASE 
                        WHEN tp.id_equipo_local = e.id_equipo THEN tp.resultado_local - tp.resultado_visitante
                        WHEN tp.id_equipo_visitante = e.id_equipo THEN tp.resultado_visitante - tp.resultado_local
                        ELSE 0
                    END), 0) as diferencia_goles,
                    
                    -- Puntos (3 por victoria, 1 por empate)
                    COALESCE(
                        3 * COUNT(CASE 
                            WHEN tp.estado_partido = 'finalizado' AND (
                                (tp.id_equipo_local = e.id_equipo AND tp.resultado_local > tp.resultado_visitante) OR
                                (tp.id_equipo_visitante = e.id_equipo AND tp.resultado_visitante > tp.resultado_local)
                            ) THEN 1 
                        END) +
                        COUNT(CASE 
                            WHEN tp.estado_partido = 'finalizado' AND tp.resultado_local = tp.resultado_visitante
                            THEN 1 
                        END)
                    , 0) as puntos
                    
                FROM inscripciones_torneo it
                INNER JOIN equipos e ON it.id_equipo = e.id_equipo
                LEFT JOIN grupo_equipos ge ON ge.id_equipo = e.id_equipo
                LEFT JOIN grupos_torneo gt ON ge.id_grupo = gt.id_grupo
                    AND gt.id_fase IN (SELECT id_fase FROM fases_torneo WHERE id_torneo = $1)
                LEFT JOIN partidos_torneo tp ON 
                    tp.id_torneo = it.id_torneo AND 
                    (tp.id_equipo_local = e.id_equipo OR tp.id_equipo_visitante = e.id_equipo)
                WHERE it.id_torneo = $1
                AND it.aprobado = true
                GROUP BY e.id_equipo, e.nombre_equipo, e.logo_url, gt.nombre
                ORDER BY 
                    gt.nombre ASC,
                    puntos DESC,
                    diferencia_goles DESC,
                    goles_favor DESC
            `;

            const result = await client.query(query, [idTorneo]);
            return result.rows;

        } finally {
            client.release();
        }
    }

    /**
     * Obtiene los equipos inscritos en un torneo con su información completa
     */
    async obtenerEquiposInscritos(idTorneo) {
        const client = await pool.connect();
        try {
            const query = `
                SELECT 
                    e.id_equipo,
                    e.nombre_equipo,
                    e.logo_url,
                    e.descripcion,
                    it.id_inscripcion,
                    it.fecha_inscripcion,
                    it.aprobado,
                    (SELECT COUNT(*) FROM jugadores j WHERE j.id_equipo = e.id_equipo AND j.estado = 'activo') as cantidad_jugadores
                FROM inscripciones_torneo it
                INNER JOIN equipos e ON it.id_equipo = e.id_equipo
                WHERE it.id_torneo = $1
                AND it.aprobado = true
                ORDER BY it.fecha_inscripcion ASC
            `;

            const result = await client.query(query, [idTorneo]);
            return result.rows;

        } finally {
            client.release();
        }
    }
}

export default new TorneoService();
