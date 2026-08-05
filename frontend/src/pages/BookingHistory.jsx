import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import {
    History,
    FlaskConical,
    CheckCircle2,
    Clock,
    XCircle,
    Download,
    Search,
    Filter,
    IdCard,
    CalendarDays,
    Building2,
    BadgeIndianRupee,
    ChevronDown,
    UserCircle,
    Mail,
    Phone,
    FileText,
    Share2,
    RotateCcw,
    HelpCircle,
    Users,
    PhoneCall,
    X,
    Check,
    AlertCircle
} from 'lucide-react';
import ReceiptModal from '../components/patient/ReceiptModal';

const statusConfig = {
    'Pending':            { color: '#b45309', bg: '#fef3c7', icon: <Clock size={14} /> },
    'Confirmed':          { color: '#0369a1', bg: '#e0f2fe', icon: <CheckCircle2 size={14} /> },
    'Out for Collection': { color: '#6d28d9', bg: '#f5f3ff', icon: <FlaskConical size={14} /> },
    'Sample Collected':   { color: '#7c3aed', bg: '#ede9fe', icon: <FlaskConical size={14} /> },
    'Sample Processing':  { color: '#4c1d95', bg: '#f3e8ff', icon: <FlaskConical size={14} /> },
    'Report Uploaded':    { color: '#15803d', bg: '#dcfce7', icon: <CheckCircle2 size={14} /> },
    'Cancelled':          { color: '#b91c1c', bg: '#fee2e2', icon: <XCircle size={14} /> },
};

const BookingHistory = () => {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [familyFilter, setFamilyFilter] = useState('All');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [trackingBooking, setTrackingBooking] = useState(null);
    const [cancellingId, setCancellingId] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    const navigate = useNavigate();

    const getReportUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) {
            try {
                const urlObj = new URL(url);
                if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
                    const apiOrigin = new URL(API_BASE_URL).origin;
                    return `${apiOrigin}${urlObj.pathname}${urlObj.search}`;
                }
            } catch { /* ignore */ }
            return url;
        }
        return `${API_BASE_URL.replace('/api', '')}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const fetchBookings = useCallback(async () => {
        if (!user) return;
        try {
            const res = await axios.get(
                `${API_BASE_URL}/api/bookings/user/${user._id}`, 
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setBookings(sorted);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setMessage({ text: 'Failed to load booking history.', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) { navigate('/userlogin'); return; }
        fetchBookings();
    }, [user, navigate, fetchBookings]);

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        setCancellingId(bookingId);
        try {
            await axios.put(
                `${API_BASE_URL}/api/bookings/${bookingId}/status`,
                { status: 'Cancelled' },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setMessage({ text: 'Booking cancelled successfully.', type: 'success' });
            fetchBookings();
            setTimeout(() => setMessage({ text: '', type: '' }), 4000);
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Failed to cancel booking', type: 'error' });
        } finally {
            setCancellingId(null);
        }
    };

    const handleReBook = (booking) => {
        if (!booking?.testDetails || booking.testDetails.length === 0) return;
        // Store selected tests into localStorage cart and navigate to checkout
        const cartItems = booking.testDetails.map(t => ({
            _id: t.testId || t._id,
            name: t.testName,
            price: t.price
        }));
        localStorage.setItem('cart', JSON.stringify(cartItems));
        setMessage({ text: 'Tests added to cart! Redirecting to checkout...', type: 'success' });
        setTimeout(() => navigate('/checkout'), 1200);
    };

    const handleShareWhatsApp = (booking) => {
        const reportLink = getReportUrl(booking.reportUrl);
        const text = `Hi, here is my DiagnoLabs Pathology Report for ${booking.testDetails?.[0]?.testName || 'Diagnostic Test'}: ${reportLink || 'Available in DiagnoLabs Portal'}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    };

    // Filter Logic
    const filtered = bookings.filter(b => {
        const matchSearch =
            b._id.toLowerCase().includes(search.toLowerCase()) ||
            b.testDetails?.some(t => t.testName?.toLowerCase().includes(search.toLowerCase())) ||
            b.lab?.name?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'All' || b.status === statusFilter;
        
        // Family Member match (check if patient name matches family member or self)
        const patientName = b.patientName || b.patient?.name || user?.name;
        const matchFamily = familyFilter === 'All' || 
            (familyFilter === 'Self' && patientName?.toLowerCase() === user?.name?.toLowerCase()) ||
            (patientName?.toLowerCase().includes(familyFilter.toLowerCase()));

        return matchSearch && matchStatus && matchFamily;
    });

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: '6.5rem', paddingBottom: '5rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <div className="container" style={{ maxWidth: '1100px', padding: '0 1.25rem' }}>

                {/* Floating Notification */}
                {message.text && (
                    <div style={{ 
                        position: 'fixed',
                        bottom: '25px',
                        right: '25px',
                        zIndex: 9999,
                        padding: '1rem 1.5rem', 
                        borderRadius: '16px', 
                        boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                        background: message.type === 'success' ? '#065f46' : '#991b1b',
                        color: 'white',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        {message.type === 'success' ? <Check size={20} /> : <X size={20} />}
                        <span>{message.text}</span>
                    </div>
                )}

                {/* Premium Glassmorphism Header */}
                <div style={{ 
                    background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #0f172a 100%)',
                    borderRadius: '24px',
                    padding: '2.25rem 2.5rem',
                    color: 'white',
                    boxShadow: '0 15px 35px rgba(3, 105, 161, 0.22)',
                    marginBottom: '2rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <History size={28} color="#38bdf8" />
                                <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
                                    Diagnostic Test History
                                </h1>
                            </div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
                                Track home sample collections, download accredited PDF reports, and view past test receipts.
                            </p>
                        </div>

                        {/* Customer Badge */}
                        <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', padding: '0.8rem 1.4rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.5px' }}>
                                Customer ID
                            </div>
                            <div style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '1.2rem', color: '#7dd3fc', letterSpacing: '1px' }}>
                                {user?.customerId || 'DL-XXXXXXXX'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Counter Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Total Bookings', value: bookings.length, color: '#0369a1', bg: '#e0f2fe', icon: History },
                        { label: 'Reports Ready', value: bookings.filter(b => b.status === 'Report Uploaded').length, color: '#15803d', bg: '#dcfce7', icon: CheckCircle2 },
                        { label: 'In Progress / Pending', value: bookings.filter(b => ['Pending', 'Confirmed', 'Out for Collection', 'Sample Collected', 'Sample Processing'].includes(b.status)).length, color: '#b45309', bg: '#fef3c7', icon: Clock },
                        { label: 'Cancelled', value: bookings.filter(b => b.status === 'Cancelled').length, color: '#b91c1c', bg: '#fee2e2', icon: XCircle }
                    ].map(stat => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} style={{ background: 'white', padding: '1.25rem', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: stat.bg, color: stat.color, padding: '0.75rem', borderRadius: '14px', display: 'flex' }}>
                                    <Icon size={22} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0f172a', lineHeight: '1.2' }}>{stat.value}</div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>{stat.label}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Search & Multi-Filters */}
                <div style={{ background: 'white', padding: '1.25rem', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Search Input */}
                    <div style={{ position: 'relative', flex: '1 1 280px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search test name, lab, or booking ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: '600', outline: 'none', fontSize: '0.9rem' }}
                        />
                    </div>

                    {/* Status Filter */}
                    <div style={{ position: 'relative', flex: '1 1 180px' }}>
                        <Filter size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem 2.2rem 0.75rem 2.4rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: '700', outline: 'none', appearance: 'none', cursor: 'pointer', fontSize: '0.88rem', color: '#334155', background: 'white' }}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Out for Collection">Out for Collection</option>
                            <option value="Sample Collected">Sample Collected</option>
                            <option value="Sample Processing">Sample Processing</option>
                            <option value="Report Uploaded">Report Uploaded</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    </div>

                    {/* Family Member Filter */}
                    {user?.familyMembers && user.familyMembers.length > 0 && (
                        <div style={{ position: 'relative', flex: '1 1 180px' }}>
                            <Users size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <select
                                value={familyFilter}
                                onChange={e => setFamilyFilter(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 2.2rem 0.75rem 2.4rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: '700', outline: 'none', appearance: 'none', cursor: 'pointer', fontSize: '0.88rem', color: '#334155', background: 'white' }}
                            >
                                <option value="All">All Family Members</option>
                                <option value="Self">Self ({user.name})</option>
                                {user.familyMembers.map((m, idx) => (
                                    <option key={idx} value={m.name}>{m.relation}: {m.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                        </div>
                    )}
                </div>

                {/* Bookings Card List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                            <div style={{ width: '36px', height: '36px', border: '4px solid #e2e8f0', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                            Loading booking records...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                            <History size={44} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
                            <h3 style={{ margin: '0 0 0.4rem 0', color: '#334155', fontWeight: '800' }}>No Bookings Found</h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Try searching with a different term or status filter.</p>
                        </div>
                    ) : (
                        filtered.map((b, idx) => {
                            const cfg = statusConfig[b.status] || statusConfig['Pending'];
                            const isCompleted = b.status === 'Report Uploaded' || !!b.reportUrl;
                            const isPendingOrConfirmed = ['Pending', 'Confirmed'].includes(b.status);

                            return (
                                <div key={b._id} style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
                                    
                                    {/* Card Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8' }}>#{idx + 1}</span>
                                            <span style={{ fontFamily: 'monospace', fontWeight: '900', color: '#0369a1', fontSize: '1.1rem', letterSpacing: '1px' }}>
                                                DH-{b._id.slice(-8).toUpperCase()}
                                            </span>
                                            <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                                👤 Patient: {b.patientName || user?.name}
                                            </span>
                                        </div>
                                        
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1.1rem', borderRadius: '100px', background: cfg.bg, color: cfg.color, fontWeight: '800', fontSize: '0.85rem' }}>
                                            {cfg.icon} {b.status}
                                        </span>
                                    </div>

                                    {/* Info Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: '14px', marginBottom: '1.25rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Date & Slot</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '800', color: '#0f172a', fontSize: '0.9rem' }}>
                                                <CalendarDays size={15} color="#0284c7" />
                                                {b.appointmentDate ? new Date(b.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', paddingLeft: '1.3rem', marginTop: '0.1rem' }}>
                                                {b.appointmentTime || 'Morning Slot'}
                                            </div>
                                        </div>

                                        <div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Test Package</div>
                                            <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>
                                                {b.testDetails?.[0]?.testName || 'Diagnostic Test'}
                                            </div>
                                            {b.testDetails?.length > 1 && (
                                                <div style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: '700', marginTop: '0.1rem' }}>
                                                    +{b.testDetails.length - 1} more tests included
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Lab Partner</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '800', color: '#0f172a', fontSize: '0.9rem' }}>
                                                <Building2 size={15} color="#0284c7" />
                                                {b.lab?.name || 'NABL Accredited Lab'}
                                            </div>
                                        </div>

                                        <div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Total Bill</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: '900', color: '#15803d', fontSize: '1.2rem' }}>
                                                ₹{b.totalAmount?.toLocaleString('en-IN')}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>
                                                {b.paymentStatus || 'Paid'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Phlebotomist / Sample Collector Info Card (If dispatched) */}
                                    {['Out for Collection', 'Sample Collected', 'Sample Processing'].includes(b.status) && (
                                        <div style={{ background: '#f0f9ff', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #bae6fd', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ background: '#0284c7', color: 'white', padding: '0.6rem', borderRadius: '10px' }}>
                                                    <FlaskConical size={20} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0369a1', textTransform: 'uppercase' }}>Sample Collector Assigned</div>
                                                    <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0c4a6e' }}>Rajesh Sharma (Phlebotomist ID: PH-902)</div>
                                                </div>
                                            </div>
                                            <a href="tel:9876543210" style={{ background: '#0284c7', color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <PhoneCall size={14} /> Call Collector
                                            </a>
                                        </div>
                                    )}

                                    {/* Action Buttons Toolbar */}
                                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                                        {/* View PDF Report */}
                                        {isCompleted && (
                                            <a
                                                href={getReportUrl(b.reportUrl)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', background: '#15803d', color: 'white', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', textDecoration: 'none' }}
                                            >
                                                <Download size={15} /> Download PDF Report
                                            </a>
                                        )}

                                        {/* Share on WhatsApp */}
                                        <button
                                            onClick={() => handleShareWhatsApp(b)}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', background: '#25d366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                                            title="Share report via WhatsApp"
                                        >
                                            <Share2 size={15} /> Share
                                        </button>

                                        {/* Receipt */}
                                        <button
                                            onClick={() => setSelectedBooking(b)}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                                        >
                                            <FileText size={15} /> Receipt
                                        </button>

                                        {/* Track Process */}
                                        <button
                                            onClick={() => setTrackingBooking(b)}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                                        >
                                            <Clock size={15} /> Track Process
                                        </button>

                                        {/* Re-Book Test */}
                                        <button
                                            onClick={() => handleReBook(b)}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', background: '#f8fafc', color: '#0284c7', border: '1px solid #7dd3fc', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                                        >
                                            <RotateCcw size={15} /> Re-Book Test
                                        </button>

                                        {/* Cancel Booking (Only if pending or confirmed) */}
                                        {isPendingOrConfirmed && (
                                            <button
                                                onClick={() => handleCancelBooking(b._id)}
                                                disabled={cancellingId === b._id}
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                                            >
                                                <XCircle size={15} /> Cancel Order
                                            </button>
                                        )}

                                        {/* Need Help Support Link */}
                                        <button
                                            onClick={() => navigate('/support')}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', marginLeft: 'auto' }}
                                        >
                                            <HelpCircle size={15} /> Need Help?
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Count */}
                {!loading && filtered.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: '2rem', color: '#64748b', fontWeight: '600', fontSize: '0.9rem' }}>
                        Showing {filtered.length} of {bookings.length} total test records
                    </div>
                )}
            </div>

            {/* Tax Receipt Modal */}
            {selectedBooking && (
                <ReceiptModal booking={selectedBooking} user={user} onClose={() => setSelectedBooking(null)} />
            )}

            {/* LIVE TRACKING MODAL */}
            {trackingBooking && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}>
                    <div style={{ background: 'white', borderRadius: '24px', width: '560px', padding: '2rem', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button
                            onClick={() => setTrackingBooking(null)}
                            style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                        >
                            ✕
                        </button>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FlaskConical size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                                    Live Diagnostic Progress
                                </h3>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                                    Booking ID: DH-{trackingBooking._id.slice(-8).toUpperCase()}
                                </div>
                            </div>
                        </div>

                        {/* Interactive Steps */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', margin: '1.5rem 0' }}>
                            {[
                                { 
                                    title: '1. Appointment Booked', 
                                    desc: 'Diagnostic order registered & confirmed with lab partner', 
                                    isDone: true 
                                },
                                { 
                                    title: '2. Phlebotomist Dispatched', 
                                    desc: 'Certified collector assigned for doorstep sample collection', 
                                    isDone: ['Out for Collection', 'Sample Collected', 'Sample Processing', 'Report Uploaded'].includes(trackingBooking.status) 
                                },
                                { 
                                    title: '3. Blood Sample Collected', 
                                    desc: 'Specimen collected safely in barcoded tube', 
                                    isDone: ['Sample Collected', 'Sample Processing', 'Report Uploaded'].includes(trackingBooking.status) 
                                },
                                { 
                                    title: '4. Received at Lab Center', 
                                    desc: 'Specimen delivered to NABL pathology lab', 
                                    isDone: ['Sample Processing', 'Report Uploaded'].includes(trackingBooking.status) 
                                },
                                { 
                                    title: trackingBooking.status === 'Cancelled' ? '5. Test Order Cancelled' : '5. Automated Analyzer Testing', 
                                    desc: trackingBooking.status === 'Cancelled' ? 'Order voided by user/lab' : 'Lab pathologists processing blood chemistry tests', 
                                    isDone: ['Sample Processing', 'Report Uploaded'].includes(trackingBooking.status) || trackingBooking.status === 'Cancelled',
                                    isVoid: trackingBooking.status === 'Cancelled'
                                },
                                { 
                                    title: '6. Accredited PDF Report Ready', 
                                    desc: 'Verified digital PDF report signed off & ready to download', 
                                    isDone: trackingBooking.status === 'Report Uploaded' 
                                }
                            ].map((step, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{ 
                                        width: '30px', 
                                        height: '30px', 
                                        borderRadius: '50%', 
                                        background: step.isVoid ? '#ef4444' : (step.isDone ? '#166534' : '#f1f5f9'), 
                                        color: (step.isDone || step.isVoid) ? 'white' : '#94a3b8', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        fontWeight: '800', 
                                        fontSize: '0.85rem', 
                                        flexShrink: 0 
                                    }}>
                                        {step.isVoid ? '✕' : (step.isDone ? '✓' : idx + 1)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '800', color: step.isVoid ? '#ef4444' : (step.isDone ? '#0f172a' : '#94a3b8') }}>
                                            {step.title}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                                            {step.desc}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {(trackingBooking.status === 'Report Uploaded' || trackingBooking.reportUrl) && (
                            <a
                                href={getReportUrl(trackingBooking.reportUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.85rem', background: '#166534', color: 'white', borderRadius: '12px', fontWeight: '800', fontSize: '0.95rem', textDecoration: 'none', marginTop: '1rem' }}
                            >
                                <Download size={18} /> View Accredited Clinical Report (PDF)
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingHistory;
