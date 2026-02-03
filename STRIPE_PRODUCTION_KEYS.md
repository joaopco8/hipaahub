# 🔑 Configuração das Chaves Stripe de Produção

## 📋 Variáveis de Ambiente para Configurar

Configure as seguintes variáveis de ambiente no seu ambiente de produção (Vercel, etc.):

### ✅ Chaves de Produção (Live Mode)

```env
# Stripe Secret Key (Server-side)
# Obtenha em: https://dashboard.stripe.com/apikeys (Live mode)
STRIPE_SECRET_KEY_LIVE=sk_live_YOUR_LIVE_SECRET_KEY_HERE

# Stripe Publishable Key (Client-side)
# Obtenha em: https://dashboard.stripe.com/apikeys (Live mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE
```

---

## 🔧 Como Configurar no Vercel

### Passo 1: Acessar Environment Variables
1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá para: **Settings** → **Environment Variables**

### Passo 2: Adicionar as Variáveis
Adicione as seguintes variáveis:

| Variável | Valor | Ambiente |
|----------|-------|----------|
| `STRIPE_SECRET_KEY_LIVE` | `sk_live_...` (obtenha no Stripe Dashboard → API Keys → Live mode) | Production, Preview, Development |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE` | `pk_live_...` (obtenha no Stripe Dashboard → API Keys → Live mode) | Production, Preview, Development |

### Passo 3: Redeploy
Após adicionar as variáveis, faça um novo deploy:
- Vercel fará deploy automaticamente, OU
- Vá para **Deployments** → Clique nos 3 pontos → **Redeploy**

---

## 📝 Como o Código Funciona

O código está configurado para usar as chaves de produção quando disponíveis:

### Server-side (`utils/stripe/config.ts`)
```typescript
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY_LIVE ?? process.env.STRIPE_SECRET_KEY ?? '',
  // ...
);
```
**Prioridade:**
1. `STRIPE_SECRET_KEY_LIVE` (produção)
2. `STRIPE_SECRET_KEY` (fallback/teste)

### Client-side (`utils/stripe/client.ts`)
```typescript
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE ??
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
        ''
    );
  }
  return stripePromise;
};
```
**Prioridade:**
1. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE` (produção)
2. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (fallback/teste)

---

## ⚠️ Importante

1. **Nunca commite essas chaves no Git**
   - Elas são sensíveis e devem estar apenas nas variáveis de ambiente

2. **Use apenas em produção**
   - Essas são chaves **LIVE** (produção)
   - Para desenvolvimento local, use chaves de teste (`pk_test_` e `sk_test_`)

3. **Webhook Secret**
   - Você também precisará configurar `STRIPE_WEBHOOK_SECRET` com o secret do webhook de produção
   - Obtenha em: Stripe Dashboard → Developers → Webhooks → Seu endpoint → Signing secret

4. **Verificar no Stripe Dashboard**
   - Acesse: https://dashboard.stripe.com/test/apikeys
   - Certifique-se de que está usando as chaves corretas (Live mode)

---

## ✅ Checklist de Verificação

Após configurar, verifique:

- [ ] `STRIPE_SECRET_KEY_LIVE` configurada no Vercel
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE` configurada no Vercel
- [ ] Variáveis marcadas para Production, Preview e Development
- [ ] Deploy realizado após adicionar as variáveis
- [ ] Teste de checkout funcionando
- [ ] Webhook de produção configurado (se aplicável)

---

## 🧪 Teste Rápido

1. Acesse sua aplicação em produção
2. Vá para a página de checkout
3. Tente fazer um pagamento de teste (use cartão de teste do Stripe)
4. Verifique se o pagamento é processado corretamente

**Cartões de teste Stripe:**
- Sucesso: `4242 4242 4242 4242`
- Qualquer data futura
- Qualquer CVC de 3 dígitos

---

## 📚 Referências

- [Stripe API Keys Documentation](https://stripe.com/docs/keys)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- Código: `utils/stripe/config.ts`
- Código: `utils/stripe/client.ts`

---

**Última atualização:** $(date)
**Domínio:** hipaahubhealth.com
