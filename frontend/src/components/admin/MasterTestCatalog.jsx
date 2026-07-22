import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { AuthContext } from '../../context/AuthContext';
import { FlaskConical, Plus, Edit2, Trash2, Clock, CheckCircle2 } from 'lucide-react';

const MasterTestCatalog = () => {
    const { user } = useContext(AuthContext);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTests = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/admin/master-tests`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setTests(res.data);
        } catch (err) {
            console.error("Failed to fetch master tests", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, []);

    return (
        <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '800' }}>
                    <FlaskConical size={24} color="#0369a1" /> Master Test Catalog
                </h3>
                <button style={{ padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> Add New Test
                </button>
            </div>

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Catalog...</div>
            ) : tests.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No tests found in the master catalog. Click "Add New Test" to begin.</div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                                {['Test Name', 'Category', 'Base Price', 'Sample Type', 'TAT', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '1rem', textAlign: 'left', fontWeight: '800', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tests.map(test => (
                                <tr key={test._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: '800', color: 'var(--text-main)' }}>{test.testName}</td>
                                    <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-muted)' }}>{test.category}</td>
                                    <td style={{ padding: '1rem', fontWeight: '800', color: '#166534' }}>₹{test.basePrice}</td>
                                    <td style={{ padding: '1rem', fontWeight: '600' }}>{test.sampleType}</td>
                                    <td style={{ padding: '1rem', fontWeight: '600' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {test.turnaroundTimeHours}h</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ padding: '0.3rem 0.8rem', borderRadius: '100px', background: test.isActive ? '#dcfce7' : '#fee2e2', color: test.isActive ? '#166534' : '#991b1b', fontWeight: '800', fontSize: '0.8rem' }}>
                                            {test.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button style={{ padding: '0.4rem', background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><Edit2 size={16} /></button>
                                            <button style={{ padding: '0.4rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MasterTestCatalog;
