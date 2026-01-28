-- ============================================================================
-- REMOVER COLUNA updatedAt (camelCase) - VERSÃO SIMPLES
-- ============================================================================
-- Este script apenas remove a coluna se ela existir, sem tentar migrar dados
-- Execute no Supabase SQL Editor

-- Verificar quais colunas de timestamp existem
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'organizations'
  AND (
    column_name LIKE '%update%' 
    OR column_name LIKE '%create%'
  )
ORDER BY column_name;

-- Remover coluna updatedAt (camelCase) se existir
ALTER TABLE public.organizations 
DROP COLUMN IF EXISTS "updatedAt";

-- Remover coluna createdAt (camelCase) se existir
ALTER TABLE public.organizations 
DROP COLUMN IF EXISTS "createdAt";

-- Verificar resultado final
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
  )
ORDER BY column_name;
