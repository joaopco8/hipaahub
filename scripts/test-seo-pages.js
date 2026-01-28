// Script para listar todas as páginas SEO criadas
const pages = {
  panic: [
    '/blog/hipaa-audit-checklist',
    '/blog/hipaa-fine-calculator',
    '/blog/what-happens-if-you-fail-hipaa-audit',
    '/blog/do-small-clinics-need-hipaa-compliance',
    '/blog/hipaa-violation-penalties-real-numbers',
    '/blog/hipaa-audit-timeline',
    '/blog/hipaa-breach-notification-requirements',
    '/blog/ocr-audit-preparation-30-day-checklist',
    '/blog/hipaa-compliance-failures-why-small-clinics-fail',
  ],
  authority: [
    '/blog/complete-hipaa-compliance-guide',
    '/blog/how-small-healthcare-providers-stay-hipaa-compliant',
    '/blog/hipaa-security-rule-explained',
    '/blog/hipaa-privacy-rule',
    '/blog/hipaa-breach-notification-rule-complete-guide',
    '/blog/hipaa-risk-assessment-complete-guide',
  ],
  transactional: [
    '/blog/hipaa-compliance-software-manual-vs-automated',
    '/blog/hipaa-policy-templates-diy-vs-professional',
    '/blog/hipaa-documentation-generator-save-40-hours',
    '/blog/hipaa-risk-assessment-tool-automated-vs-manual',
    '/blog/hipaa-compliance-checklist-digital-vs-paper',
    '/blog/hipaa-training-management-manual-vs-automated',
    '/blog/hipaa-evidence-vault-organize-documentation',
    '/blog/hipaa-audit-defense-how-to-prepare',
  ],
};

console.log('='.repeat(60));
console.log('HIPAA HUB - PÁGINAS SEO CRIADAS');
console.log('='.repeat(60));
console.log(`\n📄 PANIC PAGES (${pages.panic.length} páginas):`);
pages.panic.forEach((page, i) => {
  console.log(`   ${i + 1}. ${page}`);
});

console.log(`\n📚 AUTHORITY PAGES (${pages.authority.length} páginas):`);
pages.authority.forEach((page, i) => {
  console.log(`   ${i + 1}. ${page}`);
});

console.log(`\n💼 TRANSACTIONAL PAGES (${pages.transactional.length} páginas):`);
pages.transactional.forEach((page, i) => {
  console.log(`   ${i + 1}. ${page}`);
});

const total = pages.panic.length + pages.authority.length + pages.transactional.length;
console.log(`\n✅ TOTAL: ${total} páginas criadas`);
console.log('\n' + '='.repeat(60));
console.log('\nPara testar:');
console.log('1. Execute: npm run dev');
console.log('2. Acesse: http://localhost:3000' + pages.panic[0]);
console.log('3. Teste cada página listada acima');
console.log('\n' + '='.repeat(60));
