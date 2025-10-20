import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import uploadRoutes from './api/upload.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/imagen', uploadRoutes);

export default app;