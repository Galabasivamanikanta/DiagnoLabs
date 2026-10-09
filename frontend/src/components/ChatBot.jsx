import { useState, useRef, useEffect, useCallback, useContext } from 'react';
import {
    MessageSquare, Send, X, Loader2, FlaskConical,
    Droplets, Thermometer, Zap, HeartPulse, ShieldCheck, ArrowRight,
    Volume2, VolumeX, CheckCircle2, AlertCircle, Pill, Activity,
    Calendar, FileText, HelpCircle, Paperclip, Mic, MicOff, Radio,
    Sparkles, RefreshCw
} from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import useDevice from '../hooks/useDevice';
import { GoogleGenerativeAI } from "@google/generative-ai";

let msgIdCounter = 0;
const getUniqueId = (offset = 0) => {
    msgIdCounter += 1;
    return Date.now() + msgIdCounter + offset;
};

// Strips emojis & markdown for speech synthesis
const cleanText = (text) =>
    (text || '')
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '')
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
        return <Droplets size={18} className="text-rose-600" />;
    if (n.includes('sugar') || n.includes('hba1c') || n.includes('diabetes') || n.includes('glucose')) 
        return <Thermometer size={18} className="text-amber-600" />;
    if (n.includes('thyroid') || n.includes('t3') || n.includes('t4') || n.includes('tsh')) 
        return <Zap size={18} className="text-yellow-600" />;
    if (n.includes('heart') || n.includes('cardiac') || n.includes('ecg') || n.includes('lipid') || n.includes('cholesterol')) 
        return <HeartPulse size={18} className="text-red-600" />;
    if (n.includes('liver') || n.includes('kidney') || n.includes('urine') || n.includes('renal') || n.includes('lft') || n.includes('kft')) 
        return <ShieldCheck size={18} className="text-emerald-600" />;
    if (n.includes('vitamin') || n.includes('b12') || n.includes('d3') || n.includes('iron') || n.includes('calcium')) 
        return <Pill size={18} className="text-purple-600" />;
    if (n.includes('full') || n.includes('body') || n.includes('checkup') || n.includes('package') || n.includes('fever')) 
        return <Activity size={18} className="text-sky-600" />;
    return <FlaskConical size={18} className="text-cyan-600" />;
};

// ─────────────────────────────────────────────────────────────
// Clinical Fallback Engine
// ─────────────────────────────────────────────────────────────
const generateClinicalFallback = (text) => {
    const q = (text || '').toLowerCase().trim();

    if (q.includes('fever') || q.includes('temperature') || q.includes('chills') || q.includes('dengue') || q.includes('malaria') || q.includes('typhoid') || q.includes('jwaram') || q.includes('cold') || q.includes('flu')) {
        return `Based on your reported fever and chills, a complete infection screening panel is clinically indicated to differentiate between Viral, Dengue, Malaria, or Typhoid etiology.\n\nRecommended Diagnostic Tests:\n1. Complete Blood Count (CBC) — Evaluates White Blood Cell count, Platelets, and Infection markers.\n2. Dengue NS1 Antigen & IgM/IgG — Detects early dengue viral markers.\n3. Typhoid (Widal / Typhidot) — Identifies enteric Salmonella infection.\n4. Urine Routine Examination — Rules out secondary urinary tract infections.\n\nPre-Test Preparation: No strict fasting required. Maintain hydration. If body temperature exceeds 101°F, consult a physician promptly.\n\n[RECOMMEND: Complete Blood Count (CBC)][RECOMMEND: Dengue Serology Panel][ACTION: BOOK: Complete Blood Count (CBC)]`;
    }

    if (q.includes('diabetes') || q.includes('sugar') || q.includes('glucose') || q.includes('hba1c') || q.includes('madhumeham') || q.includes('thirst') || q.includes('urination')) {
        return `For comprehensive Diabetes screening and blood glucose monitoring, the standard clinical protocol includes:\n\n• HbA1c (Glycated Hemoglobin): Evaluates 3-month average plasma glucose (No fasting required).\n• Fasting Blood Sugar (FBS): Requires 8 to 10 hours overnight fasting (plain water is permitted).\n• Post-Prandial Blood Sugar (PPBS): Sample drawn exactly 2 hours after a standard meal.\n• Lipid Profile: Screens for associated cardiovascular and metabolic risk.\n\nFasting Protocol: Take water freely during fasting. Take morning insulin or oral medications only after sample draw.\n\n[RECOMMEND: HbA1c (Glycated Hemoglobin)][RECOMMEND: Fasting Blood Sugar (FBS)][ACTION: BOOK: HbA1c (Glycated Hemoglobin)]`;
    }

    if (q.includes('thyroid') || q.includes('t3') || q.includes('t4') || q.includes('tsh') || q.includes('weight gain') || q.includes('weight loss') || q.includes('hair fall') || q.includes('fatigue') || q.includes('neerasam') || q.includes('weakness')) {
        return `For evaluating thyroid endocrine function and metabolic fatigue:\n\n• Thyroid Profile Total (T3, T4, TSH): Assesses hypothyroidism or hyperthyroidism.\n• Vitamin D3 & Vitamin B12: Essential micronutrients whose deficiency mimics chronic thyroid exhaustion.\n• Complete Blood Count (CBC): Screens for anemia and decreased oxygenation capacity.\n\nPreparation: Morning fasting sample (8 hours) is preferred. Thyroid replacement medication should be taken after blood draw.\n\n[RECOMMEND: Thyroid Profile Total (T3, T4, TSH)][RECOMMEND: Vitamin D3 & B12 Combo][ACTION: BOOK: Thyroid Profile Total (T3, T4, TSH)]`;
    }

    if (q.includes('heart') || q.includes('chest') || q.includes('cholesterol') || q.includes('bp') || q.includes('blood pressure') || q.includes('cardiac') || q.includes('lipid') || q.includes('palpitation')) {
        return `For cardiovascular risk evaluation and lipid metabolic assessment:\n\n• Lipid Profile Extended: Quantifies Total Cholesterol, HDL (Protective), LDL (Atherogenic), VLDL, and Triglycerides.\n• High-Sensitivity CRP (hs-CRP): Evaluates vascular arterial inflammation.\n• Serum Electrolytes (Na+, K+, Cl-): Monitors myocardial conduction balance.\n\nImportant Fasting Note: Complete Lipid Profile strictly requires 10 to 12 hours overnight fasting (plain water is permitted).\n\n[RECOMMEND: Lipid Profile Extended][RECOMMEND: Cardiac Risk Assessment Panel][ACTION: BOOK: Lipid Profile Extended]`;
    }

    if (q.includes('liver') || q.includes('jaundice') || q.includes('yellow') || q.includes('bilirubin') || q.includes('sgot') || q.includes('sgpt') || q.includes('gastric') || q.includes('nausea')) {
        return `For hepatic function evaluation and enzyme screening:\n\n• Liver Function Test (LFT): Total & Direct Bilirubin, SGOT/AST, SGPT/ALT, Alkaline Phosphatase, and Serum Albumin.\n• Viral Hepatitis Panel (HBsAg & HCV): Identifies infectious viral hepatitis markers.\n\nPreparation: 8 hours fasting recommended. Avoid alcohol for at least 48 hours prior to testing.\n\n[RECOMMEND: Liver Function Test (LFT)][ACTION: BOOK: Liver Function Test (LFT)]`;
    }

    if (q.includes('kidney') || q.includes('urine') || q.includes('burning') || q.includes('creatinine') || q.includes('bun') || q.includes('uric acid') || q.includes('rft') || q.includes('kft')) {
        return `For renal function assessment and urinary tract evaluation:\n\n• Renal Function Test (RFT / KFT): Serum Creatinine, Blood Urea Nitrogen (BUN), and Uric Acid.\n• Urine Routine & Microscopic Examination: Identifies proteinuria, hematuria, and pus cell counts.\n• Serum Electrolytes: Monitors electrolyte filtration balance.\n\nSample Collection: Collect mid-stream clean-catch morning urine sample.\n\n[RECOMMEND: Renal Function Test (RFT)][RECOMMEND: Urine Routine Examination][ACTION: BOOK: Renal Function Test (RFT)]`;
    }

    if (q.includes('full body') || q.includes('checkup') || q.includes('package') || q.includes('annual') || q.includes('master') || q.includes('routine')) {
        return `The DiagnoLabs Comprehensive Full Body Health Package comprises 75+ vital parameters:\n\n1. Complete Blood Count (CBC - 24 parameters)\n2. Diabetes Screening (HbA1c & Fasting Glucose)\n3. Complete Lipid Profile (Cholesterol Fractions)\n4. Liver Function Test (LFT - 11 parameters)\n5. Kidney Function Test (KFT - Serum Creatinine & Uric Acid)\n6. Thyroid Profile (T3, T4, TSH)\n7. Vitamin D3 & Vitamin B12 Levels\n8. Urine Routine & Microscopy\n\nFasting Required: 10 to 12 hours overnight fasting.\n\n[RECOMMEND: Comprehensive Full Body Health Package][ACTION: BOOK: Comprehensive Full Body Health Package]`;
    }

    if (q.includes('fasting') || q.includes('empty stomach') || q.includes('prepare') || q.includes('diet') || q.includes('rules')) {
        return `Official Pre-Test Preparation & Fasting Guidelines:\n\n• Lipid Profile & Fasting Blood Sugar: 10 to 12 hours strict fasting. Only plain water is permitted.\n• Thyroid Profile (TSH): 8 hours fasting preferred. Take thyroid tablets after sample draw.\n• Full Body Health Packages: 10 to 12 hours overnight fasting.\n• CBC, Vitamin D, Vitamin B12: No strict fasting required; a light meal is permitted.\n\n[ACTION: CHECKOUT]`;
    }

    if (q.includes('report') || q.includes('result') || q.includes('download') || q.includes('pdf') || q.includes('view report') || q.includes('status')) {
        return `You can view and download all your digitally signed NABL diagnostic lab reports with secure QR verification in your patient dashboard.\n\n• Reports are available immediately upon Pathologist clinical verification.\n• Each report contains a tamper-proof cryptographic QR code for instant authenticity verification.\n\n[ACTION: REPORT_ANALYZED]`;
    }

    if (q.includes('book') || q.includes('appointment') || q.includes('schedule') || q.includes('home collection')) {
        return `You can schedule home sample collection across all verified NABL labs in your area with zero collection fee.\n\nPopular Diagnostic Packages:\n• Complete Blood Count (CBC) — ₹299\n• HbA1c Diabetes Screen — ₹450\n• Comprehensive Full Body Package — ₹1,499\n\n[ACTION: CHECKOUT]`;
    }

    return `Hello. I am the DiagnoLabs clinical assistant.\n\nHow can I help you today?\n• Explore diagnostic tests & packages\n• Book an appointment for home sample collection\n• Check your verified digital lab report status\n• Ask any medical preparation or health question\n\n[RECOMMEND: Comprehensive Full Body Health Package][ACTION: BOOK: Comprehensive Full Body Health Package]`;
};

// ─────────────────────────────────────────────────────────────
// Main Clean White DiagnoLabs ChatBot Component
// ─────────────────────────────────────────────────────────────
const ChatBot = () => {
    const navigate = useNavigate();
    const { isMobile } = useDevice();
    const { user } = useContext(AuthContext);

    const [messages, setMessages] = useState([]);
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
    const inputRef = useRef(null);
    const recognitionRef = useRef(null);
    const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

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

    // Voice Command Processor
    const processVoiceCommand = useCallback((rawText) => {
        const text = rawText.toLowerCase().trim();

        if (text.includes('open report') || text.includes('show report') || text.includes('view report') || text.includes('my report') || text.includes('check report')) {
            setVoiceFeedbackText('Opening your Lab Reports...');
            speak('Opening your digital lab reports.');
            setTimeout(() => navigate('/patient/history'), 1000);
            return true;
        }

        if (text.includes('open booking') || text.includes('my booking') || text.includes('book appointment') || text.includes('track sample')) {
            setVoiceFeedbackText('Opening Bookings...');
            speak('Navigating to your test bookings.');
            setTimeout(() => navigate('/patient/history'), 1000);
            return true;
        }

        if (text.includes('explore test') || text.includes('search test') || text.includes('all tests')) {
            setVoiceFeedbackText('Exploring diagnostic tests...');
            speak('Opening diagnostic tests directory.');
            setTimeout(() => navigate('/search'), 1000);
            return true;
        }

        if (text.startsWith('book ') || text.startsWith('schedule ')) {
            let testQuery = text.replace(/^book\s+/i, '').replace(/^schedule\s+/i, '').replace(/test/gi, '').trim();
            if (!testQuery) testQuery = 'Complete Blood Count';
            setVoiceFeedbackText(`Searching: ${testQuery}...`);
            speak(`Finding accredited labs for ${testQuery}.`);
            setTimeout(() => navigate(`/search?q=${encodeURIComponent(testQuery)}`), 1200);
            return true;
        }

        return false;
    }, [navigate, speak]);

    const handleSend = async (overrideText) => {
        const text = (overrideText || inputValue).trim();
        if (!text && !attachedFile) return;

        const displayText = attachedFile ? `Document: ${attachedFile.name}${text ? ` — ${text}` : ''}` : text;

        setMessages(prev => [...prev, { id: getUniqueId(), text: displayText, sender: 'user' }]);
        setInputValue('');
        setSpeechTranscript('');
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
                    context: `Patient: ${user?.name || 'User'}. Current Page: ${window.location.pathname}`,
                    userRole: 'patient',
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
                            systemInstruction: `You are the DiagnoLabs clinical assistant. Respond clearly, professionally, and concisely without emojis. Append [RECOMMEND: Exact Test Name] if suggesting tests. Append [ACTION: BOOK: Exact Test Name] or [ACTION: CHECKOUT] if instructing actions.`
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

            // Tier 3: Guaranteed Fallback
            if (!reply) {
                reply = generateClinicalFallback(text);
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
            const fallbackReply = generateClinicalFallback(text);
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

    const handleActionCardClick = (actionType) => {
        if (actionType === 'explore') {
            handleSend('Show me the popular diagnostic tests and health packages available.');
        } else if (actionType === 'book') {
            handleSend('How do I book an appointment for a home blood sample collection?');
        } else if (actionType === 'report') {
            handleSend('How can I check and download my lab report status?');
        } else if (actionType === 'ask') {
            inputRef.current?.focus();
        }
    };

    const handleReset = () => {
        stopSpeaking();
        setMessages([]);
        setVoiceFeedbackText('');
    };

    const renderText = (text) => {
        const noEmojiText = (text || '').replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '');
        const parts = noEmojiText.split(/\*\*(.*?)\*\*/g);
        return parts.map((part, i) =>
            i % 2 === 1
                ? <strong key={i} className="font-bold text-slate-900">{part}</strong>
                : part.split('\n').map((line, j, arr) =>
                    j < arr.length - 1 ? [line, <br key={`${i}-${j}`} />] : line
                )
        );
    };

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(o => !o)}
                aria-label="Open DiagnoLabs Assistant"
                className="fixed bottom-6 right-6 z-[1500] w-[60px] h-[60px] rounded-full flex items-center justify-center text-white cursor-pointer shadow-[0_10px_30px_rgba(10,30,70,0.25)] bg-[#0a1e46] border-2 border-white"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <ChevronDown size={24} className="text-white" />
                        </motion.div>
                    ) : (
                        <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <MessageSquare size={24} className="text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Chat Panel - Exact Replica of User Mockup */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.96 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        className="fixed bottom-24 right-6 z-[1500] flex flex-col bg-white rounded-[24px] border border-slate-200/90 shadow-[0_20px_60px_rgba(10,30,70,0.12)] overflow-hidden"
                        style={{
                            width: isMobile ? 'calc(100vw - 2rem)' : '390px',
                            height: isMobile ? '80vh' : '540px',
                            maxHeight: isMobile ? '600px' : '580px'
                        }}
                    >
                        {/* Header: Logo, Title, Subtitle, Online Status, Close */}
                        <div className="px-5 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3">
                                {/* Hexagon ECG Logo Icon */}
                                <div className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center shadow-sm">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z" stroke="#0a1e46" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M7 12H9.5L11 9L13 15L14.5 12H17" stroke="#d4af37" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-[0.98rem] font-extrabold text-[#0a1e46] tracking-tight leading-tight">
                                        DiagnoLabs
                                    </div>
                                    <div className="text-[0.62rem] font-bold text-[#b58b22] tracking-widest uppercase">
                                        CLINICAL DISCOVERY
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 text-[0.78rem] font-semibold text-slate-500">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                                    <span>Online</span>
                                </div>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 transition p-1 cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Voice Feedback Strip if speaking/listening */}
                        {(isListening || isSpeaking || voiceFeedbackText) && (
                            <div className="px-4 py-1.5 bg-sky-50 text-[0.72rem] text-sky-800 border-b border-sky-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {isListening && <Radio size={13} className="text-red-500 animate-pulse" />}
                                    {isSpeaking && <Volume2 size={13} className="text-sky-600 animate-bounce" />}
                                    <span className="font-semibold">{voiceFeedbackText || (isListening ? 'Listening...' : 'Speaking reply...')}</span>
                                </div>
                                {isSpeaking && (
                                    <button onClick={stopSpeaking} className="text-[0.65rem] font-bold text-sky-700 underline">Stop</button>
                                )}
                            </div>
                        )}

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-5 bg-white flex flex-col gap-4 scroll-smooth">
                            {/* If no chat messages, show the exact 4 Action Cards UI */}
                            {messages.length === 0 ? (
                                <div className="flex flex-col gap-4">
                                    {/* Greeting Text */}
                                    <div className="pt-1">
                                        <h3 className="text-[1.12rem] font-bold text-[#0f2444] tracking-tight mb-1">
                                            Hello! I'm the DiagnoLabs assistant.
                                        </h3>
                                        <p className="text-[0.86rem] text-slate-500 font-medium">
                                            How can I help you today?
                                        </p>
                                    </div>

                                    {/* 4 Action Cards with Border and Right Arrow */}
                                    <div className="flex flex-col gap-2.5">
                                        {/* Card 1: Explore diagnostic tests */}
                                        <button
                                            onClick={() => handleActionCardClick('explore')}
                                            className="w-full px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-2xl flex items-center justify-between text-left transition-all group shadow-sm cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FlaskConical size={19} className="text-[#0a1e46]" />
                                                <span className="text-[0.88rem] font-semibold text-[#0a1e46]">
                                                    Explore diagnostic tests
                                                </span>
                                            </div>
                                            <ArrowRight size={16} className="text-slate-400 group-hover:text-[#0a1e46] group-hover:translate-x-0.5 transition-all" />
                                        </button>

                                        {/* Card 2: Book an appointment */}
                                        <button
                                            onClick={() => handleActionCardClick('book')}
                                            className="w-full px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-2xl flex items-center justify-between text-left transition-all group shadow-sm cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Calendar size={19} className="text-[#0a1e46]" />
                                                <span className="text-[0.88rem] font-semibold text-[#0a1e46]">
                                                    Book an appointment
                                                </span>
                                            </div>
                                            <ArrowRight size={16} className="text-slate-400 group-hover:text-[#0a1e46] group-hover:translate-x-0.5 transition-all" />
                                        </button>

                                        {/* Card 3: Check report status */}
                                        <button
                                            onClick={() => handleActionCardClick('report')}
                                            className="w-full px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-2xl flex items-center justify-between text-left transition-all group shadow-sm cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText size={19} className="text-[#0a1e46]" />
                                                <span className="text-[0.88rem] font-semibold text-[#0a1e46]">
                                                    Check report status
                                                </span>
                                            </div>
                                            <ArrowRight size={16} className="text-slate-400 group-hover:text-[#0a1e46] group-hover:translate-x-0.5 transition-all" />
                                        </button>

                                        {/* Card 4: Ask a question */}
                                        <button
                                            onClick={() => handleActionCardClick('ask')}
                                            className="w-full px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-2xl flex items-center justify-between text-left transition-all group shadow-sm cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <HelpCircle size={19} className="text-[#0a1e46]" />
                                                <span className="text-[0.88rem] font-semibold text-[#0a1e46]">
                                                    Ask a question
                                                </span>
                                            </div>
                                            <ArrowRight size={16} className="text-slate-400 group-hover:text-[#0a1e46] group-hover:translate-x-0.5 transition-all" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Active Chat Messages */
                                <div className="flex flex-col gap-3">
                                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                        <span className="text-[0.74rem] font-bold text-slate-400 uppercase tracking-wider">Conversation</span>
                                        <button onClick={handleReset} className="text-[0.72rem] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer">
                                            <RefreshCw size={12} /> Reset
                                        </button>
                                    </div>

                                    {messages.map(msg => (
                                        <div
                                            key={msg.id}
                                            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[92%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}
                                        >
                                            <div
                                                className={`px-4 py-2.5 text-[0.86rem] leading-relaxed font-medium ${
                                                    msg.sender === 'user'
                                                        ? 'rounded-2xl rounded-br-sm bg-[#0a1e46] text-white'
                                                        : 'rounded-2xl rounded-bl-sm bg-slate-50 border border-slate-200 text-slate-800'
                                                }`}
                                            >
                                                {renderText(msg.text)}
                                            </div>

                                            {/* Test Recommendations */}
                                            {msg.recommendations?.length > 0 && (
                                                <div className="w-full mt-2 flex flex-col gap-1.5">
                                                    {msg.recommendations.map((testName, idx) => (
                                                        <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                                <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                                                                    {testIcon(testName)}
                                                                </div>
                                                                <span className="text-[0.8rem] font-bold text-[#0a1e46] truncate">{testName}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleBook(testName)}
                                                                className="px-2.5 py-1 bg-[#0a1e46] text-white rounded-lg text-[0.72rem] font-bold flex items-center gap-1 cursor-pointer flex-shrink-0"
                                                            >
                                                                Book <ArrowRight size={11} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Action Banner */}
                                            {msg.action && !msg.action.startsWith('BOOK:') && (
                                                <div className="w-full mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                                                    <span className="text-[0.74rem] font-bold text-emerald-800">
                                                        {msg.action === 'CHECKOUT' ? 'Proceed to Checkout' : 'View Reports'}
                                                    </span>
                                                    <button onClick={() => handleAction(msg.action)} className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[0.7rem] font-bold">Go</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {isLoading && (
                                        <div className="self-start px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                                            <Loader2 size={14} className="animate-spin text-[#0a1e46]" />
                                            <span className="text-[0.76rem] font-medium text-slate-500">Assistant is typing...</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Bar - Exact Pill Container Design */}
                        <div className="p-3.5 bg-white border-t border-slate-100 flex-shrink-0">
                            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:border-slate-300 focus-within:border-[#0a1e46] transition-all shadow-sm">
                                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept="image/*,.pdf" />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Attach document"
                                    className="text-slate-400 hover:text-slate-600 transition p-1 cursor-pointer flex-shrink-0"
                                >
                                    <Paperclip size={18} />
                                </button>

                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder={isListening ? 'Listening...' : 'Type your message...'}
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                    className="flex-1 bg-transparent border-none outline-none text-[0.88rem] text-slate-800 placeholder:text-slate-400"
                                />

                                {/* Mic Button */}
                                <button
                                    onClick={toggleListening}
                                    title="Voice Input"
                                    className={`p-1.5 rounded-full transition cursor-pointer flex-shrink-0 ${
                                        isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    <Mic size={18} />
                                </button>

                                {/* Solid Navy Circular Send Button */}
                                <button
                                    onClick={() => handleSend()}
                                    disabled={isLoading}
                                    className="w-8 h-8 rounded-full bg-[#0a1e46] hover:bg-[#071530] text-white flex items-center justify-center transition shadow-sm cursor-pointer flex-shrink-0 disabled:opacity-50"
                                >
                                    <Send size={14} className="translate-x-[1px]" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatBot;
