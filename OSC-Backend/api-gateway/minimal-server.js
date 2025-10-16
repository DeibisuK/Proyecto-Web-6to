require('dotenv').config();
const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');

const app = express();
app.use(cors());
app.use(express.json());

const COURT_SERVICE = process.env.COURT_SERVICE_URL || 'http://localhost:3004';
const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:3001';

console.log('🔧 OSC API Gateway - Public Routes');
console.log('📍 COURT_SERVICE:', COURT_SERVICE);
console.log('📍 USER_SERVICE:', USER_SERVICE);

// Rutas públicas (sin autenticación)
app.get('/c/sedes', proxy(COURT_SERVICE));
app.get('/c/sedes/:id', proxy(COURT_SERVICE));
app.get('/c/canchas', proxy(COURT_SERVICE));
app.get('/c/canchas/:id', proxy(COURT_SERVICE));
app.post('/u/contacto', proxy(USER_SERVICE));

// Ruta de prueba
app.get('/test', (req, res) => {
  res.json({ message: 'API Gateway working!', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API Gateway running on http://localhost:${PORT}`);
  console.log(`📋 Public routes: /c/sedes, /c/canchas, /u/contacto`);
});
