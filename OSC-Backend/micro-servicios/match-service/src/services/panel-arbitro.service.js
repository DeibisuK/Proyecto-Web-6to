import pool from '../config/db.js';

/**
 * Servicio para el panel del árbitro
 * Gestiona iniciar/finalizar partidos y registrar eventos
 */

class PanelArbitroService {
    /**
     * Obtener partidos asignados a un árbitro
     */
    async obtenerPartidosAsignados(idArbitro, filtros = {}) {
        const client = await pool.connect();
        try {
            let query = `
                SELECT 
                    pt.id_partido,
                    pt.id_torneo,
                    pt.fecha_partido,
                    pt.hora_inicio,
                    pt.estado_partido,
                    pt.resultado_local,
                    pt.resultado_visitante,
                    
                    t.nombre as torneo_nombre,
                    d.nombre_deporte,
                    
                    el.id_equipo as equipo_local_id,
                    el.nombre_equipo as equipo_local_nombre,
                    el.logo_url as equipo_local_logo,
                    
                    ev.id_equipo as equipo_visitante_id,
                    ev.nombre_equipo as equipo_visitante_nombre,
                    ev.logo_url as equipo_visitante_logo,
                    
                    c.nombre_cancha,
                    s.nombre as sede_nombre,
                    s.direccion as sede_direccion,
                    
                    pt.id_fase,
                    f.nombre as fase_nombre
                    
                FROM partidos_torneo pt
                INNER JOIN torneos t ON pt.id_torneo = t.id_torneo
                INNER JOIN deportes d ON t.id_deporte = d.id_deporte
                LEFT JOIN equipos el ON pt.id_equipo_local = el.id_equipo
                LEFT JOIN equipos ev ON pt.id_equipo_visitante = ev.id_equipo
                LEFT JOIN canchas c ON pt.id_cancha = c.id_cancha
                LEFT JOIN sedes s ON pt.id_sede = s.id_sede
                LEFT JOIN fases_torneo f ON pt.id_fase = f.id_fase
                WHERE pt.id_arbitro = $1
            `;

            const params = [idArbitro];
            let paramCount = 1;

            // Filtros opcionales
            if (filtros.estado) {
                paramCount++;
                query += ` AND pt.estado_partido = $${paramCount}`;
                params.push(filtros.estado);
            }

            if (filtros.fecha_desde) {
                paramCount++;
                query += ` AND pt.fecha_partido >= $${paramCount}`;
                params.push(filtros.fecha_desde);
            }

            if (filtros.fecha_hasta) {
                paramCount++;
                query += ` AND pt.fecha_partido <= $${paramCount}`;
                params.push(filtros.fecha_hasta);
            }

            query += ` ORDER BY pt.fecha_partido, pt.hora_inicio`;

            const result = await client.query(query, params);
            return result.rows;

        } finally {
            client.release();
        }
    }

    /**
     * Iniciar un partido
     */
    async iniciarPartido(idPartido, idArbitro) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Verificar que el árbitro esté asignado a este partido
            const verificarQuery = `
                SELECT pt.id_partido, pt.estado_partido, pt.id_arbitro
                FROM partidos_torneo pt
                WHERE pt.id_partido = $1 AND pt.id_arbitro = $2
            `;
            const verificarResult = await client.query(verificarQuery, [idPartido, idArbitro]);

            if (verificarResult.rows.length === 0) {
                throw new Error('No tienes permiso para iniciar este partido');
            }

            const partido = verificarResult.rows[0];

            if (partido.estado_partido !== 'programado' && partido.estado_partido !== 'por_programar') {
                throw new Error(`El partido no se puede iniciar. Estado actual: ${partido.estado_partido}`);
            }

            // Actualizar estado solamente (hora_inicio ya está definida en el partido)
            const updateQuery = `
                UPDATE partidos_torneo 
                SET 
                    estado_partido = 'en_curso'
                WHERE id_partido = $1
                RETURNING *
            `;
            const updateResult = await client.query(updateQuery, [idPartido]);

            // Si el partido tiene una cancha asignada, actualizar su estado a 'reservado'
            if (partido.id_cancha) {
                await client.query(
                    `UPDATE canchas SET estado_cancha = 'reservado' WHERE id_cancha = $1`,
                    [partido.id_cancha]
                );
            }

            // Registrar en historial de cambios
            const historialQuery = `
                INSERT INTO historial_cambios_partido (
                    id_partido,
                    id_usuario,
                    tipo_cambio,
                    estado_anterior,
                    estado_nuevo,
                    descripcion
                )
                VALUES ($1, $2, $3, $4, $5, $6)
            `;
            await client.query(historialQuery, [
                idPartido,
                idArbitro,
                'inicio',
                partido.estado_partido,
                'en_curso',
                'Partido iniciado por el árbitro'
            ]);

            await client.query('COMMIT');

            return updateResult.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Pausar un partido
     */
    async pausarPartido(idPartido, idArbitro) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Verificar permiso
            const verificarQuery = `
                SELECT pt.id_partido, pt.estado_partido 
                FROM partidos_torneo pt
                WHERE pt.id_partido = $1 AND pt.id_arbitro = $2
            `;
            const verificarResult = await client.query(verificarQuery, [idPartido, idArbitro]);

            if (verificarResult.rows.length === 0) {
                throw new Error('No tienes permiso para pausar este partido');
            }

            const partido = verificarResult.rows[0];

            if (partido.estado_partido !== 'en_curso') {
                throw new Error('Solo se pueden pausar partidos en curso');
            }

            // Actualizar estado a pausado
            const updateQuery = `
                UPDATE partidos_torneo 
                SET estado_partido = 'pausado'
                WHERE id_partido = $1
                RETURNING *
            `;
            const updateResult = await client.query(updateQuery, [idPartido]);

            // Registrar en historial
            const historialQuery = `
                INSERT INTO historial_cambios_partido (
                    id_partido,
                    id_usuario,
                    tipo_cambio,
                    estado_anterior,
                    estado_nuevo,
                    descripcion
                )
                VALUES ($1, $2, $3, $4, $5, $6)
            `;
            await client.query(historialQuery, [
                idPartido,
                idArbitro,
                'pausa',
                'en_curso',
                'pausado',
                'Partido pausado por el árbitro'
            ]);

            await client.query('COMMIT');

            return updateResult.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Reanudar un partido pausado
     */
    async reanudarPartido(idPartido, idArbitro) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Verificar permiso
            const verificarQuery = `
                SELECT pt.id_partido, pt.estado_partido 
                FROM partidos_torneo pt
                WHERE pt.id_partido = $1 AND pt.id_arbitro = $2
            `;
            const verificarResult = await client.query(verificarQuery, [idPartido, idArbitro]);

            if (verificarResult.rows.length === 0) {
                throw new Error('No tienes permiso para reanudar este partido');
            }

            const partido = verificarResult.rows[0];

            if (partido.estado_partido !== 'pausado') {
                throw new Error('Solo se pueden reanudar partidos pausados');
            }

            // Actualizar estado a en_curso
            const updateQuery = `
                UPDATE partidos_torneo 
                SET estado_partido = 'en_curso'
                WHERE id_partido = $1
                RETURNING *
            `;
            const updateResult = await client.query(updateQuery, [idPartido]);

            // Registrar en historial
            const historialQuery = `
                INSERT INTO historial_cambios_partido (
                    id_partido,
                    id_usuario,
                    tipo_cambio,
                    estado_anterior,
                    estado_nuevo,
                    descripcion
                )
                VALUES ($1, $2, $3, $4, $5, $6)
            `;
            await client.query(historialQuery, [
                idPartido,
                idArbitro,
                'reanudacion',
                'pausado',
                'en_curso',
                'Partido reanudado por el árbitro'
            ]);

            await client.query('COMMIT');

            return updateResult.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Registrar un evento en el partido (gol, tarjeta, etc.)
     */
    async registrarEvento(idPartido, idArbitro, eventoData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Verificar permiso y que el partido esté en curso
            const verificarQuery = `
                SELECT pt.id_partido, pt.estado_partido, t.id_deporte
                FROM partidos_torneo pt
                INNER JOIN torneos t ON pt.id_torneo = t.id_torneo
                WHERE pt.id_partido = $1 AND pt.id_arbitro = $2
            `;
            const verificarResult = await client.query(verificarQuery, [idPartido, idArbitro]);

            if (verificarResult.rows.length === 0) {
                throw new Error('No tienes permiso para registrar eventos en este partido');
            }

            const partido = verificarResult.rows[0];

            if (partido.estado_partido !== 'en_curso' && partido.estado_partido !== 'pausado') {
                throw new Error('Solo se pueden registrar eventos en partidos en curso');
            }

            // Insertar evento
            const insertQuery = `
                INSERT INTO eventos_partido (
                    id_partido,
                    id_equipo,
                    id_jugador,
                    tipo_evento,
                    minuto,
                    periodo,
                    descripcion,
                    valor_puntos
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `;

            const insertResult = await client.query(insertQuery, [
                idPartido,
                eventoData.id_equipo,
                eventoData.id_jugador || null,
                eventoData.tipo_evento,
                eventoData.minuto || null,
                eventoData.periodo || null,
                eventoData.descripcion || null,
                eventoData.valor_puntos || 0
            ]);

            const evento = insertResult.rows[0];

            // Si el evento es un gol/punto, actualizar marcador
            if (['gol', 'penal', 'triple', 'doble', 'tiro_libre'].includes(eventoData.tipo_evento)) {
                await this._actualizarMarcador(client, idPartido, eventoData.id_equipo, eventoData.valor_puntos || 1);
            }

            await client.query('COMMIT');

            return evento;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Actualizar marcador del partido
     */
    async _actualizarMarcador(client, idPartido, idEquipo, puntos) {
        // Convertir a números para evitar problemas de comparación
        idEquipo = parseInt(idEquipo);
        puntos = parseInt(puntos);
        
        // Determinar si es equipo local o visitante
        const partidoQuery = `
            SELECT id_equipo_local, id_equipo_visitante, resultado_local, resultado_visitante
            FROM partidos_torneo
            WHERE id_partido = $1
        `;
        const partidoResult = await client.query(partidoQuery, [idPartido]);
        const partido = partidoResult.rows[0];

        console.log('[MARCADOR] ID Equipo que anotó:', idEquipo, '(tipo:', typeof idEquipo, ')');
        console.log('[MARCADOR] ID Equipo local:', partido.id_equipo_local, '(tipo:', typeof partido.id_equipo_local, ')');
        console.log('[MARCADOR] ID Equipo visitante:', partido.id_equipo_visitante, '(tipo:', typeof partido.id_equipo_visitante, ')');
        console.log('[MARCADOR] Son iguales local?:', idEquipo === partido.id_equipo_local);
        console.log('[MARCADOR] Son iguales visitante?:', idEquipo === partido.id_equipo_visitante);

        let updateQuery;
        if (idEquipo === partido.id_equipo_local) {
            console.log('[MARCADOR] Actualizando gol para equipo LOCAL');
            updateQuery = `
                UPDATE partidos_torneo
                SET resultado_local = resultado_local + $1
                WHERE id_partido = $2
            `;
        } else {
            console.log('[MARCADOR] Actualizando gol para equipo VISITANTE');
            updateQuery = `
                UPDATE partidos_torneo
                SET resultado_visitante = resultado_visitante + $1
                WHERE id_partido = $2
            `;
        }

        await client.query(updateQuery, [puntos, idPartido]);
    }

    /**
     * Finalizar un partido
     */
    async finalizarPartido(idPartido, idArbitro, datosFinalizacion) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Verificar permiso
            const verificarQuery = `
                SELECT pt.id_partido, pt.estado_partido, pt.fecha_partido, pt.hora_inicio, pt.id_cancha
                FROM partidos_torneo pt
                WHERE pt.id_partido = $1 AND pt.id_arbitro = $2
            `;
            const verificarResult = await client.query(verificarQuery, [idPartido, idArbitro]);

            if (verificarResult.rows.length === 0) {
                throw new Error('No tienes permiso para finalizar este partido');
            }

            const partido = verificarResult.rows[0];

            if (partido.estado_partido !== 'en_curso' && partido.estado_partido !== 'pausado') {
                throw new Error('Solo se pueden finalizar partidos en curso o pausados');
            }

            // Actualizar partido
            // NOTA: Cambiar estado a 'cancelado' temporalmente para evitar constraint, 
            // luego actualizar a 'finalizado' (constraint solo aplica a estados activos)
            const updateQuery = `
                UPDATE partidos_torneo 
                SET 
                    estado_partido = 'finalizado',
                    hora_fin = CASE 
                        WHEN hora_fin IS NULL THEN hora_inicio + INTERVAL '2 hours'
                        ELSE hora_fin
                    END,
                    nota = $1
                WHERE id_partido = $2
                RETURNING *
            `;
            const updateResult = await client.query(updateQuery, [
                datosFinalizacion.notas_arbitro || null,
                idPartido
            ]);

            // Registrar en historial
            const historialQuery = `
                INSERT INTO historial_cambios_partido (
                    id_partido,
                    id_usuario,
                    tipo_cambio,
                    estado_anterior,
                    estado_nuevo,
                    descripcion
                )
                VALUES ($1, $2, $3, $4, $5, $6)
            `;
            await client.query(historialQuery, [
                idPartido,
                idArbitro,
                'finalizacion',
                partido.estado_partido,
                'finalizado',
                `Partido finalizado`
            ]);

            // Si el partido tiene una cancha asignada, liberar la cancha (volver a 'Disponible')
            if (partido.id_cancha) {
                await client.query(
                    `UPDATE canchas SET estado = 'Disponible' WHERE id_cancha = $1`,
                    [partido.id_cancha]
                );
            }

            // TODO: Aquí se podrían actualizar estadísticas de jugadores
            // y tabla de posiciones si es un torneo de liga

            await client.query('COMMIT');

            return updateResult.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Obtener eventos de un partido
     */
    async obtenerEventosPartido(idPartido) {
        const client = await pool.connect();
        try {
            const query = `
                SELECT 
                    ep.id_evento,
                    ep.tipo_evento,
                    ep.minuto,
                    ep.periodo,
                    ep.descripcion,
                    ep.valor_puntos,
                    ep.creado_en,
                    
                    e.nombre_equipo,
                    e.logo_url as equipo_logo,
                    
                    j.nombre_completo as jugador_nombre,
                    j.numero_dorsal
                    
                FROM eventos_partido ep
                LEFT JOIN equipos e ON ep.id_equipo = e.id_equipo
                LEFT JOIN jugadores j ON ep.id_jugador = j.id_jugador
                WHERE ep.id_partido = $1
                ORDER BY ep.minuto, ep.creado_en
            `;

            const result = await client.query(query, [idPartido]);
            return result.rows;

        } finally {
            client.release();
        }
    }
}

export default new PanelArbitroService();
