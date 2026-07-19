import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { User, Lock, Eye, EyeOff, ShieldCheck, Users, Sparkles, ChevronRight, Activity, Mail, Phone } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [activeTab, setActiveTab] = useState('login'); // 'login' or 'citizen'
    const { login, googleLogin, user, logout, register } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Registration States
    const [regData, setRegData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'patient'
    });
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleRegChange = (e) => {
        setRegData({ ...regData, [e.target.name]: e.target.value });
    };

    const handleSendOTP = async (e) => {
        if (e) e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/send-otp`, { 
                phone: regData.phone, 
                email: regData.email 
            });
            if (res.status === 200) {
                setOtpSent(true);
                setTimer(60); // Start 60s cooldown
                if (!e) {
                    alert("A new OTP has been sent!");
                } else {
                    alert("OTP sent successfully!");
                }
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to send OTP");
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setVerifying(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
                phone: regData.phone,
                email: regData.email,
                otp: otp
            });
            if (res.status === 200) {
                const regRes = await register(regData);
                if (regRes.success) {
                    alert("Registration & Verification Successful!");
                    setActiveTab('login'); // Switch to login tab
                    setEmail(regData.email); // Pre-fill email
                } else {
                    alert(regRes.message);
                }
            }
        } catch (err) {
            alert(err.response?.data?.message || "OTP Verification Failed");
        } finally {
            setVerifying(false);
        }
    };

    const from = location.state?.from?.pathname || null;
    const fromState = location.state?.from?.state || null;
    const message = location.state?.message;

    const handleSuccessRedirect = (resUser) => {
        if (from) {
            navigate(from, { state: fromState, replace: true });
        } else if (resUser.role === 'admin' || resUser.role === 'employee') {
            navigate('/admin/dashboard');
        } else if (resUser.role === 'lab_partner') {
            navigate('/partner/dashboard');
        } else {
            navigate('/patient/dashboard');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(email, password);
        if (res.success) {
            console.log("Login successful, rememberMe:", rememberMe);
            handleSuccessRedirect(res.user);
        } else {
            alert(res.message);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        const res = await googleLogin(credentialResponse.credential);
        if (res.success) {
            handleSuccessRedirect(res.user);
        } else {
            alert(res.message);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true, state: { message: "Successfully logged out. Please login with a new account." } });
        setEmail('');
        setPassword('');
    };

    if (user && message && message.includes("Access Denied")) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-page-bg p-8 font-sans">
                <div className="bg-white rounded-[32px] p-10 shadow-2xl max-w-[500px] w-full text-center border border-gray-100">
                    <div className="flex justify-center mb-8">
                        <BrandLogo size={84} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-navy mb-4">Security Alert</h2>
                    <p className="text-text-muted mb-8 font-medium">{message}</p>
                    
                    <div className="p-6 bg-gray-50 rounded-2xl mb-8 border border-gray-100">
                        <span className="text-xs text-gray-400 font-extrabold tracking-wider block mb-2 uppercase">ACTIVE SESSION IDENTITY</span>
                        <h4 className="text-lg text-navy font-bold">{user.name}</h4>
                        <span className="inline-block mt-2 bg-blue-50 text-blue-700 text-xs font-extrabold px-3 py-1 rounded-full uppercase">{user.role.replace('_', ' ')}</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button onClick={handleLogout} className="w-full py-4 bg-gradient-to-r from-navy to-royal-blue text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                            End Session & Switch Identity
                        </button>
                        <button onClick={() => navigate('/')} className="w-full py-4 border border-gray-200 text-navy rounded-xl font-bold hover:bg-gray-50 transition-all">
                            Return to Gateway
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gradient-to-tr from-[#eef1f6] to-[#f7f9fc] relative overflow-hidden font-sans">
            {/* Background SVG Wave S-Curve Separator (Only shown on desktop lg screen) */}
            <div className="absolute inset-0 z-0 pointer-events-none hidden lg:block">
                <svg width="100%" height="100%" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Dark Navy Curved Panel fill */}
                    <path d="M 850 0 C 600 250, 600 650, 1050 900 L 1440 900 L 1440 0 Z" fill="url(#paint0_linear)" />
                    {/* Glowing gold border gradient line */}
                    <path d="M 850 0 C 600 250, 600 650, 1050 900" stroke="url(#paint1_linear)" strokeWidth="6" strokeLinecap="round" />
                    <defs>
                        <linearGradient id="paint0_linear" x1="1060" y1="0" x2="1060" y2="900" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#0a1e46" />
                            <stop offset="50%" stopColor="#081736" />
                            <stop offset="100%" stopColor="#050f24" />
                        </linearGradient>
                        <linearGradient id="paint1_linear" x1="600" y1="0" x2="600" y2="900" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#e0b667" />
                            <stop offset="50%" stopColor="#cc9a3d" />
                            <stop offset="100%" stopColor="#e0b667" />
                        </linearGradient>
                        <linearGradient id="hexagon-fill" x1="50" y1="20" x2="50" y2="80" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#0a1e46" />
                            <stop offset="100%" stopColor="#050f24" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Left Branding Panel (Hidden < 980px/lg) */}
            <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-6 xl:p-10 relative z-10 h-full overflow-hidden">
                {/* Logo Section */}
                {/* Logo Section */}
                <div className="flex items-center gap-3">
                    <svg width="60" height="60" viewBox="0 0 100 100" fill="none" className="filter drop-shadow-[0_2px_4px_rgba(10,30,70,0.15)]">
                        <defs>
                            <linearGradient id="heartbeat-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#0a1e46" />
                                <stop offset="48%" stopColor="#0a1e46" />
                                <stop offset="52%" stopColor="#cc9a3d" />
                                <stop offset="100%" stopColor="#cc9a3d" />
                            </linearGradient>
                        </defs>
                        
                        {/* Outer Hexagon Edges */}
                        <line x1="50" y1="10" x2="84.6" y2="30" stroke="#0a1e46" strokeWidth="2.5" />
                        <line x1="84.6" y1="30" x2="84.6" y2="70" stroke="#cc9a3d" strokeWidth="2.5" />
                        <line x1="84.6" y1="70" x2="50" y2="90" stroke="#0a1e46" strokeWidth="2.5" />
                        <line x1="50" y1="90" x2="15.4" y2="70" stroke="#cc9a3d" strokeWidth="2.5" />
                        <line x1="15.4" y1="70" x2="15.4" y2="30" stroke="#0a1e46" strokeWidth="2.5" />
                        <line x1="15.4" y1="30" x2="50" y2="10" stroke="#cc9a3d" strokeWidth="2.5" />

                        {/* Inner Hexagon */}
                        <polygon points="50,20 76,35 76,65 50,80 24,65 24,35" stroke="#e2e8f0" strokeWidth="1" fill="white" />

                        {/* Heartbeat Line */}
                        <path d="M20,50 L35,50 L42,32 L58,68 L65,50 L80,50" stroke="url(#heartbeat-grad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Center Dot */}
                        <circle cx="50" cy="50" r="2.5" fill="#cc9a3d" />

                        {/* Corner Dots */}
                        <circle cx="50" cy="10" r="2.5" fill="#cc9a3d" />
                        <circle cx="84.6" cy="30" r="2.5" fill="#0a1e46" />
                        <circle cx="84.6" cy="70" r="2.5" fill="#cc9a3d" />
                        <circle cx="50" cy="90" r="2.5" fill="#0a1e46" />
                        <circle cx="15.4" cy="70" r="2.5" fill="#cc9a3d" />
                        <circle cx="15.4" cy="30" r="2.5" fill="#0a1e46" />
                    </svg>
                    <div className="flex flex-col">
                        <span className="text-[23px] font-extrabold text-[#0a1e46] leading-none">DiagnoLabs</span>
                        <span className="text-[10.5px] font-bold text-[#cc9a3d] tracking-[2px] uppercase mt-1 leading-none">Clinical Discovery</span>
                    </div>
                </div>

                {/* Left Panel Center Content */}
                <div className="my-auto w-full max-w-[540px] flex flex-col">
                    {/* Pill badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-xs font-bold text-[#0a1e46] shadow-sm border border-gray-100 self-start mb-6">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                        <span>India's Most Advanced Clinical Discovery Network</span>
                    </div>

                    <h1 className="text-[40px] xl:text-[46px] font-extrabold text-[#0a1e46] leading-[1.05] tracking-[-1px] mb-4">
                        Precision<br />
                        Discovery.<br />
                        <span className="text-[#cc9a3d]">Expert<br />Diagnosis.</span>
                    </h1>

                    {/* Subtext */}
                    <p className="text-[14px] xl:text-[14.5px] text-[#6b7280] leading-[1.6] mb-6 pr-4">
                        Unified gateway to India's most trusted clinical networks with NABL-certified precision.
                    </p>

                    {/* Bottom Flex Grid: Side-by-Side features and microscope */}
                    <div className="flex items-center justify-between gap-1 mt-1">
                        {/* Features list */}
                        <div className="flex flex-col gap-4 flex-[1.1] min-w-[180px]">
                            <div className="flex items-center gap-3">
                                <div className="w-[40px] h-[40px] flex-shrink-0 relative">
                                    <svg width="40" height="40" viewBox="0 0 100 100" className="absolute inset-0">
                                        <polygon points="50,4 92,26 92,74 50,96 8,74 8,26" fill="white" stroke="#e2e8f0" strokeWidth="3" strokeLinejoin="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ShieldCheck className="w-[18px] h-[18px] text-[#0a1e46]" />
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[13px] xl:text-[14px] font-extrabold text-[#0a1e46]">Accurate</span>
                                    <span className="text-[11px] xl:text-[12px] text-[#6b7280] font-medium">NABL-certified precision</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-[40px] h-[40px] flex-shrink-0 relative">
                                    <svg width="40" height="40" viewBox="0 0 100 100" className="absolute inset-0">
                                        <polygon points="50,4 92,26 92,74 50,96 8,74 8,26" fill="white" stroke="#e2e8f0" strokeWidth="3" strokeLinejoin="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Users className="w-[18px] h-[18px] text-[#0a1e46]" />
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[13px] xl:text-[14px] font-extrabold text-[#0a1e46]">Reliable</span>
                                    <span className="text-[11px] xl:text-[12px] text-[#6b7280] font-medium">Trusted by millions</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-[40px] h-[40px] flex-shrink-0 relative">
                                    <svg width="40" height="40" viewBox="0 0 100 100" className="absolute inset-0">
                                        <polygon points="50,4 92,26 92,74 50,96 8,74 8,26" fill="white" stroke="#e2e8f0" strokeWidth="3" strokeLinejoin="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Sparkles className="w-[18px] h-[18px] text-[#0a1e46]" />
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[13px] xl:text-[14px] font-extrabold text-[#0a1e46]">Advanced</span>
                                    <span className="text-[11px] xl:text-[12px] text-[#6b7280] font-medium">Cutting-edge technology</span>
                                </div>
                            </div>
                        </div>

                        {/* Microscope + Test Tube Illustration — High-Fidelity 3D Shaded Version */}
                        <div className="flex justify-end flex-[0.9] min-w-[200px] max-w-[260px] overflow-visible">
                            <svg viewBox="0 0 420 240" width="100%" height="auto" style={{ overflow: "visible", transform: "scale(1.05) translateX(5px)" }}>
                                <defs>
                                    {/* Shading gradients */}
                                    <radialGradient id="shadow-blur" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor="#0f172a" stopOpacity="0.15" />
                                        <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                                    </radialGradient>
                                    <linearGradient id="disc-top-grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ffffff" />
                                        <stop offset="100%" stopColor="#eef2f6" />
                                    </linearGradient>
                                    <linearGradient id="disc-edge-grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#e2e8f0" />
                                        <stop offset="100%" stopColor="#cbd5e1" />
                                    </linearGradient>
                                    
                                    {/* Metallic textures */}
                                    <linearGradient id="chrome-grad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#f8fafc" />
                                        <stop offset="30%" stopColor="#e2e8f0" />
                                        <stop offset="70%" stopColor="#94a3b8" />
                                        <stop offset="100%" stopColor="#475569" />
                                    </linearGradient>
                                    <linearGradient id="body-grad" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#ffffff" />
                                        <stop offset="40%" stopColor="#f1f5f9" />
                                        <stop offset="80%" stopColor="#cbd5e1" />
                                        <stop offset="100%" stopColor="#94a3b8" />
                                    </linearGradient>
                                    <linearGradient id="metallic-blue" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="50%" stopColor="#1d4ed8" />
                                        <stop offset="100%" stopColor="#1e3a8a" />
                                    </linearGradient>
                                    <linearGradient id="gold-trim" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#f59e0b" />
                                        <stop offset="50%" stopColor="#d97706" />
                                        <stop offset="100%" stopColor="#b45309" />
                                    </linearGradient>
                                    
                                    {/* Liquid gradients */}
                                    <linearGradient id="liquid-grad-1" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#60a5fa" />
                                        <stop offset="100%" stopColor="#1d4ed8" />
                                    </linearGradient>
                                    <linearGradient id="liquid-grad-2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#1e3a8a" />
                                    </linearGradient>
                                    <linearGradient id="liquid-grad-3" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#93c5fd" />
                                        <stop offset="100%" stopColor="#2563eb" />
                                    </linearGradient>
                                    
                                    {/* Glare and glass highlights */}
                                    <linearGradient id="glass-reflection" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                                        <stop offset="25%" stopColor="#ffffff" stopOpacity="0" />
                                        <stop offset="85%" stopColor="#ffffff" stopOpacity="0" />
                                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
                                    </linearGradient>
                                    <linearGradient id="light-beam-grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                                        <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.25" />
                                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.65" />
                                    </linearGradient>
                                </defs>

                                {/* 3D Platform Shadows */}
                                <ellipse cx="140" cy="225" rx="120" ry="12" fill="url(#shadow-blur)" />
                                <ellipse cx="290" cy="230" rx="90" ry="10" fill="url(#shadow-blur)" />

                                {/* Left Base Disc (Microscope Platform) */}
                                <path d="M 45,212 L 45,219 A 95,14 0 0,0 235,219 L 235,212 Z" fill="url(#disc-edge-grad)" />
                                <ellipse cx="140" cy="212" rx="95" ry="14" fill="url(#disc-top-grad)" stroke="#e2e8f0" strokeWidth="1" />

                                {/* Right Base Disc (Test Tube Platform) */}
                                <path d="M 215,220 L 215,225 A 75,9 0 0,0 365,225 L 365,220 Z" fill="url(#disc-edge-grad)" />
                                <ellipse cx="290" cy="220" rx="75" ry="9" fill="url(#disc-top-grad)" stroke="#e2e8f0" strokeWidth="1" />

                                {/* 3D Test Tubes & Stand (Right) */}
                                <g>
                                    {/* Test Tube Stand Base */}
                                    <ellipse cx="290" cy="205" rx="55" ry="10" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
                                    
                                    {/* Stand Support Pillars */}
                                    <rect x="250" y="125" width="4" height="78" fill="url(#chrome-grad)" />
                                    <rect x="326" y="125" width="4" height="78" fill="url(#chrome-grad)" />

                                    {/* Stand Top Rack */}
                                    <ellipse cx="290" cy="125" rx="52" ry="9" fill="rgba(255,255,255,0.7)" stroke="#cbd5e1" strokeWidth="1.5" />
                                    
                                    {/* Tube 1 (Left) */}
                                    <g>
                                        {/* Liquid */}
                                        <rect x="260" y="145" width="14" height="42" rx="7" fill="url(#liquid-grad-1)" />
                                        {/* Tube Body */}
                                        <rect x="259" y="112" width="16" height="82" rx="8" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
                                        <rect x="259" y="112" width="16" height="82" rx="8" fill="url(#glass-reflection)" />
                                        {/* Meniscus */}
                                        <ellipse cx="267" cy="145" rx="7" ry="2.5" fill="#93c5fd" opacity="0.8" />
                                        {/* Tube Lip */}
                                        <rect x="257" y="108" width="20" height="4" rx="1.5" fill="rgba(255,255,255,0.9)" stroke="#cbd5e1" strokeWidth="1" />
                                    </g>

                                    {/* Tube 2 (Center) */}
                                    <g>
                                        {/* Liquid */}
                                        <rect x="282" y="138" width="14" height="52" rx="7" fill="url(#liquid-grad-2)" />
                                        {/* Tube Body */}
                                        <rect x="281" y="102" width="16" height="92" rx="8" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
                                        <rect x="281" y="102" width="16" height="92" rx="8" fill="url(#glass-reflection)" />
                                        {/* Meniscus */}
                                        <ellipse cx="289" cy="138" rx="7" ry="2.5" fill="#60a5fa" opacity="0.8" />
                                        {/* Tube Lip */}
                                        <rect x="279" y="98" width="20" height="4" rx="1.5" fill="rgba(255,255,255,0.9)" stroke="#cbd5e1" strokeWidth="1" />
                                    </g>

                                    {/* Tube 3 (Right) */}
                                    <g>
                                        {/* Liquid */}
                                        <rect x="304" y="148" width="14" height="38" rx="7" fill="url(#liquid-grad-3)" />
                                        {/* Tube Body */}
                                        <rect x="303" y="116" width="16" height="74" rx="8" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
                                        <rect x="303" y="116" width="16" height="74" rx="8" fill="url(#glass-reflection)" />
                                        {/* Meniscus */}
                                        <ellipse cx="311" cy="148" rx="7" ry="2.5" fill="#dbe4f0" opacity="0.8" />
                                        {/* Tube Lip */}
                                        <rect x="301" y="112" width="20" height="4" rx="1.5" fill="rgba(255,255,255,0.9)" stroke="#cbd5e1" strokeWidth="1" />
                                    </g>
                                </g>

                                {/* 3D Clinical Microscope (Left) */}
                                <g transform="translate(10,0)">
                                    {/* Microscope Base */}
                                    <path d="M 85,182 L 85,194 A 55,9 0 0,0 175,194 L 175,182 Z" fill="url(#disc-edge-grad)" />
                                    <ellipse cx="130" cy="182" rx="45" ry="8" fill="url(#body-grad)" stroke="#cbd5e1" strokeWidth="1.2" />

                                    {/* Main Arm Column */}
                                    <path d="M 115,182 Q 130,140 145,130 M 145,130 C 145,95 125,75 105,75 L 90,88 C 110,88 127,105 127,130 Q 115,145 105,182 Z" fill="url(#body-grad)" stroke="#cbd5e1" strokeWidth="1" />
                                    
                                    {/* Arm Accent strip */}
                                    <path d="M 125,133 C 125,110 115,97 103,94" fill="none" stroke="url(#metallic-blue)" strokeWidth="4" strokeLinecap="round" />

                                    {/* Focus Knobs (3D Dual Dial) */}
                                    <ellipse cx="106" cy="176" rx="10" ry="6" fill="url(#chrome-grad)" stroke="#475569" strokeWidth="1" />
                                    <ellipse cx="106" cy="176" rx="6" ry="3.5" fill="url(#metallic-blue)" />
                                    <ellipse cx="154" cy="176" rx="10" ry="6" fill="url(#chrome-grad)" stroke="#475569" strokeWidth="1" />
                                    
                                    {/* Sub-Stage Condenser & Light Source */}
                                    <rect x="120" y="152" width="20" height="15" rx="2" fill="url(#body-grad)" stroke="#cbd5e1" strokeWidth="1" />
                                    <ellipse cx="130" cy="152" rx="7" ry="2.2" fill="#38bdf8" />
                                    
                                    {/* Glowing LED Beam */}
                                    <polygon points="124,152 136,152 142,126 128,126" fill="url(#light-beam-grad)" style={{ mixBlendMode: 'screen' }} />

                                    {/* Microscope Stage */}
                                    <path d="M 108,145 L 108,150 A 42,6 0 0,0 172,150 L 172,145 Z" fill="#0f172a" />
                                    <ellipse cx="140" cy="145" rx="32" ry="5.5" fill="#1e293b" stroke="#334155" strokeWidth="1.2" />
                                    
                                    {/* Specimen Slide */}
                                    <rect x="130" y="142" width="22" height="6" fill="rgba(255,255,255,0.7)" stroke="#38bdf8" strokeWidth="0.8" rx="0.5" transform="rotate(-5, 141, 145)" />

                                    {/* Head Turret (Nosepiece) */}
                                    <ellipse cx="128" cy="102" rx="16" ry="12" fill="url(#chrome-grad)" stroke="#94a3b8" strokeWidth="1" />
                                    
                                    {/* Gold Trim Ring */}
                                    <ellipse cx="128" cy="108" rx="15" ry="5" fill="none" stroke="url(#gold-trim)" strokeWidth="2.5" />

                                    {/* Objective Lenses */}
                                    <rect x="116" y="108" width="6" height="16" rx="1.5" fill="url(#chrome-grad)" stroke="#94a3b8" transform="rotate(20, 119, 108)" />
                                    <rect x="130" y="111" width="7" height="20" rx="1.5" fill="url(#metallic-blue)" stroke="#1e3a8a" strokeWidth="0.8" />
                                    <rect x="130" y="127" width="7" height="3" fill="url(#gold-trim)" />

                                    {/* Prism Head Housing */}
                                    <path d="M 105,75 L 85,55 L 100,45 L 120,65 Z" fill="url(#body-grad)" stroke="#cbd5e1" strokeWidth="1" />
                                    
                                    {/* Eyepiece Holder Tubes */}
                                    <rect x="80" y="44" width="12" height="20" rx="1" fill="url(#chrome-grad)" stroke="#475569" strokeWidth="1" transform="rotate(-30, 86, 54)" />
                                    
                                    {/* Rubber Eye Cup */}
                                    <ellipse cx="73" cy="38" rx="8" ry="4" fill="#0f172a" stroke="#334155" strokeWidth="1" transform="rotate(-30, 73, 38)" />
                                    <circle cx="73" cy="38" r="3" fill="#000" />
                                </g>
                            </svg>
                        </div>
                    </div>
                    <div className="mt-6">
                        {/* Bottom pill trust indicator */}
                        <div className="inline-flex items-center gap-2 py-[10px] px-[20px] bg-white border border-gray-200 rounded-full text-[12px] font-bold text-[#6b7280] shadow-sm self-start">
                            <ShieldCheck className="w-[15px] h-[15px] text-[#cc9a3d]" />
                            <span>Secure <span className="text-[#d3d7de] mx-1.5">•</span> Reliable <span className="text-[#d3d7de] mx-1.5">•</span> NABL Certified</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Center Glowing Hexagon Badge (Desktop lg screens only) */}
            <div className="absolute top-1/2 left-[47.2%] -translate-x-1/2 -translate-y-1/2 z-20 hidden lg:block">
              <svg width="240" height="240" viewBox="0 0 220 220">
                <defs>
                  <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#3a6fd8" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#3a6fd8" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="hexfill" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1e3a8a" />
                    <stop offset="100%" stopColor="#081736" />
                  </linearGradient>
                </defs>

                {/* outer soft glow */}
                <circle cx="110" cy="110" r="105" fill="url(#glow)" />

                {/* dashed ring */}
                <circle
                  cx="110"
                  cy="110"
                  r="78"
                  fill="none"
                  stroke="#5a86d6"
                  strokeWidth="1"
                  strokeDasharray="3 6"
                  opacity="0.6"
                />

                {/* navy hexagon with gold stroke */}
                <polygon
                  points="110,45 165,77 165,143 110,175 55,143 55,77"
                  fill="url(#hexfill)"
                  stroke="#cc9a3d"
                  strokeWidth="2.5"
                />

                {/* gold pulse line */}
                <polyline
                  points="72,110 92,110 100,88 116,132 124,110 148,110"
                  fill="none"
                  stroke="#e0b667"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* sparkle highlight */}
                <circle cx="78" cy="70" r="3" fill="#fff" opacity="0.9" />
                <circle cx="66" cy="85" r="1.6" fill="#fff" opacity="0.7" />
              </svg>
            </div>

            {/* Scattered faint background hexagons and glowing dots */}
            <div className="absolute inset-y-0 right-0 left-[55%] z-0 pointer-events-none hidden lg:block">
                <div className="absolute top-[15%] right-[10%] opacity-15">
                    <svg width="140" height="140" viewBox="0 0 100 100" fill="none">
                        <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="#ffffff" strokeWidth="1" />
                    </svg>
                </div>
                <div className="absolute bottom-[22%] left-[10%] opacity-10">
                    <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                        <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="#ffffff" strokeWidth="1" />
                    </svg>
                </div>
                <div className="absolute bottom-[10%] right-[25%] opacity-[0.06]">
                    <svg width="70" height="70" viewBox="0 0 100 100" fill="none">
                        <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="#ffffff" strokeWidth="1" />
                    </svg>
                </div>
                {/* Glowing blue dots */}
                <div className="absolute top-[28%] right-[32%] w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_#60a5fa] animate-ping" style={{ animationDuration: '3s' }}></div>
                <div className="absolute bottom-[35%] right-[15%] w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa] opacity-60"></div>
            </div>

            {/* Right Panel / Login Card (Centered on small screens, flex item on large) */}
            <div className="w-full lg:w-[45%] flex items-center justify-center p-6 lg:p-8 relative z-10 h-full bg-transparent">
                <div className="bg-white rounded-[24px] px-[28px] pt-[28px] pb-[24px] max-w-[360px] w-full border border-gray-100 relative h-fit" style={{ boxShadow: '0 30px 60px rgba(10,25,60,0.18)' }}>
                    {/* Header */}
                    <div className="mb-6">
                        <h2 className="text-[30px] font-black text-[#0a1e46] leading-none mb-2">Welcome Back</h2>
                        <p className="text-sm text-[#6b7280] font-medium">Please login to your account</p>
                    </div>

                    {/* Tabs switcher */}
                    <div className="flex border-b border-gray-100 mb-6 relative">
                        <button 
                            className={`flex-1 py-3 text-sm font-bold text-center transition-all ${activeTab === 'login' ? 'text-[#0a1e46] border-b-2 border-[#0a1e46]' : 'text-gray-400'}`}
                            onClick={() => setActiveTab('login')}
                        >
                            Login
                        </button>
                        <button 
                            className={`flex-1 py-3 text-sm font-bold text-center transition-all ${activeTab === 'citizen' ? 'text-[#0a1e46] border-b-2 border-[#0a1e46]' : 'text-gray-400'}`}
                            onClick={() => setActiveTab('citizen')}
                        >
                            Citizen Portal
                        </button>
                    </div>

                    {message && (
                        <div className="p-2 bg-red-50 text-red-500 rounded-lg text-[11px] font-bold text-center mb-4 border border-red-100">
                            {message}
                        </div>
                    )}

                    <div className="h-[280px] w-full relative">
                        {activeTab === 'login' ? (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                                {/* Email or Phone field */}
                                <div className="flex flex-col">
                                    <div className="relative flex items-center">
                                        <User className="absolute left-[14px] w-[17px] h-[17px] text-[#9aa1ac]" />
                                        <input 
                                            type="email" 
                                            placeholder="Email or Phone Number" 
                                            className="w-full pl-[40px] pr-[14px] py-[10px] border-[1.5px] border-[#e6e8ee] rounded-[11px] text-sm font-semibold text-[#0a1e46] outline-none focus:border-[#0a1e46] focus:ring-0 transition-all"
                                            value={email} 
                                            onChange={(e) => setEmail(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                </div>

                                {/* Password field */}
                                <div className="flex flex-col">
                                    <div className="relative flex items-center">
                                        <Lock className="absolute left-[14px] w-[17px] h-[17px] text-[#9aa1ac]" />
                                        <input 
                                            type={showPassword ? 'text' : 'password'} 
                                            placeholder="Enter your password" 
                                            className="w-full pl-[40px] pr-12 py-[10px] border-[1.5px] border-[#e6e8ee] rounded-[11px] text-sm font-semibold text-[#0a1e46] outline-none focus:border-[#0a1e46] focus:ring-0 transition-all"
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)} 
                                            required 
                                        />
                                        <button 
                                            type="button" 
                                            className="absolute right-4 text-[#9aa1ac] flex items-center justify-center p-0"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="w-[17px] h-[17px] text-[#9aa1ac]" /> : <Eye className="w-[17px] h-[17px] text-[#9aa1ac]" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember & Forgot Password row */}
                                <div className="flex justify-between items-center text-xs font-bold mb-1">
                                    <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="cursor-pointer rounded border-gray-300 text-[#0a1e46] focus:ring-[#0a1e46]" 
                                            checked={rememberMe} 
                                            onChange={(e) => setRememberMe(e.target.checked)} 
                                        /> Remember me
                                    </label>
                                    <a href="#" className="text-[#1e3a8a] hover:underline">Forgot Password?</a>
                                </div>

                                {/* Login Button */}
                                <button type="submit" className="w-full py-[11px] text-white rounded-[12px] font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all relative" style={{ background: 'linear-gradient(135deg, #2451a8, #0a1e46, #081736)', boxShadow: '0 12px 24px rgba(10,30,70,0.32)' }}>
                                    <span>Login</span>
                                    <span className="absolute right-4 w-6 h-6 bg-white/15 rounded-full flex items-center justify-center">
                                        <ChevronRight className="w-4 h-4 text-white" strokeWidth={3} />
                                    </span>
                                </button>

                                {/* Separator */}
                                <div className="relative text-center my-1.5">
                                    <div className="absolute inset-y-1/2 left-0 right-0 h-px bg-gray-100 z-0"></div>
                                    <span className="relative z-10 bg-white px-4 text-xs font-bold text-gray-400">or</span>
                                </div>

                                {/* Google Login */}
                                <div className="flex justify-center mt-1">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => alert('Login Failed')}
                                        useOneTap
                                        theme="filled_blue"
                                        shape="pill"
                                        size="large"
                                        text="signin_with"
                                        width="100%"
                                    />
                                </div>
                            </form>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {!otpSent ? (
                                    <form onSubmit={handleSendOTP} className="flex flex-col gap-2.5">
                                        <div className="flex flex-col">
                                            <div className="relative flex items-center">
                                                <User className="absolute left-[14px] w-[17px] h-[17px] text-[#9aa1ac]" />
                                                <input 
                                                    type="text" 
                                                    name="name"
                                                    placeholder="Full Name (e.g. John Doe)" 
                                                    className="w-full pl-[40px] pr-[14px] py-[10px] border-[1.5px] border-[#e6e8ee] rounded-[11px] text-sm font-semibold text-[#0a1e46] outline-none focus:border-[#0a1e46] focus:ring-0 transition-all"
                                                    value={regData.name} 
                                                    onChange={handleRegChange} 
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="relative flex items-center">
                                                <Mail className="absolute left-[14px] w-[17px] h-[17px] text-[#9aa1ac]" />
                                                <input 
                                                    type="email" 
                                                    name="email"
                                                    placeholder="Email Address" 
                                                    className="w-full pl-[40px] pr-[14px] py-[10px] border-[1.5px] border-[#e6e8ee] rounded-[11px] text-sm font-semibold text-[#0a1e46] outline-none focus:border-[#0a1e46] focus:ring-0 transition-all"
                                                    value={regData.email} 
                                                    onChange={handleRegChange} 
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="relative flex items-center">
                                                <Phone className="absolute left-[14px] w-[17px] h-[17px] text-[#9aa1ac]" />
                                                <input 
                                                    type="text" 
                                                    name="phone"
                                                    placeholder="Phone Number" 
                                                    className="w-full pl-[40px] pr-[14px] py-[10px] border-[1.5px] border-[#e6e8ee] rounded-[11px] text-sm font-semibold text-[#0a1e46] outline-none focus:border-[#0a1e46] focus:ring-0 transition-all"
                                                    value={regData.phone} 
                                                    onChange={handleRegChange} 
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="relative flex items-center">
                                                <Lock className="absolute left-[14px] w-[17px] h-[17px] text-[#9aa1ac]" />
                                                <input 
                                                    type="password" 
                                                    name="password"
                                                    placeholder="Choose Password" 
                                                    className="w-full pl-[40px] pr-[14px] py-[10px] border-[1.5px] border-[#e6e8ee] rounded-[11px] text-sm font-semibold text-[#0a1e46] outline-none focus:border-[#0a1e46] focus:ring-0 transition-all"
                                                    value={regData.password} 
                                                    onChange={handleRegChange} 
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full mt-1 py-[11px] text-white rounded-[12px] font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all relative" style={{ background: 'linear-gradient(135deg, #cc9a3d, #b48530)', boxShadow: '0 8px 16px rgba(204,154,61,0.25)' }}>
                                            <span>Generate Identity Code</span>
                                            <span className="absolute right-4 w-6 h-6 bg-white/15 rounded-full flex items-center justify-center">
                                                <ChevronRight className="w-4 h-4 text-white" strokeWidth={3} />
                                            </span>
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
                                        <div className="text-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Secure OTP Verification</label>
                                            <input 
                                                type="text" 
                                                placeholder="000000" 
                                                className="w-full text-center text-2xl font-bold tracking-[8px] bg-transparent border-none outline-none text-[#0a1e46]"
                                                value={otp} 
                                                onChange={(e) => setOtp(e.target.value)} 
                                                maxLength="6"
                                                required 
                                            />
                                            <p className="text-xs text-gray-400 mt-2">Sent to {regData.phone || regData.email}</p>
                                        </div>
                                        
                                        <button type="submit" disabled={verifying} className="w-full py-3 bg-[#10b981] text-white rounded-[12px] font-bold hover:shadow-lg transition-all">
                                            {verifying ? 'Validating Token...' : 'Verify & Complete Setup'}
                                        </button>
                                        
                                        <div className="text-center text-xs font-bold">
                                            {timer > 0 ? (
                                                <span className="text-gray-400">Resend code in <span className="text-[#0a1e46]">{timer}s</span></span>
                                            ) : (
                                                <button type="button" onClick={() => handleSendOTP(null)} className="text-[#1e3a8a] hover:underline">
                                                    Resend Verification Code
                                                </button>
                                            )}
                                        </div>
                                        
                                        <button type="button" onClick={() => setOtpSent(false)} className="text-xs font-bold text-gray-400 hover:text-gray-600 mt-2">
                                            Back to Edit Details
                                        </button>
                                    </form>
                                )}

                            </div>
                        )}
                    </div>

                    {/* New here Create Account prompt */}
                    <div className={`text-center mt-3 text-xs font-bold transition-all ${activeTab === 'login' ? 'text-gray-400' : 'opacity-0 pointer-events-none'}`}>
                        New here? <button onClick={() => setActiveTab('citizen')} className="text-[#1e3a8a] hover:underline">Create an account</button>
                    </div>

                    {/* Bottom trust strip */}
                    <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-[26px] h-[26px] rounded-full bg-blue-50 text-royal-blue flex items-center justify-center">
                                <ShieldCheck className="w-[14px] h-[14px] text-[#1e3a8a]" strokeWidth={2.5} />
                            </div>
                            <div className="flex items-center">
                                <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100" alt="Doctor" className="w-[26px] h-[26px] rounded-full border-2 border-white" />
                                <img src="https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=100" alt="Doctor" className="w-[26px] h-[26px] rounded-full border-2 border-white -ml-[8px]" />
                                <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=100" alt="Doctor" className="w-[26px] h-[26px] rounded-full border-2 border-white -ml-[8px]" />
                            </div>
                        </div>
                        <span className="text-[12.5px] font-semibold text-[#6b7280] whitespace-nowrap">Trusted by 1000+ Hospitals & Labs</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
