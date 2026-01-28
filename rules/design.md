HIPAA Guard — Basic UI Design System
1. Design Principles (Regra de Ouro)

Antes dos componentes, essas regras não podem ser quebradas:

Clareza > Estética

Nada decorativo sem função

Tudo deve parecer auditável

Poucas cores, alto contraste

Espaço em branco é segurança

O usuário precisa sentir:

“Esse software sabe o que está fazendo.”

2. Color System (Uso Prático)
🎨 Cores Base
Primary Dark (Brand Core): #0c0b1d
Primary Green (Action):    #1ad07a
Gray Background:           #f3f5f9
White Surface:             #ffffff

🧭 Função de Cada Cor
🔵 #0c0b1d — Dark Blue

Uso:

Sidebar

Header

Textos principais

Ícones críticos

Background de dashboards

Nunca usar:

Botões de ação primária

🟢 #1ad07a — Green (Trust / Action)

Uso restrito:

Botão primário

Status “Compliant”

Confirmações

Call to action

Regra:

Se tudo for verde, nada é importante.

⚪ #ffffff — White

Uso:

Cards

Modais

Tabelas

Superfícies de leitura

⚙️ #f3f5f9 — Gray

Uso:

Background geral

Separação visual

Layout base

3. Layout Base (Web App)
🧱 Estrutura Geral
┌──────── Sidebar (Dark) ────────┐
│                                │
│                                │
│                                │
└────────────────────────────────┘

┌──────── Main Area ─────────────┐
│ Header                         │
│                                │
│ Cards / Tables / Content       │
│                                │
└────────────────────────────────┘

📐 Grid

12 columns

Max-width: 1280px

Padding lateral: 24px

Gap entre blocos: 24px

4. Componentes Essenciais
4.1 Sidebar

Background: #0c0b1d
Texto: #ffffff (80% opacity)

Conteúdo:

Logo HIPAA Guard

Dashboard

Risk Analysis

Documents

Compliance Status

Settings

Regras:

Ícones simples (outline)

Nada animado

Sempre visível (desktop)

4.2 Header (Top Bar)

Background: #ffffff
Altura: 72px

Contém:

Page title (H4 / H5)

Clinic name

User profile (simples)

Sem:

Gradientes

Informações desnecessárias

4.3 Cards

Background: #ffffff
Border radius: 12px
Shadow: leve, quase invisível

Exemplo de Card:

Título (H5)

Métrica

Status (badge)

4.4 Buttons
🟢 Primary Button
Background: #1ad07a
Text: #0c0b1d
Font: P2 (16px)
Radius: 10px


Uso:

Generate Report

Fix Issue

Continue Setup

⚪ Secondary Button
Background: transparent
Border: 1px solid #0c0b1d
Text: #0c0b1d

4.5 Status Badges
Compliant:    Green
At Risk:     Yellow (opcional depois)
Non-Compliant: Red (uso mínimo)


Sempre:

Texto curto

Sem ícone exagerado

4.6 Tables (Essencial para HIPAA)

Fundo branco

Linhas bem espaçadas

Texto P2

Header com H6

Nada de tabela “criativa”.

5. Tipografia Aplicada (na prática)
Hero / Page Title

H1 (64px) → apenas landing / onboarding

Dashboard Title

H3 (32px)

Card Titles

H5 (24px)

Texto principal

P2 (16px)

Metadata / labels

P3 (14px)

6. Ícones

Regras:

Outline

Stroke simples

Sem ilustração

Sempre funcional

Estilo:

Shield

Check

Lock

Document

Alert

7. UX Rules (Muito Importante)

Nunca mais de 1 CTA verde por tela

Estados claros:

Loading

Success

Error

Tudo precisa ter:

Tooltip

Explicação simples

Linguagem humana, não jurídica

8. Sensação Final do Produto

O HIPAA Guard deve parecer:

Um sistema interno de hospital

Um software de auditoria

Um guardião silencioso

Não:

App de saúde

App fitness

App “bonitinho”