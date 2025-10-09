import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import rolRoutes from './api/rol.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', rolRoutes);

export default app;