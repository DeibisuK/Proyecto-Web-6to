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
