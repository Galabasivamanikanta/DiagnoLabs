import { useState, useRef, useEffect, useCallback, useContext } from 'react';
import {
    MessageSquare, Send, Sparkles, ChevronDown, RefreshCw,
    Mic, MicOff, Paperclip, FileText, X, Loader2, FlaskConical,
    Droplets, Thermometer, Zap, HeartPulse, ShieldCheck, ArrowRight,
    Volume2, VolumeX, CheckCircle2, AlertCircle, Pill, Activity,
    ClipboardList, CreditCard, BookOpen, Stethoscope, Package, Landmark,
    Megaphone, LifeBuoy, Truck, Cpu, Crown, UserCheck, Radio, Compass,
    Sparkle, Mic2, MapPin, Calendar, FileCheck, Info, Check, HelpCircle
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
    if (n.includes('blood') || n.includes('cbc') || n.includes('haemoglobin') || n.includes('platelet')) 
        return <Droplets size={17} className="text-rose-500" />;
    if (n.includes('sugar') || n.includes('hba1c') || n.includes('diabetes') || n.includes('glucose')) 
        return <Thermometer size={17} className="text-amber-500" />;
    if (n.includes('thyroid') || n.includes('t3') || n.includes('t4') || n.includes('tsh')) 
        return <Zap size={17} className="text-yellow-500" />;
    if (n.includes('heart') || n.includes('cardiac') || n.includes('ecg') || n.includes('lipid') || n.includes('cholesterol')) 
        return <HeartPulse size={17} className="text-red-500" />;
    if (n.includes('liver') || n.includes('kidney') || n.includes('urine') || n.includes('renal') || n.includes('lft') || n.includes('kft')) 
        return <ShieldCheck size={17} className="text-emerald-500" />;
    if (n.includes('vitamin') || n.includes('b12') || n.includes('d3') || n.includes('iron') || n.includes('calcium')) 
        return <Pill size={17} className="text-purple-500" />;
    if (n.includes('full') || n.includes('body') || n.includes('checkup') || n.includes('package') || n.includes('fever')) 
        return <Activity size={17} className="text-sky-500" />;
    return <FlaskConical size={17} className="text-cyan-500" />;
};

// ─────────────────────────────────────────────────────────────
// Role-Specific Chatbot Configurations (Clean Medical Styling)
// ─────────────────────────────────────────────────────────────
const ROLE_CHAT_CONFIGS = {
    patient: {
        title: 'Patient Health AI Copilot',
        subtitle: 'Clinical Triage · Lab Booking · Voice Assistant',
        icon: <Sparkles size={20} className="text-sky-300" />,
        greeting: `Welcome to **DiagnoLabs Clinical Voice Copilot**.\n\nI am your intelligent health assistant. You can speak or type to:\n• **Symptom Triage:** Analyze symptoms & get NABL diagnostic test suggestions\n• **Instant Booking:** Schedule sample collections (e.g., "Book CBC Test")\n• **Report Interpretation:** Understand biomarker values & normal reference intervals\n• **Preparation Guidelines:** Pre-test fasting rules & dietary protocols\n• **Lab Discovery:** Find nearest accredited pathology laboratories`,
        prompts: [
            { label: 'Fever & Infection', icon: <Thermometer size={13} className="text-amber-500" />, text: 'I have fever, chills, and body aches for 2 days. What tests should I get?' },
            { label: 'Diabetes Check', icon: <Droplets size={13} className="text-rose-500" />, text: 'Suggest the best diagnostic tests for Diabetes screening and monitoring.' },
            { label: 'Thyroid & Fatigue', icon: <Zap size={13} className="text-yellow-500" />, text: 'I have extreme fatigue and sudden weight gain. Which thyroid test is best?' },
            { label: 'Fasting Guidelines', icon: <ClipboardList size={13} className="text-emerald-500" />, text: 'Do I need 10 to 12 hours fasting before my Lipid Profile and Sugar tests?' },
            { label: 'Full Body Package', icon: <Activity size={13} className="text-sky-500" />, text: 'What tests are included in the Comprehensive Full Body Health Package?' }
        ]
    },
    doctor: {
        title: 'Doctor AI Clinical Copilot',
        subtitle: 'Differential Diagnosis · Decision Support',
        icon: <Stethoscope size={20} className="text-sky-300" />,
        greeting: `Welcome Doctor. I am your **Clinical Decision Copilot**.\n\nReady to assist your diagnostic workflows:\n• **Differential Diagnosis:** Parameter correlation from patient lab values\n• **Prescription Templates:** Standard clinical management protocols\n• **Biomarker Trends:** Longitudinal patient health tracking & critical alerts\n• **Drug-Test Interactions:** Potential analytical interferences`,
        prompts: [
            { label: 'Differential Diagnosis', icon: <Activity size={13} className="text-sky-500" />, text: 'Patient has Elevated TSH (8.5) and Low Free T4. What is the diagnosis and treatment?' },
            { label: 'Type-2 Diabetes Rx', icon: <Pill size={13} className="text-purple-500" />, text: 'Draft a standard prescription and monitoring protocol for Type-2 Diabetes.' },
            { label: 'Drug-Lab Interaction', icon: <ShieldCheck size={13} className="text-emerald-500" />, text: 'Does Biotin or Metformin interfere with Thyroid panel tests?' }
        ]
    },
    nurse: {
        title: 'Nurse Clinical Assistant AI',
        subtitle: 'Vitals · Sterile Care Coordination',
        icon: <HeartPulse size={20} className="text-pink-300" />,
        greeting: `Welcome Nurse. I am your **Clinical Care Assistant**.\n\nReady to assist your shift operations:\n• **Patient Vitals Entry:** Standard reference limits for BP, SpO2, and Pulse\n• **Sterile Phlebotomy:** Vacutainer tube sequence and aseptic draw protocol\n• **Queue Prioritization:** Emergency and fasting patient triage guidelines`,
        prompts: [
            { label: 'Vitals Reference Ranges', icon: <HeartPulse size={13} className="text-rose-500" />, text: 'What are the normal adult and senior vitals ranges for BP, SpO2, and Pulse?' },
            { label: 'Vacutainer Sequence', icon: <FlaskConical size={13} className="text-cyan-500" />, text: 'What is the correct order of draw for blood collection tubes (EDTA, Serum, Fluoride)?' }
        ]
    },
    phlebotomist: {
        title: 'Phlebotomist Navigator AI',
        subtitle: 'Sample Collection · Cold Chain GPS',
        icon: <Droplets size={20} className="text-rose-300" />,
        greeting: `Field Collector Assistant Active.\n\nAssisting with:\n• **GPS Routing:** Optimized navigation to patient home addresses\n• **Tube Selection:** EDTA, Fluoride, and Serum vacutainer protocols\n• **OTP Digital Verification:** 4-digit patient authentication handshake\n• **Cold-Chain Logistics:** 2°C to 8°C specimen temperature management`,
        prompts: [
            { label: 'Tube Color Guide', icon: <Droplets size={13} className="text-rose-500" />, text: 'Which tube color is used for HbA1c, Glucose, and Lipid Profile?' },
            { label: 'OTP Verification', icon: <ShieldCheck size={13} className="text-emerald-500" />, text: 'Explain the 4-digit OTP digital handshake verification procedure.' }
        ]
    },
    admin: {
        title: 'Admin Master Copilot AI',
        subtitle: 'Platform Governance · RBAC Analytics',
        icon: <Crown size={20} className="text-amber-300" />,
        greeting: `Platform Governance Copilot Active.\n\nAssisting with:\n• **RBAC Governance:** 14-Tier user access permissions & compliance\n• **Lab Accreditation:** NABL onboarding review & verification\n• **Operational Analytics:** Platform-wide booking volume, revenue, and SLA health`,
        prompts: [
            { label: '14-Tier RBAC Overview', icon: <ShieldCheck size={13} className="text-sky-500" />, text: 'List the access privileges and data boundaries across the 14 RBAC user roles.' },
            { label: 'Lab Onboarding Checklist', icon: <ClipboardList size={13} className="text-emerald-500" />, text: 'What compliance documents are required to approve a new NABL lab partner?' }
        ]
    },
    employee: {
        title: 'Front Desk Operations AI',
        subtitle: 'Reception · Walk-In Registration',
        icon: <UserCheck size={20} className="text-sky-300" />,
        greeting: `Reception & Front Desk Assistant Active.\n\nAssisting with:\n• **Walk-In Registration:** Patient intake & test profile selection\n• **Appointment Check-In:** Verification of online scheduled appointments\n• **Invoice Printing:** Tax invoice & token generation`,
        prompts: [
            { label: 'Walk-In Registration', icon: <UserCheck size={13} className="text-sky-500" />, text: 'How do I register a new walk-in patient for a Thyroid and CBC test?' },
            { label: 'Appointment Check-In', icon: <Calendar size={13} className="text-emerald-500" />, text: 'What is the standard procedure to verify and check in an online booked patient?' }
        ]
    }
};

// ─────────────────────────────────────────────────────────────
// Clinical Intelligence Fallback Engine
// ─────────────────────────────────────────────────────────────
const generateClinicalFallback = (text, role = 'patient') => {
    const q = (text || '').toLowerCase().trim();

    // 1. FEVER & INFECTIONS
    if (q.includes('fever') || q.includes('temperature') || q.includes('chills') || q.includes('dengue') || q.includes('malaria') || q.includes('typhoid') || q.includes('jwaram') || q.includes('cold') || q.includes('flu')) {
        return `Based on your reported fever and chills, a complete infection screening panel is clinically indicated to differentiate between Viral, Dengue, Malaria, or Typhoid etiology.\n\nRecommended Diagnostic Tests:\n1. **Complete Blood Count (CBC)** — Evaluates White Blood Cell count, Platelets, and Infection markers.\n2. **Dengue NS1 Antigen & IgM/IgG** — Detects early dengue viral markers.\n3. **Typhoid (Widal / Typhidot)** — Identifies enteric Salmonella infection.\n4. **Urine Routine Examination** — Rules out secondary urinary tract infections.\n\n**Pre-Test Preparation:** No strict fasting required. Maintain hydration. If body temperature exceeds 101°F, consult a physician promptly.\n\n[RECOMMEND: Complete Blood Count (CBC)][RECOMMEND: Dengue Serology Panel][ACTION: BOOK: Complete Blood Count (CBC)]`;
    }

    // 2. DIABETES & BLOOD SUGAR
    if (q.includes('diabetes') || q.includes('sugar') || q.includes('glucose') || q.includes('hba1c') || q.includes('madhumeham') || q.includes('thirst') || q.includes('urination')) {
        return `For comprehensive Diabetes screening and blood glucose monitoring, the standard clinical protocol includes:\n\n• **HbA1c (Glycated Hemoglobin):** Evaluates 3-month average plasma glucose (No fasting required).\n• **Fasting Blood Sugar (FBS):** Requires 8 to 10 hours overnight fasting (plain water is permitted).\n• **Post-Prandial Blood Sugar (PPBS):** Sample drawn exactly 2 hours after a standard meal.\n• **Lipid Profile:** Screens for associated cardiovascular and metabolic risk.\n\n**Fasting Protocol:** Take water freely during fasting. Take morning insulin or oral medications only after sample draw.\n\n[RECOMMEND: HbA1c (Glycated Hemoglobin)][RECOMMEND: Fasting Blood Sugar (FBS)][ACTION: BOOK: HbA1c (Glycated Hemoglobin)]`;
    }

    // 3. THYROID & METABOLISM
    if (q.includes('thyroid') || q.includes('t3') || q.includes('t4') || q.includes('tsh') || q.includes('weight gain') || q.includes('weight loss') || q.includes('hair fall') || q.includes('fatigue') || q.includes('neerasam') || q.includes('weakness')) {
        return `For evaluating thyroid endocrine function and metabolic fatigue:\n\n• **Thyroid Profile Total (T3, T4, TSH):** Assesses hypothyroidism or hyperthyroidism.\n• **Vitamin D3 & Vitamin B12:** Essential micronutrients whose deficiency mimics chronic thyroid exhaustion.\n• **Complete Blood Count (CBC):** Screens for anemia and decreased oxygenation capacity.\n\n**Preparation:** Morning fasting sample (8 hours) is preferred. Thyroid replacement medication should be taken after blood draw.\n\n[RECOMMEND: Thyroid Profile Total (T3, T4, TSH)][RECOMMEND: Vitamin D3 & B12 Combo][ACTION: BOOK: Thyroid Profile Total (T3, T4, TSH)]`;
    }

    // 4. CARDIAC, CHOLESTEROL & BLOOD PRESSURE
    if (q.includes('heart') || q.includes('chest') || q.includes('cholesterol') || q.includes('bp') || q.includes('blood pressure') || q.includes('cardiac') || q.includes('lipid') || q.includes('palpitation')) {
        return `For cardiovascular risk evaluation and lipid metabolic assessment:\n\n• **Lipid Profile Extended:** Quantifies Total Cholesterol, HDL (Protective), LDL (Atherogenic), VLDL, and Triglycerides.\n• **High-Sensitivity CRP (hs-CRP):** Evaluates vascular arterial inflammation.\n• **Serum Electrolytes (Na+, K+, Cl-):** Monitors myocardial conduction balance.\n\n**Important Fasting Note:** Complete Lipid Profile strictly requires **10 to 12 hours overnight fasting** (plain water is permitted).\n\n[RECOMMEND: Lipid Profile Extended][RECOMMEND: Cardiac Risk Assessment Panel][ACTION: BOOK: Lipid Profile Extended]`;
    }

    // 5. LIVER & JAUNDICE
    if (q.includes('liver') || q.includes('jaundice') || q.includes('yellow') || q.includes('bilirubin') || q.includes('sgot') || q.includes('sgpt') || q.includes('gastric') || q.includes('nausea')) {
        return `For hepatic function evaluation and enzyme screening:\n\n• **Liver Function Test (LFT):** Total & Direct Bilirubin, SGOT/AST, SGPT/ALT, Alkaline Phosphatase, and Serum Albumin.\n• **Viral Hepatitis Panel (HBsAg & HCV):** Identifies infectious viral hepatitis markers.\n\n**Preparation:** 8 hours fasting recommended. Avoid alcohol for at least 48 hours prior to testing.\n\n[RECOMMEND: Liver Function Test (LFT)][ACTION: BOOK: Liver Function Test (LFT)]`;
    }

    // 6. KIDNEY & URINARY TRACT
    if (q.includes('kidney') || q.includes('urine') || q.includes('burning') || q.includes('creatinine') || q.includes('bun') || q.includes('uric acid') || q.includes('rft') || q.includes('kft')) {
        return `For renal function assessment and urinary tract evaluation:\n\n• **Renal Function Test (RFT / KFT):** Serum Creatinine, Blood Urea Nitrogen (BUN), and Uric Acid.\n• **Urine Routine & Microscopic Examination:** Identifies proteinuria, hematuria, and pus cell counts.\n• **Serum Electrolytes:** Monitors electrolyte filtration balance.\n\n**Sample Collection:** Collect mid-stream clean-catch morning urine sample.\n\n[RECOMMEND: Renal Function Test (RFT)][RECOMMEND: Urine Routine Examination][ACTION: BOOK: Renal Function Test (RFT)]`;
    }

    // 7. FULL BODY / HEALTH CHECKUP
    if (q.includes('full body') || q.includes('checkup') || q.includes('package') || q.includes('annual') || q.includes('master') || q.includes('routine')) {
        return `The **DiagnoLabs Comprehensive Full Body Health Package** comprises 75+ vital parameters:\n\n1. Complete Blood Count (CBC - 24 parameters)\n2. Diabetes Screening (HbA1c & Fasting Glucose)\n3. Complete Lipid Profile (Cholesterol Fractions)\n4. Liver Function Test (LFT - 11 parameters)\n5. Kidney Function Test (KFT - Serum Creatinine & Uric Acid)\n6. Thyroid Profile (T3, T4, TSH)\n7. Vitamin D3 & Vitamin B12 Levels\n8. Urine Routine & Microscopy\n\n**Fasting Required:** 10 to 12 hours overnight fasting.\n\n[RECOMMEND: Comprehensive Full Body Health Package][ACTION: BOOK: Comprehensive Full Body Health Package]`;
    }

    // 8. PRE-TEST FASTING GUIDELINES
    if (q.includes('fasting') || q.includes('empty stomach') || q.includes('prepare') || q.includes('diet') || q.includes('rules')) {
        return `**Official Pre-Test Preparation & Fasting Guidelines:**\n\n• **Lipid Profile & Fasting Blood Sugar:** 10 to 12 hours strict fasting. Only plain water is permitted.\n• **Thyroid Profile (TSH):** 8 hours fasting preferred. Take thyroid tablets after sample draw.\n• **Full Body Health Packages:** 10 to 12 hours overnight fasting.\n• **CBC, Vitamin D, Vitamin B12:** No strict fasting required; a light meal is permitted.\n\n[ACTION: CHECKOUT]`;
    }

    // 9. LAB REPORTS & RESULTS
    if (q.includes('report') || q.includes('result') || q.includes('download') || q.includes('pdf') || q.includes('view report') || q.includes('status')) {
        return `You can view and download all your digitally signed NABL diagnostic lab reports with secure QR verification in your patient dashboard.\n\n• Reports are available immediately upon Pathologist clinical verification.\n• Each report contains a tamper-proof cryptographic QR code for instant authenticity verification.\n\n[ACTION: REPORT_ANALYZED]`;
    }

    // 10. PRICING & BOOKING
    if (q.includes('price') || q.includes('cost') || q.includes('rate') || q.includes('offer') || q.includes('discount') || q.includes('coupon') || q.includes('book')) {
        return `DiagnoLabs offers transparent pricing with up to 40% discount on NABL diagnostic packages including **Complimentary Home Sample Collection**:\n\n• Complete Blood Count (CBC): ₹299\n• HbA1c Diabetes Screen: ₹450\n• Thyroid Profile (T3/T4/TSH): ₹499\n• Lipid Profile: ₹550\n• Comprehensive Full Body Package: ₹1,499 (75+ Parameters)\n\n[ACTION: CHECKOUT]`;
    }

    // Default Fallback
    return `Hello. I am your **DiagnoLabs Clinical Diagnostic Assistant**.\n\nI can assist you with:\n• **Symptom Triage:** Evidence-based diagnostic test recommendations.\n• **Direct Scheduling:** Instant home collection booking with NABL-verified labs.\n• **Preparation Protocols:** Pre-test fasting and dietary guidance.\n• **Report Interpretation:** Diagnostic biomarker values and reference intervals.\n\n[RECOMMEND: Comprehensive Full Body Health Package][ACTION: BOOK: Comprehensive Full Body Health Package]`;
};

// ─────────────────────────────────────────────────────────────
// Main Ultra-Modern ChatBot Component
// ─────────────────────────────────────────────────────────────
const ChatBot = () => {
    const navigate = useNavigate();
    const { isMobile } = useDevice();
    const { user } = useContext(AuthContext);

    // Determine role
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
    const [voiceFeedbackText, setVoiceFeedbackText] = useState('');

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);
    const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

    // Auto-scroll
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

    // Initial greeting on role change
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
    // Voice Command Processor
    // ─────────────────────────────────────────────────────────
    const processVoiceCommand = useCallback((rawText) => {
        const text = rawText.toLowerCase().trim();

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

    // Speech Recognition Setup
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
            setVoiceFeedbackText('Listening...');
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
                handleSend(final);
            }
        };

        rec.onerror = () => {
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
            alert('File too large (max 8 MB).');
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
    // Send Handler (Multi-Tier AI Engine)
    // ─────────────────────────────────────────────────────────
    const handleSend = async (overrideText) => {
        const text = (overrideText || inputValue).trim();
        if (!text && !attachedFile) return;

        const displayText = attachedFile ? `Document: ${attachedFile.name}${text ? ` — ${text}` : ''}` : text;

        setMessages(prev => [...prev, { id: getUniqueId(), text: displayText, sender: 'user' }]);
        setInputValue('');
        setSpeechTranscript('');
        setShowQuickPrompts(false);
        setIsLoading(true);
        stopSpeaking();

        if (!attachedFile && processVoiceCommand(text)) {
            setIsLoading(false);
            return;
        }

        let reply = '';

        try {
            // Tier 1: Backend Express API
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
                console.warn("[AI-GATEWAY] Backend fallback:", backendErr.message);
            }

            // Tier 2: Direct Frontend Gemini SDK
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
                        console.warn("[AI-GATEWAY] Direct SDK fallback:", directSdkErr.message);
                    }
                }
            }

            // Tier 3: Guaranteed Clinical Intelligence Fallback
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
            text: `Conversation reset. How can I assist you as **${roleConfig.title}** today?`,
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
                ? <strong key={i} className="font-bold text-slate-900 tracking-tight">{part}</strong>
                : part.split('\n').map((line, j, arr) =>
                    j < arr.length - 1 ? [line, <br key={`${i}-${j}`} />] : line
                )
        );
    };

    return (
        <>
            {/* Floating Action Button (FAB) */}
            <motion.button
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setIsOpen(o => !o)}
                aria-label="Open AI Copilot Chat"
                className="fixed bottom-6 right-6 z-[1500] w-[62px] h-[62px] rounded-2xl flex items-center justify-center text-white cursor-pointer shadow-[0_12px_32px_rgba(2,132,199,0.38)] transition-shadow duration-300"
                style={{
                    background: 'linear-gradient(135deg, #071938 0%, #003366 50%, #0284c7 100%)',
                    border: '1.5px solid rgba(255, 255, 255, 0.25)'
                }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <ChevronDown size={26} className="text-sky-200" />
                        </motion.div>
                    ) : (
                        <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <MessageSquare size={26} className="text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Main Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.96 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 340 }}
                        className="fixed bottom-24 right-6 z-[1500] flex flex-col overflow-hidden bg-white/95 backdrop-blur-2xl rounded-[28px] border border-slate-200/80 shadow-[0_25px_65px_-12px_rgba(7,25,56,0.32)]"
                        style={{
                            width: isMobile ? 'calc(100vw - 2rem)' : '425px',
                            height: isMobile ? '82vh' : '680px',
                            maxHeight: isMobile ? '640px' : '720px'
                        }}
                    >
                        {/* Header */}
                        <div 
                            className="px-5 py-4 text-white relative overflow-hidden flex-shrink-0"
                            style={{
                                background: 'linear-gradient(135deg, #071938 0%, #003366 55%, #0284c7 100%)',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            {/* Subtle Ambient Glow */}
                            <div className="absolute top-0 right-0 w-36 h-36 bg-sky-400/15 rounded-full blur-2xl pointer-events-none" />

                            <div className="flex justify-between items-center relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                                        {roleConfig.icon}
                                    </div>
                                    <div>
                                        <div className="font-extrabold text-[0.98rem] flex items-center gap-2 tracking-tight">
                                            {roleConfig.title}
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                                            </span>
                                        </div>
                                        <div className="text-[0.66rem] font-bold text-sky-200 tracking-wider uppercase opacity-90">
                                            {roleConfig.subtitle}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <motion.button
                                        whileTap={{ scale: 0.88 }}
                                        onClick={() => { setIsMuted(m => !m); stopSpeaking(); }}
                                        title={isMuted ? 'Unmute audio response' : 'Mute audio response'}
                                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-sky-200 transition-colors cursor-pointer"
                                    >
                                        {isMuted ? <VolumeX size={15} className="text-white/40" /> : <Volume2 size={15} className="text-sky-300" />}
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.88 }}
                                        onClick={handleReset}
                                        title="Reset conversation"
                                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 transition-colors cursor-pointer"
                                    >
                                        <RefreshCw size={15} />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Voice Status Bar */}
                            {(isListening || isSpeaking || voiceFeedbackText) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-2.5 px-3 py-1.5 bg-black/25 backdrop-blur-md rounded-lg flex items-center justify-between text-[0.72rem] text-sky-100 border border-white/10"
                                >
                                    <div className="flex items-center gap-2">
                                        {isListening && <Radio size={13} className="text-rose-400 animate-pulse" />}
                                        {isSpeaking && <Volume2 size={13} className="text-sky-300 animate-bounce" />}
                                        <span className="font-semibold">{voiceFeedbackText || (isListening ? 'Listening to speech...' : 'Playing voice response...')}</span>
                                    </div>
                                    {isSpeaking && (
                                        <button 
                                            onClick={stopSpeaking}
                                            className="px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-[0.65rem] font-bold transition cursor-pointer"
                                        >
                                            Stop
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </div>

                        {/* Messages Feed */}
                        <div className="flex-1 overflow-y-auto p-4 bg-[#f8fafc] flex flex-col gap-3.5 scroll-smooth">
                            {messages.map(msg => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[90%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}
                                >
                                    {/* Message Bubble */}
                                    <div
                                        className={`px-4 py-3 text-[0.88rem] leading-[1.65] font-medium transition-all ${
                                            msg.sender === 'user'
                                                ? 'rounded-[20px] rounded-br-[4px] text-white shadow-[0_8px_20px_-4px_rgba(2,132,199,0.32)]'
                                                : 'rounded-[20px] rounded-bl-[4px] bg-white text-slate-800 border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)]'
                                        }`}
                                        style={
                                            msg.sender === 'user'
                                                ? { background: 'linear-gradient(135deg, #071938 0%, #003366 50%, #0284c7 100%)' }
                                                : {}
                                        }
                                    >
                                        {renderText(msg.text)}
                                    </div>

                                    {/* NABL Verified Test Recommendation Cards */}
                                    {msg.recommendations?.length > 0 && (
                                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="w-full mt-2 flex flex-col gap-2">
                                            {msg.recommendations.map((testName, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center justify-between gap-2.5 hover:border-sky-300 transition-all"
                                                >
                                                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                        <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
                                                            {testIcon(testName)}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-[0.6rem] font-extrabold text-sky-600 uppercase tracking-wider">
                                                                NABL Verified Test
                                                            </div>
                                                            <div className="text-[0.82rem] font-bold text-slate-900 truncate">
                                                                {testName}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleBook(testName)}
                                                        className="px-3 py-1.5 rounded-lg text-white font-bold text-[0.74rem] flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-sm hover:shadow transition-all"
                                                        style={{ background: 'linear-gradient(135deg, #0284c7, #003366)' }}
                                                    >
                                                        Book <ArrowRight size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}

                                    {/* Action Banner */}
                                    {msg.action && !msg.action.startsWith('BOOK:') && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.96 }} 
                                            animate={{ opacity: 1, scale: 1 }} 
                                            className="w-full mt-2 p-2.5 bg-emerald-50/80 border border-emerald-200/90 rounded-xl flex items-center justify-between"
                                        >
                                            <span className="text-[0.76rem] font-bold text-emerald-800">
                                                {msg.action === 'CHECKOUT' ? 'Proceed to Test Checkout' : msg.action === 'REPORT_ANALYZED' ? 'View Patient Reports' : 'View Test Bookings'}
                                            </span>
                                            <button 
                                                onClick={() => handleAction(msg.action)} 
                                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[0.72rem] font-bold cursor-pointer transition shadow-sm"
                                            >
                                                Go ➜
                                            </button>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}

                            {/* Typing Indicator */}
                            {isLoading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="self-start">
                                    <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-2">
                                        <Loader2 size={15} className="animate-spin text-sky-600" />
                                        <span className="text-[0.78rem] font-bold text-slate-500">AI Copilot analyzing...</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* Modern Voice Tip Box */}
                            {showQuickPrompts && !isLoading && (
                                <div className="p-2.5 bg-sky-50/80 border border-dashed border-sky-200 rounded-2xl flex items-center gap-2 text-[0.72rem] text-sky-800 shadow-sm">
                                    <Sparkle size={14} className="text-sky-500 flex-shrink-0" />
                                    <span className="leading-snug">
                                        <strong>Voice Command:</strong> Tap mic & speak <em className="text-sky-900 font-semibold">"Book CBC Test"</em> or <em className="text-sky-900 font-semibold">"Show My Reports"</em>
                                    </span>
                                </div>
                            )}

                            {/* Quick Action Prompt Pills with Professional Lucide Icons */}
                            <AnimatePresence>
                                {showQuickPrompts && !isLoading && roleConfig.prompts?.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className="flex flex-wrap gap-1.5 mt-1">
                                        {roleConfig.prompts.map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSend(q.text)}
                                                className="px-3 py-1.5 bg-white hover:bg-sky-50 hover:border-sky-300 border border-slate-200/90 rounded-full text-[0.74rem] font-bold text-slate-700 shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                                            >
                                                {q.icon}
                                                <span>{q.label}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input & Voice Bar */}
                        <div className="p-3.5 bg-white border-t border-slate-100 flex-shrink-0 shadow-lg">
                            <div 
                                className={`flex items-center gap-1.5 p-1.5 rounded-2xl transition-all ${
                                    isListening 
                                        ? 'bg-red-50/90 border-2 border-red-400 ring-4 ring-red-100' 
                                        : 'bg-slate-50 border border-slate-200 hover:border-slate-300 focus-within:border-sky-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-sky-100/50'
                                }`}
                            >
                                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept="image/*,.pdf" />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Attach prescription or lab report"
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
                                        attachedFile ? 'bg-sky-100 text-sky-700' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    <Paperclip size={17} />
                                </button>

                                <input
                                    type="text"
                                    placeholder={isListening ? 'Listening to voice command...' : `Ask or speak to ${roleConfig.title}...`}
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                    className="flex-1 bg-transparent border-none outline-none text-[0.88rem] font-medium text-slate-800 placeholder:text-slate-400 px-1 py-1"
                                />

                                {/* Voice Mic Button */}
                                <motion.button
                                    whileTap={{ scale: 0.88 }}
                                    onClick={toggleListening}
                                    title={isListening ? 'Stop listening' : 'Speak voice command'}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                                        isListening 
                                            ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                                            : 'bg-sky-100 hover:bg-sky-200 text-sky-600'
                                    }`}
                                >
                                    {isListening ? (
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
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
                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white cursor-pointer transition-all shadow-md flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ background: 'linear-gradient(135deg, #003366, #0284c7)' }}
                                >
                                    <Send size={15} />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatBot;
