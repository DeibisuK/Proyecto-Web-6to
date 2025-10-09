import * as service from '../services/imagenes_producto.service.js';

export const getAllImagenes = async (req, res) => {
    try {
        const imagenes = await service.getAll();
        res.json(imagenes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getImagenById = async (req, res) => {
    try {
        const imagen = await service.getById(req.params.id);
        if (imagen) {
            res.json(imagen);
        } else {
            res.status(404).json({ message: 'Imagen not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getImagenesByProductoId = async (req, res) => {
    try {
        const imagenes = await service.getByProductId(req.params.id_producto);
        res.json(imagenes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createImagen = async (req, res) => {
    try {
        const imagen = await service.create(req.body);
        res.status(201).json(imagen);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateImagen = async (req, res) => {
    try {
        const imagen = await service.update(req.params.id, req.body);
        res.json(imagen);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteImagen = async (req, res) => {
    try {
        const imagen = await service.remove(req.params.id);
        if (imagen) {
            res.json({ message: 'Imagen deleted' });
        } else {
            res.status(404).json({ message: 'Imagen not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
