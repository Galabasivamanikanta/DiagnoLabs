import React, { useContext, useEffect, useState, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import EmployeeManagement from '../components/admin/EmployeeManagement';
import LabVerification from '../components/admin/LabVerification';
import AdminProfile from '../components/admin/AdminProfile';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from '../components/BrandLogo';
import {
    LayoutDashboard, Users, ClipboardList, Settings, LogOut, UserCircle,
    Bell, Search, Filter, ArrowUpRight, ArrowDownRight,
    Activity, TrendingUp, Calendar, FileText, Microscope,
    ChevronRight, ExternalLink, Clock, Zap, Menu, X
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

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

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
        { id: 'bookings', label: 'Bookings', icon: ClipboardList, badge: pendingBookings > 0 ? pendingBookings : null },
        { id: 'network', label: 'Network', icon: Microscope },
        { id: 'employees', label: 'Employees', icon: Users },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
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
                            {activeTab === 'bookings' && 'Booking Management'}
                            {activeTab === 'network' && 'Network Discovery'}
                            {activeTab === 'employees' && 'Employee Directory'}
                            {activeTab === 'analytics' && 'Analytics & Insights'}
                        </h1>
                        <p>
                            {activeTab === 'overview' && 'Real-time laboratory network monitoring & coordination'}
                            {activeTab === 'bookings' && 'Track, manage, and coordinate all patient bookings'}
                            {activeTab === 'network' && 'Audit and authorize newly discovered clinical facilities'}
                            {activeTab === 'employees' && 'Manage team members and access permissions'}
                            {activeTab === 'analytics' && 'Performance metrics and operational insights'}
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

                    {/* ═══ Analytics Tab ═══ */}
                    {activeTab === 'analytics' && (
                        <motion.div
                            key="analytics"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                        >
                            {/* Stats Grid for analytics */}
                            <div className="admin-stats-grid">
                                <div className="admin-stat-card card-primary">
                                    <div className="stat-card-glow"></div>
                                    <div className="stat-card-header">
                                        <div className="stat-card-icon"><TrendingUp size={22} /></div>
                                    </div>
                                    <h2 className="stat-card-value">{totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0}%</h2>
                                    <p className="stat-card-label">Completion Rate</p>
                                </div>
                                <div className="admin-stat-card card-success">
                                    <div className="stat-card-glow"></div>
                                    <div className="stat-card-header">
                                        <div className="stat-card-icon"><Zap size={22} /></div>
                                    </div>
                                    <h2 className="stat-card-value">₹{totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0}</h2>
                                    <p className="stat-card-label">Avg. Order Value</p>
                                </div>
                                <div className="admin-stat-card card-warning">
                                    <div className="stat-card-glow"></div>
                                    <div className="stat-card-header">
                                        <div className="stat-card-icon"><Calendar size={22} /></div>
                                    </div>
                                    <h2 className="stat-card-value">{bookings.reduce((sum, b) => sum + (b.testDetails?.length || 0), 0)}</h2>
                                    <p className="stat-card-label">Total Tests</p>
                                </div>
                                <div className="admin-stat-card card-info">
                                    <div className="stat-card-glow"></div>
                                    <div className="stat-card-header">
                                        <div className="stat-card-icon"><Users size={22} /></div>
                                    </div>
                                    <h2 className="stat-card-value">{new Set(bookings.map(b => b.patient?.name)).size}</h2>
                                    <p className="stat-card-label">Unique Patients</p>
                                </div>
                            </div>

                            {/* Revenue & Tests breakdown */}
                            <div className="admin-insights-row">
                                <div className="admin-insight-card">
                                    <div className="insight-card-title">
                                        <TrendingUp size={15} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                        Revenue Distribution
                                    </div>
                                    {(() => {
                                        const statusMap = {};
                                        bookings.forEach(b => {
                                            const key = b.status || 'Other';
                                            statusMap[key] = (statusMap[key] || 0) + (b.totalAmount || 0);
                                        });
                                        return Object.entries(statusMap).map(([status, amount], i) => (
                                            <div key={status} className="insight-bar-row">
                                                <span className="insight-bar-label">{status.length > 10 ? status.substring(0, 10) + '…' : status}</span>
                                                <div className="insight-bar-track">
                                                    <div
                                                        className={`insight-bar-fill ${i === 0 ? 'purple' : i === 1 ? 'green' : 'amber'}`}
                                                        style={{ width: `${totalRevenue ? (amount / totalRevenue * 100) : 0}%` }}
                                                    ></div>
                                                </div>
                                                <span className="insight-bar-value">₹{Math.round(amount)}</span>
                                            </div>
                                        ));
                                    })()}
                                </div>

                                <div className="admin-insight-card">
                                    <div className="insight-card-title">
                                        <FileText size={15} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                        Top Requested Tests
                                    </div>
                                    {(() => {
                                        const testCount = {};
                                        bookings.forEach(b => {
                                            b.testDetails?.forEach(t => {
                                                testCount[t.testName] = (testCount[t.testName] || 0) + 1;
                                            });
                                        });
                                        const sorted = Object.entries(testCount).sort((a, b) => b[1] - a[1]).slice(0, 4);
                                        const max = sorted.length > 0 ? sorted[0][1] : 1;
                                        return sorted.map(([name, count], i) => (
                                            <div key={name} className="insight-bar-row">
                                                <span className="insight-bar-label">{name.length > 10 ? name.substring(0, 10) + '…' : name}</span>
                                                <div className="insight-bar-track">
                                                    <div
                                                        className={`insight-bar-fill ${i === 0 ? 'purple' : i === 1 ? 'green' : 'amber'}`}
                                                        style={{ width: `${(count / max) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="insight-bar-value">{count}</span>
                                            </div>
                                        ));
                                    })()}
                                    {bookings.length === 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0' }}>
                                            <BrandLogo size={40} />
                                            <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-0.02em', margin: 0 }}>Clinical Gateway</h2>
                                        </div>
                                    )}
                                    {bookings.length === 0 && (
                                        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.82rem', textAlign: 'center' }}>No test data available</p>
                                    )}
                                </div>
                            </div>
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
