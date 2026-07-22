import React, { useContext, useEffect, useState, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import EmployeeManagement from '../components/admin/EmployeeManagement';
import LabVerification from '../components/admin/LabVerification';
import AdminProfile from '../components/admin/AdminProfile';
import MasterControl from '../components/admin/MasterControl';
import MasterTestCatalog from '../components/admin/MasterTestCatalog';
import FinanceAnalytics from '../components/admin/FinanceAnalytics';
import BroadcastEngine from '../components/admin/BroadcastEngine';
import AuditConsole from '../components/admin/AuditConsole';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from '../components/BrandLogo';
import {
    LayoutDashboard, Users, ClipboardList, Settings, LogOut, UserCircle,
    Bell, Search, Filter, ArrowUpRight, ArrowDownRight,
    Activity, TrendingUp, Calendar, FileText, Microscope,
    ChevronRight, ExternalLink, Clock, Zap, Menu, X,
    IdCard, Phone, Mail, MapPin, Droplets, CalendarDays, Building2, BadgeIndianRupee, CheckCircle2, XCircle, FlaskConical,
    Megaphone, PieChart, ShieldCheck, Database
} from 'lucide-react';
import '../styles/AdminDashboard.css';

const AVATAR_COLORS = ['avatar-blue', 'avatar-green', 'avatar-amber', 'avatar-rose', 'avatar-cyan'];

const getAvatarColor = (name) => {
    if (!name) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const getStatusClass = (status) => {
    if (status === 'Pending') return 'pending';
    if (status === 'Report Uploaded') return 'completed';
    return 'processing';
};

const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};


const statusBadgeConfig = {
    'Pending':          { color: '#92400e', bg: '#fef3c7' },
    'Confirmed':        { color: '#1e40af', bg: '#dbeafe' },
    'Sample Collected': { color: '#5b21b6', bg: '#ede9fe' },
    'Sample Processing':{ color: '#6d28d9', bg: '#f5f3ff' },
    'Report Uploaded':  { color: '#166534', bg: '#dcfce7' },
    'Cancelled':        { color: '#991b1b', bg: '#fee2e2' },
};

const CustomerLookupPanel = ({ user: adminUser }) => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLookup = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLookupLoading(true);
        setError('');
        setResult(null);
        try {
            const res = await axios.get(
                `${API_BASE_URL}/api/auth/lookup/${query.trim()}?_t=${Date.now()}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setResult(res.data);
        } catch (err) {
            console.error("Lookup API Error:", err, err.response);
            setError(err.response?.data?.message || err.message || 'Customer not found. Please check the ID and try again.');
        } finally {
            setLookupLoading(false);
        }
    };

    const infoRow = (icon, label, value) => (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ padding: '0.5rem', background: '#f1f5f9', borderRadius: '8px', flexShrink: 0, color: 'var(--primary)' }}>{icon}</div>
            <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>{label}</div>
                <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '0.97rem' }}>{value || 'Not provided'}</div>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Search Box */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.75rem', background: 'var(--primary-light)', borderRadius: '14px', color: 'var(--primary)' }}><IdCard size={24} /></div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)' }}>Customer ID Lookup</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enter the customer's unique DL-XXXXXXXX ID to retrieve their full profile and booking history.</p>
                    </div>
                </div>
                <form onSubmit={handleLookup} style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <IdCard size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="e.g. DL-AB3K7XQ2"
                            style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', border: '1.5px solid var(--border)', fontWeight: '700', fontSize: '1.05rem', outline: 'none', letterSpacing: '1px', fontFamily: 'monospace' }}
                        />
                    </div>
                    <button type="submit" disabled={lookupLoading} style={{ padding: '1rem 2.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                        <Search size={18} /> {lookupLoading ? 'Searching...' : 'Find Customer'}
                    </button>
                </form>
                {error && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: '10px', color: '#991b1b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <XCircle size={18} /> {error}
                    </div>
                )}
            </div>

            {/* Results */}
            {result && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* User Card */}
                    <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: '900', flexShrink: 0 }}>
                                    {result.user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)' }}>{result.user.name}</h3>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.85rem', borderRadius: '100px', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '800', fontSize: '0.85rem' }}>
                                        <IdCard size={14} /> {result.user.customerId}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.2rem', background: result.user.isVerified ? '#dcfce7' : '#fef3c7', borderRadius: '100px', color: result.user.isVerified ? '#166534' : '#92400e', fontWeight: '800', fontSize: '0.85rem' }}>
                                <CheckCircle2 size={15} /> {result.user.isVerified ? 'Verified' : 'Unverified'}
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                            {infoRow(<Mail size={18} />, 'Email Address', result.user.email)}
                            {infoRow(<Phone size={18} />, 'Mobile Number', result.user.phone)}
                            {infoRow(<CalendarDays size={18} />, 'Date of Birth', result.user.dob ? new Date(result.user.dob).toLocaleDateString('en-IN') : null)}
                            {infoRow(<Droplets size={18} />, 'Blood Group', result.user.bloodGroup)}
                            {infoRow(<IdCard size={18} />, 'Gender', result.user.gender)}
                            {infoRow(<MapPin size={18} />, 'Address', result.user.address?.street)}
                            {infoRow(<CalendarDays size={18} />, 'Registered On', new Date(result.user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }))}
                            {infoRow(<Activity size={18} />, 'Total Bookings', `${result.bookings.length} booking${result.bookings.length !== 1 ? 's' : ''}`)}
                        </div>
                    </div>

                    {/* Booking History Table */}
                    <div style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <FlaskConical size={20} style={{ color: 'var(--primary)' }} />
                            <h4 style={{ margin: 0, fontWeight: '800', color: 'var(--text-main)', fontSize: '1.1rem' }}>Booking History ({result.bookings.length})</h4>
                        </div>
                        {result.bookings.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '700' }}>No bookings found for this customer.</div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc' }}>
                                            {['S.No', 'Booking ID', 'Date', 'Test(s)', 'Lab', 'Amount', 'Status'].map(h => (
                                                <th key={h} style={{ padding: '0.9rem 1.1rem', textAlign: 'left', fontWeight: '800', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.bookings.map((b, idx) => {
                                            const cfg = statusBadgeConfig[b.status] || statusBadgeConfig['Pending'];
                                            return (
                                                <tr key={b._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '1rem 1.1rem', fontWeight: '800', color: 'var(--text-muted)' }}>{idx + 1}</td>
                                                    <td style={{ padding: '1rem 1.1rem' }}><span style={{ fontFamily: 'monospace', fontWeight: '800', color: 'var(--primary)' }}>DH-{b._id.slice(-8).toUpperCase()}</span></td>
                                                    <td style={{ padding: '1rem 1.1rem', whiteSpace: 'nowrap', fontWeight: '700' }}>{new Date(b.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                    <td style={{ padding: '1rem 1.1rem' }}>
                                                        <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{b.testDetails?.[0]?.testName || 'N/A'}</div>
                                                        {b.testDetails?.length > 1 && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>+{b.testDetails.length - 1} more</div>}
                                                    </td>
                                                    <td style={{ padding: '1rem 1.1rem', fontWeight: '700', whiteSpace: 'nowrap' }}>{b.lab?.name || 'N/A'}</td>
                                                    <td style={{ padding: '1rem 1.1rem', fontWeight: '800', whiteSpace: 'nowrap' }}>₹{b.totalAmount?.toLocaleString('en-IN')}</td>
                                                    <td style={{ padding: '1rem 1.1rem' }}>
                                                        <span style={{ display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '100px', background: cfg.bg, color: cfg.color, fontWeight: '800', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{b.status}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/bookings/all`);
            setBookings(res.data);
        } catch (err) {
            console.error("Error fetching admin data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Stats
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
    const completedBookings = bookings.filter(b => b.status === 'Report Uploaded').length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    // Filtered bookings
    const filteredBookings = useMemo(() => {
        let result = [...bookings];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(b =>
                b.patient?.name?.toLowerCase().includes(q) ||
                b.patient?.phone?.includes(q) ||
                b.testDetails?.some(t => t.testName?.toLowerCase().includes(q))
            );
        }
        if (statusFilter !== 'all') {
            result = result.filter(b => {
                if (statusFilter === 'pending') return b.status === 'Pending';
                if (statusFilter === 'completed') return b.status === 'Report Uploaded';
                return b.status !== 'Pending' && b.status !== 'Report Uploaded';
            });
        }
        return result;
    }, [bookings, searchQuery, statusFilter]);

    // Recent activity derived from bookings
    const recentActivity = useMemo(() => {
        return bookings.slice(0, 4).map(b => ({
            patient: b.patient?.name || 'Unknown',
            status: b.status,
            time: formatDate(b.createdAt || b.date),
            tests: b.testDetails?.length || 0
        }));
    }, [bookings]);

    const sidebarItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'telemetry', label: 'Live Telemetry', icon: Database },
        { id: 'master-tests', label: 'Test Catalog', icon: FlaskConical },
        { id: 'bookings', label: 'Bookings', icon: ClipboardList, badge: pendingBookings > 0 ? pendingBookings : null },
        { id: 'finance', label: 'Financials', icon: PieChart },
        { id: 'network', label: 'Network', icon: Microscope },
        { id: 'broadcast', label: 'Broadcast', icon: Megaphone },
        { id: 'audit', label: 'Audit Logs', icon: ShieldCheck },
        { id: 'employees', label: 'Employees', icon: Users },
        { id: 'lookup', label: 'Customer Lookup', icon: IdCard },
        { id: 'profile', label: 'My Identity', icon: UserCircle },
    ];

    return (
        <div className="admin-layout">
            {/* ═══ Sidebar ═══ */}
            <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}></div>
            <aside className={`admin-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-brand">
                    <BrandLogo size={42} />
                    <div style={{ marginLeft: '0.8rem' }}>
                        <h2>DiagnoLabs</h2>
                        <span>Admin Console</span>
                    </div>
                </div>

                <div className="sidebar-section-label">Navigation</div>
                {sidebarItems.map(item => (
                    <button
                        key={item.id}
                        className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab(item.id);
                            setSidebarOpen(false);
                        }}
                    >
                        <div className="sidebar-nav-icon">
                            <item.icon size={18} />
                        </div>
                        {item.label}
                        {item.badge && <span className="sidebar-badge">{item.badge}</span>}
                    </button>
                ))}

                <div className="sidebar-section-label">System</div>
                <button className="sidebar-nav-item" onClick={() => navigate('/')}>
                    <div className="sidebar-nav-icon"><ExternalLink size={18} /></div>
                    Visit Website
                </button>
                <button className="sidebar-nav-item" style={{ cursor: 'default' }}>
                    <div className="sidebar-nav-icon"><Settings size={18} /></div>
                    Settings
                </button>

                <div className="sidebar-user-card">
                    <div className="sidebar-user-avatar">
                        {getInitials(user?.name)}
                    </div>
                    <div className="sidebar-user-info">
                        <h6>{user?.name || 'Admin'}</h6>
                        <p>{user?.role === 'admin' ? 'Administrator' : 'Employee'}</p>
                    </div>
                </div>
            </aside>

            {/* ═══ Main Content ═══ */}
            <main className="admin-main">
                {/* Top Bar */}
                <div className="admin-topbar">
                    <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <div className="admin-topbar-left">
                        <h1>
                            {activeTab === 'overview' && 'Dashboard Overview'}
                            {activeTab === 'telemetry' && 'Live Telemetry & Master Control'}
                            {activeTab === 'master-tests' && 'Master Test Catalog'}
                            {activeTab === 'bookings' && 'Booking Management'}
                            {activeTab === 'finance' && 'Financial Analytics'}
                            {activeTab === 'network' && 'Network Discovery'}
                            {activeTab === 'broadcast' && 'Broadcast Engine'}
                            {activeTab === 'audit' && 'System Audit Logs'}
                            {activeTab === 'employees' && 'Employee Directory'}
                            {activeTab === 'lookup' && 'Customer Lookup'}
                            {activeTab === 'profile' && 'My Identity'}
                        </h1>
                        <p>
                            {activeTab === 'overview' && 'Real-time laboratory network monitoring & coordination'}
                            {activeTab === 'telemetry' && 'Monitor system health and toggle emergency platform controls'}
                            {activeTab === 'master-tests' && 'Manage platform-wide standard diagnostic tests and pricing'}
                            {activeTab === 'bookings' && 'Track, manage, and coordinate all patient bookings'}
                            {activeTab === 'finance' && 'View platform revenue, lab payouts, and export financial statements'}
                            {activeTab === 'network' && 'Audit and authorize newly discovered clinical facilities'}
                            {activeTab === 'broadcast' && 'Transmit announcements across the DiagnoLabs network'}
                            {activeTab === 'audit' && 'Immutable ledger of all administrative system actions'}
                            {activeTab === 'employees' && 'Manage team members and access permissions'}
                            {activeTab === 'lookup' && 'Find any customer instantly using their unique Customer ID'}
                            {activeTab === 'profile' && 'Manage your administrative identity and security'}
                        </p>
                    </div>
                    <div className="admin-topbar-actions">
                        <button className="topbar-icon-btn">
                            <Bell size={18} />
                            {pendingBookings > 0 && <span className="notification-dot"></span>}
                        </button>
                        <button className="topbar-signout-btn" onClick={handleLogout}>
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* ═══ Overview Tab ═══ */}
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                        >
                            {/* Stats Grid */}
                            <div className="admin-stats-grid">
                                <motion.div
                                    className="admin-stat-card card-primary"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 }}
                                >
                                    <div className="stat-card-glow"></div>
                                    <div className="stat-card-header">
                                        <div className="stat-card-icon"><ClipboardList size={22} /></div>
                                        <div className="stat-card-trend up">
                                            <ArrowUpRight size={12} /> 12%
                                        </div>
                                    </div>
                                    <h2 className="stat-card-value">{totalBookings}</h2>
                                    <p className="stat-card-label">Total Bookings</p>
                                </motion.div>

                                <motion.div
                                    className="admin-stat-card card-warning"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div className="stat-card-glow"></div>
                                    <div className="stat-card-header">
                                        <div className="stat-card-icon"><Clock size={22} /></div>
                                        <div className="stat-card-trend down">
                                            <ArrowDownRight size={12} /> 5%
                                        </div>
                                    </div>
                                    <h2 className="stat-card-value">{pendingBookings}</h2>
                                    <p className="stat-card-label">Pending Actions</p>
                                </motion.div>

                                <motion.div
                                    className="admin-stat-card card-success"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    <div className="stat-card-glow"></div>
                                    <div className="stat-card-header">
                                        <div className="stat-card-icon"><FileText size={22} /></div>
                                        <div className="stat-card-trend up">
                                            <ArrowUpRight size={12} /> 18%
                                        </div>
                                    </div>
                                    <h2 className="stat-card-value">{completedBookings}</h2>
                                    <p className="stat-card-label">Reports Done</p>
                                </motion.div>

                                <motion.div
                                    className="admin-stat-card card-info"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="stat-card-glow"></div>
                                    <div className="stat-card-header">
                                        <div className="stat-card-icon"><Zap size={22} /></div>
                                        <div className="stat-card-trend up">
                                            <ArrowUpRight size={12} /> 24%
                                        </div>
                                    </div>
                                    <h2 className="stat-card-value">₹{totalRevenue.toLocaleString()}</h2>
                                    <p className="stat-card-label">Total Revenue</p>
                                </motion.div>
                            </div>

                            {/* Insights Row */}
                            <div className="admin-insights-row">
                                {/* Status Breakdown */}
                                <motion.div
                                    className="admin-insight-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                >
                                    <div className="insight-card-title">
                                        <Activity size={15} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                        Status Breakdown
                                    </div>
                                    <div className="insight-bar-row">
                                        <span className="insight-bar-label">Completed</span>
                                        <div className="insight-bar-track">
                                            <div
                                                className="insight-bar-fill green"
                                                style={{ width: `${totalBookings ? (completedBookings / totalBookings * 100) : 0}%` }}
                                            ></div>
                                        </div>
                                        <span className="insight-bar-value">{completedBookings}</span>
                                    </div>
                                    <div className="insight-bar-row">
                                        <span className="insight-bar-label">Pending</span>
                                        <div className="insight-bar-track">
                                            <div
                                                className="insight-bar-fill amber"
                                                style={{ width: `${totalBookings ? (pendingBookings / totalBookings * 100) : 0}%` }}
                                            ></div>
                                        </div>
                                        <span className="insight-bar-value">{pendingBookings}</span>
                                    </div>
                                    <div className="insight-bar-row">
                                        <span className="insight-bar-label">Processing</span>
                                        <div className="insight-bar-track">
                                            <div
                                                className="insight-bar-fill purple"
                                                style={{ width: `${totalBookings ? ((totalBookings - completedBookings - pendingBookings) / totalBookings * 100) : 0}%` }}
                                            ></div>
                                        </div>
                                        <span className="insight-bar-value">{totalBookings - completedBookings - pendingBookings}</span>
                                    </div>
                                </motion.div>

                                {/* Recent Activity */}
                                <motion.div
                                    className="admin-insight-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="insight-card-title">
                                        <Clock size={15} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                        Recent Activity
                                    </div>
                                    <ul className="admin-activity-list">
                                        {recentActivity.length === 0 ? (
                                            <li className="admin-activity-item">
                                                <span className="activity-text">No recent activity</span>
                                            </li>
                                        ) : (
                                            recentActivity.map((act, i) => (
                                                <li key={i} className="admin-activity-item">
                                                    <span className={`activity-dot ${act.status === 'Pending' ? 'dot-amber' : act.status === 'Report Uploaded' ? 'dot-green' : 'dot-purple'}`}></span>
                                                    <div>
                                                        <span className="activity-text">
                                                            <strong>{act.patient}</strong> — {act.status} ({act.tests} test{act.tests !== 1 ? 's' : ''})
                                                        </span>
                                                        <span className="activity-time">{act.time}</span>
                                                    </div>
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                </motion.div>
                            </div>

                            {/* Recent Bookings Table */}
                            <motion.div
                                className="admin-data-panel"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                            >
                                <div className="admin-panel-header">
                                    <h3>Recent Bookings</h3>
                                    <button
                                        className="panel-filter-btn"
                                        onClick={() => setActiveTab('bookings')}
                                    >
                                        View All <ChevronRight size={14} />
                                    </button>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Patient</th>
                                                <th>Tests</th>
                                                <th>Location</th>
                                                <th>Status</th>
                                                <th style={{ textAlign: 'right' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan="5">
                                                        <div className="admin-empty-state">
                                                            <div className="admin-empty-icon"><Activity size={32} /></div>
                                                            <h4>Synchronizing...</h4>
                                                            <p>Fetching latest booking data</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : bookings.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5">
                                                        <div className="admin-empty-state">
                                                            <div className="admin-empty-icon"><ClipboardList size={32} /></div>
                                                            <h4>No Bookings Found</h4>
                                                            <p>All booking records will appear here</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                bookings.slice(0, 5).map((booking) => (
                                                    <tr key={booking._id}>
                                                        <td>
                                                            <div className="table-user-info">
                                                                <div className={`table-user-avatar ${getAvatarColor(booking.patient?.name)}`}>
                                                                    {getInitials(booking.patient?.name)}
                                                                </div>
                                                                <div>
                                                                    <div className="table-user-name">{booking.patient?.name || 'Unknown'}</div>
                                                                    <div className="table-user-sub">{booking.patient?.phone || '—'}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                {booking.testDetails?.slice(0, 2).map((t, i) => (
                                                                    <span key={i} className="table-test-tag">{t.testName}</span>
                                                                ))}
                                                                {booking.testDetails?.length > 2 && (
                                                                    <span className="table-test-tag">+{booking.testDetails.length - 2}</span>
                                                                )}
                                                            </div>
                                                            <div className="table-amount" style={{ marginTop: '0.4rem' }}>₹{booking.totalAmount}</div>
                                                        </td>
                                                        <td>
                                                            <div className="table-address">{booking.sampleCollectionAddress || '—'}</div>
                                                        </td>
                                                        <td>
                                                            <span className={`status-badge ${getStatusClass(booking.status)}`}>
                                                                <span className="status-dot"></span>
                                                                {booking.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <button
                                                                className="table-action-btn"
                                                                onClick={() => navigate('/partner/dashboard')}
                                                            >
                                                                Coordinate <ChevronRight size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* ═══ Bookings Tab ═══ */}
                    {activeTab === 'bookings' && (
                        <motion.div
                            key="bookings"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="admin-data-panel">
                                <div className="admin-panel-header">
                                    <h3>All Patient Bookings</h3>
                                    <div className="admin-panel-header-actions">
                                        <div className="panel-search-wrapper">
                                            <Search size={15} />
                                            <input
                                                type="text"
                                                className="panel-search-input"
                                                placeholder="Search patients, tests..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            className={`panel-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                                            onClick={() => setStatusFilter('all')}
                                        >
                                            All
                                        </button>
                                        <button
                                            className={`panel-filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
                                            onClick={() => setStatusFilter('pending')}
                                        >
                                            <Clock size={13} /> Pending
                                        </button>
                                        <button
                                            className={`panel-filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
                                            onClick={() => setStatusFilter('completed')}
                                        >
                                            <FileText size={13} /> Done
                                        </button>
                                    </div>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Patient</th>
                                                <th>Test Portfolio</th>
                                                <th>Collection Point</th>
                                                <th>Status</th>
                                                <th style={{ textAlign: 'right' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan="5">
                                                        <div className="admin-empty-state">
                                                            <div className="admin-empty-icon"><Activity size={32} /></div>
                                                            <h4>Loading records...</h4>
                                                            <p>Fetching booking data from the network</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : filteredBookings.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5">
                                                        <div className="admin-empty-state">
                                                            <div className="admin-empty-icon"><Search size={32} /></div>
                                                            <h4>No Results</h4>
                                                            <p>{searchQuery ? 'Try a different search term' : 'No bookings found with this filter'}</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredBookings.map((booking) => (
                                                    <tr key={booking._id}>
                                                        <td>
                                                            <div className="table-user-info">
                                                                <div className={`table-user-avatar ${getAvatarColor(booking.patient?.name)}`}>
                                                                    {getInitials(booking.patient?.name)}
                                                                </div>
                                                                <div>
                                                                    <div className="table-user-name">{booking.patient?.name || 'Unknown'}</div>
                                                                    <div className="table-user-sub">{booking.patient?.phone || '—'}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                {booking.testDetails?.map((t, i) => (
                                                                    <span key={i} className="table-test-tag">{t.testName}</span>
                                                                ))}
                                                            </div>
                                                            <div className="table-amount" style={{ marginTop: '0.4rem' }}>₹{booking.totalAmount}</div>
                                                        </td>
                                                        <td>
                                                            <div className="table-address">{booking.sampleCollectionAddress || '—'}</div>
                                                        </td>
                                                        <td>
                                                            <span className={`status-badge ${getStatusClass(booking.status)}`}>
                                                                <span className="status-dot"></span>
                                                                {booking.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <button
                                                                className="table-action-btn"
                                                                onClick={() => navigate('/partner/dashboard')}
                                                            >
                                                                Coordinate <ChevronRight size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ Network Tab ═══ */}
                    {activeTab === 'network' && (
                        <motion.div
                            key="network"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                        >
                            <LabVerification />
                        </motion.div>
                    )}

                    {/* ═══ Employees Tab ═══ */}
                    {activeTab === 'employees' && (
                        <motion.div
                            key="employees"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                        >
                            <EmployeeManagement />
                        </motion.div>
                    )}

                    {/* ═══ Advanced Admin Modules ═══ */}
                    {activeTab === 'telemetry' && (
                        <motion.div key="telemetry" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
                            <MasterControl />
                        </motion.div>
                    )}
                    {activeTab === 'master-tests' && (
                        <motion.div key="master-tests" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
                            <MasterTestCatalog />
                        </motion.div>
                    )}
                    {activeTab === 'finance' && (
                        <motion.div key="finance" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
                            <FinanceAnalytics />
                        </motion.div>
                    )}
                    {activeTab === 'broadcast' && (
                        <motion.div key="broadcast" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
                            <BroadcastEngine />
                        </motion.div>
                    )}
                    {activeTab === 'audit' && (
                        <motion.div key="audit" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
                            <AuditConsole />
                        </motion.div>
                    )}

                    {/* ═══ Customer Lookup Tab ═══ */}
                    {activeTab === 'lookup' && (
                        <motion.div key="lookup" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
                            <CustomerLookupPanel user={user} />
                        </motion.div>
                    )}
                    {/* ═══ Profile Tab ═══ */}
                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                        >
                            <AdminProfile />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default AdminDashboard;
