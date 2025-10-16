require('dotenv').config();
const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');
const authenticate = require('./middleware/authenticate');

const app = express();

// Configure CORS: use CORS_ALLOWED_ORIGINS (comma-separated) or default to '*'.
const rawOrigins = process.env.CORS_ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS || '';
const allowedOrigins = rawOrigins.split(',').map((s) => s.trim()).filter(Boolean);
const corsOptions = {};
if (allowedOrigins.length > 0) {
	corsOptions.origin = function (origin, callback) {
		// Allow requests with no origin like mobile apps or curl
		if (!origin) return callback(null, true);
		if (allowedOrigins.indexOf(origin) !== -1) {
			return callback(null, true);
		}
		return callback(new Error('Not allowed by CORS'), false);
	};
} else {
	corsOptions.origin = '*';
}
// Optionally allow credentials if frontends need cookies
corsOptions.credentials = (process.env.CORS_ALLOW_CREDENTIALS || 'false').toLowerCase() === 'true';

app.use(cors(corsOptions));
app.use(express.json());

const userServiceUrl = process.env.USER_SERVICE_URL;
const productServiceUrl = process.env.PRODUCT_SERVICE_URL;

// Protect proxied routes with Firebase ID token verification
const proxyOptions = {
	proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
		proxyReqOpts.headers = proxyReqOpts.headers || {};
		// Forward original Authorization header so downstream services can verify if needed
		if (srcReq.headers && srcReq.headers.authorization) {
			proxyReqOpts.headers.authorization = srcReq.headers.authorization;
		}
		// Attach user info decoded by the gateway (if available)
		if (srcReq.user) {
			proxyReqOpts.headers['x-user-uid'] = srcReq.user.uid || '';
			if (srcReq.user.email) proxyReqOpts.headers['x-user-email'] = srcReq.user.email;
		}
		return proxyReqOpts;
	},
};

// Mount admin routes (these are handled by gateway directly and not proxied)
const adminRoutes = require('./routes/admin.routes');
const authorizeRole = require('./middleware/authorizeRole');
// Use authenticate to verify token, then authorizeRole to check id_rol in the user-service.
// By convention admin role id = 1. Change if your DB uses a different id.
app.use('/admin', authenticate(), authorizeRole(1), adminRoutes);

// 🔓 Rutas públicas (sin autenticación)
// Estas rutas deben ir ANTES de las rutas protegidas para que tengan prioridad
// Solo permitimos consultas (GET) y envío de contacto (POST)
app.get('/c/sedes', proxy(process.env.COURT_SERVICE_URL, proxyOptions));
app.get('/c/sedes/:id', proxy(process.env.COURT_SERVICE_URL, proxyOptions));
app.get('/c/canchas', proxy(process.env.COURT_SERVICE_URL, proxyOptions));
app.get('/c/canchas/:id', proxy(process.env.COURT_SERVICE_URL, proxyOptions));
app.post('/u/contacto', proxy(userServiceUrl, proxyOptions));

// 🔒 Rutas protegidas (requieren autenticación)
// Crear, actualizar y eliminar requieren autenticación
app.use('/u', authenticate(), proxy(userServiceUrl, proxyOptions));
app.use('/p', authenticate(), proxy(productServiceUrl, proxyOptions));
app.use('/b', authenticate(), proxy(process.env.BUY_SERVICE_URL, proxyOptions));
app.use('/c', authenticate(), proxy(process.env.COURT_SERVICE_URL, proxyOptions));
app.use('/m', authenticate(), proxy(process.env.MATCH_SERVICE_URL, proxyOptions));
app.use('/i', authenticate(), proxy(process.env.CLOUDINARY_SERVICE_URL, proxyOptions));

// Routes configured successfully
module.exports = app;
