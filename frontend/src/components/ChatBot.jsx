import { useState, useRef, useEffect, useContext } from 'react';
import { 
    MessageSquare, Send, Bot, User, Sparkles, ChevronDown, RefreshCw, 
    Mic, MicOff, Paperclip, FileText, CheckCircle2, ArrowRight, X, Loader2, FlaskConical, Droplets, Thermometer, Zap, Pill, HeartPulse, Microscope, ShieldCheck, Activity 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';


const ChatBot = () => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);

    const [messages, setMessages] = useState([
        { id: 1, text: "Hello. I am the DiagnoLabs Clinical Intelligence system. \n\nI am configured to assist with diagnostic test selection, clinical report analysis, and nationwide laboratory coordination. How may I support your health monitoring today?", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [attachedFile, setAttachedFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Setup Native Browser Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    if (recognition) {
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputValue(transcript);
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error("Speech Recognition Error:", event.error);
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);
    }

    const toggleListening = () => {
        if (!recognition) {
            alert("Voice search is not supported by your current browser. Please use Chrome or Edge.");
            return;
        }
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
            setIsListening(true);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size exceeds 5MB. Please upload a smaller report.");
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachedFile({
                    name: file.name,
                    mimeType: file.type,
                    data: reader.result.split(',')[1] // remove data:image/png;base64,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = async () => {
        if (!inputValue.trim() && !attachedFile) return;

        const textMsg = attachedFile ? `[Uploaded Report: ${attachedFile.name}] ${inputValue}` : inputValue;
        const userMessage = { id: Date.now(), text: textMsg, sender: 'user' };
        
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        if (attachedFile) setIsAnalyzing(true);

        try {
            const chatHistory = messages.filter(m => !m.isError).slice(-6).map(m => ({
                role: m.sender === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            }));

            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/api/chat`, {
                prompt: inputValue,
                history: chatHistory,
                fileData: attachedFile?.data, // Send raw base64 string
                fileType: attachedFile?.mimeType, // Send mime type separately
                userName: user?.name || 'Guest'
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });



            // Extract recommendation and action tokens
            const reply = res.data.reply;
            const recommendationMatch = reply.match(/\[RECOMMEND:\s*([^\]]+)\]/i);
            const recommendedTest = recommendationMatch ? recommendationMatch[1].trim() : null;
            
            const actionMatch = reply.match(/\[ACTION:\s*([^\]]+)\]/i);
            const actionType = actionMatch ? actionMatch[1].trim() : null;

            // Clean the reply from all tokens
            const cleanReply = reply
                .replace(/\[RECOMMEND:[^\]]+\]/gi, '')
                .replace(/\[ACTION:[^\]]+\]/gi, '')
                .trim();

            setMessages(prev => [
                ...prev.filter(m => m.id !== 'error'),
                { 
                    id: Date.now() + 1, 
                    text: cleanReply, 
                    sender: 'bot',
                    recommendation: recommendedTest
                }
            ]);

            // EXECUTE ACTION: Instruction to Action logic
            if (actionType === 'BOOK' && recommendedTest) {
                setTimeout(() => {
                    navigate(`/search?q=${encodeURIComponent(recommendedTest)}`);
                }, 1500); // 1.5s delay to let user read the message
            } else if (actionType === 'REPORTS') {
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            }
            
            setAttachedFile(null);

        } catch (err) {
            console.error("Chat Error:", err);
            const errorDetail = err.response?.data?.details || "Brief connection issue with my medical database.";
            setMessages(prev => [
                ...prev,
                {
                    id: 'error',
                    text: `I'm having a bit of trouble: ${errorDetail}. Please try once more!`,
                    sender: 'bot',
                    isError: true
                }
            ]);
        }
 finally {
            setIsLoading(false);
            setIsAnalyzing(false);
        }
    };

    const getRecommendationIcon = (testName) => {
        const name = testName.toLowerCase();
        if (name.includes('cbc') || name.includes('blood')) return <Droplets className="text-rose-500" />;
        if (name.includes('diabetes') || name.includes('sugar')) return <Thermometer className="text-red-500" />;
        if (name.includes('thyroid')) return <Zap className="text-yellow-600" />;
        if (name.includes('heart') || name.includes('cardiac')) return <HeartPulse className="text-red-600" />;
        if (name.includes('kidney') || name.includes('liver')) return <ShieldCheck className="text-emerald-600" />;
        return <FlaskConical className="text-primary" />;
    };

    const RecommendationCard = ({ testName }) => (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                marginTop: '1rem',
                padding: '1.25rem',
                background: 'white',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getRecommendationIcon(testName)}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Recommended Test</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>{testName} Portfolio</div>
                </div>
            </div>
            <button 
                onClick={() => navigate(`/search?q=${encodeURIComponent(testName)}`)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
                View Nearby Labs <ArrowRight size={16} />
            </button>
        </motion.div>
    );

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '64px',
                    height: '64px',
                    borderRadius: '22px',
                    background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 15px 35px -5px rgba(37, 99, 235, 0.4)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    zIndex: 2000
                }}
            >
                {isOpen ? <ChevronDown size={32} /> : <MessageSquare size={32} />}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 100, scale: 0.9, filter: 'blur(10px)' }}
                        style={{
                            position: 'fixed',
                            bottom: '7.5rem',
                            right: '2rem',
                            width: '420px',
                            height: '650px',
                            background: 'rgba(255, 255, 255, 0.98)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '35px',
                            boxShadow: '0 50px 100px -20px rgba(15, 23, 42, 0.25)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            zIndex: 2000,
                            border: '1px solid rgba(255,255,255,1)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '1.75rem', background: '#0f172a', color: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Sparkles size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            Clinical AI 
                                            {isAnalyzing ? (
                                                <div style={{ fontSize: '0.7rem', background: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', marginLeft: '5px' }}>ANALYZING...</div>
                                            ) : (
                                                <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase' }}>Precision Automation Expert</div>
                                    </div>
                                </div>
                                <RefreshCw size={18} style={{ opacity: 0.5, cursor: 'pointer' }} onClick={() => setMessages([{ id: 1, text: "Conversation history cleared. How can I help you now?", sender: 'bot' }])} />
                            </div>
                        </div>

                        {/* Message Area */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {messages.map(msg => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={msg.id}
                                    style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}
                                >
                                    <div style={{
                                        padding: '1.1rem 1.4rem',
                                        borderRadius: msg.sender === 'user' ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                                        background: msg.sender === 'user' ? '#2563eb' : (msg.isError ? '#fff1f2' : 'white'),
                                        color: msg.sender === 'user' ? 'white' : (msg.isError ? '#1e293b' : '#1e293b'),
                                        boxShadow: msg.sender === 'user' ? '0 10px 20px -5px rgba(37, 99, 235, 0.3)' : '0 4px 6px -1px rgba(0,0,0,0.05)',
                                        fontWeight: '600',
                                        fontSize: '0.98rem',
                                        lineHeight: '1.6',
                                        border: msg.sender === 'bot' ? (msg.isError ? '1px solid #fda4af' : '1px solid #e2e8f0') : 'none',
                                        whiteSpace: 'pre-wrap',
                                        position: 'relative'
                                    }}>
                                        {msg.text}
                                        {msg.recommendation && <RecommendationCard testName={msg.recommendation} />}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div style={{ alignSelf: 'flex-start' }}>
                                    <div style={{ padding: '1rem 1.75rem', borderRadius: '20px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Loader2 size={16} className="animate-spin text-primary" />
                                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>AI Processing...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '1.5rem', background: 'white', borderTop: '1px solid #f1f5f9' }}>
                            {attachedFile && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ 
                                        marginBottom: '1rem', 
                                        padding: '0.75rem 1rem', 
                                        background: '#f0f9ff', 
                                        borderRadius: '12px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        border: '1px solid #bae6fd'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <FileText size={18} className="text-primary" />
                                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0369a1', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {attachedFile.name}
                                        </span>
                                    </div>
                                    <X size={18} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setAttachedFile(null)} />
                                </motion.div>
                            )}
                            
                            <div style={{
                                display: 'flex',
                                gap: '0.75rem',
                                padding: '0.6rem',
                                background: '#f8fafc',
                                borderRadius: '20px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                    accept="image/*,.pdf"
                                />
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '14px',
                                        background: attachedFile ? 'var(--primary-light)' : 'transparent',
                                        color: attachedFile ? 'var(--primary)' : '#64748b',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Paperclip size={20} />
                                </button>

                                <div style={{ position: 'relative', width: '100%' }}>
                                    <input
                                        type="text"
                                        placeholder={isListening ? "Listening..." : "Ask or Analyze Report..."}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        style={{
                                            width: '100%',
                                            border: 'none',
                                            background: 'transparent',
                                            padding: '0.5rem 2.5rem 0.5rem 0',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            outline: 'none',
                                            color: '#0f172a'
                                        }}
                                    />
                                    <button
                                        onClick={toggleListening}
                                        style={{
                                            position: 'absolute',
                                            right: '0',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'transparent',
                                            border: 'none',
                                            color: isListening ? '#e11d48' : '#64748b',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {isListening ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}><Mic size={20} /></motion.div> : <Mic size={20} />}
                                    </button>
                                </div>
                                <button
                                    onClick={handleSend}
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        minWidth: '48px',
                                        borderRadius: '16px',
                                        background: '#2563eb',
                                        color: 'white',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        boxShadow: '0 8px 15px -3px rgba(37, 99, 235, 0.4)'
                                    }}
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <style>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
};

export default ChatBot;
