-- ============================================
-- QUERIES DE PRUEBA: NOTIFICACIONES AUTOMÁTICAS
-- ============================================
-- Ejecuta estas queries para ver qué notificaciones se generarían

-- 1. SUSCRIPCIONES QUE VENCEN EN 7 DÍAS
SELECT 
  s.id_suscripcion,
  u.uid,
  u.email,
  u.nombre_completo,
  p.nombre AS plan_nombre,
  s.fecha_fin,
  EXTRACT(DAY FROM (s.fecha_fin - CURRENT_DATE)) AS dias_restantes
FROM suscripciones s
JOIN usuarios u ON s.uid = u.uid
JOIN planes p ON s.id_plan = p.id_plan
WHERE s.fecha_fin BETWEEN CURRENT_DATE + INTERVAL '6 days' AND CURRENT_DATE + INTERVAL '7 days'
  AND s.estado = 'activa';

-- 2. SUSCRIPCIONES QUE VENCEN EN 24 HORAS
SELECT 
  s.id_suscripcion,
  u.uid,
  u.email,
  p.nombre AS plan_nombre,
  s.fecha_fin,
  EXTRACT(HOUR FROM (s.fecha_fin - CURRENT_TIMESTAMP)) AS horas_restantes
FROM suscripciones s
JOIN usuarios u ON s.uid = u.uid
JOIN planes p ON s.id_plan = p.id_plan
WHERE s.fecha_fin BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '24 hours'
  AND s.estado = 'activa';

-- 3. TORNEOS QUE EMPIEZAN EN 3 DÍAS
SELECT 
  t.id_torneo,
  t.nombre,
  t.fecha_inicio,
  COUNT(DISTINCT te.id_equipo) AS equipos_inscritos,
  u.uid AS uid_capitan,
  u.email,
  e.nombre_equipo
FROM torneos t
JOIN torneos_equipos te ON t.id_torneo = te.id_torneo
JOIN equipos e ON te.id_equipo = e.id_equipo
JOIN usuarios u ON e.id_capitan = u.uid
WHERE t.fecha_inicio = CURRENT_DATE + INTERVAL '3 days'
  AND t.estado = 'abierto'
GROUP BY t.id_torneo, t.nombre, t.fecha_inicio, u.uid, u.email, e.nombre_equipo;

-- 4. TORNEOS QUE EMPIEZAN MAÑANA
SELECT 
  t.id_torneo,
  t.nombre,
  t.fecha_inicio,
  u.uid AS uid_capitan,
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
  AND t.estado IN ('abierto', 'en_curso');

-- 5. RESERVAS EN LAS PRÓXIMAS 24 HORAS (sin notificación enviada)
SELECT 
  r.id_reserva,
  u.uid,
  u.email,
  c.nombre_cancha,
  r.fecha_reserva,
  r.hora_inicio,
  r.hora_fin,
  EXTRACT(HOUR FROM (r.fecha_reserva + r.hora_inicio - CURRENT_TIMESTAMP)) AS horas_hasta_reserva
FROM reservas r
JOIN usuarios u ON r.uid_cliente = u.uid
JOIN canchas c ON r.id_cancha = c.id_cancha
WHERE r.fecha_reserva + r.hora_inicio BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '24 hours'
  AND r.estado = 'confirmada'
  AND NOT EXISTS (
    SELECT 1 FROM notificaciones n
    WHERE n.uid_usuario = u.uid
      AND n.origen = 'reserva'
      AND n.id_referencia = r.id_reserva
      AND n.asunto LIKE '%Recordatorio%'
  );

-- 6. PARTIDOS PARA ÁRBITROS EN LAS PRÓXIMAS 2 HORAS
SELECT 
  p.id_partido,
  t.id_arbitro,
  u.email AS arbitro_email,
  t.nombre AS torneo_nombre,
  p.fecha_partido,
  p.hora_inicio,
  c.nombre_cancha,
  EXTRACT(MINUTE FROM (p.fecha_partido + p.hora_inicio - CURRENT_TIMESTAMP)) AS minutos_hasta_partido
FROM partidos_torneo p
JOIN torneos t ON p.id_torneo = t.id_torneo
JOIN canchas c ON p.id_cancha = c.id_cancha
LEFT JOIN usuarios u ON t.id_arbitro = u.uid
WHERE p.fecha_partido = CURRENT_DATE
  AND p.hora_inicio BETWEEN CURRENT_TIME AND CURRENT_TIME + INTERVAL '2 hours'
  AND p.estado_partido = 'programado'
  AND t.id_arbitro IS NOT NULL;

-- 7. PEDIDOS CON PAGO PENDIENTE MÁS DE 48 HORAS
SELECT 
  pe.id_pedido,
  u.uid,
  u.email,
  pe.total,
  pe.estado_pago,
  pe.fecha_pedido,
  EXTRACT(HOUR FROM (CURRENT_TIMESTAMP - pe.fecha_pedido)) AS horas_pendiente
FROM pedidos pe
JOIN usuarios u ON pe.uid = u.uid
WHERE pe.estado_pago = 'pendiente'
  AND pe.fecha_pedido < CURRENT_TIMESTAMP - INTERVAL '48 hours'
  AND pe.estado_pedido != 'cancelado';

-- 8. EQUIPOS CON POCOS JUGADORES (menos de mínimo requerido)
SELECT 
  e.id_equipo,
  e.nombre_equipo,
  u.uid AS uid_capitan,
  u.email,
  COUNT(ej.uid) AS jugadores_actuales,
  5 AS jugadores_minimos, -- Ajustar según deporte
  (5 - COUNT(ej.uid)) AS jugadores_faltantes
FROM equipos e
JOIN usuarios u ON e.id_capitan = u.uid
LEFT JOIN equipos_jugadores ej ON e.id_equipo = ej.id_equipo AND ej.estado = 'activo'
WHERE e.estado = 'activo'
GROUP BY e.id_equipo, e.nombre_equipo, u.uid, u.email
HAVING COUNT(ej.uid) < 5;

-- 9. TORNEOS CON POCOS EQUIPOS INSCRITOS (menos de la mitad del máximo)
SELECT 
  t.id_torneo,
  t.nombre,
  t.fecha_inicio,
  t.max_equipos,
  COUNT(te.id_equipo) AS equipos_inscritos,
  (t.max_equipos - COUNT(te.id_equipo)) AS cupos_disponibles,
  EXTRACT(DAY FROM (t.fecha_inicio - CURRENT_DATE)) AS dias_hasta_inicio
FROM torneos t
LEFT JOIN torneos_equipos te ON t.id_torneo = te.id_torneo
WHERE t.estado = 'abierto'
  AND t.fecha_inicio > CURRENT_DATE
  AND t.fecha_inicio < CURRENT_DATE + INTERVAL '10 days'
GROUP BY t.id_torneo, t.nombre, t.fecha_inicio, t.max_equipos
HAVING COUNT(te.id_equipo) < (t.max_equipos / 2);

-- 10. PRODUCTOS CON STOCK BAJO
SELECT 
  p.id_producto,
  p.nombre,
  p.stock,
  p.stock_minimo,
  (p.stock_minimo - p.stock) AS unidades_faltantes
FROM productos p
WHERE p.stock <= p.stock_minimo
  AND p.estado = 'activo';

-- ============================================
-- FUNCIÓN AUXILIAR: Insertar notificación
-- ============================================

CREATE OR REPLACE FUNCTION crear_notificacion(
  p_uid_usuario TEXT,
  p_asunto VARCHAR,
  p_descripcion TEXT,
  p_tipo VARCHAR,
  p_origen VARCHAR,
  p_id_referencia INTEGER DEFAULT NULL,
  p_url_accion VARCHAR DEFAULT NULL,
  p_prioridad VARCHAR DEFAULT 'normal'
)
RETURNS INTEGER AS $$
DECLARE
  v_id_notificacion INTEGER;
BEGIN
  INSERT INTO notificaciones (
    uid_usuario, asunto, descripcion, tipo, origen, 
    id_referencia, url_accion, prioridad
  ) VALUES (
    p_uid_usuario, p_asunto, p_descripcion, p_tipo, p_origen,
    p_id_referencia, p_url_accion, p_prioridad
  ) RETURNING id_notificacion INTO v_id_notificacion;
  
  RETURN v_id_notificacion;
END;
$$ LANGUAGE plpgsql;

-- Ejemplo de uso:
-- SELECT crear_notificacion(
--   'uid_usuario',
--   'Título',
--   'Descripción',
--   'info',
--   'sistema'
-- );
