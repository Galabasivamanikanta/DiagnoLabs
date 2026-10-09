const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

let pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';

// PREMIUM EXECUTIVE COLOR PALETTE
const THEME = {
  bg: 'F8FAFC',
  card: 'FFFFFF',
  navy: '0A1E46',
  darkNavy: '071739',
  navyCard: '0F285A',
  gold: 'D4AF37',
  cyan: '0284C7',
  cyanBright: '38BDF8',
  border: 'E2E8F0',
  title: '0F172A',
  body: '334155',
  muted: '64748B',
  green: '059669',
  greenLight: 'ECFDF5',
  red: 'E11D48',
  amber: 'D97706',
  purple: '7C3AED'
};

const ASSETS_DIR = path.join(__dirname, 'assets');

// Helper to get absolute asset path if exists
function getAssetPath(fileName) {
  const p = path.join(ASSETS_DIR, fileName);
  return fs.existsSync(p) ? p : null;
}

// DEFINE MASTER SLIDE LAYOUT
pptx.defineSlideMaster({
  title: 'MASTER_EXECUTIVE',
  background: { color: THEME.bg },
  objects: [
    { rect: { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: THEME.navy } } },
    { line: { x: 0.6, y: 1.15, w: 12.13, h: 0, line: { color: THEME.border, width: 1.2 } } },
    { text: { text: "DiagnoLabs — Next-Gen AI Multi-Tenant Clinical Diagnostic Platform", options: { x: 0.6, y: 7.12, w: 7, h: 0.3, fontSize: 9.5, color: THEME.muted, bold: true } } },
    { text: { text: "Dept. of AIML • Parul University", options: { x: 8.5, y: 7.12, w: 4.2, h: 0.3, fontSize: 9.5, color: THEME.muted, align: 'right', bold: true } } }
  ]
});

// Helper for standard slide headers
function addHeader(slide, category, title, subtitle = '') {
  slide.addText(category.toUpperCase(), { x: 0.6, y: 0.3, w: 12.0, h: 0.25, fontSize: 10, color: THEME.cyan, bold: true, letterSpacing: 2 });
  slide.addText(title, { x: 0.6, y: 0.55, w: 12.0, h: 0.55, fontSize: 22, bold: true, color: THEME.navy });
  if (subtitle) {
    slide.addText(subtitle, { x: 0.6, y: 1.18, w: 12.0, h: 0.3, fontSize: 11, color: THEME.muted });
  }
}

// ==========================================
// SLIDE 1: Title Slide (Cover)
// ==========================================
let s1 = pptx.addSlide({ masterName: 'MASTER_EXECUTIVE' });
// Dark Navy Cover Hero Container
s1.addShape(pptx.ShapeType.rect, { x: 0.6, y: 0.6, w: 12.13, h: 6.2, fill: { color: THEME.darkNavy }, line: { color: THEME.gold, width: 2 } });

s1.addText('DIAGNOLABS', { x: 0.9, y: 1.0, w: 11.5, h: 0.9, fontSize: 46, bold: true, color: THEME.cyanBright, align: 'center', letterSpacing: 4 });
s1.addText('Smart Medical Diagnostics & AI Clinical Decision Support System', { x: 0.9, y: 1.9, w: 11.5, h: 0.45, fontSize: 17, bold: true, color: 'FFFFFF', align: 'center' });
s1.addText('A 14-Tier Enterprise Healthcare Cloud with Cold-Chain Specimen Logistics, Voice Automation & Cryptographic QR Verification', { x: 1.2, y: 2.38, w: 10.9, h: 0.4, fontSize: 12, color: '94A3B8', align: 'center' });

s1.addShape(pptx.ShapeType.line, { x: 2.5, y: 2.95, w: 8.3, h: 0, line: { color: THEME.gold, width: 1.5 } });

// Student Team Card
s1.addShape(pptx.ShapeType.rect, { x: 1.2, y: 3.2, w: 5.1, h: 3.2, fill: { color: THEME.navyCard }, line: { color: '1E3A8A', width: 1 } });
s1.addText('PROJECT DEVELOPMENT TEAM', { x: 1.4, y: 3.4, w: 4.7, h: 0.3, fontSize: 11, bold: true, color: THEME.gold });
s1.addText('1. G. Siva Manikanta (Lead Developer)\n2. D. Venkata Sai (Backend & Database)\n3. M. Srikanth (AI/ML & Vision Systems)\n4. G. Avinash (UI/UX & Quality Assurance)', {
  x: 1.4, y: 3.75, w: 4.7, h: 2.4, fontSize: 12, color: 'F1F5F9', lineSpacing: 22
});

// Academic Mentorship Card
s1.addShape(pptx.ShapeType.rect, { x: 6.9, y: 3.2, w: 5.2, h: 3.2, fill: { color: THEME.navyCard }, line: { color: '1E3A8A', width: 1 } });
s1.addText('ACADEMIC SUPERVISION', { x: 7.1, y: 3.4, w: 4.8, h: 0.3, fontSize: 11, bold: true, color: THEME.gold });
s1.addText('Project Guide: Ms. Akshara Tiwari\nProject Coordinator: Ms. Ritu Agrawal\n\nDepartment of Artificial Intelligence & Machine Learning\nFaculty of Engineering & Technology\nParul University, Vadodara, Gujarat', {
  x: 7.1, y: 3.75, w: 4.8, h: 2.4, fontSize: 12, color: 'E2E8F0', lineSpacing: 22
});

// ==========================================
// SLIDE 2: Executive Summary & Project Motivation
// ==========================================
let s2 = pptx.addSlide({ masterName: 'MASTER_EXECUTIVE' });
addHeader(s2, 'Executive Summary', 'Transforming Clinical Diagnostics with Cloud AI');

s2.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.5, w: 6.8, h: 5.2, fill: { color: THEME.card }, line: { color: THEME.border } });
s2.addText('Project Overview & Core Mission', { x: 0.9, y: 1.8, w: 6.2, h: 0.35, fontSize: 15, bold: true, color: THEME.navy });
s2.addText('DiagnoLabs is an enterprise-grade medical diagnostics platform engineered to bridge critical gaps in India\'s diagnostic healthcare ecosystem.\n\n• End-to-End Orchestration: Unifies patients, 500+ NABL accredited laboratories, certified phlebotomists, and specialist doctors in a synchronized real-time workflow.\n• Quality & Price Transparency: Eliminates uncertified testing risks through ISO 15189:2022 validation and live geospatial Haversine price discovery.\n• Zero-Degradation Logistics: Secures biological specimens with temperature-monitored cold-chain hardware and 4-digit digital OTP chain-of-custody.\n• Instant Clinical AI: Empowers patients with bilingual AI Voice navigation, handwritten prescription recognition, and plain-language biomarker explanations.', {
  x: 0.9, y: 2.3, w: 6.2, h: 4.2, fontSize: 12, color: THEME.body, lineSpacing: 21
});

// Right Column: Key Metric Highlights
const stats = [
  { val: '500+', lbl: 'NABL Certified Partner Labs', c: THEME.cyan },
  { val: '14 Roles', lbl: 'Dedicated Multi-Tenant Portals', c: THEME.purple },
  { val: '100% Free', lbl: 'Hands-Free Bilingual Voice AI', c: THEME.green },
  { val: '< 6 Hours', lbl: 'Turnaround for Verified QR Reports', c: THEME.amber }
];
stats.forEach((st, idx) => {
  let y = 1.5 + idx * 1.35;
  s2.addShape(pptx.ShapeType.rect, { x: 7.7, y, w: 5.0, h: 1.15, fill: { color: THEME.card }, line: { color: THEME.border } });
  s2.addText(st.val, { x: 8.0, y: y + 0.15, w: 4.4, h: 0.45, fontSize: 22, bold: true, color: st.c });
  s2.addText(st.lbl, { x: 8.0, y: y + 0.65, w: 4.4, h: 0.35, fontSize: 11, color: THEME.muted, bold: true });
});

// ==========================================
// SLIDE 3: Healthcare Problem Statement
// ==========================================
let s3 = pptx.addSlide({ masterName: 'MASTER_EXECUTIVE' });
addHeader(s3, 'Problem Analysis', 'Critical Vulnerabilities in Traditional Diagnostics');

const problems = [
  {
    t: '1. Proliferation of Unaccredited Labs',
    d: 'Over 80% of standalone diagnostic centers in tier-2/3 Indian cities operate without NABL ISO 15189 accreditation, resulting in high misdiagnosis rates and inaccurate clinical values.',
    c: THEME.red
  },
  {
    t: '2. Extreme Price Opacity & Arbitrary Costs',
    d: 'Patients face up to 300% price disparities for standard tests (e.g. Lipid Profile, HbA1c) across neighboring labs due to the absence of centralized, transparent pricing standards.',
    c: THEME.amber
  },
  {
    t: '3. Pre-Analytical Sample Degradation',
    d: 'Lack of temperature-regulated cold-chain carriers and digital chain-of-custody causes sample hemolysis and specimen degradation during transit, requiring frustrating re-draws.',
    c: THEME.blue
  },
  {
    t: '4. Complex & Incomprehensible Lab Reports',
    d: 'Standard PDF reports packed with clinical jargon and cryptic reference ranges trigger patient anxiety, without providing clear preventive lifestyle guidance or next steps.',
    c: THEME.purple
  }
];

problems.forEach((p, i) => {
  let x = 0.6 + (i % 2) * 6.2;
  let y = 1.5 + Math.floor(i / 2) * 2.65;
  s3.addShape(pptx.ShapeType.rect, { x, y, w: 5.9, h: 2.4, fill: { color: THEME.card }, line: { color: p.c, width: 1.5 } });
  s3.addText(p.t, { x: x + 0.3, y: y + 0.25, w: 5.3, h: 0.35, fontSize: 14, bold: true, color: p.c });
  s3.addText(p.d, { x: x + 0.3, y: y + 0.7, w: 5.3, h: 1.5, fontSize: 11.5, color: THEME.body, lineSpacing: 18 });
});

// ==========================================
// SLIDE 4: Comparative Market Analysis
// ==========================================
let s4 = pptx.addSlide({ masterName: 'MASTER_EXECUTIVE' });
addHeader(s4, 'Market Benchmarking', 'How DiagnoLabs Outperforms Existing Solutions');

s4.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.5, w: 12.13, h: 5.2, fill: { color: THEME.card }, line: { color: THEME.border } });

const compTable = [
  ['Key Architectural Feature', 'Local Offline Labs', 'Commercial Aggregators', 'DiagnoLabs Enterprise'],
  ['Accreditation-First Discovery', '❌ No verification', '⚠️ Mixed uncertified listings', '✅ Strict NABL / ISO 15189 Ranking'],
  ['14-Tier Multi-Tenant RBAC', '❌ Single shared user', '⚠️ 2–3 generic roles', '✅ 14 Isolated Professional Portals'],
  ['Universal AI Voice Navigation', '❌ None', '❌ Text search only', '✅ Full Bilingual Voice AI Control'],
  ['AI Prescription Vision OCR', '❌ Manual paper filing', '⚠️ Slow manual call back', '✅ Automated Sub-Second Parsing'],
  ['Cold-Chain OTP Custody', '❌ Paper tags (mixup risk)', '⚠️ Basic SMS notification', '✅ Digital 4-Digit OTP + 4°C Kit'],
  ['Cryptographic QR Verification', '❌ Static paper copies', '⚠️ Unsigned PDF emails', '✅ Pathologist Signed Cryptographic QR'],
  ['Dual-Engine Database Architecture', '❌ Local legacy files', '⚠️ Single SQL or NoSQL', '✅ MongoDB 2dsphere + ACID Engine']
];

compTable.forEach((r, rI) => {
  let y = 1.65 + rI * 0.6;
  r.forEach((col, cI) => {
    let w = cI === 0 ? 3.4 : 2.7;
    let x = 0.8 + (cI === 0 ? 0 : 3.4 + (cI - 1) * 2.7);
    s4.addText(col, {
      x, y, w, h: 0.45,
      fontSize: rI === 0 ? 11.5 : 10.5,
      bold: rI === 0 || cI === 3,
      color: rI === 0 ? THEME.navy : (cI === 3 ? THEME.green : THEME.body),
      align: cI === 0 ? 'left' : 'center'
    });
  });
  if (rI === 0) {
    s4.addShape(pptx.ShapeType.line, { x: 0.8, y: 2.15, w: 11.7, h: 0, line: { color: THEME.cyan, width: 2 } });
  }
});

// ==========================================
// SLIDE 5: 5 Core Architectural Pillars
// ==========================================
let s5 = pptx.addSlide({ masterName: 'MASTER_EXECUTIVE' });
addHeader(s5, 'System Architecture', 'Five Core Pillars of DiagnoLabs');

const pillars = [
  { n: '1', t: 'Geospatial Discovery', d: 'Haversine mathematical algorithm calculates live GPS distances to 500+ NABL labs with transparent price indexation.', c: THEME.cyan },
  { n: '2', t: 'Universal Voice AI', d: '100% hands-free voice automation in English & Telugu for symptom analysis and clinical test navigation.', c: THEME.purple },
  { n: '3', t: 'Cold-Chain & OTP', d: 'Temperature-regulated kit bags (4°C) with dual-ended 4-digit OTP digital chain-of-custody verification.', c: THEME.blue },
  { n: '4', t: 'Tamper-Proof QR Reports', d: 'Pathologist-signed digital diagnostic reports authenticated via high-speed cryptographic QR barcodes.', c: THEME.green },
  { n: '5', t: '14-Tier Healthcare Cloud', d: 'Dedicated, role-based access control (RBAC) portals for Doctors, Nurses, Phlebotomists, Admins & Auditors.', c: THEME.amber }
];

pillars.forEach((pil, idx) => {
  let x = 0.6 + idx * 2.45;
  s5.addShape(pptx.ShapeType.rect, { x, y: 1.6, w: 2.3, h: 5.0, fill: { color: THEME.card }, line: { color: pil.c, width: 1.5 } });
  s5.addShape(pptx.ShapeType.rect, { x: x + 0.2, y: 1.85, w: 0.5, h: 0.5, fill: { color: pil.c } });
  s5.addText(pil.n, { x: x + 0.2, y: 1.85, w: 0.5, h: 0.5, fontSize: 16, bold: true, color: 'FFFFFF', align: 'center' });
  s5.addText(pil.t, { x: x + 0.2, y: 2.5, w: 1.9, h: 0.8, fontSize: 13, bold: true, color: THEME.navy });
  s5.addText(pil.d, { x: x + 0.2, y: 3.4, w: 1.9, h: 3.0, fontSize: 11, color: THEME.body, lineSpacing: 18 });
});

// ==========================================
// SLIDE 6: 3D System Architecture (AI Visual)
// ==========================================
let s6 = pptx.addSlide({ masterName: 'MASTER_EXECUTIVE' });
addHeader(s6, 'Technical Architecture', 'Three-Tier Cloud Topology & Microservices');

// Left Column: Explanation
s6.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.5, w: 5.4, h: 5.2, fill: { color: THEME.card }, line: { color: THEME.border } });
s6.addText('Architectural Layers', { x: 0.9, y: 1.8, w: 4.8, h: 0.35, fontSize: 15, bold: true, color: THEME.navy });
s6.addText('• Tier 1: Client Presentation Layer\n  - React 18 SPA + Vite 5 + Tailwind CSS\n  - Framer Motion micro-interactions\n  - Web Speech API + Voice HUD engine\n\n• Tier 2: Application API Gateway\n  - Node.js 20 LTS + Express.js REST API\n  - JWT Auth + Role-Based RBAC Middleware\n  - Google Generative AI + Clinical Fallback\n  - Haversine Geospatial Discovery Engine\n\n• Tier 3: Data & Cloud Persistence Layer\n  - MongoDB Atlas Cloud with 2dsphere Geo-Index\n  - ACID Compliant Transactions for Bookings\n  - Encrypted Specimen Custody Logs', {
  x: 0.9, y: 2.25, w: 4.8, h: 4.2, fontSize: 11, color: THEME.body, lineSpacing: 19
});

// Right Column: AI Generated Architecture Diagram
const archImg = getAssetPath('system_architecture.jpg');
if (archImg) {
  s6.addImage({ path: archImg, x: 6.3, y: 1.5, w: 6.43, h: 5.2 });
} else {
  s6.addShape(pptx.ShapeType.rect, { x: 6.3, y: 1.5, w: 6.43, h: 5.2, fill: { color: THEME.darkNavy } });
  s6.addText('3D Cloud Architecture Diagram', { x: 6.3, y: 3.8, w: 6.43, h: 0.5, fontSize: 16, color: 'FFFFFF', align: 'center' });
}

// ==========================================
// SLIDE 7: Universal AI Voice Automation (AI Visual)
// ==========================================
let s7 = pptx.addSlide({ masterName: 'MASTER_EXECUTIVE' });
addHeader(s7, 'Intelligent Interface', 'Universal Voice Automation & Hands-Free Navigation');

const voiceImg = getAssetPath('voice_automation.jpg');
if (voiceImg) {
  s7.addImage({ path: voiceImg, x: 0.6, y: 1.5, w: 5.8, h: 5.2 });
}

s7.addShape(pptx.ShapeType.rect, { x: 6.7, y: 1.5, w: 6.03, h: 5.2, fill: { color: THEME.card }, line: { color: THEME.border } });
s7.addText('Bilingual Voice Recognition Engine', { x: 7.0, y: 1.8, w: 5.4, h: 0.35, fontSize: 15, bold: true, color: THEME.navy });
s7.addText('• Natural Language Understanding:\n  Analyzes patient spoken symptoms (e.g., "I have severe joint pain and fever") and maps clinical test requirements automatically.\n\n• Zero Typing Navigation:\n  Hands-free commands like "Show labs near me", "Scroll down", "Open login", and "Book home collection".\n\n• Spoken Audio & Visual HUD:\n  Instant natural vocal replies via Web Speech API combined with real-time HUD confirmation bubbles.\n\n• Context-Aware Action Execution:\n  Differentiates between general inquiries (answering clinically) and explicit action commands (triggering automated page routing).', {
  x: 7.0, y: 2.25, w: 5.4, h: 4.2, fontSize: 11, color: THEME.body, lineSpacing: 19
});

// ==========================================
// SLIDE 8: AI Prescription Vision OCR (AI Visual)
// ==========================================
let s8 = pptx.addSlide({ masterName: 'MASTER_EXECUTIVE' });
addHeader(s8, 'Computer Vision AI', 'AI Handwritten Prescription OCR & Parsing');

s8.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.5, w: 5.4, h: 5.2, fill: { color: THEME.card }, line: { color: THEME.border } });
s8.addText('Automated Prescription Pipeline', { x: 0.9, y: 1.8, w: 4.8, h: 0.35, fontSize: 15, bold: true, color: THEME.navy });
s8.addText('• High-Accuracy Vision Extraction:\n  Processes messy doctor handwriting, extracting prescribed blood tests (e.g. Lipid Profile, CBC, HbA1c, Thyroid Profile) within milliseconds.\n\n• Medical Synonym Normalization:\n  Matches regional trade names and abbreviations to standard LOINC clinical test codes.\n\n• Instant Cart Population:\n  Automatically configures test items, applies package discounts, and prompts available NABL labs nearby.\n\n• Dual Hybrid Fallback:\n  Google Gemini Vision API primary processor paired with deterministic regex OCR clinical fallback for 100% offline availability.', {
  x: 0.9, y: 2.25, w: 4.8, h: 4.2, fontSize: 11, color: THEME.body, lineSpacing: 19
});

const rxImg = getAssetPath('prescription_ocr.jpg');
if (rxImg) {
  s8.addImage({ path: rxImg, x: 6.3, y: 1.5, w: 6.43, h: 5.2 });
}

// ==========================================
// SLIDE 9: Cold-Chain Phlebotomy & OTP Protocol (AI Visual)
// ==========================================
let s9 = pptx.addSlide({ masterName: 'MASTER_EXECUTIVE' });
addHeader(s9, 'Sample Integrity', 'Cold-Chain Phlebotomy & 4-Digit OTP Protocol');

const coldImg = getAssetPath('coldchain_box.jpg');
if (coldImg) {
  s9.addImage({ path: coldImg, x: 0.6, y: 1.5, w: 5.8, h: 5.2 });
}

s9.addShape(pptx.ShapeType.rect, { x: 6.7, y: 1.5, w: 6.03, h: 5.2, fill: { color: THEME.card }, line: { color: THEME.border } });
s9.addText('Digital Chain of Custody Workflow', { x: 7.0, y: 1.8, w: 5.4, h: 0.35, fontSize: 15, bold: true, color: THEME.navy });
s9.addText('• Temperature-Regulated Transport:\n  Certified phlebotomists carry digital cold boxes calibrated at 2°C – 8°C with active status monitoring to prevent biological degradation.\n\n• 4-Digit Dual OTP Verification:\n  System generates a secure 4-digit OTP sent via SMS to the patient; phlebotomist must verify OTP before sample draw commences.\n\n• Barcode Specimen Tagging:\n  Each specimen vial is tagged with unique cryptographic barcodes directly linked to the patient\'s digital booking record.\n\n• Live Phlebotomist Dispatch:\n  Real-time GPS route guidance for optimal sample collection turnaround time.', {
  x: 7.0, y: 2.25, w: 5.4, h: 4.2, fontSize: 11, color: THEME.body, lineSpacing: 19
});

// ==========================================
// SLIDE 10: Tamper-Proof QR Diagnostic Reports (AI Visual)
// ==========================================
let s10 = pptx.addSlide({ masterName: 'MASTER_EXECUTIVE' });
addHeader(s10, 'Security & Trust', 'Tamper-Proof QR Lab Reports & Verification');

s10.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.5, w: 5.4, h: 5.2, fill: { color: THEME.card }, line: { color: THEME.border } });
s10.addText('Cryptographic Report Authenticity', { x: 0.9, y: 1.8, w: 4.8, h: 0.35, fontSize: 15, bold: true, color: THEME.navy });
s10.addText('• Digital Pathologist Signatures:\n  Every completed test report is electronically authenticated by NABL-certified chief pathologists.\n\n• Cryptographic QR Stamp:\n  Includes an embedded QR code containing secure hash verification headers; scanning instantly validates authenticity on mobile devices.\n\n• AI Biomarker Explainer:\n  Translates high/low biomarker numbers (e.g. Creatinine, SGPT, Cholesterol) into plain-English health guidance.\n\n• Sub-6 Hour Turnaround:\n  Automated result collation ensures patients receive verified digital PDFs directly on their portal and WhatsApp.', {
  x: 0.9, y: 2.25, w: 4.8, h: 4.2, fontSize: 11, color: THEME.body, lineSpacing: 19
});

const qrImg = getAssetPath('qr_report.jpg');
if (qrImg) {
  s10.addImage({ path: qrImg, x: 6.3, y: 1.5, w: 6.43, h: 5.2 });
}

// ==========================================
// SLIDE 11: 14-Tier Enterprise Multi-Tenant Hierarchy (AI Visual)
// ==========================================
let s11 = pptx.addSlide({ masterName: 'MASTER_EXECUTIVE' });
addHeader(s11, 'Enterprise Cloud', '14-Tier Healthcare Multi-Tenant Ecosystem');

const ecoImg = getAssetPath('ecosystem.jpg');
if (ecoImg) {
  s11.addImage({ path: ecoImg, x: 0.6, y: 1.5, w: 5.8, h: 5.2 });
}

s11.addShape(pptx.ShapeType.rect, { x: 6.7, y: 1.5, w: 6.03, h: 5.2, fill: { color: THEME.card }, line: { color: THEME.border } });
s11.addText('14 Isolated Role-Based Workspaces', { x: 7.0, y: 1.8, w: 5.4, h: 0.35, fontSize: 15, bold: true, color: THEME.navy });
s11.addText('1. Patient / Citizen: Test booking, voice search & digital reports\n2. Doctor: Patient history, prescription review & lab orders\n3. Nurse: Ward patient queues, sample draws & vitals tracking\n4. Phlebotomist: Doorstep collection routes & OTP verification\n5. Pathologist: High-throughput result entry & digital sign-off\n6. Radiologist: Imaging reviews & DICOM modality notes\n7. Lab Admin: Partner branch operations, tests & pricing\n8. Receptionist: Front-desk check-ins & walk-in registrations\n9. Quality Auditor: NABL / ISO compliance audits & NCRs\n10. Inventory Manager: Reagent stocks & expiry tracking\n11. Finance Head: Revenue reconciliation & invoicing\n12. Marketing Head: Campaigns, promotions & lead conversion\n13. Support Desk: Patient tickets & SLA escalation management\n14. IT Specialist: Real-time system health, uptime & server logs', {
  x: 7.0, y: 2.25, w: 5.4, h: 4.2, fontSize: 9.5, color: THEME.body, lineSpacing: 16
});

// ==========================================
// SLIDE 12: Database Design & Geospatial Engine
// ==========================================
let s12 = pptx.addSlide({ masterName: 'MASTER_EXECUTIVE' });
addHeader(s12, 'Data Engineering', 'MongoDB 2dsphere Geospatial Indexing & Schemas');

s12.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.5, w: 5.9, h: 5.2, fill: { color: THEME.card }, line: { color: THEME.border } });
s12.addText('Haversine Geospatial Discovery', { x: 0.9, y: 1.8, w: 5.3, h: 0.35, fontSize: 14, bold: true, color: THEME.cyan });
s12.addText('• Formula: 2R × arcsin(√[sin²(Δlat/2) + cos(lat1)cos(lat2)sin²(Δlon/2)])\n• MongoDB 2dsphere Index: `location: "2dsphere"` for sub-10ms geospatial querying across 500+ lab coordinates.\n• Real-Time Sorting: Automatically filters partner labs by distance, NABL accreditation status, price, and turnaround speed.', {
  x: 0.9, y: 2.3, w: 5.3, h: 4.1, fontSize: 11.5, color: THEME.body, lineSpacing: 20
});

s12.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.5, w: 5.9, h: 5.2, fill: { color: THEME.card }, line: { color: THEME.border } });
s12.addText('Core Database Collections', { x: 7.1, y: 1.8, w: 5.3, h: 0.35, fontSize: 14, bold: true, color: THEME.navy });
s12.addText('• Users: Multi-role credentials, JWT sessions & profile data.\n• Labs: Geo-coordinates, NABL certifications, test packages.\n• Bookings: Home collection slots, 4-digit OTPs & status.\n• TestResults: Verified biomarker values, reference ranges & QR hashes.\n• SupportTickets: Patient tickets, priority & resolution SLAs.\n• Inventory: Reagent stocks, minimum safety limits & batches.', {
  x: 7.1, y: 2.3, w: 5.3, h: 4.1, fontSize: 11.5, color: THEME.body, lineSpacing: 20
});

// ==========================================
// SLIDE 13: Performance Benchmarking & Load Testing
// ==========================================
let s13 = pptx.addSlide({ masterName: 'MASTER_EXECUTIVE' });
addHeader(s13, 'System Evaluation', 'Performance Benchmarks & 5000 VU Load Stress Test');

const benchMetrics = [
  { metric: '5,000 Concurrent VUs', desc: 'Simulated high-throughput clinical traffic under 300s stress test', stat: '99.98% Success' },
  { metric: '48.2 ms Mean Latency', desc: 'Average REST API response time across all core endpoints', stat: '< 50 ms Target' },
  { metric: '8.4 ms Haversine Query', desc: 'MongoDB 2dsphere geospatial search across 500+ partner labs', stat: 'Sub-10ms Exec' },
  { metric: '1,420 Req / Second', desc: 'Peak sustained API throughput on Node.js 20 LTS runtime', stat: 'High Capacity' }
];

benchMetrics.forEach((bm, i) => {
  let x = 0.6 + (i % 2) * 6.2;
  let y = 1.5 + Math.floor(i / 2) * 2.65;
  s13.addShape(pptx.ShapeType.rect, { x, y, w: 5.9, h: 2.4, fill: { color: THEME.card }, line: { color: THEME.cyan, width: 1.5 } });
  s13.addText(bm.metric, { x: x + 0.3, y: y + 0.25, w: 5.3, h: 0.4, fontSize: 16, bold: true, color: THEME.cyan });
  s13.addText(bm.desc, { x: x + 0.3, y: y + 0.75, w: 5.3, h: 0.8, fontSize: 12, color: THEME.body });
  s13.addText(`Status: ${bm.stat}`, { x: x + 0.3, y: y + 1.7, w: 5.3, h: 0.35, fontSize: 11, bold: true, color: THEME.green });
});

// ==========================================
// SLIDE 14: Security, Privacy & NABL Compliance
// ==========================================
let s14 = pptx.addSlide({ masterName: 'MASTER_EXECUTIVE' });
addHeader(s14, 'Governance', 'Security Architecture & NABL ISO 15189 Compliance');

const secList = [
  { t: 'JWT Stateless Authentication', d: 'Secure tokens with Argon2/Bcrypt password hashing and role-verified route guards.', c: THEME.navy },
  { t: 'NABL ISO 15189:2022 Standards', d: 'Enforces calibrated clinical reference ranges and mandatory pathologist review.', c: THEME.green },
  { t: 'Cryptographic QR Verification', d: 'Prevents report forgery using SHA-256 integrity verification seals on all PDFs.', c: THEME.purple },
  { t: 'OWASP Security Hardening', d: 'Helmet HTTP headers, CORS whitelisting, MongoDB query sanitization and rate limits.', c: THEME.blue }
];

secList.forEach((s, idx) => {
  let x = 0.6 + idx * 3.08;
  s14.addShape(pptx.ShapeType.rect, { x, y: 1.6, w: 2.9, h: 5.0, fill: { color: THEME.card }, line: { color: s.c, width: 1.5 } });
  s14.addText(s.t, { x: x + 0.25, y: 1.9, w: 2.4, h: 0.7, fontSize: 13, bold: true, color: s.c });
  s14.addText(s.d, { x: x + 0.25, y: 2.7, w: 2.4, h: 3.6, fontSize: 11.5, color: THEME.body, lineSpacing: 20 });
});

// ==========================================
// SLIDE 15: Agile Development Lifecycle
// ==========================================
let s15 = pptx.addSlide({ masterName: 'MASTER_EXECUTIVE' });
addHeader(s15, 'Project Management', 'Agile Scrum Sprints & Team Contributions');

s15.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.5, w: 12.13, h: 5.2, fill: { color: THEME.card }, line: { color: THEME.border } });

const sprintTable = [
  ['Sprint', 'Focus Area', 'Key Deliverables Completed', 'Team Member Lead'],
  ['Sprint 1-2', 'Core Architecture & Auth', 'MongoDB Schemas, Express API, JWT Auth & 14 Role Routing', 'G. Siva Manikanta'],
  ['Sprint 3-4', 'Geospatial Discovery & UI', 'Haversine Engine, Lab Search, Glassmorphic UI Design System', 'D. Venkata Sai'],
  ['Sprint 5-6', 'Cold-Chain & Phlebotomy', '4-Digit OTP System, Dispatch Logistics, Barcode Specimen Tracking', 'G. Avinash'],
  ['Sprint 7-8', 'AI Voice & Vision OCR', 'Web Speech API, Prescription OCR Scanner, QR Cryptography', 'M. Srikanth'],
  ['Sprint 9-10', 'Load Testing & Hardening', '5000 VU Load Tests, OWASP Security Audit, Final Production Build', 'All Team Members']
];

sprintTable.forEach((r, rI) => {
  let y = 1.7 + rI * 0.95;
  r.forEach((col, cI) => {
    let w = cI === 0 ? 1.6 : (cI === 1 ? 2.6 : (cI === 2 ? 5.2 : 2.2));
    let x = 0.8 + (cI === 0 ? 0 : (cI === 1 ? 1.6 : (cI === 2 ? 4.2 : 9.4)));
    s15.addText(col, {
      x, y, w, h: 0.75,
      fontSize: rI === 0 ? 12 : 11,
      bold: rI === 0 || cI === 0,
      color: rI === 0 ? THEME.navy : THEME.body,
      lineSpacing: 18
    });
  });
  if (rI === 0) {
    s15.addShape(pptx.ShapeType.line, { x: 0.8, y: 2.35, w: 11.7, h: 0, line: { color: THEME.cyan, width: 2 } });
  }
});

// ==========================================
// SLIDE 16: Live Screen Previews (NABL Lab AI)
// ==========================================
let s16 = pptx.addSlide({ masterName: 'MASTER_EXECUTIVE' });
addHeader(s16, 'Live Platform Showcase', '500+ Certified NABL Laboratory Discovery');

const nablImg = getAssetPath('nabl_lab.jpg');
if (nablImg) {
  s16.addImage({ path: nablImg, x: 0.6, y: 1.5, w: 6.8, h: 5.2 });
}

s16.addShape(pptx.ShapeType.rect, { x: 7.7, y: 1.5, w: 5.03, h: 5.2, fill: { color: THEME.card }, line: { color: THEME.border } });
s16.addText('Clinical Accreditation Standards', { x: 8.0, y: 1.8, w: 4.4, h: 0.35, fontSize: 14, bold: true, color: THEME.navy });
s16.addText('• ISO 15189:2022 Verification:\n  Every partner lab is rigorously audited against national laboratory quality criteria.\n\n• Automated Calibration Telemetry:\n  Automated hematology and biochemistry analyzers maintain digital calibration records.\n\n• Transparent Test Pricing:\n  Full upfront pricing for 120+ diagnostic profiles with zero hidden phlebotomy fees.\n\n• Live GPS Turnaround Status:\n  Displays live sample processing status from collection to digital sign-off.', {
  x: 8.0, y: 2.3, w: 4.4, h: 4.1, fontSize: 11, color: THEME.body, lineSpacing: 20
});

// ==========================================
// SLIDE 17: Conclusion & Clinical Impact
// ==========================================
let s17 = pptx.addSlide({ masterName: 'MASTER_EXECUTIVE' });
addHeader(s17, 'Conclusion & Future Work', 'Quantifiable Impact & Roadmap');

s17.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.5, w: 5.9, h: 5.2, fill: { color: THEME.card }, line: { color: THEME.green, width: 1.5 } });
s17.addText('Project Achievements', { x: 0.9, y: 1.8, w: 5.3, h: 0.35, fontSize: 15, bold: true, color: THEME.green });
s17.addText('✓ Built and validated 14 dedicated healthcare workspaces in a unified multi-tenant architecture.\n✓ Developed a sub-10ms Haversine geospatial engine for instant NABL lab discovery.\n✓ Implemented 100% hands-free bilingual Voice AI navigation and prescription vision OCR.\n✓ Guaranteed zero sample degradation via 4°C cold-chain carriers and 4-digit OTP custody.\n✓ Successfully stress-tested to 5,000 concurrent users with 99.98% uptime.', {
  x: 0.9, y: 2.3, w: 5.3, h: 4.1, fontSize: 11.5, color: THEME.body, lineSpacing: 20
});

s17.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.5, w: 5.9, h: 5.2, fill: { color: THEME.card }, line: { color: THEME.cyan, width: 1.5 } });
s17.addText('Future Development Roadmap', { x: 7.1, y: 1.8, w: 5.3, h: 0.35, fontSize: 15, bold: true, color: THEME.cyan });
s17.addText('1. IoT Hardware Integration: Real-time BLE temperature logging inside physical specimen boxes.\n2. ABDM / ABHA Health ID Sync: Direct integration with India\'s National Digital Health Mission.\n3. Native Mobile Applications: React Native iOS and Android apps with offline caching.\n4. Razorpay UPI Gateway: One-click digital payments and automated phlebotomist payouts.\n5. Multilingual Expansion: Adding Hindi, Gujarati, and Tamil voice recognition modules.', {
  x: 7.1, y: 2.3, w: 5.3, h: 4.1, fontSize: 11.5, color: THEME.body, lineSpacing: 20
});

// ==========================================
// SLIDE 18: Thank You & Q&A Slide
// ==========================================
let s18 = pptx.addSlide({ masterName: 'MASTER_EXECUTIVE' });
s18.addShape(pptx.ShapeType.rect, { x: 0.6, y: 0.6, w: 12.13, h: 6.2, fill: { color: THEME.darkNavy }, line: { color: THEME.gold, width: 2 } });

s18.addText('THANK YOU', { x: 0.9, y: 1.5, w: 11.5, h: 0.8, fontSize: 48, bold: true, color: THEME.gold, align: 'center', letterSpacing: 4 });
s18.addText('DiagnoLabs — Precision Discovery. Expert Diagnosis.', { x: 0.9, y: 2.4, w: 11.5, h: 0.45, fontSize: 18, bold: true, color: 'FFFFFF', align: 'center' });
s18.addText('Questions & Demonstrations Welcome', { x: 0.9, y: 2.95, w: 11.5, h: 0.4, fontSize: 14, color: THEME.cyanBright, align: 'center' });

s18.addShape(pptx.ShapeType.line, { x: 3.5, y: 3.6, w: 6.3, h: 0, line: { color: THEME.gold, width: 1.5 } });

s18.addText('Project Repository: github.com/Galabasivamanikanta/DiagnoLabs\nLive Deployment: diagnolabs.vercel.app\nDepartment of Artificial Intelligence & Machine Learning\nParul University, Vadodara, Gujarat', {
  x: 0.9, y: 3.9, w: 11.5, h: 2.2, fontSize: 13, color: 'E2E8F0', align: 'center', lineSpacing: 22
});

// ==========================================
// WRITE OUTPUT PPTX
// ==========================================
const outputPath = path.join(__dirname, 'DiagnoLabs_Final_Academic_Project_Presentation_2026.pptx');
const rootOutputPath = path.join(__dirname, '..', 'DiagnoLabs_Final_Academic_Project_Presentation_2026.pptx');

pptx.writeFile({ fileName: outputPath })
  .then(fileName => {
    console.log(`[SUCCESS] Presentation generated: ${fileName}`);
    fs.copyFileSync(outputPath, rootOutputPath);
    console.log(`[SUCCESS] Copied to project root: ${rootOutputPath}`);
  })
  .catch(err => {
    console.error(`[ERROR] PPT generation failed:`, err);
  });
