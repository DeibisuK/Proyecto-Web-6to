import pool from '../config/db.js';

class TorneoAdminService {
    /**
     * Listar todos los torneos con filtros y paginación
     */
    async listarTorneos(filtros = {}) {
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
                    t.tipo_torneo,
                    t.estado,
                    t.creado_por,
                    t.creado_en,
                    
                    -- Información del deporte
                    d.id_deporte,
                    d.nombre_deporte,
                    d.url_imagen as deporte_imagen,
                    
                    -- Usuario creador
                    u.name_user as creador_nombre,
                    u.email_user as creador_email,
                    
                    -- Estadísticas
                    (SELECT COUNT(*) FROM inscripciones_torneo it 
                     WHERE it.id_torneo = t.id_torneo 
                     AND it.aprobado = true) as equipos_inscritos,
                    
                    (SELECT COUNT(*) FROM partidos_torneo tp 
                     WHERE tp.id_torneo = t.id_torneo) as total_partidos,
                    
                    (SELECT COUNT(*) FROM partidos_torneo tp 
                     WHERE tp.id_torneo = t.id_torneo 
                     AND tp.estado_partido = 'finalizado') as partidos_finalizados
                    
                FROM torneos t
                INNER JOIN deportes d ON t.id_deporte = d.id_deporte
                LEFT JOIN usuarios u ON t.creado_por = u.id_user
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
                query += ` AND t.estado = $${paramCount}`;
                params.push(filtros.estado);
                paramCount++;
            }

            // Filtro por búsqueda (nombre o descripción)
            if (filtros.busqueda) {
                query += ` AND (LOWER(t.nombre) LIKE $${paramCount} OR LOWER(t.descripcion) LIKE $${paramCount})`;
                params.push(`%${filtros.busqueda.toLowerCase()}%`);
                paramCount++;
            }

            // Filtro por rango de fechas
            if (filtros.fecha_desde) {
                query += ` AND t.fecha_inicio >= $${paramCount}`;
                params.push(filtros.fecha_desde);
                paramCount++;
            }

            if (filtros.fecha_hasta) {
                query += ` AND t.fecha_fin <= $${paramCount}`;
                params.push(filtros.fecha_hasta);
                paramCount++;
            }

            // Contar total de resultados
            const countQuery = `SELECT COUNT(*) as total FROM (${query}) as filtered_torneos`;
            const countResult = await client.query(countQuery, params);
            const total = parseInt(countResult.rows[0].total);

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
                case 'inscritos':
                    query += ' ORDER BY equipos_inscritos DESC';
                    break;
                case 'recientes':
                    query += ' ORDER BY t.creado_en DESC';
                    break;
                default:
                    query += ' ORDER BY t.fecha_inicio DESC';
            }

            // Paginación
            const limit = filtros.limit || 10;
            const page = filtros.page || 1;
            const offset = (page - 1) * limit;

            query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
            params.push(limit, offset);

            const result = await client.query(query, params);

            return {
                torneos: result.rows,
                total
            };

        } finally {
            client.release();
        }
    }

    /**
     * Obtener un torneo por su ID con información completa
     */
    async obtenerTorneoPorId(idTorneo) {
        const client = await pool.connect();
        try {
            const query = `
                SELECT 
                    t.id_torneo,
                    t.nombre,
                    t.descripcion,
                    t.fecha_inicio,
                    t.fecha_fin,
                    t.fecha_cierre_inscripcion,
                    t.max_equipos,
                    t.tipo_torneo,
                    t.estado,
                    t.creado_por,
                    t.creado_en,
                    t.id_arbitro,
                    
                    -- Información del deporte
                    d.id_deporte,
                    d.nombre_deporte,
                    d.url_imagen as deporte_imagen,
                    
                    -- Usuario creador
                    u.name_user as creador_nombre,
                    u.email_user as creador_email,
                    
                    -- Información del árbitro (id_arbitro ya es id_usuario)
                    ua.name_user as arbitro_nombre,
                    ua.email_user as arbitro_email,
                    
                    -- Estadísticas
                    (SELECT COUNT(*) FROM inscripciones_torneo it 
                     WHERE it.id_torneo = t.id_torneo 
                     AND it.aprobado = true) as equipos_inscritos,
                    
                    (SELECT COUNT(*) FROM partidos_torneo tp 
                     WHERE tp.id_torneo = t.id_torneo) as total_partidos,
                    
                    (SELECT COUNT(*) FROM partidos_torneo tp 
                     WHERE tp.id_torneo = t.id_torneo 
                     AND tp.estado_partido = 'finalizado') as partidos_finalizados,
                    
                    (SELECT COUNT(*) FROM partidos_torneo tp 
                     WHERE tp.id_torneo = t.id_torneo 
                     AND tp.estado_partido IN ('programado', 'por_jugar')) as partidos_pendientes,
                    
                    -- Fases del torneo
                    (SELECT json_agg(
                        json_build_object(
                            'id_fase', f.id_fase,
                            'nombre', f.nombre,
                            'orden', f.orden,
                            'tipo', f.tipo,
                            'fecha_inicio', f.fecha_inicio,
                            'fecha_fin', f.fecha_fin
                        ) ORDER BY f.orden
                    ) FROM fases_torneo f WHERE f.id_torneo = t.id_torneo) as fases
                    
                FROM torneos t
                INNER JOIN deportes d ON t.id_deporte = d.id_deporte
                LEFT JOIN usuarios u ON t.creado_por = u.id_user
                LEFT JOIN usuarios ua ON t.id_arbitro = ua.id_user
                WHERE t.id_torneo = $1
            `;

            const result = await client.query(query, [idTorneo]);
            return result.rows[0] || null;
        } finally {
            client.release();
        }
    }

    /**
     * Crear un nuevo torneo
     */
    async crearTorneo(datos) {
        const client = await pool.connect();
        try {
            // id_arbitro viene como id_usuario desde el frontend (usuarios con rol='Arbitro')
            // Se guarda directamente porque la FK apunta a usuarios, no a arbitros
            const query = `
                INSERT INTO torneos (
                    nombre,
                    descripcion,
                    id_deporte,
                    fecha_inicio,
                    fecha_fin,
                    fecha_cierre_inscripcion,
                    max_equipos,
                    tipo_torneo,
                    estado,
                    creado_por,
                    id_arbitro,
                    creado_en
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
                RETURNING *
            `;

            const values = [
                datos.nombre,
                datos.descripcion,
                datos.id_deporte,
                datos.fecha_inicio,
                datos.fecha_fin,
                datos.fecha_cierre_inscripcion,
                datos.max_equipos,
                datos.tipo_torneo,
                datos.estado,
                datos.creado_por,
                datos.id_arbitro || null
            ];

            const result = await client.query(query, values);
            return result.rows[0];

        } catch (error) {
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Actualizar un torneo existente
     */
    async actualizarTorneo(idTorneo, datos) {
        const client = await pool.connect();
        try {
            // id_arbitro viene como id_usuario desde el frontend (usuarios con rol='Arbitro')
            // No necesita conversión porque la FK apunta a usuarios
            
            const campos = [];
            const valores = [];
            let contador = 1;

            // Construir dinámicamente la consulta UPDATE
            Object.keys(datos).forEach(key => {
                if (datos[key] !== undefined) {
                    campos.push(`${key} = $${contador}`);
                    valores.push(datos[key]);
                    contador++;
                }
            });

            if (campos.length === 0) {
                throw new Error('No hay campos para actualizar');
            }

            valores.push(idTorneo);

            const query = `
                UPDATE torneos 
                SET ${campos.join(', ')}
                WHERE id_torneo = $${contador}
                RETURNING *
            `;

            const result = await client.query(query, valores);
            return result.rows[0];

        } catch (error) {
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Verificar si un torneo se puede eliminar
     */
    async verificarPuedeEliminar(idTorneo) {
        const client = await pool.connect();
        try {
            // Verificar si tiene inscripciones
            const inscripcionesQuery = `
                SELECT COUNT(*) as total 
                FROM inscripciones_torneo 
                WHERE id_torneo = $1 
                AND aprobado = true
            `;
            const inscripciones = await client.query(inscripcionesQuery, [idTorneo]);

            if (parseInt(inscripciones.rows[0].total) > 0) {
                return { 
                    puede: false, 
                    mensaje: 'No se puede eliminar el torneo porque tiene equipos inscritos' 
                };
            }

            // Verificar si tiene partidos finalizados
            const partidosQuery = `
                SELECT COUNT(*) as total 
                FROM partidos_torneo 
                WHERE id_torneo = $1 
                AND estado = 'finalizado'
            `;
            const partidos = await client.query(partidosQuery, [idTorneo]);

            if (parseInt(partidos.rows[0].total) > 0) {
                return { 
                    puede: false, 
                    mensaje: 'No se puede eliminar el torneo porque tiene partidos finalizados' 
                };
            }

            return { puede: true };

        } finally {
            client.release();
        }
    }

    /**
     * Eliminar un torneo
     */
    async eliminarTorneo(idTorneo) {
        const client = await pool.connect();
        try {
            const query = `
                DELETE FROM torneos 
                WHERE id_torneo = $1
                RETURNING id_torneo
            `;
            const result = await client.query(query, [idTorneo]);
            return result.rows[0];

        } finally {
            client.release();
        }
    }

    /**
     * Cambiar el estado de un torneo
     */
    async cambiarEstado(idTorneo, nuevoEstado) {
        const client = await pool.connect();
        try {
            const query = `
                UPDATE torneos 
                SET estado = $1
                WHERE id_torneo = $2
                RETURNING *
            `;
            const result = await client.query(query, [nuevoEstado, idTorneo]);
            return result.rows[0];

        } finally {
            client.release();
        }
    }

    /**
     * Obtener estadísticas completas de un torneo
     */
    async obtenerEstadisticasTorneo(idTorneo) {
        const client = await pool.connect();
        try {
            const query = `
                SELECT 
                    -- Información básica del torneo
                    t.id_torneo,
                    t.nombre,
                    t.estado,
                    t.fecha_inicio,
                    t.fecha_fin,
                    
                    -- Estadísticas de inscripciones
                    (SELECT COUNT(*) FROM inscripciones_torneo it 
                     WHERE it.id_torneo = t.id_torneo 
                     AND it.aprobado = true) as equipos_inscritos,
                    
                    t.max_equipos,
                    
                    -- Estadísticas de partidos
                    (SELECT COUNT(*) FROM partidos_torneo tp 
                     WHERE tp.id_torneo = t.id_torneo) as total_partidos,
                    
                    (SELECT COUNT(*) FROM partidos_torneo tp 
                     WHERE tp.id_torneo = t.id_torneo 
                     AND tp.estado_partido = 'programado') as partidos_programados,
                    
                    (SELECT COUNT(*) FROM partidos_torneo tp 
                     WHERE tp.id_torneo = t.id_torneo 
                     AND tp.estado_partido = 'en_curso') as partidos_en_curso,
                    
                    (SELECT COUNT(*) FROM partidos_torneo tp 
                     WHERE tp.id_torneo = t.id_torneo 
                     AND tp.estado_partido = 'finalizado') as partidos_finalizados,
                    
                    -- Estadísticas de goles
                    (SELECT COALESCE(SUM(tp.resultado_local + tp.resultado_visitante), 0)
                     FROM partidos_torneo tp 
                     WHERE tp.id_torneo = t.id_torneo 
                     AND tp.estado_partido = 'finalizado') as total_goles,
                    
                    -- Fases del torneo
                    (SELECT COUNT(*) FROM fases_torneo f 
                     WHERE f.id_torneo = t.id_torneo) as total_fases,
                    
                    -- Grupos del torneo
                    (SELECT COUNT(DISTINCT gt.id_grupo) 
                     FROM grupos_torneo gt 
                     INNER JOIN fases_torneo f ON gt.id_fase = f.id_fase
                     WHERE f.id_torneo = t.id_torneo) as total_grupos
                    
                FROM torneos t
                WHERE t.id_torneo = $1
            `;

            const result = await client.query(query, [idTorneo]);
            return result.rows[0] || null;

        } finally {
            client.release();
        }
    }
}

export default new TorneoAdminService();
