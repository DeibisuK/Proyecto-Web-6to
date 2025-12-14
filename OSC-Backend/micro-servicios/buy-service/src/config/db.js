import { Pool, types } from 'pg';

// Configurar el parser para tipos numéricos (float)
types.setTypeParser(1700, (val) => parseFloat(val));

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
  // Configurar zona horaria para evitar conversiones automáticas
  options: '-c timezone=America/Guayaquil',
  // Forzar reconexión después de cambios de esquema
  max: 10, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000, // Cerrar conexiones inactivas después de 30s
  connectionTimeoutMillis: 2000, // Timeout de conexión
});

// Manejar errores del pool
pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
});

export default pool;
