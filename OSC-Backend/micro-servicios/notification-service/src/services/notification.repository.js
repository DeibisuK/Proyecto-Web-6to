// ============================================
// NOTIFICATION REPOSITORY - Queries SQL
// ============================================

import pool from '../config/db.js';

export class NotificationRepository {
  
  // Obtener notificaciones de un usuario (incluye notificaciones regulares y anuncios globales)
  async getNotifications({ uid, leida, origen, limit = 50, offset = 0 }) {
    // UNION de notificaciones regulares y anuncios globales
    let query = `
      SELECT * FROM (
        -- Notificaciones regulares
        SELECT 
          id_notificacion,
          uid_usuario,
          asunto,
          descripcion,
          tipo,
          leida,
          fecha_creacion,
          fecha_leida,
          origen,
          id_referencia,
          url_accion,
          prioridad
        FROM notificaciones
        WHERE uid_usuario = $1
        
        UNION ALL
        
        -- Anuncios globales (se muestran como notificaciones)
        SELECT 
          a.id_anuncio as id_notificacion,
          $1 as uid_usuario,
          a.titulo as asunto,
          a.descripcion,
          a.tipo,
          CASE 
            WHEN nal.id_anuncio IS NOT NULL THEN true 
            ELSE false 
          END as leida,
          a.fecha_creacion,
          NULL as fecha_leida,
          'anuncio_global' as origen,
          a.id_anuncio as id_referencia,
          NULL as url_accion,
          'normal' as prioridad
        FROM anuncios_globales a
        LEFT JOIN notificaciones_anuncios_leidas nal 
          ON a.id_anuncio = nal.id_anuncio AND nal.uid_usuario = $1
        WHERE a.activo = true
          AND (a.fecha_inicio IS NULL OR a.fecha_inicio <= CURRENT_TIMESTAMP)
          AND (a.fecha_fin IS NULL OR a.fecha_fin >= CURRENT_TIMESTAMP)
      ) AS combined_notifications
      WHERE 1=1
    `;
    
    const params = [uid];
    let paramIndex = 2;
    
    // Filtro por leída
    if (leida !== undefined) {
      query += ` AND leida = $${paramIndex}`;
      params.push(leida);
      paramIndex++;
    }
    
    // Filtro por origen (permite filtrar solo notificaciones o solo anuncios)
    if (origen) {
      query += ` AND origen = $${paramIndex}`;
      params.push(origen);
      paramIndex++;
    }
    
    query += ` ORDER BY fecha_creacion DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    return result.rows;
  }
  
  // Obtener contador de no leídas (incluye notificaciones y anuncios)
  async getUnreadCount(uid) {
    const result = await pool.query(`
      SELECT COUNT(*) as unread FROM (
        -- Notificaciones regulares no leídas
        SELECT id_notificacion 
        FROM notificaciones 
        WHERE uid_usuario = $1 AND leida = false
        
        UNION ALL
        
        -- Anuncios globales no leídos
        SELECT a.id_anuncio
        FROM anuncios_globales a
        LEFT JOIN notificaciones_anuncios_leidas nal 
          ON a.id_anuncio = nal.id_anuncio AND nal.uid_usuario = $1
        WHERE a.activo = true
          AND (a.fecha_inicio IS NULL OR a.fecha_inicio <= CURRENT_TIMESTAMP)
          AND (a.fecha_fin IS NULL OR a.fecha_fin >= CURRENT_TIMESTAMP)
          AND nal.id_anuncio IS NULL
      ) AS unread_items
    `, [uid]);
    
    return parseInt(result.rows[0].unread);
  }
  
  // Crear notificación
  async createNotification(notification) {
    const result = await pool.query(`
      INSERT INTO notificaciones (
        uid_usuario, asunto, descripcion, tipo, origen, 
        id_referencia, url_accion, prioridad
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      notification.uid_usuario,
      notification.asunto,
      notification.descripcion,
      notification.tipo || 'info',
      notification.origen || 'sistema',
      notification.id_referencia || null,
      notification.url_accion || null,
      notification.prioridad || 'normal'
    ]);
    
    return result.rows[0];
  }
  
  // Marcar como leída (maneja tanto notificaciones como anuncios)
  async markAsRead(id_notificacion, uid) {
    // Primero intentar marcar como leída en notificaciones regulares
    let result = await pool.query(`
      UPDATE notificaciones 
      SET leida = true, fecha_leida = CURRENT_TIMESTAMP
      WHERE id_notificacion = $1 AND uid_usuario = $2
      RETURNING *
    `, [id_notificacion, uid]);
    
    // Si no se encontró en notificaciones, es un anuncio global
    if (result.rows.length === 0) {
      // Marcar anuncio como leído
      await pool.query(`
        INSERT INTO notificaciones_anuncios_leidas (uid_usuario, id_anuncio)
        VALUES ($1, $2)
        ON CONFLICT (uid_usuario, id_anuncio) DO NOTHING
      `, [uid, id_notificacion]);
      
      // Devolver el anuncio con formato de notificación
      result = await pool.query(`
        SELECT 
          id_anuncio as id_notificacion,
          $1 as uid_usuario,
          titulo as asunto,
          descripcion,
          tipo,
          true as leida,
          fecha_creacion,
          CURRENT_TIMESTAMP as fecha_leida,
          'anuncio_global' as origen,
          id_anuncio as id_referencia,
          NULL as url_accion,
          'normal' as prioridad
        FROM anuncios_globales
        WHERE id_anuncio = $2
      `, [uid, id_notificacion]);
    }
    
    return result.rows[0];
  }
  
  // Marcar todas como leídas
  async markAllAsRead(uid) {
    const result = await pool.query(`
      UPDATE notificaciones 
      SET leida = true, fecha_leida = CURRENT_TIMESTAMP
      WHERE uid_usuario = $1 AND leida = false
    `, [uid]);
    
    return result.rowCount;
  }
  
  // Eliminar notificación
  async deleteNotification(id_notificacion, uid) {
    const result = await pool.query(
      'DELETE FROM notificaciones WHERE id_notificacion = $1 AND uid_usuario = $2',
      [id_notificacion, uid]
    );
    
    return result.rowCount > 0;
  }
  
  // Eliminar todas las leídas
  async deleteAllRead(uid) {
    const result = await pool.query(
      'DELETE FROM notificaciones WHERE uid_usuario = $1 AND leida = true',
      [uid]
    );
    
    return result.rowCount;
  }

  // ============================================
  // ANUNCIOS GLOBALES
  // ============================================

  // Crear anuncio global
  async createAnuncio(anuncio) {
    const result = await pool.query(`
      INSERT INTO anuncios_globales (
        titulo, descripcion, tipo, activo, fecha_inicio, fecha_fin
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      anuncio.titulo,
      anuncio.descripcion,
      anuncio.tipo || 'info',
      anuncio.activo !== undefined ? anuncio.activo : true,
      anuncio.fecha_inicio || null,
      anuncio.fecha_fin || null
    ]);
    
    return result.rows[0];
  }

  // Obtener anuncios activos
  async getAnunciosActivos() {
    const result = await pool.query(`
      SELECT 
        id_anuncio,
        titulo,
        descripcion,
        tipo,
        activo,
        fecha_creacion,
        fecha_inicio,
        fecha_fin
      FROM anuncios_globales
      WHERE activo = true
        AND (fecha_inicio IS NULL OR fecha_inicio <= CURRENT_TIMESTAMP)
        AND (fecha_fin IS NULL OR fecha_fin >= CURRENT_TIMESTAMP)
      ORDER BY fecha_creacion DESC
    `);
    
    return result.rows;
  }

  // Obtener todos los anuncios (para admin)
  async getAllAnuncios() {
    const result = await pool.query(`
      SELECT 
        id_anuncio,
        titulo,
        descripcion,
        tipo,
        activo,
        fecha_creacion,
        fecha_inicio,
        fecha_fin
      FROM anuncios_globales
      ORDER BY fecha_creacion DESC
    `);
    
    return result.rows;
  }

  // Marcar anuncio como leído para un usuario
  async markAnuncioAsRead(id_anuncio, uid) {
    await pool.query(`
      INSERT INTO notificaciones_anuncios_leidas (uid_usuario, id_anuncio)
      VALUES ($1, $2)
      ON CONFLICT (uid_usuario, id_anuncio) DO NOTHING
    `, [uid, id_anuncio]);
    
    return true;
  }

  // Obtener anuncios no leídos para un usuario
  async getUnreadAnuncios(uid) {
    const result = await pool.query(`
      SELECT 
        a.id_anuncio,
        a.titulo,
        a.descripcion,
        a.tipo,
        a.fecha_creacion
      FROM anuncios_globales a
      LEFT JOIN notificaciones_anuncios_leidas nal 
        ON a.id_anuncio = nal.id_anuncio AND nal.uid_usuario = $1
      WHERE a.activo = true
        AND (a.fecha_inicio IS NULL OR a.fecha_inicio <= CURRENT_TIMESTAMP)
        AND (a.fecha_fin IS NULL OR a.fecha_fin >= CURRENT_TIMESTAMP)
        AND nal.id_anuncio IS NULL
      ORDER BY a.fecha_creacion DESC
    `, [uid]);
    
    return result.rows;
  }

  // Actualizar anuncio
  async updateAnuncio(id_anuncio, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.titulo !== undefined) {
      fields.push(`titulo = $${paramIndex}`);
      values.push(updates.titulo);
      paramIndex++;
    }
    if (updates.descripcion !== undefined) {
      fields.push(`descripcion = $${paramIndex}`);
      values.push(updates.descripcion);
      paramIndex++;
    }
    if (updates.tipo !== undefined) {
      fields.push(`tipo = $${paramIndex}`);
      values.push(updates.tipo);
      paramIndex++;
    }
    if (updates.activo !== undefined) {
      fields.push(`activo = $${paramIndex}`);
      values.push(updates.activo);
      paramIndex++;
    }

    if (fields.length === 0) return null;

    values.push(id_anuncio);
    
    const result = await pool.query(`
      UPDATE anuncios_globales 
      SET ${fields.join(', ')}
      WHERE id_anuncio = $${paramIndex}
      RETURNING *
    `, values);
    
    return result.rows[0];
  }

  // Eliminar anuncio
  async deleteAnuncio(id_anuncio) {
    const result = await pool.query(
      'DELETE FROM anuncios_globales WHERE id_anuncio = $1',
      [id_anuncio]
    );
    
    return result.rowCount > 0;
  }
}
