import { Router } from 'express';
import { RolController } from '../controllers/rol.controller.js';

const router = Router();

router.get('/', RolController.getAllRoles);
router.post('/', RolController.createRol);
router.get('/:id', RolController.getRolById);
router.put('/:id', RolController.updateRol);
router.delete('/:id', RolController.deleteRol);

export default router;
