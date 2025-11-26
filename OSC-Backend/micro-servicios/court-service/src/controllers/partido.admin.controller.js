import * as partidoService from '../services/partido.admin.service.js';

/**
 * Obtiene todos los partidos con filtros opcionales
 */
export const obtenerPartidos = async (req, res) => {
  try {
    const filtros = {
      id_torneo: req.query.id_torneo ? parseInt(req.query.id_torneo) : undefined,
      estado: req.query.estado,
      fecha: req.query.fecha,
      id_arbitro: req.query.id_arbitro
    };

    const partidos = await partidoService.obtenerPartidos(filtros);

    res.status(200).json({
      success: true,
      data: partidos,
      total: partidos.length
    });
  } catch (error) {
    console.error('Error al obtener partidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener partidos',
      error: error.message
    });
  }
};

/**
 * Obtiene un partido por ID
 */
export const obtenerPartidoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const partido = await partidoService.obtenerPartidoPorId(parseInt(id));

    if (!partido) {
      return res.status(404).json({
        success: false,
        message: 'Partido no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: partido
    });
  } catch (error) {
    console.error('Error al obtener partido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener partido',
      error: error.message
    });
  }
};

/**
 * Asigna un árbitro a un partido
 */
export const asignarArbitro = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_arbitro } = req.body;

    if (!id_arbitro) {
      return res.status(400).json({
        success: false,
        message: 'El campo id_arbitro es requerido'
      });
    }

    const partidoActualizado = await partidoService.asignarArbitro(
      parseInt(id),
      id_arbitro
    );

    res.status(200).json({
      success: true,
      message: 'Árbitro asignado exitosamente',
      data: partidoActualizado
    });
  } catch (error) {
    console.error('Error al asignar árbitro:', error);
    
    // Errores específicos
    if (error.message.includes('no encontrado') || error.message.includes('no tiene rol')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('No se puede asignar')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al asignar árbitro',
      error: error.message
    });
  }
};

/**
 * Remueve el árbitro asignado de un partido
 */
export const removerArbitro = async (req, res) => {
  try {
    const { id } = req.params;
    const partidoActualizado = await partidoService.removerArbitro(parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Árbitro removido exitosamente',
      data: partidoActualizado
    });
  } catch (error) {
    console.error('Error al remover árbitro:', error);
    
    if (error.message.includes('no encontrado') || error.message.includes('No se puede remover')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al remover árbitro',
      error: error.message
    });
  }
};

/**
 * Actualiza datos de un partido
 */
export const actualizarPartido = async (req, res) => {
  try {
    const { id } = req.params;
    const partidoActualizado = await partidoService.actualizarPartido(
      parseInt(id),
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Partido actualizado exitosamente',
      data: partidoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar partido:', error);
    
    if (error.message.includes('no encontrado') || error.message.includes('No hay campos')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar partido',
      error: error.message
    });
  }
};
