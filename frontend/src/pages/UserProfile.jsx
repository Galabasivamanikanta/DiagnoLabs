import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { UserCircle, Mail, Phone, MapPin, Calendar, ShieldCheck, Edit3, Check, X, Camera, Droplets, Map } from 'lucide-react';

const UserProfile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(() => ({
        name: user?.name || '',
        phone: user?.phone || '',
        address_street: user?.address?.street || '',
        address_city: user?.address?.city || '',
        address_pincode: user?.address?.pincode || '',
        dob: user?.dob || '',
        gender: user?.gender || '',
        bloodGroup: user?.bloodGroup || '',
        emergencyContact: user?.emergencyContact || '',
        profilePic: user?.profilePic || ''
    }));
    const [message, setMessage] = useState({ text: '', type: '' });
    const fileInputRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(user?.profilePic || null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLocationClick = () => {
        if (!navigator.geolocation) {
            setMessage({ text: 'Geolocation is not supported by your browser.', type: 'error' });
            return;
        }

        setMessage({ text: 'Locating you...', type: 'success' });
        
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                // Use our own Node.js backend proxy to securely fetch high-resolution OpenStreetMap data without browser blocking
                const res = await axios.get(`${API_BASE_URL}/api/utils/geocode?lat=${latitude}&lng=${longitude}`);
                const data = res.data;
                
                if (data && data.display_name) {
                    setFormData(prev => ({ 
                        ...prev, 
                        address_street: data.display_name,
                        address_city: data.address?.city || data.address?.town || data.address?.state_district || '',
                        address_pincode: data.address?.postcode || ''
                    }));
                    setMessage({ text: 'Exact GPS Location Found! You can edit the details if needed.', type: 'success' });
                    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
                } else {
                    setMessage({ text: 'Could not resolve exact address.', type: 'error' });
                }
            } catch (err) {
                console.error("Geocoding error:", err);
                setMessage({ text: 'Failed to fetch address details. Please try again.', type: 'error' });
            }
        }, (error) => {
            setMessage({ text: 'Please allow location access in your browser to auto-locate.', type: 'error' });
        }, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            const updatePayload = {
                name: formData.name,
                phone: formData.phone,
                address: { 
                    street: formData.address_street,
                    city: formData.address_city,
                    pincode: formData.address_pincode
                },
                dob: formData.dob,
                gender: formData.gender,
                bloodGroup: formData.bloodGroup,
                emergencyContact: formData.emergencyContact,
                profilePic: formData.profilePic
            };
            
            const res = await axios.put(`${API_BASE_URL}/api/auth/${user._id}`, updatePayload);
            updateUser(res.data);
            setIsEditing(false);
            setMessage({ text: 'Profile updated successfully.', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Update failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const handleImageUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (limit to 2MB to prevent large Base64 strings in MongoDB)
            if (file.size > 2 * 1024 * 1024) {
                setMessage({ text: 'Image is too large. Please select an image under 2MB.', type: 'error' });
                setTimeout(() => setMessage({ text: '', type: '' }), 4000);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setPreviewImage(base64String);
                setFormData(prev => ({ ...prev, profilePic: base64String }));
                setMessage({ text: 'Profile picture selected! Click "Save Changes" to apply.', type: 'success' });
                setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div style={{ background: 'var(--background)', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '5rem' }}>
            <div className="container animate-fade-in" style={{ maxWidth: '900px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: '800' }}>User Profile</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Manage your personal identity, contact details, and clinical identifiers.</p>
                    </div>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <Edit3 size={18} /> Edit Profile
                        </button>
                    )}
                </div>

                {message.text && (
                    <div className="animate-fade-in" style={{ 
                        position: 'fixed',
                        bottom: '30px',
                        right: '30px',
                        zIndex: 9999,
                        padding: '1.2rem 1.8rem', 
                        borderRadius: '16px', 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                        color: message.type === 'success' ? '#166534' : '#991b1b',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                    }}>
                        {message.type === 'success' ? <Check size={22} /> : <X size={22} />}
                        {message.text}
                    </div>
                )}

                <div className="glass-card" style={{ padding: '3rem', background: 'white' }}>
                    {/* Header Area */}
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '2.5rem', marginBottom: '2.5rem' }}>
                        <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                            <div style={{ 
                                width: '100%', height: '100%', 
                                background: previewImage ? `url(${previewImage}) center/cover no-repeat` : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: '3.5rem', fontWeight: '900',
                                boxShadow: '0 10px 25px rgba(2, 102, 255, 0.2)'
                            }}>
                                {!previewImage && user.name?.charAt(0).toUpperCase()}
                            </div>
                            {isEditing && (
                                <>
                                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                                    <button 
                                        type="button"
                                        onClick={handleImageUpload}
                                        style={{
                                            position: 'absolute',
                                            bottom: '5px', right: '5px',
                                            width: '40px', height: '40px',
                                            background: 'white', border: '1px solid var(--border)',
                                            borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--primary)', cursor: 'pointer', zIndex: 2,
                                        }}
                                        title="Change Profile Picture"
                                    >
                                        <Camera size={20} />
                                    </button>
                                </>
                            )}
                        </div>
                        <div>
                            <h3 style={{ fontSize: '2.2rem', margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontWeight: '800' }}>{user.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '100px', fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ShieldCheck size={16} /> Verified User
                                </span>
                                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>{user.role === 'patient' ? 'Standard Care Plan' : 'Admin'}</span>
                            </div>
                            {/* Customer ID — always visible */}
                            <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', border: '1.5px solid #bae6fd', borderRadius: '12px', padding: '0.6rem 1.2rem' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                                </svg>
                                <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Customer ID</div>
                                    <div style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '1.1rem', color: '#0c4a6e', letterSpacing: '1.5px' }}>
                                        {user?.customerId || 'Not assigned yet'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' }}>Full Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <UserCircle size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" required style={{ border: '1px solid var(--border)', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', width: '100%', background: '#f8fafc', fontWeight: '600', outline: 'none' }} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                                        <input type="email" value={user.email} className="form-control" readOnly style={{ border: '1px solid var(--border)', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', width: '100%', background: '#f1f5f9', color: 'var(--text-muted)', cursor: 'not-allowed', fontWeight: '600', outline: 'none' }} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' }}>Mobile Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="form-control" placeholder="e.g. 9876543210" style={{ border: '1px solid var(--border)', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', width: '100%', background: '#f8fafc', fontWeight: '600', outline: 'none' }} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' }}>Date of Birth</label>
                                    <div style={{ position: 'relative' }}>
                                        <Calendar size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="form-control" style={{ border: '1px solid var(--border)', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', width: '100%', background: '#f8fafc', fontWeight: '600', outline: 'none' }} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' }}>Gender</label>
                                    <div style={{ position: 'relative' }}>
                                        <UserCircle size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                                        <select name="gender" value={formData.gender} onChange={handleChange} className="form-control" style={{ border: '1px solid var(--border)', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', width: '100%', background: '#f8fafc', fontWeight: '600', appearance: 'none', outline: 'none' }}>
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' }}>Blood Group</label>
                                    <div style={{ position: 'relative' }}>
                                        <Droplets size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-danger)' }} />
                                        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="form-control" style={{ border: '1px solid var(--border)', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', width: '100%', background: '#f8fafc', fontWeight: '600', appearance: 'none', outline: 'none' }}>
                                            <option value="">Select Blood Group</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <label style={{ fontWeight: '700', color: 'var(--text-main)', display: 'block' }}>Precise Collection Address</label>
                                    <button type="button" onClick={handleLocationClick} title="Auto-Locate GPS" style={{ background: 'var(--primary-light)', border: 'none', color: 'var(--primary)', padding: '0.4rem 0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', transition: 'all 0.2s' }}>
                                        <Map size={16} /> Auto-Detect Area
                                    </button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ position: 'relative', gridColumn: '1 / -1' }}>
                                        <MapPin size={20} style={{ position: 'absolute', left: '1rem', top: '1.5rem', color: 'var(--text-light)' }} />
                                        <textarea name="address_street" value={formData.address_street} onChange={handleChange} className="form-control" placeholder="House / Flat No., Building Name, Street, Landmark" rows="3" style={{ border: '1px solid var(--border)', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', width: '100%', background: '#f8fafc', fontWeight: '600', outline: 'none', resize: 'vertical' }}></textarea>
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <input type="text" name="address_city" value={formData.address_city} onChange={handleChange} className="form-control" placeholder="City / Locality" style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '12px', width: '100%', background: '#f8fafc', fontWeight: '600', outline: 'none' }} />
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <input type="text" name="address_pincode" value={formData.address_pincode} onChange={handleChange} className="form-control" placeholder="Pincode" style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '12px', width: '100%', background: '#f8fafc', fontWeight: '600', outline: 'none' }} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '1rem 2.5rem', borderRadius: '12px', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '1.1rem', cursor: 'pointer', border: 'none' }}>
                                    {loading ? 'Saving...' : <><Check size={20} /> Save Changes</>}
                                </button>
                                <button type="button" className="btn" onClick={() => setIsEditing(false)} style={{ padding: '1rem 2.5rem', borderRadius: '12px', background: '#f1f5f9', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: '700', cursor: 'pointer', border: 'none' }}>
                                    <X size={20} /> Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2.5rem' }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>Email Address</div>
                                <div style={{ fontWeight: '800', fontSize: '1.15rem', color: 'var(--text-main)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '8px' }}><Mail size={20} className="text-primary" /></div>
                                    <span style={{ wordBreak: 'break-all' }}>{user.email}</span>
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>Mobile Number</div>
                                <div style={{ fontWeight: '800', fontSize: '1.15rem', color: 'var(--text-main)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '8px' }}><Phone size={20} className="text-success" /></div>
                                    {user.phone || 'Not provided'}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>Date of Birth</div>
                                <div style={{ fontWeight: '800', fontSize: '1.15rem', color: 'var(--text-main)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '8px' }}><Calendar size={20} className="text-warning" /></div>
                                    {user.dob ? new Date(user.dob).toLocaleDateString() : 'Not provided'}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>Gender</div>
                                <div style={{ fontWeight: '800', fontSize: '1.15rem', color: 'var(--text-main)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '8px' }}><UserCircle size={20} className="text-primary" /></div>
                                    {user.gender || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>Blood Group</div>
                                <div style={{ fontWeight: '800', fontSize: '1.15rem', color: 'var(--text-main)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '8px' }}><Droplets size={20} className="text-danger" /></div>
                                    {user.bloodGroup || 'N/A'}
                                </div>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>Precise Collection Address</div>
                                <div style={{ fontWeight: '800', fontSize: '1.15rem', color: 'var(--text-main)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                    <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '8px', flexShrink: 0 }}><MapPin size={20} className="text-danger" /></div>
                                    <span style={{ lineHeight: '1.5', marginTop: '0.2rem' }}>
                                        {user.address?.street ? `${user.address.street}, ${user.address.city || ''} - ${user.address.pincode || ''}` : 'Not provided'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
