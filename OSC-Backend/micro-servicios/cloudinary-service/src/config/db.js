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
});

export default pool;