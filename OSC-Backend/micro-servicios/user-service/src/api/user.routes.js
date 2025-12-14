import { Router } from 'express';
import {UserController} from '../controllers/users.controller.js';
const router = Router();

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.get('/:uid/cashback', UserController.getCashback);
router.post('/', UserController.createUser);
router.put('/:uid', UserController.updateUser);
router.patch('/:uid/role', UserController.updateUserRole);
router.delete('/:id', UserController.deleteUser);

export default router;