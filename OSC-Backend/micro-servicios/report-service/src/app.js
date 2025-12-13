import express from 'express';
import cors from 'cors';
import reportRoutes from './api/report.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Report routes
app.use('/reports', reportRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'report-service' });
});

export default app;
