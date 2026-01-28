# 🚀 HIPAA Hub - Launch Checklist

## ⚠️ CRÍTICO - Fazer ANTES de lançar (P0)

### 1. Security Headers ✅
- [x] X-Content-Type-Options: nosniff
- [x] X-Frame-Options: SAMEORIGIN
- [x] X-XSS-Protection: 1; mode=block
- [x] **Strict-Transport-Security (HSTS)** - ✅ ADICIONADO (apenas em produção)
- [x] **Content-Security-Policy (CSP)** - ✅ MELHORADO
- [x] **Referrer-Policy** - ✅ ADICIONADO
- [x] **Permissions-Policy** - ✅ ADICIONADO

### 2. Rate Limiting ✅
- [x] Implementar rate limiting nas APIs críticas:
  - [x] `/api/documents/generate` - 10 req/min por usuário ✅
  - [x] `/api/evidence/upload` - 20 req/min por usuário ✅
  - [x] `/api/webhooks/stripe` - 100 req/min por IP ✅
  - [x] `/api/compliance-evidence/upload` - 15 req/min por usuário ✅
  - [x] `/auth/callback` - 5 req/min por IP ✅
- [x] Usar `@upstash/ratelimit` (Redis-based) com fallback in-memory
- [x] Configurar limites diferentes para autenticado vs não-autenticado
- [ ] **Configurar variáveis de ambiente Upstash** (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN)

### 3. Error Tracking ⚠️
- [ ] Integrar Sentry (`@sentry/nextjs`)
- [ ] Substituir todos `console.error` por `Sentry.captureException`
- [ ] Configurar source maps para produção
- [ ] Configurar alertas para erros críticos
- [ ] Filtrar dados sensíveis dos logs

### 4. Remover Console Logs ✅
- [x] `compiler.removeConsole` configurado no `next.config.mjs`
- [ ] Verificar que não há `console.log` em código crítico
- [ ] Manter apenas `console.error` até Sentry estar configurado

### 5. Health Check ✅
- [x] Endpoint `/api/health` criado
- [x] Adicionar verificação de:
  - [x] Database connection (Supabase)
  - [x] Storage connection (Supabase Storage)
  - [x] Environment variables check

### 6. Variáveis de Ambiente ✅
- [x] Criar `.env.example` completo (ver `docs/ENV-VARIABLES.md`)
- [x] Documentar todas as variáveis necessárias
- [ ] Verificar que nenhum secret está hardcoded (REVISAR CÓDIGO)
- [ ] Configurar todas as variáveis no Vercel Dashboard

### 7. Testes Básicos ⚠️
- [ ] Configurar Playwright ou Cypress
- [ ] Testar fluxo completo: Sign up → Onboarding → Dashboard
- [ ] Testar: Checkout → Subscription → Webhook
- [ ] Testar: Document generation → Evidence upload
- [ ] Testar: Training completion flow

---

## 🔒 HIPAA-SPECIFIC CRITICAL ITEMS

### 8. Business Associate Agreement (BAA) ⚠️
- [ ] BAA disponível para download em `/account` ou `/settings`
- [ ] BAA assinado e armazenado
- [ ] Link para BAA no footer ou termos

### 9. Data Retention & Deletion ⚠️
- [ ] Política de retenção de dados documentada
- [ ] Funcionalidade de exportação de dados (se prometida)
- [ ] Funcionalidade de exclusão de conta
- [ ] Processo de exclusão de dados após cancelamento

### 10. Audit Logging ⚠️
- [ ] Todos os acessos a dados sensíveis são logados
- [ ] Logs de auditoria são imutáveis (append-only)
- [ ] Logs incluem: timestamp, user_id, action, resource
- [ ] Logs são armazenados separadamente (não podem ser deletados por usuários)

### 11. Encryption ⚠️
- [ ] Verificar que Supabase Storage está com encryption at rest
- [ ] Verificar que todas as conexões são HTTPS
- [ ] Verificar que dados sensíveis não são logados em texto plano

### 12. Access Control ⚠️
- [ ] Verificar RLS (Row Level Security) no Supabase
- [ ] Verificar que usuários só acessam dados da própria organização
- [ ] Verificar que APIs verificam autenticação antes de processar

---

## 📋 IMPORTANTE - Fazer logo após lançar (P1)

### 13. CI/CD Básico
- [ ] Configurar GitHub Actions ou Vercel CI/CD
- [ ] Testes automáticos antes de deploy
- [ ] Lint e type check automáticos
- [ ] Deploy automático apenas após testes passarem

### 14. Monitoramento de Uptime
- [ ] Configurar UptimeRobot, Pingdom ou similar
- [ ] Monitorar `/api/health` endpoint
- [ ] Alertas para downtime > 1 minuto
- [ ] Status page público (opcional)

### 15. Estratégia de Backup
- [ ] Documentar processo de backup do Supabase
- [ ] Testar restore de backup
- [ ] Frequência de backups documentada
- [ ] Backup automático configurado

### 16. Documentação de Deploy
- [ ] Documentar processo de deploy
- [ ] Checklist de pré-deploy
- [ ] Rollback procedure documentada
- [ ] Variáveis de ambiente documentadas

---

## 🎯 DESEJÁVEL - Próximas semanas (P2)

### 17. Testes Completos
- [ ] Testes unitários (Jest + React Testing Library)
- [ ] Testes de integração
- [ ] Cobertura mínima de 70% em código crítico

### 18. Performance Monitoring
- [ ] Web Vitals tracking (Vercel Analytics já tem)
- [ ] Alertas para performance degradada
- [ ] Database query performance monitoring

### 19. Analytics Detalhado
- [ ] Event tracking configurado
- [ ] Conversão funil (signup → onboarding → subscription)
- [ ] User behavior tracking (opcional, respeitando privacidade)

### 20. Documentação Completa de API
- [ ] Documentar todas as rotas `/api/*`
- [ ] Exemplos de request/response
- [ ] Códigos de erro documentados

---

## 🔍 VERIFICAÇÕES FINAIS ANTES DO LAUNCH

### Segurança
- [ ] Nenhum secret hardcoded
- [ ] Todas as APIs protegidas com autenticação
- [ ] Input validation em todas as APIs
- [ ] SQL injection prevention (usar Supabase client, não raw SQL)
- [ ] XSS prevention (React já previne, mas verificar)
- [ ] CSRF protection (Next.js já tem, mas verificar)

### Compliance
- [ ] Privacy Policy atualizada e acessível
- [ ] Terms of Service atualizados
- [ ] Cookie Policy (se usar cookies)
- [ ] BAA disponível
- [ ] Disclaimer de "não é aconselhamento jurídico"

### Funcionalidades Core
- [ ] Sign up / Sign in funcionando
- [ ] Onboarding completo funcionando
- [ ] Risk assessment funcionando
- [ ] Policy generation funcionando
- [ ] Evidence upload funcionando
- [ ] Training module funcionando
- [ ] Checkout Stripe funcionando
- [ ] Webhook Stripe funcionando
- [ ] Dashboard carregando corretamente

### Performance
- [ ] Build sem erros: `pnpm build`
- [ ] Lint sem erros: `pnpm lint`
- [ ] Type check sem erros: `pnpm tsc --noEmit`
- [ ] Lighthouse score > 80 em todas as métricas
- [ ] First Contentful Paint < 1.8s
- [ ] Time to Interactive < 3.8s

### Produção
- [ ] Domínio configurado
- [ ] SSL/HTTPS funcionando
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Stripe em modo produção
- [ ] Supabase em produção
- [ ] Email service configurado (se usar)
- [ ] CDN configurado (Vercel já tem)

---

## 📝 NOTAS IMPORTANTES

### HIPAA Compliance
- Esta é uma aplicação HIPAA-compliant. Segurança e compliance são **CRÍTICOS**.
- Todos os dados de compliance são sensíveis e devem ser protegidos.
- Logs de auditoria são obrigatórios e devem ser imutáveis.
- Backup e disaster recovery são essenciais.

### Dados Sensíveis
- **NUNCA** logar dados de pacientes (PHI)
- **NUNCA** logar senhas ou tokens
- **SEMPRE** sanitizar inputs antes de processar
- **SEMPRE** validar permissões antes de acessar dados

### Rollback Plan
- Manter versão anterior deployada em staging
- Ter processo de rollback documentado
- Testar rollback antes do launch

---

## ✅ STATUS ATUAL

**Última atualização:** 2025-01-XX

**Progresso P0 (Crítico):** 5/7 completo (71%)
- ✅ Security Headers (COMPLETO)
- ✅ Rate Limiting (IMPLEMENTADO - precisa configurar Upstash)
- ❌ Error Tracking (Sentry) (documentação criada, precisa implementar)
- ✅ Console Logs Removidos
- ✅ Health Check (COMPLETO)
- ✅ .env.example (documentação criada)
- ❌ Testes Básicos

**Progresso P1 (Importante):** 0/4 completo (0%)
**Progresso P2 (Desejável):** 0/4 completo (0%)
