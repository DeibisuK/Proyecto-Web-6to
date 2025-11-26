-- ================================================================
-- MIGRACIÓN OPTIMIZADA - Sistema Universal de Torneos Multi-Deporte
-- Elimina tablas redundantes y crea estructura limpia
-- ================================================================

-- ================================================================
-- PASO 1: ELIMINAR TABLAS REDUNDANTES/OBSOLETAS
-- ================================================================

-- Tablas que serán reemplazadas por versiones mejoradas
DROP TABLE IF EXISTS alineacion_jugadores CASCADE;
DROP TABLE IF EXISTS equipos_partido CASCADE;
DROP TABLE IF EXISTS eventos_arbitro CASCADE;
DROP TABLE IF EXISTS gestion_tiempo_partido CASCADE;
DROP TABLE IF EXISTS torneos_partidos CASCADE;

-- Tablas nuevas (eliminar si existen de intentos previos)
DROP TABLE IF EXISTS estado_partido_tiempo_real CASCADE;
DROP TABLE IF EXISTS eventos_partido CASCADE;
DROP TABLE IF EXISTS clasificacion_torneo CASCADE;
DROP TABLE IF EXISTS configuracion_eventos_deporte CASCADE;
DROP TABLE IF EXISTS alineaciones CASCADE;
DROP TABLE IF EXISTS jugadores CASCADE;

DO $$
BEGIN
  RAISE NOTICE '✓ Tablas obsoletas eliminadas';
END $$;


-- ================================================================
-- PASO 2: CREAR TABLA jugadores
-- ================================================================

CREATE TABLE jugadores (
  id_jugador SERIAL PRIMARY KEY,
  id_equipo INTEGER NOT NULL,
  id_usuario INTEGER, -- Vincular con usuarios si el jugador tiene cuenta
  nombre_completo VARCHAR(255) NOT NULL,
  numero_dorsal INTEGER,
  posicion VARCHAR(50), -- Universal: Delantero, Base, Derecha, etc.
  es_capitan BOOLEAN DEFAULT false,
  estado VARCHAR(20) DEFAULT 'activo',
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CHECK (numero_dorsal IS NULL OR numero_dorsal > 0),
  CHECK (estado IN ('activo', 'lesionado', 'suspendido', 'inactivo')),
  
  FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

CREATE INDEX idx_jugadores_equipo ON jugadores(id_equipo);
CREATE INDEX idx_jugadores_usuario ON jugadores(id_usuario);
CREATE INDEX idx_jugadores_estado ON jugadores(estado);

COMMENT ON TABLE jugadores IS 'Jugadores de equipos - universal para todos los deportes';
COMMENT ON COLUMN jugadores.posicion IS 'Posición genérica por deporte';

DO $$
BEGIN
  RAISE NOTICE '✓ Tabla jugadores creada';
END $$;


-- ================================================================
-- PASO 3: MODIFICAR partidos_torneo (agregar columnas necesarias)
-- ================================================================

DO $$
BEGIN
  -- Agregar columnas para torneos
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='partidos_torneo' AND column_name='id_torneo') THEN
    ALTER TABLE partidos_torneo ADD COLUMN id_torneo INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='partidos_torneo' AND column_name='id_fase') THEN
    ALTER TABLE partidos_torneo ADD COLUMN id_fase INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='partidos_torneo' AND column_name='id_grupo') THEN
    ALTER TABLE partidos_torneo ADD COLUMN id_grupo INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='partidos_torneo' AND column_name='id_equipo_local') THEN
    ALTER TABLE partidos_torneo ADD COLUMN id_equipo_local INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='partidos_torneo' AND column_name='id_equipo_visitante') THEN
    ALTER TABLE partidos_torneo ADD COLUMN id_equipo_visitante INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='partidos_torneo' AND column_name='resultado_local') THEN
    ALTER TABLE partidos_torneo ADD COLUMN resultado_local INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='partidos_torneo' AND column_name='resultado_visitante') THEN
    ALTER TABLE partidos_torneo ADD COLUMN resultado_visitante INTEGER DEFAULT 0;
  END IF;

  -- Renombrar fecha a fecha_partido si es necesario
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='partidos_torneo' AND column_name='fecha') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name='partidos_torneo' AND column_name='fecha_partido') THEN
    ALTER TABLE partidos_torneo RENAME COLUMN fecha TO fecha_partido;
  END IF;

  RAISE NOTICE '✓ Columnas agregadas a partidos_torneo';
END $$;

-- Agregar Foreign Keys
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'partidos_torneo_id_torneo_fkey') THEN
    ALTER TABLE partidos_torneo ADD CONSTRAINT partidos_torneo_id_torneo_fkey 
      FOREIGN KEY (id_torneo) REFERENCES torneos(id_torneo) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'partidos_torneo_id_fase_fkey') THEN
    ALTER TABLE partidos_torneo ADD CONSTRAINT partidos_torneo_id_fase_fkey 
      FOREIGN KEY (id_fase) REFERENCES fases_torneo(id_fase) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'partidos_torneo_id_grupo_fkey') THEN
    ALTER TABLE partidos_torneo ADD CONSTRAINT partidos_torneo_id_grupo_fkey 
      FOREIGN KEY (id_grupo) REFERENCES grupos_torneo(id_grupo) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'partidos_torneo_id_equipo_local_fkey') THEN
    ALTER TABLE partidos_torneo ADD CONSTRAINT partidos_torneo_id_equipo_local_fkey 
      FOREIGN KEY (id_equipo_local) REFERENCES equipos(id_equipo) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'partidos_torneo_id_equipo_visitante_fkey') THEN
    ALTER TABLE partidos_torneo ADD CONSTRAINT partidos_torneo_id_equipo_visitante_fkey 
      FOREIGN KEY (id_equipo_visitante) REFERENCES equipos(id_equipo) ON DELETE CASCADE;
  END IF;

  RAISE NOTICE '✓ Foreign Keys agregadas a partidos_torneo';
END $$;


-- ================================================================
-- PASO 4: CREAR configuracion_eventos_deporte
-- ================================================================

CREATE TABLE configuracion_eventos_deporte (
  id_config SERIAL PRIMARY KEY,
  id_deporte INTEGER NOT NULL,
  tipo_evento VARCHAR(50) NOT NULL,
  nombre_evento VARCHAR(100) NOT NULL,
  valor_puntos INTEGER DEFAULT 0,
  icono VARCHAR(50),
  color VARCHAR(20),
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  
  UNIQUE(id_deporte, tipo_evento),
  FOREIGN KEY (id_deporte) REFERENCES deportes(id_deporte) ON DELETE CASCADE
);

CREATE INDEX idx_config_eventos_deporte ON configuracion_eventos_deporte(id_deporte, activo);

-- Insertar configuración para cada deporte
INSERT INTO configuracion_eventos_deporte (id_deporte, tipo_evento, nombre_evento, valor_puntos, icono, color, orden) VALUES
  -- FÚTBOL
  (1, 'gol', 'Gol', 1, 'sports_soccer', 'green', 1),
  (1, 'penal', 'Penal', 1, 'adjust', 'green', 2),
  (1, 'autogol', 'Autogol', 0, 'sports_soccer', 'orange', 3),
  (1, 'tarjeta_amarilla', 'Tarjeta Amarilla', 0, 'square', 'yellow', 4),
  (1, 'tarjeta_roja', 'Tarjeta Roja', 0, 'square', 'red', 5),
  
  -- BALONCESTO
  (2, 'canasta_2pts', 'Canasta 2pts', 2, 'sports_basketball', 'orange', 1),
  (2, 'canasta_3pts', 'Triple', 3, 'sports_basketball', 'blue', 2),
  (2, 'tiro_libre', 'Tiro Libre', 1, 'sports_basketball', 'gray', 3),
  (2, 'falta_personal', 'Falta Personal', 0, 'pan_tool', 'yellow', 4),
  (2, 'falta_tecnica', 'Falta Técnica', 0, 'warning', 'red', 5),
  
  -- PADEL
  (3, 'punto', 'Punto', 1, 'sports_tennis', 'green', 1),
  (3, 'game', 'Game', 0, 'emoji_events', 'blue', 2),
  (3, 'set', 'Set', 0, 'military_tech', 'gold', 3),
  (3, 'doble_falta', 'Doble Falta', 0, 'close', 'red', 4),
  
  -- TENIS
  (4, 'punto', 'Punto', 1, 'sports_tennis', 'green', 1),
  (4, 'ace', 'Ace', 1, 'bolt', 'yellow', 2),
  (4, 'game', 'Game', 0, 'emoji_events', 'blue', 3),
  (4, 'set', 'Set', 0, 'military_tech', 'gold', 4),
  (4, 'doble_falta', 'Doble Falta', 0, 'close', 'red', 5);

DO $$
BEGIN
  RAISE NOTICE '✓ Tabla configuracion_eventos_deporte creada con datos iniciales';
END $$;


-- ================================================================
-- PASO 5: CREAR eventos_partido
-- ================================================================

CREATE TABLE eventos_partido (
  id_evento SERIAL PRIMARY KEY,
  id_partido INTEGER NOT NULL,
  id_equipo INTEGER,
  id_jugador INTEGER,
  
  -- Tipo de evento (UNIVERSAL)
  tipo_evento VARCHAR(50) NOT NULL,
  
  -- Tiempo del evento
  minuto INTEGER,
  segundo INTEGER,
  periodo VARCHAR(20), -- 1T, 2T, Q1, Q2, Set 1, etc.
  
  -- Puntos/Valor
  valor_numerico INTEGER DEFAULT 0,
  
  -- Detalles adicionales (JSON flexible)
  detalles JSONB,
  
  -- Observaciones del árbitro
  observacion TEXT,
  
  -- Registro
  registrado_por INTEGER,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CHECK (minuto IS NULL OR minuto >= 0),
  CHECK (valor_numerico >= 0),
  
  FOREIGN KEY (id_partido) REFERENCES partidos_torneo(id_partido) ON DELETE CASCADE,
  FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo) ON DELETE CASCADE,
  FOREIGN KEY (id_jugador) REFERENCES jugadores(id_jugador) ON DELETE CASCADE,
  FOREIGN KEY (registrado_por) REFERENCES usuarios(id_usuario)
);

CREATE INDEX idx_eventos_partido ON eventos_partido(id_partido, tipo_evento);
CREATE INDEX idx_eventos_jugador ON eventos_partido(id_jugador);
CREATE INDEX idx_eventos_equipo ON eventos_partido(id_equipo);
CREATE INDEX idx_eventos_fecha ON eventos_partido(fecha_registro);

COMMENT ON TABLE eventos_partido IS 'Eventos de partidos universal para todos los deportes';

DO $$
BEGIN
  RAISE NOTICE '✓ Tabla eventos_partido creada';
END $$;


-- ================================================================
-- PASO 6: CREAR estado_partido_tiempo_real
-- ================================================================

CREATE TABLE estado_partido_tiempo_real (
  id_estado SERIAL PRIMARY KEY,
  id_partido INTEGER NOT NULL UNIQUE,
  
  -- Control de tiempo
  tiempo_actual INTEGER DEFAULT 0, -- en segundos
  periodo_actual VARCHAR(20), -- 1T, 2T, Q1, etc.
  estado VARCHAR(20) DEFAULT 'detenido' CHECK (estado IN ('corriendo', 'detenido', 'pausado')),
  
  -- Puntuación detallada (JSON para flexibilidad)
  puntuacion_detallada JSONB,
  
  -- Última actualización
  ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (id_partido) REFERENCES partidos_torneo(id_partido) ON DELETE CASCADE
);

CREATE INDEX idx_estado_partido ON estado_partido_tiempo_real(id_partido);
CREATE INDEX idx_estado_activo ON estado_partido_tiempo_real(estado) WHERE estado = 'corriendo';

DO $$
BEGIN
  RAISE NOTICE '✓ Tabla estado_partido_tiempo_real creada';
END $$;


-- ================================================================
-- PASO 7: CREAR clasificacion_torneo
-- ================================================================

CREATE TABLE clasificacion_torneo (
  id_clasificacion SERIAL PRIMARY KEY,
  id_torneo INTEGER NOT NULL,
  id_fase INTEGER,
  id_grupo INTEGER,
  id_equipo INTEGER NOT NULL,
  
  -- Estadísticas
  partidos_jugados INTEGER DEFAULT 0,
  partidos_ganados INTEGER DEFAULT 0,
  partidos_empatados INTEGER DEFAULT 0,
  partidos_perdidos INTEGER DEFAULT 0,
  puntos_favor INTEGER DEFAULT 0,
  puntos_contra INTEGER DEFAULT 0,
  diferencia_puntos INTEGER DEFAULT 0,
  puntos_clasificacion INTEGER DEFAULT 0,
  
  -- Posición
  posicion INTEGER,
  
  -- Metadatos
  ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(id_torneo, id_fase, id_grupo, id_equipo),
  
  FOREIGN KEY (id_torneo) REFERENCES torneos(id_torneo) ON DELETE CASCADE,
  FOREIGN KEY (id_fase) REFERENCES fases_torneo(id_fase) ON DELETE CASCADE,
  FOREIGN KEY (id_grupo) REFERENCES grupos_torneo(id_grupo) ON DELETE CASCADE,
  FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo) ON DELETE CASCADE
);

CREATE INDEX idx_clasificacion_torneo ON clasificacion_torneo(id_torneo, id_fase, id_grupo);
CREATE INDEX idx_clasificacion_equipo ON clasificacion_torneo(id_equipo);
CREATE INDEX idx_clasificacion_puntos ON clasificacion_torneo(puntos_clasificacion DESC, diferencia_puntos DESC);

DO $$
BEGIN
  RAISE NOTICE '✓ Tabla clasificacion_torneo creada';
END $$;


-- ================================================================
-- PASO 8: CREAR alineaciones (reemplazo de alineacion_jugadores)
-- ================================================================

CREATE TABLE alineaciones (
  id_alineacion SERIAL PRIMARY KEY,
  id_partido INTEGER NOT NULL,
  id_equipo INTEGER NOT NULL,
  id_jugador INTEGER NOT NULL,
  
  -- Estado en el partido
  es_titular BOOLEAN DEFAULT true,
  minuto_entrada INTEGER,
  minuto_salida INTEGER,
  
  -- Metadatos
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(id_partido, id_jugador),
  CHECK (minuto_entrada IS NULL OR minuto_entrada >= 0),
  CHECK (minuto_salida IS NULL OR minuto_salida >= 0),
  CHECK (minuto_salida IS NULL OR minuto_entrada IS NULL OR minuto_salida > minuto_entrada),
  
  FOREIGN KEY (id_partido) REFERENCES partidos_torneo(id_partido) ON DELETE CASCADE,
  FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo) ON DELETE CASCADE,
  FOREIGN KEY (id_jugador) REFERENCES jugadores(id_jugador) ON DELETE CASCADE
);

CREATE INDEX idx_alineaciones_partido ON alineaciones(id_partido);
CREATE INDEX idx_alineaciones_jugador ON alineaciones(id_jugador);
CREATE INDEX idx_alineaciones_equipo ON alineaciones(id_equipo);

COMMENT ON TABLE alineaciones IS 'Alineaciones por partido - sustituciones manejadas con minuto_entrada/salida';

DO $$
BEGIN
  RAISE NOTICE '✓ Tabla alineaciones creada';
END $$;


-- ================================================================
-- PASO 9: CREAR/MODIFICAR historial_partidos
-- ================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'historial_partidos') THEN
    CREATE TABLE historial_partidos (
      id_historial SERIAL PRIMARY KEY,
      id_partido INTEGER NOT NULL,
      id_equipo INTEGER NOT NULL,
      
      gano BOOLEAN,
      puntos_favor INTEGER NOT NULL DEFAULT 0,
      puntos_contra INTEGER NOT NULL DEFAULT 0,
      estadisticas JSONB,
      
      fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      UNIQUE(id_partido, id_equipo),
      
      FOREIGN KEY (id_partido) REFERENCES partidos_torneo(id_partido) ON DELETE CASCADE,
      FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo) ON DELETE CASCADE
    );
    
    CREATE INDEX idx_historial_equipo ON historial_partidos(id_equipo);
    RAISE NOTICE '✓ Tabla historial_partidos creada';
  ELSE
    RAISE NOTICE '✓ Tabla historial_partidos ya existe';
  END IF;
END $$;


-- ================================================================
-- PASO 10: TRIGGERS AUTOMÁTICOS
-- ================================================================

-- TRIGGER 1: Actualizar clasificación cuando finaliza un partido
CREATE OR REPLACE FUNCTION actualizar_clasificacion_partido()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado_partido = 'finalizado' AND 
     (OLD.estado_partido IS NULL OR OLD.estado_partido != 'finalizado') THEN
    
    -- Equipo local
    INSERT INTO clasificacion_torneo (
      id_torneo, id_fase, id_grupo, id_equipo,
      partidos_jugados, partidos_ganados, partidos_empatados, partidos_perdidos,
      puntos_favor, puntos_contra, diferencia_puntos, puntos_clasificacion
    ) VALUES (
      NEW.id_torneo, NEW.id_fase, NEW.id_grupo, NEW.id_equipo_local,
      1,
      CASE WHEN NEW.resultado_local > NEW.resultado_visitante THEN 1 ELSE 0 END,
      CASE WHEN NEW.resultado_local = NEW.resultado_visitante THEN 1 ELSE 0 END,
      CASE WHEN NEW.resultado_local < NEW.resultado_visitante THEN 1 ELSE 0 END,
      NEW.resultado_local, NEW.resultado_visitante,
      NEW.resultado_local - NEW.resultado_visitante,
      CASE 
        WHEN NEW.resultado_local > NEW.resultado_visitante THEN 3
        WHEN NEW.resultado_local = NEW.resultado_visitante THEN 1
        ELSE 0
      END
    )
    ON CONFLICT (id_torneo, id_fase, id_grupo, id_equipo) 
    DO UPDATE SET
      partidos_jugados = clasificacion_torneo.partidos_jugados + 1,
      partidos_ganados = clasificacion_torneo.partidos_ganados + 
        CASE WHEN NEW.resultado_local > NEW.resultado_visitante THEN 1 ELSE 0 END,
      partidos_empatados = clasificacion_torneo.partidos_empatados + 
        CASE WHEN NEW.resultado_local = NEW.resultado_visitante THEN 1 ELSE 0 END,
      partidos_perdidos = clasificacion_torneo.partidos_perdidos + 
        CASE WHEN NEW.resultado_local < NEW.resultado_visitante THEN 1 ELSE 0 END,
      puntos_favor = clasificacion_torneo.puntos_favor + NEW.resultado_local,
      puntos_contra = clasificacion_torneo.puntos_contra + NEW.resultado_visitante,
      diferencia_puntos = clasificacion_torneo.diferencia_puntos + (NEW.resultado_local - NEW.resultado_visitante),
      puntos_clasificacion = clasificacion_torneo.puntos_clasificacion + 
        CASE 
          WHEN NEW.resultado_local > NEW.resultado_visitante THEN 3
          WHEN NEW.resultado_local = NEW.resultado_visitante THEN 1
          ELSE 0
        END,
      ultima_actualizacion = CURRENT_TIMESTAMP;
    
    -- Equipo visitante (igual lógica inversa)
    INSERT INTO clasificacion_torneo (
      id_torneo, id_fase, id_grupo, id_equipo,
      partidos_jugados, partidos_ganados, partidos_empatados, partidos_perdidos,
      puntos_favor, puntos_contra, diferencia_puntos, puntos_clasificacion
    ) VALUES (
      NEW.id_torneo, NEW.id_fase, NEW.id_grupo, NEW.id_equipo_visitante,
      1,
      CASE WHEN NEW.resultado_visitante > NEW.resultado_local THEN 1 ELSE 0 END,
      CASE WHEN NEW.resultado_visitante = NEW.resultado_local THEN 1 ELSE 0 END,
      CASE WHEN NEW.resultado_visitante < NEW.resultado_local THEN 1 ELSE 0 END,
      NEW.resultado_visitante, NEW.resultado_local,
      NEW.resultado_visitante - NEW.resultado_local,
      CASE 
        WHEN NEW.resultado_visitante > NEW.resultado_local THEN 3
        WHEN NEW.resultado_visitante = NEW.resultado_local THEN 1
        ELSE 0
      END
    )
    ON CONFLICT (id_torneo, id_fase, id_grupo, id_equipo) 
    DO UPDATE SET
      partidos_jugados = clasificacion_torneo.partidos_jugados + 1,
      partidos_ganados = clasificacion_torneo.partidos_ganados + 
        CASE WHEN NEW.resultado_visitante > NEW.resultado_local THEN 1 ELSE 0 END,
      partidos_empatados = clasificacion_torneo.partidos_empatados + 
        CASE WHEN NEW.resultado_visitante = NEW.resultado_local THEN 1 ELSE 0 END,
      partidos_perdidos = clasificacion_torneo.partidos_perdidos + 
        CASE WHEN NEW.resultado_visitante < NEW.resultado_local THEN 1 ELSE 0 END,
      puntos_favor = clasificacion_torneo.puntos_favor + NEW.resultado_visitante,
      puntos_contra = clasificacion_torneo.puntos_contra + NEW.resultado_local,
      diferencia_puntos = clasificacion_torneo.diferencia_puntos + (NEW.resultado_visitante - NEW.resultado_local),
      puntos_clasificacion = clasificacion_torneo.puntos_clasificacion + 
        CASE 
          WHEN NEW.resultado_visitante > NEW.resultado_local THEN 3
          WHEN NEW.resultado_visitante = NEW.resultado_local THEN 1
          ELSE 0
        END,
      ultima_actualizacion = CURRENT_TIMESTAMP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_clasificacion ON partidos_torneo;
CREATE TRIGGER trigger_actualizar_clasificacion
AFTER UPDATE OF estado_partido, resultado_local, resultado_visitante ON partidos_torneo
FOR EACH ROW
EXECUTE FUNCTION actualizar_clasificacion_partido();

DO $$
BEGIN
  RAISE NOTICE '✓ Trigger actualizar_clasificacion_partido creado';
END $$;


-- TRIGGER 2: Actualizar marcador automáticamente cuando se registra un evento
CREATE OR REPLACE FUNCTION actualizar_marcador_evento()
RETURNS TRIGGER AS $$
DECLARE
  v_valor_puntos INTEGER;
  v_id_deporte INTEGER;
BEGIN
  -- Obtener id_deporte del torneo
  SELECT t.id_deporte INTO v_id_deporte
  FROM partidos_torneo pt
  INNER JOIN torneos t ON t.id_torneo = pt.id_torneo
  WHERE pt.id_partido = NEW.id_partido;
  
  -- Obtener valor en puntos del evento
  SELECT valor_puntos INTO v_valor_puntos
  FROM configuracion_eventos_deporte
  WHERE id_deporte = v_id_deporte 
    AND tipo_evento = NEW.tipo_evento;
  
  IF FOUND AND v_valor_puntos > 0 THEN
    UPDATE partidos_torneo
    SET 
      resultado_local = CASE 
        WHEN NEW.id_equipo = id_equipo_local THEN resultado_local + v_valor_puntos
        ELSE resultado_local
      END,
      resultado_visitante = CASE 
        WHEN NEW.id_equipo = id_equipo_visitante THEN resultado_visitante + v_valor_puntos
        ELSE resultado_visitante
      END,
      fecha_modificacion = CURRENT_TIMESTAMP
    WHERE id_partido = NEW.id_partido;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_marcador ON eventos_partido;
CREATE TRIGGER trigger_actualizar_marcador
AFTER INSERT ON eventos_partido
FOR EACH ROW
EXECUTE FUNCTION actualizar_marcador_evento();

DO $$
BEGIN
  RAISE NOTICE '✓ Trigger actualizar_marcador_evento creado';
END $$;


-- TRIGGER 3: Actualizar timestamp de modificación
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_modificacion = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_fecha_modificacion_partido ON partidos_torneo;
CREATE TRIGGER trigger_fecha_modificacion_partido
BEFORE UPDATE ON partidos_torneo
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_modificacion();

DO $$
BEGIN
  RAISE NOTICE '✓ Trigger actualizar_fecha_modificacion creado';
END $$;


-- ================================================================
-- PASO 11: VISTAS ÚTILES
-- ================================================================

-- Vista: Clasificación ordenada
CREATE OR REPLACE VIEW v_clasificacion_ordenada AS
SELECT 
  c.*,
  e.nombre_equipo,
  e.logo_url,
  t.nombre as nombre_torneo,
  d.nombre as nombre_deporte,
  ROW_NUMBER() OVER (
    PARTITION BY c.id_torneo, c.id_fase, c.id_grupo 
    ORDER BY c.puntos_clasificacion DESC, c.diferencia_puntos DESC, c.puntos_favor DESC
  ) as posicion_calculada
FROM clasificacion_torneo c
INNER JOIN equipos e ON c.id_equipo = e.id_equipo
INNER JOIN torneos t ON c.id_torneo = t.id_torneo
INNER JOIN deportes d ON t.id_deporte = d.id_deporte
ORDER BY c.id_torneo, c.id_fase, c.id_grupo, posicion_calculada;


-- Vista: Próximos partidos
CREATE OR REPLACE VIEW v_proximos_partidos AS
SELECT 
  p.*,
  t.nombre as nombre_torneo,
  d.nombre as nombre_deporte,
  el.nombre_equipo as equipo_local,
  ev.nombre_equipo as equipo_visitante,
  el.logo_url as logo_local,
  ev.logo_url as logo_visitante,
  c.nombre as nombre_cancha,
  s.nombre as nombre_sede,
  CONCAT(a.nombre, ' ', a.apellido) as nombre_arbitro
FROM partidos_torneo p
INNER JOIN torneos t ON p.id_torneo = t.id_torneo
INNER JOIN deportes d ON t.id_deporte = d.id_deporte
INNER JOIN equipos el ON p.id_equipo_local = el.id_equipo
INNER JOIN equipos ev ON p.id_equipo_visitante = ev.id_equipo
LEFT JOIN canchas c ON p.id_cancha = c.id_cancha
LEFT JOIN sedes s ON c.id_sede = s.id_sede
LEFT JOIN arbitros a ON p.id_arbitro = a.id_arbitro
WHERE p.estado_partido IN ('programado', 'en_curso')
  AND p.fecha_partido >= CURRENT_DATE
ORDER BY p.fecha_partido, p.hora_inicio;


-- Vista: Goleadores/Anotadores (universal para todos los deportes)
CREATE OR REPLACE VIEW v_goleadores AS
SELECT 
  j.id_jugador,
  j.nombre_completo,
  j.numero_dorsal,
  e.nombre_equipo,
  e.logo_url,
  t.nombre as nombre_torneo,
  d.nombre as nombre_deporte,
  t.id_torneo,
  COUNT(ev.id_evento) as total_anotaciones,
  SUM(ced.valor_puntos) as total_puntos
FROM jugadores j
INNER JOIN eventos_partido ev ON j.id_jugador = ev.id_jugador
INNER JOIN partidos_torneo p ON ev.id_partido = p.id_partido
INNER JOIN torneos t ON p.id_torneo = t.id_torneo
INNER JOIN deportes d ON t.id_deporte = d.id_deporte
INNER JOIN configuracion_eventos_deporte ced ON ced.tipo_evento = ev.tipo_evento AND ced.id_deporte = t.id_deporte
INNER JOIN equipos e ON j.id_equipo = e.id_equipo
WHERE ced.valor_puntos > 0
GROUP BY j.id_jugador, j.nombre_completo, j.numero_dorsal, e.nombre_equipo, e.logo_url, t.nombre, d.nombre, t.id_torneo
ORDER BY total_puntos DESC, total_anotaciones DESC;


-- Vista: Partidos en vivo
CREATE OR REPLACE VIEW v_partidos_en_vivo AS
SELECT 
  p.*,
  t.nombre as nombre_torneo,
  d.nombre as nombre_deporte,
  el.nombre_equipo as equipo_local,
  ev.nombre_equipo as equipo_visitante,
  el.logo_url as logo_local,
  ev.logo_url as logo_visitante,
  etr.tiempo_actual,
  etr.periodo_actual,
  etr.estado as estado_tiempo,
  etr.ultima_actualizacion
FROM partidos_torneo p
INNER JOIN torneos t ON p.id_torneo = t.id_torneo
INNER JOIN deportes d ON t.id_deporte = d.id_deporte
INNER JOIN equipos el ON p.id_equipo_local = el.id_equipo
INNER JOIN equipos ev ON p.id_equipo_visitante = ev.id_equipo
LEFT JOIN estado_partido_tiempo_real etr ON p.id_partido = etr.id_partido
WHERE p.estado_partido = 'en_curso'
ORDER BY p.fecha_partido DESC, p.hora_inicio DESC;

DO $$
BEGIN
  RAISE NOTICE '✓ Vistas creadas: v_clasificacion_ordenada, v_proximos_partidos, v_goleadores, v_partidos_en_vivo';
END $$;


-- ================================================================
-- VERIFICACIÓN FINAL
-- ================================================================

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICACIÓN DE MIGRACIÓN';
  RAISE NOTICE '========================================';
  
  -- Contar tablas creadas
  SELECT COUNT(*) INTO v_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN (
      'jugadores', 'eventos_partido', 'configuracion_eventos_deporte',
      'estado_partido_tiempo_real', 'clasificacion_torneo', 'alineaciones'
    );
  RAISE NOTICE '✓ Tablas nuevas creadas: %', v_count;
  
  -- Contar triggers
  SELECT COUNT(*) INTO v_count
  FROM pg_trigger 
  WHERE tgname IN ('trigger_actualizar_clasificacion', 'trigger_actualizar_marcador', 'trigger_fecha_modificacion_partido');
  RAISE NOTICE '✓ Triggers creados: %', v_count;
  
  -- Contar vistas
  SELECT COUNT(*) INTO v_count
  FROM information_schema.views
  WHERE table_schema = 'public'
    AND table_name IN ('v_clasificacion_ordenada', 'v_proximos_partidos', 'v_goleadores', 'v_partidos_en_vivo');
  RAISE NOTICE '✓ Vistas creadas: %', v_count;
  
  -- Contar eventos configurados
  SELECT COUNT(*) INTO v_count FROM configuracion_eventos_deporte;
  RAISE NOTICE '✓ Eventos deportivos configurados: %', v_count;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ MIGRACIÓN COMPLETADA EXITOSAMENTE';
  RAISE NOTICE '========================================';
END $$;
