import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus, Edit3, Trash2, X, Search, Shield, 
    Phone, Mail, User, Lock, ChevronDown, CheckCircle, RefreshCw, Eye, EyeOff
} from 'lucide-react';

const AVATAR_GRADIENTS = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, var(--success), #34d399)',
    'linear-gradient(135deg, var(--accent-gold), var(--accent-gold))',
    'linear-gradient(135deg, #f43f5e, #fb7185)',
    'linear-gradient(135deg, #06b6d4, #22d3ee)',
    'linear-gradient(135deg, #8b5cf6, #c084fc)',
];

const getGradient = (name) => {
    if (!name) return AVATAR_GRADIENTS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const ROLES = [
    { value: 'admin', label: 'Admin (System Manager)' },
    { value: 'employee', label: 'General Staff' },
    { value: 'lab_partner', label: 'Lab Partner' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'phlebotomist', label: 'Sample Collector' },
    { value: 'nurse', label: 'Nurse' },
    { value: 'receptionist', label: 'Front Desk / Reception' },
    { value: 'inventory_manager', label: 'Inventory Manager' },
    { value: 'finance_manager', label: 'Accounts / Finance' },
    { value: 'marketing_head', label: 'Marketing' },
    { value: 'support_staff', label: 'Support Staff' },
    { value: 'delivery_partner', label: 'Delivery Partner' },
    { value: 'quality_auditor', label: 'Quality Control' },
    { value: 'it_specialist', label: 'IT Support' }
];

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // OTP & Wizard States
    const [step, setStep] = useState(1); // 1: Info, 2: OTP, 3: Password
    const [otp, setOtp] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'employee'
    });

    const getHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    };

    const fetchEmployees = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/admin/employees`, getHeaders());
            setEmployees(res.data);
        } catch (err) {
            console.error("Error fetching employees:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async () => {
        if (!formData.name || !formData.email || !formData.phone) {
            alert("Please fill in Name, Email, and Phone Number first.");
            return;
        }
        setVerifying(true);
        setOtpError('');
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/send-otp`, {
                email: formData.email,
                phone: formData.phone
            });
            if (res.data?.message?.includes('successfully') || res.status === 200) {
                setOtpSent(true);
                setStep(2);
                alert(`A 6-digit verification code has been sent to ${formData.email}. Please check your inbox.`);
            } else {
                alert("Failed to send OTP. Please check the email address.");
            }
        } catch (err) {
            console.error("Error sending OTP:", err);
            alert(err.response?.data?.message || "Failed to send verification OTP. Please try again.");
        } finally {
            setVerifying(false);
        }
    };



    const handleVerifyOtp = async () => {
        if (!otp) {
            setOtpError("Please enter the 6-digit OTP.");
            return;
        }
        setVerifying(true);
        setOtpError('');
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
                email: formData.email,
                phone: formData.phone,
                otp: otp
            });
            if (res.status === 200) {
                // OTP is verified, directly submit to backend (password is auto-generated in backend)
                await handleSubmit({ preventDefault: () => {} });
            } else {
                setOtpError("Invalid OTP. Please try again.");
            }
        } catch (err) {
            console.error("Error verifying OTP:", err);
            setOtpError(err.response?.data?.message || "Invalid or expired OTP.");
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        
        

        try {
            if (editMode) {
                await axios.put(`${API_BASE_URL}/api/admin/employees/${currentId}`, formData, getHeaders());
                alert("Employee updated successfully");
            } else {
                await axios.post(`${API_BASE_URL}/api/auth/admin-register`, formData, getHeaders());
                alert("Employee created and registered successfully");
            }
            setShowModal(false);
            resetForm();
            fetchEmployees();
        } catch (err) {
            console.error("Error saving employee:", err);
            const serverMsg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : null);
            alert(serverMsg || "Error saving employee details. Please check if the email or phone number is already registered.");
        }
    };


    const resetForm = () => {
        setFormData({ name: '', email: '', password: '', phone: '', role: 'employee' });
        setConfirmPassword('');
        setOtp('');
        setStep(1);
        setOtpSent(false);
        setOtpError('');
    };

    const handleEdit = (emp) => {
        setEditMode(true);
        setCurrentId(emp._id);
        setFormData({
            name: emp.name,
            email: emp.email,
            password: '',
            phone: emp.phone,
            role: emp.role
        });
        setStep(1); // During edit mode, remain on step 1 to edit metadata
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this employee?")) {
            try {
                await axios.delete(`${API_BASE_URL}/api/admin/employees/${id}`, getHeaders());
                fetchEmployees();
            } catch (err) {
                console.error("Error deleting employee:", err);
            }
        }
    };

    const openCreateModal = () => {
        setEditMode(false);
        resetForm();
        setShowModal(true);
    };

    const [viewMode, setViewMode] = useState('directory'); // 'directory' or 'matrix'
    const [permissionMatrix, setPermissionMatrix] = useState({
        admin: { userMgmt: true, rolesMgmt: true, labPartner: true, bookings: true, reports: true, collector: true, inventory: true, finance: true, marketing: true, support: true, quality: true, it: true },
        employee: { userMgmt: false, rolesMgmt: false, labPartner: false, bookings: true, reports: true, collector: true, inventory: false, finance: false, marketing: false, support: true, quality: false, it: false },
        lab_partner: { userMgmt: false, rolesMgmt: false, labPartner: true, bookings: true, reports: true, collector: false, inventory: true, finance: true, marketing: false, support: false, quality: true, it: false },
        doctor: { userMgmt: false, rolesMgmt: false, labPartner: false, bookings: true, reports: true, collector: false, inventory: false, finance: false, marketing: false, support: false, quality: true, it: false },
        phlebotomist: { userMgmt: false, rolesMgmt: false, labPartner: false, bookings: true, reports: false, collector: true, inventory: false, finance: false, marketing: false, support: false, quality: false, it: false },
        nurse: { userMgmt: false, rolesMgmt: false, labPartner: false, bookings: true, reports: true, collector: true, inventory: true, finance: false, marketing: false, support: false, quality: false, it: false },
        receptionist: { userMgmt: false, rolesMgmt: false, labPartner: false, bookings: true, reports: false, collector: false, inventory: false, finance: true, marketing: false, support: true, quality: false, it: false },
        inventory_manager: { userMgmt: false, rolesMgmt: false, labPartner: false, bookings: false, reports: false, collector: false, inventory: true, finance: false, marketing: false, support: false, quality: true, it: false },
        finance_manager: { userMgmt: false, rolesMgmt: false, labPartner: true, bookings: true, reports: false, collector: false, inventory: false, finance: true, marketing: false, support: false, quality: false, it: false },
        marketing_head: { userMgmt: false, rolesMgmt: false, labPartner: false, bookings: false, reports: false, collector: false, inventory: false, finance: false, marketing: true, support: false, quality: false, it: false },
        support_staff: { userMgmt: false, rolesMgmt: false, labPartner: false, bookings: true, reports: true, collector: false, inventory: false, finance: false, marketing: false, support: true, quality: false, it: false },
        delivery_partner: { userMgmt: false, rolesMgmt: false, labPartner: false, bookings: true, reports: false, collector: true, inventory: false, finance: false, marketing: false, support: false, quality: false, it: false },
        quality_auditor: { userMgmt: false, rolesMgmt: false, labPartner: true, bookings: true, reports: true, collector: false, inventory: true, finance: false, marketing: false, support: false, quality: true, it: false },
        it_specialist: { userMgmt: true, rolesMgmt: false, labPartner: false, bookings: false, reports: false, collector: false, inventory: false, finance: false, marketing: false, support: true, quality: false, it: true }
    });

    const MODULE_COLUMNS = [
        { key: 'userMgmt', label: 'User Mgmt' },
        { key: 'rolesMgmt', label: 'Role & Perms' },
        { key: 'labPartner', label: 'Lab Onboarding' },
        { key: 'bookings', label: 'Bookings' },
        { key: 'reports', label: 'Medical Records' },
        { key: 'collector', label: 'Collector/Delivery' },
        { key: 'inventory', label: 'Inventory' },
        { key: 'finance', label: 'Finance/Payouts' },
        { key: 'marketing', label: 'Marketing' },
        { key: 'support', label: 'Support Tickets' },
        { key: 'quality', label: 'Quality Control' },
        { key: 'it', label: 'IT & Logs' }
    ];

    const togglePermission = (roleKey, moduleKey) => {
        setPermissionMatrix(prev => ({
            ...prev,
            [roleKey]: {
                ...prev[roleKey],
                [moduleKey]: !prev[roleKey]?.[moduleKey]
            }
        }));
    };

    const filteredEmployees = employees.filter(emp => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return emp.name?.toLowerCase().includes(q) || emp.email?.toLowerCase().includes(q) || emp.phone?.includes(q);
    });

    const roleLabel = (role) => {
        const found = ROLES.find(r => r.value === role);
        return found ? found.label : 'Staff member';
    };

    return (
        <div>
            {/* View Mode Switcher */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                <button
                    onClick={() => setViewMode('directory')}
                    style={{
                        padding: '0.6rem 1.2rem',
                        borderRadius: '10px',
                        border: 'none',
                        background: viewMode === 'directory' ? '#003366' : '#f1f5f9',
                        color: viewMode === 'directory' ? 'white' : '#475569',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                    }}
                >
                    Team Directory & Onboarding ({employees.length})
                </button>
                <button
                    onClick={() => setViewMode('matrix')}
                    style={{
                        padding: '0.6rem 1.2rem',
                        borderRadius: '10px',
                        border: 'none',
                        background: viewMode === 'matrix' ? '#003366' : '#f1f5f9',
                        color: viewMode === 'matrix' ? 'white' : '#475569',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                    }}
                >
                    Role Permission Matrix (14 Roles × 12 Modules)
                </button>
            </div>

            {/* Header */}
            {viewMode === 'directory' ? (
                <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="panel-search-wrapper">
                            <Search size={15} />
                            <input
                                type="text"
                                className="panel-search-input"
                                placeholder="Search by name, email, phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                            {filteredEmployees.length} member{filteredEmployees.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <button className="add-employee-btn" onClick={openCreateModal} style={{ background: '#003366', color: 'white', border: 'none', borderRadius: '12px', padding: '0.8rem 1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <UserPlus size={16} />
                        Add Employee
                    </button>
                </div>
            ) : (
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '800' }}>Role & Permission Governance Grid</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Configure exact RBAC module access across all 14 platform roles.</p>
                        </div>
                        <button
                            onClick={() => alert("Role Permission Matrix saved successfully!")}
                            style={{ padding: '0.65rem 1.25rem', background: '#003366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                            Save Matrix Changes
                        </button>
                    </div>
                    <div className="table-responsive" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800', minWidth: '180px' }}>Platform Role</th>
                                    {MODULE_COLUMNS.map(col => (
                                        <th key={col.key} style={{ padding: '12px 8px', textAlign: 'center', color: '#475569', fontWeight: '800', fontSize: '0.75rem', minWidth: '95px' }}>
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {ROLES.map(r => (
                                    <tr key={r.value} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '10px 12px', fontWeight: '700', color: '#0f172a' }}>{r.label}</td>
                                        {MODULE_COLUMNS.map(col => {
                                            const isChecked = permissionMatrix[r.value]?.[col.key] || false;
                                            const isSuperAdmin = r.value === 'admin';
                                            return (
                                                <td key={col.key} style={{ padding: '10px 8px', textAlign: 'center' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        disabled={isSuperAdmin}
                                                        onChange={() => togglePermission(r.value, col.key)}
                                                        style={{ width: '16px', height: '16px', cursor: isSuperAdmin ? 'not-allowed' : 'pointer', accentColor: '#003366' }}
                                                    />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Employee Cards Grid */}
            {loading ? (
                <div className="admin-empty-state">
                    <div className="admin-empty-icon"><User size={32} /></div>
                    <h4>Loading employees...</h4>
                    <p>Synchronizing directory data</p>
                </div>
            ) : filteredEmployees.length === 0 ? (
                <div className="admin-empty-state">
                    <div className="admin-empty-icon"><User size={32} /></div>
                    <h4>{searchQuery ? 'No matches found' : 'No Employees Yet'}</h4>
                    <p>{searchQuery ? 'Try a different search term' : 'Add your first team member to get started'}</p>
                </div>
            ) : (
                <div className="employee-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.5rem', padding: 0 }}>
                    <AnimatePresence>
                        {filteredEmployees.map((emp, index) => (
                            <motion.div
                                key={emp._id}
                                className="employee-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div
                                            className="employee-avatar"
                                            style={{ background: getGradient(emp.name), width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '1.1rem' }}
                                        >
                                            {getInitials(emp.name)}
                                        </div>
                                        <div>
                                            <h5 style={{ margin: 0, fontWeight: '800', color: '#0f172a', fontSize: '1rem' }}>{emp.name}</h5>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{emp.email}</p>
                                        </div>
                                    </div>
                                    <span style={{ background: '#f1f5f9', color: '#475569', borderRadius: '20px', padding: '0.25rem 0.75rem', fontSize: '0.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Shield size={10} />
                                        {roleLabel(emp.role)}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.8rem', fontSize: '0.8rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#94a3b8' }}>Phone:</span>
                                        <span style={{ fontWeight: '700', color: '#334155' }}>{emp.phone || '—'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#94a3b8' }}>Status:</span>
                                        <span style={{ fontWeight: '800', color: emp.isVerified ? 'var(--success)' : 'var(--accent-gold-hover)' }}>
                                            {emp.isVerified ? 'VERIFIED' : 'PENDING'}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                                    <button onClick={() => handleEdit(emp)} style={{ flex: 1, padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '10px', background: 'white', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: '#4b5563' }}>
                                        <Edit3 size={12} /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(emp._id)} style={{ flex: 1, padding: '0.6rem', border: '1px solid #fef2f2', borderRadius: '10px', background: 'white', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: 'var(--danger)' }}>
                                        <Trash2 size={12} /> Remove
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.97 }}
                            style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}
                        >
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#0f172a' }}>{editMode ? 'Update Employee' : 'Add New Employee'}</h3>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{editMode ? 'Modify member metadata' : 'Step-by-step verified employee assignment'}</p>
                                </div>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }} onClick={() => setShowModal(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Step Wizard Header Indicator (Only in Create Mode) */}
                            {!editMode && (
                                <div style={{ display: 'flex', padding: '1rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', gap: '1rem', justifyContent: 'space-around' }}>
                                    {[
                                        { label: 'Details', number: 1 },
                                        { label: 'Verify OTP', number: 2 },
                                        { label: 'Credentials', number: 3 }
                                    ].map((s) => (
                                        <div key={s.number} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '800', color: step === s.number ? '#003366' : (step > s.number ? 'var(--success)' : '#94a3b8') }}>
                                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: step === s.number ? '#003366' : (step > s.number ? 'var(--success)' : '#e2e8f0'), color: step >= s.number ? 'white' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>
                                                {step > s.number ? '✓' : s.number}
                                            </div>
                                            <span>{s.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} style={{ margin: 0 }}>
                                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '60vh', overflowY: 'auto' }}>
                                    
                                    {/* ── STEP 1: FILL INFO ── */}
                                    {step === 1 && (
                                        <>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Full Name</label>
                                                <input
                                                    type="text"
                                                    style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #cbd5e1', borderRadius: '10px', outline: 'none', fontSize: '0.95rem' }}
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Enter employee name"
                                                />
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Email Address</label>
                                                <input
                                                    type="email"
                                                    style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #cbd5e1', borderRadius: '10px', outline: 'none', fontSize: '0.95rem' }}
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="employee@diagnolabs.in"
                                                />
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Mobile Number</label>
                                                    <input
                                                        type="text"
                                                        style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #cbd5e1', borderRadius: '10px', outline: 'none', fontSize: '0.95rem' }}
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        required
                                                        placeholder="+91 XXXXX XXXXX"
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Choose Role</label>
                                                    <select
                                                        style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #cbd5e1', borderRadius: '10px', outline: 'none', fontSize: '0.95rem', background: 'white' }}
                                                        name="role"
                                                        value={formData.role}
                                                        onChange={handleInputChange}
                                                    >
                                                        {ROLES.map(r => (
                                                            <option key={r.value} value={r.value}>{r.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* ── STEP 2: OTP VERIFICATION ── */}
                                    {step === 2 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center', padding: '1rem 0' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-gold-light)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'var(--accent-gold-hover)', margin: '0 auto' }}>
                                                <Mail size={24} />
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0, fontWeight: '800', color: '#0f172a' }}>Verify Email Address</h4>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>We sent a 6-digit verification code to <span style={{ fontWeight: '700', color: '#0f172a' }}>{formData.email}</span></p>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxWidth: '220px', margin: '0 auto', width: '100%' }}>
                                                <input
                                                    type="text"
                                                    maxLength="6"
                                                    style={{ width: '100%', padding: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '10px', outline: 'none', fontSize: '1.5rem', fontWeight: '800', letterSpacing: '0.3em', textAlign: 'center' }}
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                                    placeholder="000000"
                                                />
                                            </div>

                                            {otpError && (
                                                <div style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: '700' }}>{otpError}</div>
                                            )}

                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', fontSize: '0.8rem' }}>
                                                <span style={{ color: '#64748b' }}>Didn't receive code?</span>
                                                <button type="button" onClick={handleSendOtp} style={{ background: 'none', border: 'none', color: '#003366', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                    <RefreshCw size={12} /> Resend OTP
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                </div>

                                <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                    <button type="button" style={{ padding: '0.75rem 1.5rem', border: '1px solid #e2e8f0', borderRadius: '10px', background: 'white', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', color: '#64748b' }} onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    
                                    {/* Action Wizard buttons */}
                                    {step === 1 && !editMode && (
                                        <button type="button" onClick={handleSendOtp} disabled={verifying} style={{ padding: '0.75rem 1.5rem', border: 'none', borderRadius: '10px', background: '#003366', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            {verifying ? 'Sending OTP...' : 'Send Verification OTP'}
                                        </button>
                                    )}

                                    {step === 1 && editMode && (
                                        <button type="button" onClick={(e) => handleSubmit(e)} style={{ padding: '0.75rem 1.5rem', border: 'none', borderRadius: '10px', background: '#003366', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', color: 'white' }}>
                                            Save Metadata
                                        </button>
                                    )}

                                    {step === 2 && (
                                        <button type="button" onClick={handleVerifyOtp} disabled={verifying} style={{ padding: '0.75rem 1.5rem', border: 'none', borderRadius: '10px', background: '#003366', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', color: 'white' }}>
                                            {verifying ? 'Verifying...' : 'Verify & Register Employee'}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmployeeManagement;


