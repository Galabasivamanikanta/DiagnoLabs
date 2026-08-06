import React, { useState, useContext, useRef, useMemo, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../config/firebase';
import { DoctorDashboard, PhlebotomistDashboard, DeliveryPartnerDashboard } from '../components/RoleDashboards';
import { 
    User, Mail, Phone, MapPin, Calendar, ShieldCheck, Edit3, Check, X, 
    Camera, Droplets, Map, Plus, Trash2, HeartPulse, Activity, Users, 
    Lock, Copy, Sparkles, AlertCircle, Info, Navigation
} from 'lucide-react';

const UserProfile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'health', 'address', 'family', 'security'
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState(() => ({
        name: user?.name || '',
        phone: user?.phone || '',
        dob: user?.dob || '',
        gender: user?.gender || '',
        bloodGroup: user?.bloodGroup || '',
        emergencyContact: user?.emergencyContact || '',
        allergies: user?.allergies || '',
        medicalConditions: user?.medicalConditions || '',
        address_street: user?.address?.street || '',
        address_city: user?.address?.city || '',
        address_pincode: user?.address?.pincode || '',
        address_landmark: user?.address?.landmark || '',
        addressType: user?.address?.addressType || 'Home',
        profilePic: user?.profilePic || ''
    }));

    // Family member modal / inline add state
    const [familyMembers, setFamilyMembers] = useState(user?.familyMembers || []);
    const [newMember, setNewMember] = useState({ name: '', relation: 'Father', age: '', gender: 'Male', bloodGroup: '' });
    const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
    const [localRole, setLocalRole] = useState(user?.role || 'patient');

    const [message, setMessage] = useState({ text: '', type: '' });
    const [copiedId, setCopiedId] = useState(false);
    const fileInputRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(user?.profilePic || null);

    useEffect(() => {
        if (user?.role) setLocalRole(user.role);
    }, [user]);

    // Calculate Profile Completion Percentage
    const profileStrength = useMemo(() => {
        if (!user) return 0;
        let filled = 0;
        const total = 9;
        if (user.name) filled++;
        if (user.phone && user.phone !== 'Not Provided') filled++;
        if (user.dob) filled++;
        if (user.gender) filled++;
        if (user.bloodGroup) filled++;
        if (user.address?.street) filled++;
        if (user.emergencyContact) filled++;
        if (user.allergies || user.medicalConditions) filled++;
        if (user.familyMembers && user.familyMembers.length > 0) filled++;
        return Math.round((filled / total) * 100);
    }, [user]);

    const getRoleDisplay = (role) => {
        switch(role) {
            case 'patient': return 'Standard Patient Plan';
            case 'admin': return 'System Administrator';
            case 'doctor': return 'Certified Medical Practitioner';
            case 'phlebotomist': return 'Diagnostic Sample Specialist';
            case 'delivery_partner': return 'Logistics Expert';
            default: return 'Medical Staff';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCopyId = () => {
        if (user?.customerId) {
            navigator.clipboard.writeText(user.customerId);
            setCopiedId(true);
            setTimeout(() => setCopiedId(false), 2500);
        }
    };

    const handleLocationClick = () => {
        if (!navigator.geolocation) {
            setMessage({ text: 'Geolocation is not supported by your browser.', type: 'error' });
            return;
        }

        setMessage({ text: 'Auto-detecting your precise location...', type: 'info' });
        
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const res = await axios.get(`${API_BASE_URL}/api/utils/geocode?lat=${latitude}&lng=${longitude}`);
                const data = res.data;
                
                if (data && data.display_name) {
                    setFormData(prev => ({ 
                        ...prev, 
                        address_street: data.display_name,
                        address_city: data.address?.city || data.address?.town || data.address?.state_district || '',
                        address_pincode: data.address?.postcode || '',
                        address_landmark: data.address?.suburb || data.address?.neighbourhood || ''
                    }));
                    setMessage({ text: 'Exact GPS Address Auto-Filled!', type: 'success' });
                    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
                } else {
                    setMessage({ text: 'Could not resolve exact address.', type: 'error' });
                }
            } catch (err) {
                console.error("Geocoding error:", err);
                setMessage({ text: 'Failed to fetch address details. Please try again.', type: 'error' });
            }
        }, () => {
            setMessage({ text: 'Please allow location access in your browser.', type: 'error' });
        }, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        });
    };

    const handleAddFamilyMember = (e) => {
        e.preventDefault();
        if (!newMember.name || !newMember.relation) {
            setMessage({ text: 'Please fill name and relation for family member.', type: 'error' });
            return;
        }
        const updatedList = [...familyMembers, { ...newMember, id: Date.now() }];
        setFamilyMembers(updatedList);
        setNewMember({ name: '', relation: 'Father', age: '', gender: 'Male', bloodGroup: '' });
        setShowAddFamilyModal(false);
        setMessage({ text: 'Family member added! Click "Save Profile" to apply.', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleRemoveFamilyMember = (indexToRemove) => {
        const updatedList = familyMembers.filter((_, index) => index !== indexToRemove);
        setFamilyMembers(updatedList);
        setMessage({ text: 'Family member removed. Save changes to update server.', type: 'info' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleImageUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setMessage({ text: 'Image size should be under 2MB.', type: 'error' });
                return;
            }
            
            // Show local preview immediately
            const localPreview = URL.createObjectURL(file);
            setPreviewImage(localPreview);
            setMessage({ text: 'Uploading to secure cloud... please wait.', type: 'success' });
            
            try {
                // Upload to Firebase Storage
                const fileRef = ref(storage, `profile_pictures/${user._id}_${Date.now()}`);
                await uploadBytes(fileRef, file);
                const downloadURL = await getDownloadURL(fileRef);
                
                // Update formData with the Cloud URL instead of Base64
                setFormData(prev => ({ ...prev, profilePic: downloadURL }));
                setMessage({ text: 'Cloud upload successful! Click Save to apply.', type: 'success' });
            } catch (error) {
                console.error("Firebase upload error:", error);
                setMessage({ text: 'Failed to upload image to cloud.', type: 'error' });
            }
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            const updatePayload = {
                name: formData.name,
                phone: formData.phone,
                dob: formData.dob,
                gender: formData.gender,
                bloodGroup: formData.bloodGroup,
                emergencyContact: formData.emergencyContact,
                allergies: formData.allergies,
                medicalConditions: formData.medicalConditions,
                address: { 
                    street: formData.address_street,
                    city: formData.address_city,
                    pincode: formData.address_pincode,
                    landmark: formData.address_landmark,
                    addressType: formData.addressType
                },
                familyMembers: familyMembers,
                profilePic: formData.profilePic
            };
            
            const res = await axios.put(
                `${API_BASE_URL}/api/auth/${user._id}`, 
                updatePayload, 
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            updateUser(res.data);
            setIsEditing(false);
            setMessage({ text: 'Profile & Health Card updated successfully!', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 4000);
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Update failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: '6.5rem', paddingBottom: '5rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <div className="container" style={{ maxWidth: '1050px', padding: '0 1.25rem' }}>
                
                {/* Floating Notification Toast */}
                {message.text && (
                    <div style={{ 
                        position: 'fixed',
                        bottom: '25px',
                        right: '25px',
                        zIndex: 9999,
                        padding: '1rem 1.5rem', 
                        borderRadius: '16px', 
                        boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                        background: message.type === 'success' ? '#065f46' : message.type === 'error' ? '#991b1b' : '#1e40af',
                        color: 'white',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        animation: 'slideUp 0.3s ease-out'
                    }}>
                        {message.type === 'success' ? <Check size={20} /> : message.type === 'error' ? <X size={20} /> : <Info size={20} />}
                        <span>{message.text}</span>
                    </div>
                )}

                {/* Hero Header Banner */}
                <div className="profile-hero-card" style={{
                    background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)',
                    borderRadius: '24px',
                    padding: '2rem',
                    color: 'white',
                    boxShadow: '0 15px 35px rgba(2, 132, 199, 0.25)',
                    marginBottom: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Background Decorative Rings */}
                    <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.06)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', right: '80px', bottom: '-50px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.04)', pointerEvents: 'none' }} />

                    <div className="profile-hero-content" style={{ position: 'relative', zIndex: 1 }}>
                        {/* Top Row: Avatar + Name + Badge */}
                        <div className="profile-hero-top" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1rem' }}>
                            {/* Avatar */}
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <div className="profile-avatar" style={{ 
                                    width: '80px', height: '80px', 
                                    background: previewImage ? `url(${previewImage}) center/cover no-repeat` : 'linear-gradient(135deg, #38bdf8, #0284c7)',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontSize: '2rem', fontWeight: '900',
                                    border: '3px solid rgba(255, 255, 255, 0.3)',
                                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                                }}>
                                    {!previewImage && user.name?.charAt(0).toUpperCase()}
                                </div>
                                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                                <button 
                                    type="button"
                                    onClick={handleImageUpload}
                                    style={{
                                        position: 'absolute',
                                        bottom: '0px', right: '0px',
                                        width: '28px', height: '28px',
                                        background: 'white', border: 'none',
                                        borderRadius: '50%', boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#0284c7', cursor: 'pointer'
                                    }}
                                    title="Update Photo"
                                >
                                    <Camera size={14} />
                                </button>
                            </div>

                            {/* Name + Badge */}
                            <div style={{ minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                                    <h1 className="profile-hero-name" style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, letterSpacing: '-0.3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</h1>
                                    <span style={{ 
                                        background: 'rgba(255, 255, 255, 0.2)', 
                                        backdropFilter: 'blur(10px)',
                                        padding: '0.2rem 0.6rem', 
                                        borderRadius: '100px', 
                                        fontSize: '0.7rem', 
                                        fontWeight: '700',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        flexShrink: 0
                                    }}>
                                        <ShieldCheck size={12} color="#38bdf8" /> Verified
                                    </span>
                                </div>
                                <p style={{ margin: 0, opacity: 0.85, fontSize: '0.8rem', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {user.email}
                                </p>
                                <p style={{ margin: '0.15rem 0 0 0', opacity: 0.75, fontSize: '0.75rem', fontWeight: '500' }}>
                                    {user.phone || 'No Phone'}
                                </p>
                            </div>
                        </div>

                        {/* Bottom Row: Customer ID + Profile Strength + Edit Button */}
                        <div className="profile-hero-bottom" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {/* Customer ID */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px', padding: '0.35rem 0.7rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <span style={{ fontSize: '0.65rem', opacity: 0.7, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>ID:</span>
                                <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '0.8rem', color: '#7dd3fc', letterSpacing: '0.5px' }}>
                                    {user?.customerId || 'N/A'}
                                </span>
                                <button onClick={handleCopyId} title="Copy" style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex' }}>
                                    {copiedId ? <Check size={13} color="#4ade80" /> : <Copy size={13} style={{ opacity: 0.7 }} />}
                                </button>
                            </div>

                            {/* Profile Strength - Compact */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '0.35rem 0.7rem', flex: '1', minWidth: '120px' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: '700', whiteSpace: 'nowrap' }}>{profileStrength}%</span>
                                <div style={{ flex: 1, height: '6px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '100px', overflow: 'hidden' }}>
                                    <div style={{ width: `${profileStrength}%`, height: '100%', background: '#38bdf8', borderRadius: '100px', transition: 'width 0.5s ease' }} />
                                </div>
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
                                    color: isEditing ? 'white' : '#0284c7',
                                    border: 'none',
                                    padding: '0.5rem 1rem', 
                                    borderRadius: '10px', 
                                    fontWeight: '700',
                                    fontSize: '0.8rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    flexShrink: 0
                                }}
                            >
                                {isEditing ? <><Check size={15} /> Save</> : <><Edit3 size={15} /> Edit</>}
                            </button>
                        </div>
                    </div>
                </div>


                {/* Main Content Layout (Tabs + Panel) */}
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
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', padding: '0.5rem 1rem', letterSpacing: '0.5px' }}>
                            Navigation
                        </div>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {[
                                { id: 'personal', label: 'Personal Details', icon: User },
                                { id: 'health', label: 'Health Card', icon: HeartPulse },
                                { id: 'address', label: 'Addresses', icon: MapPin },
                                { id: 'family', label: 'Family Members', icon: Users },
                                { id: 'security', label: 'Security & Preferences', icon: Lock }
                            ].map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.85rem 1rem',
                                            borderRadius: '12px',
                                            border: 'none',
                                            background: isActive ? '#e0f2fe' : 'transparent',
                                            color: isActive ? '#0284c7' : '#475569',
                                            fontWeight: isActive ? '700' : '600',
                                            fontSize: '0.95rem',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <Icon size={18} color={isActive ? '#0284c7' : '#64748b'} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Active Tab Panel */}
                    <div style={{ 
                        background: 'white', 
                        borderRadius: '20px', 
                        padding: '2.25rem', 
                        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                        border: '1px solid #e2e8f0',
                        minHeight: '450px'
                    }}>
                        
                        {/* Conditional Dashboards based on Role */}
                        {localRole === 'doctor' && <div style={{ marginBottom: '2rem' }}><DoctorDashboard user={user} /></div>}
                        {localRole === 'phlebotomist' && <div style={{ marginBottom: '2rem' }}><PhlebotomistDashboard user={user} /></div>}
                        {localRole === 'delivery_partner' && <div style={{ marginBottom: '2rem' }}><DeliveryPartnerDashboard user={user} /></div>}

                        {/* TAB 1: PERSONAL DETAILS */}
                        {activeTab === 'personal' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.3rem 0' }}>Personal Information</h3>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Your official identity details used for lab reports and billing.</p>
                                    </div>
                                </div>

                                {isEditing ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#334155', marginBottom: '0.4rem' }}>Full Name</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#334155', marginBottom: '0.4rem' }}>Mobile Number</label>
                                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g. 9876543210" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#334155', marginBottom: '0.4rem' }}>Date of Birth</label>
                                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#334155', marginBottom: '0.4rem' }}>Gender</label>
                                            <select name="gender" value={formData.gender} onChange={handleChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }}>
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                                        <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Full Name</div>
                                            <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>{user.name}</div>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Email Address</div>
                                            <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#0f172a', wordBreak: 'break-all' }}>{user.email}</div>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Mobile Number</div>
                                            <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>{user.phone || 'Not Provided'}</div>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Date of Birth</div>
                                            <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>{user.dob ? new Date(user.dob).toLocaleDateString() : 'Not Set'}</div>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Gender</div>
                                            <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>{user.gender || 'Not Specified'}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 2: HEALTH CARD */}
                        {activeTab === 'health' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.3rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <HeartPulse color="#ef4444" /> Patient Digital Health Card
                                        </h3>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Critical medical parameters used by lab pathologists for accurate test interpretations.</p>
                                    </div>
                                </div>

                                {isEditing ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#334155', marginBottom: '0.4rem' }}>Blood Group</label>
                                            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }}>
                                                <option value="">Select Blood Group</option>
                                                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#334155', marginBottom: '0.4rem' }}>Emergency Contact Phone</label>
                                            <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="e.g. Spouse/Parent Phone" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }} />
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#334155', marginBottom: '0.4rem' }}>Known Allergies (e.g., Penicillin, Latex, Dust)</label>
                                            <textarea name="allergies" value={formData.allergies} onChange={handleChange} rows="2" placeholder="List any known drug or environmental allergies" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }} />
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#334155', marginBottom: '0.4rem' }}>Pre-existing Medical Conditions</label>
                                            <textarea name="medicalConditions" value={formData.medicalConditions} onChange={handleChange} rows="2" placeholder="e.g., Type 2 Diabetes, Hypertension, Asthma" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }} />
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                                        {/* Blood Group Highlight Card */}
                                        <div style={{ background: 'linear-gradient(135deg, #fef2f2, #ffe4e6)', padding: '1.5rem', borderRadius: '16px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ background: '#ef4444', color: 'white', padding: '0.8rem', borderRadius: '12px' }}><Droplets size={28} /></div>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#991b1b', textTransform: 'uppercase' }}>Blood Group</div>
                                                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#7f1d1d' }}>{user.bloodGroup || 'Not Added'}</div>
                                            </div>
                                        </div>

                                        <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Emergency Contact</div>
                                            <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>{user.emergencyContact || 'Not Specified'}</div>
                                        </div>

                                        <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '14px', border: '1px solid #f1f5f9', gridColumn: '1 / -1' }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Known Allergies</div>
                                            <div style={{ fontWeight: '600', fontSize: '1rem', color: user.allergies ? '#0f172a' : '#94a3b8' }}>
                                                {user.allergies || 'No allergies recorded.'}
                                            </div>
                                        </div>

                                        <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '14px', border: '1px solid #f1f5f9', gridColumn: '1 / -1' }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Pre-existing Chronic Conditions</div>
                                            <div style={{ fontWeight: '600', fontSize: '1rem', color: user.medicalConditions ? '#0f172a' : '#94a3b8' }}>
                                                {user.medicalConditions || 'No conditions recorded.'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 3: ADDRESSES */}
                        {activeTab === 'address' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.3rem 0' }}>Sample Collection Address</h3>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Phlebotomists will visit this location for home blood sample collection.</p>
                                    </div>
                                    <button onClick={handleLocationClick} style={{ background: '#e0f2fe', color: '#0284c7', border: 'none', padding: '0.6rem 1.1rem', borderRadius: '10px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                        <Navigation size={16} /> GPS Auto-Detect
                                    </button>
                                </div>

                                {isEditing ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#334155', marginBottom: '0.4rem' }}>Address Type</label>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                {['Home', 'Work', 'Other'].map(type => (
                                                    <button 
                                                        key={type} 
                                                        type="button" 
                                                        onClick={() => setFormData(prev => ({ ...prev, addressType: type }))}
                                                        style={{ 
                                                            padding: '0.6rem 1.2rem', 
                                                            borderRadius: '8px', 
                                                            border: formData.addressType === type ? '2px solid #0284c7' : '1px solid #cbd5e1', 
                                                            background: formData.addressType === type ? '#f0f9ff' : 'white',
                                                            color: formData.addressType === type ? '#0284c7' : '#475569',
                                                            fontWeight: '700',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#334155', marginBottom: '0.4rem' }}>Street Address / Flat / Building</label>
                                            <textarea name="address_street" value={formData.address_street} onChange={handleChange} rows="2" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#334155', marginBottom: '0.4rem' }}>Landmark (Optional)</label>
                                            <input type="text" name="address_landmark" value={formData.address_landmark} onChange={handleChange} placeholder="e.g. Near Metro Pillar 45" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#334155', marginBottom: '0.4rem' }}>City / Locality</label>
                                            <input type="text" name="address_city" value={formData.address_city} onChange={handleChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#334155', marginBottom: '0.4rem' }}>Pincode</label>
                                            <input type="text" name="address_pincode" value={formData.address_pincode} onChange={handleChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }} />
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                            <span style={{ background: '#0284c7', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
                                                {user.address?.addressType || 'Home'}
                                            </span>
                                            <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Primary Collection Point</span>
                                        </div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', lineHeight: '1.6', marginBottom: '0.75rem' }}>
                                            {user.address?.street ? user.address.street : 'No street address provided.'}
                                        </div>
                                        {user.address?.landmark && (
                                            <div style={{ fontSize: '0.9rem', color: '#0369a1', fontWeight: '600', marginBottom: '0.5rem' }}>
                                                📍 Landmark: {user.address.landmark}
                                            </div>
                                        )}
                                        <div style={{ fontSize: '0.95rem', color: '#475569', fontWeight: '600' }}>
                                            {user.address?.city || ''} {user.address?.pincode ? `- ${user.address.pincode}` : ''}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 4: FAMILY MEMBERS */}
                        {activeTab === 'family' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.3rem 0' }}>Family Members & Dependents</h3>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Book diagnostic tests for your parents, spouse, or kids from a single account.</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowAddFamilyModal(!showAddFamilyModal)} 
                                        style={{ background: '#0284c7', color: 'white', border: 'none', padding: '0.65rem 1.2rem', borderRadius: '10px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}
                                    >
                                        <Plus size={18} /> Add Family Member
                                    </button>
                                </div>

                                {/* Add Member Inline Form */}
                                {showAddFamilyModal && (
                                    <form onSubmit={handleAddFamilyMember} style={{ background: '#f0f9ff', padding: '1.5rem', borderRadius: '16px', border: '1.5px solid #bae6fd', marginBottom: '1.5rem' }}>
                                        <h4 style={{ margin: '0 0 1rem 0', color: '#0369a1', fontWeight: '800' }}>Add New Family Member</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontWeight: '700', fontSize: '0.8rem', color: '#0c4a6e', marginBottom: '0.3rem' }}>Full Name</label>
                                                <input type="text" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} required placeholder="e.g. Ramesh Kumar" style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #7dd3fc' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontWeight: '700', fontSize: '0.8rem', color: '#0c4a6e', marginBottom: '0.3rem' }}>Relation</label>
                                                <select value={newMember.relation} onChange={e => setNewMember({ ...newMember, relation: e.target.value })} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #7dd3fc' }}>
                                                    {['Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Sibling', 'Grandparent', 'Other'].map(rel => <option key={rel} value={rel}>{rel}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontWeight: '700', fontSize: '0.8rem', color: '#0c4a6e', marginBottom: '0.3rem' }}>Age</label>
                                                <input type="number" value={newMember.age} onChange={e => setNewMember({ ...newMember, age: e.target.value })} placeholder="e.g. 58" style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #7dd3fc' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontWeight: '700', fontSize: '0.8rem', color: '#0c4a6e', marginBottom: '0.3rem' }}>Gender</label>
                                                <select value={newMember.gender} onChange={e => setNewMember({ ...newMember, gender: e.target.value })} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #7dd3fc' }}>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <button type="submit" style={{ background: '#0284c7', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Add Member</button>
                                            <button type="button" onClick={() => setShowAddFamilyModal(false)} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                                        </div>
                                    </form>
                                )}

                                {/* List of Family Members */}
                                {familyMembers.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                                        <Users size={40} color="#94a3b8" style={{ marginBottom: '0.8rem' }} />
                                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#475569', marginBottom: '0.4rem' }}>No Family Members Added</div>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Add family members to quickly select them during lab test bookings.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                                        {familyMembers.map((member, index) => (
                                            <div key={index} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', position: 'relative' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                    <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                                                        {member.relation}
                                                    </span>
                                                    <button onClick={() => handleRemoveFamilyMember(index)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }} title="Remove Member">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.3rem' }}>{member.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                                                    {member.age ? `${member.age} Yrs` : ''} {member.gender ? `• ${member.gender}` : ''} {member.bloodGroup ? `• ${member.bloodGroup}` : ''}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 5: SECURITY & PREFERENCES */}
                        {activeTab === 'security' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.3rem 0' }}>Security & Account Settings</h3>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Manage authentication, active sessions, and privacy settings.</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {/* Account Security Card */}
                                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div>
                                            <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#0f172a', marginBottom: '0.3rem' }}>Password & Authentication</div>
                                            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Change your password or manage secure login methods.</div>
                                        </div>
                                        <button 
                                            onClick={() => setMessage({ text: 'A password reset link will be sent to your registered email.', type: 'info' })}
                                            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: '700', color: '#334155', cursor: 'pointer' }}
                                        >
                                            Reset Password
                                        </button>
                                    </div>

                                    {/* Account Type info */}
                                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div style={{ padding: '0.5rem 0' }}>
                                            <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#0f172a', marginBottom: '0.3rem' }}>Account Role & Tier</div>
                                            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{getRoleDisplay(localRole)}</div>
                                        </div>
                                        <span style={{ background: '#dcfce7', color: '#166534', padding: '0.4rem 0.9rem', borderRadius: '100px', fontWeight: '800', fontSize: '0.85rem' }}>
                                            Active Status
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
