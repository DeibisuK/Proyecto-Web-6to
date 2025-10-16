require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Configuración CORS permisiva
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());

const COURT_SERVICE = process.env.COURT_SERVICE_URL || 'http://localhost:3004';
const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:3001';

console.log('===========================================');
console.log('🚀 OSC API Gateway - STABLE VERSION');
console.log('===========================================');
console.log('📍 COURT_SERVICE:', COURT_SERVICE);
console.log('📍 USER_SERVICE:', USER_SERVICE);
console.log('===========================================\n');

// Ruta de health check
app.get('/health', (req, res) => {
  console.log('✅ Health check called');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      court: COURT_SERVICE,
      user: USER_SERVICE
    }
  });
});

// Ruta de prueba
app.get('/test', (req, res) => {
  console.log('✅ Test route called');
  res.json({ message: 'API Gateway is working!', timestamp: new Date().toISOString() });
});

// ============================================
// RUTAS PÚBLICAS (SIN AUTENTICACIÓN)
// ============================================

// Proxy para Court Service - Todas las rutas que empiecen con /c
app.use('/c', (req, res, next) => {
  console.log(`📥 Incoming: ${req.method} ${req.originalUrl}`);
  next();
}, createProxyMiddleware({
  target: COURT_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/c': ''
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`→ Proxy to: ${COURT_SERVICE}${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Court Service unavailable' });
    }
  }
}));

// Proxy para User Service - Todas las rutas que empiecen con /u
app.use('/u', createProxyMiddleware({
  target: USER_SERVICE,
  changeOrigin: true,
  pathRewrite: (path, req) => {
    const newPath = path.replace(/^\/u/, '');
    console.log(`🔄 PathRewrite: ${path} -> ${newPath}`);
    return newPath;
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`→ Proxying ${req.method} ${req.originalUrl} to ${USER_SERVICE}${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`← Response ${proxyRes.statusCode} from User Service`);
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error:', err.message);
    res.status(502).json({ error: 'User Service unavailable', message: err.message });
  }
}));

// Ruta 404
app.use((req, res) => {
  console.log(`⚠️  404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Route not found', 
    path: req.path,
    method: req.method,
    availableRoutes: ['/health', '/test', '/c/sedes', '/c/canchas', '/u/contacto']
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('❌ Global error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message 
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`\n✅ API Gateway running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Test route: http://localhost:${PORT}/test`);
  console.log(`📋 Public routes: /c/sedes, /c/canchas, /u/contacto\n`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
