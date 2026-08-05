import React, { useState, useEffect, useContext, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthContext } from '../context/AuthContext';
import { MessageCircle, X, Send, User } from 'lucide-react';

const LiveSupport = () => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    
    // We will use a single global room for demo purposes, 
    // but in production, we'd use a unique room per user ID: `support_rooms/${user._id}/messages`
    const roomPath = user ? `support_rooms/${user._id}/messages` : 'support_rooms/guest/messages';

    useEffect(() => {
        if (!isOpen) return;
        
        const q = query(collection(db, roomPath), orderBy('timestamp', 'asc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        });

        return () => unsubscribe();
    }, [isOpen, roomPath]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msgText = newMessage.trim();
        setNewMessage('');

        try {
            await addDoc(collection(db, roomPath), {
                text: msgText,
                senderId: user ? user._id : 'guest',
                senderName: user ? user.name : 'Guest',
                isAdmin: false,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error("Error sending message: ", error);
            alert("Failed to send message. Check console.");
        }
    };

    return (
        <>
            {/* Floating Support Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50"
                >
                    <MessageCircle className="text-white w-7 h-7" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[350px] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-100">
                    
                    {/* Header */}
                    <div className="bg-emerald-600 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <MessageCircle className="text-white w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-md leading-tight">Live Support</h3>
                                <p className="text-emerald-100 text-[10px] font-medium">Real-time chat via Firestore</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-1 rounded transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
                        <div className="text-center mb-4">
                            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Chat started</span>
                        </div>
                        
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full opacity-50">
                                <MessageCircle size={40} className="text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500 text-center px-4">No messages yet. Send a message to connect with a support agent.</p>
                            </div>
                        )}
                        
                        {messages.map((msg) => {
                            const isMe = msg.senderId === (user ? user._id : 'guest');
                            return (
                                <div key={msg.id} className={`flex gap-2 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}>
                                    <div className={`w-7 h-7 rounded-full flex flex-shrink-0 items-center justify-center text-xs ${isMe ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                        <User size={14} />
                                    </div>
                                    <div className={`p-2.5 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-700 rounded-tl-sm'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 pr-10"
                            />
                            <button 
                                type="submit" 
                                disabled={!newMessage.trim()}
                                className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                            >
                                <Send size={12} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default LiveSupport;
