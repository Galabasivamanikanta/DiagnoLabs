import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { 
    LayoutDashboard, ClipboardList, CheckSquare, LifeBuoy, 
    UserPlus, Search, Megaphone, Bell, Plus, Clock, 
    AlertCircle, CheckCircle2, ShieldAlert, LogOut, FileText, ChevronRight, User, Menu, X
} from 'lucide-react';
import '../styles/DashboardShared.css';

export default function StaffDashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [showWalkinModal, setShowWalkinModal] = useState(false);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Mock Data for General Staff Dashboard
    const [tasks, setTasks] = useState([
        { id: 'TSK-101', title: 'Verify Walk-in IDs for Morning Batch', priority: 'High', dueDate: 'Today, 11:30 AM', status: 'In Progress', note: 'Checked 12 out of 15 patients' },
        { id: 'TSK-102', title: 'Call Customer #DL-2026-88 regarding appointment reschedule', priority: 'Medium', dueDate: 'Today, 02:00 PM', status: 'To-do', note: 'Customer requested evening slot' },
        { id: 'TSK-103', title: 'Cross-check sample bag barcode counts with Phlebotomy team', priority: 'High', dueDate: 'Today, 04:00 PM', status: 'To-do', note: 'Batch #402' },
        { id: 'TSK-104', title: 'Clean and archive yesterday walk-in receipts', priority: 'Low', dueDate: 'Tomorrow, 10:00 AM', status: 'Completed', note: 'Archived 45 receipts' }
    ]);

    const [announcements] = useState([
        { id: 1, title: 'NABL Inspection Scheduled for Friday', date: 'Aug 04, 2026', sender: 'Admin System Manager', priority: 'Urgent', content: 'All General Staff requested to verify all patient identity verification files are up to date.' },
        { id: 2, title: 'New Fast-Track Walk-in Registration Active', date: 'Aug 02, 2026', sender: 'Operations Lead', priority: 'Normal', content: 'Use the 3-click walk-in booking tool for patients without prior online appointments.' }
    ]);

    const [patients] = useState([
        { id: 'DL-202608-01', name: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'rajesh.k@gmail.com', lastBooking: 'Complete Blood Count (CBC)', status: 'Confirmed', date: '2026-08-04' },
        { id: 'DL-202608-02', name: 'Priya Sharma', phone: '+91 91234 56789', email: 'priya.s@gmail.com', lastBooking: 'Thyroid Profile (T3, T4, TSH)', status: 'Sample Collected', date: '2026-08-04' },
        { id: 'DL-202608-03', name: 'Vikram Reddy', phone: '+91 99887 76655', email: 'vikram.r@gmail.com', lastBooking: 'Lipid Profile & HbA1c', status: 'Processing', date: '2026-08-04' }
    ]);

    const [walkinForm, setWalkinForm] = useState({ name: '', phone: '', email: '', testName: 'Complete Blood Count (CBC)', slot: '10:00 AM - 11:00 AM' });
    const [ticketForm, setTicketForm] = useState({ category: 'Booking Issue', description: '', priority: 'Medium' });

    const handleWalkinSubmit = (e) => {
        e.preventDefault();
        alert(`Walk-in Booking successfully registered for ${walkinForm.name}! Confirmation notification queued.`);
        setShowWalkinModal(false);
        setWalkinForm({ name: '', phone: '', email: '', testName: 'Complete Blood Count (CBC)', slot: '10:00 AM - 11:00 AM' });
    };

    const handleTicketSubmit = (e) => {
        e.preventDefault();
        alert(`Support ticket successfully submitted! Tracking ID: TCK-${Math.floor(1000 + Math.random()*9000)}`);
        setShowTicketModal(false);
        setTicketForm({ category: 'Booking Issue', description: '', priority: 'Medium' });
    };

    const toggleTaskStatus = (id) => {
        setTasks(prev => prev.map(t => {
            if (t.id === id) {
                const nextStatus = t.status === 'To-do' ? 'In Progress' : (t.status === 'In Progress' ? 'Completed' : 'To-do');
                return { ...t, status: nextStatus };
            }
            return t;
        }));
    };

    const handleLogout = () => {
        logout();
        navigate('/adminlogin');
    };

    const filteredPatients = patients.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.phone.includes(searchQuery) || 
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="dashboard-layout">
            {/* Mobile Overlay */}
            <div 
                className={`dashboard-overlay ${sidebarOpen ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
            ></div>

            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div style={{ padding: '0 12px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#003366', margin: 0 }}>DiagnoLabs</h2>
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>General Operations</span>
                    </div>
                    {/* Close button for mobile sidebar */}
                    <div className="dashboard-header-mobile-toggle" style={{ border: 'none', padding: 0, margin: 0 }} onClick={() => setSidebarOpen(false)}>
                        <X size={24} color="#64748b" />
                    </div>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <button 
                        onClick={() => setActiveTab('dashboard')}
                        style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'dashboard' ? '#f0f7ff' : 'transparent', color: activeTab === 'dashboard' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
                    >
                        <LayoutDashboard size={18} /> Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('walkins')}
                        style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'walkins' ? '#f0f7ff' : 'transparent', color: activeTab === 'walkins' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
                    >
                        <ClipboardList size={18} /> Bookings & Walk-ins
                    </button>
                    <button 
                        onClick={() => setActiveTab('tasks')}
                        style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'tasks' ? '#f0f7ff' : 'transparent', color: activeTab === 'tasks' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
                    >
                        <CheckSquare size={18} /> Task Management ({tasks.filter(t => t.status !== 'Completed').length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('support')}
                        style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'support' ? '#f0f7ff' : 'transparent', color: activeTab === 'support' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
                    >
                        <LifeBuoy size={18} /> Support Desk
                    </button>
                </nav>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                    <div style={{ padding: '16px', marginBottom: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#003366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem', flexShrink: 0 }}>
                {(user?.name || 'Staff Member').charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Staff Member'}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'staff@diagnolabs.com'}</div>
              </div>
            </div>
            <div style={{ background: '#f0f7ff', color: '#003366', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', alignSelf: 'flex-start', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              General Operations
            </div>
            <button onClick={() => navigate('/admin/profile')} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              View Full Profile <ChevronRight size={14} />
            </button>
          </div>
<button onClick={handleLogout} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #fee2e2', background: '#fff5f5', color: '#dc2626', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Header bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button className="dashboard-header-mobile-toggle" onClick={() => setSidebarOpen(true)}>
                            <Menu size={20} color="#0f172a" />
                        </button>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>General Operations Executive Dashboard</h1>
                            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Welcome back, {user?.name}. Here is your operational task list for today.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setShowWalkinModal(true)} style={{ padding: '10px 18px', background: '#003366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <UserPlus size={16} /> Fast Walk-in Registration
                        </button>
                        <button onClick={() => setShowTicketModal(true)} style={{ padding: '10px 18px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <LifeBuoy size={16} /> Raise Support Ticket
                        </button>
                    </div>
                </div>

                {activeTab === 'dashboard' && (
                    <>
                        {/* Top KPIs */}
                        <div className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                                <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>My Assigned Tasks</div>
                                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#003366', marginTop: '6px' }}>{tasks.filter(t => t.status !== 'Completed').length}</div>
                            </div>
                            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                                <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Pending Verification</div>
                                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#d97706', marginTop: '6px' }}>8</div>
                            </div>
                            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                                <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Today's Walk-ins</div>
                                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#059669', marginTop: '6px' }}>14</div>
                            </div>
                            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                                <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Open Support Queries</div>
                                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#2563eb', marginTop: '6px' }}>2</div>
                            </div>
                        </div>

                        {/* Announcements & Task Grid */}
                        <div className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            {/* Task List Widget */}
                            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Assigned Operational Tasks</h3>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>Click status to toggle</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {tasks.map(t => (
                                        <div key={t.id} style={{ padding: '14px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>{t.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Due: {t.dueDate} | <span style={{ color: t.priority === 'High' ? '#dc2626' : '#64748b', fontWeight: '700' }}>{t.priority} Priority</span></div>
                                            </div>
                                            <button 
                                                onClick={() => toggleTaskStatus(t.id)}
                                                style={{ padding: '6px 12px', borderRadius: '100px', border: 'none', background: t.status === 'Completed' ? '#dcfce7' : (t.status === 'In Progress' ? '#fef3c7' : '#f1f5f9'), color: t.status === 'Completed' ? '#166534' : (t.status === 'In Progress' ? '#92400e' : '#475569'), fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}
                                            >
                                                {t.status}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Admin Broadcast Announcements */}
                            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                                <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Megaphone size={18} color="#003366" /> Admin Announcements & Broadcasts
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {announcements.map(a => (
                                        <div key={a.id} style={{ padding: '16px', borderRadius: '12px', background: '#f0f7ff', border: '1px solid #cbd5e1' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#003366' }}>{a.title}</span>
                                                <span style={{ fontSize: '0.7rem', fontWeight: '700', background: a.priority === 'Urgent' ? '#fee2e2' : '#e0f2fe', color: a.priority === 'Urgent' ? '#dc2626' : '#0369a1', padding: '2px 8px', borderRadius: '100px' }}>{a.priority}</span>
                                            </div>
                                            <p style={{ margin: '8px 0 4px', fontSize: '0.85rem', color: '#334155' }}>{a.content}</p>
                                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>By {a.sender} • {a.date}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Patient Quick Lookup Section (HIPAA Metadata Only) */}
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Patient Basic Directory & Booking Status</h3>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Search patient booking status. (Medical report content restricted per HIPAA policy).</p>
                                </div>
                                <div style={{ position: 'relative', width: '280px' }}>
                                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input 
                                        type="text" 
                                        placeholder="Search by name or phone..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div className="dashboard-table-container">
                            <table className="dashboard-table" style={{ fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                        <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Patient ID</th>
                                        <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Name</th>
                                        <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Phone</th>
                                        <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Last Booking</th>
                                        <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPatients.map(p => (
                                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px', fontWeight: '800', color: '#003366' }}>{p.id}</td>
                                            <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{p.name}</td>
                                            <td style={{ padding: '12px', color: '#475569' }}>{p.phone}</td>
                                            <td style={{ padding: '12px', color: '#334155' }}>{p.lastBooking}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', background: '#dcfce7', color: '#15803d' }}>
                                                    {p.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'walkins' && (
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.2rem', color: '#0f172a' }}>Walk-in Booking Registry</h3>
                            <button onClick={() => setShowWalkinModal(true)} style={{ padding: '8px 16px', background: '#003366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>
                                + Register New Walk-in
                            </button>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Walk-in registrations automatically trigger Nodemailer appointment confirmations and generate customer IDs.</p>
                    </div>
                )}

                {activeTab === 'tasks' && (
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                        <h3 style={{ margin: '0 0 16px', fontWeight: '800', fontSize: '1.2rem', color: '#0f172a' }}>Cross-Department Task Board</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {tasks.map(t => (
                                <div key={t.id} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                    <div style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>{t.title}</div>
                                    <p style={{ margin: '6px 0', fontSize: '0.85rem', color: '#475569' }}>Note: {t.note}</p>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Priority: {t.priority} | Due: {t.dueDate}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'support' && (
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.2rem', color: '#0f172a' }}>Internal & Patient Support Desk</h3>
                            <button onClick={() => setShowTicketModal(true)} style={{ padding: '8px 16px', background: '#003366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>
                                + Raise Ticket
                            </button>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Raise operational issues directly to Support & Admin teams.</p>
                    </div>
                )}
            </main>

            {/* Fast Walk-in Registration Modal */}
            {showWalkinModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ margin: '0 0 16px', color: '#0f172a', fontWeight: '800' }}>Fast Walk-in Registration</h3>
                        <form onSubmit={handleWalkinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>PATIENT FULL NAME</label>
                                <input type="text" required value={walkinForm.name} onChange={e => setWalkinForm({...walkinForm, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none' }} placeholder="e.g. Ramesh Kumar" />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>MOBILE NUMBER</label>
                                <input type="text" required value={walkinForm.phone} onChange={e => setWalkinForm({...walkinForm, phone: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none' }} placeholder="+91 XXXXX XXXXX" />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>EMAIL ADDRESS</label>
                                <input type="email" required value={walkinForm.email} onChange={e => setWalkinForm({...walkinForm, email: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none' }} placeholder="patient@gmail.com" />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>SELECT TEST</label>
                                <select value={walkinForm.testName} onChange={e => setWalkinForm({...walkinForm, testName: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none', background: 'white' }}>
                                    <option>Complete Blood Count (CBC)</option>
                                    <option>Thyroid Profile (T3, T4, TSH)</option>
                                    <option>Lipid Profile & HbA1c</option>
                                    <option>Full Body Health Checkup</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setShowWalkinModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#003366', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Confirm Booking</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Raise Ticket Modal */}
            {showTicketModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ margin: '0 0 16px', color: '#0f172a', fontWeight: '800' }}>Raise Support Ticket</h3>
                        <form onSubmit={handleTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>ISSUE CATEGORY</label>
                                <select value={ticketForm.category} onChange={e => setTicketForm({...ticketForm, category: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none', background: 'white' }}>
                                    <option>Booking Issue</option>
                                    <option>Patient Query</option>
                                    <option>Technical / IT Support</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>DESCRIPTION</label>
                                <textarea required rows="3" value={ticketForm.description} onChange={e => setTicketForm({...ticketForm, description: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none' }} placeholder="Describe the issue details..."></textarea>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setShowTicketModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#003366', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Submit Ticket</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
