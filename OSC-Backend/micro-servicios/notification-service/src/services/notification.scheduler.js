// ============================================
// SCHEDULER: NOTIFICACIONES AUTOMÁTICAS - VERSIÓN SIMPLIFICADA
// ============================================

import cron from 'node-cron';
import pool from '../config/db.js';

// Previene pérdida de ingresos por suscripciones vencidas
// Ejecuta diario a las 10:00 AM
cron.schedule('0 10 * * *', async () => {
  console.log('🔔 [CRON] Verificando suscripciones próximas a vencer...');
  
  try {
    // Suscripciones que vencen en 7 días
    const subs7Dias = await pool.query(`
      SELECT 
        s.id_suscripcion,
        u.uid,
        u.nombre_completo,
        p.nombre AS plan_nombre,
        s.fecha_fin
      FROM suscripciones s
      JOIN usuarios u ON s.uid = u.uid
      JOIN planes p ON s.id_plan = p.id_plan
      WHERE s.fecha_fin BETWEEN CURRENT_DATE + INTERVAL '6 days' AND CURRENT_DATE + INTERVAL '7 days'
        AND s.estado = 'activa'
        AND NOT EXISTS (
          SELECT 1 FROM notificaciones n
          WHERE n.uid_usuario = u.uid
            AND n.origen = 'suscripcion'
            AND n.id_referencia = s.id_suscripcion
            AND n.asunto LIKE '%7 días%'
            AND n.fecha_creacion::date = CURRENT_DATE
        )
    `);
    
    for (const sub of subs7Dias.rows) {
      await pool.query(`
        INSERT INTO notificaciones (uid_usuario, asunto, descripcion, tipo, origen, id_referencia, prioridad, url_accion)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        sub.uid,
        `⏳ Tu suscripción ${sub.plan_nombre} vence en 7 días`,
        `Hola ${sub.nombre_completo}, renueva tu suscripción antes del ${new Date(sub.fecha_fin).toLocaleDateString('es-ES')} para mantener todos los beneficios y descuentos exclusivos.`,
        'warning',
        'suscripcion',
        sub.id_suscripcion,
        'alta',
        '/metodos-de-pago'
      ]);
    }
    
    console.log(`✅ [CRON] ${subs7Dias.rows.length} notificaciones de suscripción (7 días) enviadas`);
    
    // Suscripciones que vencen en 24 horas - URGENTE
    const subs1Dia = await pool.query(`
      SELECT 
        s.id_suscripcion,
        u.uid,
        u.nombre_completo,
        p.nombre AS plan_nombre,
        s.fecha_fin
      FROM suscripciones s
      JOIN usuarios u ON s.uid = u.uid
      JOIN planes p ON s.id_plan = p.id_plan
      WHERE s.fecha_fin BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '24 hours'
        AND s.estado = 'activa'
        AND NOT EXISTS (
          SELECT 1 FROM notificaciones n
          WHERE n.uid_usuario = u.uid
            AND n.origen = 'suscripcion'
            AND n.id_referencia = s.id_suscripcion
            AND n.asunto LIKE '%mañana%'
            AND n.fecha_creacion::date = CURRENT_DATE
        )
    `);
    
    for (const sub of subs1Dia.rows) {
      await pool.query(`
        INSERT INTO notificaciones (uid_usuario, asunto, descripcion, tipo, origen, id_referencia, prioridad, url_accion)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        sub.uid,
        `⚠️ ¡Tu suscripción ${sub.plan_nombre} vence mañana!`,
        `${sub.nombre_completo}, renueva ahora para evitar perder acceso a torneos, descuentos en productos y todas las funcionalidades premium.`,
        'error',
        'suscripcion',
        sub.id_suscripcion,
        'urgente',
        '/metodos-de-pago'
      ]);
    }
    
    console.log(`✅ [CRON] ${subs1Dia.rows.length} notificaciones de suscripción (24h) enviadas`);
    
  } catch (error) {
    console.error('❌ [CRON] Error en notificaciones de suscripción:', error);
  }
});

// NOTIFICACIONES DE TOR
// Ejecuta diario a las 9:00 AM
cron.schedule('0 9 * * *', async () => {
  console.log('🔔 [CRON] Verificando torneos próximos...');
  
  try {
    // Torneos que empiezan en 3 días
    const torneos3Dias = await pool.query(`
      SELECT DISTINCT
        t.id_torneo,
        t.nombre AS torneo_nombre,
        t.fecha_inicio,
        u.uid AS uid_capitan,
        u.nombre_completo,
        e.nombre_equipo
      FROM torneos t
      JOIN torneos_equipos te ON t.id_torneo = te.id_torneo
      JOIN equipos e ON te.id_equipo = e.id_equipo
      JOIN usuarios u ON e.id_capitan = u.uid
      WHERE t.fecha_inicio = CURRENT_DATE + INTERVAL '3 days'
        AND t.estado IN ('abierto', 'proximo')
    `);
    
    for (const torneo of torneos3Dias.rows) {
      const existe = await pool.query(`
        SELECT 1 FROM notificaciones 
        WHERE uid_usuario = $1 
          AND origen = 'torneo' 
          AND id_referencia = $2 
          AND asunto LIKE '%3 días%'
      `, [torneo.uid_capitan, torneo.id_torneo]);
      
      if (existe.rows.length === 0) {
        await pool.query(`
          INSERT INTO notificaciones (uid_usuario, asunto, descripcion, tipo, origen, id_referencia, prioridad, url_accion)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          torneo.uid_capitan,
          `⚽ El torneo "${torneo.torneo_nombre}" empieza en 3 días`,
          `${torneo.nombre_completo}, prepara a tu equipo "${torneo.nombre_equipo}". Revisa el calendario de partidos, horarios y confirma la asistencia de todos los jugadores.`,
          'warning',
          'torneo',
          torneo.id_torneo,
          'alta',
          `/dashboard-torneo?id=${torneo.id_torneo}`
        ]);
      }
    }
    
    console.log(`✅ [CRON] ${torneos3Dias.rows.length} notificaciones de torneo (3 días) enviadas`);
    
    // Torneos que empiezan mañana
    const torneo1Dia = await pool.query(`
      SELECT DISTINCT
        t.id_torneo,
        t.nombre AS torneo_nombre,
        t.fecha_inicio,
        u.uid AS uid_capitan,
        u.nombre_completo,
        e.nombre_equipo,
        p.fecha_partido,
        p.hora_inicio,
        c.nombre_cancha
      FROM torneos t
      JOIN torneos_equipos te ON t.id_torneo = te.id_torneo
      JOIN equipos e ON te.id_equipo = e.id_equipo
      JOIN usuarios u ON e.id_capitan = u.uid
      LEFT JOIN partidos_torneo p ON t.id_torneo = p.id_torneo 
        AND (p.id_equipo_local = e.id_equipo OR p.id_equipo_visitante = e.id_equipo)
        AND p.fecha_partido = CURRENT_DATE + INTERVAL '1 day'
      LEFT JOIN canchas c ON p.id_cancha = c.id_cancha
      WHERE t.fecha_inicio = CURRENT_DATE + INTERVAL '1 day'
        AND t.estado IN ('abierto', 'proximo')
    `);
    
    for (const torneo of torneo1Dia.rows) {
      const existe = await pool.query(`
        SELECT 1 FROM notificaciones 
        WHERE uid_usuario = $1 
          AND origen = 'torneo' 
          AND id_referencia = $2 
          AND asunto LIKE '%mañana%'
      `, [torneo.uid_capitan, torneo.id_torneo]);
      
      if (existe.rows.length === 0) {
        const descripcion = torneo.hora_inicio 
          ? `${torneo.nombre_completo}, tu equipo "${torneo.nombre_equipo}" jugará mañana a las ${torneo.hora_inicio} en ${torneo.nombre_cancha}. ¡Prepárate para la victoria!`
          : `${torneo.nombre_completo}, el torneo "${torneo.torneo_nombre}" comienza mañana. Revisa el calendario de partidos para confirmar horarios.`;
        
        await pool.query(`
          INSERT INTO notificaciones (uid_usuario, asunto, descripcion, tipo, origen, id_referencia, prioridad, url_accion)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          torneo.uid_capitan,
          `🏆 Torneo "${torneo.torneo_nombre}" empieza mañana`,
          descripcion,
          'info',
          'torneo',
          torneo.id_torneo,
          'alta',
          `/dashboard-torneo?id=${torneo.id_torneo}`
        ]);
      }
    }
    
    console.log(`✅ [CRON] ${torneo1Dia.rows.length} notificaciones de torneo (mañana) enviadas`);
    
  } catch (error) {
    console.error('❌ [CRON] Error en notificaciones de torneos:', error);
  }
});

// Árbitros nunca olvidan sus partidos

// Ejecuta cada hora
cron.schedule('0 * * * *', async () => {
  console.log('🔔 [CRON] Verificando partidos de árbitros próximos...');
  
  try {
    const partidos = await pool.query(`
      SELECT 
        p.id_partido,
        p.id_arbitro,
        u.name_user AS arbitro_nombre,
        t.nombre AS torneo_nombre,
        p.fecha_partido,
        p.hora_inicio,
        c.nombre_cancha,
        el.nombre_equipo AS equipo_local,
        ev.nombre_equipo AS equipo_visitante
      FROM partidos_torneo p
      JOIN torneos t ON p.id_torneo = t.id_torneo
      JOIN canchas c ON p.id_cancha = c.id_cancha
      JOIN equipos el ON p.id_equipo_local = el.id_equipo
      JOIN equipos ev ON p.id_equipo_visitante = ev.id_equipo
      LEFT JOIN usuarios u ON p.id_arbitro = u.id_user
      WHERE p.fecha_partido = CURRENT_DATE
        AND p.hora_inicio BETWEEN CURRENT_TIME + INTERVAL '1 hour' 
                              AND CURRENT_TIME + INTERVAL '3 hours'
        AND p.estado_partido = 'programado'
        AND p.id_arbitro IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM notificaciones n
          WHERE n.uid_usuario = p.id_arbitro::text
            AND n.origen = 'partido'
            AND n.id_referencia = p.id_partido::text
            AND n.fecha_creacion::date = CURRENT_DATE
        )
    `);
    
    for (const partido of partidos.rows) {
      await pool.query(`
        INSERT INTO notificaciones (uid_usuario, asunto, descripcion, tipo, origen, id_referencia, prioridad, url_accion)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        partido.id_arbitro.toString(),
        `⏰ Partido en 2 horas`,
        `${partido.arbitro_nombre}, recuerda: arbitrarás el partido ${partido.equipo_local} vs ${partido.equipo_visitante} del torneo "${partido.torneo_nombre}" hoy a las ${partido.hora_inicio} en ${partido.nombre_cancha}.`,
        'warning',
        'partido',
        partido.id_partido.toString(),
        'alta',
        '/arbitro/panel'
      ]);
    }
    
    console.log(`✅ [CRON] ${partidos.rows.length} recordatorios para árbitros enviados`);
    
  } catch (error) {
    console.error('❌ [CRON] Error en recordatorios de árbitros:', error);
  }
});

// Recupera ventas de carritos olvidados
// Ejecuta diario a las 18:00 (6:00 PM)
cron.schedule('0 18 * * *', async () => {
  console.log('🔔 [CRON] Verificando carritos abandonados...');
  
  try {
    // Buscar usuarios con items en carrito por más de 24 horas
    const carritos = await pool.query(`
      SELECT DISTINCT
        c.uid,
        u.nombre_completo,
        COUNT(c.id_item) AS items_count,
        SUM(p.precio * c.cantidad) AS total_carrito,
        MIN(c.fecha_agregado) AS primera_fecha
      FROM carrito c
      JOIN usuarios u ON c.uid = u.uid
      JOIN productos p ON c.id_producto = p.id_producto
      WHERE c.fecha_agregado < CURRENT_TIMESTAMP - INTERVAL '24 hours'
        AND NOT EXISTS (
          SELECT 1 FROM notificaciones n
          WHERE n.uid_usuario = c.uid
            AND n.origen = 'carrito'
            AND n.fecha_creacion > CURRENT_TIMESTAMP - INTERVAL '48 hours'
        )
      GROUP BY c.uid, u.nombre_completo
      HAVING COUNT(c.id_item) > 0
    `);
    
    for (const carrito of carritos.rows) {
      const dias = Math.floor((Date.now() - new Date(carrito.primera_fecha)) / (1000 * 60 * 60 * 24));
      
      await pool.query(`
        INSERT INTO notificaciones (uid_usuario, asunto, descripcion, tipo, origen, prioridad, url_accion)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        carrito.uid,
        `🛒 ¡Tu carrito te espera!`,
        `${carrito.nombre_completo}, tienes ${carrito.items_count} productos esperándote en tu carrito por un total de $${carrito.total_carrito.toFixed(2)}. ¡No dejes pasar esta oportunidad!`,
        'info',
        'carrito',
        'normal',
        '/tienda/carrito'
      ]);
    }
    
    console.log(`✅ [CRON] ${carritos.rows.length} recordatorios de carrito enviados`);
    
  } catch (error) {
    console.error('❌ [CRON] Error en recordatorios de carrito:', error);
  }
});


// ÚTIL: Mantiene al usuario informado del proceso
// Función auxiliar: Crear notificación de cambio de estado
export async function notificarCambioPedido(id_pedido, nuevo_estado) {
  try {
    const pedido = await pool.query(`
      SELECT p.*, u.uid, u.nombre_completo
      FROM pedidos p
      JOIN usuarios u ON p.uid = u.uid
      WHERE p.id_pedido = $1
    `, [id_pedido]);
    
    if (pedido.rows.length === 0) return;
    
    const ped = pedido.rows[0];
    let asunto, descripcion, tipo;
    
    switch (nuevo_estado) {
      case 'confirmado':
        asunto = `✅ Pedido confirmado #${id_pedido}`;
        descripcion = `${ped.nombre_completo}, tu pedido ha sido confirmado. Total: $${ped.total}. Estamos preparando tu envío.`;
        tipo = 'success';
        break;
      
      case 'en_preparacion':
        asunto = `📦 Preparando tu pedido #${id_pedido}`;
        descripcion = `${ped.nombre_completo}, estamos empacando tu pedido. Pronto estará listo para envío.`;
        tipo = 'info';
        break;
      
      case 'enviado':
        asunto = `🚚 Pedido enviado #${id_pedido}`;
        descripcion = `${ped.nombre_completo}, tu pedido está en camino. Recibirás el código de rastreo por email.`;
        tipo = 'info';
        break;
      
      case 'entregado':
        asunto = `🎉 Pedido entregado #${id_pedido}`;
        descripcion = `${ped.nombre_completo}, tu pedido ha sido entregado exitosamente. ¡Gracias por tu compra!`;
        tipo = 'success';
        break;
      
      case 'cancelado':
        asunto = `❌ Pedido cancelado #${id_pedido}`;
        descripcion = `${ped.nombre_completo}, tu pedido ha sido cancelado. Si pagaste, el reembolso se procesará en 3-5 días hábiles.`;
        tipo = 'warning';
        break;
      
      default:
        return;
    }
    
    await pool.query(`
      INSERT INTO notificaciones (uid_usuario, asunto, descripcion, tipo, origen, id_referencia, url_accion)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [ped.uid, asunto, descripcion, tipo, 'pedido', id_pedido, '/mis-pedidos']);
    
    console.log(`✅ Notificación de pedido #${id_pedido} (${nuevo_estado}) enviada`);
    
  } catch (error) {
    console.error('❌ Error al notificar cambio de pedido:', error);
  }
}

// LIMPIEZA DE NOTIFICACIONES ANTIGUAS

// Ejecuta cada domingo a las 3:00 AM
cron.schedule('0 3 * * 0', async () => {
  console.log('🧹 [CRON] Limpiando notificaciones antiguas...');
  
  try {
    // Eliminar notificaciones leídas de más de 30 días
    const result = await pool.query(`
      DELETE FROM notificaciones
      WHERE leida = true
        AND fecha_creacion < CURRENT_TIMESTAMP - INTERVAL '30 days'
    `);
    
    console.log(`✅ [CRON] ${result.rowCount} notificaciones antiguas eliminadas`);
    
  } catch (error) {
    console.error('❌ [CRON] Error en limpieza de notificaciones:', error);
  }
});

// ============================================
// RESUMEN DE CRON JOBS ACTIVOS
// ============================================
console.log('✅ Scheduler de notificaciones iniciado');
console.log('📅 Cron jobs activos:');
console.log('     Suscripciones: Diario 10:00 AM (Crítico)');
console.log('     Torneos: Diario 9:00 AM (Importante)');
console.log('     Árbitros: Cada hora (Útil)');
console.log('     Carrito abandonado: Diario 6:00 PM (Recupera ventas)');
console.log('     Pedidos: Manual via notificarCambioPedido()');
console.log('   🧹   Limpieza: Domingos 3:00 AM (Mantenimiento)');

export default { notificarCambioPedido };
