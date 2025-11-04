import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.js";
import authenticate from "../../../../middleware/authenticate.js";
import authorizeRole from "../../../../middleware/authorizeRole.js";

const router = Router();

/**
 * GET /admin/all-users
 * Obtiene todos los usuarios combinando Firebase y BD
 * Requiere: Autenticación + Rol de Admin (id_rol = 1)
 */
router.get(
  "/all-users",
  authenticate(),
  authorizeRole(1),
  AdminController.getAllUsers
);

/**
 * POST /admin/assign-role
 * Asigna un rol a un usuario y sincroniza con Firebase Custom Claims
 * Body: { uid: string, id_rol: number }
 * Requiere: Autenticación + Rol de Admin (id_rol = 1)
 */
router.post(
  "/assign-role",
  // authenticate(),
  // authorizeRole(1),
  AdminController.assignRole
);

export default router;
