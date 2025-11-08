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
                AND it.estado = 'confirmada'
                AND EXISTS (
                    SELECT 1 FROM torneos t 
                    WHERE t.id_torneo = it.id_torneo 
                    AND t.estado IN ('inscripcion_abierta', 'en_curso')
                )
            `;
            const inscripciones = await client.query(inscripcionesQuery, [firebaseUid]);

            // Obtener próximos partidos
            const proximosPartidosQuery = `
                SELECT COUNT(*) as total
                FROM torneos_partidos tp
                INNER JOIN inscripciones_torneo it1 ON tp.equipo_local = it1.id_equipo
                INNER JOIN equipos e1 ON it1.id_equipo = e1.id_equipo
                WHERE e1.firebase_uid = $1
                AND tp.estado_partido IN ('programado', 'por_jugar')
                AND tp.fecha_hora >= NOW()
                
                UNION ALL
                
                SELECT COUNT(*) as total
                FROM torneos_partidos tp
                INNER JOIN inscripciones_torneo it2 ON tp.equipo_visitante = it2.id_equipo
                INNER JOIN equipos e2 ON it2.id_equipo = e2.id_equipo
                WHERE e2.firebase_uid = $1
                AND tp.estado_partido IN ('programado', 'por_jugar')
                AND tp.fecha_hora >= NOW()
            `;
            const proximosPartidos = await client.query(proximosPartidosQuery, [firebaseUid]);
            const totalProximosPartidos = proximosPartidos.rows.reduce((sum, row) => sum + parseInt(row.total), 0);

            // Obtener torneos ganados (campeón)
            const torneosGanadosQuery = `
                SELECT COUNT(DISTINCT t.id_torneo) as total
                FROM torneos t
                INNER JOIN inscripciones_torneo it ON t.id_torneo = it.id_torneo
                INNER JOIN equipos e ON it.id_equipo = e.id_equipo
                WHERE e.firebase_uid = $1
                AND t.estado = 'finalizado'
                AND it.id_equipo = t.equipo_campeon
            `;
            const torneosGanados = await client.query(torneosGanadosQuery, [firebaseUid]);

            // Obtener victorias totales
            const victoriasQuery = `
                SELECT COUNT(*) as total
                FROM torneos_partidos tp
                INNER JOIN inscripciones_torneo it ON (
                    (tp.equipo_local = it.id_equipo AND tp.goles_local > tp.goles_visitante)
                    OR
                    (tp.equipo_visitante = it.id_equipo AND tp.goles_visitante > tp.goles_local)
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
                    t.max_equipos,
                    t.premio,
                    t.estado,
                    t.url_imagen,
                    t.costo_inscripcion,
                    d.nombre_deporte,
                    d.url_imagen as deporte_imagen,
                    d.id_deporte,
                    (SELECT COUNT(*) FROM inscripciones_torneo it 
                     WHERE it.id_torneo = t.id_torneo 
                     AND it.estado = 'confirmada') as equipos_inscritos,
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
                if (filtros.estado === 'inscripcion_abierta') {
                    query += ` AND t.estado = 'inscripcion_abierta'`;
                } else if (filtros.estado === 'en_curso') {
                    query += ` AND t.estado = 'en_curso'`;
                } else if (filtros.estado === 'finalizado') {
                    query += ` AND t.estado = 'finalizado'`;
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
                    tp.fecha_hora,
                    tp.estado_partido,
                    tp.goles_local,
                    tp.goles_visitante,
                    tp.penales_local,
                    tp.penales_visitante,
                    tp.fase,
                    tp.numero_jornada,
                    
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
                    s.nombre_sede,
                    s.direccion as sede_direccion,
                    
                    -- Árbitro
                    CONCAT(ar.nombre, ' ', ar.apellido) as arbitro_nombre
                    
                FROM torneos_partidos tp
                LEFT JOIN equipos el ON tp.equipo_local = el.id_equipo
                LEFT JOIN equipos ev ON tp.equipo_visitante = ev.id_equipo
                LEFT JOIN canchas c ON tp.id_cancha = c.id_cancha
                LEFT JOIN sedes s ON c.id_sede = s.id_sede
                LEFT JOIN arbitros ar ON tp.id_arbitro = ar.id_arbitro
                WHERE tp.id_torneo = $1
                ORDER BY 
                    CASE tp.fase
                        WHEN 'grupos' THEN 1
                        WHEN 'octavos' THEN 2
                        WHEN 'cuartos' THEN 3
                        WHEN 'semifinal' THEN 4
                        WHEN 'tercer_lugar' THEN 5
                        WHEN 'final' THEN 6
                        ELSE 7
                    END,
                    tp.numero_jornada,
                    tp.fecha_hora ASC
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
                    gt.nombre_grupo,
                    
                    -- Estadísticas calculadas
                    COUNT(CASE WHEN tp.estado_partido = 'finalizado' THEN 1 END) as partidos_jugados,
                    
                    COUNT(CASE 
                        WHEN tp.estado_partido = 'finalizado' AND (
                            (tp.equipo_local = e.id_equipo AND tp.goles_local > tp.goles_visitante) OR
                            (tp.equipo_visitante = e.id_equipo AND tp.goles_visitante > tp.goles_local)
                        ) THEN 1 
                    END) as victorias,
                    
                    COUNT(CASE 
                        WHEN tp.estado_partido = 'finalizado' AND tp.goles_local = tp.goles_visitante
                        THEN 1 
                    END) as empates,
                    
                    COUNT(CASE 
                        WHEN tp.estado_partido = 'finalizado' AND (
                            (tp.equipo_local = e.id_equipo AND tp.goles_local < tp.goles_visitante) OR
                            (tp.equipo_visitante = e.id_equipo AND tp.goles_visitante < tp.goles_local)
                        ) THEN 1 
                    END) as derrotas,
                    
                    -- Goles a favor
                    COALESCE(SUM(CASE 
                        WHEN tp.equipo_local = e.id_equipo THEN tp.goles_local
                        WHEN tp.equipo_visitante = e.id_equipo THEN tp.goles_visitante
                        ELSE 0
                    END), 0) as goles_favor,
                    
                    -- Goles en contra
                    COALESCE(SUM(CASE 
                        WHEN tp.equipo_local = e.id_equipo THEN tp.goles_visitante
                        WHEN tp.equipo_visitante = e.id_equipo THEN tp.goles_local
                        ELSE 0
                    END), 0) as goles_contra,
                    
                    -- Diferencia de goles
                    COALESCE(SUM(CASE 
                        WHEN tp.equipo_local = e.id_equipo THEN tp.goles_local - tp.goles_visitante
                        WHEN tp.equipo_visitante = e.id_equipo THEN tp.goles_visitante - tp.goles_local
                        ELSE 0
                    END), 0) as diferencia_goles,
                    
                    -- Puntos (3 por victoria, 1 por empate)
                    COALESCE(
                        3 * COUNT(CASE 
                            WHEN tp.estado_partido = 'finalizado' AND (
                                (tp.equipo_local = e.id_equipo AND tp.goles_local > tp.goles_visitante) OR
                                (tp.equipo_visitante = e.id_equipo AND tp.goles_visitante > tp.goles_local)
                            ) THEN 1 
                        END) +
                        COUNT(CASE 
                            WHEN tp.estado_partido = 'finalizado' AND tp.goles_local = tp.goles_visitante
                            THEN 1 
                        END)
                    , 0) as puntos
                    
                FROM inscripciones_torneo it
                INNER JOIN equipos e ON it.id_equipo = e.id_equipo
                LEFT JOIN grupos_torneo gt ON it.id_grupo = gt.id_grupo
                LEFT JOIN torneos_partidos tp ON 
                    tp.id_torneo = it.id_torneo AND 
                    (tp.equipo_local = e.id_equipo OR tp.equipo_visitante = e.id_equipo)
                WHERE it.id_torneo = $1
                AND it.estado = 'confirmada'
                GROUP BY e.id_equipo, e.nombre_equipo, e.logo_url, gt.nombre_grupo
                ORDER BY 
                    gt.nombre_grupo ASC,
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
}

export default new TorneoService();
