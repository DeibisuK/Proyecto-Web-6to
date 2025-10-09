import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import deporteRoutes from './api/deporte.routes.js';
import categoriaRoutes from './api/categoria.routes.js';
import productoRoutes from './api/producto.routes.js';
import imagenRoutes from './api/imagenes_producto.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/deportes', deporteRoutes);
app.use('/categorias', categoriaRoutes);
app.use('/products', productoRoutes);
app.use('/images', imagenRoutes);

export default app;
