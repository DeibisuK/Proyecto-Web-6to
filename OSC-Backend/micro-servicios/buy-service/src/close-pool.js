import pool from './config/db.js';

console.log('🔄 Cerrando todas las conexiones del pool...');

// Cerrar todas las conexiones activas
await pool.end();

console.log('✅ Pool cerrado exitosamente');
console.log('💡 Reinicia el buy-service ahora');

process.exit(0);
