import express from 'express';
import cors from 'cors';
import notificationRoutes from './api/notification.routes.js';
import anuncioRoutes from './api/anuncio.routes.js';

// Importar el scheduler para que se ejecute automáticamente
import './services/notification.scheduler.js';

const app = express();

app.use(cors());
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    service: 'Notification Service',
    status: 'running',
    version: '1.0.0',
    description: 'Servicio de notificaciones y anuncios con scheduler automático'
  });
});

// Rutas de notificaciones
app.use('/api/notificaciones', notificationRoutes);

// Rutas de anuncios globales
app.use('/api/anuncios', anuncioRoutes);

export default app;
