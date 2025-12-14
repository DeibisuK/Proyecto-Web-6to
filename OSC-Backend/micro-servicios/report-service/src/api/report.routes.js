import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';
import authenticate from '../../../../middleware/authenticate.js';

const router = Router();

// Generate report endpoint (protected route)
router.post('/generate', authenticate(), reportController.generateReport);

// Get recent reports (optional - for future implementation)
// router.get('/recent', reportController.getRecentReports);

export default router;
