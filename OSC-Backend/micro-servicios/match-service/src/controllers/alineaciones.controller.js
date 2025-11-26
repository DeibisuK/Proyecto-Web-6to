import * as AlineacionesModel from '../models/alineaciones.model.js';

// ===== OBTENER ALINEACIÓN DE UN PARTIDO =====
export const getAlineacionByPartido = async (req, res) => {
  try {
    const { idPartido } = req.params;
    const { idEquipo } = req.query;

    let alineacion;
    if (idEquipo) {
      alineacion = await AlineacionesModel.findByPartidoYEquipo(idPartido, idEquipo);
    } else {
      alineacion = await AlineacionesModel.findByPartido(idPartido);
    }
    
    res.status(200).json({
      success: true,
      data: alineacion
    });
  } catch (error) {
    console.error('Error al obtener alineación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener alineación',
      error: error.message
    });
  }
};

// ===== AGREGAR JUGADOR A ALINEACIÓN =====
export const agregarJugadorAlineacion = async (req, res) => {
  try {
    const { idPartido } = req.params;
    const alineacionData = {
      ...req.body,
      id_partido: idPartido
    };

    const alineacion = await AlineacionesModel.create(alineacionData);
    
    res.status(201).json({
      success: true,
      message: 'Jugador agregado a la alineación',
      data: alineacion
    });
  } catch (error) {
    console.error('Error al agregar jugador:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar jugador a la alineación',
      error: error.message
    });
  }
};

// ===== REGISTRAR SUSTITUCIÓN =====
export const registrarSustitucion = async (req, res) => {
  try {
    const { idPartido } = req.params;
    const { id_jugador_sale, id_jugador_entra, minuto } = req.body;

    const resultado = await AlineacionesModel.registrarSustitucion(
      idPartido,
      id_jugador_sale,
      id_jugador_entra,
      minuto
    );
    
    res.status(200).json({
      success: true,
      message: 'Sustitución registrada exitosamente',
      data: resultado
    });
  } catch (error) {
    console.error('Error al registrar sustitución:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar sustitución',
      error: error.message
    });
  }
};

// ===== ACTUALIZAR ALINEACIÓN =====
export const actualizarAlineacion = async (req, res) => {
  try {
    const { idAlineacion } = req.params;
    const alineacion = await AlineacionesModel.update(idAlineacion, req.body);
    
    if (!alineacion) {
      return res.status(404).json({
        success: false,
        message: 'Alineación no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alineación actualizada',
      data: alineacion
    });
  } catch (error) {
    console.error('Error al actualizar alineación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar alineación',
      error: error.message
    });
  }
};

// ===== ELIMINAR DE ALINEACIÓN =====
export const eliminarDeAlineacion = async (req, res) => {
  try {
    const { idAlineacion } = req.params;
    const alineacion = await AlineacionesModel.remove(idAlineacion);
    
    if (!alineacion) {
      return res.status(404).json({
        success: false,
        message: 'Alineación no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Jugador eliminado de la alineación',
      data: alineacion
    });
  } catch (error) {
    console.error('Error al eliminar jugador:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar jugador de la alineación',
      error: error.message
    });
  }
};

// ===== CREAR ALINEACIÓN COMPLETA =====
export const crearAlineacionCompleta = async (req, res) => {
  try {
    const { idPartido, idEquipo } = req.params;
    const { jugadores } = req.body;

    if (!Array.isArray(jugadores) || jugadores.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar un array de jugadores'
      });
    }

    const alineaciones = await AlineacionesModel.crearAlineacionCompleta(
      idPartido,
      idEquipo,
      jugadores
    );
    
    res.status(201).json({
      success: true,
      message: 'Alineación completa creada',
      data: alineaciones
    });
  } catch (error) {
    console.error('Error al crear alineación completa:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear alineación completa',
      error: error.message
    });
  }
};
