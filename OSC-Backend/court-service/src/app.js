import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import canchaRoutes from './api/cancha.routes.js';
import reservaRoutes from './api/reserva.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', canchaRoutes);
app.use('/', reservaRoutes);

export default app;
