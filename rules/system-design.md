System Design — HIPAA Hub

o app deve ser todo em ingles, pois será para os EUA.

System Overview

Web application SaaS para ajudar clínicas e consultórios de pequeno porte nos EUA a alcançar e manter conformidade com a HIPAA.

Plataforma centralizada para:

geração de documentos HIPAA

avaliação de riscos

gestão de políticas

treinamento de funcionários

organização de evidências para auditoria

Fluxos guiados e automatizados, com suporte de IA para reduzir complexidade e erros.

Não armazena dados clínicos de pacientes (PHI) — apenas documentação e metadados de compliance.

Architecture Pattern

Frontend: Single Page Application (SPA) usando React + Next.js

Backend: Arquitetura serverless / API-based hospedada em Vercel

AI/LLM Service: Serviço dedicado para:

geração de documentos

explicações de requisitos HIPAA

adaptação de templates conforme perfil da clínica

Clear separation entre:

camada de UI (compliance flows)

camada de API (regras, persistência, segurança)

State Management

Local State:

React hooks para formulários, checklists e edições de documentos

Global State:

Context API para:

status de compliance

progresso do onboarding

dados da clínica

Server State Sync:

Sincronização contínua com Supabase

Derived State:

Status automático de:

compliant

attention needed

non-compliant

Data Flow
1. Onboarding & Assessment

Input: Usuário responde questionário inicial sobre a clínica

Processing: Backend gera um Compliance Roadmap personalizado

Output: Checklist estruturado por exigências HIPAA

2. Document Generation

Input: Dados da clínica + tipo de documento

Processing: Envio ao serviço LLM com template HIPAA específico

Output: Documento gerado (editável)

Storage: Documento salvo no Supabase com versionamento

3. Risk Assessment

Input: Respostas a checklists de risco

Processing: Classificação automática de riscos

Output: Relatório de análise de risco HIPAA

Review: Recomendações práticas exibidas ao usuário

4. Training & Attestation

Input: Funcionário acessa treinamento

Processing: Registro de conclusão + quiz

Output: Certificado gerado automaticamente

Storage: Evidência salva para auditoria

5. Audit Readiness

Input: Solicitação de auditoria/export

Processing: Agregação automática de documentos e evidências

Output: Audit Package exportável (ZIP/PDF)

Technical Stack
Frontend

React

Next.js

Tailwind CSS

Shadcn UI

Lucide Icons

Sonner Toast (feedback claro para ações de compliance)

Backend

Prisma

Supabase (Postgres + Storage)

Vercel (API routes)

AI / LLM

OpenAI ou equivalente

Prompt templates versionados por tipo de documento HIPAA

Authentication & Payments

Clerk Auth

Stripe

Authentication & Authorization

Autenticação via Clerk (email + MFA opcional)

Sessões seguras com token management

Role-Based Access Control (RBAC):

Owner / Admin

Staff

Funcionários podem:

acessar treinamentos

assinar termos

Apenas Admin pode:

gerar documentos

exportar auditoria

editar políticas

Route Design

/dashboard

Status geral de conformidade

Alertas e progresso

/onboarding

Questionário inicial da clínica

/roadmap

Checklist de requisitos HIPAA

/documents

Lista de documentos

Editor

Versionamento

/risk-assessment

Avaliação de riscos

Relatórios

/training

Treinamentos HIPAA

Certificados

/audit

Preparação e exportação de auditoria

/settings

Dados da clínica

Usuários

Billing

API Design
Core Endpoints

Clinic

POST /clinic

GET /clinic

Documents

POST /documents/generate

GET /documents

PUT /documents/:id

DELETE /documents/:id

Risk Assessment

POST /risk-assessment

GET /risk-assessment/report

Training

POST /training/complete

GET /training/status

Audit

POST /audit/export

Auth

Managed via Clerk webhooks

All APIs use JSON with strict validation and error handling.

Database Design (ERD)
Users Table

id

clinic_id

name

email

role (admin / staff)

created_at

Clinics Table

id

name

type (medical, dental, mental health, etc.)

state

created_at

Documents Table

id

clinic_id

type (policy, BAA, risk_report, etc.)

content

version

status (draft / approved)

created_at

updated_at

Risk Assessments Table

id

clinic_id

risk_level (low / medium / high)

report_data

created_at

Trainings Table

id

clinic_id

user_id

status (pending / completed)

completed_at

Audit Logs Table

id

clinic_id

action

performed_by

timestamp

metadata

Security Considerations (Critical for HIPAA Context)

No PHI storage

Encryption at rest and in transit

Access logs

Strict RBAC

Regular dependency audits

Clear disclaimer: compliance support tool, not legal advice