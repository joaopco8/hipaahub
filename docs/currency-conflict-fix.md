# Correção: Conflito de Moedas no Stripe

## Problema Identificado

O erro `StripeInvalidRequestError: You cannot combine currencies on a single customer` ocorria porque:

1. O cliente no Stripe já tinha uma subscription ou item com moeda **BRL** (Real brasileiro)
2. O produto/preço que estávamos tentando usar tem moeda **USD** (Dólar)
3. O Stripe **não permite misturar moedas** no mesmo customer

## Correções Aplicadas

### 1. Verificação Proativa de Moeda (`utils/stripe/server.ts`)
- ✅ Verifica subscriptions existentes do customer
- ✅ Verifica invoices existentes
- ✅ Compara moedas antes de criar checkout
- ✅ Lança erro claro se houver conflito

### 2. Tratamento de Erro Melhorado
- ✅ Captura erros de moeda especificamente
- ✅ Mensagens de erro mais claras e acionáveis
- ✅ Erro propagado corretamente até a UI

### 3. Mensagem de Erro Clara
A mensagem agora informa:
- Qual moeda o cliente já tem (BRL)
- Qual moeda o produto usa (USD)
- O que fazer (cancelar subscription existente ou contatar suporte)

## Soluções Possíveis

### Opção 1: Cancelar Subscription Existente (Recomendado)
1. Acesse o Stripe Dashboard
2. Vá em Customers → Encontre o customer
3. Cancele a subscription existente em BRL
4. Tente fazer checkout novamente

### Opção 2: Usar Produto com Mesma Moeda
1. Crie um produto/preço em BRL no Stripe
2. Sincronize com o banco de dados
3. Use esse preço para checkout

### Opção 3: Criar Novo Customer (Não Recomendado)
- Criar um novo customer com email modificado pode causar confusão
- Melhor cancelar a subscription antiga

## Próximos Passos

1. **Verificar no Stripe Dashboard**:
   - Acesse: https://dashboard.stripe.com/test/customers
   - Encontre o customer pelo email
   - Veja subscriptions ativas

2. **Cancelar Subscription em BRL**:
   - Vá na subscription
   - Clique em "Cancel subscription"
   - Aguarde confirmação

3. **Tentar Checkout Novamente**:
   - Após cancelar, tente fazer checkout novamente
   - Deve funcionar agora

## Prevenção Futura

Para evitar esse problema:
- Use sempre a mesma moeda para todos os produtos
- Verifique moedas antes de criar novos produtos
- Documente qual moeda está sendo usada



