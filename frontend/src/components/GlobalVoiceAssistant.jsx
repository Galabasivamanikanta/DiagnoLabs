import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Mic, MicOff, Volume2, VolumeX, Sparkles, ShieldCheck, CheckCircle2,
    Compass, FileText, Calendar, Search, HelpCircle, X, ArrowRight,
    Activity, ChevronRight, Zap, RefreshCw, Power, AlertCircle, Play,
    MapPin, LocateFixed
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

// Subtle audio confirmation chime using Web Audio API
const playChime = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    } catch {
        // Ignore audio context error
    }
};

// Interactive In-Page DOM Click Action Dispatcher
const executeDOMAction = (actionType) => {
    // 1. Download Report
    if (actionType === 'download') {
        const downloadBtns = document.querySelectorAll('button, a');
        for (const btn of downloadBtns) {
            const txt = (btn.innerText || btn.getAttribute('aria-label') || '').toLowerCase();
            if (txt.includes('download') || txt.includes('view report') || txt.includes('pdf')) {
                btn.click();
                return true;
            }
        }
    }

    // 2. Book Now / Checkout CTA
    if (actionType === 'book') {
        const bookBtns = document.querySelectorAll('button, a');
        for (const btn of bookBtns) {
            const txt = (btn.innerText || btn.getAttribute('aria-label') || '').toLowerCase();
            if (txt.includes('book now') || txt.includes('book appointment') || txt.includes('proceed to checkout') || txt.includes('checkout') || txt.includes('pay now')) {
                btn.click();
                return true;
            }
        }
    }

    // 3. Payment submit button
    if (actionType === 'pay') {
        const payBtns = document.querySelectorAll('button, input[type="submit"]');
        for (const btn of payBtns) {
            const txt = (btn.innerText || btn.value || '').toLowerCase();
            if (txt.includes('pay') || txt.includes('confirm') || txt.includes('proceed') || txt.includes('place order')) {
                btn.click();
                return true;
            }
        }
    }

    return false;
};

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
    const [showLocationPromptModal, setShowLocationPromptModal] = useState(false);
    const [detectedSymptomInfo, setDetectedSymptomInfo] = useState(null);
    const [helpTab, setHelpTab] = useState('english'); // 'english', 'telugu', 'hindi'
    const [isMuted, setIsMuted] = useState(() => {
        return localStorage.getItem('diagnolabs_voice_assistant_muted') === 'true';
    });

    // Live Voice Recognition States
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [liveTranscript, setLiveTranscript] = useState('');
    const [lastActionText, setLastActionText] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);

    const recognitionRef = useRef(null);
    const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
    const restartTimerRef = useRef(null);
    const isManualStopRef = useRef(false);

    // Check if we are on standalone admin/employee dashboards
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

    // Turn ON Location Handler (Voice & Click)
    const turnOnLocation = useCallback(() => {
        if (!navigator.geolocation) {
            speak("Geolocation is not supported in this browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                localStorage.setItem('diagnolabs_location_enabled', 'true');
                localStorage.setItem('diagnolabs_user_lat', lat.toString());
                localStorage.setItem('diagnolabs_user_lng', lng.toString());
                window.dispatchEvent(new CustomEvent('diagnolabs:location-updated', {
                    detail: { enabled: true, lat, lng }
                }));
                setShowLocationPromptModal(false);
                setLastActionText('📍 GPS Location: Active');
                speak('Location turned on. Locating nearest certified diagnostic labs for your coordinates.');
            },
            (err) => {
                console.warn("Location error:", err);
                speak("Location access was denied in browser permissions. Showing all accredited labs.");
                setShowLocationPromptModal(false);
            }
        );
    }, [speak]);

    // Turn OFF Location Handler (Voice & Click)
    const turnOffLocation = useCallback(() => {
        localStorage.setItem('diagnolabs_location_enabled', 'false');
        localStorage.removeItem('diagnolabs_user_lat');
        localStorage.removeItem('diagnolabs_user_lng');
        window.dispatchEvent(new CustomEvent('diagnolabs:location-updated', {
            detail: { enabled: false }
        }));
        setShowLocationPromptModal(false);
        setLastActionText('Location Turned OFF');
        speak('Location turned off. Displaying all diagnostic labs.');
    }, [speak]);

    // Advanced Multilingual Command Dispatcher & Processor
    const processVoiceCommand = useCallback((rawTranscript) => {
        const text = (rawTranscript || '').toLowerCase().trim();
        if (!text) return;

        playChime();
        setIsProcessing(true);
        setLiveTranscript(rawTranscript);

        // Clean wake words
        const cmd = text
            .replace(/^(hey\s+|hi\s+|namaste\s+)?(diagnolabs|diagno|assistant|bot)\s*/i, '')
            .trim();

        // ─────────────────────────────────────────────────────────────
        // 0. LOCATION ON / OFF VOICE CONTROLS
        // ─────────────────────────────────────────────────────────────
        if (
            cmd === 'turn on location' || cmd === 'on location' || cmd === 'location on' ||
            cmd === 'enable location' || cmd.includes('location on cheyi') || cmd.includes('location chalu karo') ||
            cmd.includes('location open cheyi') || cmd.includes('turn location on') ||
            (showLocationPromptModal && (
                cmd === 'yes' || cmd === 'haan' || cmd === 'ha' || cmd === 'sare' || cmd === 'yeah' ||
                cmd === 'okay' || cmd.includes('on cheyi') || cmd.includes('yes please') || cmd.includes('enable')
            ))
        ) {
            turnOnLocation();
            setIsProcessing(false);
            return;
        }

        if (
            cmd === 'turn off location' || cmd === 'off location' || cmd === 'location off' ||
            cmd === 'disable location' || cmd.includes('location off cheyi') || cmd.includes('location band karo') ||
            cmd.includes('location aapeyi') || cmd.includes('turn location off') ||
            (showLocationPromptModal && (
                cmd === 'no' || cmd === 'nah' || cmd === 'cancel' || cmd === 'vaddhu' || cmd === 'nahi' ||
                cmd.includes('off cheyi') || cmd === 'no thanks' || cmd.includes('disable')
            ))
        ) {
            turnOffLocation();
            setIsProcessing(false);
            return;
        }

        // ─────────────────────────────────────────────────────────────
        // 1. IN-PAGE DOM INTERACTIVE ACTIONS
        // ─────────────────────────────────────────────────────────────
        if (cmd.includes('click download') || cmd.includes('download pdf') || cmd.includes('download report') || cmd.includes('report download cheyi')) {
            const executed = executeDOMAction('download');
            if (executed) {
                setLastActionText('Clicked Download Report');
                speak('Downloading your verified digital report.');
                setIsProcessing(false);
                return;
            } else {
                navigate('/patient/history');
                setLastActionText('Opening Reports for Download');
                speak('Opening test reports to download your verified PDF.');
                setIsProcessing(false);
                return;
            }
        }

        if (cmd.includes('click book') || cmd.includes('click pay') || cmd.includes('pay now') || cmd.includes('proceed to payment') || cmd.includes('confirm booking')) {
            const executed = executeDOMAction('pay') || executeDOMAction('book');
            if (executed) {
                setLastActionText('Triggered Booking / Payment Action');
                speak('Executing payment and booking confirmation.');
                setIsProcessing(false);
                return;
            }
        }

        // ─────────────────────────────────────────────────────────────
        // 2. NAVIGATION COMMANDS (English + Telugu + Hindi)
        // ─────────────────────────────────────────────────────────────
        if (
            cmd === 'go home' || cmd === 'home' || cmd === 'home page' || cmd === 'open home' || cmd === 'main page' ||
            cmd.includes('home ki vellu') || cmd.includes('main page ki vellu') || cmd.includes('ghar jao') || cmd.includes('home jao')
        ) {
            navigate('/');
            setLastActionText('Navigating to Home Page');
            speak('Navigating to Home page.');
            setIsProcessing(false);
            return;
        }

        if (
            cmd.includes('my report') || cmd.includes('show report') || cmd.includes('lab report') ||
            cmd.includes('download report') || cmd.includes('view report') || cmd.includes('test result') ||
            cmd.includes('reports') || cmd.includes('report lu') || cmd.includes('na reports') ||
            cmd.includes('report chupinchu') || cmd.includes('mera report') || cmd.includes('report dikhao')
        ) {
            navigate('/patient/history');
            setLastActionText('Opening Diagnostic Lab Reports');
            speak('Opening your verified diagnostic reports and booking history.');
            setIsProcessing(false);
            return;
        }

        if (
            cmd.includes('my profile') || cmd.includes('open profile') || cmd.includes('user profile') ||
            cmd.includes('account details') || cmd.includes('na profile') || cmd.includes('mera profile')
        ) {
            navigate('/patient/profile');
            setLastActionText('Opening User Profile');
            speak('Opening your patient profile.');
            setIsProcessing(false);
            return;
        }

        if (
            cmd.includes('my booking') || cmd.includes('appointments') || cmd.includes('view booking') ||
            cmd.includes('order history') || cmd.includes('appointment lu') || cmd.includes('orders')
        ) {
            navigate('/patient/history');
            setLastActionText('Opening Appointments & Bookings');
            speak('Opening your appointments and test booking history.');
            setIsProcessing(false);
            return;
        }

        if (
            cmd.includes('nearby lab') || cmd.includes('labs near me') || cmd.includes('find nearby') ||
            cmd.includes('nearest lab') || cmd.includes('daggarlo unna lab') || cmd.includes('paas ke lab') ||
            cmd.includes('nearby')
        ) {
            navigate('/nearby-search');
            setLastActionText('Finding Nearby Diagnostic Labs');
            speak('Searching for verified NABL diagnostic labs in your vicinity.');
            setIsProcessing(false);
            return;
        }

        if (
            cmd.includes('india lab') || cmd.includes('all labs') || cmd.includes('find lab in india') ||
            cmd.includes('lab finder') || cmd.includes('city labs') || cmd.includes('labs directory')
        ) {
            navigate('/india-labs-finder');
            setLastActionText('Opening India Labs Finder');
            speak('Opening the all-India diagnostic labs finder.');
            setIsProcessing(false);
            return;
        }

        if (
            cmd.includes('book test') || cmd.includes('book appointment') || cmd.includes('schedule test') ||
            cmd.includes('checkout') || cmd.includes('book now') || cmd.includes('book cheyi') || cmd.includes('book karo')
        ) {
            navigate('/checkout');
            setLastActionText('Navigating to Checkout & Booking');
            speak('Opening the test booking and checkout portal.');
            setIsProcessing(false);
            return;
        }

        // ─────────────────────────────────────────────────────────────
        // 3. CITY-WISE LAB LOCATOR BY VOICE
        // ─────────────────────────────────────────────────────────────
        const cityMatch = cmd.match(/(?:labs\s+in|find\s+labs\s+in|labs\s+near)\s+([a-zA-Z\s]+)/i);
        if (cityMatch && cityMatch[1]) {
            const city = cityMatch[1].trim();
            if (city && !['near me', 'my area', 'vicinity'].includes(city.toLowerCase())) {
                navigate(`/india-labs-finder?search=${encodeURIComponent(city)}`);
                setLastActionText(`Finding Labs in ${city}`);
                speak(`Searching for certified diagnostic labs in ${city}.`);
                setIsProcessing(false);
                return;
            }
        }

        // ─────────────────────────────────────────────────────────────
        // 4. DIRECT TEST BOOKING & SEARCH BY VOICE
        // ─────────────────────────────────────────────────────────────
        const directTests = [
            { key: 'cbc', label: 'Complete Blood Count (CBC)', q: 'Complete Blood Count' },
            { key: 'blood test', label: 'Complete Blood Count', q: 'Complete Blood Count' },
            { key: 'haemoglobin', label: 'Hemoglobin Test', q: 'Complete Blood Count' },
            { key: 'diabetes', label: 'Diabetes Screening (HbA1c)', q: 'HbA1c' },
            { key: 'sugar', label: 'Fasting & PP Blood Sugar', q: 'HbA1c' },
            { key: 'hba1c', label: 'HbA1c Glycated Hemoglobin', q: 'HbA1c' },
            { key: 'thyroid', label: 'Thyroid Profile (T3, T4, TSH)', q: 'Thyroid Profile' },
            { key: 'tsh', label: 'Thyroid Stimulating Hormone', q: 'Thyroid Profile' },
            { key: 'lipid', label: 'Lipid Profile (Cholesterol)', q: 'Lipid Profile' },
            { key: 'cholesterol', label: 'Lipid Profile', q: 'Lipid Profile' },
            { key: 'vitamin d', label: 'Vitamin D3 & B12', q: 'Vitamin D3' },
            { key: 'vitamin b12', label: 'Vitamin B12', q: 'Vitamin B12' },
            { key: 'liver', label: 'Liver Function Test (LFT)', q: 'Liver Function Test' },
            { key: 'lft', label: 'Liver Function Test (LFT)', q: 'Liver Function Test' },
            { key: 'kidney', label: 'Kidney Function Test (KFT)', q: 'Renal Function Test' },
            { key: 'kft', label: 'Renal Function Test', q: 'Renal Function Test' },
            { key: 'rft', label: 'Renal Function Test', q: 'Renal Function Test' },
            { key: 'creatinine', label: 'Serum Creatinine', q: 'Renal Function Test' },
            { key: 'urine', label: 'Urine Routine Examination', q: 'Urine Routine' },
            { key: 'full body', label: 'Full Body Health Package', q: 'Full Body' },
            { key: 'master checkup', label: 'Master Full Body Package', q: 'Full Body' },
            { key: 'dengue', label: 'Dengue Serology NS1 & IgM', q: 'Dengue NS1' },
            { key: 'malaria', label: 'Malaria Antigen', q: 'Malaria Antigen' },
            { key: 'typhoid', label: 'Typhoid Widal / Typhidot', q: 'Typhoid' }
        ];

        for (const t of directTests) {
            if (cmd.includes(t.key)) {
                navigate(`/search?q=${encodeURIComponent(t.q)}`);
                setLastActionText(`Found Test: ${t.label}`);
                speak(`Opening diagnostic labs offering ${t.label}.`);
                setIsProcessing(false);
                return;
            }
        }

        // Generic Dynamic Search Commands
        const searchMatch = cmd.match(/^(?:search(?:\s+for)?|find|look\s+for|vetuku|dhoondo)\s+(.+)$/i);
        if (searchMatch && searchMatch[1]) {
            const query = searchMatch[1].replace(/test|package|panel|cheyi|karo/gi, '').trim();
            navigate(`/search?q=${encodeURIComponent(query || searchMatch[1])}`);
            setLastActionText(`Searching for: ${searchMatch[1]}`);
            speak(`Searching for ${searchMatch[1]} across accredited diagnostic labs.`);
            setIsProcessing(false);
            return;
        }

        // ─────────────────────────────────────────────────────────────
        // 5. CHATBOT CONTROLS
        // ─────────────────────────────────────────────────────────────
        if (
            cmd.includes('open chat') || cmd.includes('open chatbot') || cmd.includes('open assistant') ||
            cmd.includes('talk to bot') || cmd === 'help me' || cmd.includes('chatbot open cheyi') || cmd.includes('chat kholo')
        ) {
            window.dispatchEvent(new CustomEvent('diagnolabs:open-chat'));
            setLastActionText('Opened Clinical AI ChatBot');
            speak('Opening DiagnoLabs clinical assistant.');
            setIsProcessing(false);
            return;
        }

        if (
            cmd.includes('close chat') || cmd.includes('close chatbot') || cmd.includes('hide chat') ||
            cmd.includes('minimize chat') || cmd.includes('chatbot close cheyi') || cmd.includes('chat band karo')
        ) {
            window.dispatchEvent(new CustomEvent('diagnolabs:close-chat'));
            setLastActionText('Closed Clinical AI ChatBot');
            speak('Minimized clinical assistant.');
            setIsProcessing(false);
            return;
        }

        // ─────────────────────────────────────────────────────────────
        // 6. PAGE SCROLLING CONTROLS
        // ─────────────────────────────────────────────────────────────
        if (cmd.includes('scroll down') || cmd.includes('page down') || cmd.includes('kindaki scroll') || cmd.includes('neeche scroll')) {
            window.scrollBy({ top: 650, behavior: 'smooth' });
            setLastActionText('Scrolled Down');
            setIsProcessing(false);
            return;
        }

        if (cmd.includes('scroll up') || cmd.includes('page up') || cmd.includes('paiki scroll') || cmd.includes('upar scroll')) {
            window.scrollBy({ top: -650, behavior: 'smooth' });
            setLastActionText('Scrolled Up');
            setIsProcessing(false);
            return;
        }

        if (cmd.includes('scroll to top') || cmd.includes('top of page') || cmd.includes('go to top') || cmd.includes('top ki vellu')) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setLastActionText('Scrolled to Top');
            setIsProcessing(false);
            return;
        }

        if (cmd.includes('scroll to bottom') || cmd.includes('bottom of page') || cmd.includes('bottom ki vellu')) {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            setLastActionText('Scrolled to Bottom');
            setIsProcessing(false);
            return;
        }

        if (cmd.includes('reload page') || cmd.includes('refresh page') || cmd === 'refresh') {
            setLastActionText('Reloading Page');
            speak('Reloading page.');
            setTimeout(() => window.location.reload(), 600);
            setIsProcessing(false);
            return;
        }

        if (cmd.includes('go back') || cmd === 'back') {
            setLastActionText('Going Back');
            speak('Going back.');
            navigate(-1);
            setIsProcessing(false);
            return;
        }

        // ─────────────────────────────────────────────────────────────
        // 7. LOGIN CREDENTIALS BY VOICE
        // ─────────────────────────────────────────────────────────────
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
                        navigate('/patient/history', { replace: true });
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

        // ─────────────────────────────────────────────────────────────
        // 8. LOGOUT COMMAND
        // ─────────────────────────────────────────────────────────────
        if (cmd === 'logout' || cmd === 'sign out' || cmd === 'log out' || cmd.includes('logout cheyi') || cmd.includes('logout karo')) {
            if (logout) logout();
            navigate('/userlogin');
            setLastActionText('Logged Out Successfully');
            speak('You have been logged out securely.');
            setIsProcessing(false);
            return;
        }

        // ─────────────────────────────────────────────────────────────
        // 9. VOICE GUIDE & CHEATSHEET
        // ─────────────────────────────────────────────────────────────
        if (cmd.includes('voice command') || cmd.includes('what can i say') || cmd === 'help' || cmd.includes('show commands')) {
            setShowHelpModal(true);
            setLastActionText('Opening Voice Command Guide');
            speak('Here are the available voice commands you can use across DiagnoLabs.');
            setIsProcessing(false);
            return;
        }

        // ─────────────────────────────────────────────────────────────
        // 10. STOP / PAUSE ASSISTANT
        // ─────────────────────────────────────────────────────────────
        if (cmd.includes('stop listening') || cmd.includes('turn off voice') || cmd.includes('disable voice') || cmd.includes('stop assistant') || cmd.includes('voice aapeyi')) {
            handleDisableAssistant();
            setLastActionText('Voice Assistant Deactivated');
            speak('Voice assistant has been paused.');
            setIsProcessing(false);
            return;
        }

        // ─────────────────────────────────────────────────────────────
        // 11. CLINICAL SYMPTOMS & NEARBY LABS INTELLIGENCE ENGINE
        // ─────────────────────────────────────────────────────────────
        const CLINICAL_SYMPTOM_MAP = [
            {
                symptoms: ['fever', 'jwaram', 'bukhar', 'temperature', 'chills', 'dengue', 'malaria', 'typhoid', 'viral', 'flu', 'cold', 'cough', 'throat pain', 'sore throat', 'headache', 'shivering'],
                primaryTest: 'Complete Blood Count (CBC)',
                symptomKey: 'fever & viral infection'
            },
            {
                symptoms: ['diabetes', 'sugar', 'glucose', 'hba1c', 'madhumeham', 'high sugar', 'excessive thirst', 'frequent urination'],
                primaryTest: 'HbA1c (Glycated Hemoglobin)',
                symptomKey: 'diabetes & blood glucose'
            },
            {
                symptoms: ['thyroid', 't3', 't4', 'tsh', 'weight gain', 'weight loss', 'hair fall', 'fatigue', 'neerasam', 'kamzori', 'tiredness', 'exhaustion'],
                primaryTest: 'Thyroid Profile Total (T3, T4, TSH)',
                symptomKey: 'thyroid & metabolic fatigue'
            },
            {
                symptoms: ['heart', 'chest pain', 'bp', 'blood pressure', 'cholesterol', 'lipid', 'palpitation', 'breathlessness'],
                primaryTest: 'Lipid Profile Extended',
                symptomKey: 'cardiovascular & lipid risk'
            },
            {
                symptoms: ['liver', 'jaundice', 'yellow eyes', 'bilirubin', 'sgot', 'sgpt', 'pasirikalu', 'hepatic'],
                primaryTest: 'Liver Function Test (LFT)',
                symptomKey: 'liver & hepatic wellness'
            },
            {
                symptoms: ['kidney', 'creatinine', 'urine infection', 'burning urine', 'bun', 'uric acid', 'rft', 'kft', 'swelling legs'],
                primaryTest: 'Renal Function Test (RFT)',
                symptomKey: 'kidney & urinary health'
            },
            {
                symptoms: ['full body', 'body pain', 'body aches', 'weakness', 'annual checkup', 'master checkup', 'general health'],
                primaryTest: 'Comprehensive Full Body Health Package',
                symptomKey: 'systemic full body checkup'
            },
            {
                symptoms: ['vitamin', 'vitamin d', 'vitamin b12', 'bone pain', 'joint pain'],
                primaryTest: 'Vitamin D3 & B12 Combo',
                symptomKey: 'vitamin & bone wellness'
            }
        ];

        let matchedSymptomObj = null;
        for (const item of CLINICAL_SYMPTOM_MAP) {
            if (item.symptoms.some(sym => cmd.includes(sym))) {
                matchedSymptomObj = item;
                break;
            }
        }

        if (matchedSymptomObj) {
            const isLocEnabled = localStorage.getItem('diagnolabs_location_enabled') === 'true';
            const targetUrl = `/nearby-search?q=${encodeURIComponent(matchedSymptomObj.primaryTest)}&symptom=${encodeURIComponent(matchedSymptomObj.symptomKey)}`;
            
            navigate(targetUrl);
            setDetectedSymptomInfo({
                symptom: matchedSymptomObj.symptomKey,
                test: matchedSymptomObj.primaryTest
            });

            if (!isLocEnabled) {
                setShowLocationPromptModal(true);
                setLastActionText(`Analyzed: ${matchedSymptomObj.primaryTest} (Location Off)`);
                speak(`I analyzed your symptoms: recommended ${matchedSymptomObj.primaryTest}. Your location is currently turned off. Would you like to turn on your location to find verified labs near you? You can say "Yes" or "Turn on location".`);
            } else {
                setLastActionText(`Analyzed: ${matchedSymptomObj.primaryTest} (Location Active)`);
                speak(`I analyzed your symptoms: recommended ${matchedSymptomObj.primaryTest}. Searching verified diagnostic labs near your location.`);
            }

            setIsProcessing(false);
            return;
        }

        // If unrecognized command, give subtle feedback
        setLastActionText(`Command heard: "${rawTranscript}"`);
        setIsProcessing(false);
    }, [navigate, speak, logout, login, turnOnLocation, turnOffLocation, showLocationPromptModal]);

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
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                console.warn('Voice Assistant Speech recognition error:', event.error);
            }
        };

        rec.onend = () => {
            setIsListening(false);
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
        return null;
    }

    return (
        <>
            {/* 1. INITIAL PERMISSION MODAL ON LOGIN */}
            <AnimatePresence>
                {showPermissionModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0a1e46]/70 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden"
                        >
                            {/* Header Banner */}
                            <div className="bg-[#0a1e46] p-6 text-white text-center relative">
                                <button
                                    onClick={handleDismissPermission}
                                    className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner ring-4 ring-[#d4af37]/30">
                                    <Mic size={32} className="text-[#d4af37] animate-pulse" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight">DiagnoLabs Voice Assistant</h3>
                                <p className="text-xs text-slate-300 mt-1">
                                    Automated Hands-Free Navigation & Voice Control
                                </p>
                            </div>

                            {/* Body Content */}
                            <div className="p-6 space-y-4">
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Enable the <strong>Hands-Free Voice Assistant</strong> to navigate pages, search diagnostic tests, download reports, and book appointments using English, Telugu, or Hindi voice commands.
                                </p>

                                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-700">
                                    <div className="font-semibold text-[#0a1e46] flex items-center gap-1.5 mb-1.5">
                                        <Sparkles size={14} className="text-[#d4af37]" /> Example Voice Commands:
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#0a1e46]" />
                                        <span>"Show my reports" or "Report lu chupinchu"</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#0a1e46]" />
                                        <span>"Book Complete Blood Count"</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#0a1e46]" />
                                        <span>"Find labs in Hyderabad / Vijayawada"</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#0a1e46]" />
                                        <span>"Click Download Report" or "Scroll down"</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                                    <span>Microphone is processed locally for fast and secure execution.</span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={handleDismissPermission}
                                        className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                                    >
                                        Maybe Later
                                    </button>
                                    <button
                                        onClick={handleEnableAssistant}
                                        className="flex-1 py-3 px-4 rounded-xl bg-[#0a1e46] hover:bg-[#071530] text-white font-semibold text-sm shadow-lg shadow-navy-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Mic size={16} className="text-[#d4af37]" /> Enable Voice
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 2. MINIMALIST CLINICAL GLASSMORPHIC VOICE ASSISTANT HUD */}
            <div className="fixed bottom-6 left-6 z-[9990] flex flex-col items-start gap-2 select-none font-sans">
                {/* Active Voice Pill HUD */}
                <AnimatePresence>
                    {isEnabled && (
                        <motion.div
                            initial={{ opacity: 0, y: 12, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.96 }}
                            className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_14px_40px_rgba(10,30,70,0.12)] border border-slate-200/90 p-3 max-w-[340px] sm:max-w-[360px] flex flex-col gap-2 ring-1 ring-slate-100"
                        >
                            {/* Capsule Header Row */}
                            <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-[#0a1e46] text-white flex items-center justify-center shadow-sm">
                                        <Mic size={14} className={isListening ? "text-[#d4af37] animate-pulse" : "text-white"} />
                                    </div>
                                    <div>
                                        <div className="text-[0.76rem] font-extrabold text-[#0a1e46] tracking-tight flex items-center gap-1.5">
                                            <span>Voice Assistant</span>
                                            <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                                        </div>
                                        <div className="text-[0.62rem] font-bold text-slate-400 uppercase tracking-wider">
                                            {isListening ? 'Hands-Free Active' : 'Ready'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={toggleMute}
                                        title={isMuted ? "Unmute Audio Feedback" : "Mute Audio Feedback"}
                                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                    >
                                        {isMuted ? <VolumeX size={14} className="text-rose-500" /> : <Volume2 size={14} className="text-[#0a1e46]" />}
                                    </button>
                                    <button
                                        onClick={() => setShowHelpModal(true)}
                                        title="Voice Commands Guide"
                                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                    >
                                        <HelpCircle size={14} />
                                    </button>
                                    <button
                                        onClick={handleDisableAssistant}
                                        title="Turn Off Voice Assistant"
                                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                    >
                                        <Power size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Live Soundwave & Transcript Status */}
                            <div className="flex items-center gap-2.5 px-2.5 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                {isListening && (
                                    <div className="flex items-center gap-0.5 shrink-0">
                                        <span className="w-0.5 bg-[#0a1e46] rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3" />
                                        <span className="w-0.5 bg-[#d4af37] rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-5" />
                                        <span className="w-0.5 bg-emerald-500 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-2.5" />
                                        <span className="w-0.5 bg-[#0a1e46] rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-4" />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    {liveTranscript ? (
                                        <p className="text-[0.74rem] font-medium text-slate-700 truncate italic">
                                            "{liveTranscript}"
                                        </p>
                                    ) : (
                                        <p className="text-[0.72rem] text-slate-400 truncate">
                                            Say: "Show reports", "Book CBC", "Nearby labs"...
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Action Feedback Badge (if any) */}
                            {lastActionText && (
                                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[0.72rem] bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg">
                                    <CheckCircle2 size={12} className="shrink-0 text-emerald-600" />
                                    <span className="truncate">{lastActionText}</span>
                                </div>
                            )}

                            {/* Quick Suggestion Chips */}
                            <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto no-scrollbar">
                                <button
                                    onClick={() => processVoiceCommand('Show my reports')}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[0.68rem] font-semibold transition cursor-pointer shrink-0"
                                >
                                    Reports
                                </button>
                                <button
                                    onClick={() => processVoiceCommand('Book Complete Blood Count')}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[0.68rem] font-semibold transition cursor-pointer shrink-0"
                                >
                                    Book CBC
                                </button>
                                <button
                                    onClick={() => processVoiceCommand('Find labs near me')}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[0.68rem] font-semibold transition cursor-pointer shrink-0"
                                >
                                    Nearby Labs
                                </button>
                                <button
                                    onClick={() => processVoiceCommand('Open chatbot')}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[0.68rem] font-semibold transition cursor-pointer shrink-0"
                                >
                                    ChatBot
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating Microphone Trigger Pill */}
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={toggleAssistant}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-full shadow-lg border transition-all cursor-pointer ${
                        isEnabled
                            ? 'bg-[#0a1e46] text-white border-slate-700 shadow-[0_8px_20px_rgba(10,30,70,0.2)]'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isEnabled ? 'bg-white/15 text-[#d4af37]' : 'bg-slate-100 text-slate-600'}`}>
                        {isEnabled ? <Mic size={12} className="animate-pulse" /> : <MicOff size={12} />}
                    </div>
                    <span className="text-[0.76rem] font-bold">
                        {isEnabled ? 'Voice Assistant ON' : 'Voice Assistant'}
                    </span>
                    {isEnabled && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </motion.button>
            </div>

            {/* 3. VOICE COMMAND HELP & CHEATSHEET MODAL */}
            <AnimatePresence>
                {showHelpModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0a1e46]/70 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            {/* Modal Header */}
                            <div className="bg-[#0a1e46] p-5 text-white flex items-center justify-between border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 text-[#d4af37] rounded-xl border border-[#d4af37]/30">
                                        <Sparkles size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base">DiagnoLabs Voice Command Directory</h3>
                                        <p className="text-xs text-slate-300">Hands-Free Automation Across All Pages</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowHelpModal(false)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Language Selector Tabs */}
                            <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2">
                                <button
                                    onClick={() => setHelpTab('english')}
                                    className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                                        helpTab === 'english' ? 'border-[#0a1e46] text-[#0a1e46]' : 'border-transparent text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    English Commands
                                </button>
                                <button
                                    onClick={() => setHelpTab('telugu')}
                                    className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                                        helpTab === 'telugu' ? 'border-[#0a1e46] text-[#0a1e46]' : 'border-transparent text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    తెలుగు కమాండ్స్ (Telugu)
                                </button>
                                <button
                                    onClick={() => setHelpTab('hindi')}
                                    className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                                        helpTab === 'hindi' ? 'border-[#0a1e46] text-[#0a1e46]' : 'border-transparent text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    हिंदी कमांड (Hindi)
                                </button>
                            </div>

                            {/* Modal Commands List */}
                            <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700">
                                {helpTab === 'english' && (
                                    <>
                                        {/* Category 1: Navigation & Actions */}
                                        <div>
                                            <h4 className="text-xs font-bold text-[#0a1e46] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                <Compass size={14} /> Navigation & UI Actions
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                    <span className="font-semibold text-slate-900 block">"Go home" / "Home page"</span>
                                                    <span className="text-slate-500">Navigates to main home page</span>
                                                </div>
                                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                    <span className="font-semibold text-slate-900 block">"Show my reports"</span>
                                                    <span className="text-slate-500">Opens diagnostic test reports</span>
                                                </div>
                                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                    <span className="font-semibold text-slate-900 block">"Click Download Report"</span>
                                                    <span className="text-slate-500">Downloads newest report PDF</span>
                                                </div>
                                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                    <span className="font-semibold text-slate-900 block">"Find labs near me"</span>
                                                    <span className="text-slate-500">Opens nearby lab locator</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Category 2: Direct Test Booking */}
                                        <div>
                                            <h4 className="text-xs font-bold text-[#0a1e46] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                <Search size={14} /> Diagnostic Test Search & Booking
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                    <span className="font-semibold text-slate-900 block">"Book Complete Blood Count"</span>
                                                    <span className="text-slate-500">Finds CBC lab tests</span>
                                                </div>
                                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                    <span className="font-semibold text-slate-900 block">"Book Diabetes test (HbA1c)"</span>
                                                    <span className="text-slate-500">Finds sugar & HbA1c panels</span>
                                                </div>
                                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                    <span className="font-semibold text-slate-900 block">"Book Full Body Checkup"</span>
                                                    <span className="text-slate-500">Opens package booking</span>
                                                </div>
                                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                    <span className="font-semibold text-slate-900 block">"Find labs in Hyderabad"</span>
                                                    <span className="text-slate-500">Filters labs by city name</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Category 3: Assistant & Location Controls */}
                                        <div>
                                            <h4 className="text-xs font-bold text-[#0a1e46] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                <Activity size={14} /> Location & Assistant Controls
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                    <span className="font-semibold text-slate-900 block">"Turn on location" / "Yes"</span>
                                                    <span className="text-slate-500">Enables live GPS coordinates</span>
                                                </div>
                                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                    <span className="font-semibold text-slate-900 block">"Turn off location" / "No"</span>
                                                    <span className="text-slate-500">Disables GPS / shows all labs</span>
                                                </div>
                                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                    <span className="font-semibold text-slate-900 block">"I have fever near me"</span>
                                                    <span className="text-slate-500">Auto-analyzes symptoms & searches labs</span>
                                                </div>
                                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                    <span className="font-semibold text-slate-900 block">"Open chatbot" / "Close chat"</span>
                                                    <span className="text-slate-500">Toggles AI clinical assistant</span>
                                                </div>
                                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                    <span className="font-semibold text-slate-900 block">"Scroll down" / "Scroll up"</span>
                                                    <span className="text-slate-500">Smooth viewport scrolling</span>
                                                </div>
                                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                    <span className="font-semibold text-slate-900 block">"Logout"</span>
                                                    <span className="text-slate-500">Signs out securely</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {helpTab === 'telugu' && (
                                    <div>
                                        <h4 className="text-xs font-bold text-[#0a1e46] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <Sparkles size={14} /> తెలుగు వాయిస్ కమాండ్స్
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="font-semibold text-slate-900 block">"Location on cheyi" / "Ha"</span>
                                                <span className="text-slate-500">GPS లొకేషన్ ఆన్ చేస్తుంది</span>
                                            </div>
                                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="font-semibold text-slate-900 block">"Location off cheyi" / "Vaddhu"</span>
                                                <span className="text-slate-500">GPS లొకేషన్ ఆఫ్ చేస్తుంది</span>
                                            </div>
                                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="font-semibold text-slate-900 block">"Jwaram vachindi daggarlo lab"</span>
                                                <span className="text-slate-500">లక్షణాలను విశ్లేషించి CBC ల్యాబ్స్ వెతుకుతుంది</span>
                                            </div>
                                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="font-semibold text-slate-900 block">"Report lu chupinchu"</span>
                                                <span className="text-slate-500">ల్యాబ్ రిపోర్టులు ఓపెన్ చేస్తుంది</span>
                                            </div>
                                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="font-semibold text-slate-900 block">"Daggarlo unna lab lu"</span>
                                                <span className="text-slate-500">సమీపంలోని NABL ల్యాబ్స్ వెతుకుతుంది</span>
                                            </div>
                                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="font-semibold text-slate-900 block">"Blood test book cheyi"</span>
                                                <span className="text-slate-500">CBC బ్లడ్ టెస్ట్ బుకింగ్ ఓపెన్ చేస్తుంది</span>
                                            </div>
                                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="font-semibold text-slate-900 block">"Home page ki vellu"</span>
                                                <span className="text-slate-500">మెయిన్ హోమ్ పేజీకి తీసుకెళ్తుంది</span>
                                            </div>
                                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="font-semibold text-slate-900 block">"Kindaki scroll cheyi"</span>
                                                <span className="text-slate-500">పేజీని క్రిందికి స్క్రోల్ చేస్తుంది</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {helpTab === 'hindi' && (
                                    <div>
                                        <h4 className="text-xs font-bold text-[#0a1e46] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <Sparkles size={14} /> हिंदी वॉयस कमांड्स
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="font-semibold text-slate-900 block">"Location on karo" / "Haan"</span>
                                                <span className="text-slate-500">GPS लोकेशन ऑन करता है</span>
                                            </div>
                                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="font-semibold text-slate-900 block">"Location band karo" / "Nahi"</span>
                                                <span className="text-slate-500">GPS लोकेशन बंद करता है</span>
                                            </div>
                                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="font-semibold text-slate-900 block">"Bukhar hai paas ke lab"</span>
                                                <span className="text-slate-500">लक्षण जांच कर लैब खोजता है</span>
                                            </div>
                                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="font-semibold text-slate-900 block">"Mera report dikhao"</span>
                                                <span className="text-slate-500">रिपोर्ट्स पेज खोलता है</span>
                                            </div>
                                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="font-semibold text-slate-900 block">"Paas ke lab dhoondo"</span>
                                                <span className="text-slate-500">नजदीकी लैब खोजता है</span>
                                            </div>
                                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="font-semibold text-slate-900 block">"Blood test book karo"</span>
                                                <span className="text-slate-500">टेस्ट बुकिंग शुरू करता है</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
                                <button
                                    onClick={() => setShowHelpModal(false)}
                                    className="py-2.5 px-5 bg-[#0a1e46] hover:bg-[#071530] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                                >
                                    Got It
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 4. LOCATION ACCESS PROMPT DIALOG (VOICE DRIVEN "YES" / "NO") */}
            <AnimatePresence>
                {showLocationPromptModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0a1e46]/70 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="bg-[#0a1e46] p-6 text-white text-center relative">
                                <button
                                    onClick={() => setShowLocationPromptModal(false)}
                                    className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner ring-4 ring-teal-400/30">
                                    <MapPin size={32} className="text-teal-300 animate-bounce" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight">Turn On Location?</h3>
                                <p className="text-xs text-teal-200 mt-1">
                                    Find Accredited Diagnostic Labs Nearest to You
                                </p>
                            </div>

                            {/* Body Content */}
                            <div className="p-6 space-y-4">
                                {detectedSymptomInfo && (
                                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl">
                                        <div className="text-[0.72rem] font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                            <Sparkles size={13} className="text-teal-600" /> AI Symptom Analysis
                                        </div>
                                        <div className="text-xs text-slate-700">
                                            Symptom: <strong className="text-teal-900 capitalize">"{detectedSymptomInfo.symptom}"</strong>
                                        </div>
                                        <div className="text-xs text-slate-700 mt-0.5">
                                            Recommended: <strong className="text-[#0a1e46]">{detectedSymptomInfo.test}</strong>
                                        </div>
                                    </div>
                                )}

                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Your high-precision GPS location is currently <strong>turned off</strong>. Enable location to calculate accurate travel distances and explore certified NABL diagnostic centers in your area.
                                </p>

                                {/* Voice Command Hint Box */}
                                <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl space-y-1.5">
                                    <div className="text-[0.72rem] font-bold text-amber-900 flex items-center gap-1.5">
                                        <Mic size={13} className="text-amber-700 animate-pulse" /> Voice Automation Active:
                                    </div>
                                    <div className="text-xs text-amber-800 flex items-center gap-1.5">
                                        <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                                        <span>Say <strong>"Yes"</strong> or <strong>"Turn on location"</strong> to enable GPS</span>
                                    </div>
                                    <div className="text-xs text-amber-800 flex items-center gap-1.5">
                                        <X size={12} className="text-rose-600 shrink-0" />
                                        <span>Say <strong>"No"</strong> or <strong>"Turn off location"</strong> to browse all labs</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-1">
                                    <button
                                        onClick={turnOffLocation}
                                        className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                        <Power size={14} className="text-slate-500" /> Off Location / All Labs
                                    </button>
                                    <button
                                        onClick={turnOnLocation}
                                        className="flex-1 py-3 px-4 rounded-xl bg-[#0a1e46] hover:bg-[#071530] text-white font-semibold text-xs shadow-lg shadow-navy-950/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <LocateFixed size={14} className="text-teal-300" /> Turn On Location
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default GlobalVoiceAssistant;
