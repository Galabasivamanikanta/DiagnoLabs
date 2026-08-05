import React, { useState, useContext, useRef, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
    User, Mail, Phone, MapPin, ShieldCheck, Edit3, Check, X, 
    Camera, Building2, Lock, Activity, Key, Globe, ShieldAlert,
    Cpu, Bell, Copy, Info, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import '../styles/DashboardShared.css'; // Reuse some basic styles if needed

const AdminProfile = ({ inline = false }) => {
    const { user, updateUser } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('work'); // 'work', 'personal', 'security', 'preferences'
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [copiedId, setCopiedId] = useState(false);
    
    const fileInputRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(user?.profilePic || null);

    // Form state (minimal for demo)
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address_street: user?.address?.street || '',
        address_city: user?.address?.city || '',
        address_pincode: user?.address?.pincode || '',
        department: 'Operations',
        manager: 'Srinivas Rao (VP Operations)'
    });

    const getRoleDisplay = (role) => {
        switch(role) {
            case 'admin': return 'System Administrator';
            case 'finance_manager': return 'Finance Manager';
            case 'inventory_manager': return 'Inventory & Supply Head';
            case 'marketing_head': return 'Chief Marketing Officer';
            default: return role ? role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Corporate Staff';
        }
    };

    const handleCopyId = () => {
        const empId = user?.role === 'admin' ? 'ADM-001' : user?.role === 'finance_manager' ? 'EMP-35559' : `EMP-${(user?._id || '29481').toString().slice(-5).toUpperCase()}`;
        navigator.clipboard.writeText(empId);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2500);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setMessage({ text: 'Image must be under 2MB', type: 'error' });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                setMessage({ text: 'Profile photo ready to save.', type: 'info' });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const updatePayload = {
                name: formData.name,
                phone: formData.phone,
                recovery_email: formData.recovery_email,
                recovery_phone: formData.recovery_phone,
                address: {
                    ...user.address,
                    street: formData.address_street,
                    city: formData.address_city,
                    pincode: formData.address_pincode
                },
                profilePic: previewImage
            };
            
            const res = await axios.put(`${API_BASE_URL}/api/auth/${user._id}`, updatePayload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            
            updateUser(res.data);
            setMessage({ text: 'Admin profile updated successfully!', type: 'success' });
            setIsEditing(false);
            setLoading(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            console.error("Update error:", error);
            const detail = error.response?.data?.error || error.message;
            setMessage({ text: `Update failed: ${detail}`, type: 'error' });
            setLoading(false);
        }
    };

    return (
        <div style={{ background: inline ? 'transparent' : '#f8fafc', minHeight: inline ? 'auto' : '100vh', paddingTop: inline ? '0' : '6.5rem', paddingBottom: inline ? '0' : '5rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: inline ? '0' : '0 1.25rem' }}>
            
            {message.text && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    borderRadius: '12px',
                    background: message.type === 'success' ? '#dcfce7' : message.type === 'error' ? '#fee2e2' : '#e0f2fe',
                    color: message.type === 'success' ? '#166534' : message.type === 'error' ? '#991b1b' : '#0369a1',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {message.type === 'success' ? <Check size={20} /> : message.type === 'error' ? <AlertCircle size={20} /> : <Info size={20} />}
                        <span style={{ fontWeight: '600' }}>{message.text}</span>
                    </div>
                    <button onClick={() => setMessage({ text: '', type: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7 }}>
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Executive Hero Card (Dark Slate Theme) */}
            <div className="profile-hero-card" style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                borderRadius: '24px',
                padding: '2rem',
                color: 'white',
                boxShadow: '0 15px 35px rgba(15, 23, 42, 0.3)',
                marginBottom: '1.5rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.03)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', right: '80px', bottom: '-50px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.02)', pointerEvents: 'none' }} />

                <div className="profile-hero-content" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="profile-hero-top" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1rem' }}>
                        {/* Avatar */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <div className="profile-avatar" style={{ 
                                width: '80px', height: '80px', 
                                background: previewImage ? `url(${previewImage}) center/cover no-repeat` : 'linear-gradient(135deg, #64748b, #475569)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: '2rem', fontWeight: '900',
                                border: '3px solid rgba(255, 255, 255, 0.2)',
                                boxShadow: '0 6px 16px rgba(0,0,0,0.4)'
                            }}>
                                {!previewImage && (user?.name ? user.name.charAt(0).toUpperCase() : 'A')}
                            </div>
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    position: 'absolute',
                                    bottom: '0px', right: '0px',
                                    width: '28px', height: '28px',
                                    background: 'white', border: 'none',
                                    borderRadius: '50%', boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#0f172a', cursor: 'pointer'
                                }}
                                title="Update Photo"
                            >
                                <Camera size={14} />
                            </button>
                        </div>

                        {/* Name + Badge */}
                        <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                                <h1 className="profile-hero-name" style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, letterSpacing: '-0.3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'white' }}>
                                    {isEditing ? (
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '1.3rem', width: '200px' }} />
                                    ) : (
                                        user?.name || 'Administrator'
                                    )}
                                </h1>
                                <span style={{ 
                                    background: user?.role === 'admin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)', // Red tint for admin, Amber for others
                                    backdropFilter: 'blur(10px)',
                                    padding: '0.2rem 0.6rem', 
                                    borderRadius: '100px', 
                                    fontSize: '0.7rem', 
                                    fontWeight: '700',
                                    color: user?.role === 'admin' ? '#fca5a5' : '#fcd34d',
                                    border: user?.role === 'admin' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(252, 211, 77, 0.2)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    flexShrink: 0
                                }}>
                                    <ShieldCheck size={12} color={user?.role === 'admin' ? '#f87171' : '#fbbf24'} /> {user?.role === 'admin' ? 'Executive Board' : 'Corporate Staff'}
                                </span>
                            </div>
                            <p style={{ margin: 0, opacity: 0.85, fontSize: '0.85rem', fontWeight: '600', color: '#94a3b8' }}>
                                {getRoleDisplay(user?.role)}
                            </p>
                            <p style={{ margin: '0.15rem 0 0 0', opacity: 0.75, fontSize: '0.75rem', fontWeight: '500' }}>
                                {user?.email || 'admin@diagnolabs.com'} • Ext: 404
                            </p>
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="profile-hero-bottom" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {/* Employee ID */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '8px', padding: '0.35rem 0.7rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <span style={{ fontSize: '0.65rem', opacity: 0.6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>EMP ID:</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '0.85rem', color: '#cbd5e1', letterSpacing: '0.5px' }}>
                                {user?.role === 'admin' ? 'ADM-001' : user?.role === 'finance_manager' ? 'EMP-35559' : `EMP-${(user?._id || '29481').toString().slice(-5).toUpperCase()}`}
                            </span>
                            <button onClick={handleCopyId} title="Copy" style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex' }}>
                                {copiedId ? <Check size={13} color="#4ade80" /> : <Copy size={13} style={{ opacity: 0.7 }} />}
                            </button>
                        </div>

                        {/* Access Level Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.35rem 0.7rem', flex: '1', minWidth: '120px' }}>
                            <Key size={14} color="#94a3b8" />
                            <span style={{ fontSize: '0.7rem', fontWeight: '700', whiteSpace: 'nowrap', color: '#e2e8f0' }}>Level 4 Access</span>
                        </div>

                        {/* Edit / Save Button */}
                        <button 
                            onClick={() => {
                                if (isEditing) {
                                    handleSubmit();
                                } else {
                                    setIsEditing(true);
                                }
                            }} 
                            disabled={loading}
                            className="profile-edit-btn"
                            style={{ 
                                background: isEditing ? '#22c55e' : 'white', 
                                color: isEditing ? 'white' : '#0f172a',
                                border: 'none',
                                padding: '0.5rem 1rem', 
                                borderRadius: '10px', 
                                fontWeight: '700',
                                fontSize: '0.8rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                flexShrink: 0
                            }}
                        >
                            {isEditing ? <><Check size={15} /> Save Changes</> : <><Edit3 size={15} /> Update Profile</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="profile-layout-grid">
                
                {/* Sidebar Tabs */}
                <div style={{ 
                    background: 'white', 
                    borderRadius: '20px', 
                    padding: '1.25rem 0.8rem', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                    border: '1px solid #e2e8f0',
                    height: 'fit-content'
                }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', padding: '0.5rem 1rem', letterSpacing: '0.5px' }}>
                        Admin Settings
                    </div>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {[
                            { id: 'work', label: 'Work & Organization', icon: Building2 },
                            { id: 'personal', label: 'Personal Information', icon: User },
                            { id: 'security', label: 'Security & Access', icon: Lock },
                            { id: 'audit', label: 'Recent Activity Logs', icon: Activity },
                            { id: 'preferences', label: 'System Preferences', icon: Cpu }
                        ].map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '0.85rem 1rem', borderRadius: '12px', border: 'none',
                                        background: isActive ? '#f1f5f9' : 'transparent',
                                        color: isActive ? '#0f172a' : '#64748b',
                                        fontWeight: isActive ? '800' : '600',
                                        fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    <Icon size={18} color={isActive ? '#0f172a' : '#94a3b8'} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Main Panel */}
                <div style={{ 
                    background: 'white', borderRadius: '20px', padding: '2.25rem', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0',
                    minHeight: '450px'
                }}>
                    
                    {activeTab === 'work' && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                                <Building2 size={24} color="#0f172a" />
                                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>Work & Organization</h2>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem' }}>Employment Details</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block' }}>Department</span>
                                            <strong style={{ color: '#0f172a' }}>
                                                {user?.role === 'admin' ? 'Executive Management' : 
                                                 user?.role === 'finance_manager' ? 'Finance & Accounts' :
                                                 user?.role === 'inventory_manager' ? 'Supply Chain & Logistics' :
                                                 user?.role === 'doctor' ? 'Clinical Department' :
                                                 user?.role === 'nurse' ? 'Nursing & Patient Care' :
                                                 user?.role === 'it_support' ? 'IT & Systems' :
                                                 user?.role === 'marketing_head' ? 'Marketing & PR' :
                                                 formData.department}
                                            </strong>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block' }}>Reporting Manager</span>
                                            <strong style={{ color: '#0f172a' }}>{user?.role === 'admin' ? 'Board of Directors (N/A)' : formData.manager}</strong>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block' }}>Base Hub Location</span>
                                            <strong style={{ color: '#0f172a' }}>Amaravati, Andhra Pradesh</strong>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem' }}>Current Shift Schedule</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#475569', fontWeight: '600' }}>Mon - Fri</span>
                                            <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700' }}>09:00 AM - 06:00 PM</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#475569', fontWeight: '600' }}>Saturday</span>
                                            <span style={{ background: '#fef3c7', color: '#b45309', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700' }}>10:00 AM - 02:00 PM</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#475569', fontWeight: '600' }}>Sunday</span>
                                            <span style={{ background: '#f1f5f9', color: '#64748b', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700' }}>Off / On-Call Only</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem' }}>System Permissions (Role-Based Access Control)</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {(() => {
                                            const rolePerms = {
                                                admin: ['Full System Access', 'User Management', 'Financial Overrides', 'Audit Log Viewer', 'Database Backup (Read)'],
                                                finance_manager: ['Financial Analytics', 'Payroll Processing', 'Invoice Generation', 'Refund Processing'],
                                                doctor: ['Clinical Review', 'Patient Diagnosis', 'Prescription Override', 'Medical Records Access'],
                                                nurse: ['Patient Vitals Entry', 'Sample Collection', 'Bed Management'],
                                                reception: ['Appointment Booking', 'Patient Check-in', 'Basic Billing'],
                                                inventory_manager: ['Stock Audit', 'Vendor Management', 'Purchase Orders']
                                            };
                                            const perms = rolePerms[user?.role] || ['Basic Dashboard Access', 'Profile View'];
                                            return perms.map(perm => (
                                                <span key={perm} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#0f172a', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <ShieldCheck size={14} color="#059669" /> {perm}
                                                </span>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'personal' && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                                <User size={24} color="#0f172a" />
                                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>Personal Details</h2>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>Primary Email</label>
                                    <input type="email" value={user?.email || ''} readOnly disabled style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b' }} />
                                    <span style={{ fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}><ShieldCheck size={12}/> Corporate Verified</span>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>Mobile Number</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: isEditing ? '2px solid #0f172a' : '1px solid #e2e8f0', background: isEditing ? 'white' : '#f8fafc' }} />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>Residential Address</label>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <input type="text" name="address_street" value={formData.address_street} onChange={handleChange} disabled={!isEditing} placeholder="Street Address" style={{ flex: 2, padding: '0.75rem', borderRadius: '10px', border: isEditing ? '2px solid #0f172a' : '1px solid #e2e8f0', background: isEditing ? 'white' : '#f8fafc' }} />
                                        <input type="text" name="address_city" value={formData.address_city} onChange={handleChange} disabled={!isEditing} placeholder="City" style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: isEditing ? '2px solid #0f172a' : '1px solid #e2e8f0', background: isEditing ? 'white' : '#f8fafc' }} />
                                    </div>
                                </div>
                                <div style={{ gridColumn: '1 / -1', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem' }}>Emergency Recovery & Failover</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>Recovery Email Address</label>
                                            <input type="email" name="recovery_email" value={formData.recovery_email || ''} onChange={handleChange} disabled={!isEditing} placeholder="e.g. personal@email.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: isEditing ? '2px solid #0f172a' : '1px solid #e2e8f0', background: isEditing ? 'white' : '#f8fafc' }} />
                                            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '6px' }}>Used if corporate SSO is unavailable.</span>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>Alternate Phone Number</label>
                                            <input type="tel" name="recovery_phone" value={formData.recovery_phone || ''} onChange={handleChange} disabled={!isEditing} placeholder="+91 xxxxx xxxxx" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: isEditing ? '2px solid #0f172a' : '1px solid #e2e8f0', background: isEditing ? 'white' : '#f8fafc' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                                <Lock size={24} color="#0f172a" />
                                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>Security & Access Control</h2>
                            </div>
                            
                            <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontWeight: '800' }}>Password & Authentication</h3>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Change your password or manage secure login methods.</p>
                                    </div>
                                    <button 
                                        onClick={() => setMessage({ text: 'Password reset instructions have been sent to your primary email.', type: 'info' })}
                                        style={{ background: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                                    >
                                        Reset Password
                                    </button>
                                </div>
                            </div>
                            
                            <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontWeight: '800' }}>Two-Factor Authentication (2FA)</h3>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Mandatory for all Level 3+ staff accounts.</p>
                                    </div>
                                    <div style={{ background: '#dcfce7', color: '#166534', padding: '0.5rem 1rem', borderRadius: '100px', fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <ShieldCheck size={16} /> Enabled via Authenticator
                                    </div>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>Recent Access Logs</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                                        <th style={{ padding: '12px 16px', color: '#64748b' }}>Date & Time</th>
                                        <th style={{ padding: '12px 16px', color: '#64748b' }}>Device / IP</th>
                                        <th style={{ padding: '12px 16px', color: '#64748b' }}>Location</th>
                                        <th style={{ padding: '12px 16px', color: '#64748b' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 16px', fontWeight: '600' }}>Today, 09:15 AM</td>
                                        <td style={{ padding: '12px 16px', color: '#475569' }}>Mac OS X • 192.168.1.104</td>
                                        <td style={{ padding: '12px 16px', color: '#475569' }}>Hyderabad, IN</td>
                                        <td style={{ padding: '12px 16px', color: '#059669', fontWeight: '700' }}>Success</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 16px', fontWeight: '600' }}>Yesterday, 06:45 PM</td>
                                        <td style={{ padding: '12px 16px', color: '#475569' }}>Windows 11 • 117.200.44.12</td>
                                        <td style={{ padding: '12px 16px', color: '#475569' }}>Secunderabad, IN</td>
                                        <td style={{ padding: '12px 16px', color: '#059669', fontWeight: '700' }}>Success</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '12px 16px', fontWeight: '600' }}>Aug 02, 11:30 PM</td>
                                        <td style={{ padding: '12px 16px', color: '#475569' }}>Unknown Mobile • 45.22.10.8</td>
                                        <td style={{ padding: '12px 16px', color: '#dc2626' }}>Moscow, RU</td>
                                        <td style={{ padding: '12px 16px', color: '#dc2626', fontWeight: '700' }}>Blocked (Geo)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'audit' && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                                <Activity size={24} color="#0f172a" />
                                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>My Recent Audit Trail</h2>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    { action: 'Password reset initiated for Employee ID EMP-9921', time: '10 mins ago', status: 'Completed' },
                                    { action: 'Approved Q3 Finance Report from Accounts Dept', time: '2 hours ago', status: 'Authorized' },
                                    { action: 'Modified System Notification Preferences', time: 'Yesterday, 14:30', status: 'Updated' },
                                    { action: 'Granted "Editor" access to new Marketing head', time: 'Yesterday, 09:15', status: 'Completed' }
                                ].map((log, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '8px', borderRadius: '8px' }}><ShieldAlert size={16} /></div>
                                            <div>
                                                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{log.action}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{log.time}</div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669', background: '#dcfce7', padding: '4px 10px', borderRadius: '100px' }}>
                                            {log.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '350px', color: '#64748b', textAlign: 'center' }}>
                            <Cpu size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                            <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a', fontSize: '1.2rem', fontWeight: '800' }}>System Preferences</h3>
                            <p style={{ maxWidth: '400px', margin: 0, lineHeight: 1.5 }}>
                                Notification channels, theme settings, and dashboard layouts are managed centrally by the IT department for all Level 4 staff.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>
    );
};

export default AdminProfile;
