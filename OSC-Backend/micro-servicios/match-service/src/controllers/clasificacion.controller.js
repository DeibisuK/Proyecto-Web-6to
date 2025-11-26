import * as ClasificacionModel from '../models/clasificacion_torneo.model.js';

// ===== OBTENER CLASIFICACIÓN DE UN TORNEO =====
export const getClasificacionByTorneo = async (req, res) => {
  try {
    const { idTorneo } = req.params;
    const { idFase, idGrupo } = req.query;

    const clasificacion = await ClasificacionModel.findByTorneo(
      idTorneo,
      idFase || null,
      idGrupo || null
    );
    
    res.status(200).json({
      success: true,
      data: clasificacion
    });
  } catch (error) {
    console.error('Error al obtener clasificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clasificación',
      error: error.message
    });
  }
};

// ===== OBTENER CLASIFICACIÓN POR GRUPO =====
export const getClasificacionByGrupo = async (req, res) => {
  try {
    const { idGrupo } = req.params;
    const clasificacion = await ClasificacionModel.findByGrupo(idGrupo);
    
    res.status(200).json({
      success: true,
      data: clasificacion
    });
  } catch (error) {
    console.error('Error al obtener clasificación del grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clasificación del grupo',
      error: error.message
    });
  }
};

// ===== OBTENER POSICIÓN DE UN EQUIPO =====
export const getPosicionEquipo = async (req, res) => {
  try {
    const { idTorneo, idEquipo } = req.params;
    const posicion = await ClasificacionModel.findByEquipo(idTorneo, idEquipo);
    
    if (!posicion) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado en la clasificación'
      });
    }

    res.status(200).json({
      success: true,
      data: posicion
    });
  } catch (error) {
    console.error('Error al obtener posición del equipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener posición del equipo',
      error: error.message
    });
  }
};

// ===== RECALCULAR CLASIFICACIÓN =====
export const recalcularClasificacion = async (req, res) => {
  try {
    const { idTorneo } = req.params;
    const resultado = await ClasificacionModel.recalcularClasificacion(idTorneo);
    
    res.status(200).json({
      success: true,
      message: 'Clasificación recalculada exitosamente',
      data: resultado
    });
  } catch (error) {
    console.error('Error al recalcular clasificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al recalcular clasificación',
      error: error.message
    });
  }
};

// ===== CREAR/ACTUALIZAR CLASIFICACIÓN MANUAL =====
export const upsertClasificacion = async (req, res) => {
  try {
    const clasificacion = await ClasificacionModel.upsert(req.body);
    
    res.status(200).json({
      success: true,
      message: 'Clasificación actualizada',
      data: clasificacion
    });
  } catch (error) {
    console.error('Error al actualizar clasificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar clasificación',
      error: error.message
    });
  }
};
