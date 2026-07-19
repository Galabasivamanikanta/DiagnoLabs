import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Activity,
    ShieldCheck,
    Navigation,
    ChevronLeft,
    Star,
    FlaskConical,
    Search,
    TrendingUp,
    ArrowRight
} from 'lucide-react';

const LabDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lab, setLab] = useState(null);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [testQuery, setTestQuery] = useState('');

    useEffect(() => {
        const fetchLabData = async () => {
            try {
                setLoading(true);
                const [labRes, testsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/labs/${id}`),
                    axios.get(`${API_BASE_URL}/api/tests/search?lab=${id}`)
                ]);
                setLab(labRes.data);
                setTests(testsRes.data);
            } catch (err) {
                console.error("Error fetching lab details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLabData();
    }, [id]);

    const filteredTests = tests.filter(test => 
        test.testName.toLowerCase().includes(testQuery.toLowerCase()) ||
        (test.category || '').toLowerCase().includes(testQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <div style={{ width: '60px', height: '60px', border: '5px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
        );
    }

    if (!lab) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Clinical Facility Not Found</h2>
                    <button onClick={() => navigate('/labs')} className="btn btn-primary" style={{ padding: '1rem 2rem', borderRadius: '12px' }}>Back to Lab Network</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
            <div className="container">
                {/* Navigation & Header */}
                <div 
                    onClick={() => navigate(-1)} 
                    style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        color: '#64748b', 
                        cursor: 'pointer', 
                        fontWeight: '800', 
                        marginBottom: '2.5rem', 
                        fontSize: '0.9rem',
                        transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                >
                    <ChevronLeft size={18} /> BACK TO PREVIOUS VIEW
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem', alignItems: 'start' }}>
                    {/* Left Column: Profile & Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="glass-card" style={{ padding: '3.5rem', background: 'white', borderRadius: '40px', border: '1px solid #e2e8f0', boxShadow: '0 20px 50px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
                            {/* Verified Badge */}
                            <div style={{ position: 'absolute', top: '30px', right: '30px', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: '#f0fdf4', color: '#16a34a', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '900', border: '1px solid #dcfce7' }}>
                                <ShieldCheck size={16} /> DAA CERTIFIED FACILITY
                            </div>

                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2.5rem' }}>
                                <div style={{ width: '80px', height: '80px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Activity size={40} />
                                </div>
                                <div>
                                    <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-1px', lineHeight: '1.1' }}>{lab.name}</h1>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            {[...Array(5)].map((_, i) => <Star key={i} size={18} fill={i < Math.floor(lab.rating || 4.5) ? "#f59e0b" : "none"} stroke={i < Math.floor(lab.rating || 4.5) ? "#f59e0b" : "#cbd5e1"} />)}
                                        </div>
                                        <span style={{ fontWeight: '800', color: '#475569', fontSize: '1rem' }}>{lab.rating || '4.8'} Clinical Accuracy Score</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                                <div className="info-stat-card">
                                    <div className="stat-label"><Clock size={14} /> LIVE STATUS</div>
                                    <div className="stat-value" style={{ color: '#16a34a', display: 'flex', alignItems: 'center' }}>
                                        <span className="status-dot"></span> OPEN NOW
                                    </div>
                                    <div className="stat-detail">{lab.openingTime} - {lab.closingTime}</div>
                                </div>
                                <div className="info-stat-card">
                                    <div className="stat-label"><MapPin size={14} /> CLINIC LOCATION</div>
                                    <div className="stat-value">{lab.city}</div>
                                    <div className="stat-detail" style={{ lineHeight: '1.4' }}>{lab.address}</div>
                                </div>
                                <div className="info-stat-card">
                                    <div className="stat-label"><Phone size={14} /> CONTACT LINE</div>
                                    <div className="stat-value">{lab.phone}</div>
                                    <div className="stat-detail">{lab.email}</div>
                                </div>
                            </div>
                        </div>

                        {/* Services Grid */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.25rem' }}>Available Diagnostics</h2>
                                    <p style={{ color: '#64748b', fontWeight: '700' }}>Direct booking enabled for all portfolios</p>
                                </div>
                                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                                    <Search size={20} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input 
                                        type="text" 
                                        placeholder="Filter by test name..." 
                                        value={testQuery}
                                        onChange={(e) => setTestQuery(e.target.value)}
                                        style={{ width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.5rem', borderRadius: '18px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {filteredTests.map((test) => (
                                    <div key={test._id} className="glass-card premium-card" style={{ padding: '2rem', background: 'white', borderRadius: '28px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                                            <div style={{ width: '50px', height: '50px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FlaskConical size={24} />
                                            </div>
                                            <div style={{ padding: '0.4rem 0.8rem', background: '#f8fafc', borderRadius: '100px', fontSize: '0.65rem', fontWeight: '900', color: '#64748b', border: '1px solid #e2e8f0' }}>
                                                {test.category || 'Clinical Test'}
                                            </div>
                                        </div>
                                        <h3 style={{ fontSize: '1.35rem', fontWeight: '900', marginBottom: '1.5rem', color: '#0f172a' }}>{test.testName}</h3>
                                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>FEE PORTFOLIO</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a' }}>₹{test.price}</div>
                                            </div>
                                            <button 
                                                onClick={() => navigate('/checkout', { state: { test } })}
                                                className="btn btn-primary" 
                                                style={{ width: '50px', height: '50px', padding: 0, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <ArrowRight size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Directions & Visuals */}
                    <div style={{ position: 'sticky', top: '10rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="glass-card" style={{ padding: '2.5rem', background: '#1e293b', borderRadius: '32px', color: 'white', overflow: 'hidden', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
                                <Navigation size={150} strokeWidth={1} />
                            </div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '1.5rem', position: 'relative' }}>Instant Directions</h2>
                            <p style={{ opacity: 0.8, fontWeight: '500', marginBottom: '2rem', lineHeight: '1.6' }}>Launch precision turn-by-turn navigation directly to the facility gates.</p>
                            
                            <a 
                                href={`https://www.google.com/maps/dir/?api=1&destination=${lab.location?.coordinates[1]},${lab.location?.coordinates[0]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                                style={{ width: '100%', background: 'white', color: '#0f172a', padding: '1.2rem', borderRadius: '20px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', textDecoration: 'none', fontWeight: '900' }}
                            >
                                <Navigation size={22} /> OPEN IN GOOGLE MAPS
                            </a>
                        </div>

                        <div className="glass-card" style={{ padding: '2.5rem', background: 'white', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                                <TrendingUp size={24} />
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '900', margin: 0 }}>Efficiency & Trust</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', marginTop: '6px' }}></div>
                                    <div style={{ flex: 1, fontSize: '0.95rem', fontWeight: '700', color: '#475569' }}>Fully Digitized Lab Reports withing 24 hours.</div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', marginTop: '6px' }}></div>
                                    <div style={{ flex: 1, fontSize: '0.95rem', fontWeight: '700', color: '#475569' }}>NABL Accredited and Highly Trusted for Critical Care.</div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', marginTop: '6px' }}></div>
                                    <div style={{ flex: 1, fontSize: '0.95rem', fontWeight: '700', color: '#475569' }}>Direct Patient Support Line via Centralized Portal.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .info-stat-card {
                    padding: 1.5rem; background: #f8fafc; border-radius: 20px; border: 1px solid #eef2f6;
                }
                .stat-label {
                    font-size: 0.65rem; font-weight: 900; color: #94a3b8; letter-spacing: 1px; display: flex; alignItems: center; gap: 0.4rem; margin-bottom: 0.5rem;
                }
                .stat-value {
                    font-size: 1.1rem; font-weight: 900; color: #0f172a; margin-bottom: 0.25rem;
                }
                .stat-detail {
                    font-size: 0.85rem; font-weight: 600; color: #64748b;
                }
                .status-dot {
                    width: 8px; height: 8px; background: #22c55e; border-radius: 50%; display: inline-block; margin-right: 8px;
                    animation: pulse-green 2s infinite;
                }
                @keyframes pulse-green {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }
                .premium-card { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
                .premium-card:hover { border-color: var(--primary) !important; transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
            `}</style>
        </div>
    );
};

export default LabDetails;
