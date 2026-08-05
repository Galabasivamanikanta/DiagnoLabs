import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { Bell, ShieldAlert, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import './NotificationBell.css';

const NotificationBell = () => {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Optional: Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'Security': return <ShieldAlert size={16} className="text-red-500" />;
            case 'Alert': return <AlertTriangle size={16} className="text-amber-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    const unreadCount = notifications.length;

    return (
        <div className="relative notification-bell-wrapper" ref={dropdownRef}>
            <button 
                className="topbar-icon-btn relative"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all duration-200">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-medium">
                            {unreadCount} New
                        </span>
                    </div>

                    <div className="max-h-[350px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 flex flex-col items-center">
                                <CheckCircle2 size={32} className="text-green-400 mb-2" />
                                <p className="text-sm">You're all caught up!</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div key={notif._id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 group relative cursor-pointer" onClick={() => markAsRead(notif._id)}>
                                    <div className="mt-0.5 shrink-0">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 mb-0.5">{notif.title}</p>
                                        <p className="text-xs text-gray-500 leading-relaxed truncate-2-lines">{notif.message}</p>
                                        <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                                            {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {new Date(notif.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
