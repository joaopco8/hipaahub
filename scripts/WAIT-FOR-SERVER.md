# ⏳ Aguardar Compilação do Next.js

## Problema
Erro 404 nos arquivos estáticos (`/_next/static/...`)

## Causa
O Next.js está compilando os arquivos estáticos. Na primeira vez após limpar o cache, isso pode levar **30-60 segundos**.

## Solução

### 1. Verificar Terminal
No terminal onde `pnpm dev` está rodando, você deve ver:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000

⏳ Compiling...
```

Aguarde até aparecer:
```
✓ Ready in X seconds
```

### 2. NÃO Acesse o Navegador Antes de "Ready"
Se você acessar antes, verá erros 404 porque os arquivos ainda não foram compilados.

### 3. Após Ver "Ready"
1. Aguarde mais 5 segundos
2. Limpe o cache do navegador (`Ctrl+Shift+Delete`)
3. Acesse: `http://localhost:3000/dashboard/test-rpc`

### 4. Se Ainda Der 404 Após "Ready"
1. Pare o servidor (Ctrl+C)
2. Execute:
```powershell
if (Test-Path .next) { Remove-Item -Recurse -Force .next }
pnpm dev
```
3. Aguarde ver "Ready" novamente

## Tempo Esperado
- Primeira compilação: **30-60 segundos**
- Compilações subsequentes: **5-10 segundos**

## Status Atual
- ✅ Servidor reiniciado
- ✅ Cache limpo
- ⏳ Aguardando compilação inicial

**Aguarde ver "Ready" no terminal antes de acessar o navegador!**
