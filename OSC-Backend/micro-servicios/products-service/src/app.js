import express from 'express';
import cors from 'cors';
import categoriaCliente from './api/client/categoria.cliente.routes.js';
import deporteCliente from './api/client/deporte.cliente.routes.js';
import marcaCliente from './api/client/marca.cliente.routes.js';
import productoCliente from './api/client/producto.cliente.routes.js';
import categoriaAdmin from './api/admin/categoria.admin.routes.js';
import deporteAdmin from './api/admin/deporte.admin.routes.js';
import marcaAdmin from './api/admin/marca.admin.routes.js';
import productoAdmin from './api/admin/producto.admin.routes.js';
import authorizeRole from '../../../middleware/authorizeRole.js';
import authenticate from '../../../middleware/authenticate.js';

const app = express();

app.use(cors());
app.use(express.json());

//RUTAS CLIENTE
app.use('/client/categorias',  categoriaCliente);
app.use('/client/deportes',deporteCliente);
app.use('/client/marcas',marcaCliente);
app.use('/client/productos',productoCliente);

//RUTAS ADMIN
app.use('/admin/categorias', authenticate(), authorizeRole(1), categoriaAdmin);
app.use('/admin/deportes', authenticate(), authorizeRole(1), deporteAdmin);
app.use('/admin/marcas', authenticate(), authorizeRole(1), marcaAdmin);
app.use('/admin/productos', authenticate(), authorizeRole(1), productoAdmin);

export default app;
