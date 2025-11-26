import * as EstadoTiempoRealModel from '../models/estado_partido_tiempo_real.model.js';

// ===== OBTENER ESTADO EN TIEMPO REAL =====
export const getEstadoTiempoReal = async (req, res) => {
  try {
    const { idPartido } = req.params;
    const estado = await EstadoTiempoRealModel.findByPartido(idPartido);
    
    if (!estado) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró estado en tiempo real para este partido'
      });
    }

    res.status(200).json({
      success: true,
      data: estado
    });
  } catch (error) {
    console.error('Error al obtener estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado en tiempo real',
      error: error.message
    });
  }
};

// ===== INICIALIZAR/CREAR ESTADO =====
export const inicializarEstado = async (req, res) => {
  try {
    const { idPartido } = req.params;
    const estadoData = {
      ...req.body,
      id_partido: idPartido
    };

    const estado = await EstadoTiempoRealModel.create(estadoData);
    
    res.status(201).json({
      success: true,
      message: 'Estado en tiempo real inicializado',
      data: estado
    });
  } catch (error) {
    console.error('Error al inicializar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al inicializar estado',
      error: error.message
    });
  }
};

// ===== ACTUALIZAR TIEMPO =====
export const actualizarTiempo = async (req, res) => {
  try {
    const { idPartido } = req.params;
    const estado = await EstadoTiempoRealModel.actualizarTiempo(idPartido, req.body);
    
    if (!estado) {
      return res.status(404).json({
        success: false,
        message: 'Estado no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tiempo actualizado',
      data: estado
    });
  } catch (error) {
    console.error('Error al actualizar tiempo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar tiempo',
      error: error.message
    });
  }
};

// ===== INICIAR CRONÓMETRO =====
export const iniciarCronometro = async (req, res) => {
  try {
    const { idPartido } = req.params;
    const { periodo } = req.body;

    const estado = await EstadoTiempoRealModel.iniciarCronometro(idPartido, periodo);
    
    res.status(200).json({
      success: true,
      message: 'Cronómetro iniciado',
      data: estado
    });
  } catch (error) {
    console.error('Error al iniciar cronómetro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar cronómetro',
      error: error.message
    });
  }
};

// ===== PAUSAR CRONÓMETRO =====
export const pausarCronometro = async (req, res) => {
  try {
    const { idPartido } = req.params;
    const estado = await EstadoTiempoRealModel.pausarCronometro(idPartido);
    
    res.status(200).json({
      success: true,
      message: 'Cronómetro pausado',
      data: estado
    });
  } catch (error) {
    console.error('Error al pausar cronómetro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al pausar cronómetro',
      error: error.message
    });
  }
};

// ===== DETENER CRONÓMETRO =====
export const detenerCronometro = async (req, res) => {
  try {
    const { idPartido } = req.params;
    const estado = await EstadoTiempoRealModel.detenerCronometro(idPartido);
    
    res.status(200).json({
      success: true,
      message: 'Cronómetro detenido',
      data: estado
    });
  } catch (error) {
    console.error('Error al detener cronómetro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al detener cronómetro',
      error: error.message
    });
  }
};

// ===== REINICIAR TIEMPO =====
export const reiniciarTiempo = async (req, res) => {
  try {
    const { idPartido } = req.params;
    const estado = await EstadoTiempoRealModel.reiniciarTiempo(idPartido);
    
    res.status(200).json({
      success: true,
      message: 'Tiempo reiniciado',
      data: estado
    });
  } catch (error) {
    console.error('Error al reiniciar tiempo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reiniciar tiempo',
      error: error.message
    });
  }
};

// ===== ACTUALIZAR PUNTUACIÓN DETALLADA =====
export const actualizarPuntuacion = async (req, res) => {
  try {
    const { idPartido } = req.params;
    const { puntuacion_detallada } = req.body;

    const estado = await EstadoTiempoRealModel.actualizarPuntuacion(
      idPartido,
      puntuacion_detallada
    );
    
    res.status(200).json({
      success: true,
      message: 'Puntuación actualizada',
      data: estado
    });
  } catch (error) {
    console.error('Error al actualizar puntuación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar puntuación',
      error: error.message
    });
  }
};
