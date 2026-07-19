import { useState, useEffect, useContext } from 'react';
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
    FileText
} from 'lucide-react';
import ReceiptModal from '../components/patient/ReceiptModal';

const statusConfig = {
    'Pending':          { color: '#92400e', bg: '#fef3c7', icon: <Clock size={14} /> },
    'Confirmed':        { color: '#1e40af', bg: '#dbeafe', icon: <CheckCircle2 size={14} /> },
    'Sample Collected': { color: '#5b21b6', bg: '#ede9fe', icon: <FlaskConical size={14} /> },
    'Report Uploaded':  { color: '#166534', bg: '#dcfce7', icon: <CheckCircle2 size={14} /> },
    'Cancelled':        { color: '#991b1b', bg: '#fee2e2', icon: <XCircle size={14} /> },
};

const BookingHistory = () => {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        const fetchBookings = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/bookings/user/${user._id}`);
                // Sort by newest first
                const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setBookings(sorted);
            } catch (err) {
                console.error('Error fetching bookings:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [user, navigate]);

    const filtered = bookings.filter(b => {
        const matchSearch =
            b._id.toLowerCase().includes(search.toLowerCase()) ||
            b.testDetails?.some(t => t.testName?.toLowerCase().includes(search.toLowerCase())) ||
            b.lab?.name?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'All' || b.status === statusFilter;
        return matchSearch && matchStatus;
    });
    return (
        <div style={{ background: 'var(--background)', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '5rem' }}>
            <div className="container animate-fade-in" style={{ maxWidth: '1100px' }}>

                {/* Premium User Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: 'var(--primary-light)', borderRadius: '50%', color: 'var(--primary)', display: 'flex' }}>
                                <UserCircle size={32} />
                            </div>
                            <div>
                                <h1 style={{ fontSize: '2.2rem', color: 'var(--text-main)', fontWeight: '900', margin: 0 }}>
                                    {user?.name || 'Patient'}
                                </h1>
                                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                        <Mail size={16} /> {user?.email}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                        <Phone size={16} /> +91 {user?.phone || '9999999999'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer ID + Stats Card */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(3, auto)', gap: '1.5rem', alignItems: 'center', marginBottom: '2.5rem', background: 'white', padding: '1.5rem 2rem', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '0.6rem', background: '#f0f9ff', borderRadius: '10px', color: '#0369a1' }}>
                                    <IdCard size={22} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Customer ID</div>
                                    <div style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '1px' }}>
                                        {user?.customerId || 'DL-XXXXXXXX'}
                                    </div>
                                </div>
                            </div>
                            {[
                                { label: 'Total Bookings', value: bookings.length, color: '#0a1e46' },
                                { label: 'Reports Ready', value: bookings.filter(b => b.status === 'Report Uploaded').length, color: '#166534' },
                                { label: 'Pending', value: bookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed').length, color: '#92400e' },
                            ].map(stat => (
                                <div key={stat.label} style={{ textAlign: 'center', padding: '0.5rem 1.5rem', borderLeft: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: '900', color: stat.color }}>{stat.value}</div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                        <input
                            type="text"
                            placeholder="Search by test name, lab, or booking ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: '600', outline: 'none', background: 'white', fontSize: '0.95rem' }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Filter size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            style={{ padding: '0.85rem 2.5rem 0.85rem 2.5rem', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: '700', outline: 'none', background: 'white', appearance: 'none', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--text-main)' }}
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Sample Collected">Sample Collected</option>
                            <option value="Report Uploaded">Report Uploaded</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', pointerEvents: 'none' }} />
                    </div>
                </div>

                {/* Table */}
                <div style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                            <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                            Loading your history...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '5rem' }}>
                            <History size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
                            <div style={{ fontWeight: '700', fontSize: '1.2rem', color: 'var(--text-muted)' }}>No bookings found</div>
                            <div style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>Try adjusting your search or filter.</div>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                                        {['S.No', 'Booking ID', 'Date', 'Test(s)', 'Lab', 'Amount', 'Status', 'Action'].map(h => (
                                            <th key={h} style={{ padding: '1rem 1.25rem', textAlign: 'left', fontWeight: '800', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((b, idx) => {
                                        const cfg = statusConfig[b.status] || statusConfig['Pending'];
                                        return (
                                            <tr key={b._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                            >
                                                {/* S.No */}
                                                <td style={{ padding: '1.1rem 1.25rem', fontWeight: '800', color: 'var(--text-muted)', width: '60px' }}>
                                                    {idx + 1}
                                                </td>

                                                {/* Booking ID */}
                                                <td style={{ padding: '1.1rem 1.25rem', whiteSpace: 'nowrap' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ fontFamily: 'monospace', fontWeight: '800', color: 'var(--primary)', fontSize: '0.9rem' }}>
                                                            DH-{b._id.slice(-8).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Date */}
                                                <td style={{ padding: '1.1rem 1.25rem', whiteSpace: 'nowrap' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontWeight: '700' }}>
                                                        <CalendarDays size={15} style={{ color: 'var(--text-muted)' }} />
                                                        {new Date(b.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: '600', marginTop: '0.2rem', paddingLeft: '1.3rem' }}>
                                                        {b.appointmentTime}
                                                    </div>
                                                </td>

                                                {/* Test(s) */}
                                                <td style={{ padding: '1.1rem 1.25rem', maxWidth: '220px' }}>
                                                    <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>
                                                        {b.testDetails?.[0]?.testName || 'N/A'}
                                                    </div>
                                                    {b.testDetails?.length > 1 && (
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '0.2rem' }}>
                                                            +{b.testDetails.length - 1} more test{b.testDetails.length - 1 > 1 ? 's' : ''}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Lab */}
                                                <td style={{ padding: '1.1rem 1.25rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                                                        <Building2 size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                                        {b.lab?.name || 'Authorized Lab'}
                                                    </div>
                                                </td>

                                                {/* Amount */}
                                                <td style={{ padding: '1.1rem 1.25rem', whiteSpace: 'nowrap' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
                                                        <BadgeIndianRupee size={16} style={{ color: '#166534' }} />
                                                        {b.totalAmount?.toLocaleString('en-IN')}
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td style={{ padding: '1.1rem 1.25rem' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', borderRadius: '100px', background: cfg.bg, color: cfg.color, fontWeight: '800', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                                        {cfg.icon} {b.status}
                                                    </span>
                                                </td>

                                                {/* Action */}
                                                <td style={{ padding: '1.1rem 1.25rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                        <button
                                                            onClick={() => setSelectedBooking(b)}
                                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', background: '#f1f5f9', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                                        >
                                                            <FileText size={14} /> Receipt
                                                        </button>

                                                        {b.status === 'Report Uploaded' && b.reportUrl && (
                                                            <a
                                                                href={`${API_BASE_URL.replace('/api', '')}${b.reportUrl}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', background: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', textDecoration: 'none', whiteSpace: 'nowrap' }}
                                                            >
                                                                <Download size={14} /> Report
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Count footer */}
                {!loading && filtered.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.9rem' }}>
                        Showing {filtered.length} of {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                tr { background: white; }
            `}</style>
            
            {selectedBooking && (
                <ReceiptModal booking={selectedBooking} user={user} onClose={() => setSelectedBooking(null)} />
            )}
        </div>
    );
};

export default BookingHistory;
