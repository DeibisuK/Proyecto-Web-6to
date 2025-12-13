import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';

const router = Router();

// Generate report endpoint
router.post('/generate', reportController.generateReport);

// Get recent reports (optional - for future implementation)
// router.get('/recent', reportController.getRecentReports);

export default router;
