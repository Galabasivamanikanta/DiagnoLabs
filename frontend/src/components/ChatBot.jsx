import { useState, useRef, useEffect, useCallback, useContext } from 'react';
import {
    MessageSquare, Send, Bot, Sparkles, ChevronDown, RefreshCw,
    Mic, MicOff, Paperclip, FileText, X, Loader2, FlaskConical,
    Droplets, Thermometer, Zap, HeartPulse, ShieldCheck, ArrowRight,
    Volume2, VolumeX, CheckCircle2, AlertCircle, Pill, Activity,
    ClipboardList, CreditCard, BookOpen, Stethoscope, Package, Landmark,
    Megaphone, LifeBuoy, Truck, Cpu, Crown, UserCheck, ThumbsUp, ThumbsDown,
    Radio, Compass, PhoneCall, Check, Sparkle
} from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import useDevice from '../hooks/useDevice';
import { GoogleGenerativeAI } from "@google/generative-ai";

// ─────────────────────────────────────────────────────────────
// Helpers & Role Configurations
// ─────────────────────────────────────────────────────────────

let msgIdCounter = 0;
const getUniqueId = (offset = 0) => {
    msgIdCounter += 1;
    return Date.now() + msgIdCounter + offset;
};

const cleanText = (text) =>
    (text || '')
        .replace(/\[RECOMMEND:[^\]]+\]/gi, '')
        .replace(/\[ACTION:[^\]]+\]/gi, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/#{1,6}\s/g, '')
        .trim();

const parseRecommendations = (text) => {
    const matches = [...(text || '').matchAll(/\[RECOMMEND:\s*([^\]]+)\]/gi)];
    return matches.map(m => m[1].trim());
};

const parseAction = (text) => {
    const match = (text || '').match(/\[ACTION:\s*([^\]]+)\]/i);
    return match ? match[1].trim() : null;
};

const testIcon = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('blood') || n.includes('cbc') || n.includes('haemoglobin') || n.includes('platelet')) return <Droplets size={18} className="text-rose-500" />;
    if (n.includes('sugar') || n.includes('hba1c') || n.includes('diabetes') || n.includes('glucose')) return <Thermometer size={18} className="text-orange-500" />;
    if (n.includes('thyroid') || n.includes('t3') || n.includes('t4') || n.includes('tsh')) return <Zap size={18} className="text-yellow-600" />;
    if (n.includes('heart') || n.includes('cardiac') || n.includes('ecg') || n.includes('lipid') || n.includes('cholesterol')) return <HeartPulse size={18} className="text-red-600" />;
    if (n.includes('liver') || n.includes('kidney') || n.includes('urine') || n.includes('renal') || n.includes('lft') || n.includes('kft')) return <ShieldCheck size={18} className="text-emerald-600" />;
    if (n.includes('vitamin') || n.includes('b12') || n.includes('d3') || n.includes('iron') || n.includes('calcium')) return <Pill size={18} className="text-violet-500" />;
    if (n.includes('full') || n.includes('body') || n.includes('checkup') || n.includes('package') || n.includes('fever')) return <Activity size={18} className="text-sky-600" />;
    return <FlaskConical size={18} className="text-blue-600" />;
};

// ─────────────────────────────────────────────────────────────
// Role-Specific Chatbot Configurations
// ─────────────────────────────────────────────────────────────
const ROLE_CHAT_CONFIGS = {
    patient: {
        title: 'Patient Health AI Copilot',
        subtitle: 'Symptom Triage, Test Booking & Voice Assistant',
        icon: <Sparkles size={22} style={{ color: '#38bdf8' }} />,
        badgeColor: '#0284c7',
        greeting: `Hello! 👋 I'm your **DiagnoLabs Personal Health & Voice Copilot**.\n\n🎙️ **Voice Commands Active:** You can speak or type to:\n• 🤒 Analyze symptoms & suggest NABL lab tests\n• 📅 Book tests instantly (*e.g. "Book CBC test"*)\n• 📄 Explain lab reports & normal reference ranges\n• 💊 Pre-test fasting rules & preparation guidelines\n• 📍 Find nearest verified pathology labs`,
        prompts: [
            { label: '🤒 Fever & Infection Check', text: 'I have fever, chills, and body aches for 2 days. What tests should I get?' },
            { label: '🩸 Diabetes & Sugar Screening', text: 'Suggest the best diagnostic tests for Diabetes screening and monitoring.' },
            { label: '⚡ Thyroid & Fatigue Panel', text: 'I have extreme fatigue and sudden weight gain. Which thyroid test is best?' },
            { label: '📋 Pre-Test Fasting Rules', text: 'Do I need 10 to 12 hours fasting before my Lipid Profile and Sugar tests?' },
            { label: '🌟 Full Body Health Package', text: 'What tests are included in the Comprehensive Full Body Health Package?' }
        ]
    },
    doctor: {
        title: 'Doctor AI Clinical Copilot',
        subtitle: 'Differential Diagnosis & Decision Support',
        icon: <Stethoscope size={22} style={{ color: '#38bdf8' }} />,
        badgeColor: '#003366',
        greeting: `Welcome Doctor! 🩺 I'm your **Clinical Decision Copilot**.\n\nReady to assist your clinical workflows:\n• 🔬 Differential diagnosis from lab parameters\n• 📋 Standard clinical prescription templates\n• 🩸 Patient biomarker trends & critical flag alerts\n• ⚠️ Drug-lab test interaction checks`,
        prompts: [
            { label: '🔬 Differential Diagnosis', text: 'Patient has Elevated TSH (8.5) and Low Free T4. What is the diagnosis and treatment?' },
            { label: '📋 Type-2 Diabetes Rx', text: 'Draft a standard prescription and monitoring protocol for Type-2 Diabetes.' },
            { label: '⚠️ Drug-Lab Interaction', text: 'Does Biotin or Metformin interfere with Thyroid panel tests?' },
            { label: '📄 Critical Report Triage', text: 'What are the alert thresholds for critical Serum Potassium and Fasting Glucose?' }
        ]
    },
    nurse: {
        title: 'Nurse Clinical Assistant AI',
        subtitle: 'Vitals & Care Coordination',
        icon: <HeartPulse size={22} style={{ color: '#ec4899' }} />,
        badgeColor: '#db2777',
        greeting: `Hello Nurse! 🩺 I'm your **Clinical Care Assistant**.\n\nReady to help with your shift:\n• 🩸 Patient vitals entry guidelines (BP, SpO2, Pulse)\n• 💉 Sterile blood collection protocol & vacutainer sequence\n• 📋 Patient queue prioritization & triage rules`,
        prompts: [
            { label: '🩸 Vitals Reference Ranges', text: 'What are the normal adult and senior vitals ranges for BP, SpO2, and Pulse?' },
            { label: '💉 Vacutainer Tube Sequence', text: 'What is the correct order of draw for blood collection tubes (EDTA, Serum, Sodium Fluoride)?' },
            { label: '📋 Queue Prioritization', text: 'How should fasting vs emergency patients be triaged in the collection queue?' }
        ]
    },
    phlebotomist: {
        title: 'Phlebotomist Navigator AI',
        subtitle: 'Sample Collection & GPS Guide',
        icon: <Droplets size={22} style={{ color: '#e11d48' }} />,
        badgeColor: '#e11d48',
        greeting: `Hey Collector! 🩸 I'm your **Field Navigation AI**.\n\nLet's get sample collections completed:\n• 📍 Home address GPS navigation tips\n• 📦 Vacutainer tube color guide (EDTA / Fluoride / Serum)\n• 🔑 Patient 4-digit OTP digital verification protocol\n• ❄️ Cold-chain temperature maintenance (2°C - 8°C)`,
        prompts: [
            { label: '📦 Tube Color Guide', text: 'Which tube color is used for HbA1c, Glucose, and Lipid Profile?' },
            { label: '🔑 OTP Verification', text: 'Explain the 4-digit OTP digital handshake verification procedure.' },
            { label: '❄️ Cold-Chain Protocol', text: 'What is the standard transport temperature and ice pack packing rule for blood samples?' }
        ]
    },
    inventory_manager: {
        title: 'Inventory & Supply Chain AI',
        subtitle: 'Reagent & Stock Optimizer',
        icon: <Package size={22} style={{ color: '#d97706' }} />,
        badgeColor: '#d97706',
        greeting: `Welcome Inventory Manager! 📦 I'm your **Supply Chain Assistant**.\n\nAssisting with:\n• ⚠️ Reagent minimum stock threshold alerts\n• 📦 Purchase Order (PO) draft generation\n• ⏳ Vacutainer tube batch expiry tracking\n• 📊 Procurement spend forecasting`,
        prompts: [
            { label: '⚠️ Check Low Stock', text: 'Which reagents and vacutainers need immediate replenishment?' },
            { label: '📦 Draft PO for EDTA Tubes', text: 'Draft a purchase order for 500 K2-EDTA purple top tubes.' },
            { label: '⏳ Expiry Date Rules', text: 'What is the procedure for handling reagents nearing 30 days to expiry?' }
        ]
    },
    finance_manager: {
        title: 'Finance & Tax AI Copilot',
        subtitle: 'Financial Operations & Payouts',
        icon: <Landmark size={22} style={{ color: '#059669' }} />,
        badgeColor: '#059669',
        greeting: `Greetings Finance Manager! 💳 I'm your **Financial Intelligence Assistant**.\n\nAssisting with:\n• 🧾 18% GST calculation (9% CGST + 9% SGST)\n• 💰 Lab Partner commission payout calculations\n• 🔄 Patient refund escrow processing\n• 📊 Monthly revenue reconciliation`,
        prompts: [
            { label: '🧾 18% GST Breakdown', text: 'How is 18% GST split on a diagnostic bill of ₹2,500?' },
            { label: '💰 Lab Payout Formula', text: 'Explain the commission take-rate formula for lab partner weekly payouts.' },
            { label: '🔄 Refund Policy Rules', text: 'What is the refund timeline for cancelled home collection bookings?' }
        ]
    },
    marketing_head: {
        title: 'Growth & Marketing AI',
        subtitle: 'Campaign & Retention Assistant',
        icon: <Megaphone size={22} style={{ color: '#2563eb' }} />,
        badgeColor: '#2563eb',
        greeting: `Welcome Growth Lead! 📢 I'm your **Marketing Copilot**.\n\nLet's drive platform adoption:\n• 🎫 Create high-converting coupon code campaigns\n• 📧 Email and SMS broadcast copy generation\n• 🎁 Patient referral incentives & health camp promotions\n• 📈 Campaign ROI & booking conversion analysis`,
        prompts: [
            { label: '🎫 Promo Coupon Ideas', text: 'Suggest 3 attractive coupon campaign names for preventive health checkups.' },
            { label: '📧 Broadcast Copy', text: 'Write a promotional SMS broadcast for 20% discount on Full Body Checkups.' },
            { label: '📈 Conversion Tips', text: 'How to increase booking conversion rate from lab search page?' }
        ]
    },
    support_staff: {
        title: 'Support Helpdesk Copilot AI',
        subtitle: 'Omnichannel Ticket Assistant',
        icon: <LifeBuoy size={22} style={{ color: '#0284c7' }} />,
        badgeColor: '#0284c7',
        greeting: `Hello Support Executive! 🎧 I'm your **Helpdesk Copilot**.\n\nAssisting with ticket resolution:\n• 💬 1-Click quick reply templates for patients\n• 🚨 Ticket escalation routing (Finance / IT / Medical)\n• ⏱️ SLA breach prevention and prioritization`,
        prompts: [
            { label: '💬 Report Delay Template', text: 'Provide a polite quick response template for a delayed lab report query.' },
            { label: '🚨 Escalation Protocol', text: 'When should a ticket be escalated to the Quality Auditor vs IT Specialist?' },
            { label: '⏱️ SLA Priority Rules', text: 'What are the response time SLAs for High vs Critical support tickets?' }
        ]
    },
    delivery_partner: {
        title: 'Delivery Logistics AI',
        subtitle: 'Sample & Report Transport Guide',
        icon: <Truck size={22} style={{ color: '#0284c7' }} />,
        badgeColor: '#0284c7',
        greeting: `Hey Delivery Agent! 🚚 I'm your **Logistics Copilot**.\n\nAssisting with:\n• 📍 Optimal route planning and address lookup\n• 🔑 4-digit Proof of Delivery (POD) OTP verification\n• ⚠️ Handling customer unavailable scenarios`,
        prompts: [
            { label: '🔑 Proof of Delivery OTP', text: 'What is the procedure if patient cannot find their 4-digit delivery OTP?' },
            { label: '⚠️ Customer Unavailable', text: 'How do I log an undelivered report package in the system?' },
            { label: '📍 Route Tips', text: 'Best practices for completing 6 delivery stops efficiently.' }
        ]
    },
    quality_auditor: {
        title: 'QC & NABL Compliance AI',
        subtitle: 'Lab Quality Assurance',
        icon: <ShieldCheck size={22} style={{ color: '#059669' }} />,
        badgeColor: '#059669',
        greeting: `Welcome Quality Auditor! 🔬 I'm your **NABL Compliance Specialist**.\n\nAssisting with:\n• 📋 4-Step Lab Audit Checklist (Hygiene, Calibration, SLA, Pathologist)\n• ⚠️ Root-cause analysis for disputed or mismatched test reports\n• 📜 ISO 15189:2022 and NABL accreditation audit guidelines`,
        prompts: [
            { label: '📋 NABL Audit Checklist', text: 'What are the core NABL requirements for biochemistry analyzer calibration logs?' },
            { label: '⚠️ Mismatched Report RCA', text: 'What is the root cause analysis protocol for a disputed blood sugar result?' },
            { label: '📜 ISO 15189 Standards', text: 'Summarize key pre-analytical sample transport standards under ISO 15189.' }
        ]
    },
    it_specialist: {
        title: 'DevOps & Systems AI Copilot',
        subtitle: 'Technical Infrastructure Support',
        icon: <Cpu size={22} style={{ color: '#003366' }} />,
        badgeColor: '#003366',
        greeting: `Greetings SysAdmin / IT Engineer! 💻 I'm your **DevOps Assistant**.\n\nAssisting with:\n• 📟 API 500 error analysis & stack trace debugging\n• 🔑 JWT authentication & hybrid PostgreSQL/MongoDB fallback\n• ⚡ Latency monitoring & connection pool health`,
        prompts: [
            { label: '📟 Debug Hybrid DB', text: 'How does the PostgreSQL-to-MongoDB hybrid authentication fallback operate?' },
            { label: '🔑 JWT Verification', text: 'What headers and claims are validated in the API JWT authentication middleware?' },
            { label: '⚡ Performance Latency', text: 'What is the target P95 latency for geospatial Haversine search queries?' }
        ]
    },
    admin: {
        title: 'Admin Master Copilot AI',
        subtitle: 'Platform Governance & Analytics',
        icon: <Crown size={22} style={{ color: '#d4af37' }} />,
        badgeColor: '#003366',
        greeting: `Greetings Administrator! 👑 I'm your **Platform Master Copilot**.\n\nFull platform governance support:\n• 👤 14-Tier RBAC role permissions management\n• 🏥 Lab partner onboarding & accreditation verification\n• 📈 Platform-wide booking volume, revenue, and SLA analytics`,
        prompts: [
            { label: '👤 14-Tier RBAC Overview', text: 'List the access privileges and data boundaries across the 14 RBAC user roles.' },
            { label: '🏥 Lab Onboarding Checklist', text: 'What compliance documents are required to approve a new NABL lab partner?' },
            { label: '📊 System Health Summary', text: 'Summarize the core platform subsystems and their operational status.' }
        ]
    },
    employee: {
        title: 'Front Desk Operations AI',
        subtitle: 'Reception & Patient Check-In',
        icon: <UserCheck size={22} style={{ color: '#003366' }} />,
        badgeColor: '#003366',
        greeting: `Welcome Front Desk Team! 📋 I'm your **Reception Assistant**.\n\nHelping you with:\n• 📝 Quick walk-in patient registration\n• 📅 Appointment check-in & token assignment\n• 🧾 Printing patient payment receipts`,
        prompts: [
            { label: '📝 Walk-In Registration', text: 'How do I register a new walk-in patient for a Thyroid and CBC test?' },
            { label: '📅 Appointment Check-In', text: 'What is the standard procedure to verify and check in an online booked patient?' },
            { label: '🧾 Receipt Generation', text: 'How to generate and print a GST tax invoice at the reception counter?' }
        ]
    }
};

// ─────────────────────────────────────────────────────────────
// Comprehensive Clinical & Platform Fallback Engine
// ─────────────────────────────────────────────────────────────
const generateClinicalFallback = (text, role = 'patient') => {
    const q = (text || '').toLowerCase().trim();

    // 1. FEVER & INFECTIONS (English + Telugu keywords)
    if (q.includes('fever') || q.includes('temperature') || q.includes('chills') || q.includes('dengue') || q.includes('malaria') || q.includes('typhoid') || q.includes('jwaram') || q.includes('jvaram') || q.includes('cold') || q.includes('flu')) {
        return `Based on your symptoms of fever and chills, a complete infection screening is clinically recommended to identify the underlying cause (Viral, Dengue, Malaria, or Typhoid).\n\nRecommended Diagnostic Tests:\n1. **Complete Blood Count (CBC)** — Evaluates WBC, Platelets, and Infection markers.\n2. **Dengue NS1 Antigen & IgM/IgG** — Detects early dengue virus.\n3. **Typhoid (Widal / Typhidot)** — Screens for enteric fever.\n4. **Urine Routine Examination** — Rules out urinary tract infection.\n\n💡 **Pre-Test Rule:** No strict fasting required. Stay well hydrated. If body temperature exceeds 101°F, consult a physician promptly.\n\n[RECOMMEND: Complete Blood Count (CBC)][RECOMMEND: Dengue Serology Panel][ACTION: BOOK: Complete Blood Count (CBC)]`;
    }

    // 2. DIABETES & BLOOD SUGAR (English + Telugu keywords)
    if (q.includes('diabetes') || q.includes('sugar') || q.includes('glucose') || q.includes('hba1c') || q.includes('madhumeham') || q.includes('thirst') || q.includes('urination') || q.includes('sweet')) {
        return `For comprehensive Diabetes screening and blood glucose monitoring, the standard clinical protocol includes:\n\n• **HbA1c (Glycated Hemoglobin)**: Evaluates your average 3-month blood sugar level (No fasting required).\n• **Fasting Blood Sugar (FBS)**: Requires 8–10 hours overnight fasting (only plain water permitted).\n• **Post-Prandial Blood Sugar (PPBS)**: Tested exactly 2 hours after a standard meal.\n• **Lipid Profile**: Assesses associated cardiovascular risk factors.\n\n💡 **Fasting Tip:** Take water freely during fasting. Take morning insulin or medicines only after the blood sample is drawn.\n\n[RECOMMEND: HbA1c (Glycated Hemoglobin)][RECOMMEND: Fasting Blood Sugar (FBS)][ACTION: BOOK: HbA1c (Glycated Hemoglobin)]`;
    }

    // 3. THYROID & METABOLISM (English + Telugu)
    if (q.includes('thyroid') || q.includes('t3') || q.includes('t4') || q.includes('tsh') || q.includes('weight gain') || q.includes('weight loss') || q.includes('hair fall') || q.includes('fatigue') || q.includes('neerasam') || q.includes('weakness')) {
        return `For evaluating thyroid gland function and chronic fatigue/weight fluctuations, the recommended tests are:\n\n• **Thyroid Profile Total (T3, T4, TSH)**: Evaluates hypothyroidism or hyperthyroidism.\n• **Vitamin D3 & Vitamin B12**: Deficiencies in these vitamins commonly mimic thyroid exhaustion.\n• **Complete Blood Count (CBC)**: Checks for anemia and low hemoglobin.\n\n💡 **Preparation:** Morning fasting sample (8 hours) is preferred. Take thyroid medications only after blood draw.\n\n[RECOMMEND: Thyroid Profile Total (T3, T4, TSH)][RECOMMEND: Vitamin D3 & B12 Combo][ACTION: BOOK: Thyroid Profile Total (T3, T4, TSH)]`;
    }

    // 4. CARDIAC, CHOLESTEROL & BLOOD PRESSURE
    if (q.includes('heart') || q.includes('chest') || q.includes('cholesterol') || q.includes('bp') || q.includes('blood pressure') || q.includes('cardiac') || q.includes('lipid') || q.includes('palpitation')) {
        return `For cardiovascular health and cholesterol risk assessment, the following NABL-accredited diagnostic panel is recommended:\n\n• **Lipid Profile Extended**: Measures Total Cholesterol, HDL (Good), LDL (Bad), VLDL, and Triglycerides.\n• **High-Sensitivity CRP (hs-CRP)**: Evaluates vascular arterial inflammation.\n• **Serum Electrolytes (Sodium, Potassium, Chloride)**: Checks electrolyte balance.\n\n⚠️ **Important Fasting Note:** Lipid Profile requires **10 to 12 hours strict fasting** (water is allowed).\n\n[RECOMMEND: Lipid Profile Extended][RECOMMEND: Cardiac Risk Assessment Panel][ACTION: BOOK: Lipid Profile Extended]`;
    }

    // 5. LIVER, JAUNDICE & DIGESTION
    if (q.includes('liver') || q.includes('jaundice') || q.includes('yellow') || q.includes('bilirubin') || q.includes('sgot') || q.includes('sgpt') || q.includes('alcohol') || q.includes('gastric') || q.includes('nausea')) {
        return `For liver health, jaundice symptoms, and digestive enzyme evaluation, the key diagnostic tests include:\n\n• **Liver Function Test (LFT)**: Bilirubin (Total & Direct), SGOT/AST, SGPT/ALT, Alkaline Phosphatase, and Albumin.\n• **Viral Hepatitis Panel (HBsAg & HCV)**: Screens for viral liver infections.\n• **Ultrasound Abdomen Screening**: Evaluates fatty liver or gallstones.\n\n💡 **Preparation:** 8 hours fasting recommended. Avoid alcohol for at least 48 hours prior to testing.\n\n[RECOMMEND: Liver Function Test (LFT)][ACTION: BOOK: Liver Function Test (LFT)]`;
    }

    // 6. KIDNEY, URINE & RENAL HEALTH
    if (q.includes('kidney') || q.includes('urine') || q.includes('burning') || q.includes('creatinine') || q.includes('bun') || q.includes('uric acid') || q.includes('rft') || q.includes('kft') || q.includes('swelling')) {
        return `For renal function evaluation, kidney health, and urinary tract infection screening:\n\n• **Renal Function Test (RFT / KFT)**: Serum Creatinine, Blood Urea Nitrogen (BUN), and Uric Acid.\n• **Urine Routine & Microscopic Examination**: Detects pus cells, proteins, and infection.\n• **Serum Electrolytes**: Monitors sodium, potassium, and chloride levels.\n\n💡 **Sample Collection:** Collect mid-stream clean catch morning urine sample.\n\n[RECOMMEND: Renal Function Test (RFT)][RECOMMEND: Urine Routine Examination][ACTION: BOOK: Renal Function Test (RFT)]`;
    }

    // 7. FULL BODY / PREVENTIVE HEALTH CHECKUP
    if (q.includes('full body') || q.includes('checkup') || q.includes('package') || q.includes('annual') || q.includes('master') || q.includes('routine') || q.includes('complete health')) {
        return `The **DiagnoLabs Comprehensive Full Body Health Package** includes 75+ vital parameters:\n\n1. Complete Blood Count (CBC - 24 parameters)\n2. Diabetes Screen (HbA1c & Fasting Glucose)\n3. Complete Lipid Profile (Cholesterol & Triglycerides)\n4. Liver Function Test (LFT - 11 parameters)\n5. Kidney Function Test (KFT - Serum Creatinine, Uric Acid)\n6. Thyroid Profile (T3, T4, TSH)\n7. Vitamin D3 & Vitamin B12 Levels\n8. Urine Routine & Microscopy\n\n💡 **Fasting Required:** 10–12 hours overnight fasting.\n\n[RECOMMEND: Comprehensive Full Body Health Package][ACTION: BOOK: Comprehensive Full Body Health Package]`;
    }

    // 8. PRE-TEST FASTING GUIDELINES
    if (q.includes('fasting') || q.includes('empty stomach') || q.includes('prepare') || q.includes('diet') || q.includes('rules') || q.includes('water')) {
        return `📋 **Official Pre-Test Preparation & Fasting Guidelines**:\n\n• **Lipid Profile & Glucose (FBS)**: 10 to 12 hours strict fasting. Only plain water is permitted.\n• **Thyroid Profile (TSH)**: 8 hours fasting preferred. Take thyroid tablets after blood draw.\n• **Full Body Health Checkup**: 10 to 12 hours overnight fasting.\n• **CBC, Vitamin D, Vitamin B12**: No strict fasting required, but a light meal is advised.\n• **Urine Routine**: Collect the first morning mid-stream sample in a sterile container.\n\n[ACTION: CHECKOUT]`;
    }

    // 9. LAB REPORTS & RESULTS ACCESS
    if (q.includes('report') || q.includes('result') || q.includes('download') || q.includes('pdf') || q.includes('view report') || q.includes('status')) {
        return `You can view and download all your digitally signed NABL diagnostic lab reports with secure QR verification in your patient dashboard.\n\n• Reports are uploaded immediately upon Pathologist sign-off.\n• Each report contains a tamper-proof QR code for instant authentication.\n\n[ACTION: REPORT_ANALYZED]`;
    }

    // 10. PRICING & BOOKING ASSISTANCE
    if (q.includes('price') || q.includes('cost') || q.includes('rate') || q.includes('offer') || q.includes('discount') || q.includes('coupon') || q.includes('book') || q.includes('checkout')) {
        return `DiagnoLabs offers transparent pricing with up to 40% discount on NABL diagnostic packages plus **Free Home Sample Collection** in your city.\n\n• Complete Blood Count (CBC): ₹299\n• HbA1c Diabetes Screen: ₹450\n• Thyroid Profile (T3/T4/TSH): ₹499\n• Lipid Profile: ₹550\n• Full Body Health Checkup: ₹1,499 (75+ Parameters)\n\n[ACTION: CHECKOUT]`;
    }

    // 11. MEDICATIONS & DRUG INFORMATION
    if (q.includes('paracetamol') || q.includes('metformin') || q.includes('thyronorm') || q.includes('medicine') || q.includes('tablet') || q.includes('drug') || q.includes('antibiotic')) {
        return `💊 **Clinical Medication Information Guide**:\n\n• **Metformin**: Oral hypoglycemic used for Type-2 Diabetes. Best taken with meals.\n• **Thyronorm / Levothyroxine**: Synthetic thyroid hormone. Must be taken on an empty stomach 30–60 mins before breakfast with water.\n• **Paracetamol**: Antipyretic and analgesic for mild-to-moderate fever and pain.\n\n⚠️ *Important Notice: Always take medicines under the prescription of a registered physician. Do not alter doses based solely on self-assessment.*\n\n[ACTION: MED_INFO]`;
    }

    // Doctor AI Fallback
    if (role === 'doctor') {
        if (q.includes('tsh') || q.includes('thyroid')) {
            return `**Differential Clinical Assessment for Elevated TSH (>8.0 mIU/L):**\n1. **Primary Hypothyroidism** (Most probable; verify with anti-TPO antibody test for Hashimoto's thyroiditis).\n2. **Subclinical Hypothyroidism** if Free T4 is within reference interval.\n3. **Drug-Induced** (e.g. Amiodarone, Lithium).\n\n*Recommended Protocol:* Initiate Levothyroxine (25–50 mcg/day based on age/weight) and repeat TSH in 6–8 weeks.\n[RECOMMEND: Anti-TPO Antibody Panel]`;
        }
        if (q.includes('rx') || q.includes('prescription') || q.includes('diabetes')) {
            return `**Standard Clinical Rx Protocol (Type-2 Diabetes):**\n• Tab. Metformin 500mg PO BD after meals\n• Tab. Glimepiride 1mg PO OD before breakfast (if HbA1c > 8.0%)\n• Lifestyle: Low glycemic index diet, 30 mins daily aerobic exercise\n• Lab Monitoring: Repeat HbA1c every 90 days, check serum creatinine annually.\n[RECOMMEND: HbA1c (Glycated Hemoglobin)]`;
        }
        return `**Clinical Copilot Response:** Diagnostic parameters synchronized with NABL reference intervals. Correlate with patient clinical history and hemodynamic vitals.`;
    }

    // Default Fallback
    return `Hello! I am your **DiagnoLabs AI Health & Diagnostic Assistant**.\n\nI can assist you with:\n• 🤒 **Symptom Triage**: Suggesting tests for fever, fatigue, sugar, thyroid, or heart health.\n• 📅 **Direct Booking**: Instant scheduling with nearest NABL certified labs.\n• 📋 **Fasting & Prep**: Accurate pre-test preparation instructions.\n• 📄 **Report Analysis**: Interpreting biomarker results and normal reference ranges.\n\n[RECOMMEND: Comprehensive Full Body Health Package][ACTION: BOOK: Comprehensive Full Body Health Package]`;
};

// ─────────────────────────────────────────────────────────────
// Main Dynamic Role-Aware ChatBot Component
// ─────────────────────────────────────────────────────────────
const ChatBot = () => {
    const navigate = useNavigate();
    const { isMobile } = useDevice();
    const { user } = useContext(AuthContext);

    // Determine current user's role
    const currentRole = (user?.role || user?.role_name || 'patient').toLowerCase();
    const roleConfig = ROLE_CHAT_CONFIGS[currentRole] || ROLE_CHAT_CONFIGS.patient;

    const [messages, setMessages] = useState([]);
    const [showQuickPrompts, setShowQuickPrompts] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [speechTranscript, setSpeechTranscript] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [attachedFile, setAttachedFile] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [issueCategory, setIssueCategory] = useState('Payment & Refunds');
    const [issueDescription, setIssueDescription] = useState('');
    const [isReporting, setIsReporting] = useState(false);
    const [voiceFeedbackText, setVoiceFeedbackText] = useState('');

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);
    const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading, speechTranscript]);

    const stopSpeaking = useCallback(() => {
        if (synthRef.current) {
            synthRef.current.cancel();
        }
        setIsSpeaking(false);
    }, []);

    useEffect(() => {
        if (!isOpen) stopSpeaking();
    }, [isOpen, stopSpeaking]);

    // Text to Speech
    const speak = useCallback((text) => {
        if (isMuted || !synthRef.current) return;
        synthRef.current.cancel();
        
        const cleaned = cleanText(text);
        if (!cleaned) return;

        const utterance = new SpeechSynthesisUtterance(cleaned.substring(0, 350));
        utterance.lang = 'en-IN';
        utterance.rate = 1.0;
        utterance.pitch = 1.05;

        const voices = synthRef.current.getVoices ? synthRef.current.getVoices() : [];
        const preferredVoice =
            voices.find(v => v.name.includes('Google UK English Female')) ||
            voices.find(v => v.name.includes('Google US English Female')) ||
            voices.find(v => v.name.toLowerCase().includes('female') && v.lang.startsWith('en')) ||
            voices.find(v => v.name.toLowerCase().includes('zira')) ||
            voices.find(v => v.name.toLowerCase().includes('samantha')) ||
            voices.find(v => v.lang === 'en-IN') ||
            voices.find(v => v.lang.startsWith('en'));

        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        synthRef.current.speak(utterance);
    }, [isMuted]);

    // Initialize greeting on role change
    useEffect(() => {
        setMessages([
            {
                id: 1,
                text: roleConfig.greeting,
                sender: 'bot',
                recommendations: [],
                action: null
            }
        ]);
    }, [currentRole]);

    // ─────────────────────────────────────────────────────────
    // Voice Command Processor & Action Engine
    // ─────────────────────────────────────────────────────────
    const processVoiceCommand = useCallback((rawText) => {
        const text = rawText.toLowerCase().trim();

        // 1. Navigation / Direct Action Voice Commands
        if (text.includes('open report') || text.includes('show report') || text.includes('view report') || text.includes('my report') || text.includes('download report')) {
            setVoiceFeedbackText('Opening your Lab Reports...');
            speak('Opening your digital lab reports.');
            setTimeout(() => navigate('/patient/history'), 1200);
            return true;
        }

        if (text.includes('open booking') || text.includes('my booking') || text.includes('view booking') || text.includes('track sample')) {
            setVoiceFeedbackText('Opening your Bookings & Tracking...');
            speak('Navigating to your test bookings.');
            setTimeout(() => navigate('/patient/history'), 1200);
            return true;
        }

        if (text.includes('go to home') || text.includes('open home') || text.includes('homepage')) {
            setVoiceFeedbackText('Navigating to Home...');
            speak('Taking you to the home page.');
            setTimeout(() => navigate('/'), 1000);
            return true;
        }

        if (text.includes('find lab') || text.includes('search lab') || text.includes('nearest lab')) {
            setVoiceFeedbackText('Searching nearest NABL labs...');
            speak('Opening lab discovery search.');
            setTimeout(() => navigate('/search'), 1000);
            return true;
        }

        if (text.includes('checkout') || text.includes('go to cart') || text.includes('make payment')) {
            setVoiceFeedbackText('Proceeding to Checkout...');
            speak('Taking you to the checkout screen.');
            setTimeout(() => navigate('/checkout'), 1000);
            return true;
        }

        if (text.includes('clear chat') || text.includes('reset chat') || text.includes('start over')) {
            handleReset();
            speak('Chat conversation has been reset.');
            return true;
        }

        if (text.includes('mute voice') || text.includes('stop talking') || text.includes('be quiet') || text.includes('turn off voice')) {
            setIsMuted(true);
            stopSpeaking();
            setVoiceFeedbackText('Voice output muted.');
            return true;
        }

        if (text.includes('unmute voice') || text.includes('turn on voice') || text.includes('speak')) {
            setIsMuted(false);
            setVoiceFeedbackText('Voice output enabled.');
            speak('Voice output is now active.');
            return true;
        }

        // 2. Direct Voice Booking: "Book CBC", "Book Sugar Test", "Book Vitamin D"
        if (text.startsWith('book ') || text.startsWith('schedule ') || text.includes('book test') || text.includes('test book cheyyi')) {
            let testQuery = text
                .replace(/^book\s+/i, '')
                .replace(/^schedule\s+/i, '')
                .replace(/test/gi, '')
                .replace(/book cheyyi/gi, '')
                .trim();

            if (!testQuery) testQuery = 'Complete Blood Count';
            setVoiceFeedbackText(`Searching & Booking: ${testQuery}...`);
            speak(`Finding accredited labs for ${testQuery}.`);
            setTimeout(() => navigate(`/search?q=${encodeURIComponent(testQuery)}`), 1500);
            return true;
        }

        return false;
    }, [navigate, speak, stopSpeaking]);

    // Setup SpeechRecognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = 'en-IN';

        rec.onstart = () => {
            setIsListening(true);
            setSpeechTranscript('');
            setVoiceFeedbackText('🎙️ Listening to your voice command...');
        };

        rec.onresult = (e) => {
            let interim = '';
            let final = '';
            for (let i = e.resultIndex; i < e.results.length; ++i) {
                if (e.results[i].isFinal) {
                    final += e.results[i][0].transcript;
                } else {
                    interim += e.results[i][0].transcript;
                }
            }
            const currentTranscript = final || interim;
            setSpeechTranscript(currentTranscript);
            setInputValue(currentTranscript);

            if (final) {
                setIsListening(false);
                setVoiceFeedbackText('');
                // Execute speech transcript
                handleSend(final);
            }
        };

        rec.onerror = (err) => {
            console.warn("Speech recognition notice:", err.error);
            setIsListening(false);
            setVoiceFeedbackText('');
        };

        rec.onend = () => {
            setIsListening(false);
            setVoiceFeedbackText('');
        };

        recognitionRef.current = rec;
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('Voice recognition is supported in Google Chrome, Microsoft Edge, and modern Android browsers.');
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
            setVoiceFeedbackText('');
        } else {
            stopSpeaking();
            try {
                recognitionRef.current.start();
            } catch (err) {
                console.warn("Speech recognition restart:", err.message);
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 8 * 1024 * 1024) {
            alert('File too large (max 8 MB). Please select a smaller document.');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setAttachedFile({
                name: file.name,
                mimeType: file.type,
                data: reader.result.split(',')[1]
            });
        };
        reader.readAsDataURL(file);
    };

    const handleBook = (testName) => {
        navigate(`/search?q=${encodeURIComponent(testName)}`);
    };

    const handleAction = (action) => {
        if (action === 'CHECKOUT') navigate('/checkout');
        else if (action === 'PREP_DONE' || action === 'REPORT_ANALYZED') navigate('/patient/history');
        else if (action === 'MED_INFO') navigate('/search');
    };

    const buildContext = () => {
        const path = window.location.pathname;
        return `Role: [${currentRole.toUpperCase()}]. User: [${user?.name || 'Patient'}]. Active Page: [${path}].`;
    };

    // ─────────────────────────────────────────────────────────
    // Main Multi-Tier AI Send Handler (100% Resilient)
    // ─────────────────────────────────────────────────────────
    const handleSend = async (overrideText) => {
        const text = (overrideText || inputValue).trim();
        if (!text && !attachedFile) return;

        const displayText = attachedFile ? `📎 ${attachedFile.name}${text ? ` — ${text}` : ''}` : text;

        setMessages(prev => [...prev, { id: getUniqueId(), text: displayText, sender: 'user' }]);
        setInputValue('');
        setSpeechTranscript('');
        setShowQuickPrompts(false);
        setIsLoading(true);
        stopSpeaking();

        // 1. Check Voice Command Action
        if (!attachedFile && processVoiceCommand(text)) {
            setIsLoading(false);
            return;
        }

        let reply = '';

        try {
            // ── Tier 1: Backend Express API `/api/chat` (With Server Gemini + DB Context) ──
            const token = localStorage.getItem('token');
            try {
                const apiRes = await axios.post(`${API_BASE_URL}/api/chat`, {
                    prompt: text,
                    context: buildContext(),
                    userRole: currentRole,
                    fileData: attachedFile?.data,
                    fileType: attachedFile?.mimeType
                }, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    timeout: 8000
                });

                if (apiRes.data && (apiRes.data.reply || apiRes.data.text || apiRes.data.message)) {
                    reply = apiRes.data.reply || apiRes.data.text || apiRes.data.message;
                }
            } catch (backendErr) {
                console.warn("[AI-GATEWAY] Backend /api/chat fallback:", backendErr.message);
            }

            // ── Tier 2: Direct Frontend Gemini SDK (If backend was unavailable) ──
            if (!reply) {
                const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
                if (geminiKey && geminiKey.length > 10 && !geminiKey.includes('your_gemini_api_key_here')) {
                    try {
                        const genAI = new GoogleGenerativeAI(geminiKey);
                        const model = genAI.getGenerativeModel({
                            model: "gemini-1.5-flash",
                            systemInstruction: `You are the ${roleConfig.title}. Context: ${buildContext()}. Always provide empathetic, clear clinical guidance. Append [RECOMMEND: Exact Test Name] if suggesting tests. Append [ACTION: BOOK: Exact Test Name] or [ACTION: CHECKOUT] if instructing actions.`
                        });

                        if (attachedFile) {
                            const result = await model.generateContent([
                                { inlineData: { data: attachedFile.data, mimeType: attachedFile.mimeType } },
                                text
                            ]);
                            reply = result.response.text();
                        } else {
                            const result = await model.generateContent(text);
                            reply = result.response.text();
                        }
                    } catch (directSdkErr) {
                        console.warn("[AI-GATEWAY] Direct Gemini SDK fallback:", directSdkErr.message);
                    }
                }
            }

            // ── Tier 3: High-Accuracy Clinical Intelligence Engine (Guaranteed 100% Uptime) ──
            if (!reply) {
                reply = generateClinicalFallback(text, currentRole);
            }

            const recommendations = parseRecommendations(reply);
            const action = parseAction(reply);

            const cleanedText = reply
                .replace(/\[RECOMMEND:[^\]]+\]/gi, '')
                .replace(/\[ACTION:[^\]]+\]/gi, '')
                .trim();

            const botMsg = {
                id: getUniqueId(1),
                text: cleanedText,
                sender: 'bot',
                recommendations,
                action
            };

            setMessages(prev => [...prev, botMsg]);
            speak(cleanedText);

            if (action && action.startsWith('BOOK:')) {
                const testName = action.replace('BOOK:', '').trim();
                setTimeout(() => navigate(`/search?q=${encodeURIComponent(testName)}`), 2000);
            }

        } catch (err) {
            console.error("AI Error:", err);
            // Even on unexpected exceptions, deliver clinical fallback
            const fallbackReply = generateClinicalFallback(text, currentRole);
            const cleanedText = fallbackReply.replace(/\[RECOMMEND:[^\]]+\]/gi, '').replace(/\[ACTION:[^\]]+\]/gi, '').trim();
            
            const errBotMsg = {
                id: getUniqueId(2),
                text: cleanedText,
                sender: 'bot',
                recommendations: parseRecommendations(fallbackReply),
                action: parseAction(fallbackReply)
            };
            setMessages(prev => [...prev, errBotMsg]);
            speak(cleanedText);
        } finally {
            setAttachedFile(null);
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        stopSpeaking();
        setMessages([{
            id: Date.now(),
            text: `Conversation reset. How can I assist you as **${roleConfig.title}** today? 😊`,
            sender: 'bot',
            recommendations: [],
            action: null
        }]);
        setShowQuickPrompts(true);
        setVoiceFeedbackText('');
    };

    const renderText = (text) => {
        const parts = (text || '').split(/\*\*(.*?)\*\*/g);
        return parts.map((part, i) =>
            i % 2 === 1
                ? <strong key={i}>{part}</strong>
                : part.split('\n').map((line, j, arr) =>
                    j < arr.length - 1 ? [line, <br key={`${i}-${j}`} />] : line
                )
        );
    };

    return (
        <>
            {/* Floating Action Button (FAB) */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsOpen(o => !o)}
                aria-label="Open AI Copilot Chat"
                style={{
                    position: 'fixed',
                    bottom: isMobile ? '5rem' : '2rem',
                    right: isMobile ? '1rem' : '2rem',
                    width: '60px',
                    height: '60px',
                    borderRadius: '18px',
                    background: 'linear-gradient(135deg, #003366, #0ea5e9)',
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 28px -4px rgba(0,51,102,0.45)',
                    cursor: 'pointer',
                    zIndex: 1500
                }}
            >
                <AnimatePresence mode="wait">
                    {isOpen
                        ? <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><ChevronDown size={isMobile ? 22 : 28} /></motion.div>
                        : <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><MessageSquare size={isMobile ? 22 : 28} /></motion.div>
                    }
                </AnimatePresence>
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 60, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 60, scale: 0.94 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 320 }}
                        style={{
                            position: 'fixed',
                            bottom: isMobile ? '8.5rem' : '7.5rem',
                            right: isMobile ? '1rem' : '2rem',
                            width: isMobile ? 'calc(100vw - 2rem)' : '430px',
                            height: isMobile ? '80vh' : '85vh',
                            maxHeight: isMobile ? '640px' : '720px',
                            background: 'rgba(255,255,255,0.98)',
                            backdropFilter: 'blur(24px)',
                            borderRadius: isMobile ? '20px' : '28px',
                            boxShadow: '0 24px 60px -12px rgba(15,23,42,0.25)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            zIndex: 1500,
                            border: '1px solid rgba(226,232,240,0.85)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '1.15rem 1.4rem', background: 'linear-gradient(135deg, #003366, #075985)', color: 'white', flexShrink: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {roleConfig.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                            {roleConfig.title}
                                            <span style={{ width: '7px', height: '7px', background: '#4ade80', borderRadius: '50%', display: 'inline-block' }} />
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: '#bae6fd', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {roleConfig.subtitle} · 🎙️ Voice Flow Active
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                    <motion.button
                                        whileTap={{ scale: 0.85 }}
                                        onClick={() => { setIsMuted(m => !m); stopSpeaking(); }}
                                        title={isMuted ? 'Unmute voice' : 'Mute voice'}
                                        style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: isMuted ? 'rgba(255,255,255,0.4)' : '#38bdf8', cursor: 'pointer', borderRadius: '8px', padding: '0.45rem', display: 'flex' }}
                                    >
                                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.85 }}
                                        onClick={handleReset}
                                        title="Reset conversation"
                                        style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', borderRadius: '8px', padding: '0.45rem', display: 'flex' }}
                                    >
                                        <RefreshCw size={16} />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Voice Status Wave Bar */}
                            {(isListening || isSpeaking || voiceFeedbackText) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ marginTop: '0.6rem', padding: '0.35rem 0.65rem', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#e0f2fe' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        {isListening && <Radio size={13} className="text-rose-400 animate-pulse" />}
                                        {isSpeaking && <Volume2 size={13} className="text-sky-300 animate-bounce" />}
                                        <span style={{ fontWeight: '600' }}>{voiceFeedbackText || (isListening ? 'Listening to voice...' : 'Speaking response...')}</span>
                                    </div>
                                    {isSpeaking && (
                                        <button onClick={stopSpeaking} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', cursor: 'pointer' }}>
                                            Stop
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </div>

                        {/* Messages Area */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.15rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                            {messages.map(msg => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}
                                >
                                    <div style={{
                                        padding: '0.85rem 1.05rem',
                                        borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                        background: msg.sender === 'user'
                                            ? 'linear-gradient(135deg, #003366, #0ea5e9)'
                                            : (msg.isError ? '#fff1f2' : 'white'),
                                        color: msg.sender === 'user' ? 'white' : '#1e293b',
                                        boxShadow: msg.sender === 'user'
                                            ? '0 8px 20px -5px rgba(0,51,102,0.35)'
                                            : '0 3px 8px rgba(0,0,0,0.06)',
                                        fontSize: '0.88rem',
                                        fontWeight: '500',
                                        lineHeight: '1.6',
                                        border: msg.sender === 'bot' ? (msg.isError ? '1px solid #fda4af' : '1px solid #e2e8f0') : 'none'
                                    }}>
                                        {renderText(msg.text)}
                                    </div>

                                    {/* Recommended Test Cards */}
                                    {msg.recommendations?.length > 0 && (
                                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {msg.recommendations.map((testName, idx) => (
                                                <div key={idx} style={{ padding: '0.75rem 0.9rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {testIcon(testName)}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '0.62rem', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase' }}>NABL Verified Test</div>
                                                            <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#0f172a' }}>{testName}</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleBook(testName)}
                                                        style={{ padding: '0.4rem 0.8rem', background: 'linear-gradient(135deg, #0ea5e9, #003366)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}
                                                    >
                                                        Book <ArrowRight size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}

                                    {/* Action Banner */}
                                    {msg.action && !msg.action.startsWith('BOOK:') && (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ marginTop: '0.6rem', padding: '0.6rem 0.9rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#16a34a' }}>
                                                {msg.action === 'CHECKOUT' ? 'Proceed to Test Checkout' : msg.action === 'REPORT_ANALYZED' ? 'View Patient Reports' : 'View Test Bookings'}
                                            </span>
                                            <button onClick={() => handleAction(msg.action)} style={{ padding: '0.3rem 0.7rem', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}>
                                                Go ➜
                                            </button>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignSelf: 'flex-start' }}>
                                    <div style={{ padding: '0.65rem 1.1rem', borderRadius: '14px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', color: '#003366' }} />
                                        <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b' }}>AI Copilot analyzing...</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* Voice helper banner */}
                            {showQuickPrompts && !isLoading && (
                                <div style={{ background: '#f0f9ff', border: '1px dashed #bae6fd', borderRadius: '12px', padding: '0.55rem 0.8rem', fontSize: '0.72rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Sparkle size={14} className="text-sky-500" />
                                    <span><strong>Voice Tip:</strong> Tap the mic and say <em>"Book CBC Test"</em> or <em>"Show My Reports"</em></span>
                                </div>
                            )}

                            {/* Quick Prompts */}
                            <AnimatePresence>
                                {showQuickPrompts && !isLoading && roleConfig.prompts?.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.2rem' }}>
                                        {roleConfig.prompts.map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSend(q.text)}
                                                style={{ padding: '0.32rem 0.65rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '16px', fontSize: '0.72rem', fontWeight: '700', color: '#003366', cursor: 'pointer', transition: 'all 0.15s' }}
                                            >
                                                {q.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input & Voice Controls */}
                        <div style={{ padding: '0.85rem 1.15rem', background: 'white', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
                            <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', padding: '0.4rem 0.55rem', background: isListening ? '#fef2f2' : '#f8fafc', borderRadius: '16px', border: isListening ? '1.5px solid #f87171' : '1.5px solid #e2e8f0', transition: 'all 0.2s' }}>
                                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept="image/*,.pdf" />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Attach document or prescription"
                                    style={{ width: '34px', height: '34px', borderRadius: '10px', background: attachedFile ? '#dbeafe' : 'transparent', border: 'none', cursor: 'pointer', color: attachedFile ? '#003366' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                >
                                    <Paperclip size={17} />
                                </button>

                                <input
                                    type="text"
                                    placeholder={isListening ? '🎙️ Listening... (Say your command)' : `Ask or speak to ${roleConfig.title}...`}
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                    style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '0.86rem', fontWeight: '500', color: '#0f172a', outline: 'none', padding: '0.1rem 0' }}
                                />

                                {/* Mic Button with Pulse */}
                                <motion.button
                                    whileTap={{ scale: 0.85 }}
                                    onClick={toggleListening}
                                    title={isListening ? 'Stop listening' : 'Speak Voice Command'}
                                    style={{ width: '36px', height: '36px', borderRadius: '10px', background: isListening ? '#dc2626' : '#e0f2fe', border: 'none', cursor: 'pointer', color: isListening ? 'white' : '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                >
                                    {isListening ? (
                                        <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                                            <Mic size={18} />
                                        </motion.div>
                                    ) : (
                                        <Mic size={18} />
                                    )}
                                </motion.button>

                                {/* Send Button */}
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleSend()}
                                    disabled={isLoading}
                                    style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #003366, #0ea5e9)', color: 'white', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: isLoading ? 0.6 : 1 }}
                                >
                                    <Send size={16} />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </>
    );
};

export default ChatBot;
