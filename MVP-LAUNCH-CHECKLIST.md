# 🚀 HIPAA Hub - MVP Launch Checklist (Custo Mínimo)

## 💰 Estratégia de Custos

**Objetivo:** Lançar MVP com custo próximo de **$0-20/mês**

### Ferramentas Gratuitas/Baratas:
- ✅ **Vercel** - Hosting gratuito (Hobby plan)
- ✅ **Supabase** - Free tier (500MB DB, 1GB storage, 50k MAU)
- ✅ **Stripe** - Sem custo fixo (apenas % por transação)
- ✅ **Upstash Redis** - Free tier (10k commands/dia)
- ✅ **Sentry** - Free tier (5k errors/mês)
- ✅ **Vercel Analytics** - Já incluído
- ✅ **GitHub** - Gratuito para repositórios públicos/privados

---

## ✅ O QUE JÁ ESTÁ PRONTO

### Funcionalidades Core
- ✅ Onboarding completo
- ✅ Risk Assessment (150+ perguntas)
- ✅ Document Generation (9 políticas)
- ✅ Evidence Upload
- ✅ Training Module
- ✅ Dashboard básico
- ✅ Stripe Checkout
- ✅ Authentication (Supabase Auth)

### Infraestrutura
- ✅ Security Headers
- ✅ Rate Limiting (com fallback in-memory)
- ✅ Health Check endpoint
- ✅ Console logs removidos em produção

---

## 🎯 CHECKLIST MÍNIMO PARA MVP (P0)

### 1. **Configurar Variáveis de Ambiente no Vercel** ⏱️ 15min
**Custo: $0**

```bash
# Variáveis obrigatórias:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_ID_YEARLY=...
```

**Ação:** Ir em Vercel Dashboard → Project Settings → Environment Variables

---

### 2. **Configurar Stripe Webhook** ⏱️ 10min
**Custo: $0**

1. Ir em Stripe Dashboard → Developers → Webhooks
2. Adicionar endpoint: `https://seu-dominio.com/api/webhooks/stripe`
3. Selecionar eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copiar webhook secret → adicionar no Vercel como `STRIPE_WEBHOOK_SECRET`

---

### 3. **Testar Fluxo Completo Manualmente** ⏱️ 30min
**Custo: $0**

Testar manualmente (sem automação):
- [ ] Sign up → Onboarding completo
- [ ] Checkout → Pagamento (usar cartão de teste Stripe)
- [ ] Webhook recebido → Subscription ativa
- [ ] Gerar 1 documento
- [ ] Upload 1 evidência
- [ ] Completar 1 treinamento

**Cartão de teste Stripe:** `4242 4242 4242 4242` (qualquer data futura, qualquer CVC)

---

### 4. **Error Tracking Básico (Sentry Free)** ⏱️ 20min
**Custo: $0** (Free tier: 5k errors/mês)

**Opção 1: Sentry (Recomendado)**
```bash
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Opção 2: Apenas Vercel Logs (Mais simples)**
- Vercel já tem logs básicos
- Pode adiar Sentry se quiser

**Ação:** Se escolher Sentry, seguir `docs/SENTRY-SETUP.md`

---

### 5. **Upstash Redis (Opcional para MVP)** ⏱️ 10min
**Custo: $0** (Free tier: 10k commands/dia)

**Status:** Rate limiting já funciona sem Upstash (usa in-memory)
**Ação:** Pode adiar se quiser. Quando precisar:
1. Criar conta em upstash.com
2. Criar database Redis
3. Adicionar `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` no Vercel

---

### 6. **BAA (Business Associate Agreement)** ⏱️ 30min
**Custo: $0** (usar template)

**Ação:**
- [ ] Criar PDF do BAA (pode usar template genérico)
- [ ] Adicionar link no footer: `/terms` ou `/baa`
- [ ] Disponibilizar para download em `/account`

**Template:** Pode usar template genérico de BAA para SaaS (buscar online)

---

### 7. **Privacy Policy & Terms** ⏱️ 1h
**Custo: $0** (usar gerador ou template)

**Ação:**
- [ ] Verificar se `/privacy` e `/terms` existem
- [ ] Atualizar com informações reais da empresa
- [ ] Adicionar link no footer

**Ferramentas gratuitas:**
- Termly.io (free tier)
- PrivacyPolicyGenerator.net
- Ou usar templates do GitHub

---

### 8. **Domínio e SSL** ⏱️ 15min
**Custo: $0-15/ano** (domínio)

**Ação:**
- [ ] Comprar domínio (Namecheap, Cloudflare, etc.)
- [ ] Configurar DNS no Vercel
- [ ] SSL automático (Vercel faz isso)

**Opção mais barata:** Cloudflare Registrar ($8-10/ano)

---

### 9. **Testar em Produção** ⏱️ 1h
**Custo: $0**

**Checklist de teste:**
- [ ] Sign up funciona
- [ ] Onboarding completo funciona
- [ ] Checkout funciona (cartão de teste)
- [ ] Webhook recebe eventos
- [ ] Dashboard carrega
- [ ] Geração de documento funciona
- [ ] Upload de evidência funciona
- [ ] Treinamento funciona

---

## ⚠️ O QUE PODE ADIAR (NÃO É CRÍTICO PARA MVP)

### ❌ Testes Automatizados (E2E)
**Por quê adiar:** MVP pode ser testado manualmente
**Quando fazer:** Depois de ter primeiros clientes pagos

### ❌ CI/CD Completo
**Por quê adiar:** Vercel já faz deploy automático do GitHub
**Quando fazer:** Quando tiver múltiplos desenvolvedores

### ❌ Monitoramento Avançado
**Por quê adiar:** Vercel Analytics + Sentry free já cobrem o básico
**Quando fazer:** Quando tiver tráfego significativo

### ❌ Backup Automatizado
**Por quê adiar:** Supabase free tier já tem backups automáticos
**Quando fazer:** Quando passar para paid tier

### ❌ Exportação de Dados
**Por quê adiar:** Não prometido no MVP
**Quando fazer:** Quando clientes pedirem

### ❌ RBAC (Role-Based Access Control)
**Por quê adiar:** MVP é para 1 usuário por organização
**Quando fazer:** Quando precisar de múltiplos usuários

---

## 📋 CHECKLIST FINAL ANTES DO LAUNCH

### Segurança (Crítico)
- [x] Security headers configurados
- [x] Rate limiting implementado
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Nenhum secret hardcoded (revisar código)
- [ ] HTTPS funcionando (Vercel faz automaticamente)

### Funcionalidades Core (Crítico)
- [x] Sign up / Sign in
- [x] Onboarding
- [x] Risk Assessment
- [x] Document Generation
- [x] Evidence Upload
- [x] Training
- [x] Checkout Stripe
- [ ] Webhook Stripe testado

### Legal/Compliance (Crítico)
- [ ] Privacy Policy atualizada
- [ ] Terms of Service atualizados
- [ ] BAA disponível
- [ ] Disclaimer "não é aconselhamento jurídico"

### Testes (Mínimo)
- [ ] Testar fluxo completo manualmente
- [ ] Testar checkout com cartão de teste
- [ ] Verificar webhook recebendo eventos

---

## 💰 CUSTOS ESTIMADOS DO MVP

| Item | Custo Mensal | Custo Anual | Notas |
|------|--------------|-------------|-------|
| **Vercel Hobby** | $0 | $0 | Free até 100GB bandwidth |
| **Supabase Free** | $0 | $0 | 500MB DB, 1GB storage |
| **Stripe** | $0 | $0 | Apenas % por transação |
| **Upstash Redis** | $0 | $0 | Free tier suficiente |
| **Sentry** | $0 | $0 | Free tier: 5k errors/mês |
| **Domínio** | $0 | $8-15 | Cloudflare Registrar |
| **TOTAL** | **$0** | **$8-15** | **Apenas domínio** |

**Quando começar a pagar:**
- Supabase: Quando passar de 500MB DB ou 1GB storage (~$25/mês)
- Vercel: Quando passar de 100GB bandwidth (~$20/mês)
- Upstash: Quando passar de 10k commands/dia (~$10/mês)

---

## 🚀 ORDEM DE EXECUÇÃO (Prioridade)

### Dia 1 (2-3 horas)
1. ✅ Configurar variáveis no Vercel
2. ✅ Configurar Stripe webhook
3. ✅ Testar fluxo completo manualmente
4. ✅ Verificar que build funciona: `pnpm build`

### Dia 2 (1-2 horas)
5. ✅ Adicionar BAA (template genérico)
6. ✅ Atualizar Privacy Policy e Terms
7. ✅ Testar checkout em produção
8. ✅ Verificar webhook funcionando

### Dia 3 (1 hora)
9. ✅ Revisar código para secrets hardcoded
10. ✅ Deploy final
11. ✅ Testar tudo em produção
12. ✅ **LANÇAR! 🎉**

---

## 🎯 O QUE É REALMENTE NECESSÁRIO PARA MVP

### Mínimo Absoluto (3-4 horas de trabalho):
1. ✅ Variáveis de ambiente no Vercel
2. ✅ Stripe webhook configurado
3. ✅ Teste manual do fluxo completo
4. ✅ Privacy Policy e Terms básicos
5. ✅ BAA disponível (mesmo que genérico)

### Tudo o resto pode esperar!

---

## 📝 NOTAS IMPORTANTES

### Sobre HIPAA Compliance:
- Você está vendendo uma **ferramenta de compliance**, não garantindo compliance
- Adicione disclaimer claro: "This tool helps with compliance but does not constitute legal advice"
- BAA genérico é aceitável para MVP (pode melhorar depois)

### Sobre Testes:
- Para MVP, **teste manual é suficiente**
- Não precisa de Playwright/Cypress agora
- Foque em testar o fluxo principal: Sign up → Onboarding → Checkout → Dashboard

### Sobre Monitoramento:
- Vercel Logs + Sentry Free são suficientes para MVP
- Não precisa de UptimeRobot/Pingdom agora
- Adicione quando tiver clientes pagos

### Sobre Custos:
- **Comece com tudo free**
- Escale quando necessário
- Supabase free tier aguenta ~50-100 usuários ativos

---

## ✅ RESUMO: O QUE FALTA PARA MVP

**Tempo estimado:** 4-6 horas
**Custo:** $8-15 (apenas domínio)

1. ⏱️ 15min - Configurar env vars no Vercel
2. ⏱️ 10min - Configurar Stripe webhook
3. ⏱️ 30min - Testar fluxo completo
4. ⏱️ 30min - Adicionar BAA
5. ⏱️ 1h - Atualizar Privacy Policy/Terms
6. ⏱️ 1h - Revisar código e deploy final

**Total: ~4 horas de trabalho + $8-15 de domínio = MVP pronto!**

---

## 🚨 RED FLAGS (Não lançar se isso não funcionar)

- ❌ Checkout não funciona
- ❌ Webhook não recebe eventos
- ❌ Usuário não consegue completar onboarding
- ❌ Documentos não geram
- ❌ Evidências não fazem upload

**Tudo o resto pode ter bugs menores e ser corrigido depois!**
