import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkColumn() {
  try {
    const result = await pool.query(`
      SELECT column_name, column_default, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' AND column_name = 'id_rol'
    `);
    
    console.log('📊 Configuración columna id_rol:');
    console.log(JSON.stringify(result.rows, null, 2));
    
    // Verificar últimos usuarios creados
    const users = await pool.query(`
      SELECT uid, name_user, email_user, id_rol, fecha_registro 
      FROM usuarios 
      ORDER BY fecha_registro DESC 
      LIMIT 5
    `);
    
    console.log('\n👥 Últimos 5 usuarios creados:');
    console.log(JSON.stringify(users.rows, null, 2));
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkColumn();
