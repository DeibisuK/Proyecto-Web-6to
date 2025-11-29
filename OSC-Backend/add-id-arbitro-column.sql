-- Agregar columna id_arbitro a partidos_torneo
ALTER TABLE partidos_torneo 
ADD COLUMN IF NOT EXISTS id_arbitro INTEGER REFERENCES usuarios(id_user);

-- Crear índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_partidos_torneo_id_arbitro ON partidos_torneo(id_arbitro);
