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
                    t.id_sede,
                    t.dias_juego,
                    t.horario_inicio,
                    t.horarios_disponibles,
                    t.partidos_por_dia,
                    t.fecha_fin_calculada,
                    
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
     * ACTUALIZADO: incluye campos de programación (sede, días, horarios)
     */
    async crearTorneo(datos) {
        const client = await pool.connect();
        try {
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
                    id_sede,
                    dias_juego,
                    horario_inicio,
                    horarios_disponibles,
                    partidos_por_dia,
                    fecha_fin_calculada,
                    creado_en
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
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
                datos.id_sede || null,
                datos.dias_juego || null, // Array: ['lunes', 'martes']
                datos.horario_inicio || null, // '18:00'
                datos.horarios_disponibles || null, // Array: ['18:00', '20:00', '22:00']
                datos.partidos_por_dia || null,
                datos.fecha_fin_calculada || null
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

    /**
     * Generar fixture automático para un torneo
     * Crea los partidos basándose en los equipos inscritos y el tipo de torneo
     */
    async generarFixture(idTorneo) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            console.log('[FIXTURE] Generando fixture para torneo:', idTorneo);

            // Obtener información del torneo
            const torneoQuery = `
                SELECT 
                    t.*,
                    d.nombre_deporte
                FROM torneos t
                INNER JOIN deportes d ON t.id_deporte = d.id_deporte
                WHERE t.id_torneo = $1
            `;
            const torneoResult = await client.query(torneoQuery, [idTorneo]);
            
            if (torneoResult.rows.length === 0) {
                throw new Error('Torneo no encontrado');
            }

            const torneo = torneoResult.rows[0];
            console.log('[FIXTURE] Torneo encontrado:', torneo.nombre);
            console.log('[FIXTURE] Horarios:', torneo.horarios_disponibles);
            console.log('[FIXTURE] Días de juego:', torneo.dias_juego);
            console.log('[FIXTURE] Partidos por día:', torneo.partidos_por_dia);

            // Verificar que tenga configuración de horarios
            if (!torneo.horarios_disponibles || torneo.horarios_disponibles.length === 0) {
                throw new Error('El torneo no tiene horarios configurados. Ve a "Editar Torneo" y configura los horarios.');
            }

            if (!torneo.dias_juego || torneo.dias_juego.length === 0) {
                throw new Error('El torneo no tiene días de juego configurados. Ve a "Editar Torneo" y configura los días.');
            }

            // Obtener equipos inscritos y aprobados
            const equiposQuery = `
                SELECT e.id_equipo, e.nombre_equipo
                FROM inscripciones_torneo it
                INNER JOIN equipos e ON it.id_equipo = e.id_equipo
                WHERE it.id_torneo = $1 AND it.aprobado = true
                ORDER BY e.nombre_equipo
            `;
            const equiposResult = await client.query(equiposQuery, [idTorneo]);
            const equipos = equiposResult.rows;

            console.log('[FIXTURE] Equipos inscritos:', equipos.length);
            console.log('[FIXTURE] Equipos:', equipos.map(e => e.nombre_equipo).join(', '));

            if (equipos.length < 2) {
                throw new Error('Se necesitan al menos 2 equipos inscritos y aprobados para generar el fixture');
            }

            // Generar partidos según el tipo de torneo
            let partidos = [];
            
            console.log('[FIXTURE] Tipo de torneo:', torneo.tipo_torneo);
            
            if (torneo.tipo_torneo === 'eliminatoria-directa') {
                partidos = this._generarEliminatoriaDirecta(equipos);
            } else if (torneo.tipo_torneo === 'todos-contra-todos' || torneo.tipo_torneo === 'liga') {
                partidos = this._generarTodosContraTodos(equipos);
            } else if (torneo.tipo_torneo === 'grupo-eliminatoria') {
                partidos = this._generarGruposYEliminatoria(equipos);
            } else {
                throw new Error(`Tipo de torneo no soportado: ${torneo.tipo_torneo}`);
            }

            console.log('[FIXTURE] Partidos generados (sin fechas):', partidos.length);

            // Asignar fechas y horarios a los partidos
            const partidosConFechas = this._asignarFechasYHorarios(
                partidos, 
                torneo.fecha_inicio, 
                torneo.dias_juego, 
                torneo.horarios_disponibles,
                torneo.partidos_por_dia || 3 // Default: 3 partidos por día
            );

            console.log('[FIXTURE] Partidos con fechas asignadas:', partidosConFechas.length);
            if (partidosConFechas.length > 0) {
                console.log('[FIXTURE] Primer partido:', partidosConFechas[0]);
            }

            // Insertar partidos en la base de datos
            const insertQuery = `
                INSERT INTO partidos_torneo (
                    id_torneo, 
                    id_equipo_local, 
                    id_equipo_visitante, 
                    fecha_partido, 
                    hora_inicio,
                    estado_partido,
                    id_sede
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;

            let partidosCreados = 0;
            for (const partido of partidosConFechas) {
                await client.query(insertQuery, [
                    idTorneo,
                    partido.id_equipo_local,
                    partido.id_equipo_visitante,
                    partido.fecha_partido,
                    partido.hora_inicio,
                    'programado',
                    torneo.id_sede
                ]);
                partidosCreados++;
            }

            console.log('[FIXTURE] Partidos insertados en BD:', partidosCreados);

            // Actualizar estado del torneo
            await client.query(
                'UPDATE torneos SET estado = $1 WHERE id_torneo = $2',
                ['en_curso', idTorneo]
            );

            await client.query('COMMIT');

            return {
                success: true,
                partidosCreados,
                mensaje: `Se generaron ${partidosCreados} partidos para el torneo`
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Generar emparejamientos para eliminatoria directa
     */
    _generarEliminatoriaDirecta(equipos) {
        const partidos = [];
        const numEquipos = equipos.length;
        
        // Primera ronda: emparejar equipos de 2 en 2
        for (let i = 0; i < numEquipos; i += 2) {
            if (i + 1 < numEquipos) {
                partidos.push({
                    id_equipo_local: equipos[i].id_equipo,
                    id_equipo_visitante: equipos[i + 1].id_equipo,
                    fase: 'primera_ronda'
                });
            }
        }
        
        return partidos;
    }

    /**
     * Generar emparejamientos para todos contra todos (liga)
     */
    _generarTodosContraTodos(equipos) {
        const partidos = [];
        const numEquipos = equipos.length;
        
        // Algoritmo round-robin: cada equipo juega contra todos los demás
        for (let i = 0; i < numEquipos; i++) {
            for (let j = i + 1; j < numEquipos; j++) {
                partidos.push({
                    id_equipo_local: equipos[i].id_equipo,
                    id_equipo_visitante: equipos[j].id_equipo,
                    fase: 'liga'
                });
            }
        }
        
        return partidos;
    }

    /**
     * Generar emparejamientos para grupos + eliminatoria
     */
    _generarGruposYEliminatoria(equipos) {
        const partidos = [];
        const numEquipos = equipos.length;
        
        // Si hay muy pocos equipos (2-3), usar todos contra todos
        if (numEquipos <= 3) {
            console.log('[FIXTURE] Pocos equipos para grupos, usando todos contra todos');
            return this._generarTodosContraTodos(equipos);
        }
        
        const equiposPorGrupo = Math.ceil(numEquipos / 2);
        
        // Dividir en 2 grupos
        const grupoA = equipos.slice(0, equiposPorGrupo);
        const grupoB = equipos.slice(equiposPorGrupo);
        
        // Fase de grupos: todos contra todos en cada grupo
        // Grupo A
        for (let i = 0; i < grupoA.length; i++) {
            for (let j = i + 1; j < grupoA.length; j++) {
                partidos.push({
                    id_equipo_local: grupoA[i].id_equipo,
                    id_equipo_visitante: grupoA[j].id_equipo,
                    fase: 'grupo_a'
                });
            }
        }
        
        // Grupo B
        for (let i = 0; i < grupoB.length; i++) {
            for (let j = i + 1; j < grupoB.length; j++) {
                partidos.push({
                    id_equipo_local: grupoB[i].id_equipo,
                    id_equipo_visitante: grupoB[j].id_equipo,
                    fase: 'grupo_b'
                });
            }
        }
        
        // Nota: Las semifinales y final se crearían después de terminar la fase de grupos
        // Por ahora solo generamos los partidos de grupos
        
        return partidos;
    }

    /**
     * Asignar fechas y horarios a los partidos generados
     */
    _asignarFechasYHorarios(partidos, fechaInicio, diasJuego, horariosDisponibles, partidosPorDia) {
        const partidosConFechas = [];
        const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        
        // Mapear días de juego a números (0 = domingo, 1 = lunes, etc.)
        const diasJuegoNumeros = diasJuego.map(dia => diasSemana.indexOf(dia.toLowerCase()));
        
        let fechaActual = new Date(fechaInicio);
        let indiceHorario = 0;
        let partidosAsignadosHoy = 0;

        for (const partido of partidos) {
            // Si ya asignamos todos los partidos del día, pasar al siguiente día de juego
            if (partidosAsignadosHoy >= partidosPorDia) {
                fechaActual = this._obtenerSiguienteDiaDeJuego(fechaActual, diasJuegoNumeros);
                partidosAsignadosHoy = 0;
                indiceHorario = 0;
            }

            // Asignar fecha y hora
            partidosConFechas.push({
                ...partido,
                fecha_partido: fechaActual.toISOString().split('T')[0],
                hora_inicio: horariosDisponibles[indiceHorario]
            });

            indiceHorario++;
            partidosAsignadosHoy++;

            // Si se acabaron los horarios del día, resetear y avanzar al siguiente día
            if (indiceHorario >= horariosDisponibles.length) {
                fechaActual = this._obtenerSiguienteDiaDeJuego(fechaActual, diasJuegoNumeros);
                indiceHorario = 0;
                partidosAsignadosHoy = 0;
            }
        }

        return partidosConFechas;
    }

    /**
     * Obtener el siguiente día de juego válido
     */
    _obtenerSiguienteDiaDeJuego(fechaActual, diasJuegoNumeros) {
        let siguienteFecha = new Date(fechaActual);
        siguienteFecha.setDate(siguienteFecha.getDate() + 1);
        
        // Buscar el siguiente día que esté en los días de juego
        while (!diasJuegoNumeros.includes(siguienteFecha.getDay())) {
            siguienteFecha.setDate(siguienteFecha.getDate() + 1);
        }
        
        return siguienteFecha;
    }

    /**
     * Obtener todos los partidos de un torneo
     */
    async obtenerPartidosTorneo(idTorneo, filtros = {}) {
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
                    
                    el.id_equipo as equipo_local_id,
                    el.nombre_equipo as equipo_local_nombre,
                    el.logo_url as equipo_local_logo,
                    
                    ev.id_equipo as equipo_visitante_id,
                    ev.nombre_equipo as equipo_visitante_nombre,
                    ev.logo_url as equipo_visitante_logo,
                    
                    c.nombre_cancha,
                    s.nombre as sede_nombre,
                    
                    u.name_user as arbitro_nombre,
                    pt.id_arbitro
                    
                FROM partidos_torneo pt
                LEFT JOIN equipos el ON pt.id_equipo_local = el.id_equipo
                LEFT JOIN equipos ev ON pt.id_equipo_visitante = ev.id_equipo
                LEFT JOIN canchas c ON pt.id_cancha = c.id_cancha
                LEFT JOIN sedes s ON pt.id_sede = s.id_sede
                LEFT JOIN usuarios u ON pt.id_arbitro = u.id_user
                WHERE pt.id_torneo = $1
            `;

            const params = [idTorneo];
            let paramCount = 1;

            // Filtros opcionales
            if (filtros.estado) {
                paramCount++;
                query += ` AND pt.estado_partido = $${paramCount}`;
                params.push(filtros.estado);
            }

            if (filtros.fecha) {
                paramCount++;
                query += ` AND pt.fecha_partido = $${paramCount}`;
                params.push(filtros.fecha);
            }

            query += ` ORDER BY pt.fecha_partido, pt.hora_inicio`;

            const result = await client.query(query, params);
            return result.rows;

        } finally {
            client.release();
        }
    }
}

export default new TorneoAdminService();
