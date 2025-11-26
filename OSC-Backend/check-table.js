import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/osc_db'
});

pool.query(`
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns 
  WHERE table_name = 'partidos_torneo' 
  ORDER BY ordinal_position
`).then(res => {
  console.log('\n📋 Columnas de partidos_torneo:');
  console.log('=====================================');
  res.rows.forEach(row => {
    console.log(`- ${row.column_name.padEnd(30)} ${row.data_type.padEnd(20)} ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
  });
  console.log('=====================================\n');
  pool.end();
}).catch(err => {
  console.error('❌ Error:', err.message);
  pool.end();
  process.exit(1);
});
