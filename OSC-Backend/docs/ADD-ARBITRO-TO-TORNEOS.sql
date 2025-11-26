-- ================================================================
-- AGREGAR COLUMNA id_arbitro A TORNEOS
-- ================================================================
-- IMPORTANTE: La tabla arbitros está vacía. Los árbitros están en 
-- la tabla usuarios con rol='Arbitro', por lo tanto la FK apunta
-- directamente a usuarios.id_user en lugar de arbitros.id_arbitro
-- ================================================================

DO $$
BEGIN
  -- Primero eliminar el constraint si existe (por si fue creado con error)
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_torneos_arbitro'
  ) THEN
    ALTER TABLE torneos DROP CONSTRAINT fk_torneos_arbitro;
    RAISE NOTICE '⚠ Constraint fk_torneos_arbitro eliminado (se recreará correctamente)';
  END IF;

  -- Agregar columna id_arbitro a torneos si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'torneos' AND column_name = 'id_arbitro'
  ) THEN
    ALTER TABLE torneos ADD COLUMN id_arbitro INTEGER;
    RAISE NOTICE '✓ Columna id_arbitro agregada a torneos';
  END IF;
  
  -- Agregar el constraint correcto apuntando a usuarios.id_user
  ALTER TABLE torneos 
  ADD CONSTRAINT fk_torneos_arbitro 
    FOREIGN KEY (id_arbitro) REFERENCES usuarios(id_user) ON DELETE SET NULL;
  
  RAISE NOTICE '✓ Constraint fk_torneos_arbitro creado correctamente (apunta a usuarios.id_user)';
END $$;

-- Verificar
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICACIÓN: Columna id_arbitro en torneos';
  RAISE NOTICE '========================================';
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'torneos' AND column_name = 'id_arbitro'
  ) THEN
    RAISE NOTICE '✓ Columna id_arbitro existe correctamente';
  ELSE
    RAISE NOTICE '✗ ERROR: Columna id_arbitro NO existe';
  END IF;
END $$;
