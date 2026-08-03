import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { 
    LayoutDashboard, Users, FileText, Package, 
    CreditCard, Megaphone, LifeBuoy, MapPin, 
    ShieldCheck, Server, LogOut 
} from 'lucide-react';

export default function StaffDashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/adminlogin');
            return;
        }
        fetchDashboardData();
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/staff/dashboard-stats`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setStats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/adminlogin');
    };

    const getSidebarLinks = () => {
        const role = user?.role;
        const links = [{ id: 'dashboard', label: 'Overview', icon: LayoutDashboard }];

        if (role === 'doctor') {
            links.push({ id: 'patients', label: 'My Patients', icon: Users });
            links.push({ id: 'prescriptions', label: 'Prescriptions', icon: FileText });
        } else if (role === 'receptionist') {
            links.push({ id: 'appointments', label: 'Appointments', icon: Users });
            links.push({ id: 'billing', label: 'Billing', icon: CreditCard });
        } else if (role === 'inventory_manager') {
            links.push({ id: 'inventory', label: 'Inventory', icon: Package });
        } else if (role === 'finance_manager') {
            links.push({ id: 'transactions', label: 'Transactions', icon: CreditCard });
        } else if (role === 'marketing_head') {
            links.push({ id: 'campaigns', label: 'Campaigns', icon: Megaphone });
        } else if (role === 'support_staff') {
            links.push({ id: 'tickets', label: 'Tickets', icon: LifeBuoy });
        } else if (role === 'delivery_partner') {
            links.push({ id: 'deliveries', label: 'Deliveries', icon: MapPin });
        } else if (role === 'quality_auditor') {
            links.push({ id: 'audits', label: 'Quality Audits', icon: ShieldCheck });
        } else if (role === 'it_specialist') {
            links.push({ id: 'system', label: 'System Health', icon: Server });
        }

        return links;
    };

    const renderRoleSpecificDashboard = () => {
        const role = user?.role;
        if (role === 'doctor') {
            return (
                <div style={{ padding: '2rem', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-main)' }}>Doctor Workspace</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        <div style={{ padding: '1.5rem', background: 'var(--surface-alt)', borderRadius: '12px' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '700' }}>Pending Reviews</div>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>{stats?.pendingReviews || 0}</div>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--surface-alt)', borderRadius: '12px' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '700' }}>Completed Consultations</div>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)' }}>{stats?.completedConsultations || 0}</div>
                        </div>
                    </div>
                </div>
            );
        }
        // Fallback for others
        return (
            <div style={{ padding: '2rem', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-main)' }}>Welcome, {user?.name}</h2>
                <p style={{ color: 'var(--text-muted)' }}>This is your specialized {user?.role} dashboard.</p>
            </div>
        );
    };

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Workspace...</div>;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)', fontFamily: 'var(--font-sans)' }}>
            {/* Sidebar */}
            <div style={{ width: '280px', background: 'white', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--border-light)' }}>
                    <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: 'var(--primary)' }}>DiagnoLabs</h1>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '0.2rem', textTransform: 'uppercase' }}>{user?.role?.replace('_', ' ')} Portal</div>
                </div>
                <div style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {getSidebarLinks().map(link => (
                        <button
                            key={link.id}
                            onClick={() => setActiveTab(link.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', width: '100%', border: 'none', background: activeTab === link.id ? 'var(--primary-light)' : 'transparent', color: activeTab === link.id ? 'var(--primary)' : 'var(--text-muted)', borderRadius: '12px', cursor: 'pointer', fontWeight: activeTab === link.id ? '700' : '600', transition: 'all 0.2s', textAlign: 'left' }}
                        >
                            <link.icon size={18} /> {link.label}
                        </button>
                    ))}
                </div>
                <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid var(--border-light)' }}>
                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', width: '100%', border: 'none', background: '#fef2f2', color: 'var(--danger)', borderRadius: '12px', cursor: 'pointer', fontWeight: '700' }}>
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                {activeTab === 'dashboard' ? renderRoleSpecificDashboard() : (
                    <div style={{ padding: '2rem', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-main)', textTransform: 'capitalize' }}>{activeTab} Module</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Content for {activeTab} will be implemented here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
