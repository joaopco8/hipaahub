-- Script para garantir que a constraint única em user_id existe
-- Execute este script ANTES de executar fix-upsert-organization-function.sql

-- Verificar e criar a constraint única se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'organizations_user_id_key'
  ) THEN
    -- Criar a constraint única
    ALTER TABLE public.organizations 
    ADD CONSTRAINT organizations_user_id_key UNIQUE (user_id);
    
    RAISE NOTICE 'Constraint organizations_user_id_key criada com sucesso';
  ELSE
    RAISE NOTICE 'Constraint organizations_user_id_key já existe';
  END IF;
END $$;

-- Verificar se a constraint foi criada
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conname = 'organizations_user_id_key';
