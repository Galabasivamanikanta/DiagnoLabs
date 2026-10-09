import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Mic, MicOff, Volume2, VolumeX, Sparkles, ShieldCheck, CheckCircle2,
    Compass, FileText, Calendar, Search, HelpCircle, X, ArrowRight,
    Activity, ChevronRight, Zap, RefreshCw, Power, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

// Clean text for speech synthesis (strips emojis and markdown)
const cleanSpeechText = (text) =>
    (text || '')
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '')
        .replace(/\[.*?\]/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .trim();

export const GlobalVoiceAssistant = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, login, logout } = useContext(AuthContext);

    // Assistant Enabled / Permission States
    const [isEnabled, setIsEnabled] = useState(() => {
        return localStorage.getItem('diagnolabs_voice_assistant_enabled') === 'true';
    });
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [isMuted, setIsMuted] = useState(() => {
        return localStorage.getItem('diagnolabs_voice_assistant_muted') === 'true';
    });

    // Live Voice Recognition States
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [liveTranscript, setLiveTranscript] = useState('');
    const [lastActionText, setLastActionText] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    const recognitionRef = useRef(null);
    const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
    const restartTimerRef = useRef(null);
    const isManualStopRef = useRef(false);

    // Check if we are on standalone admin/employee dashboards where global voice assistant should be disabled
    const isStandaloneDashboard = [
        '/admin/dashboard',
        '/doctor/dashboard',
        '/nurse/dashboard',
        '/reception/dashboard',
        '/inventory/dashboard',
        '/finance/dashboard',
        '/marketing/dashboard',
        '/support/dashboard',
        '/delivery/dashboard',
        '/quality/dashboard',
        '/it/dashboard',
        '/partner/dashboard',
        '/collector/dashboard',
        '/employee/dashboard'
    ].some(path => location.pathname.startsWith(path));

    // Permission Prompt logic: when user logs in and hasn't set permission yet
    useEffect(() => {
        if (user && !isStandaloneDashboard) {
            const hasChosen = localStorage.getItem('diagnolabs_voice_assistant_enabled');
            const hasDismissedSession = sessionStorage.getItem('diagnolabs_voice_dismissed');
            if (hasChosen === null && !hasDismissedSession) {
                // Show permission dialog 1 second after login
                const timer = setTimeout(() => {
                    setShowPermissionModal(true);
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [user, isStandaloneDashboard]);

    // Speech Synthesis helper
    const speak = useCallback((text) => {
        if (isMuted || !synthRef.current || typeof window === 'undefined') return;
        synthRef.current.cancel();

        const cleaned = cleanSpeechText(text);
        if (!cleaned) return;

        const utterance = new SpeechSynthesisUtterance(cleaned);
        utterance.lang = 'en-IN';
        utterance.rate = 1.05;
        utterance.pitch = 1.0;

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

    // Command Dispatcher & Processor
    const processVoiceCommand = useCallback((rawTranscript) => {
        const text = (rawTranscript || '').toLowerCase().trim();
        if (!text) return;

        setIsProcessing(true);
        setLiveTranscript(rawTranscript);

        // Remove wake words if spoken
        const cmd = text
            .replace(/^(hey\s+)?(diagnolabs|diagno|assistant|bot)\s*/i, '')
            .trim();

        // 1. Navigation Commands
        if (cmd === 'go home' || cmd === 'home' || cmd === 'home page' || cmd === 'open home' || cmd === 'main page') {
            navigate('/');
            setLastActionText('Navigating to Home Page');
            speak('Navigating to Home page.');
            setIsProcessing(false);
            return;
        }

        if (
            cmd.includes('my report') || cmd.includes('show report') || cmd.includes('lab report') ||
            cmd.includes('download report') || cmd.includes('view report') || cmd.includes('test result') ||
            cmd.includes('reports')
        ) {
            navigate('/patient/history');
            setLastActionText('Opening Diagnostic Lab Reports');
            speak('Opening your verified diagnostic reports and booking history.');
            setIsProcessing(false);
            return;
        }

        if (cmd.includes('my profile') || cmd.includes('open profile') || cmd.includes('user profile') || cmd.includes('account details')) {
            navigate('/patient/profile');
            setLastActionText('Opening User Profile');
            speak('Opening your patient profile.');
            setIsProcessing(false);
            return;
        }

        if (cmd.includes('my booking') || cmd.includes('appointments') || cmd.includes('view booking') || cmd.includes('order history')) {
            navigate('/patient/history');
            setLastActionText('Opening Appointments & Bookings');
            speak('Opening your appointments and test booking history.');
            setIsProcessing(false);
            return;
        }

        if (cmd.includes('nearby lab') || cmd.includes('labs near me') || cmd.includes('find nearby') || cmd.includes('nearest lab')) {
            navigate('/nearby-search');
            setLastActionText('Finding Nearby Diagnostic Labs');
            speak('Searching for verified NABL diagnostic labs in your vicinity.');
            setIsProcessing(false);
            return;
        }

        if (cmd.includes('india lab') || cmd.includes('all labs') || cmd.includes('find lab in india') || cmd.includes('lab finder')) {
            navigate('/india-labs-finder');
            setLastActionText('Opening India Labs Finder');
            speak('Opening the all-India diagnostic labs finder.');
            setIsProcessing(false);
            return;
        }

        if (cmd.includes('book test') || cmd.includes('book appointment') || cmd.includes('schedule test') || cmd.includes('checkout') || cmd.includes('book now')) {
            navigate('/checkout');
            setLastActionText('Navigating to Checkout & Booking');
            speak('Opening the test booking and checkout portal.');
            setIsProcessing(false);
            return;
        }

        // 2. Dynamic Search Commands: "search for cbc", "find thyroid test", "search diabetes package"
        const searchMatch = cmd.match(/^(?:search(?:\s+for)?|find|look\s+for)\s+(.+)$/i);
        if (searchMatch && searchMatch[1]) {
            const query = searchMatch[1].replace(/test|package|panel/gi, '').trim();
            navigate(`/search?q=${encodeURIComponent(query || searchMatch[1])}`);
            setLastActionText(`Searching for: ${searchMatch[1]}`);
            speak(`Searching for ${searchMatch[1]} across accredited diagnostic labs.`);
            setIsProcessing(false);
            return;
        }

        // Direct test keyword match (e.g. "Complete blood count", "Thyroid test", "Lipid profile")
        const directTestKeywords = ['cbc', 'blood test', 'thyroid', 'diabetes', 'sugar test', 'lipid profile', 'vitamin d', 'urine test', 'liver function', 'kidney function', 'full body'];
        for (const kw of directTestKeywords) {
            if (cmd.includes(kw)) {
                navigate(`/search?q=${encodeURIComponent(kw)}`);
                setLastActionText(`Searching for: ${kw.toUpperCase()}`);
                speak(`Searching tests for ${kw}.`);
                setIsProcessing(false);
                return;
            }
        }

        // 3. ChatBot Controls
        if (cmd.includes('open chat') || cmd.includes('open chatbot') || cmd.includes('open assistant') || cmd.includes('talk to bot') || cmd === 'help me') {
            window.dispatchEvent(new CustomEvent('diagnolabs:open-chat'));
            setLastActionText('Opened Clinical AI ChatBot');
            speak('Opening DiagnoLabs clinical assistant.');
            setIsProcessing(false);
            return;
        }

        if (cmd.includes('close chat') || cmd.includes('close chatbot') || cmd.includes('hide chat') || cmd.includes('minimize chat')) {
            window.dispatchEvent(new CustomEvent('diagnolabs:close-chat'));
            setLastActionText('Closed Clinical AI ChatBot');
            speak('Minimized clinical assistant.');
            setIsProcessing(false);
            return;
        }

        // 4. Page Scrolling Controls
        if (cmd.includes('scroll down') || cmd.includes('page down')) {
            window.scrollBy({ top: 650, behavior: 'smooth' });
            setLastActionText('Scrolled Down');
            setIsProcessing(false);
            return;
        }

        if (cmd.includes('scroll up') || cmd.includes('page up')) {
            window.scrollBy({ top: -650, behavior: 'smooth' });
            setLastActionText('Scrolled Up');
            setIsProcessing(false);
            return;
        }

        if (cmd.includes('scroll to top') || cmd.includes('top of page') || cmd.includes('go to top')) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setLastActionText('Scrolled to Top');
            setIsProcessing(false);
            return;
        }

        if (cmd.includes('scroll to bottom') || cmd.includes('bottom of page')) {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            setLastActionText('Scrolled to Bottom');
            setIsProcessing(false);
            return;
        }

        // 5. Login Credentials Command (e.g. "login with email X and password Y" or "email X password Y")
        const normalizedCmd = cmd
            .replace(/\s+(at|@)\s+/gi, '@')
            .replace(/\s+(dot|\.)\s+/gi, '.')
            .replace(/\s+underscore\s+/gi, '_')
            .replace(/\s+dash\s+/gi, '-')
            .trim();
        const passMatch = normalizedCmd.match(/(?:login\s+with\s+)?(?:email|phone|user(?:\s+id)?)?\s*([^\s@]+@[^\s@]+|[0-9]{10}|DL-[^\s]+)\s+(?:password|pass|pin)\s+(?:is\s+)?(.+)/i);
        if (passMatch) {
            const id = passMatch[1].trim();
            const pwd = passMatch[2].replace(/\s+/g, '').trim();
            setLastActionText(`Logging in: ${id}...`);
            speak(`Credentials recognized for ${id}. Logging you in now.`);
            if (login) {
                login(id, pwd).then(res => {
                    if (res.success) {
                        speak(`Login successful. Welcome back, ${res.user.name || 'User'}!`);
                        setLastActionText(`Logged in as ${res.user.name || 'User'}`);
                    } else {
                        speak("Login failed. Please check your credentials.");
                        setLastActionText("Login failed: Invalid credentials");
                    }
                }).catch(() => {
                    speak("Login failed. Please check your credentials.");
                });
            }
            setIsProcessing(false);
            return;
        }

        // 6. Logout Command
        if (cmd === 'logout' || cmd === 'sign out' || cmd === 'log out') {
            if (logout) logout();
            navigate('/userlogin');
            setLastActionText('Logged Out Successfully');
            speak('You have been logged out securely.');
            setIsProcessing(false);
            return;
        }

        // 6. Voice Help & Cheatsheet
        if (cmd.includes('voice command') || cmd.includes('what can i say') || cmd === 'help' || cmd.includes('show commands')) {
            setShowHelpModal(true);
            setLastActionText('Opening Voice Command Guide');
            speak('Here are the available voice commands you can use across DiagnoLabs.');
            setIsProcessing(false);
            return;
        }

        // 7. Stop Assistant
        if (cmd.includes('stop listening') || cmd.includes('turn off voice') || cmd.includes('disable voice') || cmd.includes('stop assistant')) {
            handleDisableAssistant();
            setLastActionText('Voice Assistant Deactivated');
            speak('Voice assistant has been paused.');
            setIsProcessing(false);
            return;
        }

        // 8. Clinical Medical Symptoms / Inquiries Fallback -> Route to ChatBot with Query
        const medicalSymptoms = ['fever', 'chills', 'cough', 'dengue', 'malaria', 'typhoid', 'fasting', 'empty stomach', 'pain', 'jaundice', 'vomiting', 'weakness', 'fatigue', 'hba1c', 'cholesterol'];
        const hasSymptom = medicalSymptoms.some(s => cmd.includes(s));
        if (hasSymptom) {
            window.dispatchEvent(new CustomEvent('diagnolabs:open-chat', { detail: { query: rawTranscript } }));
            setLastActionText(`Clinical Query: ${rawTranscript}`);
            speak('Opening clinical triage assistant for your medical inquiry.');
            setIsProcessing(false);
            return;
        }

        // If unrecognized command, give subtle feedback
        setLastActionText(`Command heard: "${rawTranscript}"`);
        setIsProcessing(false);
    }, [navigate, speak, logout]);

    // Continuous Speech Recognition Engine Setup
    useEffect(() => {
        if (!isEnabled || isStandaloneDashboard) {
            if (recognitionRef.current) {
                try {
                    isManualStopRef.current = true;
                    recognitionRef.current.stop();
                } catch {
                    // Ignore error on stop
                }
            }
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('SpeechRecognition API not available in this browser.');
            return;
        }

        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-IN';

        rec.onstart = () => {
            setIsListening(true);
            isManualStopRef.current = false;
        };

        rec.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            const current = (finalTranscript || interimTranscript).trim();
            if (current) {
                setLiveTranscript(current);
            }

            if (finalTranscript.trim()) {
                processVoiceCommand(finalTranscript.trim());
            }
        };

        rec.onerror = (event) => {
            // Ignore benign 'no-speech' or 'aborted' errors in continuous mode
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                console.warn('Voice Assistant Speech recognition error:', event.error);
            }
        };

        rec.onend = () => {
            setIsListening(false);
            // If still enabled and not manually stopped, auto-restart continuous listening after 400ms
            if (isEnabled && !isManualStopRef.current && !isStandaloneDashboard) {
                if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
                restartTimerRef.current = setTimeout(() => {
                    try {
                        rec.start();
                    } catch {
                        // Ignore already started error
                    }
                }, 400);
            }
        };

        recognitionRef.current = rec;

        try {
            rec.start();
        } catch (err) {
            console.warn('Could not start continuous speech recognition:', err);
        }

        return () => {
            isManualStopRef.current = true;
            if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
            try {
                rec.stop();
            } catch {
                // Ignore stop error
            }
        };
    }, [isEnabled, isStandaloneDashboard, processVoiceCommand]);

    // Handle Enable from Permission Dialog
    const handleEnableAssistant = () => {
        localStorage.setItem('diagnolabs_voice_assistant_enabled', 'true');
        setIsEnabled(true);
        setShowPermissionModal(false);
        speak('DiagnoLabs hands-free voice assistant is now active. You can say commands like "Show my reports", "Search CBC test", or "Go home".');
    };

    // Handle Dismiss
    const handleDismissPermission = () => {
        sessionStorage.setItem('diagnolabs_voice_dismissed', 'true');
        setShowPermissionModal(false);
    };

    // Toggle Voice Assistant on/off
    const toggleAssistant = () => {
        if (isEnabled) {
            handleDisableAssistant();
        } else {
            handleEnableAssistant();
        }
    };

    const handleDisableAssistant = () => {
        isManualStopRef.current = true;
        localStorage.setItem('diagnolabs_voice_assistant_enabled', 'false');
        setIsEnabled(false);
        setIsListening(false);
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch {
                // Ignore
            }
        }
    };

    const toggleMute = (e) => {
        e.stopPropagation();
        const next = !isMuted;
        setIsMuted(next);
        localStorage.setItem('diagnolabs_voice_assistant_muted', String(next));
        if (next && synthRef.current) {
            synthRef.current.cancel();
        }
    };

    if (isStandaloneDashboard) {
        return null; // Don't render on admin / staff dashboards
    }

    return (
        <>
            {/* 1. INITIAL PERMISSION MODAL ON LOGIN */}
            <AnimatePresence>
                {showPermissionModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl border border-teal-100 max-w-md w-full overflow-hidden"
                        >
                            {/* Header Banner */}
                            <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-navy-900 p-6 text-white text-center relative">
                                <button
                                    onClick={handleDismissPermission}
                                    className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner ring-4 ring-white/20">
                                    <Mic size={32} className="text-teal-200 animate-pulse" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight">DiagnoLabs Voice Assistant</h3>
                                <p className="text-xs text-teal-100/90 mt-1">
                                    Automated Hands-Free Navigation & Voice Control
                                </p>
                            </div>

                            {/* Body Content */}
                            <div className="p-6 space-y-4">
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Would you like to enable the <strong>Hands-Free Voice Assistant</strong>? Even without opening the chatbot, you can navigate pages, search tests, check lab reports, and manage bookings using simple voice commands.
                                </p>

                                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-700">
                                    <div className="font-semibold text-teal-800 flex items-center gap-1.5 mb-1.5">
                                        <Sparkles size={14} className="text-teal-600" /> Example Voice Commands:
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                        <span>"Show my reports" or "Download report"</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                        <span>"Search for Complete Blood Count"</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                        <span>"Book a full body checkup"</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                        <span>"Find labs near me" or "Go home"</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                                    <span>Microphone is only used locally for voice command matching.</span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={handleDismissPermission}
                                        className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                                    >
                                        Maybe Later
                                    </button>
                                    <button
                                        onClick={handleEnableAssistant}
                                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold text-sm shadow-lg shadow-teal-600/25 hover:shadow-teal-600/40 hover:from-teal-500 hover:to-teal-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Mic size={16} /> Enable Voice
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 2. FLOATING VOICE ASSISTANT HUD / WIDGET */}
            <div className="fixed bottom-6 left-6 z-[9990] flex flex-col items-start gap-2 select-none">
                {/* Active Voice Pill HUD */}
                <AnimatePresence>
                    {isEnabled && (
                        <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                            className="bg-navy-900/95 text-white backdrop-blur-md rounded-2xl shadow-xl border border-teal-500/30 p-3 max-w-xs sm:max-w-sm flex flex-col gap-2 ring-1 ring-white/10"
                        >
                            {/* HUD Header */}
                            <div className="flex items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2.5 w-2.5">
                                        {isListening ? (
                                            <>
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                            </>
                                        ) : (
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                                        )}
                                    </span>
                                    <span className="font-bold tracking-wide text-teal-300">
                                        VOICE ASSISTANT
                                    </span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={toggleMute}
                                        title={isMuted ? "Unmute Voice Feedback" : "Mute Voice Feedback"}
                                        className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                                    >
                                        {isMuted ? <VolumeX size={14} className="text-rose-400" /> : <Volume2 size={14} className="text-teal-300" />}
                                    </button>
                                    <button
                                        onClick={() => setShowHelpModal(true)}
                                        title="Voice Commands Guide"
                                        className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                                    >
                                        <HelpCircle size={14} />
                                    </button>
                                    <button
                                        onClick={handleDisableAssistant}
                                        title="Disable Voice Assistant"
                                        className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition-colors"
                                    >
                                        <Power size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Soundwave animation when listening */}
                            {isListening && (
                                <div className="flex items-center justify-center gap-1 py-1 px-2 bg-white/5 rounded-lg">
                                    <span className="w-1 bg-teal-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3" />
                                    <span className="w-1 bg-teal-300 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-5" />
                                    <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-2" />
                                    <span className="w-1 bg-teal-200 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-6" />
                                    <span className="w-1 bg-teal-400 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-4" />
                                    <span className="w-1 bg-emerald-300 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-2" />
                                </div>
                            )}

                            {/* Live Transcript / Last Action display */}
                            <div className="text-[11px] leading-snug">
                                {liveTranscript ? (
                                    <p className="text-slate-200 italic line-clamp-2">
                                        "{liveTranscript}"
                                    </p>
                                ) : (
                                    <p className="text-slate-400">
                                        Listening for voice commands... (e.g. "Show reports", "Search CBC")
                                    </p>
                                )}
                                {lastActionText && (
                                    <div className="mt-1 flex items-center gap-1.5 text-emerald-400 font-semibold text-[10px] bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">
                                        <CheckCircle2 size={11} className="shrink-0" />
                                        <span className="truncate">{lastActionText}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating Microphone Trigger Pill (Toggle Button) */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleAssistant}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-lg border transition-all ${
                        isEnabled
                            ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white border-teal-400 shadow-teal-600/30'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:text-teal-700 shadow-slate-900/10'
                    }`}
                >
                    <div className={`p-1.5 rounded-full ${isEnabled ? 'bg-white/20 text-white animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
                        {isEnabled ? <Mic size={16} /> : <MicOff size={16} />}
                    </div>
                    <div className="text-left">
                        <div className="text-xs font-bold leading-none">
                            {isEnabled ? 'Voice Assistant ON' : 'Voice Assistant'}
                        </div>
                        <div className="text-[10px] opacity-80 leading-none mt-0.5">
                            {isEnabled ? 'Listening hands-free' : 'Click to enable'}
                        </div>
                    </div>
                </motion.button>
            </div>

            {/* 3. VOICE COMMAND HELP & CHEATSHEET MODAL */}
            <AnimatePresence>
                {showHelpModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            {/* Modal Header */}
                            <div className="bg-navy-900 p-5 text-white flex items-center justify-between border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30">
                                        <Sparkles size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base">DiagnoLabs Voice Commands</h3>
                                        <p className="text-xs text-slate-400">Speak naturally anywhere across the portal</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowHelpModal(false)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Modal Commands List */}
                            <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700">
                                {/* Category 1: Navigation */}
                                <div>
                                    <h4 className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Compass size={14} /> Navigation & Pages
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="font-semibold text-navy-900 block">"Go home" / "Home page"</span>
                                            <span className="text-slate-500">Navigates to main homepage</span>
                                        </div>
                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="font-semibold text-navy-900 block">"Show my reports"</span>
                                            <span className="text-slate-500">Opens diagnostic test reports</span>
                                        </div>
                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="font-semibold text-navy-900 block">"My profile"</span>
                                            <span className="text-slate-500">Opens patient profile</span>
                                        </div>
                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="font-semibold text-navy-900 block">"Find labs near me"</span>
                                            <span className="text-slate-500">Opens nearby lab locator</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Category 2: Search Tests */}
                                <div>
                                    <h4 className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Search size={14} /> Diagnostic Test Search
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="font-semibold text-navy-900 block">"Search Complete Blood Count"</span>
                                            <span className="text-slate-500">Finds CBC lab tests</span>
                                        </div>
                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="font-semibold text-navy-900 block">"Search for Diabetes test"</span>
                                            <span className="text-slate-500">Finds HbA1c & sugar packages</span>
                                        </div>
                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="font-semibold text-navy-900 block">"Book full body checkup"</span>
                                            <span className="text-slate-500">Starts booking flow</span>
                                        </div>
                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="font-semibold text-navy-900 block">"Search Thyroid package"</span>
                                            <span className="text-slate-500">Screens for T3, T4, TSH</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Category 3: Assistant & Chat */}
                                <div>
                                    <h4 className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Activity size={14} /> Chat & Page Controls
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="font-semibold text-navy-900 block">"Open chatbot"</span>
                                            <span className="text-slate-500">Opens clinical AI assistant</span>
                                        </div>
                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="font-semibold text-navy-900 block">"Scroll down" / "Scroll up"</span>
                                            <span className="text-slate-500">Smooth page navigation</span>
                                        </div>
                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="font-semibold text-navy-900 block">"Logout"</span>
                                            <span className="text-slate-500">Signs out securely</span>
                                        </div>
                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="font-semibold text-navy-900 block">"Stop listening"</span>
                                            <span className="text-slate-500">Pauses voice assistant</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
                                <button
                                    onClick={() => setShowHelpModal(false)}
                                    className="py-2.5 px-5 bg-navy-900 text-white text-xs font-semibold rounded-xl hover:bg-navy-800 transition-colors"
                                >
                                    Got It
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default GlobalVoiceAssistant;
