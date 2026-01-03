import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import buyRoutes from './api/buy.routes.js';
import inscripcionRoutes from './api/inscripcion.routes.js';
import authenticate from '../../../middleware/authenticate.js';

const app = express();

app.use(cors());
app.use(express.json());

// Rutas de cliente y admin
app.use('/', buyRoutes);
app.use('/client', inscripcionRoutes);

app.get('/', (req, res) => {
    res.send('Buy Service is running');
});

export default app;
