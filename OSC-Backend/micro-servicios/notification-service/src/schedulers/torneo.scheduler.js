import cron from 'node-cron';
import pool from '../config/db.js';

/**
 * 🏆 SCHEDULER DE TORNEOS
 * ========================
 * Automatiza las transiciones de estado de los torneos:
 * 
 * 1. abierto → cerrado (cuando se alcanza fecha_cierre_inscripcion)
 * 2. cerrado/abierto → en_curso (cuando se alcanza fecha_inicio)
 * 3. en_curso → finalizado (cuando se alcanza fecha_fin)
 * 
 * FRECUENCIA: Cada 5 minutos (PRUEBAS) - Cambiar a cada hora en producción
 * FORMATO CRON: cada 5 minutos para testing
 */

export function iniciarSchedulerTorneos() {
    // ⚠️ TEMPORAL PARA PRUEBAS: Ejecutar cada 5 minutos
    // 🔄 PRODUCCIÓN: Cambiar a '0 * * * *' (cada hora)
    cron.schedule('*/5 * * * *', async () => {
        const ahora = new Date().toISOString();
        console.log(`\n🏆 ========================================`);
        console.log(`   SCHEDULER TORNEOS - ${ahora}`);
        console.log(`🏆 ========================================`);
        
        let client;
        try {
            client = await pool.connect();
            
            // ==========================================
            // 1. CERRAR INSCRIPCIONES (abierto → cerrado)
            // ==========================================
            console.log('📋 [1/3] Verificando inscripciones a cerrar...');
            
            const cerrados = await client.query(`
                UPDATE torneos 
                SET estado = 'cerrado'
                WHERE estado = 'abierto'
                AND fecha_cierre_inscripcion IS NOT NULL
                AND fecha_cierre_inscripcion <= NOW()
                AND fecha_inicio > NOW()
                RETURNING id_torneo, nombre, fecha_cierre_inscripcion
            `);
            
            if (cerrados.rows.length > 0) {
                console.log(`   ✅ ${cerrados.rows.length} torneo(s) con inscripciones cerradas:`);
                cerrados.rows.forEach(t => {
                    console.log(`      • "${t.nombre}" (ID: ${t.id_torneo})`);
                });
                
                // Notificar a administradores para que generen fixture
                for (const torneo of cerrados.rows) {
                    await notificarAdminsGenerarFixture(client, torneo.id_torneo, torneo.nombre);
                }
            } else {
                console.log(`   ℹ️  No hay torneos para cerrar inscripciones`);
            }

            // ==========================================
            // 2. INICIAR TORNEOS (cerrado/abierto → en_curso)
            // ✅ SOLO SI YA TIENEN PARTIDOS GENERADOS
            // ==========================================
            console.log('\n▶️  [2/3] Verificando torneos a iniciar...');
            
            const iniciados = await client.query(`
                UPDATE torneos 
                SET estado = 'en_curso'
                WHERE estado IN ('abierto', 'cerrado')
                AND fecha_inicio <= NOW()
                AND fecha_fin >= NOW()
                AND (SELECT COUNT(*) FROM partidos_torneo WHERE id_torneo = torneos.id_torneo) > 0
                RETURNING id_torneo, nombre, fecha_inicio
            `);

            if (iniciados.rows.length > 0) {
                console.log(`   ✅ ${iniciados.rows.length} torneo(s) iniciados:`);
                iniciados.rows.forEach(t => {
                    console.log(`      • "${t.nombre}" (ID: ${t.id_torneo})`);
                });
                
                // Enviar notificaciones a participantes
                for (const torneo of iniciados.rows) {
                    await notificarInicioTorneo(client, torneo.id_torneo, torneo.nombre);
                }
            } else {
                console.log(`   ℹ️  No hay torneos para iniciar (o falta generar fixture)`);
            }

            // ==========================================
            // 3. FINALIZAR TORNEOS (en_curso → finalizado)
            // ==========================================
            console.log('\n🏁 [3/3] Verificando torneos a finalizar...');
            
            const finalizados = await client.query(`
                UPDATE torneos
                SET estado = 'finalizado'
                WHERE estado = 'en_curso'
                AND fecha_fin < NOW()
                RETURNING id_torneo, nombre, fecha_fin
            `);

            if (finalizados.rows.length > 0) {
                console.log(`   ✅ ${finalizados.rows.length} torneo(s) finalizados:`);
                finalizados.rows.forEach(t => {
                    console.log(`      • "${t.nombre}" (ID: ${t.id_torneo})`);
                });
                
                // Enviar notificaciones de cierre
                for (const torneo of finalizados.rows) {
                    await notificarFinTorneo(client, torneo.id_torneo, torneo.nombre);
                }
            } else {
                console.log(`   ℹ️  No hay torneos para finalizar`);
            }

            console.log(`\n✅ Scheduler completado exitosamente\n`);

        } catch (error) {
            console.error('\n❌ ERROR en scheduler de torneos:', error.message);
            console.error('Stack:', error.stack);
        } finally {
            if (client) client.release();
        }
    });

    console.log('\n⏰ ========================================');
    console.log('   SCHEDULER DE TORNEOS INICIADO');
    console.log('⏰ ========================================');
    console.log('📅 Frecuencia: Cada 5 minutos (MODO PRUEBAS)');
    console.log('⚠️  RECORDAR: Cambiar a cada hora en producción');
    console.log('🔄 Transiciones automáticas:');
    console.log('   • abierto → cerrado (inscripciones)');
    console.log('   • cerrado → en_curso (inicio torneo)');
    console.log('   • en_curso → finalizado (fin torneo)');
    console.log('========================================\n');
}

/**
 * Notifica a administradores cuando se cierran inscripciones
 * para que generen el fixture manualmente
 */
async function notificarAdminsGenerarFixture(client, idTorneo, nombreTorneo) {
    try {
        // Obtener todos los usuarios con rol admin
        const admins = await client.query(`
            SELECT uid FROM usuarios WHERE id_rol = 1
        `);

        for (const { uid } of admins.rows) {
            await client.query(`
                INSERT INTO notificaciones (
                    uid_usuario, 
                    asunto, 
                    descripcion, 
                    tipo, 
                    origen, 
                    prioridad, 
                    url_accion
                ) VALUES ($1, $2, $3, 'warning', 'sistema_torneos', 'alta', $4)
            `, [
                uid,
                '⚠️ Generar Fixture de Torneo',
                `Las inscripciones del torneo "${nombreTorneo}" han cerrado. Debes generar el fixture manualmente antes de que inicie.`,
                `/admin/torneos/${idTorneo}`
            ]);
        }
        
        console.log(`      📧 Notificación enviada a ${admins.rows.length} admin(s)`);
    } catch (error) {
        console.error(`      ❌ Error notificando admins: ${error.message}`);
    }
}

/**
 * Notifica a participantes cuando el torneo inicia
 */
async function notificarInicioTorneo(client, idTorneo, nombreTorneo) {
    try {
        // Obtener capitanes de equipos inscritos y aprobados
        const participantes = await client.query(`
            SELECT DISTINCT u.uid as uid_usuario
            FROM inscripciones_torneo it
            INNER JOIN equipos e ON it.id_equipo = e.id_equipo
            INNER JOIN usuarios u ON e.id_capitan = u.id_user
            WHERE it.id_torneo = $1
            AND it.aprobado = true
            AND it.estado = 'inscrito'
        `, [idTorneo]);

        let notificacionesEnviadas = 0;
        for (const { uid_usuario } of participantes.rows) {
            await client.query(`
                INSERT INTO notificaciones (
                    uid_usuario, 
                    asunto, 
                    descripcion, 
                    tipo, 
                    origen, 
                    prioridad, 
                    url_accion
                ) VALUES ($1, $2, $3, 'success', 'sistema_torneos', 'alta', $4)
            `, [
                uid_usuario,
                '🏆 ¡El torneo ha comenzado!',
                `El torneo "${nombreTorneo}" ya está en curso. Revisa tu calendario de partidos y prepárate para competir. ¡Buena suerte!`,
                '/dashboard-torneo'
            ]);
            notificacionesEnviadas++;
        }
        
        console.log(`      📧 ${notificacionesEnviadas} notificaciones enviadas a participantes`);
    } catch (error) {
        console.error(`      ❌ Error notificando inicio: ${error.message}`);
    }
}

/**
 * Notifica a participantes cuando el torneo finaliza
 */
async function notificarFinTorneo(client, idTorneo, nombreTorneo) {
    try {
        // Obtener todos los participantes (incluso eliminados, para que vean resultado)
        const participantes = await client.query(`
            SELECT DISTINCT u.uid as uid_usuario
            FROM inscripciones_torneo it
            INNER JOIN equipos e ON it.id_equipo = e.id_equipo
            INNER JOIN usuarios u ON e.id_capitan = u.id_user
            WHERE it.id_torneo = $1
            AND it.aprobado = true
        `, [idTorneo]);

        let notificacionesEnviadas = 0;
        for (const { uid_usuario } of participantes.rows) {
            await client.query(`
                INSERT INTO notificaciones (
                    uid_usuario, 
                    asunto, 
                    descripcion, 
                    tipo, 
                    origen, 
                    prioridad, 
                    url_accion
                ) VALUES ($1, $2, $3, 'info', 'sistema_torneos', 'normal', $4)
            `, [
                uid_usuario,
                '🏁 Torneo Finalizado',
                `El torneo "${nombreTorneo}" ha finalizado. Revisa la clasificación final y las estadísticas completas.`,
                '/dashboard-torneo/inscripciones'
            ]);
            notificacionesEnviadas++;
        }
        
        console.log(`      📧 ${notificacionesEnviadas} notificaciones enviadas a participantes`);
    } catch (error) {
        console.error(`      ❌ Error notificando fin: ${error.message}`);
    }
}
