# Evidence-Driven Questions JSON

## Status

✅ **Bucket de Storage Criado com Sucesso!**
- Nome: `evidence`
- Público: `false` (privado)
- Limite de tamanho: 50MB
- Tipos permitidos: PDF, DOC, DOCX, PNG, JPEG, CSV, JSON, TXT, LOG
- Policies RLS configuradas para acesso por usuário

## Próximo Passo

O arquivo `data/evidence-driven-questions.json` precisa conter todas as 112 perguntas do sistema Evidence-Driven Compliance.

### Estrutura Esperada

```json
{
  "metadata": {
    "total_questions": 112,
    "version": "2.0",
    "date": "2026-01-13",
    "system_type": "Evidence-Driven Compliance System",
    "legal_authority": "45 CFR Part 160 & 164, HITECH Act, NIST 800-53 Rev 5"
  },
  "questions": [
    {
      "question_id": "ADM-001",
      "sequence": 1,
      "original_question": "...",
      "rewritten_compliance_question": "[EVIDENCE-DRIVEN] ...",
      "hipaa_citation": "45 CFR §164.308(a)(2)",
      "nist_control": "AC-1, CA-1, PM-1",
      "risk_domain": "Confidentiality, Integrity, Availability",
      "severity": 5,
      "category": "administrative",
      "evidence_required": true,
      "evidence_type": ["document", "attestation"],
      "evidence_instructions_for_user": "...",
      "backend_field_definition": {
        "evidence_required": true,
        "evidence_type": ["document", "attestation"],
        "required_if": "answer == 'yes' or answer == 'partially compliant'",
        "retention": "7 years minimum",
        "legal_weight": "OCR defensible - litigation grade",
        "audit_trail": true,
        "timestamp_required": true,
        "signer_required": true
      }
    },
    // ... mais 111 perguntas
  ]
}
```

### Como Adicionar

1. Copie o conteúdo completo do arquivo `HIPAA_Evidence_Driven_System.json` que você forneceu
2. Cole no arquivo `data/evidence-driven-questions.json`
3. O sistema irá carregar automaticamente todas as 112 perguntas

### Verificação

Após adicionar o JSON completo, você pode verificar se está funcionando:

1. Acesse a página de Risk Assessment
2. Responda uma pergunta que requer evidência (ex: ADM-001)
3. O componente de upload de evidência deve aparecer
4. Faça upload de um arquivo
5. Verifique no Supabase Storage que o arquivo foi salvo no bucket `evidence`

## Sistema Pronto

✅ Database schema criado
✅ Storage bucket criado e configurado
✅ API de upload implementada
✅ Componente de upload criado
✅ Integração no onboarding completa
⏳ JSON completo precisa ser adicionado (você forneceu anteriormente)
