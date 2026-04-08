import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getRiskAssessment, getUser } from '@/utils/supabase/queries';
import { QUESTIONS, DOMAINS, DOMAIN_MAX, TOTAL_MAX } from '@/app/(dashboard)/dashboard/risk-assessment/questions';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ─── Color constants ──────────────────────────────────────────────────────────

const navyHex   = '#0e274e';
const blueHex   = '#00bceb';
const greenHex  = '#71bc48';
const redHex    = '#e2231a';
const amberHex  = '#fbab18';
const darkRedHex = '#8b0000';

function tierColor(tier: string): string {
  if (tier === 'PROTECTED') return greenHex;
  if (tier === 'PARTIAL')   return amberHex;
  if (tier === 'AT_RISK')   return redHex;
  if (tier === 'CRITICAL')  return darkRedHex;
  return navyHex;
}

function tierLabel(tier: string): string {
  if (tier === 'PROTECTED') return 'PROTECTED';
  if (tier === 'PARTIAL')   return 'PARTIAL';
  if (tier === 'AT_RISK')   return 'AT RISK';
  if (tier === 'CRITICAL')  return 'CRITICAL';
  return tier;
}

function scoreFromDisplay(displayScore: number): string {
  if (displayScore >= 85) return 'PROTECTED';
  if (displayScore >= 55) return 'PARTIAL';
  if (displayScore >= 25) return 'AT_RISK';
  return 'CRITICAL';
}

// ─── Domain 1 narrative helpers ───────────────────────────────────────────────

function d1Narrative(orgName: string, answers: Record<string, string>): string[] {
  const paragraphs: string[] = [];

  const q1 = answers['Q1'];
  if (q1 === 'A') paragraphs.push(`${orgName} maintains a current, written inventory of all systems, applications, and devices that store or transmit ePHI. This inventory is reviewed at least annually.`);
  else if (q1 === 'B') paragraphs.push(`${orgName} maintains a written inventory of systems handling ePHI; however, this inventory has not been updated within the past year and may not reflect recent changes to the technology environment.`);
  else if (q1 === 'C') paragraphs.push(`${orgName} currently maintains only an informal mental inventory of ePHI-handling systems. No formal written documentation exists, presenting a significant gap relative to OCR expectations.`);
  else if (q1 === 'D') paragraphs.push(`${orgName} does not currently maintain any inventory of systems, applications, or devices that handle ePHI. This is a critical deficiency that must be remediated immediately.`);
  else paragraphs.push(`${orgName}: PHI systems inventory status was not assessed.`);

  const q2 = answers['Q2'];
  if (q2) {
    const letters = q2.split(',').map(l => l.trim());
    const locations: string[] = [];
    if (letters.includes('A')) locations.push('a cloud-based EHR managed by a HIPAA-compliant vendor with a signed BAA');
    if (letters.includes('B')) locations.push('a local server at the practice');
    if (letters.includes('C')) locations.push('individual staff computers (local hard drives)');
    if (letters.includes('D')) locations.push('personal devices owned by staff');
    if (letters.includes('E')) locations.push('external hard drives or USB drives');
    if (locations.length > 0) {
      paragraphs.push(`Electronic patient records are stored in the following locations: ${locations.join('; ')}. ${letters.some(l => ['C','D','E'].includes(l)) ? 'Storage on uncontrolled endpoints (staff computers, personal devices, or external media) presents elevated breach risk and requires immediate policy attention.' : 'All storage locations are subject to BAA coverage.'}`);
    }
  } else {
    paragraphs.push('ePHI storage locations were not assessed.');
  }

  const q3 = answers['Q3'];
  if (q3 === 'A') paragraphs.push('The practice does not use paper records containing PHI.');
  else if (q3 === 'B') paragraphs.push('Paper records containing PHI exist and are stored in locked cabinets with restricted access.');
  else if (q3 === 'C') paragraphs.push('Paper records containing PHI exist; however, storage is not consistently locked or restricted, creating a physical PHI exposure risk.');
  else if (q3 === 'D') paragraphs.push('Paper records containing PHI exist with no formal storage policy in place. This represents a direct physical safeguard deficiency.');
  else paragraphs.push('Paper record usage was not assessed.');

  const q5 = answers['Q5'];
  if (q5 === 'A') paragraphs.push('Staff cell phone use for patient communication is prohibited under practice policy, with a compliant communication system provided as an alternative.');
  else if (q5 === 'B') paragraphs.push('Staff use personal cell phones for scheduling-related patient communication only; clinical details are not transmitted through this channel.');
  else if (q5 === 'C') paragraphs.push('Staff use personal cell phones for clinical patient communication via a HIPAA-compliant messaging application with a signed BAA.');
  else if (q5 === 'D') paragraphs.push('Staff use personal cell phones for patient communication via unencrypted SMS or phone calls without specific safeguards. This is a high-risk practice requiring immediate remediation.');
  else paragraphs.push('Staff cell phone usage for patient communication was not assessed.');

  const q6 = answers['Q6'];
  if (q6 === 'A') paragraphs.push('Telehealth services are conducted via a HIPAA-compliant platform with a signed Business Associate Agreement in place.');
  else if (q6 === 'B') paragraphs.push('The practice uses a telehealth platform but has not yet executed a Business Associate Agreement with the platform vendor. This is a compliance gap requiring immediate action.');
  else if (q6 === 'C') paragraphs.push('Telehealth is conducted via a consumer video tool (e.g., standard Zoom, FaceTime, or Skype) that is not HIPAA-compliant. This represents a significant regulatory violation.');
  else if (q6 === 'D' || q6 === 'E') paragraphs.push('The practice does not provide telehealth services; this area is not applicable.');
  else paragraphs.push('Telehealth platform compliance status was not assessed.');

  const q7 = answers['Q7'];
  if (q7 === 'A') paragraphs.push('Email communication of PHI is conducted through a HIPAA-compliant email provider with a signed BAA. Encryption in transit is verified.');
  else if (q7 === 'B') paragraphs.push('The practice uses Google Workspace or Microsoft 365 for PHI email communication without a signed BAA. These platforms can be made HIPAA-compliant, but a BAA must first be executed.');
  else if (q7 === 'C') paragraphs.push('PHI is communicated via personal email accounts (e.g., Gmail, Yahoo). This is a direct HIPAA violation requiring immediate cessation and migration to a compliant platform.');
  else if (q7 === 'D') paragraphs.push('PHI communication is conducted exclusively through a secure patient portal; standard email is not used for PHI.');
  else paragraphs.push('Email PHI communication practices were not assessed.');

  const q8 = answers['Q8'];
  if (q8 === 'A') paragraphs.push('Patient data is backed up through an automated process to an encrypted, HIPAA-compliant cloud location. Backup restoration is tested regularly.');
  else if (q8 === 'B') paragraphs.push('Patient data backup exists but backups are not encrypted or not regularly tested. This partial control provides limited protection against data loss.');
  else if (q8 === 'C') paragraphs.push('Data backup is performed irregularly without a formal schedule. This creates meaningful risk of data loss from ransomware, hardware failure, or disaster.');
  else if (q8 === 'D') paragraphs.push('No data backup system is in place. This is a critical deficiency under HIPAA\'s Contingency Planning requirements (45 CFR 164.308(a)(7)).');
  else paragraphs.push('Data backup practices were not assessed.');

  return paragraphs;
}

// ─── Domain 2 + 5 narrative helpers ──────────────────────────────────────────

function d2Narrative(answers: Record<string, string>): string[] {
  const paragraphs: string[] = [];

  const q15 = answers['Q15'];
  if (q15 === 'A') paragraphs.push('Every user who accesses patient data has been assigned individual, unique login credentials across all PHI-containing systems, satisfying the HIPAA Unique User Identification standard (45 CFR 164.312(a)(2)(i)).');
  else if (q15 === 'B') paragraphs.push('Individual credentials are used within the EHR; however, some ancillary systems use shared login credentials. Shared accounts create gaps in the audit trail and represent a HIPAA violation on those systems.');
  else if (q15 === 'C') paragraphs.push('Some systems use shared credentials as standard practice. This directly violates the HIPAA Unique User Identification requirement and makes access attribution impossible.');
  else if (q15 === 'D') paragraphs.push('Multiple staff share the same login on primary systems. This is a critical HIPAA violation — unique user identification is a required technical safeguard with no exceptions.');
  else paragraphs.push('User credential management practices were not assessed.');

  const q16 = answers['Q16'];
  if (q16 === 'A') paragraphs.push('Multi-factor authentication (MFA) is enabled and enforced across all systems containing PHI, providing protection against credential-based attacks.');
  else if (q16 === 'B') paragraphs.push('MFA is enabled on the EHR but not on email or cloud storage systems. This partial coverage leaves credential-based attack vectors open on secondary systems.');
  else if (q16 === 'C') paragraphs.push('MFA is available on PHI systems but is optional and has not been widely adopted by staff. Optional MFA provides negligible protection.');
  else if (q16 === 'D') paragraphs.push('MFA is not in use on any practice systems. This is a critical gap — credential-based attacks are the leading cause of healthcare breaches.');
  else paragraphs.push('Multi-factor authentication status was not assessed.');

  const q17 = answers['Q17'];
  if (q17 === 'A') paragraphs.push('New staff access to PHI systems is granted through a formal, documented access request and approval process with minimum-necessary access enforced.');
  else if (q17 === 'B') paragraphs.push('Access is provisioned based on job role without formal documentation. While role-based, the lack of documentation creates audit trail gaps.');
  else if (q17 === 'C') paragraphs.push('New staff receive the same access level as whoever trained them, without a systematic review of minimum-necessary requirements.');
  else if (q17 === 'D') paragraphs.push('No formal access provisioning process exists. Staff may receive excessive access without documented justification, violating the Minimum Necessary standard.');
  else paragraphs.push('Access provisioning practices were not assessed.');

  const q18 = answers['Q18'];
  if (q18 === 'A') paragraphs.push('Access permissions are subject to formal periodic review at least annually, with findings documented and over-privileged accounts remediated.');
  else if (q18 === 'B') paragraphs.push('Access reviews occur informally without consistent documentation. Staff roles may drift from their access permissions over time without detection.');
  else if (q18 === 'C') paragraphs.push('Access reviews occur only when a problem is identified, rather than proactively. Accumulated over-privilege from role changes may go undetected.');
  else if (q18 === 'D') paragraphs.push('No periodic access review process is in place. Over-privileged accounts from role changes or departures may remain active indefinitely.');
  else paragraphs.push('Periodic access review practices were not assessed.');

  const q19 = answers['Q19'];
  if (q19 === 'A') paragraphs.push('Audit logs are generated by the EHR and reviewed at least quarterly. This satisfies the HIPAA Audit Control requirement (45 CFR 164.312(b)).');
  else if (q19 === 'B') paragraphs.push('Audit logs are generated but are rarely or never reviewed. Log generation alone does not satisfy the intent of the Audit Control requirement, which presupposes active monitoring.');
  else if (q19 === 'C') paragraphs.push('It is uncertain whether audit logging is enabled. This must be verified with the EHR vendor immediately.');
  else if (q19 === 'D') paragraphs.push('Audit logs are not generated or not available. This is a direct deficiency under the HIPAA Technical Safeguard requiring audit controls.');
  else paragraphs.push('Audit log generation practices were not assessed.');

  const q20 = answers['Q20'];
  if (q20 === 'A') paragraphs.push('Audit logs are actively reviewed for unusual access patterns (e.g., after-hours access, bulk downloads, cross-patient browsing) with documented findings and follow-up.');
  else if (q20 === 'B') paragraphs.push('Audit log review occurs occasionally but is not systematic. Without structured review protocols, unusual access patterns may go undetected.');
  else if (q20 === 'C') paragraphs.push('Audit log review occurs only after a reported incident — not proactively. OCR expects proactive monitoring, not just reactive review.');
  else if (q20 === 'D') paragraphs.push('Audit logs are not reviewed. The combination of generated but unreviewed logs indicates a control that exists on paper but not in practice.');
  else paragraphs.push('Audit log review practices were not assessed.');

  const q21 = answers['Q21'];
  if (q21 === 'A') paragraphs.push('A written offboarding checklist ensures access is revoked within hours of a staff member\'s departure, with documentation retained for audit purposes.');
  else if (q21 === 'B') paragraphs.push('Access revocation occurs upon termination but can take multiple days across all systems. This window of residual access represents a compliance gap.');
  else if (q21 === 'C') paragraphs.push('EHR access is revoked upon termination, but email and cloud storage credentials are sometimes missed. Former employees may retain access to PHI-containing systems.');
  else if (q21 === 'D') paragraphs.push('No formal credential revocation process exists for departing staff. Former employees likely retain active access to PHI systems after departure.');
  else paragraphs.push('Employee termination access revocation practices were not assessed.');

  const q47 = answers['Q47'];
  if (q47 === 'A') paragraphs.push('A complete written Business Associate inventory is maintained and updated regularly, satisfying the foundational requirement for vendor compliance management.');
  else if (q47 === 'B') paragraphs.push('Major Business Associates are identified, but the inventory may be incomplete. An unidentified BA is an unprotected vulnerability.');
  else if (q47 === 'C') paragraphs.push('Business Associates have not been formally identified. Without a complete BA inventory, BAA coverage cannot be verified.');
  else paragraphs.push('Business Associate identification status was not assessed.');

  const q48 = answers['Q48'];
  if (q48 === 'A') paragraphs.push('A signed Business Associate Agreement with the primary EHR vendor is on file and current.');
  else if (q48 === 'B') paragraphs.push('A BAA with the EHR vendor is believed to exist but cannot be located. An unverifiable BAA provides no practical protection in an audit.');
  else if (q48 === 'C') paragraphs.push('No BAA with the EHR vendor is in place. This is a direct HIPAA violation — operating an EHR containing PHI without a signed BAA is non-compliant regardless of vendor security posture.');
  else if (q48 === 'D') paragraphs.push('The practice uses an EHR that does not offer a BAA. This means the platform is either not HIPAA-eligible or the vendor\'s terms have not been reviewed. Immediate action required.');
  else paragraphs.push('EHR BAA status was not assessed.');

  const q49 = answers['Q49'];
  if (q49 === 'A') paragraphs.push('Signed BAAs are in place with all vendors who access PHI, and all agreements are on file. This represents full compliance with the BA Agreement requirements.');
  else if (q49 === 'B') paragraphs.push('Most vendors have signed BAAs but some may be missing. Any vendor handling PHI without a signed BAA represents a direct compliance gap.');
  else if (q49 === 'C') paragraphs.push('Only the EHR vendor has a signed BAA. All other vendors handling PHI (telehealth, billing, scheduling, email, cloud storage) require BAAs that are not yet in place.');
  else if (q49 === 'D') paragraphs.push('BAAs have not been collected from vendors. This is a systemic compliance deficiency affecting every vendor relationship involving PHI.');
  else paragraphs.push('Comprehensive BAA coverage was not assessed.');

  return paragraphs;
}

// ─── Risk register row builder ────────────────────────────────────────────────

interface RiskRow {
  description: string;
  source: string;
  likelihood: string;
  impact: string;
  controls: string;
}

const RISK_MAP: Record<string, { description: string; source: string; impactC: string; impactD: string; controlsC: string; controlsD: string }> = {
  Q1:  { description: 'PHI systems inventory incomplete or absent',       source: 'Unknown data exposure',    impactC: 'MEDIUM', impactD: 'HIGH',    controlsC: 'Informal tracking',    controlsD: 'No documentation'     },
  Q2:  { description: 'PHI stored on uncontrolled endpoints',             source: 'Device theft/loss',        impactC: 'HIGH',   impactD: 'HIGH',    controlsC: 'Encryption unverified',controlsD: 'None'                 },
  Q3:  { description: 'Paper PHI inadequately secured',                   source: 'Physical breach',          impactC: 'MEDIUM', impactD: 'HIGH',    controlsC: 'Partial controls',     controlsD: 'None'                 },
  Q5:  { description: 'PHI transmitted via unencrypted channels',         source: 'Interception/theft',       impactC: 'HIGH',   impactD: 'HIGH',    controlsC: 'App in use, BAA ok',   controlsD: 'None'                 },
  Q6:  { description: 'Non-compliant telehealth platform in use',         source: 'Regulatory/Interception',  impactC: 'HIGH',   impactD: 'HIGH',    controlsC: 'No BAA',               controlsD: 'Consumer tool'        },
  Q7:  { description: 'PHI transmitted via unencrypted email',            source: 'Interception',             impactC: 'HIGH',   impactD: 'HIGH',    controlsC: 'No BAA on provider',   controlsD: 'Personal email'       },
  Q8:  { description: 'Inadequate or absent data backup',                 source: 'Ransomware/Disaster',      impactC: 'MEDIUM', impactD: 'HIGH',    controlsC: 'Unencrypted backups',  controlsD: 'None'                 },
  Q15: { description: 'Unauthorized PHI access — no audit trail',         source: 'Shared credentials',       impactC: 'MEDIUM', impactD: 'HIGH',    controlsC: 'EHR only',             controlsD: 'None'                 },
  Q16: { description: 'Credential-based attacks succeed',                 source: 'Phishing/theft',           impactC: 'HIGH',   impactD: 'HIGH',    controlsC: 'MFA optional',         controlsD: 'None'                 },
  Q17: { description: 'Excessive PHI access granted to staff',            source: 'Insider/policy',           impactC: 'MEDIUM', impactD: 'HIGH',    controlsC: 'Role-based, informal', controlsD: 'None'                 },
  Q19: { description: 'Unauthorized access undetected',                   source: 'Insider threat',           impactC: 'MEDIUM', impactD: 'HIGH',    controlsC: 'Logs exist, unreviewed', controlsD: 'None'               },
  Q21: { description: 'Former employees retain PHI access',               source: 'Insider threat',           impactC: 'HIGH',   impactD: 'HIGH',    controlsC: 'Partial revocation',   controlsD: 'None'                 },
  Q27: { description: 'Data exposed on lost/stolen device',               source: 'Device theft',             impactC: 'HIGH',   impactD: 'HIGH',    controlsC: 'Partial encryption',   controlsD: 'None'                 },
  Q33: { description: 'PHI exposed on improperly disposed hardware',      source: 'Device disposal',          impactC: 'HIGH',   impactD: 'HIGH',    controlsC: 'Files deleted only',   controlsD: 'None'                 },
  Q37: { description: 'Network interception via insecure WiFi',           source: 'Network eavesdropping',    impactC: 'HIGH',   impactD: 'HIGH',    controlsC: 'Outdated encryption',  controlsD: 'Open network'         },
  Q40: { description: 'PHI intercepted in transit',                       source: 'Network interception',     impactC: 'MEDIUM', impactD: 'HIGH',    controlsC: 'Partial encryption',   controlsD: 'None'                 },
  Q41: { description: 'PHI transmitted via unencrypted email/SMS',        source: 'Interception',             impactC: 'MEDIUM', impactD: 'HIGH',    controlsC: 'Occasional',           controlsD: 'Regular practice'     },
  Q43: { description: 'Systems compromised via known vulnerabilities',    source: 'Ransomware/Exploit',       impactC: 'MEDIUM', impactD: 'HIGH',    controlsC: 'Manual/irregular',     controlsD: 'Outdated software'    },
  Q47: { description: 'Unknown BAs present unmanaged PHI risk',           source: 'Vendor risk',              impactC: 'MEDIUM', impactD: 'HIGH',    controlsC: 'Partial BA list',      controlsD: 'None'                 },
  Q48: { description: 'Operating without required BAA (EHR)',             source: 'Regulatory',               impactC: 'CERTAIN','impactD': 'CERTAIN', controlsC: 'BAA not located',   controlsD: 'None'                 },
  Q49: { description: 'Vendors handling PHI without BAAs',                source: 'Regulatory',               impactC: 'HIGH',   impactD: 'CERTAIN', controlsC: 'EHR only covered',    controlsD: 'None'                 },
  Q55: { description: 'No designated Privacy Officer',                    source: 'Governance gap',           impactC: 'MEDIUM', impactD: 'MEDIUM',  controlsC: 'Informal',             controlsD: 'None'                 },
  Q56: { description: 'Required HIPAA policies missing or outdated',      source: 'Policy gap',               impactC: 'MEDIUM', impactD: 'HIGH',    controlsC: 'Partial/outdated',     controlsD: 'None'                 },
  Q57: { description: 'Untrained staff create HIPAA violations',          source: 'Human error',              impactC: 'HIGH',   impactD: 'HIGH',    controlsC: 'Verbal only',          controlsD: 'None'                 },
  Q58: { description: 'Lapsed annual HIPAA training',                     source: 'Human error/policy',       impactC: 'MEDIUM', impactD: 'HIGH',    controlsC: 'Once at onboarding',   controlsD: 'None'                 },
  Q60: { description: 'Improper breach response causing OCR violations',  source: 'Regulatory',               impactC: 'CERTAIN','impactD': 'CERTAIN', controlsC: 'No written plan',   controlsD: 'None'                 },
  Q65: { description: 'NPP not provided or acknowledged',                 source: 'Privacy Rule',             impactC: 'MEDIUM', impactD: 'HIGH',    controlsC: 'Outdated NPP',         controlsD: 'None'                 },
};

function buildRiskRows(answers: Record<string, string>): RiskRow[] {
  const rows: RiskRow[] = [];
  for (const q of QUESTIONS) {
    const ans = answers[q.id];
    if (!ans || (ans !== 'C' && ans !== 'D')) continue;
    const map = RISK_MAP[q.id];
    if (!map) {
      // Generic fallback
      rows.push({
        description: q.text.slice(0, 60) + (q.text.length > 60 ? '...' : ''),
        source: 'See assessment',
        likelihood: ans === 'D' ? 'HIGH' : 'MEDIUM',
        impact: 'MEDIUM',
        controls: ans === 'D' ? 'None' : 'Partial',
      });
      continue;
    }
    rows.push({
      description: map.description,
      source: map.source,
      likelihood: ans === 'D' ? (map.impactD ?? 'HIGH') : (map.impactC ?? 'MEDIUM'),
      impact: 'HIGH',
      controls: ans === 'D' ? map.controlsD : map.controlsC,
    });
  }
  return rows;
}

// ─── Remediation rows ─────────────────────────────────────────────────────────

interface RemediationRow {
  priority: 'HIGH' | 'MEDIUM';
  finding: string;
  action: string;
  target: string;
}

function buildRemediationRows(answers: Record<string, string>): RemediationRow[] {
  const rows: RemediationRow[] = [];
  for (const q of QUESTIONS) {
    const ans = answers[q.id];
    if (!ans || (ans !== 'C' && ans !== 'D')) continue;
    rows.push({
      priority: ans === 'D' ? 'HIGH' : 'MEDIUM',
      finding: `[${q.id}] ` + q.text.slice(0, 55) + (q.text.length > 55 ? '...' : ''),
      action: q.remediation,
      target: ans === 'D' ? '30 days' : '90 days',
    });
  }
  // Sort HIGH first
  rows.sort((a, b) => (a.priority === b.priority ? 0 : a.priority === 'HIGH' ? -1 : 1));
  return rows;
}

// ─── GET handler ──────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch org name
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('user_id', user.id)
      .single();

    const orgName = org?.name ?? 'Your Practice';

    // Attempt to load v2 assessment
    const { data: v2Raw } = await (supabase as any)
      .from('onboarding_risk_assessments')
      .select('answers, domain_scores, display_score, tier, updated_at, completed_by')
      .eq('user_id', user.id)
      .single();

    let answers: Record<string, string> = {};
    let domainScores: Record<number, { raw: number; max: number; display: number }> | null = null;
    let displayScore = 0;
    let tier = 'UNKNOWN';
    let assessmentDate: string | null = null;
    let completedBy = 'Practice Administrator';
    let hasV2 = false;

    if (v2Raw && v2Raw.domain_scores) {
      hasV2 = true;
      answers = v2Raw.answers ?? {};
      domainScores = v2Raw.domain_scores;
      displayScore = v2Raw.display_score ?? 0;
      tier = v2Raw.tier ?? scoreFromDisplay(displayScore);
      assessmentDate = v2Raw.updated_at ?? null;
      completedBy = v2Raw.completed_by ?? 'Practice Administrator';
    } else {
      // Fall back to legacy risk assessment
      const legacyRisk = await getRiskAssessment(supabase, user.id);
      if (!legacyRisk) {
        return NextResponse.json({ error: 'No risk assessment found. Please complete the risk assessment first.' }, { status: 404 });
      }
      displayScore = legacyRisk.risk_percentage ?? 0;
      tier = scoreFromDisplay(displayScore);
      assessmentDate = legacyRisk.created_at ?? null;
    }

    const formattedDate = formatDate(assessmentDate);
    const currentYear = new Date().getFullYear().toString();

    // ─── Build PDF ────────────────────────────────────────────────────────────

    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;
    let currentPage = 1;

    // ── Footer helper ─────────────────────────────────────────────────────────
    const addFooter = () => {
      const footerY = pageHeight - 8;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      const gray = hexToRgb('#888888')!;
      doc.setTextColor(gray.r, gray.g, gray.b);
      doc.text(orgName, margin, footerY);
      doc.text(`Page ${currentPage}`, pageWidth / 2, footerY, { align: 'center' });
      doc.text(formattedDate, pageWidth - margin, footerY, { align: 'right' });
      const navy = hexToRgb(navyHex)!;
      doc.setDrawColor(navy.r, navy.g, navy.b);
      doc.setLineWidth(0.3);
      doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);
      doc.setTextColor(0, 0, 0);
    };

    // ── Page management ───────────────────────────────────────────────────────
    const newPage = () => {
      addFooter();
      doc.addPage();
      currentPage++;
      y = margin;
    };

    const checkPage = (needed = 10) => {
      if (y + needed > pageHeight - 18) {
        newPage();
      }
    };

    // ── Text helpers ──────────────────────────────────────────────────────────
    const addText = (text: string, size = 10, style = 'normal', color = '#333333', x?: number) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', style);
      const rgb = hexToRgb(color);
      if (rgb) doc.setTextColor(rgb.r, rgb.g, rgb.b);
      const lines = doc.splitTextToSize(text, contentWidth);
      const lineH = size * 0.4 + 1.2;
      checkPage(lines.length * lineH + 2);
      doc.text(lines, x !== undefined ? x : margin, y);
      y += lines.length * lineH + 1;
      doc.setTextColor(0, 0, 0);
    };

    const addSectionTitle = (text: string) => {
      y += 4;
      checkPage(14);
      const navy = hexToRgb(navyHex)!;
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(navy.r, navy.g, navy.b);
      const lines = doc.splitTextToSize(text, contentWidth);
      doc.text(lines, margin, y);
      y += lines.length * 6 + 2;
      doc.setTextColor(0, 0, 0);
    };

    const addSubtitle = (text: string) => {
      y += 2;
      checkPage(8);
      const gray = hexToRgb('#555555')!;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(gray.r, gray.g, gray.b);
      const lines = doc.splitTextToSize(text, contentWidth);
      doc.text(lines, margin, y);
      y += lines.length * 4.5 + 1;
      doc.setTextColor(0, 0, 0);
    };

    const addCitation = (text: string) => {
      y += 1;
      checkPage(7);
      const blue = hexToRgb(blueHex)!;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(blue.r, blue.g, blue.b);
      doc.text(text, margin, y);
      y += 5;
      doc.setTextColor(0, 0, 0);
    };

    const addHRule = (color = '#dddddd') => {
      checkPage(6);
      y += 2;
      const rgb = hexToRgb(color)!;
      doc.setDrawColor(rgb.r, rgb.g, rgb.b);
      doc.setLineWidth(0.4);
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;
    };

    const addSectionHeader = (title: string, subtitle: string, citation: string) => {
      // Left accent bar
      const blue = hexToRgb(blueHex)!;
      doc.setFillColor(blue.r, blue.g, blue.b);
      doc.rect(margin, y, 3, 14, 'F');
      // Title
      const navy = hexToRgb(navyHex)!;
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(navy.r, navy.g, navy.b);
      doc.text(title, margin + 5, y + 9);
      y += 16;
      addSubtitle(subtitle);
      addCitation(citation);
      addHRule('#dddddd');
    };

    // ─────────────────────────────────────────────────────────────────────────
    // PAGE 1: COVER
    // ─────────────────────────────────────────────────────────────────────────

    // Navy header rectangle
    const navy = hexToRgb(navyHex)!;
    doc.setFillColor(navy.r, navy.g, navy.b);
    doc.rect(0, 0, pageWidth, 62, 'F');

    // Header text (white)
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('HIPAA Security Risk Assessment', margin, 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Prepared under 45 CFR 164.308(a)(1) — Security Management Process', margin, 34);

    doc.setFontSize(13);
    doc.text(orgName, margin, 44);

    doc.setFontSize(10);
    doc.text(`Assessment Date: ${formattedDate}`, margin, 52);

    doc.setTextColor(0, 0, 0);

    // Meta info block below header
    y = 72;

    const metaLeft = margin;
    const metaLabelW = 55;
    const metaValueX = metaLeft + metaLabelW;

    const addMetaRow = (label: string, value: string) => {
      checkPage(8);
      const labelRgb = hexToRgb('#666666')!;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(labelRgb.r, labelRgb.g, labelRgb.b);
      doc.text(label, metaLeft, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const valueLines = doc.splitTextToSize(value, contentWidth - metaLabelW);
      doc.text(valueLines, metaValueX, y);
      y += valueLines.length * 4.5 + 2;
    };

    addMetaRow('Conducted by:', completedBy);
    addMetaRow('Assessment Period:', currentYear);
    addMetaRow('Document Classification:', 'Confidential — HIPAA Security Documentation');
    addMetaRow('Retention Requirement:', 'Minimum 6 years per 45 CFR 164.316(b)(2)');

    addHRule('#cccccc');

    // Intro paragraph
    addText(
      'This Security Risk Assessment was conducted to fulfill the requirements of the HIPAA Security Rule (45 CFR Part 164), specifically the requirement at 45 CFR 164.308(a)(1)(ii)(A) to conduct an accurate and thorough assessment of the potential risks and vulnerabilities to the confidentiality, integrity, and availability of electronic protected health information (ePHI). This document is organized to directly address the four questions the Office for Civil Rights evaluates during a HIPAA audit.',
      9, 'normal', '#444444'
    );

    y += 4;

    // Score summary box
    checkPage(18);
    const scoreColor = hexToRgb(tierColor(tier))!;
    doc.setFillColor(scoreColor.r, scoreColor.g, scoreColor.b);
    doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Compliance Score: ${displayScore}/100 — ${tierLabel(tier)}`,
      pageWidth / 2,
      y + 10,
      { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);
    y += 20;

    if (!hasV2) {
      y += 4;
      addText('Note: This report is based on a legacy risk assessment format. Complete the updated Security Risk Assessment for full OCR-defensible documentation.', 8, 'italic', '#888888');
    }

    addFooter();

    // ─────────────────────────────────────────────────────────────────────────
    // PAGE 2: SECTION 1 — WHERE DOES PHI LIVE?
    // ─────────────────────────────────────────────────────────────────────────

    newPage();

    addSectionHeader(
      'Section 1: PHI Inventory and Data Flow',
      'Where is electronic protected health information created, received, maintained, or transmitted?',
      '45 CFR 164.308(a)(1)(ii)(A) — Risk Analysis: Scope of ePHI'
    );

    if (hasV2) {
      const d1Paragraphs = d1Narrative(orgName, answers);
      for (const para of d1Paragraphs) {
        checkPage(12);
        addText(para, 9, 'normal', '#333333');
        y += 2;
      }
    } else {
      addText(
        'A detailed PHI inventory narrative is available when the updated Security Risk Assessment (v2) is completed. Please complete the updated assessment to generate full OCR-defensible documentation.',
        9, 'normal', '#555555'
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PAGE 3: SECTION 2 — WHO HAS ACCESS?
    // ─────────────────────────────────────────────────────────────────────────

    newPage();

    addSectionHeader(
      'Section 2: Access Controls and User Management',
      'Who has access to ePHI and how is that access managed, monitored, and terminated?',
      '45 CFR 164.312(a)(1) — Access Control; 45 CFR 164.308(a)(4) — Information Access Management'
    );

    if (hasV2) {
      const d2Paragraphs = d2Narrative(answers);
      for (const para of d2Paragraphs) {
        checkPage(12);
        addText(para, 9, 'normal', '#333333');
        y += 2;
      }
    } else {
      addText(
        'A detailed access controls narrative is available when the updated Security Risk Assessment (v2) is completed.',
        9, 'normal', '#555555'
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PAGE 4: SECTION 3 — RISK REGISTER
    // ─────────────────────────────────────────────────────────────────────────

    newPage();

    addSectionHeader(
      'Section 3: Identified Risks and Vulnerabilities',
      'Potential threats and vulnerabilities to the confidentiality, integrity, and availability of ePHI',
      '45 CFR 164.308(a)(1)(ii)(A) — Risk Analysis'
    );

    const riskRows = hasV2 ? buildRiskRows(answers) : [];

    if (riskRows.length === 0) {
      addText(
        hasV2
          ? 'No critical or high-risk findings identified. All assessed areas are at low or moderate risk.'
          : 'Risk register requires the updated assessment (v2) to generate.',
        9, 'normal', '#555555'
      );
    } else {
      // Table column widths
      const col = {
        desc:       65,
        source:     30,
        likelihood: 22,
        impact:     20,
        controls:   contentWidth - 65 - 30 - 22 - 20,
      };

      const drawTableHeader = (startX: number, startY: number) => {
        const navyRgb = hexToRgb(navyHex)!;
        doc.setFillColor(navyRgb.r, navyRgb.g, navyRgb.b);
        doc.rect(startX, startY, contentWidth, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        let cx = startX + 1.5;
        doc.text('Risk Description',       cx, startY + 5);  cx += col.desc;
        doc.text('Source',                 cx, startY + 5);  cx += col.source;
        doc.text('Likelihood',             cx, startY + 5);  cx += col.likelihood;
        doc.text('Impact',                 cx, startY + 5);  cx += col.impact;
        doc.text('Existing Controls',      cx, startY + 5);
        doc.setTextColor(0, 0, 0);
        return startY + 7;
      };

      checkPage(20);
      let tableY = drawTableHeader(margin, y);
      y = tableY;

      for (let i = 0; i < riskRows.length; i++) {
        const row = riskRows[i];
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');

        const descLines  = doc.splitTextToSize(row.description, col.desc - 2);
        const srcLines   = doc.splitTextToSize(row.source,      col.source - 2);
        const ctrlLines  = doc.splitTextToSize(row.controls,    col.controls - 2);
        const rowLines   = Math.max(descLines.length, srcLines.length, ctrlLines.length, 1);
        const rowH       = rowLines * 3.5 + 3;

        if (y + rowH > pageHeight - 20) {
          newPage();
          tableY = drawTableHeader(margin, y);
          y = tableY;
        }

        // Row background
        if (i % 2 === 0) {
          const light = hexToRgb('#f6f8fa')!;
          doc.setFillColor(light.r, light.g, light.b);
          doc.rect(margin, y, contentWidth, rowH, 'F');
        }

        // Cell text
        let cx = margin + 1.5;
        const textY = y + 3.5;

        // Description
        doc.setTextColor(50, 50, 50);
        doc.text(descLines, cx, textY); cx += col.desc;

        // Source
        doc.text(srcLines, cx, textY); cx += col.source;

        // Likelihood (colored)
        const lhColor = row.likelihood === 'CERTAIN' || row.likelihood === 'HIGH'
          ? hexToRgb(redHex)!
          : hexToRgb(amberHex)!;
        doc.setTextColor(lhColor.r, lhColor.g, lhColor.b);
        doc.setFont('helvetica', 'bold');
        doc.text(row.likelihood, cx, textY); cx += col.likelihood;

        // Impact
        const impColor = hexToRgb(redHex)!;
        doc.setTextColor(impColor.r, impColor.g, impColor.b);
        doc.text(row.impact, cx, textY); cx += col.impact;

        // Controls
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        doc.text(ctrlLines, cx, textY);

        // Row border
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.2);
        doc.line(margin, y + rowH, margin + contentWidth, y + rowH);

        y += rowH;
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PAGE 5: SECTION 4 — REMEDIATION
    // ─────────────────────────────────────────────────────────────────────────

    newPage();

    addSectionHeader(
      'Section 4: Risk Management and Remediation',
      'Implemented safeguards and planned remediation actions',
      '45 CFR 164.308(a)(1)(ii)(B) — Risk Management'
    );

    // Sub-section A: Implemented Controls
    checkPage(10);
    const navyRgbA = hexToRgb(navyHex)!;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(navyRgbA.r, navyRgbA.g, navyRgbA.b);
    doc.text('A. Implemented and Verified Controls', margin, y);
    y += 7;
    doc.setTextColor(0, 0, 0);

    if (hasV2) {
      const aAnswers = QUESTIONS.filter(q => answers[q.id] === 'A');
      if (aAnswers.length === 0) {
        addText('No fully verified controls were identified in this assessment.', 9, 'normal', '#555555');
      } else {
        for (const q of aAnswers) {
          checkPage(7);
          const greenRgb = hexToRgb(greenHex)!;
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(greenRgb.r, greenRgb.g, greenRgb.b);
          doc.text('✓', margin, y);
          doc.setTextColor(50, 50, 50);
          const descLines = doc.splitTextToSize(`[${q.id}] ${q.text.slice(0, 80)}${q.text.length > 80 ? '...' : ''}`, contentWidth - 6);
          doc.text(descLines, margin + 5, y);
          y += descLines.length * 4 + 1.5;
        }
      }
    } else {
      addText('Implemented controls detail requires the updated assessment (v2).', 9, 'normal', '#555555');
    }

    y += 4;

    // Sub-section B: Remediation Plan
    checkPage(10);
    const navyRgbB = hexToRgb(navyHex)!;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(navyRgbB.r, navyRgbB.g, navyRgbB.b);
    doc.text('B. Required Remediation Actions', margin, y);
    y += 7;
    doc.setTextColor(0, 0, 0);

    const remRows = hasV2 ? buildRemediationRows(answers) : [];

    if (remRows.length === 0) {
      addText(
        hasV2
          ? 'No remediation actions required. All assessed areas meet compliance expectations.'
          : 'Remediation plan requires the updated assessment (v2).',
        9, 'normal', '#555555'
      );
    } else {
      const remCol = {
        priority: 18,
        finding:  50,
        action:   contentWidth - 18 - 50 - 20,
        target:   20,
      };

      const drawRemHeader = (startX: number, startY: number) => {
        const navyRgb = hexToRgb(navyHex)!;
        doc.setFillColor(navyRgb.r, navyRgb.g, navyRgb.b);
        doc.rect(startX, startY, contentWidth, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        let cx = startX + 1.5;
        doc.text('Priority',   cx, startY + 5); cx += remCol.priority;
        doc.text('Finding',    cx, startY + 5); cx += remCol.finding;
        doc.text('Recommended Action', cx, startY + 5); cx += remCol.action;
        doc.text('Target',     cx, startY + 5);
        doc.setTextColor(0, 0, 0);
        return startY + 7;
      };

      checkPage(20);
      y = drawRemHeader(margin, y);

      for (let i = 0; i < remRows.length; i++) {
        const row = remRows[i];
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');

        const findingLines = doc.splitTextToSize(row.finding, remCol.finding - 2);
        const actionLines  = doc.splitTextToSize(row.action,  remCol.action - 2);
        const rowLines     = Math.max(findingLines.length, actionLines.length, 1);
        const rowH         = rowLines * 3.5 + 3;

        if (y + rowH > pageHeight - 20) {
          newPage();
          y = drawRemHeader(margin, y);
        }

        if (i % 2 === 0) {
          const light = hexToRgb('#f6f8fa')!;
          doc.setFillColor(light.r, light.g, light.b);
          doc.rect(margin, y, contentWidth, rowH, 'F');
        }

        let cx = margin + 1.5;
        const textY = y + 3.5;

        const prioColor = row.priority === 'HIGH' ? hexToRgb(redHex)! : hexToRgb(amberHex)!;
        doc.setTextColor(prioColor.r, prioColor.g, prioColor.b);
        doc.setFont('helvetica', 'bold');
        doc.text(row.priority, cx, textY); cx += remCol.priority;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        doc.text(findingLines, cx, textY); cx += remCol.finding;
        doc.text(actionLines, cx, textY);  cx += remCol.action;
        doc.text(row.target, cx, textY);

        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.2);
        doc.line(margin, y + rowH, margin + contentWidth, y + rowH);

        y += rowH;
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PAGE 6: COMPLIANCE SCORE SUMMARY
    // ─────────────────────────────────────────────────────────────────────────

    newPage();

    addSectionTitle('Compliance Score Summary');
    addHRule('#cccccc');

    // Overall score box
    checkPage(18);
    const scoreRgb = hexToRgb(tierColor(tier))!;
    doc.setFillColor(scoreRgb.r, scoreRgb.g, scoreRgb.b);
    doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Overall Compliance Score: ${displayScore}/100 — ${tierLabel(tier)}`,
      pageWidth / 2, y + 10,
      { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);
    y += 20;

    // Domain breakdown table
    checkPage(10 + DOMAINS.length * 10);

    const domColW = {
      domain:   65,
      questions: 30,
      score:    30,
      status:   contentWidth - 65 - 30 - 30,
    };

    // Header row
    const navyDom = hexToRgb(navyHex)!;
    doc.setFillColor(navyDom.r, navyDom.g, navyDom.b);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    let dcx = margin + 1.5;
    doc.text('Domain',        dcx, y + 5); dcx += domColW.domain;
    doc.text('Questions',     dcx, y + 5); dcx += domColW.questions;
    doc.text('Domain Score',  dcx, y + 5); dcx += domColW.score;
    doc.text('Status',        dcx, y + 5);
    doc.setTextColor(0, 0, 0);
    y += 7;

    for (let i = 0; i < DOMAINS.length; i++) {
      const dom = DOMAINS[i];
      const ds = domainScores?.[dom.id];
      const domDisplay = ds?.display ?? null;
      const domStatus = domDisplay === null ? 'N/A'
        : domDisplay >= 85 ? 'PROTECTED'
        : domDisplay >= 55 ? 'PARTIAL'
        : domDisplay >= 25 ? 'AT RISK'
        : 'CRITICAL';
      const rowH = 8;

      if (i % 2 === 0) {
        const light = hexToRgb('#f6f8fa')!;
        doc.setFillColor(light.r, light.g, light.b);
        doc.rect(margin, y, contentWidth, rowH, 'F');
      }

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      dcx = margin + 1.5;
      const textY2 = y + 5.5;
      doc.text(dom.label, dcx, textY2); dcx += domColW.domain;
      doc.text(`${dom.questionCount} questions`, dcx, textY2); dcx += domColW.questions;
      doc.text(domDisplay !== null ? `${domDisplay}/100` : 'N/A', dcx, textY2); dcx += domColW.score;

      const statusColor = domStatus === 'PROTECTED' ? greenHex
        : domStatus === 'PARTIAL'    ? amberHex
        : domStatus === 'AT RISK'    ? redHex
        : domStatus === 'CRITICAL'   ? darkRedHex
        : '#888888';
      const sRgb = hexToRgb(statusColor)!;
      doc.setTextColor(sRgb.r, sRgb.g, sRgb.b);
      doc.setFont('helvetica', 'bold');
      doc.text(domStatus, dcx, textY2);
      doc.setTextColor(0, 0, 0);

      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.line(margin, y + rowH, margin + contentWidth, y + rowH);
      y += rowH;
    }

    y += 8;

    // Tier legend
    addSectionTitle('Score Tier Reference');
    checkPage(30);

    const tiers = [
      { label: 'PROTECTED',  range: '85–100', color: greenHex,   desc: 'Strong HIPAA compliance posture. Continue annual assessments.' },
      { label: 'PARTIAL',    range: '55–84',  color: amberHex,   desc: 'Moderate risk. Identified gaps should be addressed within 90 days.' },
      { label: 'AT RISK',    range: '25–54',  color: redHex,     desc: 'Significant vulnerabilities present. Priority remediation required within 30 days.' },
      { label: 'CRITICAL',   range: '0–24',   color: darkRedHex, desc: 'Critical exposure. Immediate action required across multiple domains.' },
    ];

    for (const t of tiers) {
      checkPage(9);
      const tRgb = hexToRgb(t.color)!;
      doc.setFillColor(tRgb.r, tRgb.g, tRgb.b);
      doc.rect(margin, y, 6, 6, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(tRgb.r, tRgb.g, tRgb.b);
      doc.text(`${t.label} (${t.range})`, margin + 8, y + 4.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(t.desc, margin + 55, y + 4.5);
      y += 8;
      doc.setTextColor(0, 0, 0);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FINAL PAGE: CERTIFICATION
    // ─────────────────────────────────────────────────────────────────────────

    newPage();

    addSectionTitle('Certification Statement');
    addHRule('#cccccc');

    addText(
      `This Security Risk Assessment was conducted on ${formattedDate} by ${completedBy}, serving as the designated Privacy and Security Officer for ${orgName}, and accurately reflects the security posture of ${orgName} as of that date.`,
      10, 'normal', '#333333'
    );
    y += 3;

    addText(
      `This assessment was completed to fulfill the requirements of 45 CFR 164.308(a)(1) and covers the full scope of electronic protected health information (ePHI) maintained, transmitted, and received by ${orgName}.`,
      10, 'normal', '#333333'
    );
    y += 3;

    addText(
      `This document, along with the associated findings and remediation plan, constitutes ${orgName}'s compliance with the Security Risk Analysis requirement of the HIPAA Security Rule. This assessment should be reviewed and updated at least annually or whenever significant changes occur to the practice's technology environment, physical location, or workforce.`,
      10, 'normal', '#333333'
    );

    y += 12;
    addHRule('#cccccc');

    // Signature block
    checkPage(60);

    addText('Privacy and Security Officer:', 10, 'bold', navyHex);
    y += 10;

    // Signature line
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 90, y);
    y += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.text(`${completedBy}, Privacy & Security Officer`, margin, y);
    y += 5;
    doc.text(orgName, margin, y);
    y += 5;
    doc.text(`Date: ${formattedDate}`, margin, y);
    y += 16;

    addHRule('#cccccc');

    checkPage(12);
    const confRgb = hexToRgb('#888888')!;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(confRgb.r, confRgb.g, confRgb.b);
    doc.text(
      'This document is confidential and constitutes protected HIPAA compliance documentation. Retain for a minimum of 6 years per 45 CFR 164.316(b)(2).',
      margin, y
    );
    doc.setTextColor(0, 0, 0);

    addFooter();

    // ─── Output ───────────────────────────────────────────────────────────────

    const pdfBytes = doc.output('arraybuffer');
    const safeName = orgName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40);
    const safeDate = formattedDate.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `HIPAA_SRA_${safeName}_${safeDate}.pdf`;

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[export-pdf] fatal error:', err);
    return NextResponse.json(
      { error: 'PDF generation failed', detail: String(err) },
      { status: 500 }
    );
  }
}
