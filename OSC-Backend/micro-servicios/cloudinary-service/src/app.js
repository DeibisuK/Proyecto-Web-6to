import express from 'express';
import cors from 'cors';
import uploadClient from './api/upload.client.route.js';
import uploadAdmin from './api/upload.admin.route.js';
import authenticate from '../../../middleware/authenticate.js';
import authorizeRole from '../../../middleware/authorizeRole.js';
const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/admin/', authorizeRole(1), uploadAdmin);
app.use('/client/', authenticate(), uploadClient);

export default app;