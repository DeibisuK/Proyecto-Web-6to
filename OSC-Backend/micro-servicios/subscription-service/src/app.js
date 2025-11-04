import express from 'express';
import cors from 'cors';
import subscriptionRoutes from './api/subscription.routes.js';
import authenticate from '../../../middleware/authenticate.js';

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas públicas (no requieren autenticación)
app.get('/', (req, res) => {
  res.json({
    service: 'Subscription Service',
    status: 'running',
    version: '1.0.0',
    description: 'Servicio de gestión de suscripciones con integración Firebase Claims'
  });
});

// Rutas de suscripciones
// Las rutas protegidas están definidas con authenticate en las rutas específicas
app.use('/client', authenticate(), subscriptionRoutes);

// Ruta pública para obtener planes (sin autenticación)
app.use('/public', subscriptionRoutes);

export default app;
