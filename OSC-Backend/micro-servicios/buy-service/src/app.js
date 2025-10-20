import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import buyRoutes from './api/buy.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', buyRoutes);

export default app;
