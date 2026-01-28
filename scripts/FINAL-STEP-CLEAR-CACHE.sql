-- ============================================================================
-- PASSO FINAL: Limpar Cache do Supabase
-- ============================================================================
-- Execute este comando para garantir que o Supabase reconhece a nova função
-- ============================================================================

NOTIFY pgrst, 'reload schema';

SELECT '✅ Cache do Supabase atualizado. A função está pronta para uso!' as status;
