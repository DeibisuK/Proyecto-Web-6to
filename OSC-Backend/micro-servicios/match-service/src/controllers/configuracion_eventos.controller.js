import * as ConfiguracionEventosModel from '../models/configuracion_eventos.model.js';

// ===== OBTENER EVENTOS POR DEPORTE =====
export const getEventosByDeporte = async (req, res) => {
  try {
    const { idDeporte } = req.params;
    const eventos = await ConfiguracionEventosModel.findByDeporte(idDeporte);
    
    res.status(200).json({
      success: true,
      data: eventos
    });
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener eventos del deporte',
      error: error.message
    });
  }
};

// ===== OBTENER TODOS LOS EVENTOS =====
export const getAllEventos = async (req, res) => {
  try {
    const eventos = await ConfiguracionEventosModel.findAll();
    
    res.status(200).json({
      success: true,
      data: eventos
    });
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener eventos',
      error: error.message
    });
  }
};

// ===== OBTENER EVENTO POR ID =====
export const getEventoById = async (req, res) => {
  try {
    const { idConfig } = req.params;
    const evento = await ConfiguracionEventosModel.findById(idConfig);
    
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: evento
    });
  } catch (error) {
    console.error('Error al obtener evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener evento',
      error: error.message
    });
  }
};

// ===== CREAR EVENTO =====
export const crearEvento = async (req, res) => {
  try {
    const evento = await ConfiguracionEventosModel.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Evento creado exitosamente',
      data: evento
    });
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear evento',
      error: error.message
    });
  }
};

// ===== ACTUALIZAR EVENTO =====
export const actualizarEvento = async (req, res) => {
  try {
    const { idConfig } = req.params;
    const evento = await ConfiguracionEventosModel.update(idConfig, req.body);
    
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Evento actualizado',
      data: evento
    });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar evento',
      error: error.message
    });
  }
};

// ===== DESACTIVAR EVENTO =====
export const desactivarEvento = async (req, res) => {
  try {
    const { idConfig } = req.params;
    const evento = await ConfiguracionEventosModel.remove(idConfig);
    
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Evento desactivado',
      data: evento
    });
  } catch (error) {
    console.error('Error al desactivar evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar evento',
      error: error.message
    });
  }
};

// ===== ACTIVAR EVENTO =====
export const activarEvento = async (req, res) => {
  try {
    const { idConfig } = req.params;
    const evento = await ConfiguracionEventosModel.activar(idConfig);
    
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Evento activado',
      data: evento
    });
  } catch (error) {
    console.error('Error al activar evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al activar evento',
      error: error.message
    });
  }
};
