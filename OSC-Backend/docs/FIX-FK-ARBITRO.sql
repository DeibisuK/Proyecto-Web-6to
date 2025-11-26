-- ================================================================
-- FIX: Corregir Foreign Key Constraint de id_arbitro
-- ================================================================
-- PROBLEMA: El FK fue creado apuntando a usuarios(id_usuario) que no existe
-- SOLUCIÓN: Recrear apuntando a usuarios(id_user) que es la PK real
-- ================================================================

DO $$
BEGIN
  RAISE NOTICE '🔧 Iniciando corrección de FK constraint...';
  
  -- 1. Eliminar el constraint incorrecto si existe
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_torneos_arbitro'
  ) THEN
    ALTER TABLE torneos DROP CONSTRAINT fk_torneos_arbitro;
    RAISE NOTICE '✓ Constraint incorrecto eliminado';
  END IF;

  -- 2. Verificar que la columna id_arbitro existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'torneos' AND column_name = 'id_arbitro'
  ) THEN
    ALTER TABLE torneos ADD COLUMN id_arbitro INTEGER;
    RAISE NOTICE '✓ Columna id_arbitro creada';
  ELSE
    RAISE NOTICE '✓ Columna id_arbitro ya existe';
  END IF;
  
  -- 3. Limpiar valores inválidos (por si hay IDs que no existen en usuarios)
  UPDATE torneos SET id_arbitro = NULL 
  WHERE id_arbitro IS NOT NULL 
  AND id_arbitro NOT IN (SELECT id_user FROM usuarios);
  
  -- 4. Crear el constraint correcto apuntando a usuarios.id_user
  ALTER TABLE torneos 
  ADD CONSTRAINT fk_torneos_arbitro 
    FOREIGN KEY (id_arbitro) REFERENCES usuarios(id_user) ON DELETE SET NULL;
  
  RAISE NOTICE '✅ Constraint fk_torneos_arbitro creado correctamente';
  RAISE NOTICE '✅ Ahora apunta a usuarios(id_user) que es la PK real';
END $$;

-- Verificación final
DO $$
DECLARE
  v_constraint_exists BOOLEAN;
  v_column_exists BOOLEAN;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICACIÓN FINAL';
  RAISE NOTICE '========================================';
  
  -- Verificar columna
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'torneos' AND column_name = 'id_arbitro'
  ) INTO v_column_exists;
  
  IF v_column_exists THEN
    RAISE NOTICE '✅ Columna torneos.id_arbitro existe';
  ELSE
    RAISE NOTICE '❌ ERROR: Columna torneos.id_arbitro NO existe';
  END IF;
  
  -- Verificar constraint
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_torneos_arbitro'
  ) INTO v_constraint_exists;
  
  IF v_constraint_exists THEN
    RAISE NOTICE '✅ Constraint fk_torneos_arbitro existe';
    
    -- Mostrar detalles del constraint
    SELECT 
      tc.constraint_name,
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_name = 'fk_torneos_arbitro'
    INTO STRICT 
      v_constraint_exists;
      
    RAISE NOTICE '   - Apunta a: usuarios.id_user';
  ELSE
    RAISE NOTICE '❌ ERROR: Constraint fk_torneos_arbitro NO existe';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;
