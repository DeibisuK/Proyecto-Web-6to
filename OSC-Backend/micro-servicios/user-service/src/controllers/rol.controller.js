import * as service from '../services/rol.service.js';

export class RolController {
  static async getAllRoles(req, res) {
    try {
      const roles = await service.getAll();
      res.status(200).json(roles);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  }

  static async createRol(req, res) {
    try {
      const newRol = await service.create(req.body);
      res.status(201).json(newRol);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create rol' });
    }
  }
  
  static async getRolById(req, res) {
    try {
      const rol = await service.getById(req.params.id);
      if (!rol) {
        return res.status(404).json({ error: 'Rol not found' });
      }
      res.status(200).json(rol);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch rol' });
    }
  }

  static async updateRol(req, res) {
    try {
      const updatedRol = await service.update(req.params.id, req.body);
      if (!updatedRol) {
        return res.status(404).json({ error: 'Rol not found' });
      }
      res.status(200).json(updatedRol);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update rol' });
    }
  }

  static async deleteRol(req, res) {
    try {
      const success = await service.remove(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Rol not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete rol' });
    }
  }
}