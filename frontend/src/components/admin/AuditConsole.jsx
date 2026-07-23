import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { AuthContext } from '../../context/AuthContext';
import { ShieldCheck, Search, Filter, Clock } from 'lucide-react';

const AuditConsole = () => {
    const { user } = useContext(AuthContext);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/admin/audit-logs`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setLogs(res.data);
            } catch (err) {
                console.error("Failed to fetch audit logs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [user]);

    return (
        <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '800' }}>
                        <ShieldCheck size={26} color="#0f172a" /> System Audit & Security Trail
                    </h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Cryptographically immutable log of all administrative actions taken on the platform.</p>
                </div>
            </div>

            <div className="mobile-stack" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input type="text" placeholder="Search logs..." style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', fontWeight: '600' }} />
                </div>
                <button style={{ padding: '0.85rem 1.5rem', background: '#f1f5f9', color: '#334155', border: '1px solid var(--border)', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Filter size={16} /> Filter Logs
                </button>
            </div>

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Audit Logs...</div>
            ) : logs.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No audit logs recorded yet.</div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                                {['Timestamp', 'Admin / System', 'Action Taken', 'Details', 'IP Address'].map(h => (
                                    <th key={h} style={{ padding: '1rem', textAlign: 'left', fontWeight: '800', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Clock size={14} /> {new Date(log.createdAt).toLocaleString('en-IN')}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: '800', color: 'var(--text-main)' }}>{log.adminName}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ padding: '0.3rem 0.6rem', background: '#e0f2fe', color: '#0369a1', borderRadius: '6px', fontWeight: '800', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>{log.details}</td>
                                    <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{log.ipAddress || '127.0.0.1'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AuditConsole;
