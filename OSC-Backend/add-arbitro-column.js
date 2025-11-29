import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

async function addArbitroColumn() {
  const client = await pool.connect();
  
  try {
    console.log('Agregando columna id_arbitro a partidos_torneo...');
    
    await client.query(`
      ALTER TABLE partidos_torneo 
      ADD COLUMN IF NOT EXISTS id_arbitro INTEGER REFERENCES usuarios(id_user)
    `);
    
    console.log('✅ Columna id_arbitro agregada exitosamente');
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_partidos_torneo_id_arbitro 
      ON partidos_torneo(id_arbitro)
    `);
    
    console.log('✅ Índice creado exitosamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

addArbitroColumn();
