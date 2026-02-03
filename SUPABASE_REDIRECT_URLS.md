# 🔗 Supabase Redirect URLs Configuration Guide

## Domínio: `hipaahubhealth.com`

Este documento lista **todas as URLs de redirecionamento** que devem ser configuradas no Supabase para que a aplicação funcione perfeitamente.

---

## 📋 URLs Obrigatórias para Configurar no Supabase

### 1. **OAuth Callback (Principal)**
```
https://hipaahubhealth.com/auth/callback
```
**Uso:**
- Login com Google OAuth
- Confirmação de email após signup
- Magic link login
- Qualquer autenticação OAuth

**Onde configurar:**
- Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
- Google Cloud Console → OAuth 2.0 Client IDs → Authorized redirect URIs (apenas a URL do Supabase)

---

### 2. **Password Reset Callback**
```
https://hipaahubhealth.com/auth/reset_password
```
**Uso:**
- Reset de senha via email
- Atualização de senha após solicitação

**Onde configurar:**
- Supabase Dashboard → Authentication → URL Configuration → Redirect URLs

---

## 🔧 Como Configurar no Supabase Dashboard

### Passo 1: Acessar Configurações de URL
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá para: **Authentication** → **URL Configuration**

### Passo 2: Adicionar Redirect URLs
Na seção **"Redirect URLs"**, adicione as seguintes URLs (uma por linha):

```
https://hipaahubhealth.com/auth/callback
https://hipaahubhealth.com/auth/reset_password
```

### Passo 3: Site URL (Opcional mas Recomendado)
Na seção **"Site URL"**, configure:
```
https://hipaahubhealth.com
```

---

## 🔐 Configuração Adicional: Google OAuth

Se você estiver usando **Google OAuth**, também precisa configurar no **Google Cloud Console**:

### Google Cloud Console
1. Acesse: https://console.cloud.google.com
2. Vá para: **APIs & Services** → **Credentials**
3. Selecione seu **OAuth 2.0 Client ID**
4. Em **"Authorized redirect URIs"**, adicione:

```
https://[SEU-PROJECT-ID].supabase.co/auth/v1/callback
```

**⚠️ IMPORTANTE:** 
- Use a URL do **Supabase**, não a URL do seu domínio
- Substitua `[SEU-PROJECT-ID]` pelo ID do seu projeto Supabase
- Exemplo: `https://krsavzmwtktidhmhumiq.supabase.co/auth/v1/callback`

---

## 📝 Variáveis de Ambiente Necessárias

Certifique-se de que as seguintes variáveis estão configuradas no seu ambiente de produção:

```env
NEXT_PUBLIC_APP_URL=https://hipaahubhealth.com
NEXT_PUBLIC_SUPABASE_URL=https://[SEU-PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[SUA-ANON-KEY]
```

---

## ✅ Checklist de Verificação

Após configurar, verifique:

- [ ] URLs adicionadas no Supabase Dashboard → Authentication → URL Configuration
- [ ] Site URL configurada no Supabase
- [ ] Google OAuth redirect URI configurado no Google Cloud Console (se aplicável)
- [ ] Variável `NEXT_PUBLIC_APP_URL` configurada no ambiente de produção
- [ ] Teste de login com Google OAuth funcionando
- [ ] Teste de reset de senha funcionando
- [ ] Teste de confirmação de email funcionando

---

## 🧪 Testes Recomendados

### 1. Teste de OAuth (Google)
1. Acesse: `https://hipaahubhealth.com/signin`
2. Clique em "Sign in with Google"
3. Complete o fluxo OAuth
4. Verifique se redireciona corretamente para `/dashboard` ou `/checkout`

### 2. Teste de Reset de Senha
1. Acesse: `https://hipaahubhealth.com/signin`
2. Clique em "Forgot password?"
3. Digite seu email
4. Verifique se o link no email redireciona para `/auth/reset_password`

### 3. Teste de Signup
1. Acesse: `https://hipaahubhealth.com/signup`
2. Crie uma conta
3. Verifique se o link de confirmação no email redireciona corretamente

---

## 🚨 Problemas Comuns

### Erro: "redirect_uri_mismatch"
**Causa:** URL não está na lista de Redirect URLs do Supabase
**Solução:** Adicione a URL exata (com `https://` e sem trailing slash)

### Erro: "Invalid redirect URL"
**Causa:** URL não corresponde ao domínio configurado
**Solução:** Verifique se `NEXT_PUBLIC_APP_URL` está correto

### OAuth funciona mas reset de senha não
**Causa:** URL de reset não está na lista
**Solução:** Adicione `https://hipaahubhealth.com/auth/reset_password` na lista

---

## 📚 Referências no Código

As URLs são construídas usando a função `getURL()` em:
- `lib/utils.ts` (função `getURL()`)
- `utils/helpers.ts` (função `getURL()`)

Rotas de callback:
- `app/auth/callback/route.ts` - OAuth callback principal
- `app/auth/reset_password/route.ts` - Password reset callback

---

## 🎯 Resumo Rápido

**URLs para adicionar no Supabase:**
```
https://hipaahubhealth.com/auth/callback
https://hipaahubhealth.com/auth/reset_password
```

**URL para adicionar no Google Cloud Console (se usar Google OAuth):**
```
https://[SEU-PROJECT-ID].supabase.co/auth/v1/callback
```

---

**Última atualização:** $(date)
**Domínio:** hipaahubhealth.com
