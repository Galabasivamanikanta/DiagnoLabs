import React, { useState, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { AuthContext } from '../../context/AuthContext';
import { Megaphone, Send, Users, AlertCircle } from 'lucide-react';

const BroadcastEngine = () => {
    const { user } = useContext(AuthContext);
    const [audience, setAudience] = useState('All Patients');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState('');

    const handleBroadcast = async (e) => {
        e.preventDefault();
        setSending(true);
        setStatus('');
        try {
            await axios.post(`${API_BASE_URL}/api/admin/broadcast`, {
                targetAudience: audience,
                subject,
                message
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setStatus('Broadcast transmitted successfully across the network!');
            setSubject('');
            setMessage('');
        } catch (err) {
            setStatus('Failed to transmit broadcast.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '0.75rem', background: '#e0e7ff', borderRadius: '12px', color: '#4338ca' }}>
                        <Megaphone size={28} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.4rem', color: 'var(--text-main)' }}>Global Broadcast Engine</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Transmit system notices, alerts, and offers to network participants.</p>
                    </div>
                </div>

                {status && (
                    <div style={{ padding: '1rem', background: status.includes('success') ? '#dcfce7' : '#fee2e2', color: status.includes('success') ? '#166534' : '#991b1b', borderRadius: '12px', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={18} /> {status}
                    </div>
                )}

                <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Target Audience</label>
                        <div style={{ position: 'relative' }}>
                            <Users size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                            <select 
                                value={audience} 
                                onChange={e => setAudience(e.target.value)}
                                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', border: '1.5px solid var(--border)', outline: 'none', fontWeight: '600', fontSize: '1rem', appearance: 'none', background: 'white' }}
                            >
                                <option value="All Patients">All Registered Patients</option>
                                <option value="All Lab Partners">All Accredited Lab Partners</option>
                                <option value="All Phlebotomists">All Phlebotomists / Fleet</option>
                                <option value="Entire Network">Entire Network (Everyone)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Broadcast Subject</label>
                        <input 
                            type="text" 
                            required
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            placeholder="e.g. Free Health Checkup Camp this Sunday!"
                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1.5px solid var(--border)', outline: 'none', fontWeight: '600', fontSize: '1rem' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Message Body (WhatsApp & Email format)</label>
                        <textarea 
                            required
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Enter the broadcast message here..."
                            rows={6}
                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1.5px solid var(--border)', outline: 'none', fontWeight: '500', fontSize: '1rem', resize: 'vertical' }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={sending}
                        style={{ padding: '1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}
                    >
                        {sending ? 'Transmitting...' : <><Send size={18} /> Transmit Broadcast</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BroadcastEngine;
