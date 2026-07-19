import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, User, FileImage, Clipboard, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const AIChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([
        { role: 'model', content: "Hello! I'm your DiagnoLabs Clinical Assistant. You can ask me about symptoms or upload an X-ray/Report for analysis. How are you feeling today?" }
    ]);
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState('');
    const [fileBase64, setFileBase64] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chat]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setFileBase64(reader.result.split(',')[1]); // Only the base64 part
            };
        }
    };

    const handleSend = async () => {
        if (!message && !fileBase64) return;

        const userMsg = { role: 'user', content: message || "Analyze attached report." };
        setChat([...chat, userMsg]);
        setMessage('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/api/chat`, {
                message: message,
                fileData: fileBase64,
                fileType: 'image/jpeg'
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setChat(prev => [...prev, { role: 'model', content: res.data.reply }]);
        } catch {
            setChat(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting to my medical database. Please try again later." }]);
        } finally {
            setLoading(false);
            setFileBase64(null);
            setFileName('');
        }
    };

    const renderMessage = (msg) => {
        const text = msg.content;
        const recommendMatch = text.match(/\[RECOMMEND:\s*(.*?)\]/);
        const cleanText = text.replace(/\[RECOMMEND:\s*.*?\]/g, '');

        return (
            <div>
                <p style={{ margin: 0 }}>{cleanText}</p>
                {recommendMatch && (
                    <motion.button 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="btn btn-sm btn-primary mt-2 d-flex align-items-center gap-2" 
                        style={{ borderRadius: '10px' }}
                    >
                        Book {recommendMatch[1]} <ArrowRight size={14} />
                    </motion.button>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Bubble Button */}
            <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    width: '64px',
                    height: '64px',
                    background: 'var(--primary)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    zIndex: 1000
                }}
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
            </motion.div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 100 }}
                        style={{
                            position: 'fixed',
                            bottom: '110px',
                            right: '30px',
                            width: '400px',
                            height: '600px',
                            background: 'white',
                            borderRadius: '30px',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            zIndex: 1000
                        }}
                    >
                        {/* Header */}
                        <div style={{ background: 'var(--primary)', color: 'white', padding: '20px 25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '45px', height: '45px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={28} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>Clinical Assistant</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <div style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }}></div> Powered by Gemini 1.5 Flash
                                </div>
                            </div>
                        </div>

                        {/* Chat Body */}
                        <div ref={scrollRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f8fafc' }}>
                            {chat.map((msg, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '20px' }}>
                                    <div style={{ 
                                        maxWidth: '85%', 
                                        padding: '12px 18px', 
                                        borderRadius: msg.role === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                                        background: msg.role === 'user' ? 'var(--primary)' : 'white',
                                        color: msg.role === 'user' ? 'white' : '#1e293b',
                                        boxShadow: msg.role === 'user' ? '0 10px 20px hsla(var(--primary-hsl), 0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.4'
                                    }}>
                                        {renderMessage(msg)}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-muted)' }}>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Analyzing clinical context...</span>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9' }}>
                            {fileName && (
                                <div style={{ fontSize: '0.75rem', background: '#f8fafc', padding: '5px 10px', borderRadius: '5px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>📎 {fileName}</span>
                                    <X size={14} style={{ cursor: 'pointer' }} onClick={() => {setFileName(''); setFileBase64(null);}} />
                                </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    <FileImage size={24} />
                                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="Type symptoms or ask about reports..." 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    style={{ flex: 1, border: 'none', background: '#f8fafc', padding: '12px 15px', borderRadius: '12px', outline: 'none', fontSize: '0.9rem' }}
                                />
                                <motion.div 
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleSend}
                                    style={{ width: '45px', height: '45px', background: 'var(--primary)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                >
                                    <Send size={20} />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
        </>
    );
};

export default AIChatBot;
