# Troubleshooting Google OAuth Login

## Erro: "Unsupported provider: provider is not enabled"

Este erro indica que o Supabase não reconhece o Google como um provider habilitado. Siga estes passos para verificar e corrigir:

## ✅ Checklist de Verificação

### 1. Verificar no Supabase Dashboard

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Navegue até Authentication → Providers**
   - No menu lateral, clique em "Authentication"
   - Clique em "Providers"

3. **Verifique o Google Provider**
   - Procure por "Google" na lista de providers
   - O toggle deve estar **ON (verde/ativado)**
   - Se estiver OFF, ative-o

4. **Verifique as Credenciais**
   - **Client ID**: Deve estar preenchido
     - Formato: `xxxxx-xxxxx.apps.googleusercontent.com`
   - **Client Secret**: Deve estar preenchido
     - Formato: `GOCSPX-xxxxx`
   - **NÃO deixe campos vazios**

5. **IMPORTANTE: Clique em "Save"**
   - Após preencher/verificar as credenciais
   - **SEMPRE clique no botão "Save"**
   - Aguarde a confirmação de salvamento

6. **Aguarde Propagação**
   - Após salvar, aguarde 10-30 segundos
   - As mudanças podem levar alguns segundos para propagar

### 2. Verificar no Google Cloud Console

1. **Acesse Google Cloud Console**
   - Vá para: https://console.cloud.google.com
   - Selecione seu projeto

2. **Verifique OAuth 2.0 Client ID**
   - Navegue: APIs & Services → Credentials
   - Encontre seu OAuth 2.0 Client ID
   - Clique para editar

3. **Verifique Authorized redirect URIs**
   - Deve conter: `https://[seu-projeto-id].supabase.co/auth/v1/callback`
   - Exemplo: `https://krsavzmwtktidhmhumiq.supabase.co/auth/v1/callback`
   - **NÃO use** `http://localhost:3000/auth/callback` aqui
   - O Supabase gerencia o callback internamente

4. **Salve as mudanças no Google Cloud Console**

### 3. Verificar Variáveis de Ambiente

Certifique-se de que as variáveis estão corretas no seu `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[seu-projeto-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[sua-anon-key]
```

**IMPORTANTE:**
- Use a URL do projeto Supabase (não localhost)
- Use a anon key do projeto correto
- Reinicie o servidor de desenvolvimento após alterar `.env.local`

### 4. Verificar no Console do Navegador

1. **Abra o Console do Desenvolvedor**
   - F12 ou Right-click → Inspect
   - Vá para a aba "Console"

2. **Tente fazer login com Google**
   - Clique no botão "Continue with Google"
   - Observe os logs no console

3. **Procure por estas mensagens:**
   ```
   OAuth sign-in attempt: { provider: 'google', redirectURL: '...', supabaseUrl: '...' }
   ```

4. **Se houver erro, verifique:**
   - A URL do Supabase está correta?
   - O provider está sendo passado como 'google' (lowercase)?

### 5. Verificar URL de Callback no Supabase

1. **No Supabase Dashboard**
   - Authentication → URL Configuration

2. **Verifique Site URL**
   - Deve ser: `http://localhost:3000` (para desenvolvimento)
   - Ou: `https://seu-dominio.com` (para produção)

3. **Verifique Redirect URLs**
   - Deve conter: `http://localhost:3000/auth/callback`
   - Para produção: `https://seu-dominio.com/auth/callback`
   - Pode usar wildcards: `https://*.vercel.app/auth/callback`

## 🔧 Soluções Comuns

### Solução 1: Desabilitar e Reabilitar o Provider

1. No Supabase Dashboard → Authentication → Providers
2. Desabilite o Google (toggle OFF)
3. Clique em "Save"
4. Aguarde 10 segundos
5. Reabilite o Google (toggle ON)
6. Preencha as credenciais novamente
7. Clique em "Save"
8. Aguarde 30 segundos
9. Tente fazer login novamente

### Solução 2: Verificar Credenciais

1. No Google Cloud Console, gere novas credenciais se necessário
2. Copie o Client ID e Secret
3. No Supabase, cole as credenciais
4. **Clique em "Save"**
5. Aguarde 30 segundos

### Solução 3: Limpar Cache do Navegador

1. Abra o Console do Desenvolvedor (F12)
2. Right-click no botão de refresh
3. Selecione "Empty Cache and Hard Reload"
4. Tente fazer login novamente

### Solução 4: Verificar Projeto Correto

Certifique-se de que está usando:
- O projeto Supabase correto
- As variáveis de ambiente do projeto correto
- As credenciais do Google OAuth do projeto correto

## 📝 Logs de Debug

O código agora inclui logs de debug. Quando você tentar fazer login, verifique o console do navegador para ver:

- Provider sendo usado
- URL de redirect
- URL do Supabase
- Qualquer erro retornado

## ⚠️ Erros Comuns

### "Provider is not enabled"
- **Causa**: O toggle do Google está OFF no Supabase
- **Solução**: Ative o toggle e clique em "Save"

### "Invalid client_id"
- **Causa**: Client ID incorreto ou não copiado completamente
- **Solução**: Verifique e copie o Client ID completo do Google Cloud Console

### "Invalid client_secret"
- **Causa**: Client Secret incorreto
- **Solução**: Verifique e copie o Client Secret completo

### "Redirect URI mismatch"
- **Causa**: URL de callback não configurada corretamente
- **Solução**: No Google Cloud Console, adicione: `https://[projeto-id].supabase.co/auth/v1/callback`

## 🆘 Ainda Não Funciona?

Se após seguir todos os passos o problema persistir:

1. Verifique os logs no console do navegador
2. Verifique os logs no Supabase Dashboard → Logs → API
3. Certifique-se de que está usando o projeto Supabase correto
4. Tente criar um novo OAuth Client no Google Cloud Console
5. Verifique se há algum bloqueio de firewall ou proxy







