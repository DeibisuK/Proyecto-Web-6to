import * as EventosPartidoModel from '../models/eventos_partido.model.js';

// ===== OBTENER EVENTOS DE UN PARTIDO =====
export const getEventosByPartido = async (req, res) => {
  try {
    const { idPartido } = req.params;
    const eventos = await EventosPartidoModel.findByPartido(idPartido);
    
    res.status(200).json({
      success: true,
      data: eventos
    });
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener eventos del partido',
      error: error.message
    });
  }
};

// ===== REGISTRAR EVENTO (GOL, CANASTA, TARJETA, ETC.) =====
export const registrarEvento = async (req, res) => {
  try {
    const { idPartido } = req.params;
    const eventoData = {
      ...req.body,
      id_partido: idPartido,
      registrado_por: req.user?.id_user // Desde el middleware de autenticación
    };

    const evento = await EventosPartidoModel.create(eventoData);
    
    res.status(201).json({
      success: true,
      message: 'Evento registrado exitosamente',
      data: evento
    });
  } catch (error) {
    console.error('Error al registrar evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar evento',
      error: error.message
    });
  }
};

// ===== ELIMINAR EVENTO =====
export const eliminarEvento = async (req, res) => {
  try {
    const { idEvento } = req.params;
    const evento = await EventosPartidoModel.remove(idEvento);
    
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Evento eliminado exitosamente',
      data: evento
    });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar evento',
      error: error.message
    });
  }
};

// ===== OBTENER GOLEADORES DE UN TORNEO =====
export const getGoleadoresByTorneo = async (req, res) => {
  try {
    const { idTorneo } = req.params;
    const goleadores = await EventosPartidoModel.getGoleadoresByTorneo(idTorneo);
    
    res.status(200).json({
      success: true,
      data: goleadores
    });
  } catch (error) {
    console.error('Error al obtener goleadores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener goleadores',
      error: error.message
    });
  }
};

// ===== OBTENER ESTADÍSTICAS DE JUGADOR EN UN PARTIDO =====
export const getEstadisticasJugador = async (req, res) => {
  try {
    const { idPartido, idJugador } = req.params;
    const estadisticas = await EventosPartidoModel.getEstadisticasJugador(idPartido, idJugador);
    
    res.status(200).json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del jugador',
      error: error.message
    });
  }
};
