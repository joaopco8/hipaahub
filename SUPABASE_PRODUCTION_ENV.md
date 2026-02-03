# 🔐 Variáveis de Ambiente Supabase para Produção

## 📋 Variáveis Obrigatórias para o Vercel

Configure estas variáveis no **Vercel Dashboard** → **Settings** → **Environment Variables**:

### ✅ Variáveis Essenciais (Obrigatórias)

```env
# 1. URL do Projeto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[SEU-PROJECT-ID].supabase.co

# 2. Chave Anônima (Public Key) - Usada para autenticação client-side
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 3. URL da Aplicação (Para redirects OAuth)
NEXT_PUBLIC_APP_URL=https://hipaahubhealth.com
```

### ⚙️ Variável Recomendada (Para Operações Admin)

```env
# 4. Service Role Key (Server-side) - Para operações administrativas
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANTE:** A `SUPABASE_SERVICE_ROLE_KEY` é usada para:
- Sincronizar produtos do Stripe
- Operações administrativas que bypassam RLS
- Webhooks do Stripe
- Operações que requerem privilégios elevados

---

## 🔍 Onde Encontrar Essas Chaves no Supabase

### 1. Acessar o Supabase Dashboard
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto de **produção**

### 2. Obter `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
1. Vá para: **Settings** → **API**
2. Na seção **"Project URL"**, copie a URL:
   ```
   https://[seu-project-id].supabase.co
   ```
3. Na seção **"Project API keys"**, encontre a chave **"anon"** ou **"public"**:
   - Clique em **"Reveal"** para ver a chave completa
   - Copie a chave (formato: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Obter `SUPABASE_SERVICE_ROLE_KEY`
1. Na mesma página (**Settings** → **API**)
2. Na seção **"Project API keys"**, encontre a chave **"service_role"**:
   - ⚠️ **CUIDADO:** Esta chave tem privilégios totais!
   - Clique em **"Reveal"** para ver a chave completa
   - Copie a chave (formato: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **NUNCA** exponha esta chave no client-side!

---

## 🔧 Como Configurar no Vercel

### Passo 1: Acessar Environment Variables
1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá para: **Settings** → **Environment Variables**

### Passo 2: Adicionar as Variáveis
Adicione cada variável uma por uma:

| Variável | Valor | Ambiente |
|----------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[SEU-PROJECT-ID].supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://hipaahubhealth.com` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |

**⚠️ IMPORTANTE:**
- Marque todas como **Production**, **Preview** e **Development**
- Certifique-se de que `NEXT_PUBLIC_APP_URL` está com `https://` (não `http://`)
- Não adicione aspas ao redor dos valores

### Passo 3: Redeploy
Após adicionar todas as variáveis:
1. Vá para **Deployments**
2. Clique nos 3 pontos do último deployment
3. Selecione **Redeploy**
4. Aguarde o deploy completar

---

## 🔐 Configuração do Google OAuth no Supabase

Para o login com Google funcionar, você também precisa configurar no **Supabase Dashboard**:

### 1. Habilitar Google Provider
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá para: **Authentication** → **Providers**
4. Encontre **"Google"** na lista
5. Ative o toggle (deve ficar verde/ON)
6. Preencha:
   - **Client ID**: (do Google Cloud Console)
   - **Client Secret**: (do Google Cloud Console)
7. Clique em **"Save"**
8. Aguarde 10-30 segundos para propagação

### 2. Configurar Redirect URLs
1. Vá para: **Authentication** → **URL Configuration**
2. Em **"Redirect URLs"**, adicione:
   ```
   https://hipaahubhealth.com/auth/callback
   https://hipaahubhealth.com/auth/reset_password
   ```
3. Em **"Site URL"**, configure:
   ```
   https://hipaahubhealth.com
   ```
4. Clique em **"Save"**

### 3. Configurar no Google Cloud Console
1. Acesse: https://console.cloud.google.com
2. Vá para: **APIs & Services** → **Credentials**
3. Selecione seu **OAuth 2.0 Client ID**
4. Em **"Authorized redirect URIs"**, adicione:
   ```
   https://[SEU-PROJECT-ID].supabase.co/auth/v1/callback
   ```
   ⚠️ Use a URL do **Supabase**, não a URL do seu domínio!
5. Clique em **"Save"**

---

## ✅ Checklist Completo

Após configurar, verifique:

### Variáveis de Ambiente no Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] `NEXT_PUBLIC_APP_URL` configurada (com `https://`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada (recomendado)
- [ ] Todas marcadas para Production, Preview e Development
- [ ] Deploy realizado após adicionar variáveis

### Configuração no Supabase Dashboard
- [ ] Google Provider habilitado
- [ ] Client ID e Secret do Google preenchidos
- [ ] Redirect URLs configuradas:
  - [ ] `https://hipaahubhealth.com/auth/callback`
  - [ ] `https://hipaahubhealth.com/auth/reset_password`
- [ ] Site URL configurada: `https://hipaahubhealth.com`

### Configuração no Google Cloud Console
- [ ] OAuth 2.0 Client ID criado
- [ ] Authorized redirect URI configurado:
  - [ ] `https://[SEU-PROJECT-ID].supabase.co/auth/v1/callback`

### Testes
- [ ] Login com email/senha funcionando
- [ ] Login com Google funcionando
- [ ] Signup funcionando
- [ ] Reset de senha funcionando
- [ ] Confirmação de email funcionando

---

## 🧪 Teste Rápido

### 1. Teste de Login com Google
1. Acesse: `https://hipaahubhealth.com/signin`
2. Clique em **"Sign in with Google"**
3. Complete o fluxo OAuth
4. Verifique se redireciona corretamente para `/dashboard` ou `/checkout`

### 2. Teste de Login com Email/Senha
1. Acesse: `https://hipaahubhealth.com/signin`
2. Digite email e senha
3. Clique em **"Sign in"**
4. Verifique se redireciona corretamente

### 3. Verificar Logs
1. No Vercel Dashboard, vá para **Deployments**
2. Clique no último deployment
3. Vá para **Functions** → **View Function Logs**
4. Verifique se não há erros relacionados ao Supabase

---

## 🚨 Problemas Comuns

### Erro: "Missing NEXT_PUBLIC_SUPABASE_URL"
**Causa:** Variável não configurada no Vercel
**Solução:** Adicione `NEXT_PUBLIC_SUPABASE_URL` nas Environment Variables

### Erro: "Invalid API key"
**Causa:** Chave incorreta ou de outro projeto
**Solução:** 
1. Verifique se copiou a chave correta do Supabase Dashboard
2. Certifique-se de que está usando as chaves do projeto de **produção**
3. Não adicione aspas ao redor dos valores

### Erro: "redirect_uri_mismatch" (Google OAuth)
**Causa:** URL não configurada no Supabase ou Google Cloud Console
**Solução:**
1. Verifique Redirect URLs no Supabase Dashboard
2. Verifique Authorized redirect URIs no Google Cloud Console
3. Use a URL do Supabase no Google Cloud Console (não a URL do seu domínio)

### Login com Google não funciona
**Causa:** Provider não habilitado ou credenciais incorretas
**Solução:**
1. Verifique se Google Provider está ON no Supabase
2. Verifique se Client ID e Secret estão corretos
3. Clique em **"Save"** após alterar
4. Aguarde 30 segundos para propagação

---

## 📚 Resumo Rápido

### Variáveis Obrigatórias no Vercel:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[SEU-PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://hipaahubhealth.com
```

### Variável Recomendada:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Onde Encontrar:
- **Supabase Dashboard** → **Settings** → **API**
- Copie **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copie **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copie **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

---

**Última atualização:** $(date)
**Domínio:** hipaahubhealth.com
