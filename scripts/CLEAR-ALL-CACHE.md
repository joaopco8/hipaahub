# Limpar TODO o Cache - Passo a Passo

## 1. Limpar Cache do Next.js

```powershell
# No PowerShell
if (Test-Path .next) { 
    Remove-Item -Recurse -Force .next
    Write-Host "Cache .next removido"
}
```

## 2. Limpar Cache do Node Modules (opcional mas recomendado)

```powershell
# Limpar cache do npm/pnpm
pnpm store prune
# ou
npm cache clean --force
```

## 3. Reiniciar o Servidor

```bash
# Pare completamente (Ctrl+C)
# Aguarde 5 segundos
# Inicie novamente
pnpm dev
```

## 4. Limpar Cache do Navegador

1. Pressione `Ctrl+Shift+Delete`
2. Selecione:
   - ✅ Cache
   - ✅ Cookies
   - ✅ Dados de sites
3. Período: "Última hora" ou "Todo o período"
4. Clique em "Limpar dados"
5. Feche e abra o navegador novamente

## 5. Limpar Cache do Supabase (via SQL)

Execute no Supabase SQL Editor:

```sql
-- Forçar refresh do schema cache
NOTIFY pgrst, 'reload schema';
```

## 6. Verificar Variáveis de Ambiente

Certifique-se de que está usando as variáveis corretas:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 7. Testar Novamente

Após todos os passos, teste salvar a organização novamente.
