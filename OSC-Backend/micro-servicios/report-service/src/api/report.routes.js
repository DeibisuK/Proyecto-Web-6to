import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';
import authenticate from '../../../../middleware/authenticate.js';

const router = Router();

// Generate report endpoint (protected route)
router.post('/generate', authenticate(), reportController.generateReport);

// Generate invoice PDF for order
router.post('/factura-pedido', authenticate(), reportController.generarFacturaPedido);

// Generate invoice PDF for reservation
router.post('/factura-reserva', authenticate(), reportController.generarFacturaReserva);

// Get recent reports (optional - for future implementation)
// router.get('/recent', reportController.getRecentReports);

export default router;
