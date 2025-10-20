import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import arbitroRoutes from './api/arbitro.routes.js';
import equipoRoutes from './api/equipo.routes.js';
import partidoRoutes from './api/partido.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', arbitroRoutes);
app.use('/', equipoRoutes);
app.use('/', partidoRoutes);

export default app;
