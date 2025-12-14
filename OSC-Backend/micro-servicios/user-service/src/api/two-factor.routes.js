// ============================================
// RUTAS 2FA - Endpoints de autenticación de dos factores
// ============================================

import express from 'express';
import TwoFactorController from '../controllers/two-factor.controller.js';
import authenticate from '../../../../middleware/authenticate.js';

const router = express.Router();

/**
 * POST /two-factor/generate
 * Genera y envía un código 2FA al email del usuario
 * Body: { uid, email, nombre }
 */
router.post('/generate', TwoFactorController.generateCode.bind(TwoFactorController));

/**
 * POST /two-factor/verify
 * Verifica el código 2FA ingresado por el usuario
 * Body: { uid, codigo, mantenerSesion }
 */
router.post('/verify', TwoFactorController.verifyCode.bind(TwoFactorController));

/**
 * POST /two-factor/resend
 * Reenvía un nuevo código 2FA
 * Body: { uid }
 */
router.post('/resend', TwoFactorController.resendCode.bind(TwoFactorController));

export default router;
