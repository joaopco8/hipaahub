# Limpar Cache do Supabase Client

Após executar o script `DEFINITIVE-SOLUTION.sql`, você PRECISA limpar o cache:

## 1. Reiniciar o Servidor Next.js

```bash
# Pare o servidor completamente (Ctrl+C)
# Aguarde 5 segundos
# Inicie novamente
pnpm dev
# ou
npm run dev
```

## 2. Limpar Cache do Navegador

- Pressione `Ctrl+Shift+Delete` (Windows) ou `Cmd+Shift+Delete` (Mac)
- Selecione "Cache" e "Cookies"
- Limpe os últimos 24 horas
- Recarregue a página com `Ctrl+F5` (hard refresh)

## 3. Verificar Variáveis de Ambiente

Certifique-se de que está usando as variáveis corretas do Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 4. Testar Novamente

Após limpar o cache, tente salvar a organização novamente.
