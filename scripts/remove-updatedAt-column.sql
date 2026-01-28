-- ============================================================================
-- REMOVER COLUNA updatedAt (camelCase) DA TABELA organizations
-- ============================================================================
-- Esta coluna não deveria existir e está causando o erro
-- Execute no Supabase SQL Editor

-- ============================================================================
-- PASSO 1: VERIFICAR SE A COLUNA updatedAt EXISTE
-- ============================================================================
-- Verificar quais colunas de timestamp existem na tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'organizations'
  AND (
    column_name LIKE '%update%' 
    OR column_name LIKE '%create%'
    OR column_name = 'updatedAt'
    OR column_name = 'createdAt'
  )
ORDER BY column_name;

-- ============================================================================
-- PASSO 2: MIGRAR DADOS (se a coluna updatedAt existir)
-- ============================================================================
-- Usar DO block para verificar se a coluna existe antes de tentar usá-la
DO $$
BEGIN
  -- Verificar se a coluna updatedAt existe
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'organizations'
      AND column_name = 'updatedAt'
  ) THEN
    -- Migrar dados de updatedAt para updated_at (se necessário)
    EXECUTE '
      UPDATE public.organizations
      SET updated_at = "updatedAt"::timestamp with time zone
      WHERE updated_at IS NULL 
        AND "updatedAt" IS NOT NULL;
    ';
    RAISE NOTICE 'Dados migrados de updatedAt para updated_at';
  ELSE
    RAISE NOTICE 'Coluna updatedAt não existe, pulando migração';
  END IF;
END $$;

-- ============================================================================
-- PASSO 3: REMOVER A COLUNA updatedAt (camelCase)
-- ============================================================================
-- IMPORTANTE: Isso vai remover a coluna permanentemente
-- Certifique-se de que não há dados importantes nela antes de executar

-- Primeiro, verificar se há constraints ou índices na coluna
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.organizations'::regclass
  AND (
    conkey::text LIKE '%updatedAt%'
    OR pg_get_constraintdef(oid) LIKE '%updatedAt%'
  );

-- Remover a coluna updatedAt (camelCase)
ALTER TABLE public.organizations 
DROP COLUMN IF EXISTS "updatedAt";

-- ============================================================================
-- PASSO 4: VERIFICAR SE EXISTE createdAt (camelCase) também
-- ============================================================================
-- Verificar se há coluna createdAt (camelCase) que também não deveria existir
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'organizations'
  AND (
    column_name LIKE '%At' 
    OR column_name LIKE '%_at'
  )
ORDER BY column_name;

-- Se existir createdAt (camelCase), migrar e remover também
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'organizations'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE '
      UPDATE public.organizations
      SET created_at = "createdAt"::timestamp with time zone
      WHERE created_at IS NULL 
        AND "createdAt" IS NOT NULL;
    ';
    RAISE NOTICE 'Dados migrados de createdAt para created_at';
  ELSE
    RAISE NOTICE 'Coluna createdAt não existe, pulando migração';
  END IF;
END $$;

ALTER TABLE public.organizations 
DROP COLUMN IF EXISTS "createdAt";

-- ============================================================================
-- PASSO 5: VERIFICAÇÃO FINAL
-- ============================================================================
-- Confirmar que apenas updated_at (snake_case) existe
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'organizations'
  AND column_name LIKE '%update%'
ORDER BY column_name;

-- Confirmar que apenas created_at (snake_case) existe
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'organizations'
  AND column_name LIKE '%create%'
ORDER BY column_name;

-- Verificar estrutura completa da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'organizations'
ORDER BY ordinal_position;

