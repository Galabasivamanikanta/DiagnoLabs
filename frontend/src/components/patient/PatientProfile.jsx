import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { UserCircle, Mail, Phone, MapPin, HeartPulse, Activity, ShieldCheck, Edit3, Check, X, FileText, Download, Camera } from 'lucide-react';

const PatientProfile = ({ bookings, onDownloadInvoice }) => {
    const { user, updateUser } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address?.street || ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const fileInputRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            const updatePayload = {
                name: formData.name,
                phone: formData.phone,
                address: { street: formData.address }
            };
            
            const res = await axios.put(`${API_BASE_URL}/api/auth/${user._id}`, updatePayload);
            updateUser(res.data);
            setIsEditing(false);
            setMessage({ text: 'Patient Profile updated successfully.', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Update failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    // Handle dummy image upload click
    const handleImageUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setPreviewImage(previewUrl);
            setMessage({ text: 'Image selected! Local preview activated.', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        }
    };

    const completedBookings = bookings.filter(b => b.status === 'Report Uploaded');

    return (
        <div className="animate-fade-in" style={{ padding: '0 0 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: '800' }}>Patient Identity & Settings</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your personal details, secure contacts, and document library.</p>
                </div>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Edit3 size={18} /> Modify Profile
                    </button>
                )}
            </div>

            {message.text && (
                <div style={{ 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    marginBottom: '2rem', 
                    background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: message.type === 'success' ? '#166534' : '#991b1b',
                    fontWeight: '700' 
                }}>
                    {message.text}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '2rem' }}>
                
                {/* Left Column: Patient Overview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', background: 'white' }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem' }}>
                            <div style={{ 
                                width: '100%', height: '100%', 
                                background: previewImage ? `url(${previewImage}) center/cover no-repeat` : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: '3rem', fontWeight: '900',
                                boxShadow: '0 10px 25px rgba(2, 102, 255, 0.2)'
                            }}>
                                {!previewImage && user.name?.charAt(0).toUpperCase()}
                            </div>
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                            <button 
                                onClick={handleImageUpload}
                                style={{
                                    position: 'absolute',
                                    bottom: '0px', right: '0px',
                                    width: '36px', height: '36px',
                                    background: 'white', border: 'none',
                                    borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--primary)', cursor: 'pointer', zIndex: 2,
                                    transition: 'transform 0.2s ease, background 0.2s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = '#f8fafc'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'white'; }}
                                title="Change Profile Picture"
                            >
                                <Camera size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                        <h3 style={{ fontSize: '1.6rem', margin: 0, color: 'var(--text-main)', fontWeight: '800' }}>{user.name}</h3>
                        <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1rem', marginBottom: '1.5rem' }}>Primary Beneficiary</p>
                        
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <ShieldCheck size={20} className="text-primary" />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</div>
                                    <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#166534' }}>Verified Identity</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <HeartPulse size={20} className="text-danger" />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Account Type</div>
                                    <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>Standard Care Plan</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* About My Health / Activity */}
                    <div className="glass-card" style={{ padding: '2rem', background: 'white' }}>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={18} className="text-primary"/> Activity Summary
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary)' }}>{bookings.length}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>Total Interactions</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#166534' }}>{completedBookings.length}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>Reports Processed</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details & Document Library */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    <div className="glass-card" style={{ padding: '2.5rem', background: 'white' }}>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '2px solid var(--background)', paddingBottom: '1rem' }}>
                            <UserCircle size={24} className="text-primary" /> Contact Parameters
                        </h3>

                        {isEditing ? (
                            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <label>Full Legal Name</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" required style={{ border: '1px solid var(--border)', padding: '0.8rem', borderRadius: '12px', width: '100%' }} />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address <span style={{fontSize: '0.75rem', color: 'red'}}>(System Locked)</span></label>
                                        <input type="email" value={user.email} className="form-control" readOnly style={{ background: '#f1f5f9', cursor: 'not-allowed', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '0.8rem', borderRadius: '12px', width: '100%' }} />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label>Secure Contact Number</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="form-control" style={{ border: '1px solid var(--border)', padding: '0.8rem', borderRadius: '12px', width: '100%' }} />
                                </div>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label>Residential / Care Address</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="form-control" style={{ border: '1px solid var(--border)', padding: '0.8rem', borderRadius: '12px', width: '100%' }} />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.8rem 2rem', borderRadius: '12px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        {loading ? 'Committing...' : <><Check size={18} /> Save Settings</>}
                                    </button>
                                    <button type="button" className="btn" onClick={() => setIsEditing(false)} style={{ padding: '0.8rem 2rem', borderRadius: '12px', background: '#f1f5f9', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <X size={18} /> Discard Changes
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Primary Communication</div>
                                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <Mail size={18} className="text-primary" /> {user.email}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Registered Contact</div>
                                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <Phone size={18} className="text-success" /> {user.phone || 'Pending Configuration'}
                                    </div>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Registered Base Location</div>
                                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <MapPin size={18} className="text-danger" /> {user.address?.street || 'Not Configured'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Document Management View */}
                    <div className="glass-card" style={{ padding: '2.5rem', background: 'white' }}>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '2px solid var(--background)', paddingBottom: '1rem' }}>
                            <FileText size={24} className="text-primary" /> Personal Document Library
                        </h3>

                        {completedBookings.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '16px' }}>
                                <FileText size={32} style={{ color: 'var(--text-light)', margin: '0 auto 1rem' }} />
                                <div style={{ fontWeight: '700', color: 'var(--text-muted)' }}>No medical documents available to display.</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Complete a lab test to securely manage reports here.</div>
                            </div>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {completedBookings.slice(0, 3).map((b, i) => (
                                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '0.95rem' }}>DiagnoLabs_Report_{b._id.slice(-5).toUpperCase()}.pdf</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(b.date).toLocaleDateString()} • Secure Access</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {b.reportUrl && (
                                                <a href={b.reportUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Download size={14} /> Download
                                                </a>
                                            )}
                                            <button onClick={() => onDownloadInvoice(b)} className="btn" style={{ background: 'white', border: '1px solid var(--border)', padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '8px' }}>
                                                Invoice
                                            </button>
                                        </div>
                                    </li>
                                ))}
                                {completedBookings.length > 3 && (
                                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                        <button className="btn" style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem' }}>View All Documents</button>
                                    </div>
                                )}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientProfile;
