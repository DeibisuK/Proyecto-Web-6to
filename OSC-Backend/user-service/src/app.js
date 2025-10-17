import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import userRoutes from './api/user.routes.js';
import rolRoutes from './api/rol.routes.js';
import contactoRoutes from './api/contacto.routes.js';
import metodoPagoRoutes from './api/metodo_pago.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/users', userRoutes);
app.use('/roles', rolRoutes);
app.use('/metodos-pago', metodoPagoRoutes);
app.use('/', contactoRoutes);

export default app;