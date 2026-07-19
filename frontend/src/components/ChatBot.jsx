import { useState, useRef, useEffect, useCallback } from 'react';
import {
    MessageSquare, Send, Bot, Sparkles, ChevronDown, RefreshCw,
    Mic, MicOff, Paperclip, FileText, X, Loader2, FlaskConical,
    Droplets, Thermometer, Zap, HeartPulse, ShieldCheck, ArrowRight,
    Volume2, VolumeX, CheckCircle2, AlertCircle, Pill, Activity,
    ClipboardList, CreditCard, BookOpen
} from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

let msgIdCounter = 0;
const getUniqueId = (offset = 0) => {
    msgIdCounter += 1;
    return Date.now() + msgIdCounter + offset;
};

/** Strip all control tokens before speaking / displaying clean text */
const cleanText = (text) =>
    text
        .replace(/\[RECOMMEND:[^\]]+\]/gi, '')
        .replace(/\[ACTION:[^\]]+\]/gi, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')   // remove bold markdown for TTS
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/#{1,6}\s/g, '')
        .trim();

/** Parse every [RECOMMEND: X] token → array of test names */
const parseRecommendations = (text) => {
    const matches = [...text.matchAll(/\[RECOMMEND:\s*([^\]]+)\]/gi)];
    return matches.map(m => m[1].trim());
};

/** Parse the first [ACTION: X] token */
const parseAction = (text) => {
    const match = text.match(/\[ACTION:\s*([^\]]+)\]/i);
    return match ? match[1].trim() : null;
};

/** Icon per test name */
const testIcon = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('blood') || n.includes('cbc') || n.includes('haemoglobin')) return <Droplets size={18} className="text-rose-500" />;
    if (n.includes('sugar') || n.includes('hba1c') || n.includes('diabetes') || n.includes('glucose')) return <Thermometer size={18} className="text-orange-500" />;
    if (n.includes('thyroid')) return <Zap size={18} className="text-yellow-600" />;
    if (n.includes('heart') || n.includes('cardiac') || n.includes('ecg') || n.includes('lipid')) return <HeartPulse size={18} className="text-red-600" />;
    if (n.includes('liver') || n.includes('kidney') || n.includes('urine') || n.includes('renal')) return <ShieldCheck size={18} className="text-emerald-600" />;
    if (n.includes('vitamin') || n.includes('b12') || n.includes('iron')) return <Pill size={18} className="text-violet-500" />;
    if (n.includes('full') || n.includes('body') || n.includes('checkup')) return <Activity size={18} className="text-blue-500" />;
    return <FlaskConical size={18} className="text-primary" />;
};

// ─────────────────────────────────────────────────────────────
// Quick-prompt chips shown at the bottom
// ─────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
    { label: '🤒 I have fever', text: 'I have been having high fever for 2 days, what tests do I need?' },
    { label: '🩸 Diabetes check', text: 'I want to check my blood sugar and HbA1c levels.' },
    { label: '🧪 Full body checkup', text: 'Tell me about full body health checkup tests available.' },
    { label: '💊 Medicine query', text: 'I am taking metformin, can you tell me about it?' },
    { label: '📋 Book a test', text: 'I want to book a Complete Blood Count test.' },
    { label: '📄 My reports', text: 'I want to view my lab reports and booking status.' },
];

// ─────────────────────────────────────────────────────────────
// Sub-component: Recommendation Card(s)
// ─────────────────────────────────────────────────────────────
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
                justifyContent: 'space-between',
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
                        background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
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

// ─────────────────────────────────────────────────────────────
// Sub-component: Action Banner
// ─────────────────────────────────────────────────────────────
const ActionBanner = ({ action, onAction }) => {
    const configs = {
        CHECKOUT: { icon: <CreditCard size={16} />, label: 'Proceed to Checkout', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
        PREP_DONE: { icon: <ClipboardList size={16} />, label: 'View My Bookings', color: '#9333ea', bg: '#faf5ff', border: '#e9d5ff' },
        REPORT_ANALYZED: { icon: <CheckCircle2 size={16} />, label: 'View All Reports', color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd' },
        MED_INFO: { icon: <BookOpen size={16} />, label: 'Learn More', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
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
// Main ChatBot Component
// ─────────────────────────────────────────────────────────────
const ChatBot = () => {
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const [isMuted, setIsMuted] = useState(false);   // TTS toggle
    const [isListening, setIsListening] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [attachedFile, setAttachedFile] = useState(null);
    const [showQuickPrompts, setShowQuickPrompts] = useState(true);

    const [messages, setMessages] = useState([
        {
            id: 1,
            text: `Hello! 👋 I'm the **DiagnoLabs Clinical AI**.\n\nI can help you with:\n• 🤒 Symptoms → Test recommendations\n• 📅 Booking diagnostic tests\n• 🧪 Analysing your lab reports\n• 💊 Medicine guidance\n• 📋 Pre-test preparation tips\n\nDescribe your symptoms or choose a quick option below!`,
            sender: 'bot',
            recommendations: [],
            action: null
        }
    ]);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Stop speech when chat closes
    useEffect(() => {
        if (!isOpen) synthRef.current?.cancel();
    }, [isOpen]);

    // ── Speech Recognition setup ──────────────────────────────
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-IN';   // Indian English accent
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
            synthRef.current?.cancel();  // stop any speaking before listening
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    // ── Text-to-Speech ─────────────────────────────────────────
    const speak = useCallback((text) => {
        if (isMuted || !synthRef.current) return;
        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText(text));
        utterance.lang = 'en-IN';
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        // Prefer a female Indian English voice if available
        const voices = synthRef.current.getVoices();
        const preferred = voices.find(v => v.lang === 'en-IN') ||
            voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) ||
            voices.find(v => v.lang.startsWith('en'));
        if (preferred) utterance.voice = preferred;
        synthRef.current.speak(utterance);
    }, [isMuted]);

    // ── File Upload ────────────────────────────────────────────
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

    // ── Book action ────────────────────────────────────────────
    const handleBook = (testName) => {
        navigate(`/search?q=${encodeURIComponent(testName)}`);
    };

    // ── Action banner handler ──────────────────────────────────
    const handleAction = (action) => {
        if (action === 'CHECKOUT') navigate('/checkout');
        else if (action === 'PREP_DONE') navigate('/patient/dashboard');
        else if (action === 'REPORT_ANALYZED') navigate('/patient/dashboard');
        else if (action === 'MED_INFO') navigate('/search');
    };

    // ── Determine app context to inject into prompt ────────────
    const buildContext = () => {
        const path = window.location.pathname;
        if (path.includes('checkout')) return 'User is currently on the Checkout / Payment page.';
        if (path.includes('patient/dashboard')) return 'User is on their Patient Dashboard viewing bookings and reports.';
        if (path.includes('lab/')) return 'User is viewing a Lab detail page.';
        if (path.includes('search')) return 'User is on the Search Results page browsing diagnostic tests.';
        return null;
    };

    // ── Send message ───────────────────────────────────────────
    const handleSend = async (overrideText) => {
        const text = (overrideText || inputValue).trim();
        if (!text && !attachedFile) return;

        const displayText = attachedFile ? `📎 ${attachedFile.name}${text ? ` — ${text}` : ''}` : text;

        setMessages(prev => [...prev, { id: getUniqueId(), text: displayText, sender: 'user' }]);
        setInputValue('');
        setShowQuickPrompts(false);
        setIsLoading(true);
        synthRef.current?.cancel();

        try {
            const chatHistory = messages
                .filter(m => !m.isError)
                .slice(-8)
                .map(m => ({
                    role: m.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: m.text }]
                }));

            const token = localStorage.getItem('token');
            const payload = {
                prompt: text,
                history: chatHistory,
                context: buildContext(),
                ...(attachedFile && {
                    fileData: attachedFile.data,
                    fileType: attachedFile.mimeType
                })
            };

            const res = await axios.post(`${API_BASE_URL}/api/chat`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const reply = res.data.reply || '';
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

            // Auto-navigate for BOOK actions after a brief delay
            if (action && action.startsWith('BOOK:')) {
                const testName = action.replace('BOOK:', '').trim();
                setTimeout(() => navigate(`/search?q=${encodeURIComponent(testName)}`), 2000);
            }

        } catch (err) {
            const errMsg = err.response?.data?.details || 'Unable to reach the clinical AI. Please try again.';
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
        synthRef.current?.cancel();
        setMessages([{
            id: Date.now(),
            text: `Conversation reset. How can I help you today? 😊`,
            sender: 'bot',
            recommendations: [],
            action: null
        }]);
        setShowQuickPrompts(true);
    };

    // ── Render message content (supports basic markdown bold) ──
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

    // ─────────────────────────────────────────────────────────────
    // JSX
    // ─────────────────────────────────────────────────────────────
    return (
        <>
            {/* FAB Button */}
            <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(o => !o)}
                aria-label="Open Clinical AI Chat"
                style={{
                    position: 'fixed', bottom: '2rem', right: '2rem',
                    width: '64px', height: '64px', borderRadius: '22px',
                    background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                    color: 'white', border: '2px solid rgba(255,255,255,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 15px 35px -5px rgba(37,99,235,0.45)',
                    cursor: 'pointer', zIndex: 2000
                }}
            >
                <AnimatePresence mode="wait">
                    {isOpen
                        ? <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><ChevronDown size={30} /></motion.div>
                        : <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageSquare size={30} /></motion.div>
                    }
                </AnimatePresence>
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 80, scale: 0.92, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 80, scale: 0.92, filter: 'blur(8px)' }}
                        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                        style={{
                            position: 'fixed', bottom: '7.5rem', right: '2rem',
                            width: '430px', height: '680px',
                            background: 'rgba(255,255,255,0.98)',
                            backdropFilter: 'blur(24px)',
                            borderRadius: '32px',
                            boxShadow: '0 40px 80px -15px rgba(15,23,42,0.22)',
                            display: 'flex', flexDirection: 'column', overflow: 'hidden',
                            zIndex: 2000, border: '1px solid rgba(226,232,240,0.8)'
                        }}
                    >
                        {/* ── Header ── */}
                        <div style={{ padding: '1.25rem 1.5rem', background: '#0f172a', color: 'white', flexShrink: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                    <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: 'rgba(56,189,248,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Sparkles size={22} style={{ color: '#38bdf8' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            Clinical AI
                                            <span style={{ width: '7px', height: '7px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }} />
                                        </div>
                                        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            DiagnoLabs · Gemini Powered
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                                    {/* Mute / Unmute TTS */}
                                    <motion.button
                                        whileTap={{ scale: 0.85 }}
                                        onClick={() => { setIsMuted(m => !m); synthRef.current?.cancel(); }}
                                        title={isMuted ? 'Unmute voice' : 'Mute voice'}
                                        style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: isMuted ? 'rgba(255,255,255,0.3)' : '#38bdf8', cursor: 'pointer', borderRadius: '8px', padding: '0.4rem', display: 'flex' }}
                                    >
                                        {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                                    </motion.button>
                                    {/* Reset */}
                                    <motion.button
                                        whileTap={{ scale: 0.85 }}
                                        onClick={handleReset}
                                        title="Reset conversation"
                                        style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', borderRadius: '8px', padding: '0.4rem', display: 'flex' }}
                                    >
                                        <RefreshCw size={17} />
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        {/* ── Messages ── */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {messages.map(msg => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}
                                >
                                    {/* Bubble */}
                                    <div style={{
                                        padding: '0.9rem 1.1rem',
                                        borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                        background: msg.sender === 'user'
                                            ? 'linear-gradient(135deg,#2563eb,#0ea5e9)'
                                            : (msg.isError ? '#fff1f2' : 'white'),
                                        color: msg.sender === 'user' ? 'white' : '#1e293b',
                                        boxShadow: msg.sender === 'user'
                                            ? '0 8px 20px -5px rgba(37,99,235,0.35)'
                                            : '0 3px 8px rgba(0,0,0,0.06)',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        lineHeight: '1.65',
                                        border: msg.sender === 'bot' ? (msg.isError ? '1px solid #fda4af' : '1px solid #e2e8f0') : 'none'
                                    }}>
                                        {renderText(msg.text)}
                                    </div>

                                    {/* Recommendation Cards */}
                                    {msg.recommendations?.length > 0 && (
                                        <RecommendationCards tests={msg.recommendations} onBook={handleBook} />
                                    )}

                                    {/* Action Banner */}
                                    {msg.action && !msg.action.startsWith('BOOK:') && (
                                        <ActionBanner action={msg.action} onAction={handleAction} />
                                    )}
                                </motion.div>
                            ))}

                            {/* Loading */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{ alignSelf: 'flex-start' }}
                                >
                                    <div style={{ padding: '0.75rem 1.25rem', borderRadius: '16px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <Loader2 size={15} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
                                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b' }}>Clinical AI thinking...</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* Quick Prompts */}
                            <AnimatePresence>
                                {showQuickPrompts && !isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}
                                    >
                                        {QUICK_PROMPTS.map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSend(q.text)}
                                                style={{
                                                    padding: '0.35rem 0.75rem',
                                                    background: 'white',
                                                    border: '1px solid #cbd5e1',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    color: '#334155',
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

                        {/* ── Input Area ── */}
                        <div style={{ padding: '1rem 1.25rem', background: 'white', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
                            {/* Attached file pill */}
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

                            {/* Input Row */}
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.45rem 0.6rem', background: '#f8fafc', borderRadius: '18px', border: '1.5px solid #e2e8f0' }}>
                                {/* File attach */}
                                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept="image/*,.pdf" />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Attach prescription or report"
                                    style={{ width: '36px', height: '36px', borderRadius: '12px', background: attachedFile ? '#dbeafe' : 'transparent', border: 'none', cursor: 'pointer', color: attachedFile ? '#2563eb' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                >
                                    <Paperclip size={18} />
                                </button>

                                {/* Text input */}
                                <input
                                    type="text"
                                    placeholder={isListening ? '🎙️ Listening...' : 'Type symptoms or ask anything...'}
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                    style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '0.9rem', fontWeight: '500', color: '#0f172a', outline: 'none', padding: '0.1rem 0' }}
                                />

                                {/* Mic button */}
                                <motion.button
                                    whileTap={{ scale: 0.85 }}
                                    onClick={toggleListening}
                                    title={isListening ? 'Stop listening' : 'Voice input'}
                                    style={{ width: '36px', height: '36px', borderRadius: '12px', background: isListening ? '#fee2e2' : 'transparent', border: 'none', cursor: 'pointer', color: isListening ? '#e11d48' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                >
                                    {isListening
                                        ? <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}><Mic size={18} /></motion.div>
                                        : <MicOff size={18} />
                                    }
                                </motion.button>

                                {/* Send button */}
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleSend()}
                                    disabled={isLoading}
                                    style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', color: 'white', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px -3px rgba(37,99,235,0.4)', flexShrink: 0, opacity: isLoading ? 0.6 : 1 }}
                                >
                                    <Send size={17} />
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
