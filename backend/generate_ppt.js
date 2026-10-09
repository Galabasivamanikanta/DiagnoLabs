const pptxgen = require("pptxgenjs");

let pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';

// LIGHT THEME PALETTE
const THEME = {
  bg: 'F8FAFC',
  card: 'FFFFFF',
  border: 'E2E8F0',
  title: '0F172A',
  body: '334155',
  muted: '64748B',
  primary: '0284C7',
  blue: '2563EB',
  green: '059669',
  red: 'E11D48',
  amber: 'D97706',
  purple: '7C3AED'
};

pptx.defineSlideMaster({
  title: 'MASTER_LIGHT',
  background: { color: THEME.bg },
  objects: [
    { rect: { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: THEME.primary } } },
    { line: { x: '5%', y: '12%', w: '90%', h: 0, line: { color: THEME.border, width: 1.5 } } },
    { text: { text: "DiagnoLabs — Smart Medical Diagnostics Platform", options: { x: 0.6, y: 7.1, w: 6, h: 0.3, fontSize: 10, color: THEME.muted } } },
    { text: { text: "Parul University | Dept. of AIML", options: { x: 8.5, y: 7.1, w: 4.3, h: 0.3, fontSize: 10, color: THEME.muted, align: 'right' } } }
  ]
});

function addHeader(slide, tag, title) {
  slide.addText(tag.toUpperCase(), { x: 0.6, y: 0.35, w: '85%', h: 0.3, fontSize: 11, color: THEME.primary, bold: true, letterSpacing: 2 });
  slide.addText(title, { x: 0.6, y: 0.65, w: '85%', h: 0.6, fontSize: 26, bold: true, color: THEME.title });
}

// SLIDE 1: Title
let s1 = pptx.addSlide({ masterName: 'MASTER_LIGHT' });
s1.addShape(pptx.ShapeType.rect, { x: 1.2, y: 1.0, w: 10.9, h: 5.3, fill: { color: THEME.card }, line: { color: THEME.primary, width: 2 } });
s1.addText('DIAGNOLABS', { x: 1.2, y: 1.3, w: 10.9, h: 0.8, fontSize: 44, bold: true, color: THEME.primary, align: 'center', letterSpacing: 3 });
s1.addText('Smart Medical Diagnostics & AI Clinical Platform', { x: 1.2, y: 2.1, w: 10.9, h: 0.4, fontSize: 16, bold: true, color: THEME.title, align: 'center' });
s1.addText('Connecting Patients, Phlebotomists & Certified Labs with Smart AI Assistance', { x: 1.5, y: 2.55, w: 10.3, h: 0.4, fontSize: 13, color: THEME.muted, align: 'center' });
s1.addShape(pptx.ShapeType.line, { x: 2.5, y: 3.1, w: 8.3, h: 0, line: { color: THEME.border, width: 1.5 } });

s1.addText('Project Team:\n1. D. Venkata Sai\n2. M. Srikanth\n3. G. Siva Manikanta\n4. G. Avinash', { x: 1.6, y: 3.3, w: 5.0, h: 2.4, fontSize: 13, color: THEME.title, lineSpacing: 22 });
s1.addText('Academic Supervision:\nProject Guide: Ms. Akshara Tiwari\nProject Coordinator: Ms. Ritu Agrawal\n\nDept. of Artificial Intelligence & Machine Learning\nParul University', { x: 6.8, y: 3.3, w: 5.0, h: 2.4, fontSize: 13, color: THEME.blue, lineSpacing: 22 });

// SLIDE 2: What is DiagnoLabs?
let s2 = pptx.addSlide({ masterName: 'MASTER_LIGHT' });
addHeader(s2, 'Project Overview', 'What is DiagnoLabs?');
s2.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.6, w: 5.8, h: 5.0, fill: { color: THEME.card }, line: { color: THEME.border } });
s2.addText('Simple Mission', { x: 0.9, y: 1.9, w: 5.2, h: 0.4, fontSize: 16, bold: true, color: THEME.primary });
s2.addText('DiagnoLabs is an all-in-one digital healthcare platform designed to make medical lab testing fast, simple, and 100% reliable.\n\nInstead of visiting random uncertified clinics, patients can easily find government-certified (NABL) labs, upload prescriptions for instant test bookings, and receive verified digital reports at home.', { x: 0.9, y: 2.5, w: 5.2, h: 3.8, fontSize: 13, color: THEME.body, lineSpacing: 22 });

s2.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.6, w: 5.8, h: 5.0, fill: { color: THEME.card }, line: { color: THEME.green, width: 1.5 } });
s2.addText('Key Features Built', { x: 7.1, y: 1.9, w: 5.2, h: 0.4, fontSize: 16, bold: true, color: THEME.green });
s2.addText('✓ Quality Lab Search: Automatically highlights accredited labs nearby.\n✓ 14 User Dashboards: Tailored views for patients, doctors, collectors & admins.\n✓ AI Prescription Reader: Reads handwritten doctor slips in seconds.\n✓ Doorstep Sample Pickup: Barcode-verified home blood collection.\n✓ Plain-English Reports: AI explains complex test values in simple words.\n✓ Secure Dual Database: Fast booking storage + safe financial records.', { x: 7.1, y: 2.5, w: 5.2, h: 3.8, fontSize: 13, color: THEME.title, lineSpacing: 22 });

// SLIDE 3: Problem Statement
let s3 = pptx.addSlide({ masterName: 'MASTER_LIGHT' });
addHeader(s3, 'The Healthcare Problem', 'Why Did We Build DiagnoLabs?');
const pList = [
  { t: '1. Uncertified Labs Everywhere', d: 'Over 80% of local lab centers in India lack official NABL quality certification, leading to frequent false test results.', c: THEME.red },
  { t: '2. Unclear & Overpriced Tests', d: 'Different labs charge wildly different prices for the exact same blood test because there is no transparent price check.', c: THEME.amber },
  { t: '3. Sample Handling Mistakes', d: 'Samples collected at home often get mixed up or damaged in transit due to lack of digital barcodes and temperature tracking.', c: THEME.blue },
  { t: '4. Confusing Medical Reports', d: 'Patients receive complex medical PDF files full of medical terms that cause panic instead of clarity.', c: THEME.purple }
];
pList.forEach((p, i) => {
  let x = 0.6 + (i % 2) * 6.2;
  let y = 1.6 + Math.floor(i / 2) * 2.5;
  s3.addShape(pptx.ShapeType.rect, { x, y, w: 5.9, h: 2.2, fill: { color: THEME.card }, line: { color: p.c, width: 1.5 } });
  s3.addText(p.t, { x: x + 0.3, y: y + 0.25, w: 5.3, h: 0.4, fontSize: 15, bold: true, color: p.c });
  s3.addText(p.d, { x: x + 0.3, y: y + 0.75, w: 5.3, h: 1.2, fontSize: 12, color: THEME.body, lineSpacing: 18 });
});

// SLIDE 4: Comparison Table
let s4 = pptx.addSlide({ masterName: 'MASTER_LIGHT' });
addHeader(s4, 'Market Comparison', 'How DiagnoLabs Solves These Problems');
s4.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.6, w: 12.0, h: 5.0, fill: { color: THEME.card }, line: { color: THEME.border } });
const rows = [
  ['Feature', 'Local Testing Centers', 'Other Online Apps', 'DiagnoLabs (Our Project)'],
  ['Accredited Lab Search', '❌ No rating or check', '⚠️ Shows all labs equally', '✅ Quality-first certified ranking'],
  ['14 Dedicated User Roles', '❌ No roles (single login)', '⚠️ Only 2-3 basic roles', '✅ 14 custom role dashboards'],
  ['Handwritten Prescription AI', '❌ Manual paper entry', '⚠️ Requires slow phone call', '✅ Instant AI vision recognition'],
  ['AI Medical Report Explainer', '❌ None', '⚠️ Generic FAQ answers', '✅ Simple plain-English explanation'],
  ['Doorstep Barcode Tracking', '❌ Paper tags (risk of mix-up)', '⚠️ Basic text SMS', '✅ Barcode locked to patient ID'],
  ['Data Security & Privacy', '❌ Basic shared files', '⚠️ Single standard storage', '✅ Dual secure database engine']
];
rows.forEach((r, rI) => {
  let y = 1.8 + rI * 0.65;
  r.forEach((col, cI) => {
    let w = cI === 0 ? 3.2 : 2.7;
    let x = 0.9 + (cI === 0 ? 0 : 3.2 + (cI - 1) * 2.7);
    s4.addText(col, { x, y, w, h: 0.5, fontSize: rI === 0 ? 12 : 11, bold: rI === 0 || cI === 3, color: rI === 0 ? THEME.title : (cI === 3 ? THEME.green : THEME.body), align: cI === 0 ? 'left' : 'center' });
  });
  if (rI === 0) s4.addShape(pptx.ShapeType.line, { x: 0.9, y: 2.25, w: 11.4, h: 0, line: { color: THEME.primary, width: 1.5 } });
});

// SLIDE 5: 5 Core Pillars
let s5 = pptx.addSlide({ masterName: 'MASTER_LIGHT' });
addHeader(s5, 'System Design', '5 Core Pillars of the Platform');
const pillars = [
  { n: '01', t: 'Smart Lab Search', d: 'Ranks certified NABL labs higher so patients get accurate results.' },
  { n: '02', t: '14 User Portals', d: 'Custom clean screens for patients, doctors, nurses, collectors & admins.' },
  { n: '03', t: 'Clinical AI Assistant', d: 'Scans prescriptions and explains blood reports in plain English.' },
  { n: '04', t: 'Doorstep Pickup', d: 'Phlebotomist scans vial barcode at home for 100% sample safety.' },
  { n: '05', t: 'Dual Database', d: 'MongoDB for fast test catalog + PostgreSQL for safe financial ledgers.' }
];
pillars.forEach((p, i) => {
  let x = 0.6 + i * 2.44;
  s5.addShape(pptx.ShapeType.rect, { x, y: 1.6, w: 2.32, h: 5.0, fill: { color: THEME.card }, line: { color: THEME.primary, width: 1.5 } });
  s5.addText(p.n, { x: x + 0.15, y: 1.9, w: 2.0, h: 0.5, fontSize: 24, bold: true, color: THEME.primary });
  s5.addText(p.t, { x: x + 0.15, y: 2.5, w: 2.0, h: 0.8, fontSize: 14, bold: true, color: THEME.title });
  s5.addShape(pptx.ShapeType.line, { x: x + 0.15, y: 3.4, w: 2.0, h: 0, line: { color: THEME.border, width: 1 } });
  s5.addText(p.d, { x: x + 0.15, y: 3.6, w: 2.0, h: 2.7, fontSize: 12, color: THEME.body, lineSpacing: 18 });
});

// SLIDE 6: Smart Lab Discovery Formula
let s6 = pptx.addSlide({ masterName: 'MASTER_LIGHT' });
addHeader(s6, 'Smart Algorithm', 'Quality-Weighted Lab Discovery');
s6.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.6, w: 12.0, h: 1.5, fill: { color: 'F0F9FF' }, line: { color: THEME.primary, width: 1.5 } });
s6.addText('How We Rank Diagnostic Centers (Simple Quality Formula):', { x: 0.9, y: 1.8, w: 11.4, h: 0.3, fontSize: 12, bold: true, color: THEME.muted });
s6.addText('Best Lab Rank = Distance / [ 1 + (NABL Accreditation Bonus) + (User Star Rating) + (Fast Report Speed) ]', { x: 0.9, y: 2.15, w: 11.4, h: 0.6, fontSize: 16, bold: true, color: THEME.blue, align: 'center' });

s6.addShape(pptx.ShapeType.rect, { x: 0.6, y: 3.3, w: 5.8, h: 3.3, fill: { color: THEME.card }, line: { color: THEME.border } });
s6.addText('What Goes Into the Score?', { x: 0.9, y: 3.5, w: 5.2, h: 0.4, fontSize: 14, bold: true, color: THEME.primary });
s6.addText('• Distance: Measures real driving distance using GPS coordinates.\n• NABL Certification (50% weight): High bonus for accredited labs.\n• Patient Rating (30% weight): Star reviews from verified patients.\n• Turnaround Speed (20% weight): Average hours taken to deliver reports.', { x: 0.9, y: 4.0, w: 5.2, h: 2.4, fontSize: 12, color: THEME.title, lineSpacing: 18 });

s6.addShape(pptx.ShapeType.rect, { x: 6.8, y: 3.3, w: 5.8, h: 3.3, fill: { color: THEME.card }, line: { color: THEME.green, width: 1.5 } });
s6.addText('Real-World Patient Benefit', { x: 7.1, y: 3.5, w: 5.2, h: 0.4, fontSize: 14, bold: true, color: THEME.green });
s6.addText('✓ Avoids Bad Labs: An uncertified lab 1 km away is not shown first.\n✓ Puts Accuracy First: A certified gold-standard lab 3 km away gets top recommendation.\n✓ Transparent Pricing: Shows exact test prices before booking with no hidden fees.', { x: 7.1, y: 4.0, w: 5.2, h: 2.4, fontSize: 12, color: THEME.body, lineSpacing: 18 });

// SLIDE 7: 14 User Roles
let s7 = pptx.addSlide({ masterName: 'MASTER_LIGHT' });
addHeader(s7, 'User Management', '14 Custom Roles for Smooth Healthcare Workflows');
const roles = [
  { t: '1. Medical & Clinical Team', r: 'Doctor | Pathologist | Phlebotomist | Nurse', d: 'Review tests, collect home samples, verify results & digitally sign reports.', c: THEME.primary },
  { t: '2. Field & Operations Team', r: 'Receptionist | Delivery Partner | Support Staff', d: 'Check in patients, transport physical vials & help patients over live chat.', c: THEME.amber },
  { t: '3. Hospital & Admin Team', r: 'Master Admin | Finance | Inventory | Marketing | Auditor | IT', d: 'Track test reagent stocks, manage staff accounts & view revenue ledgers.', c: THEME.purple },
  { t: '4. Patients & Families', r: 'Registered Patient | Family Dependents', d: 'Book tests, track home collection, store family health records & call SOS.', c: THEME.green }
];
roles.forEach((r, i) => {
  let y = 1.6 + i * 1.3;
  s7.addShape(pptx.ShapeType.rect, { x: 0.6, y, w: 12.0, h: 1.15, fill: { color: THEME.card }, line: { color: r.c, width: 1.5 } });
  s7.addText(r.t, { x: 0.9, y: y + 0.15, w: 3.2, h: 0.35, fontSize: 13, bold: true, color: r.c });
  s7.addText(`[ ${r.r} ]`, { x: 4.2, y: y + 0.15, w: 8.0, h: 0.35, fontSize: 11, bold: true, color: THEME.title });
  s7.addText(r.d, { x: 0.9, y: y + 0.55, w: 11.4, h: 0.45, fontSize: 12, color: THEME.body });
});

// SLIDE 8: AI Copilot
let s8 = pptx.addSlide({ masterName: 'MASTER_LIGHT' });
addHeader(s8, 'Artificial Intelligence', 'Multimodal AI Prescription & Report Assistant');
s8.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.6, w: 5.8, h: 5.0, fill: { color: THEME.card }, line: { color: THEME.border } });
s8.addText('What the AI Does (Gemini 1.5 Flash)', { x: 0.9, y: 1.9, w: 5.2, h: 0.4, fontSize: 15, bold: true, color: THEME.primary });
s8.addText('• Prescription Scanner: Patients upload a photo of a handwritten doctor prescription; AI instantly identifies the tests and adds them to cart.\n• Report Explainer: Translates confusing lab terms (e.g. HbA1c, Platelets, TSH) into clear, friendly advice.\n• Voice Chat: Patients can speak directly using voice input for simple questions.', { x: 0.9, y: 2.5, w: 5.2, h: 3.8, fontSize: 13, color: THEME.title, lineSpacing: 20 });

s8.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.6, w: 5.8, h: 5.0, fill: { color: THEME.card }, line: { color: THEME.amber, width: 1.5 } });
s8.addText('Reliable Backup Rule Engine', { x: 7.1, y: 1.9, w: 5.2, h: 0.4, fontSize: 15, bold: true, color: THEME.amber });
s8.addText('• Always Online: If cloud AI is slow or offline, a built-in medical rule engine instantly provides accurate preparation guidance.\n• Smart Role Adaptation: Gives detailed scientific numbers to doctors and simple plain advice to patients.\n• Issue Auto-Routing: Detects emergencies or complaints and routes them directly to support staff.', { x: 7.1, y: 2.5, w: 5.2, h: 3.8, fontSize: 13, color: THEME.body, lineSpacing: 20 });

// SLIDE 9: AI Learning & Feedback
let s9 = pptx.addSlide({ masterName: 'MASTER_LIGHT' });
addHeader(s9, 'Continuous Improvement', 'Self-Learning AI Feedback System');
s9.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.6, w: 12.0, h: 2.2, fill: { color: THEME.card }, line: { color: THEME.green, width: 1.5 } });
s9.addText('How the AI Learns from Feedback', { x: 0.9, y: 1.8, w: 11.4, h: 0.4, fontSize: 15, bold: true, color: THEME.green });
s9.addText('Every AI reply has a simple Thumbs Up / Thumbs Down button.\nWhen doctors or patients point out an issue, the feedback is safely logged to our Memory database so the AI improves over time without needing code changes.', { x: 0.9, y: 2.3, w: 11.4, h: 1.3, fontSize: 13, color: THEME.title, lineSpacing: 20 });

s9.addShape(pptx.ShapeType.rect, { x: 0.6, y: 4.1, w: 5.8, h: 2.5, fill: { color: THEME.card }, line: { color: THEME.border } });
s9.addText('Super Low Mistake Rate', { x: 0.9, y: 4.3, w: 5.2, h: 0.35, fontSize: 13, bold: true, color: THEME.primary });
s9.addText('3.1%', { x: 0.9, y: 4.7, w: 5.2, h: 0.8, fontSize: 36, bold: true, color: THEME.primary });
s9.addText('Tested across 200+ real-world clinical prompt questions with 96.9% accuracy.', { x: 0.9, y: 5.6, w: 5.2, h: 0.8, fontSize: 12, color: THEME.muted });

s9.addShape(pptx.ShapeType.rect, { x: 6.8, y: 4.1, w: 5.8, h: 2.5, fill: { color: THEME.card }, line: { color: THEME.cardBorder } });
s9.addText('Key Patient Safety Results', { x: 7.1, y: 4.3, w: 5.2, h: 0.35, fontSize: 13, bold: true, color: THEME.title });
s9.addText('• Accurate Fasting Guidelines (e.g. 10-12 hours fasting for Lipid panels).\n• Instant safety warnings when symptoms indicate an emergency.\n• Automatic escalation of booking questions to human support.', { x: 7.1, y: 4.8, w: 5.2, h: 1.6, fontSize: 12, color: THEME.body, lineSpacing: 18 });

// SLIDE 10: Home Collection Workflow
let s10 = pptx.addSlide({ masterName: 'MASTER_LIGHT' });
addHeader(s10, 'Field Operations', 'Simple 6-Step Home Sample Collection');
const steps = [
  { s: '1. Book Test Online', d: 'Patient picks test & preferred home pickup time.' },
  { s: '2. Phlebotomist Assigned', d: 'Nearest collector receives request with location map.' },
  { s: '3. Doorstep Barcode Scan', d: 'Blood tube barcode scanned & locked to patient record.' },
  { s: '4. Safe Cold-Chain Transit', d: 'Sample stored in temperature-safe bag during travel.' },
  { s: '5. Lab Verification', d: 'Pathologist scans vial on arrival to verify seal.' },
  { s: '6. Digital Report Delivery', d: 'Signed report appears in patient account with AI explanation.' }
];
steps.forEach((st, i) => {
  let x = 0.6 + (i % 3) * 4.1;
  let y = 1.6 + Math.floor(i / 3) * 2.5;
  s10.addShape(pptx.ShapeType.rect, { x, y, w: 3.9, h: 2.2, fill: { color: THEME.card }, line: { color: THEME.primary, width: 1.2 } });
  s10.addText(st.s, { x: x + 0.2, y: y + 0.25, w: 3.5, h: 0.4, fontSize: 14, bold: true, color: THEME.primary });
  s10.addText(st.d, { x: x + 0.2, y: y + 0.75, w: 3.5, h: 1.2, fontSize: 12, color: THEME.body, lineSpacing: 16 });
});

// SLIDE 11: Tech Stack
let s11 = pptx.addSlide({ masterName: 'MASTER_LIGHT' });
addHeader(s11, 'Technology Stack', 'Modern, Fast & Reliable Tools Used');
const stack = [
  { n: 'FRONTEND (User Interface)', s: 'React 18 | Vite | Framer Motion | Modern CSS', d: 'Clean, fast-loading, mobile-friendly interface with smooth animations and voice features.', c: THEME.primary },
  { n: 'BACKEND (API & Security)', s: 'Node.js | Express 5 | JWT Security | Helmet', d: 'Fast REST API gateway with secure login tokens, rate limits, and protection against attacks.', c: THEME.purple },
  { n: 'DATABASE & SERVICES', s: 'MongoDB Atlas | PostgreSQL | Google Gemini | Razorpay', d: 'Dual database for speed and security, integrated with Razorpay payments and live notifications.', c: THEME.green }
];
stack.forEach((stk, i) => {
  let y = 1.6 + i * 1.75;
  s11.addShape(pptx.ShapeType.rect, { x: 0.6, y, w: 12.0, h: 1.55, fill: { color: THEME.card }, line: { color: stk.c, width: 1.5 } });
  s11.addText(stk.n, { x: 0.9, y: y + 0.15, w: 4.5, h: 0.35, fontSize: 13, bold: true, color: stk.c });
  s11.addText(stk.s, { x: 5.2, y: y + 0.15, w: 7.1, h: 0.35, fontSize: 11, bold: true, color: THEME.blue, align: 'right' });
  s11.addText(stk.d, { x: 0.9, y: y + 0.65, w: 11.4, h: 0.7, fontSize: 12, color: THEME.body, lineSpacing: 16 });
});

// SLIDE 12: Dual Database
let s12 = pptx.addSlide({ masterName: 'MASTER_LIGHT' });
addHeader(s12, 'Database Design', 'Why We Use Two Databases');
s12.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.6, w: 5.8, h: 5.0, fill: { color: THEME.card }, line: { color: THEME.primary } });
s12.addText('MongoDB Atlas (For Fast Clinical Data)', { x: 0.9, y: 1.9, w: 5.2, h: 0.4, fontSize: 14, bold: true, color: THEME.primary });
s12.addText('Best for dynamic, flexible medical data:\n\n• Patient profiles & family members\n• 500+ diagnostic tests & preparation steps\n• Live test bookings & barcode statuses\n• Fast GPS location search for certified labs\n• AI feedback & rating logs', { x: 0.9, y: 2.5, w: 5.2, h: 3.8, fontSize: 13, color: THEME.title, lineSpacing: 22 });

s12.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.6, w: 5.8, h: 5.0, fill: { color: THEME.card }, line: { color: THEME.purple } });
s12.addText('PostgreSQL (For 100% Safe Financial Records)', { x: 7.1, y: 1.9, w: 5.2, h: 0.4, fontSize: 14, bold: true, color: THEME.purple });
s12.addText('Best for strict, unchangeable records:\n\n• Master administrator & staff credentials\n• Accurate payment & revenue settlement ledgers\n• Security audit logs for government compliance\n• Structured financial reports for management\n• Zero-loss transaction reliability', { x: 7.1, y: 2.5, w: 5.2, h: 3.8, fontSize: 13, color: THEME.title, lineSpacing: 22 });

// SLIDE 13: Security & Privacy
let s13 = pptx.addSlide({ masterName: 'MASTER_LIGHT' });
addHeader(s13, 'Data Security', 'Protecting Patient Health Data');
const sec = [
  { t: 'Secure Encrypted Login', d: 'Safe login tokens and 10-round encrypted passwords so accounts cannot be hijacked.', c: THEME.primary },
  { t: 'Hacker Defense Shield', d: 'Automatic security filters that block harmful code and protect against web attacks.', c: THEME.red },
  { t: 'Spam & Bot Protection', d: 'Rate limits on OTP and login buttons to stop unauthorized automated attempts.', c: THEME.amber },
  { t: 'Strict Patient Privacy', d: 'Patients can only view their own test reports, and staff can only view authorized data.', c: THEME.green }
];
sec.forEach((s, i) => {
  let x = 0.6 + (i % 2) * 6.2;
  let y = 1.6 + Math.floor(i / 2) * 2.5;
  s13.addShape(pptx.ShapeType.rect, { x, y, w: 5.9, h: 2.2, fill: { color: THEME.card }, line: { color: s.c, width: 1.5 } });
  s13.addText(s.t, { x: x + 0.3, y: y + 0.25, w: 5.3, h: 0.4, fontSize: 15, bold: true, color: s.c });
  s13.addText(s.d, { x: x + 0.3, y: y + 0.75, w: 5.3, h: 1.2, fontSize: 12, color: THEME.body, lineSpacing: 18 });
});

// SLIDE 14: Live Working Modules
let s14 = pptx.addSlide({ masterName: 'MASTER_LIGHT' });
addHeader(s14, 'Project Showcase', 'Working Modules Built in the App');
const mods = [
  { t: '1. Patient Booking Portal', d: 'Search certified labs, compare test prices, check fasting rules, and book for family members.' },
  { t: '2. AI Clinical Copilot', d: 'Upload doctor prescriptions, chat with AI, decode medical reports, and get help 24/7.' },
  { t: '3. Collector Mobile App', d: 'View daily pickup queue, open GPS maps, scan tube barcodes, and confirm pickup.' },
  { t: '4. Executive Admin Console', d: 'Manage staff roles, monitor reagent stocks, view revenues, and check audit compliance.' }
];
mods.forEach((m, i) => {
  let x = 0.6 + (i % 2) * 6.2;
  let y = 1.6 + Math.floor(i / 2) * 2.5;
  s14.addShape(pptx.ShapeType.rect, { x, y, w: 5.9, h: 2.2, fill: { color: THEME.card }, line: { color: THEME.primary, width: 1.5 } });
  s14.addText(m.t, { x: x + 0.3, y: y + 0.25, w: 5.3, h: 0.4, fontSize: 14, bold: true, color: THEME.primary });
  s14.addText(m.d, { x: x + 0.3, y: y + 0.75, w: 5.3, h: 1.2, fontSize: 12, color: THEME.body, lineSpacing: 18 });
});

// SLIDE 15: Results & Performance
let s15 = pptx.addSlide({ masterName: 'MASTER_LIGHT' });
addHeader(s15, 'Testing & Results', 'Performance Outcomes from System Testing');
const res = [
  { v: '< 50ms', l: 'Super-fast database response time for test searches' },
  { v: '96.9%', l: 'Accuracy rate for AI clinical advice across 200+ test cases' },
  { v: '50%', l: 'Faster home collection turnaround through live collector routing' },
  { v: '99.9%', l: 'System uptime reliability with dual-database persistence' }
];
res.forEach((r, i) => {
  let x = 0.6 + i * 3.05;
  s15.addShape(pptx.ShapeType.rect, { x, y: 1.6, w: 2.9, h: 2.2, fill: { color: THEME.card }, line: { color: THEME.primary } });
  s15.addText(r.v, { x: x + 0.1, y: 1.9, w: 2.7, h: 0.6, fontSize: 24, bold: true, color: THEME.primary, align: 'center' });
  s15.addText(r.l, { x: x + 0.2, y: 2.6, w: 2.5, h: 1.0, fontSize: 12, color: THEME.body, align: 'center', lineSpacing: 15 });
});
s15.addShape(pptx.ShapeType.rect, { x: 0.6, y: 4.1, w: 12.0, h: 2.5, fill: { color: THEME.card }, line: { color: THEME.green, width: 1.5 } });
s15.addText('What We Verified in Testing', { x: 0.9, y: 4.3, w: 11.4, h: 0.4, fontSize: 14, bold: true, color: THEME.green });
s15.addText('• Role Testing: Confirmed that all 14 user types work smoothly without permission errors.\n• High Load Testing: Server handled multiple test bookings at the same time with zero lag.\n• Prescription OCR Testing: Tested with handwritten doctor notes with clear accuracy.', { x: 0.9, y: 4.8, w: 11.4, h: 1.6, fontSize: 13, color: THEME.title, lineSpacing: 20 });

// SLIDE 16: Conclusion
let s16 = pptx.addSlide({ masterName: 'MASTER_LIGHT' });
addHeader(s16, 'Conclusion', 'Final Summary & Acknowledgments');
s16.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.6, w: 12.0, h: 3.1, fill: { color: THEME.card }, line: { color: THEME.primary, width: 2 } });
s16.addText('What We Achieved in This Project', { x: 0.9, y: 1.85, w: 11.4, h: 0.4, fontSize: 15, bold: true, color: THEME.primary });
s16.addText('✓ Built a complete, working digital diagnostics platform from scratch.\n✓ Created a smart algorithm that puts certified lab quality before distance.\n✓ Implemented 14 user portals for smooth hospital and lab operations.\n✓ Built an AI assistant that reads doctor handwriting and explains reports simply.', { x: 0.9, y: 2.35, w: 11.4, h: 2.1, fontSize: 13, color: THEME.title, lineSpacing: 22 });

s16.addText('THANK YOU', { x: 0.6, y: 4.9, w: 12.0, h: 0.7, fontSize: 32, bold: true, color: THEME.primary, align: 'center', letterSpacing: 3 });
s16.addText('We are ready for Live Demonstration, Evaluation & Questions.', { x: 0.6, y: 5.6, w: 12.0, h: 0.35, fontSize: 13, color: THEME.title, align: 'center' });
s16.addText('Department of Artificial Intelligence & Machine Learning | Parul University', { x: 0.6, y: 6.05, w: 12.0, h: 0.3, fontSize: 11, color: THEME.muted, align: 'center' });

const outputPath = './DiagnoLabs_Parul_Final_Clean_16Slides.pptx';
pptx.writeFile({ fileName: outputPath })
  .then(fileName => {
    console.log('✅ Generated Clean & Professional 16-Slide PPTX: ' + fileName);
  })
  .catch(err => {
    console.error('❌ Error: ', err);
  });
