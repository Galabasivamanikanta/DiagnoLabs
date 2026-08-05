import React, { useState, useRef, useEffect } from 'react';
import { getGenerativeModel } from "firebase/vertexai";
import { vertexAI } from "../config/firebase";
import { Bot, X, Send, User, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SmartAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your DiagnoLabs AI Assistant. How can I help you with your health or bookings today?", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    
    // Store chat history for the AI model to maintain context
    const [chatSession, setChatSession] = useState(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Initialize Vertex AI model when component mounts
        try {
            const model = getGenerativeModel(vertexAI, { 
                model: "gemini-1.5-flash",
                systemInstruction: "You are a helpful, empathetic, and professional AI assistant for DiagnoLabs, a clinical pathology lab. You help users understand diagnostic tests, booking procedures, and general health info. Never give formal medical diagnoses. Always recommend consulting a doctor for serious issues."
            });
            const session = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: "Hello" }]
                    },
                    {
                        role: "model",
                        parts: [{ text: "Hello! I'm your DiagnoLabs AI Assistant. How can I help you with your health or bookings today?" }]
                    }
                ]
            });
            setChatSession(session);
        } catch (err) {
            console.error("Vertex AI Initialization Error:", err);
        }
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !chatSession) return;

        const userText = input.trim();
        setInput('');
        setMessages(prev => [...prev, { text: userText, sender: 'user' }]);
        setLoading(true);

        try {
            const result = await chatSession.sendMessage(userText);
            const responseText = result.response.text();
            setMessages(prev => [...prev, { text: responseText, sender: 'ai' }]);
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { text: "I'm sorry, I'm having trouble connecting to the network right now. Please try again later.", sender: 'ai' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 animate-bounce"
                    style={{ animationDuration: '3s' }}
                >
                    <Bot className="text-white w-7 h-7" />
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[380px] h-[550px] max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-100 flex flex-col font-sans">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#0a1e46] to-[#163a7a] p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Sparkles className="text-[#cc9a3d] w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg leading-tight">Diagno AI</h3>
                                <p className="text-blue-200 text-xs font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Online
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-[#f8fafc] flex flex-col gap-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-[#0a1e46] text-white rounded-tr-sm' : 'bg-white text-gray-700 border border-gray-100 rounded-tl-sm'}`}>
                                    {msg.sender === 'ai' ? (
                                        <div className="prose prose-sm max-w-none">
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-2 max-w-[85%] self-start">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                    <Bot size={16} />
                                </div>
                                <div className="p-4 rounded-2xl bg-white border border-gray-100 rounded-tl-sm flex gap-1 items-center shadow-sm">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        <form onSubmit={handleSend} className="flex items-center gap-2 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about tests, symptoms..."
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all pr-10"
                                disabled={loading || !chatSession}
                            />
                            <button 
                                type="submit" 
                                disabled={loading || !input.trim() || !chatSession}
                                className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
                            </button>
                        </form>
                        <div className="text-center mt-2">
                            <span className="text-[10px] text-gray-400 font-medium">Powered by Google Vertex AI</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SmartAssistant;
