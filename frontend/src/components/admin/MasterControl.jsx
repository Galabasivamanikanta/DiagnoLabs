import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { AuthContext } from '../../context/AuthContext';
import { Activity, Database, Zap, Globe, AlertTriangle, ShieldAlert } from 'lucide-react';

const MasterControl = () => {
    const { user } = useContext(AuthContext);
    const [telemetry, setTelemetry] = useState(null);
    const [toggles, setToggles] = useState({ maintenance: false, surgePricing: false, emergencyAlerts: false });

    useEffect(() => {
        const fetchTelemetry = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/admin/telemetry`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setTelemetry(res.data);
            } catch (err) {
                console.error("Failed to fetch telemetry:", err);
            }
        };
        fetchTelemetry();
        const interval = setInterval(fetchTelemetry, 10000); // 10s refresh
        return () => clearInterval(interval);
    }, [user]);

    const handleToggle = (key) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
        // In real app, make API call here.
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Telemetry Bar */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '800' }}>
                    <Activity size={24} color="#0369a1" /> Live System Telemetry
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', borderLeft: '4px solid #16a34a' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}><Database size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />DB Latency</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>{telemetry?.dbLatency || 0} <span style={{ fontSize: '1rem', color: '#64748b' }}>ms</span></div>
                    </div>
                    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', borderLeft: '4px solid #0284c7' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}><Globe size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Active WebSockets</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>{telemetry?.activeWebSockets || 0}</div>
                    </div>
                    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', borderLeft: '4px solid #d97706' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}><Zap size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />CPU Usage</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>{telemetry?.cpuUsage || 0} <span style={{ fontSize: '1rem', color: '#64748b' }}>%</span></div>
                    </div>
                </div>
            </div>

            {/* Emergency Toggles */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '800', color: '#991b1b' }}>
                    <ShieldAlert size={24} /> Emergency & Global Controls
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                        { key: 'maintenance', label: 'Global Maintenance Mode', desc: 'Pause all new patient bookings and show maintenance screen.', color: '#dc2626' },
                        { key: 'surgePricing', label: 'Peak Surge Pricing (+20%)', desc: 'Apply a flat 20% surge multiplier to all standard catalog tests.', color: '#d97706' },
                        { key: 'emergencyAlerts', label: 'Emergency Dashboard Banner', desc: 'Display a critical alert banner on the patient and lab partner portals.', color: '#0284c7' }
                    ].map(toggle => (
                        <div key={toggle.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: '#f1f5f9', borderRadius: '12px' }}>
                            <div>
                                <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.05rem', marginBottom: '0.25rem' }}>{toggle.label}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{toggle.desc}</div>
                            </div>
                            <button 
                                onClick={() => handleToggle(toggle.key)}
                                style={{
                                    padding: '0.75rem 2rem',
                                    borderRadius: '100px',
                                    border: 'none',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    background: toggles[toggle.key] ? toggle.color : '#cbd5e1',
                                    color: toggles[toggle.key] ? 'white' : '#64748b',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {toggles[toggle.key] ? 'ACTIVE' : 'DISABLED'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MasterControl;
