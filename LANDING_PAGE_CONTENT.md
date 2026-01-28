# HIPAA Hub - Landing Page Content Documentation

**Document Version:** 1.0  
**Last Updated:** 2025-01-24  
**Purpose:** Complete copy and content reference for all landing page sections

---

## Table of Contents

1. [Header/Navigation](#headernavigation)
2. [Hero Section](#hero-section)
3. [Video Section](#video-section)
4. [The Problem Section](#the-problem-section)
5. [Invisible Enemy Section](#invisible-enemy-section)
6. [Future State Section](#future-state-section)
7. [Bridge Section](#bridge-section)
8. [What We Do Section](#what-we-do-section)
9. [Social Proof Section](#social-proof-section)
10. [Services Section](#services-section)
11. [Features Grid Section](#features-grid-section)
12. [Compliance Documents Section](#compliance-documents-section)
13. [Testimonials Section](#testimonials-section)
14. [Awards Section](#awards-section)
15. [Blog Section](#blog-section)
16. [Pricing Section](#pricing-section)
17. [FAQ Section](#faq-section)
18. [Steps Section (How It Works)](#steps-section-how-it-works)
19. [Pillars Section](#pillars-section)
20. [Final CTA Section](#final-cta-section)

---

## Header/Navigation

**Component:** `landing-header.tsx`

### Navigation Links
- Features (`/#features`)
- How it works (`/#how-it-works`)
- Blog (`/blog`)
- Pricing (`/pricing`)

### CTA Buttons
- **Logged Out:**
  - Log in (`/signin`)
  - Get Started (`/signup`)
- **Logged In:**
  - Go to Dashboard (`/dashboard`)

### Logo
- Image: `/images/logoescura.png`
- Alt: "HIPAA Hub"

---

## Hero Section

**Component:** `hero-new.tsx`

### Headline
**Main Title:**
```
HIPAA compliance you can actually prove.
```

**Subheadline:**
```
Centralize policies, evidence, roles, and documentation in one secure system, ready for audits, inspections, and peace of mind.
```

### Bullet Points
- All HIPAA documentation in one place
- Clear roles, policies, and evidence tracking
- Built to reduce risk, confusion, and liability

### CTA Button
- **Text:** "Get HIPAA compliant - the right way"
- **Link:** `/signup`
- **Style:** Green button (`#1acb77`)

### Visual Elements
- 8 orbital rotating images (`/images/8img/01.png` through `08.png`)
- Background gradient from white to light gray

---

## Video Section

**Component:** `video-section.tsx`

### Title
```
See HIPAA Guard in Action
```

### Description
```
Watch how HIPAA Guard helps healthcare practices achieve and maintain compliance with ease. Our platform automates the entire compliance process, from risk assessment to document generation.
```

### Features List
- Automated policy generation based on your organization profile
- Real-time risk assessment and compliance tracking
- Audit-ready documentation with version control

### Video
- YouTube embed (placeholder ID: `dQw4w9WgXcQ`)
- Title: "HIPAA Guard Platform Overview"

---

## The Problem Section

**Component:** `the-problem-section.tsx`

### Main Headline
```
HIPAA usually isn't broken.
It's just undocumented.
```

### Subheadline
```
Most organizations don't fail HIPAA because they ignored it.
They fail because they can't prove what they did.
```

### Problems List
1. Policies spread across drives, emails, and old PDFs
2. No clear version control or approval history
3. Roles defined "informally"
4. Evidence exists — but no one knows where
5. Compliance based on memory, not structure

### Key Message Card
```
HIPAA doesn't punish intent.
It punishes lack of evidence.
```

---

## Invisible Enemy Section

**Component:** `invisible-enemy-section.tsx`

### Main Quote
```
"It looks fine" is the most dangerous state.
```

### Description
```
The biggest compliance risk isn't what you know is wrong.
It's what you assume is correct — without proof.
```

### Key Message Card
```
If it's not documented, versioned, and traceable,
it doesn't exist in an audit.
```

---

## Future State Section

**Component:** `future-state-section.tsx`

### Headline
```
Imagine knowing exactly where your compliance stands.
```

### Description
```
With HIPAA Hub, your compliance is no longer a guess.
It's structured, documented, and always accessible.
```

### Benefits List
- One source of truth for HIPAA compliance
- Clear ownership and accountability
- Documents always current and audit-ready
- Confidence instead of anxiety

### Image
- Source: `/imgsec111.png`
- Alt: "HIPAA Hub Compliance Dashboard - Real-time compliance overview"

---

## Bridge Section

**Component:** `bridge-section.tsx`

### Headline
```
From uncertainty to provable compliance.
```

### Before Column
**Title:** Before

**Items:**
- Scattered files
- Unclear roles
- No audit trail
- Compliance based on assumptions

### After Column
**Title:** After (HIPAA Hub)

**Items:**
- Centralized documentation
- Version control and approvals
- Clear evidence tracking
- Compliance you can demonstrate

### Key Phrase
```
HIPAA Hub doesn't make you compliant.
It makes your compliance provable.
```

---

## What We Do Section

**Component:** `what-we-do-section.tsx`

### Headline
```
Built for real-world HIPAA compliance.
```

### Badge
- **Label:** "Core Capabilities"
- **Icon:** ShieldCheck

### Features Grid (4 items)

#### 1. Policy Management
- **Number:** 01
- **Icon:** FileText
- **Description:** Create, store, version, and manage HIPAA policies

#### 2. Evidence Tracking
- **Number:** 02
- **Icon:** Archive
- **Description:** Attach and organize proof where it belongs

#### 3. Role Definition
- **Number:** 03
- **Icon:** Users
- **Description:** Clearly assign Security and Privacy responsibilities

#### 4. Audit Readiness
- **Number:** 04
- **Icon:** ShieldCheck
- **Description:** Everything structured, searchable, and documented

### Image
- Source: `/seguro-rcp-enfermeiro-1920x0-c-default_upscayl_4x_ultramix-balanced-4x.png`
- Alt: "HIPAA Compliance Documentation"

### Trust Indicator
```
Designed by compliance professionals, built for healthcare practices that need real audit defense.
```

### Bottom Emphasis
```
No bloated features. No endless configuration.
Just what you need to stay compliant and audit-ready.
```

---

## Social Proof Section

**Component:** `social-proof-section.tsx`

### Badge
- **Label:** "Trusted by Professionals"
- **Icon:** Shield

### Header Text
```
Trusted by healthcare professionals who refuse to gamble with compliance.
```

### G2 Awards Card
**Title:** G2 Summer 2025 Awards

**Badges:**
1. Grid Leader
2. High Performer
3. Easiest To Do Business With (MID-MARKET)
4. Users Most Likely To Recommend (MID-MARKET)
5. High Performer (SMALL BUSINESS)

**Image:** `/images/Sem Título-1.png`

### Stats
- **Trustpilot:** 4.9/5 on Trustpilot
- **Users:** Used by 500+ clinics across the U.S.

---

## Services Section

**Component:** `services-section.tsx`

### Header
**Badge:** "The platform"
**Title:** "Complete compliance management"

### Tabs (3 services)

#### Tab 1: Risk assessment
**Title:** Automated risk analysis

**Description:**
```
Stop using manual spreadsheets. Our NIST-aligned engine identifies vulnerabilities across your entire operation in minutes, not months.
```

**Benefits:**
- 150+ OCR-aligned controls
- Automated risk scoring (low/med/high)
- Actionable remediation roadmap
- Instant export for insurance & auditors

**Image:** `/images/telas/Review Your Compliance.png`

**CTA:** "Explore solution" → `/signup`

---

#### Tab 2: Policy engine
**Title:** Dynamic policy generation

**Description:**
```
Legally-unique documents that adapt to your practice. Not just templates, but live policies that reflect your actual controls and evidence.
```

**Benefits:**
- 9 mandatory HIPAA master policies
- Evidence-injection technology
- Version control & audit history
- One-click staff distribution

**Image:** Unsplash placeholder

**CTA:** "Explore solution" → `/signup`

---

#### Tab 3: Audit defense
**Title:** Institutional defensibility

**Description:**
```
Built for the moment an auditor knocks. Every action, attestation, and document is timestamped and ready for federal inspection.
```

**Benefits:**
- Encrypted evidence vault
- Immutable activity logs
- IP-tracked attestations
- Complete audit-package export

**Image:** Unsplash placeholder

**CTA:** "Explore solution" → `/signup`

---

## Features Grid Section

**Component:** `features-grid.tsx`

### Badge
- **Label:** "Compliance Features"
- **Icon:** Shield

### Headline
```
Everything you need for HIPAA compliance.
Nothing you don't.
```

### Description
```
Practical tools designed for clinic owners and administrators to achieve, maintain, and prove HIPAA compliance.
```

### Compliance Metrics
- **HIPAA Policies Generated:** 9
- **Risk Assessment Questions:** 100+
- **Training Certificates:** Unlimited

### Features Grid (4 items)

#### 1. HIPAA Policy Generation
- **Badge:** Documentation
- **Icon:** FileCode2
- **Description:** Complete set of required HIPAA policies automatically generated and customized to your practice type
- **Specs:**
  - 9 core HIPAA policies
  - Practice-specific customization
  - Version control built-in

#### 2. Risk Assessment Engine
- **Badge:** Risk Management
- **Icon:** Shield
- **Description:** Guided security risk analysis that meets the HIPAA Security Rule requirements for risk management
- **Specs:**
  - Comprehensive risk evaluation
  - Automatic risk scoring
  - Remediation recommendations

#### 3. Evidence Management
- **Badge:** Audit Defense
- **Icon:** GitBranch
- **Description:** Centralized system to organize and track all compliance evidence, approvals, and training records
- **Specs:**
  - Audit-ready documentation
  - Complete chain of custody

#### 4. Role Assignment System
- **Badge:** Accountability
- **Icon:** Activity
- **Description:** Clear designation of HIPAA Security and Privacy Officers with documented responsibilities
- **Specs:**
  - Official role assignments
  - Responsibility tracking
  - Succession planning

### Compliance Workflow Visual
**Title:** HIPAA Compliance Roadmap

**Status:** 85% Complete

**Steps:**
1. Privacy Policy - Completed
2. Security Policy - Completed
3. Risk Assessment - In Progress
4. BAA Templates - Pending

---

## Compliance Documents Section

**Component:** `compliance-documents-section.tsx`

### Headline
```
All HIPAA Policies. Generated. Audit-Ready.
```

### Description
```
Everything your organization is legally required to have — generated automatically, customized to your practice, and defensible in an OCR audit.
```

### Additional Text
```
HIPAA Hub generates the complete set of required HIPAA policies based on your organization profile and security risk analysis.

No templates. No guessing. No outdated PDFs.

Every document is practice-specific, versioned, timestamped, and audit-ready.
```

### Image
- Source: `/mockup9doc.jpg`
- Alt: "HIPAA Policy Documents - Complete Set of Required Policies"

---

## Testimonials Section

**Component:** `testimonials-section.tsx`

### Header
**Label:** "Empowering Communities"
**Title:** "Our Positive Social Impact"

**Description:**
```
Our compliance solutions are designed to help businesses achieve their goals and drive economic growth in their local area.
```

### Trustpilot Section
- **Logo:** `/images/Trustpilot_Logo_(2022).svg.png`
- **Rating:** 5.0
- **Stats:** Trust score 5.0 | 3,724 reviews

### Testimonials (5 total, showing 3 at a time)

#### 1. Transformative Experience
**Author:** Akash Wilson  
**Role:** Small business owner  
**Rating:** 5.0  
**Text:**
```
Working with HIPAA Hub was a transformative experience for my business. The tailored solutions and friendly staff exceeded my expectation. I highly recommend them.
```

#### 2. Expert Support
**Author:** George Adams  
**Role:** Big business owner  
**Rating:** 5.0  
**Text:**
```
Working with HIPAA Hub was a transformative experience for my business. The tailored solutions and friendly staff exceeded my expectation. I highly recommend them.
```

#### 3. Smooth Process
**Author:** Hassan Desai  
**Role:** Small business owner  
**Rating:** 5.0  
**Text:**
```
Working with HIPAA Hub for my business. The tailored solutions exceeded my expectation. I highly recommend them.
```

#### 4. Life Saver
**Author:** Sarah Johnson  
**Role:** Medical Director  
**Rating:** 5.0  
**Text:**
```
HIPAA Hub saved us during our last audit. The evidence vault feature is incredible and the support team is always responsive.
```

#### 5. Clear Guidance
**Author:** Michael Chen  
**Role:** IT Director  
**Rating:** 5.0  
**Text:**
```
Finally, a HIPAA platform that speaks plain English. The risk assessment questions are clear, and the generated documents are usable.
```

### CTA
- **Button:** "See all"
- **Action:** View all testimonials

---

## Awards Section

**Component:** `awards-section.tsx`

### Title
```
Awards & Recognition
```

### Awards (3 badges)
1. **Best Customer Service 2022**
   - Image: `/images/Great-Customer-Service-Award.png`

2. **Inc. 5000 - America's Fastest-Growing Private Companies**
   - Image: `/images/Inc.-5000-Color-Medallion-Logo.png`

3. **Best Company Best of the Best 2025**
   - Image: `/images/best-company-badge.png`

---

## Blog Section

**Component:** `blog-section.tsx`

### Header
**Title:** "Latest insight from HIPAA Hub"

**Description:**
```
Practical, audit-ready HIPAA guidance for clinic owners.
```

### CTA
- **Button:** "See all"
- **Link:** `/blog`

### Content
- Displays latest 4 blog posts from the blog system
- Grid layout with post cards showing:
  - Title
  - Description
  - Date
  - Category
  - Cover image

---

## Pricing Section

**Component:** `pricing-section.tsx`

### Badge
- **Label:** "Simple Pricing"
- **Icon:** Sparkles

### Headline
```
One plan. Full audit defense.
```

### Description
```
Everything you need to reach and maintain HIPAA compliance in one place.
```

### Pricing Card

**Plan Name:** FULL GUARD

**Badge:** "Most Popular"

**Description:**
```
Complete compliance operating system designed for small clinics and practices.
```

**Price:**
- **Amount:** $499
- **Period:** / year
- **Note:** Full access to all HIPAA Guard modules
- **Terms:** Annual plan. Cancel anytime.

### Features Included
1. **Security Risk Analysis (SRA)**
   - OCR-aligned and audit-ready

2. **Dynamic Policy Engine**
   - All 9 required HIPAA policies

3. **Evidence Vault**
   - Centralized storage for all proofs

4. **Workforce Training**
   - Unlimited certificates for staff

5. **Version History**
   - Full audit trail of all changes

### CTA Button
- **Text:** "Get Started"
- **Action:** Initiates Stripe checkout

---

## FAQ Section

**Component:** `faq.tsx`

### Header
**Label:** "Support center"
**Title:** "Frequently asked questions"

### Categories
- Platform
- Security
- Payments
- Training
- Legal

### FAQ Questions by Category

#### Platform (6 questions)

**Q: What exactly is the HIPAA Hub?**  
A: HIPAA Hub is an institutional-grade compliance management system that automates your HIPAA privacy and security requirements through risk assessments, policy generation, and evidence management. It's designed for small and mid-sized healthcare practices that need real audit defense, not theoretical compliance.

**Q: Is this for small clinics?**  
A: Especially. HIPAA Hub is built for practices without in-house compliance teams. We make institutional-grade compliance accessible to clinics of all sizes, from solo practitioners to practices with up to 10 employees.

**Q: What happens if I'm audited?**  
A: HIPAA Hub provides comprehensive compliance documentation including policies, risk assessments, evidence management, and training records. All your compliance data is organized, timestamped, and ready for regulatory inspection.

**Q: How long does it take to get set up?**  
A: Most clinics complete their initial setup in 2-3 days. The onboarding process guides you through risk assessment, policy generation, and evidence upload. You can be audit-ready in days, not months.

**Q: Can I integrate with my existing EHR system?**  
A: HIPAA Hub doesn't require direct EHR integration. We focus on compliance documentation and evidence management, not clinical data. You can export compliance reports and share them with your EHR vendor or IT team as needed.

**Q: Do I need technical expertise to use HIPAA Hub?**  
A: No. HIPAA Hub is designed for clinic owners and practice managers without technical backgrounds. Our guided onboarding walks you through every step, and the interface is intuitive. If you can use email and basic software, you can use HIPAA Hub.

#### Security (6 questions)

**Q: Do you store patient PHI?**  
A: No. We store compliance evidence, not medical records. Our 'zero PHI architecture' ensures we only handle your compliance documentation and operational evidence. We never see or store patient health information.

**Q: Is my data secure in the vault?**  
A: Yes. Every document and piece of evidence is encrypted with AES-256 military-grade encryption at rest and in transit. We follow NIST SP 800-53 security controls strictly and undergo regular security audits.

**Q: Where is my data stored?**  
A: All data is stored in SOC 2 Type II certified data centers within the United States. We use industry-leading cloud infrastructure with redundant backups and disaster recovery protocols.

**Q: How often is my data backed up?**  
A: All your compliance data is automatically backed up continuously in real-time. We maintain redundant backups across multiple secure data centers, ensuring your documentation is protected against data loss, hardware failures, or disasters.

**Q: What security certifications do you have?**  
A: We use SOC 2 Type II certified infrastructure and follow NIST SP 800-53 security controls. Our data centers are HIPAA-compliant and undergo regular third-party security audits. We maintain strict access controls and encryption standards to protect your compliance documentation.

**Q: Do you have a Business Associate Agreement (BAA)?**  
A: Yes. We provide a standard BAA that meets HIPAA requirements. It's automatically included when you sign up, and you can download it from your account settings at any time.

#### Payments (6 questions)

**Q: What is included in the $499/year plan?**  
A: Everything. Risk assessment, 9 master policies, evidence vault, staff training (up to 10 employees). No hidden fees, no per-document charges, no limits on document generation.

**Q: Can I pay monthly instead of annually?**  
A: We offer annual billing only at $499/year. This ensures you have continuous compliance coverage and simplifies your budgeting. Annual plans also include priority support and early access to new features.

**Q: What payment methods do you accept?**  
A: We accept all major credit cards (Visa, Mastercard, American Express) and debit cards through our secure Stripe payment processor. All transactions are encrypted and PCI-DSS compliant.

**Q: Is there a free trial?**  
A: No. We offer an annual plan only. However, we provide a 30-day money-back guarantee. If you're not satisfied within the first month, we'll refund your payment in full.

**Q: What happens if I cancel my subscription?**  
A: You can cancel at any time. Your subscription will remain active until the end of your current billing period. You'll retain full access to export all your data, policies, and evidence before cancellation takes effect.

**Q: Do you offer discounts for multiple locations?**  
A: Yes. If you operate multiple clinic locations, contact our sales team for volume pricing. We offer custom enterprise plans for healthcare organizations with multiple facilities.

#### Training (6 questions)

**Q: Do staff certificates expire?**  
A: Yes. To maintain audit-readiness, we recommend annual HIPAA training. The system automatically alerts you when staff certificates are nearing their 365-day expiration. You can renew training at any time.

**Q: What training content is included?**  
A: Our training module covers all required HIPAA topics: Privacy Rule basics, Security Rule requirements, breach notification procedures, patient rights, and workforce responsibilities. Content is updated to reflect current OCR guidance.

**Q: Can I customize the training content?**  
A: The core training follows OCR-aligned curriculum, but you can add practice-specific scenarios and policies. Each staff member receives a personalized certificate with their name, completion date, and your organization's information.

**Q: How do I track who has completed training?**  
A: The dashboard shows a complete training roster with status (completed, in progress, not started), completion dates, and certificate expiration dates. All training records are stored securely and accessible for review.

**Q: What if a staff member fails the training quiz?**  
A: Staff can retake quizzes as many times as needed. The system tracks all attempts and only issues a certificate upon passing. This ensures everyone understands HIPAA requirements before being certified.

**Q: Is training available in languages other than English?**  
A: Currently, training is available in English only. However, you can supplement our training with your own translated materials and document completion in the Evidence Vault. Contact us if you need multi-language support.

#### Legal (6 questions)

**Q: Is this legal advice?**  
A: No. HIPAA Hub is a compliance management system aligned with federal requirements. We are not a law firm and do not provide legal advice. For specific legal questions about your situation, consult with a healthcare attorney.

**Q: Will this guarantee I pass an OCR audit?**  
A: No system can guarantee audit outcomes. However, HIPAA Hub is built on OCR audit protocols and designed for real investigations. We help you build defensible evidence and documentation that demonstrates good-faith compliance efforts.

**Q: What if I get a breach notification requirement?**  
A: HIPAA Hub includes breach notification templates and guidance. Our system helps you document the breach, assess risk, and generate required notifications. However, you should also consult legal counsel for breach-specific advice.

**Q: Does this cover state-specific requirements?**  
A: HIPAA Hub focuses on federal HIPAA requirements. Some states have additional privacy laws (like California's CCPA). We provide guidance on common state requirements, but you should verify state-specific obligations with legal counsel.

**Q: What if my practice is already under investigation?**  
A: HIPAA Hub can help organize existing evidence and generate missing documentation. However, if you're already under OCR investigation, you should immediately consult with a healthcare attorney who specializes in HIPAA enforcement.

**Q: Are the generated policies legally binding?**  
A: The policies generated by HIPAA Hub are based on OCR requirements and industry best practices. Once you review, customize, and formally adopt them (with proper signatures and dates), they become your organization's official policies and are legally binding.

### Extra Help CTA
```
Still have questions?
Contact our support →
```

---

## Steps Section (How It Works)

**Component:** `steps-section.tsx`

### Badge
- **Label:** "HOW IT WORKS"
- **Icon:** Zap

### Headline
```
From zero to audit-ready
in 4 simple steps
```

### Description
```
A structured, guided workflow that takes the complexity out of HIPAA compliance.
No compliance background required.
```

### Steps (4 steps)

#### Step 01: Complete Your Security Risk Analysis
**Subtitle:** 150 OCR-aligned questions in plain English

**Description:**
```
Answer a comprehensive questionnaire designed by compliance experts. Each question maps directly to HIPAA requirements, helping you identify vulnerabilities across Administrative, Physical, and Technical Safeguards.
```

**Example:**
```
Example: "Do you encrypt PHI in transit?" → Automatically maps to §164.312(e)(1)
```

**Features:**
- Guided questionnaire (15-20 minutes)
- Auto-save progress
- Built-in explanations for each control
- Mobile-friendly interface

**Image:** `/images/telas/Complete Your Security Risk Analysis.png`

---

#### Step 02: Upload Evidence & Build Your Audit Defense
**Subtitle:** Link proof directly to HIPAA controls

**Description:**
```
Upload screenshots, signed policies, system logs, training certificates, and vendor agreements. Each piece of evidence is automatically tagged to specific HIPAA controls, creating an auditable chain of compliance.
```

**Example:**
```
Example: Upload "Encryption Config Screenshot" → Auto-links to Technical Safeguards §164.312(a)(2)(iv)
```

**Features:**
- Drag-and-drop file upload
- Automatic control mapping
- Version history tracking
- Secure encrypted storage

**Image:** `/images/telas/Upload Evidence.png`

---

#### Step 03: Generate HIPAA Master Policies
**Subtitle:** AI-powered, attorney-reviewed templates

**Description:**
```
Click "Generate" and receive 9 fully customized HIPAA policies pre-filled with your clinic's information. Each document includes your uploaded evidence references, making them audit-ready from day one.
```

**Example:**
```
Example: Master Security Policy auto-populates with your clinic name, officers, and references your uploaded encryption evidence
```

**Features:**
- 9 mandatory HIPAA documents
- Auto-populated with your data
- Evidence references embedded
- Editable and version-controlled

**Image:** `/images/telas/tela2.jpg`

---

#### Step 04: Review Your Compliance Score & Risk Analysis
**Subtitle:** Real-time vulnerability dashboard

**Description:**
```
See your compliance status at a glance. Our engine calculates your legal exposure score, highlights critical gaps, and provides a prioritized remediation roadmap with step-by-step guidance.
```

**Example:**
```
Example: "82% Compliant — 3 Critical Issues Detected" with actionable fix recommendations
```

**Features:**
- Visual compliance dashboard
- Risk-weighted scoring
- Prioritized action items
- Estimated remediation time

**Image:** `/images/telas/Review Your Compliance.png`

---

### Final CTA Card

**Badge:** "Result"

**Headline:**
```
You're 100% audit-ready and legally defensible
```

**Description:**
```
Your entire compliance infrastructure — documented, evidenced, and ready for regulatory inspection.
```

**CTA Button:**
- **Text:** "Get Started"
- **Link:** `/signup`

### Trust Indicators
- **Lock:** Bank-level encryption - AES-256
- **ShieldCheck:** HIPAA Compliant - Certified
- **CheckCircle2:** Uptime SLA - 99.9%
- **Zap:** Avg. Setup Time - < 2 hours

---

## Pillars Section

**Component:** `pillars-section.tsx`

### Badge
- **Label:** "Complete Toolset"
- **Icon:** Shield

### Headline
```
HIPAA compliance is not about answers.
It's about defense.
```

### Description
```
HIPAA Hub is built for:
```

### Use Cases
- OCR audits
- Insurance reviews
- Legal discovery
- Breach investigations

### Tools Grid (6 tools)

#### 1. Risk assessment
**Icon:** Search  
**Benefits:**
- NIST SP 800-66 alignment
- Automated threat mapping
- Prioritized action items

#### 2. Policy engine
**Icon:** FileCheck  
**Benefits:**
- Dynamic content injection
- Legal version control
- Staff distribution system

#### 3. Evidence vault
**Icon:** Lock  
**Benefits:**
- AES-256 encryption
- Immutable activity logs
- Automatic retention rules

#### 4. Staff training
**Icon:** Users  
**Benefits:**
- Annual certification tracking
- Automated quiz engine
- Legal attestations

#### 5. Audit defense
**Icon:** Zap  
**Benefits:**
- One-click package export
- Defensibility scoring
- Real-time posture tracking

#### 6. Incident manager
**Icon:** Shield  
**Benefits:**
- Breach scoring engine
- Notification letter generation
- Actionable response logs

---

## Final CTA Section

**Component:** `final-cta-section.tsx`

### Badge
- **Label:** "Defend your practice"
- **Icon:** Sparkles

### Headline
```
If an audit happened tomorrow,
would you pass?
```

### Description
```
Don't guess. Don't hope. Don't improvise.
Build your audit defense now.
```

### CTA Buttons
- **Primary:** "Secure My HIPAA Hub" → `/signup`
- **Secondary:** "Login to your hub →" → `/signin`

### Footer Text
```
Annual plan. Full access. Audit-ready.
```

### Floating Badge
- **Text:** "100% defensible"
- **Subtext:** "Audit-ready system"
- **Icon:** ShieldCheck

---

## Additional Components

### Cookie Consent
**Component:** `cookie-consent.tsx`
- Cookie consent popup for GDPR compliance

### Exit Intent Popup
**Component:** `exit-intent-popup.tsx`
- Exit intent popup to capture leaving visitors

---

## Color Palette

### Primary Colors
- **Dark Blue (Brand Core):** `#0c0b1d` / `#0d0d1f`
- **Green (Action):** `#1ad07a` / `#1acb77`
- **Gray Background:** `#f3f5f9`
- **White Surface:** `#ffffff`

### Usage
- Dark blue: Sidebar, headers, main text
- Green: Primary buttons, status "Compliant", CTAs
- White: Cards, modals, tables
- Gray: Background, separation

---

## Typography

### Headings
- **H1 (Hero):** 64px - Landing/onboarding only
- **H3 (Dashboard Title):** 32px
- **H5 (Card Titles):** 24px

### Body Text
- **P2 (Main):** 16px
- **P3 (Metadata/Labels):** 14px

### Font Weight
- **Primary:** `font-extralight` (200)
- **Emphasis:** `font-normal` (400)
- **Bold:** `font-semibold` (600)

---

## Image Assets

### Screenshots
- `/images/telas/Complete Your Security Risk Analysis.png`
- `/images/telas/Upload Evidence.png`
- `/images/telas/tela2.jpg`
- `/images/telas/Review Your Compliance.png`

### Hero Images
- `/images/8img/01.png` through `08.png` (orbital system)

### Other Images
- `/seguro-rcp-enfermeiro-1920x0-c-default_upscayl_4x_ultramix-balanced-4x.png`
- `/mockup9doc.jpg`
- `/imgsec111.png`
- `/images/logoescura.png`
- `/images/Sem Título-1.png` (G2 Awards)
- `/images/Trustpilot_Logo_(2022).svg.png`
- `/images/Great-Customer-Service-Award.png`
- `/images/Inc.-5000-Color-Medallion-Logo.png`
- `/images/best-company-badge.png`

---

## Notes

- All sections use `font-extralight` for consistent typography
- Green accent color (`#1ad07a` / `#1acb77`) used for CTAs and highlights
- Dark theme (`#0c0b1d`) used for premium sections
- All images optimized with `quality={100}` and `unoptimized={true}` for maximum quality
- Images scaled 2% larger using `transform: scale(1.02)`
- Responsive design with mobile-first approach
- All CTAs lead to `/signup` for new users or `/dashboard` for logged-in users

---

**End of Document**
