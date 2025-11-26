import * as JugadoresModel from '../models/jugadores.model.js';

// ===== OBTENER JUGADORES DE UN EQUIPO =====
export const getJugadoresByEquipo = async (req, res) => {
  try {
    const { idEquipo } = req.params;
    const jugadores = await JugadoresModel.findByEquipo(idEquipo);
    
    res.status(200).json({
      success: true,
      data: jugadores
    });
  } catch (error) {
    console.error('Error al obtener jugadores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener jugadores',
      error: error.message
    });
  }
};

// ===== OBTENER JUGADOR POR ID =====
export const getJugadorById = async (req, res) => {
  try {
    const { idJugador } = req.params;
    const jugador = await JugadoresModel.findById(idJugador);
    
    if (!jugador) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: jugador
    });
  } catch (error) {
    console.error('Error al obtener jugador:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener jugador',
      error: error.message
    });
  }
};

// ===== CREAR JUGADOR =====
export const crearJugador = async (req, res) => {
  try {
    const { id_usuario, id_user, uid, ...restData } = req.body;
    
    // Si se env\u00eda un uid (Firebase), convertirlo a id_user (PostgreSQL)
    let finalIdUsuario = id_usuario || id_user;
    
    if (!finalIdUsuario && uid) {
      // Buscar id_user usando el uid
      const pool = (await import('../config/db.js')).default;
      const userResult = await pool.query(
        'SELECT id_user FROM usuarios WHERE uid = $1',
        [uid]
      );
      
      if (userResult.rows.length > 0) {
        finalIdUsuario = userResult.rows[0].id_user;
      }
    }
    
    const jugadorData = {
      ...restData,
      id_usuario: finalIdUsuario || null
    };
    
    const jugador = await JugadoresModel.create(jugadorData);
    
    res.status(201).json({
      success: true,
      message: 'Jugador creado exitosamente',
      data: jugador
    });
  } catch (error) {
    console.error('Error al crear jugador:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear jugador',
      error: error.message
    });
  }
};

// ===== ACTUALIZAR JUGADOR =====
export const actualizarJugador = async (req, res) => {
  try {
    const { idJugador } = req.params;
    const jugador = await JugadoresModel.update(idJugador, req.body);
    
    if (!jugador) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Jugador actualizado',
      data: jugador
    });
  } catch (error) {
    console.error('Error al actualizar jugador:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar jugador',
      error: error.message
    });
  }
};

// ===== ELIMINAR JUGADOR =====
export const eliminarJugador = async (req, res) => {
  try {
    const { idJugador } = req.params;
    const jugador = await JugadoresModel.remove(idJugador);
    
    if (!jugador) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Jugador eliminado',
      data: jugador
    });
  } catch (error) {
    console.error('Error al eliminar jugador:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar jugador',
      error: error.message
    });
  }
};

// ===== BUSCAR JUGADORES POR NOMBRE =====
export const buscarJugadores = async (req, res) => {
  try {
    const { nombre } = req.query;
    
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar un nombre para buscar'
      });
    }

    const jugadores = await JugadoresModel.searchByName(nombre);
    
    res.status(200).json({
      success: true,
      data: jugadores
    });
  } catch (error) {
    console.error('Error al buscar jugadores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar jugadores',
      error: error.message
    });
  }
};

// ===== OBTENER JUGADORES DISPONIBLES =====
export const getJugadoresDisponibles = async (req, res) => {
  try {
    const { idEquipo } = req.params;
    const jugadores = await JugadoresModel.findDisponibles(idEquipo);
    
    res.status(200).json({
      success: true,
      data: jugadores
    });
  } catch (error) {
    console.error('Error al obtener jugadores disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener jugadores disponibles',
      error: error.message
    });
  }
};

// ===== CAMBIAR ESTADO DE JUGADOR =====
export const cambiarEstado = async (req, res) => {
  try {
    const { idJugador } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar un estado'
      });
    }

    const jugador = await JugadoresModel.cambiarEstado(idJugador, estado);
    
    res.status(200).json({
      success: true,
      message: 'Estado actualizado',
      data: jugador
    });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del jugador',
      error: error.message
    });
  }
};

// ===== ASIGNAR CAPITÁN =====
export const asignarCapitan = async (req, res) => {
  try {
    const { idEquipo, idJugador } = req.params;
    const jugador = await JugadoresModel.asignarCapitan(idEquipo, idJugador);
    
    res.status(200).json({
      success: true,
      message: 'Capitán asignado exitosamente',
      data: jugador
    });
  } catch (error) {
    console.error('Error al asignar capitán:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar capitán',
      error: error.message
    });
  }
};
