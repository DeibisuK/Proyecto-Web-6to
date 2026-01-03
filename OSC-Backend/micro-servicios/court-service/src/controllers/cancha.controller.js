import * as service from '../services/cancha.service.js';

export const getAllCanchas = async (req, res) => {
  try {
    const canchas = await service.getAll();
    res.json(canchas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCanchaById = async (req, res) => {
  try {
    const cancha = await service.getById(req.params.id);
    if (cancha) {
      res.json(cancha);
    } else {
      res.status(404).json({ message: 'Cancha not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCanchasBySede = async (req, res) => {
  try {
    const canchas = await service.getBySede(req.params.idSede);
    res.json(canchas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCanchasByDeporte = async (req, res) => {
  try {
    const canchas = await service.getByDeporte(req.params.idDeporte);
    res.json(canchas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCancha = async (req, res) => {
  try {
    const cancha = await service.create(req.body);
    res.status(201).json(cancha);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCancha = async (req, res) => {
  try {
    const cancha = await service.update(req.params.id, req.body);
    if (cancha) {
      res.json(cancha);
    } else {
      res.status(404).json({ message: 'Cancha not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCancha = async (req, res) => {
  try {
    const cancha = await service.remove(req.params.id);
    if (cancha) {
      res.json({ message: 'Cancha deleted successfully', cancha });
    } else {
      res.status(404).json({ message: 'Cancha not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const guardarHorariosDisponibles = async (req, res) => {
  try {
    const idCancha = req.params.id;
    const configuracion = req.body;
    
    console.log('📥 Recibiendo configuración de horarios para cancha:', idCancha);
    console.log('📋 Configuración:', configuracion);
    
    const resultado = await service.guardarHorariosDisponibles(idCancha, configuracion);
    
    res.status(200).json({ 
      message: 'Horarios disponibles guardados correctamente',
      data: resultado 
    });
  } catch (error) {
    console.error('❌ Error al guardar horarios disponibles:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getHorariosDisponibles = async (req, res) => {
  try {
    const idCancha = req.params.id;
    const horarios = await service.getHorariosDisponibles(idCancha);
    res.status(200).json(horarios);
  } catch (error) {
    console.error('❌ Error al obtener horarios disponibles:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getHorariosConReservas = async (req, res) => {
  try {
    const idCancha = req.params.id;
    const fecha = req.query.fecha; // Formato: YYYY-MM-DD
    
    if (!fecha) {
      return res.status(400).json({ message: 'La fecha es requerida' });
    }
    
    const horarios = await service.getHorariosConReservas(idCancha, fecha);
    res.status(200).json(horarios);
  } catch (error) {
    console.error('❌ Error al obtener horarios con reservas:', error);
    res.status(500).json({ message: error.message });
  }
};
