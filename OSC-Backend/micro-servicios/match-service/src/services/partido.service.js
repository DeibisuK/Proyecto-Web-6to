import * as partidoModel from '../models/partido.model.js';
import * as equiposPartidoModel from '../models/equipos_partido.model.js';
import * as gestionTiempoModel from '../models/gestion_tiempo_partido.model.js';
import * as historialModel from '../models/historial_partidos.model.js';

export const getAll = async () => {
    return await partidoModel.findAll();
};

export const getById = async (id) => {
    const partido = await partidoModel.findById(id);
    if (partido) {
        partido.equipos = await equiposPartidoModel.findByPartidoId(id);
        partido.gestion_tiempo = await gestionTiempoModel.findByPartidoId(id);
    }
    return partido;
};

export const create = async (partidoData) => {
    const { equipos, ...partido } = partidoData;
    const nuevoPartido = await partidoModel.create(partido);
    
    await gestionTiempoModel.create(nuevoPartido.id_partido);

    for (const equipo of equipos) {
        await equiposPartidoModel.create({
            id_partido: nuevoPartido.id_partido,
            ...equipo
        });
    }

    return nuevoPartido;
};

export const updateStatus = async (id, estado_partido) => {
    return await partidoModel.update(id, { estado_partido });
};

export const finishMatch = async (id, resultado) => {
    const { equipos, ...partidoInfo } = resultado;
    
    // Actualizar goles
    for(const equipo of equipos) {
        await equiposPartidoModel.updateGoles(equipo.id_equipo_partido, equipo.goles);
    }

    // Actualizar estado del partido
    await partidoModel.update(id, { estado_partido: 'Finalizado' });

    // Actualizar historial
    const equipoLocal = equipos.find(e => e.es_local);
    const equipoVisitante = equipos.find(e => !e.es_local);

    const historialLocal = await historialModel.findByEquipoId(equipoLocal.id_equipo);
    const historialVisitante = await historialModel.findByEquipoId(equipoVisitante.id_equipo);

    historialLocal.partidos_jugados++;
    historialVisitante.partidos_jugados++;

    if (equipoLocal.goles > equipoVisitante.goles) { // Gana Local
        historialLocal.partidos_ganados++;
        historialLocal.puntos_ranking += 3;
        historialVisitante.partidos_perdidos++;
    } else if (equipoVisitante.goles > equipoLocal.goles) { // Gana Visitante
        historialVisitante.partidos_ganados++;
        historialVisitante.puntos_ranking += 3;
        historialLocal.partidos_perdidos++;
    } else { // Empate
        historialLocal.puntos_ranking += 1;
        historialVisitante.puntos_ranking += 1;
    }

    await historialModel.update(equipoLocal.id_equipo, historialLocal);
    await historialModel.update(equipoVisitante.id_equipo, historialVisitante);

    return await getById(id);
};

export const remove = async (id) => {
    return await partidoModel.remove(id);
};

/**
 * Obtiene el detalle completo de un partido con eventos, alineaciones y estadísticas
 */
export const getDetalleCompleto = async (id) => {
    const pool = (await import('../config/db.js')).default;
    const client = await pool.connect();
    
    try {
        // Información básica del partido
        const partidoQuery = `
            SELECT 
                tp.id_partido,
                tp.id_torneo,
                tp.fecha_hora_inicio,
                tp.fecha_hora_fin,
                tp.estado_partido,
                tp.goles_local,
                tp.goles_visitante,
                tp.id_fase,
                tp.id_grupo,
                tp.nota,
                
                -- Torneo
                t.nombre as torneo_nombre,
                d.nombre_deporte,
                
                -- Equipo local
                el.id_equipo as equipo_local_id,
                el.nombre_equipo as equipo_local_nombre,
                el.logo_url as equipo_local_logo,
                
                -- Equipo visitante
                ev.id_equipo as equipo_visitante_id,
                ev.nombre_equipo as equipo_visitante_nombre,
                ev.logo_url as equipo_visitante_logo,
                
                -- Cancha y Sede
                c.nombre_cancha,
                s.nombre as nombre_sede,
                s.direccion as sede_direccion,
                
                -- Árbitro (necesita join con usuarios)
                ar.id_arbitro,
                u.name_user as arbitro_nombre
                
            FROM torneos_partidos tp
            INNER JOIN torneos t ON tp.id_torneo = t.id_torneo
            INNER JOIN deportes d ON t.id_deporte = d.id_deporte
            LEFT JOIN equipos el ON tp.equipo_local = el.id_equipo
            LEFT JOIN equipos ev ON tp.equipo_visitante = ev.id_equipo
            LEFT JOIN canchas c ON tp.id_cancha = c.id_cancha
            LEFT JOIN sedes s ON c.id_sede = s.id_sede
            LEFT JOIN arbitros ar ON tp.id_arbitro_principal = ar.id_arbitro
            LEFT JOIN usuarios u ON ar.id_usuario = u.id_user
            WHERE tp.id_partido = $1
        `;
        const partidoResult = await client.query(partidoQuery, [id]);
        
        if (partidoResult.rows.length === 0) {
            return { partido: null };
        }
        
        const partido = partidoResult.rows[0];
        
        // Eventos del partido (goles, tarjetas, etc.)
        const eventosQuery = `
            SELECT 
                ea.id_evento,
                ea.tipo_evento,
                ea.minuto,
                ea.descripcion,
                ea.id_equipo,
                e.nombre_equipo,
                j.id_jugador,
                j.nombre_completo as jugador_nombre,
                j.numero as numero_camiseta
            FROM eventos_arbitro ea
            LEFT JOIN equipos e ON ea.id_equipo = e.id_equipo
            LEFT JOIN jugadores j ON ea.id_jugador = j.id_jugador
            WHERE ea.id_partido = $1
            ORDER BY ea.minuto ASC
        `;
        const eventos = await client.query(eventosQuery, [id]);
        
        // Alineaciones de ambos equipos
        const alineacionesQuery = `
            SELECT 
                a.id_alineacion,
                a.id_equipo,
                e.nombre_equipo,
                j.id_jugador,
                j.nombre_completo as jugador_nombre,
                j.numero as numero_camiseta,
                j.posicion_pref as posicion,
                a.es_titular,
                a.minutos_jugados
            FROM alineaciones a
            INNER JOIN equipos e ON a.id_equipo = e.id_equipo
            INNER JOIN jugadores j ON a.id_jugador = j.id_jugador
            WHERE a.id_partido = $1
            ORDER BY a.id_equipo, a.es_titular DESC, j.numero ASC
        `;
        const alineaciones = await client.query(alineacionesQuery, [id]);
        
        // Separar alineaciones por equipo
        const alineacionLocal = alineaciones.rows.filter(
            a => a.id_equipo === partido.equipo_local_id
        );
        const alineacionVisitante = alineaciones.rows.filter(
            a => a.id_equipo === partido.equipo_visitante_id
        );
        
        // Estadísticas calculadas
        const estadisticas = {
            local: {
                goles: partido.goles_local || 0,
                tarjetas_amarillas: eventos.rows.filter(
                    e => e.id_equipo === partido.equipo_local_id && e.tipo_evento === 'tarjeta_amarilla'
                ).length,
                tarjetas_rojas: eventos.rows.filter(
                    e => e.id_equipo === partido.equipo_local_id && e.tipo_evento === 'tarjeta_roja'
                ).length,
                goleadores: eventos.rows
                    .filter(e => e.id_equipo === partido.equipo_local_id && e.tipo_evento === 'gol')
                    .map(e => ({
                        jugador: e.jugador_nombre,
                        numero: e.numero_camiseta,
                        minuto: e.minuto
                    }))
            },
            visitante: {
                goles: partido.goles_visitante || 0,
                tarjetas_amarillas: eventos.rows.filter(
                    e => e.id_equipo === partido.equipo_visitante_id && e.tipo_evento === 'tarjeta_amarilla'
                ).length,
                tarjetas_rojas: eventos.rows.filter(
                    e => e.id_equipo === partido.equipo_visitante_id && e.tipo_evento === 'tarjeta_roja'
                ).length,
                goleadores: eventos.rows
                    .filter(e => e.id_equipo === partido.equipo_visitante_id && e.tipo_evento === 'gol')
                    .map(e => ({
                        jugador: e.jugador_nombre,
                        numero: e.numero_camiseta,
                        minuto: e.minuto
                    }))
            }
        };
        
        return {
            partido,
            eventos: eventos.rows,
            alineaciones: {
                local: alineacionLocal,
                visitante: alineacionVisitante
            },
            estadisticas
        };
        
    } finally {
        client.release();
    }
};
