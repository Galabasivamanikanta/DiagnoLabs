import { useState, useRef, useEffect, useCallback, useContext } from 'react';
import {
    MessageSquare, Send, Bot, Sparkles, ChevronDown, RefreshCw,
    Mic, MicOff, Paperclip, FileText, X, Loader2, FlaskConical,
    Droplets, Thermometer, Zap, HeartPulse, ShieldCheck, ArrowRight,
    Volume2, VolumeX, CheckCircle2, AlertCircle, Pill, Activity,
    ClipboardList, CreditCard, BookOpen, Stethoscope, Package, Landmark,
    Megaphone, LifeBuoy, Truck, Cpu, Crown, UserCheck, ThumbsUp, ThumbsDown
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
    text
        .replace(/\[RECOMMEND:[^\]]+\]/gi, '')
        .replace(/\[ACTION:[^\]]+\]/gi, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/#{1,6}\s/g, '')
        .trim();

const parseRecommendations = (text) => {
    const matches = [...text.matchAll(/\[RECOMMEND:\s*([^\]]+)\]/gi)];
    return matches.map(m => m[1].trim());
};

const parseAction = (text) => {
    const match = text.match(/\[ACTION:\s*([^\]]+)\]/i);
    return match ? match[1].trim() : null;
};

const testIcon = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('blood') || n.includes('cbc') || n.includes('haemoglobin')) return <Droplets size={18} className="text-rose-500" />;
    if (n.includes('sugar') || n.includes('hba1c') || n.includes('diabetes') || n.includes('glucose')) return <Thermometer size={18} className="text-orange-500" />;
    if (n.includes('thyroid')) return <Zap size={18} className="text-yellow-600" />;
    if (n.includes('heart') || n.includes('cardiac') || n.includes('ecg') || n.includes('lipid')) return <HeartPulse size={18} className="text-red-600" />;
    if (n.includes('liver') || n.includes('kidney') || n.includes('urine') || n.includes('renal')) return <ShieldCheck size={18} className="text-emerald-600" />;
    if (n.includes('vitamin') || n.includes('b12') || n.includes('iron')) return <Pill size={18} className="text-violet-500" />;
    if (n.includes('full') || n.includes('body') || n.includes('checkup')) return <Activity size={18} className="text-navy" />;
    return <FlaskConical size={18} className="text-primary" />;
};

// ─────────────────────────────────────────────────────────────
// Role-Specific Chatbot Configurations
// ─────────────────────────────────────────────────────────────
const ROLE_CHAT_CONFIGS = {
    patient: {
        title: 'Patient Health AI Assistant',
        subtitle: 'Symptom Triage & Test Guide',
        icon: <Sparkles size={22} style={{ color: '#38bdf8' }} />,
        badgeColor: '#0284c7',
        greeting: `Hello! 👋 I'm your **DiagnoLabs Personal Health Assistant**.\n\nHow can I assist your health journey today?\n• 🤒 Analyze symptoms & suggest lab tests\n• 📄 Explain your digital lab report values\n• 💊 Medicine guidance & pre-test fasting rules\n• 📅 Fast test booking & lab appointment scheduling`,
        prompts: [
            { label: '🤒 Symptom Analysis', text: 'I have fever and fatigue for 2 days, what tests do I need?' },
            { label: '📄 Explain My Report', text: 'Can you analyze my recent blood test report values?' },
            { label: '💊 Pre-Test Fasting', text: 'Do I need 12 hours fasting before my Lipid Profile test?' },
            { label: '🩸 Diabetes Check', text: 'Suggest the best diagnostic package for Diabetes screening.' }
        ]
    },
    doctor: {
        title: 'Doctor AI Clinical Copilot',
        subtitle: 'Clinical Decision Support',
        icon: <Stethoscope size={22} style={{ color: '#38bdf8' }} />,
        badgeColor: '#003366',
        greeting: `Welcome Doctor! 🩺 I'm your **Clinical AI Copilot**.\n\nI can assist you with:\n• 📋 Quick digital prescription template generation\n• 🔬 Differential diagnosis from lab parameters\n• 🩸 Patient vitals & lab report summaries\n• 💊 Drug-lab test interaction warnings`,
        prompts: [
            { label: '📋 Draft Rx Template', text: 'Draft a standard prescription for Type-2 Diabetes follow-up.' },
            { label: '🔬 Differential Diagnosis', text: 'Patient has Elevated TSH (8.5) and Low Free T4. What is the diagnosis?' },
            { label: '⚠️ Drug-Lab Interaction', text: 'Does Metformin or Biotin interfere with Thyroid panel tests?' },
            { label: '📄 Report Summary', text: 'Summarize the key abnormal parameters for my morning patient list.' }
        ]
    },
    nurse: {
        title: 'Nurse Clinical Assistant AI',
        subtitle: 'Vitals & Care Coordination',
        icon: <HeartPulse size={22} style={{ color: '#ec4899' }} />,
        badgeColor: '#db2777',
        greeting: `Hello Nurse! 🩺 I'm your **Clinical Care Assistant**.\n\nReady to help with your shift:\n• 🩸 Patient vitals entry guidelines (BP, SpO2, Pulse)\n• 💉 Clinical IV draw & sterile collection protocol\n• 📋 Room queue prioritization & patient triage\n• 📄 Post-collection patient instruction checklist`,
        prompts: [
            { label: '🩸 Vitals Normal Ranges', text: 'What are the normal SpO2 and Blood Pressure ranges for senior patients?' },
            { label: '💉 Sterile IV Protocol', text: 'Remind me of the step-by-step sterile protocol for pediatric IV draws.' },
            { label: '📋 Triage Patient Queue', text: 'How should I prioritize patients in the collection room queue?' }
        ]
    },
    phlebotomist: {
        title: 'Phlebotomist Navigator AI',
        subtitle: 'Sample Collection & GPS Guide',
        icon: <Droplets size={22} style={{ color: '#e11d48' }} />,
        badgeColor: '#e11d48',
        greeting: `Hey Collector! 🩸 I'm your **Field Navigation AI**.\n\nLet's get sample collections completed:\n• 📍 Home address GPS navigation tips\n• 📦 Barcode scanning & sample container color guide\n• 🔑 Patient 4-digit OTP collection confirmation\n• ❄️ Cold-chain sample temperature maintenance`,
        prompts: [
            { label: '📦 Tube Color Guide', text: 'Which color tube is used for HbA1c vs Serum Lipid Profile?' },
            { label: '🔑 OTP Verification', text: 'How do I handle a patient who lost their 4-digit collection OTP?' },
            { label: '❄️ Cold-Chain Temp', text: 'What is the required temperature for transporting Blood culture samples?' }
        ]
    },
    inventory_manager: {
        title: 'Inventory & Supply Chain AI',
        subtitle: 'Reagent & Stock Optimizer',
        icon: <Package size={22} style={{ color: '#d97706' }} />,
        badgeColor: '#d97706',
        greeting: `Welcome Inventory Manager! 📦 I'm your **Supply Chain Assistant**.\n\nI can help you with:\n• ⚠️ Low-stock reagent alerts & automated reorder drafts\n• 📅 Vendor supplier contact directory & lead time tracking\n• ⏳ Expiry date tracking for blood collection tubes\n• 📊 Procurement spend forecasting`,
        prompts: [
            { label: '⚠️ Check Low Stock', text: 'Which reagents are below minimum reorder threshold today?' },
            { label: '📦 Vendor PO Draft', text: 'Draft a purchase order for 500 Blood Collection EDTA Tubes.' },
            { label: '⏳ Expiry Alert', text: 'Show batch items expiring within 30 days.' }
        ]
    },
    finance_manager: {
        title: 'Finance & Tax AI Copilot',
        subtitle: 'Financial Operations & Payouts',
        icon: <Landmark size={22} style={{ color: '#059669' }} />,
        badgeColor: '#059669',
        greeting: `Greetings Finance Manager! 💳 I'm your **Financial Intelligence Assistant**.\n\nHow can I assist with accounts today?\n• 🧾 18% GST Tax Invoice calculation for Lab Partners & B2C\n• 💰 Lab Partner commission payout settlement formula\n• 🔄 Patient refund escrow approval workflow\n• 📊 Monthly P&L revenue vs payout reconciliation`,
        prompts: [
            { label: '🧾 GST 18% Calculation', text: 'How is 18% GST split between CGST and SGST on lab invoices?' },
            { label: '💰 Payout Formula', text: 'Explain the platform commission take-rate deduction for Lab Payouts.' },
            { label: '🔄 Refund Escrow', text: 'What are the required compliance steps to approve a Razorpay refund?' }
        ]
    },
    marketing_head: {
        title: 'Growth & Marketing AI',
        subtitle: 'Campaign & Retention Assistant',
        icon: <Megaphone size={22} style={{ color: '#2563eb' }} />,
        badgeColor: '#2563eb',
        greeting: `Welcome Growth Lead! 📢 I'm your **Marketing Copilot**.\n\nLet's drive platform adoption:\n• 🎫 Create high-converting coupon code ideas ('DIAGNO20')\n• 📧 Draft Nodemailer email/SMS broadcast copy\n• 🎁 Configure patient referral rewards (₹150 cash back)\n• 📈 Calculate blended campaign ROI & conversion funnel`,
        prompts: [
            { label: '📧 Draft Email Broadcast', text: 'Write a promotional email broadcast for Full Body Checkup 20% Off.' },
            { label: '🎫 Coupon Ideas', text: 'Suggest 3 promo coupon codes for senior citizen health drives.' },
            { label: '📈 Funnel Optimization', text: 'How can I improve the conversion rate from site clicks to test bookings?' }
        ]
    },
    support_staff: {
        title: 'Support Helpdesk Copilot AI',
        subtitle: 'Omnichannel Ticket Assistant',
        icon: <LifeBuoy size={22} style={{ color: '#0284c7' }} />,
        badgeColor: '#0284c7',
        greeting: `Hello Support Executive! 🎧 I'm your **Helpdesk Copilot**.\n\nI can help resolve tickets faster:\n• 💬 1-Click quick reply templates (Refund, Collector Delay, Report Status)\n• 🚨 Inter-department ticket escalation guidance (Finance / IT / Admin)\n• ⏱️ SLA breach prevention & priority sorting\n• 🌟 Patient CSAT satisfaction rating booster tips`,
        prompts: [
            { label: '💬 Refund Reply Template', text: 'Give me a standard quick reply for a patient asking about refund status.' },
            { label: '🚨 Escalation Rules', text: 'When should I escalate a payment ticket to Accounts vs IT Specialist?' },
            { label: '⏱️ SLA Breach Priority', text: 'How do I triage Critical priority tickets nearing SLA expiration?' }
        ]
    },
    delivery_partner: {
        title: 'Delivery Field Logistics AI',
        subtitle: 'Report & Sample Transport Guide',
        icon: <Truck size={22} style={{ color: '#0284c7' }} />,
        badgeColor: '#0284c7',
        greeting: `Hey Delivery Agent! 🚚 I'm your **Logistics Copilot**.\n\nLet's complete your drops on time:\n• 📍 Route map navigation & address lookup\n• 🔑 Recipient 4-digit OTP proof of delivery\n• ⚠️ Report delivery issue (Recipient Unavailable, Address Wrong)\n• 💰 Daily delivery earnings summary`,
        prompts: [
            { label: '🔑 Proof of Delivery', text: 'What do I do if the recipient cannot find their 4-digit delivery OTP?' },
            { label: '⚠️ Recipient Unavailable', text: 'How do I log a non-delivery report for an unreachable phone number?' },
            { label: '📍 Route Optimization', text: 'Tips for completing 5 drops in Gachibowli route in minimum distance.' }
        ]
    },
    quality_auditor: {
        title: 'QC & NABL Compliance AI',
        subtitle: 'Lab Quality Assurance',
        icon: <ShieldCheck size={22} style={{ color: '#059669' }} />,
        badgeColor: '#059669',
        greeting: `Welcome Quality Auditor! 🔬 I'm your **NABL Compliance Specialist**.\n\nI can assist with lab quality audits:\n• 📋 4-Step Lab Audit Checklist (Hygiene, Calibration, SLA, Pathologist)\n• ⚠️ Root cause investigation for disputed/mismatched test reports\n• 📜 NABL & ISO 9001 certification renewal tracking\n• 🚫 Draft Lab Suspension / Blacklist recommendations for Admin`,
        prompts: [
            { label: '📋 Audit Checklist Specs', text: 'What are the core NABL requirements for analyzer calibration logs?' },
            { label: '⚠️ Mismatched Results', text: 'Step-by-step root cause investigation for mismatched Cholesterol values.' },
            { label: '🚫 Blacklist Draft', text: 'Draft a formal lab suspension notice for repeated SLA failures.' }
        ]
    },
    it_specialist: {
        title: 'DevOps & Systems AI Copilot',
        subtitle: 'Technical Infrastructure Support',
        icon: <Cpu size={22} style={{ color: '#003366' }} />,
        badgeColor: '#003366',
        greeting: `Greetings SysAdmin / IT Engineer! 💻 I'm your **DevOps Assistant**.\n\nMonitoring technical health:\n• 📟 Analyze system error logs & API 500 stack traces\n• 🔑 OAuth 2.0 JWT token callback troubleshooting\n• ⚡ Service latency checks (Vite, Node API, Database, SMTP)\n• 🔓 Technical account lockout removal guidance`,
        prompts: [
            { label: '📟 Debug Log Error', text: 'Explain cause: Nodemailer SMTP timeout (5000ms) on worker instance.' },
            { label: '🔑 OAuth 500 Callback', text: 'How to troubleshoot Google OAuth 2.0 JWT callback token mismatch?' },
            { label: '⚡ DB Latency Check', text: 'What is the optimal latency threshold for PostgreSQL database connection pools?' }
        ]
    },
    admin: {
        title: 'Admin System Copilot AI',
        subtitle: 'Platform Management & Governance',
        icon: <Crown size={22} style={{ color: '#d4af37' }} />,
        badgeColor: '#003366',
        greeting: `Greetings Administrator! 👑 I'm your **System Master Copilot**.\n\nFull platform governance support:\n• 👤 User onboarding & RBAC role assignments\n• 🏥 Lab Partner onboarding & accreditation sign-off\n• 🚫 Final approval of Lab Blacklist recommendations\n• 📈 Platform-wide revenue, booking, & SLA metrics`,
        prompts: [
            { label: '👤 RBAC Role Assignment', text: 'What are the data access boundaries for Support Staff vs Finance Manager?' },
            { label: '🏥 Lab Onboarding', text: 'What documents are required to approve a new Lab Partner application?' },
            { label: '📊 Platform Metrics', text: 'Summarize today\'s platform-wide booking volume and active staff counts.' }
        ]
    },
    employee: {
        title: 'Front Desk Operations AI',
        subtitle: 'Reception & Patient Check-In',
        icon: <UserCheck size={22} style={{ color: '#003366' }} />,
        badgeColor: '#003366',
        greeting: `Welcome Front Desk Team! 📋 I'm your **Reception Assistant**.\n\nHelping you manage walk-in patients:\n• 📝 Quick walk-in patient registration\n• 📅 Appointment check-in & room assignment\n• 🧾 Printing patient payment receipts\n• 🩸 Coordinating sample collection queue`,
        prompts: [
            { label: '📝 Walk-In Patient Registration', text: 'How do I register a new walk-in patient for a Thyroid Profile?' },
            { label: '📅 Appointment Check-In', text: 'What is the procedure for checking in an online booked patient?' },
            { label: '🧾 Receipt Printing', text: 'How to generate and print a payment receipt at the front desk?' }
        ]
    }
};

const RecommendationCards = ({ tests, onBook }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
    >
        {tests.map((testName, idx) => (
            <div key={idx} style={{
                padding: '0.9rem 1rem',
                background: 'white',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                gap: '0.75rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {testIcon(testName)}
                    </div>
                    <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Recommended</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>{testName}</div>
                    </div>
                </div>
                <button
                    onClick={() => onBook(testName)}
                    style={{
                        padding: '0.45rem 0.9rem',
                        background: 'linear-gradient(135deg, #0ea5e9, var(--primary))',
                        color: 'white',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        whiteSpace: 'nowrap'
                    }}
                >
                    Book <ArrowRight size={12} />
                </button>
            </div>
        ))}
    </motion.div>
);

const ActionBanner = ({ action, onAction }) => {
    const configs = {
        CHECKOUT: { icon: <CreditCard size={16} />, label: 'Proceed to Checkout', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
        PREP_DONE: { icon: <ClipboardList size={16} />, label: 'View My Bookings', color: '#9333ea', bg: '#faf5ff', border: '#e9d5ff' },
        REPORT_ANALYZED: { icon: <CheckCircle2 size={16} />, label: 'View All Reports', color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd' },
        MED_INFO: { icon: <BookOpen size={16} />, label: 'Learn More', color: 'var(--accent-gold)', bg: 'var(--surface-alt)', border: '#fde68a' },
    };
    const cfg = configs[action];
    if (!cfg) return null;
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ marginTop: '0.75rem', padding: '0.7rem 1rem', background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: cfg.color }}>{cfg.label}</span>
            <button onClick={() => onAction(action)} style={{ padding: '0.35rem 0.75rem', background: cfg.color, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {cfg.icon} Go
            </button>
        </motion.div>
    );
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
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [attachedFile, setAttachedFile] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [issueCategory, setIssueCategory] = useState('Payment & Refunds');
    const [issueDescription, setIssueDescription] = useState('');
    const [isReporting, setIsReporting] = useState(false);

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!issueDescription.trim()) return;

        setIsReporting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/api/chat/report-issue`, {
                subject: `ChatBot Issue: ${issueCategory}`,
                description: issueDescription,
                category: issueCategory
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const ticketMsg = {
                id: getUniqueId(3),
                text: `🚨 **Issue Logged & Auto-Routed!**\n\n• **Ticket ID:** #${res.data.ticketNumber}\n• **Category:** ${issueCategory}\n• **Assigned Workspace:** **${res.data.roleDisplayName}**\n\n${res.data.message}`,
                sender: 'bot',
                recommendations: [],
                action: null
            };

            setMessages(prev => [...prev, ticketMsg]);
            setShowReportModal(false);
            setIssueDescription('');
        } catch (err) {
            alert("Failed to create ticket. Please try again.");
        } finally {
            setIsReporting(false);
        }
    };

    const [activeFeedbackMsgId, setActiveFeedbackMsgId] = useState(null);
    const [feedbackInput, setFeedbackInput] = useState('');

    const handleRating = async (msgId, isPositive, promptText) => {
        if (!isPositive && activeFeedbackMsgId !== msgId) {
            setActiveFeedbackMsgId(msgId);
            return; // Open input box for negative feedback
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/api/chat/rate-response`, {
                messageId: msgId,
                isPositive,
                promptText,
                feedbackText: feedbackInput
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Show feedback success briefly
            setMessages(prev => prev.map(m => 
                m.id === msgId ? { ...m, rating: isPositive ? 'up' : 'down', feedbackSuccess: true } : m
            ));

            setTimeout(() => {
                setMessages(prev => prev.map(m => 
                    m.id === msgId ? { ...m, feedbackSuccess: false } : m
                ));
            }, 3000);
            
            setActiveFeedbackMsgId(null);
            setFeedbackInput('');
        } catch (err) {
            console.error("Failed to submit feedback", err);
        }
    };

    // Initialize initial greeting message according to role
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

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const stopSpeaking = useCallback(() => {
        synthRef.current?.cancel();
        setIsSpeaking(false);
    }, []);

    useEffect(() => {
        if (!isOpen) stopSpeaking();
    }, [isOpen, stopSpeaking]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-IN';
        rec.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            setInputValue(transcript);
            setIsListening(false);
        };
        rec.onerror = () => setIsListening(false);
        rec.onend = () => setIsListening(false);
        recognitionRef.current = rec;
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('Voice input is not supported by your browser. Please use Chrome or Edge.');
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            stopSpeaking();
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const speak = useCallback((text) => {
        if (isMuted || !synthRef.current) return;
        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText(text));
        utterance.lang = 'en-IN';
        utterance.rate = 0.92;
        utterance.pitch = 1.1;
        const voices = synthRef.current.getVoices();
        const femaleVoice =
            voices.find(v => v.name === 'Google UK English Female') ||
            voices.find(v => v.name === 'Google US English Female') ||
            voices.find(v => v.name.toLowerCase().includes('female') && v.lang.startsWith('en')) ||
            voices.find(v => v.name.toLowerCase().includes('zira')) ||
            voices.find(v => v.name.toLowerCase().includes('samantha')) ||
            voices.find(v => v.lang === 'en-IN') ||
            voices.find(v => v.lang.startsWith('en'));
        if (femaleVoice) utterance.voice = femaleVoice;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        synthRef.current.speak(utterance);
    }, [isMuted]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 8 * 1024 * 1024) {
            alert('File too large (max 8 MB). Please compress and try again.');
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
        else if (action === 'PREP_DONE') navigate('/patient/history');
        else if (action === 'REPORT_ANALYZED') navigate('/patient/history');
        else if (action === 'MED_INFO') navigate('/search');
    };

    const buildContext = () => {
        const path = window.location.pathname;
        return `Current User Role: [${currentRole.toUpperCase()}]. User Name: [${user?.name || 'User'}]. Active Path: [${path}].`;
    };

    const handleSend = async (overrideText) => {
        const text = (overrideText || inputValue).trim();
        if (!text && !attachedFile) return;

        const displayText = attachedFile ? `📎 ${attachedFile.name}${text ? ` — ${text}` : ''}` : text;

        setMessages(prev => [...prev, { id: getUniqueId(), text: displayText, sender: 'user' }]);
        setInputValue('');
        setShowQuickPrompts(false);
        setIsLoading(true);
        stopSpeaking();

        try {
            let rawHistory = messages.filter(m => !m.isError);
            let chatHistory = [];
            for (let m of rawHistory) {
                const role = m.sender === 'user' ? 'user' : 'model';
                if (chatHistory.length === 0 && role === 'model') continue;
                if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === role) {
                    chatHistory[chatHistory.length - 1].parts[0].text += "\\n" + m.text;
                    continue;
                }
                chatHistory.push({ role, parts: [{ text: m.text }] });
            }
            chatHistory = chatHistory.slice(-8);
            if (chatHistory.length > 0 && chatHistory[0].role === 'model') chatHistory.shift();

            const genAI = new GoogleGenerativeAI("AIzaSyDoC1crU8zerh9rvwSlKLlg8lWq07rZY80");
            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                systemInstruction: `You are the ${roleConfig.title}. ${roleConfig.subtitle}. 
Context: ${buildContext()}
User Input: ${text}
Always respond professionally and empathetically. If you are suggesting a lab test, append "[RECOMMEND: Test Name]" to your response. If you are instructing the user to book a test or navigate, append "[ACTION: BOOK: Test Name]" or "[ACTION: CHECKOUT]" etc.`
            });

            const chat = model.startChat({ history: chatHistory });
            
            let reply = '';
            if (attachedFile) {
                 const result = await model.generateContent([
                     { inlineData: { data: attachedFile.data, mimeType: attachedFile.mimeType } },
                     text
                 ]);
                 reply = result.response.text();
            } else {
                 const result = await chat.sendMessage(text);
                 reply = result.response.text();
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
            console.error("Gemini Error:", err);
            const errMsg = err.message || err.response?.data?.details || 'Unable to reach the clinical AI copilot. Please try again.';
            const errBotMsg = {
                id: getUniqueId(2),
                text: `⚠️ ${errMsg}`,
                sender: 'bot',
                isError: true,
                recommendations: [],
                action: null
            };
            setMessages(prev => [...prev, errBotMsg]);
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
    };

    const renderText = (text) => {
        const parts = text.split(/\*\*(.*?)\*\*/g);
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
            {/* FAB Button */}
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
                    color: 'white', border: '2px solid rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 24px -4px rgba(0,51,102,0.4)',
                    cursor: 'pointer', zIndex: 1500
                }}
            >
                <AnimatePresence mode="wait">
                    {isOpen
                        ? <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><ChevronDown size={isMobile ? 20 : 26} /></motion.div>
                        : <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageSquare size={isMobile ? 20 : 26} /></motion.div>
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
                        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                        style={{
                            position: 'fixed',
                            bottom: isMobile ? '8.5rem' : '7.5rem',
                            right: isMobile ? '1rem' : '2rem',
                            width: isMobile ? 'calc(100vw - 2rem)' : '420px',
                            height: isMobile ? '80vh' : '85vh',
                            maxHeight: isMobile ? '640px' : '700px',
                            background: 'rgba(255,255,255,0.98)',
                            backdropFilter: 'blur(24px)',
                            borderRadius: isMobile ? '20px' : '28px',
                            boxShadow: '0 24px 60px -12px rgba(15,23,42,0.2)',
                            display: 'flex', flexDirection: 'column', overflow: 'hidden',
                            zIndex: 1500, border: '1px solid rgba(226,232,240,0.8)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '1.25rem 1.5rem', background: '#003366', color: 'white', flexShrink: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                    <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {roleConfig.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {roleConfig.title}
                                            <span style={{ width: '7px', height: '7px', background: '#4ade80', borderRadius: '50%', display: 'inline-block' }} />
                                        </div>
                                        <div style={{ fontSize: '0.68rem', color: '#93c5fd', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {roleConfig.subtitle} · Gemini Powered
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <button 
                                        onClick={() => setShowReportModal(true)} 
                                        title="Report Problem & Auto-Route"
                                        style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '0.35rem 0.55rem', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <AlertCircle size={14} /> Report
                                    </button>
                                    <motion.button
                                        whileTap={{ scale: 0.85 }}
                                        onClick={() => { setIsMuted(m => !m); stopSpeaking(); }}
                                        title={isMuted ? 'Unmute voice' : 'Mute voice'}
                                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: isMuted ? 'rgba(255,255,255,0.4)' : '#38bdf8', cursor: 'pointer', borderRadius: '8px', padding: '0.4rem', display: 'flex' }}
                                    >
                                        {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.85 }}
                                        onClick={handleReset}
                                        title="Reset conversation"
                                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', borderRadius: '8px', padding: '0.4rem', display: 'flex' }}
                                    >
                                        <RefreshCw size={17} />
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {messages.map(msg => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}
                                >
                                    <div style={{
                                        padding: '0.9rem 1.1rem',
                                        borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                        background: msg.sender === 'user'
                                            ? 'linear-gradient(135deg, #003366, #0ea5e9)'
                                            : (msg.isError ? '#fff1f2' : 'white'),
                                        color: msg.sender === 'user' ? 'white' : '#1e293b',
                                        boxShadow: msg.sender === 'user'
                                            ? '0 8px 20px -5px rgba(0,51,102,0.35)'
                                            : '0 3px 8px rgba(0,0,0,0.06)',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        lineHeight: '1.65',
                                        border: msg.sender === 'bot' ? (msg.isError ? '1px solid #fda4af' : '1px solid #e2e8f0') : 'none'
                                    }}>
                                        {renderText(msg.text)}
                                    </div>

                                    {msg.recommendations?.length > 0 && (
                                        <RecommendationCards tests={msg.recommendations} onBook={handleBook} />
                                    )}

                                    {msg.action && !msg.action.startsWith('BOOK:') && (
                                        <ActionBanner action={msg.action} onAction={handleAction} />
                                    )}

                                    {/* AI RLHF Feedback UI */}
                                    {msg.sender === 'bot' && !msg.isError && msg.id > 1 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem', paddingLeft: '0.5rem' }}>
                                            {!msg.rating && !msg.feedbackSuccess && activeFeedbackMsgId !== msg.id && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '600' }}>Rate this response:</span>
                                                    <button onClick={() => handleRating(msg.id, true, msg.text.substring(0, 50))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: '#cbd5e1' }} title="Good response (Trains AI)">
                                                        <ThumbsUp size={14} />
                                                    </button>
                                                    <button onClick={() => handleRating(msg.id, false, msg.text.substring(0, 50))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: '#cbd5e1' }} title="Bad response (Provide Correction)">
                                                        <ThumbsDown size={14} />
                                                    </button>
                                                </div>
                                            )}

                                            {activeFeedbackMsgId === msg.id && (
                                                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                    <input 
                                                        type="text" 
                                                        placeholder="What should be the correct answer?" 
                                                        value={feedbackInput} 
                                                        onChange={e => setFeedbackInput(e.target.value)}
                                                        autoFocus
                                                        style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} 
                                                    />
                                                    <button onClick={() => handleRating(msg.id, false, msg.text.substring(0, 50))} style={{ padding: '0.4rem 0.6rem', background: '#003366', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>Train AI</button>
                                                    <X size={16} color="#94a3b8" cursor="pointer" onClick={() => setActiveFeedbackMsgId(null)} />
                                                </motion.div>
                                            )}

                                            {msg.feedbackSuccess && (
                                                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: '0.65rem', color: msg.rating === 'up' ? '#16a34a' : '#0284c7', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    <CheckCircle2 size={12} /> {msg.rating === 'up' ? '+1 AI Confidence Reinforced' : 'AI Pattern Updated'}
                                                </motion.span>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{ alignSelf: 'flex-start' }}
                                >
                                    <div style={{ padding: '0.75rem 1.25rem', borderRadius: '16px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <Loader2 size={15} style={{ animation: 'spin 1s linear infinite', color: '#003366' }} />
                                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b' }}>AI Copilot analyzing...</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* Dynamic Role Quick Prompts */}
                            <AnimatePresence>
                                {showQuickPrompts && !isLoading && roleConfig.prompts?.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}
                                    >
                                        {roleConfig.prompts.map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSend(q.text)}
                                                style={{
                                                    padding: '0.35rem 0.75rem',
                                                    background: 'white',
                                                    border: '1px solid #cbd5e1',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700',
                                                    color: '#003366',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s'
                                                }}
                                            >
                                                {q.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '1rem 1.25rem', background: 'white', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
                            <AnimatePresence>
                                {attachedFile && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        style={{ marginBottom: '0.6rem', padding: '0.5rem 0.85rem', background: '#f0f9ff', borderRadius: '10px', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FileText size={15} style={{ color: '#0ea5e9' }} />
                                            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0369a1', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attachedFile.name}</span>
                                        </div>
                                        <X size={15} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setAttachedFile(null)} />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.45rem 0.6rem', background: '#f8fafc', borderRadius: '18px', border: '1.5px solid #e2e8f0' }}>
                                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept="image/*,.pdf" />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Attach document or image"
                                    style={{ width: '36px', height: '36px', borderRadius: '12px', background: attachedFile ? '#dbeafe' : 'transparent', border: 'none', cursor: 'pointer', color: attachedFile ? '#003366' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                >
                                    <Paperclip size={18} />
                                </button>

                                <input
                                    type="text"
                                    placeholder={isListening ? '🎙️ Listening...' : `Ask ${roleConfig.title}...`}
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                    style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '0.9rem', fontWeight: '500', color: '#0f172a', outline: 'none', padding: '0.1rem 0' }}
                                />

                                <motion.button
                                    whileTap={{ scale: 0.85 }}
                                    onClick={toggleListening}
                                    title={isListening ? 'Stop listening' : 'Voice input'}
                                    style={{ width: '36px', height: '36px', borderRadius: '12px', background: isListening ? '#fef2f2' : 'transparent', border: 'none', cursor: 'pointer', color: isListening ? '#e11d48' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                >
                                    {isListening
                                        ? <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}><Mic size={18} /></motion.div>
                                        : <MicOff size={18} />
                                    }
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleSend()}
                                    disabled={isLoading}
                                    style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'linear-gradient(135deg, #003366, #0ea5e9)', color: 'white', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px -3px rgba(0,51,102,0.4)', flexShrink: 0, opacity: isLoading ? 0.6 : 1 }}
                                >
                                    <Send size={17} />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Issue Reporting Modal */}
            <AnimatePresence>
                {showReportModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ background: 'white', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={22} color="#dc2626" />
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Report Issue & Auto-Route</h3>
                                </div>
                                <X size={20} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setShowReportModal(false)} />
                            </div>
                            <form onSubmit={handleReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div>
                                    <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px' }}>Issue Category</label>
                                    <select value={issueCategory} onChange={e => setIssueCategory(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '700', outline: 'none' }}>
                                        <option value="Payment & Refunds">Payment & Refunds (→ Finance Manager)</option>
                                        <option value="Technical Bug / Login Error">Technical Bug / Login Error (→ IT Support)</option>
                                        <option value="Sample Collection Issue">Sample Collection Issue (→ Support & Collector)</option>
                                        <option value="Quality & Disputed Report">Quality & Disputed Report (→ Quality Auditor)</option>
                                        <option value="Delivery Problem">Delivery Problem (→ Delivery Partner)</option>
                                        <option value="Inventory & Supplies">Inventory & Reagent Stock (→ Inventory Manager)</option>
                                        <option value="General Query">General Query (→ Front Desk & Support)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px' }}>Describe the Problem</label>
                                    <textarea rows={3} placeholder="Please describe what happened..." value={issueDescription} onChange={e => setIssueDescription(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', resize: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                                    <button type="button" onClick={() => setShowReportModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                                    <button type="submit" disabled={isReporting} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#003366', color: 'white', fontWeight: '800', cursor: 'pointer' }}>
                                        {isReporting ? 'Routing...' : 'Submit & Route'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </>
    );
};

export default ChatBot;
