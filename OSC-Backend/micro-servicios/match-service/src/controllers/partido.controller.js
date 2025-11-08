import * as service from '../services/partido.service.js';

export const getAllPartidos = async (req, res) => {
    try {
        const partidos = await service.getAll();
        res.json(partidos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPartidoById = async (req, res) => {
    try {
        const partido = await service.getById(req.params.id);
        if (partido) {
            res.json(partido);
        } else {
            res.status(404).json({ message: 'Partido not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtiene el detalle completo de un partido incluyendo eventos, alineaciones y estadísticas
 */
export const getDetallePartido = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de partido inválido'
            });
        }

        const detalle = await service.getDetalleCompleto(parseInt(id));
        
        if (!detalle.partido) {
            return res.status(404).json({
                success: false,
                message: 'Partido no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: detalle
        });
    } catch (error) {
        console.error('Error al obtener detalle del partido:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener detalle del partido',
            error: error.message
        });
    }
};

export const createPartido = async (req, res) => {
    try {
        const partido = await service.create(req.body);
        res.status(201).json(partido);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePartidoStatus = async (req, res) => {
    try {
        const partido = await service.updateStatus(req.params.id, req.body.estado_partido);
        res.json(partido);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const finishPartido = async (req, res) => {
    try {
        const partido = await service.finishMatch(req.params.id, req.body);
        res.json(partido);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deletePartido = async (req, res) => {
    try {
        const partido = await service.remove(req.params.id);
        if (partido) {
            res.json({ message: 'Partido deleted' });
        } else {
            res.status(404).json({ message: 'Partido not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
