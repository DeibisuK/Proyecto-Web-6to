// server.js
import dotenv from 'dotenv';

// PRIMERO cargar las variables de entorno
dotenv.config();

// DESPUÉS importar la app
import app from './app.js';

const PORT = process.env.CLOUDINARY_SERVICE_PORT || 3006;

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log('🔑 Cloudinary configurado:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '❌ Falta',
    api_key: process.env.CLOUDINARY_API_KEY ? '✅ OK' : '❌ Falta',
    api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ OK' : '❌ Falta'
  });
});