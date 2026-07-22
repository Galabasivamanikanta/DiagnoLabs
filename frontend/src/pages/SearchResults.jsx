import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import {
    ChevronLeft,
    Search,
    Navigation,
    Activity,
    MapPin,
    ArrowRight,
    TrendingUp,
    Clock,
    Droplets,
    Thermometer,
    Zap,
    Pill,
    HeartPulse,
    Microscope,
    FlaskConical,
    Skull,
    Stethoscope,
    ShieldCheck
} from 'lucide-react';
import NetworkMap from '../components/NetworkMap';


const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const pincode = searchParams.get('pincode');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const labId = searchParams.get('lab');
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const navigate = useNavigate();

    // Smart Icon Mapping for Accurate Disease Representation
    const getTestIcon = (testName, category) => {
        const name = (testName || '').toLowerCase();
        const cat = (category || '').toLowerCase();

        if (name.includes('cbc') || name.includes('blood') || cat.includes('blood')) return <Droplets size={28} />;
        if (name.includes('diabetes') || name.includes('sugar') || name.includes('glucose')) return <Thermometer size={28} />;
        if (name.includes('thyroid') || name.includes('hormone')) return <Zap size={28} />;
        if (name.includes('vitamin') || name.includes('d3') || name.includes('b12')) return <Pill size={28} />;
        if (name.includes('heart') || name.includes('cardiac') || name.includes('ecg') || name.includes('lipid')) return <HeartPulse size={28} />;
        if (name.includes('cancer') || name.includes('tumor') || name.includes('biopsy')) return <Microscope size={28} />;
        if (name.includes('kidney') || name.includes('kft') || name.includes('renal')) return <FlaskConical size={28} />;
        if (name.includes('liver') || name.includes('lft') || name.includes('hepatic')) return <ShieldCheck size={28} />;
        if (name.includes('full body') || name.includes('health') || name.includes('package')) return <Stethoscope size={28} />;

        return <Activity size={28} />; // Default medical activity icon
    };

    // Color mapping for more visual accuracy
    const getIconColor = (testName) => {
        const name = (testName || '').toLowerCase();
        if (name.includes('diabetes')) return { bg: '#fef2f2', icon: '#dc2626' }; // Red for sugar
        if (name.includes('cbc') || name.includes('blood')) return { bg: '#fff1f2', icon: '#e11d48' }; // Rose for blood
        if (name.includes('heart')) return { bg: '#fff1f2', icon: '#be123c' }; // Deep red for heart
        if (name.includes('kidney') || name.includes('liver')) return { bg: '#f0fdf4', icon: '#166534' }; // Green for filtering organs
        if (name.includes('thyroid') || name.includes('hormone')) return { bg: '#fefce8', icon: '#a16207' }; // Yellow for hormones
        if (name.includes('vitamin')) return { bg: '#eff6ff', icon: '#1d4ed8' }; // Blue for vitamins
        return { bg: 'hsla(var(--primary-hsl), 0.05)', icon: 'var(--primary)' }; // Default Teal
    };

    useEffect(() => {
        const fetchTests = async () => {
            try {
                setLoading(true);
                let url = `${API_BASE_URL}/api/tests/search?q=${query || ''}`;
                if (pincode) url += `&pincode=${pincode}`;
                if (lat && lng) url += `&lat=${lat}&lng=${lng}`;
                if (labId) url += `&lab=${labId}`;
                const res = await axios.get(url);
                
                // FRONTEND FAIL-SAFE: Re-evaluating tiers locally for consistent counting
                const tieredSelectedTests = (res.data || []).map(test => {
                    if (test.lab) {
                        const r = test.lab.rating || 3.5;
                        if (r >= 4.5) test.lab.category = "Premium";
                        else if (r >= 4.2) test.lab.category = "Scalable";
                        else test.lab.category = "Standard";
                    }
                    return test;
                });

                setTests(tieredSelectedTests);
            } catch (err) {
                console.error("Search Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTests();
    }, [query, labId, pincode, lat, lng]);

    // Apply filtering logic for both the Map and the List
    const filteredTests = activeFilter === 'All' 
        ? tests 
        : tests.filter(t => {
            const r = t.lab?.rating || 3.5;
            let cat = "";
            if (r >= 4.5) cat = "Premium";
            else if (r >= 4.2) cat = "Scalable";
            else cat = "Standard";
            
            return cat.toLowerCase() === activeFilter.toLowerCase();
        });

    return (
        <div style={{ background: 'var(--background)', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '5rem' }}>
            <div className="container">
                <div style={{ marginBottom: '4rem' }}>
                    <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: '800', fontSize: '0.9rem', marginBottom: '2rem', transition: '0.2s' }}>
                        <ChevronLeft size={20} /> Back to Health Center
                    </Link>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ fontSize: '3.2rem', marginBottom: '0.75rem', lineHeight: '1.2' }}>
                                {query ? (<span>Test Portfolios for <span className="text-gradient">"{query}"</span></span>) : "Diagnostic Portfolios"}
                            </h1>
                            <p style={{ color: 'var(--text-light)', fontWeight: '700', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <TrendingUp size={18} /> Found {tests.length} accurate result matching your profile
                            </p>
                        </div>

                        {!loading && tests.length > 0 && (
                            <div className="glass-card" style={{ padding: '1.2rem 1.8rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid hsla(var(--primary-hsl), 0.1)', background: 'white' }}>
                                <div style={{ width: '48px', height: '48px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Navigation size={22} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>DAA AI Optimizer</div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)' }}>Prioritizing nearest labs</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* NEW: Category Tier Filters for consistent discovery experience */}
                    {!loading && tests.length > 0 && (
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem', flexWrap: 'wrap' }}>
                             {['All', 'Premium', 'Scalable', 'Standard'].map(filter => {
                                const count = filter === 'All' ? tests.length : tests.filter(test => (test.lab?.category || '').toLowerCase() === filter.toLowerCase()).length;
                                
                                return (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`btn ${activeFilter === filter ? (filter === 'Premium' ? 'btn-gold' : filter === 'Scalable' ? 'btn-silver' : filter === 'Standard' ? 'btn-bronze' : 'btn-primary') : 'btn-outline'}`}
                                        style={{
                                            padding: '0.6rem 1.5rem',
                                            borderRadius: '100px',
                                            border: activeFilter === filter ? 'none' : '1px solid var(--border)',
                                            fontWeight: '800',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {filter === 'Premium' ? '✨ Premium' : filter}
                                        <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>({count})</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* NEW: DAA NETWORK VISUALIZATION - FREE MAPPING BRIDGE */}
                {!loading && tests.length > 0 && (
                    <div className="animate-fade-in" style={{ marginBottom: '4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse-green 2s infinite' }}></div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Clinical Service Visualisation</h2>
                        </div>
                        <NetworkMap 
                            labs={Array.from(new Map(filteredTests.map(test => [test.lab?._id || test.lab?.googlePlaceId, test.lab])).values()).filter(Boolean)} 
                            userLocation={lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null} 
                            height="450px" 
                        />
                    </div>
                )}

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem 0' }}>
                        <div style={{ width: '60px', height: '60px', border: '5px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    </div>

                ) : (
                    <div style={{ display: 'grid', gap: '2rem' }}>
                        {tests.length === 0 ? (
                            <div className="glass-card" style={{ padding: '6rem 4rem', textAlign: 'center', background: 'white' }}>
                                <div style={{ width: '80px', height: '80px', background: 'var(--border)', color: 'var(--text-light)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                                    <Search size={40} />
                                </div>
                                <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>Zero Matches Found</h2>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '500px', margin: '0 auto 3rem', fontSize: '1.1rem' }}>Our AI couldn't find a diagnostic match for this specific portfolio. Try broadening your keywords or removing filters.</p>
                                <button onClick={() => { setActiveFilter('All'); navigate('/'); }} className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '16px' }}>Reset Search</button>
                            </div>
                        ) : (
                            filteredTests.map((test, index) => {
                                const theme = getIconColor(test.testName);
                                return (
                                    <div key={test._id} className="glass-card premium-card animate-fade-in mobile-stack" style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '2rem 2.5rem',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        animationDelay: `${index * 0.1}s`,
                                        background: test.lab?.category === 'Premium' ? 'linear-gradient(145deg, #ffffff, #fffbeb)' : (test.lab?.category === 'Scalable' ? 'linear-gradient(145deg, #ffffff, #f8fafc)' : 'linear-gradient(145deg, #ffffff, #fff7ed)'),
                                        border: test.lab?.category === 'Premium' ? '1px solid rgba(245, 158, 11, 0.4)' : (test.lab?.category === 'Scalable' ? '1px solid rgba(148, 163, 184, 0.4)' : '1px solid rgba(194, 65, 12, 0.3)'),
                                        borderRadius: '32px',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Accuracy Ribbon */}
                                        {test.lab?.accuracyScore && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '12px', right: '-35px',
                                                background: test.lab.accuracyScore >= 90 ? 'linear-gradient(90deg, #16a34a, #22c55e)' : '#ea580c',
                                                color: 'white',
                                                padding: '5px 40px',
                                                transform: 'rotate(45deg)',
                                                fontSize: '0.65rem',
                                                fontWeight: '900',
                                                zIndex: 5
                                            }}>
                                                {test.lab.accuracyScore}% ACCURATE
                                            </div>
                                        )}

                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                                <div style={{
                                                    width: '64px',
                                                    height: '64px',
                                                    background: theme.bg,
                                                    color: theme.icon,
                                                    borderRadius: '20px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: '1px solid hsla(var(--primary-hsl), 0.1)'
                                                }}>
                                                    {getTestIcon(test.testName, test.category)}
                                                </div>
                                                <div>
                                                    <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a', fontWeight: '900', letterSpacing: '-0.5px' }}>{test.testName}</h3>
                                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                            <span style={{ padding: '0.2rem 0.8rem', background: test.lab.isVerified ? 'rgba(30, 64, 175, 0.1)' : 'rgba(234, 179, 8, 0.1)', color: test.lab.isVerified ? '#1e40af' : '#ca8a04', borderRadius: '100px', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                                {test.lab.isVerified ? 'Premium NABL' : 'Community Discovery'}
                                                            </span>
                                                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                                <MapPin size={12} /> {test.lab.city}
                                                            </span>
                                                        </div>
                                                        <span style={{ padding: '0.3rem 0.8rem', background: 'hsla(var(--primary-hsl), 0.08)', color: 'var(--primary)', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase' }}>
                                                            {test.category || 'Standard Diagnostics'}
                                                        </span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: '800' }}>
                                                            <Clock size={16} /> Results in {test.turnaroundTime || '24 hrs'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', marginLeft: '5.4rem', flexWrap: 'wrap' }}>
                                                <div 
                                                    onClick={() => navigate(`/lab/${test.lab._id}`)}
                                                    style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '0.6rem',
                                                        cursor: 'pointer',
                                                        transition: 'color 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                                                    onMouseOut={(e) => e.currentTarget.style.color = '#475569'}
                                                >
                                                    <MapPin size={16} className="text-primary" />
                                                    <strong style={{ fontSize: '1.05rem' }}>{test.lab?.name}</strong>
                                                </div>

                                                {test.lab?.drivingDistance ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: '#f8fafc', padding: '0.5rem 1.25rem', borderRadius: '100px', border: '1px solid #eef2f6' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: '900', color: '#0f172a' }}>
                                                            <Navigation size={16} className="text-secondary" /> {(test.lab.drivingDistance / 1000).toFixed(1)} km
                                                        </div>
                                                        <div style={{ width: '1px', height: '14px', background: '#cbd5e1' }}></div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: '900', color: 'var(--primary)' }}>
                                                            <Clock size={16} /> {test.lab.estimatedTime} mins drive
                                                        </div>
                                                    </div>
                                                ) : (
                                                    test.lab?.distance && (
                                                        <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '800', fontSize: '0.95rem' }}>
                                                            <Navigation size={18} /> {isNaN(test.lab.distance) ? test.lab.distance : `${test.lab.distance} km away`}
                                                        </span>
                                                    )
                                                )}

                                                {test.lab?.location?.coordinates && (
                                                    <a 
                                                        href={`https://www.google.com/maps/dir/?api=1&origin=${lat && lng ? `${lat},${lng}` : ''}&destination=${test.lab.location.coordinates[1]},${test.lab.location.coordinates[0]}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: '0.4rem', 
                                                            fontSize: '0.85rem', 
                                                            fontWeight: '900', 
                                                            color: 'var(--primary)', 
                                                            textDecoration: 'none',
                                                            background: 'hsla(var(--primary-hsl), 0.05)',
                                                            padding: '0.5rem 1.2rem',
                                                            borderRadius: '100px',
                                                            transition: '0.3s',
                                                            border: '1px solid hsla(var(--primary-hsl), 0.1)'
                                                        }}
                                                        onMouseOver={(e) => e.currentTarget.style.background = 'hsla(var(--primary-hsl), 0.1)'}
                                                        onMouseOut={(e) => e.currentTarget.style.background = 'hsla(var(--primary-hsl), 0.05)'}
                                                    >
                                                        <Navigation size={14} /> Get Directions
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '4rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                                                    <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)' }}>₹</span>
                                                    <span style={{ fontSize: '2.8rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-1.5px' }}>{test.price}</span>
                                                </div>
                                                {test.discountedPrice && (
                                                    <div style={{ fontSize: '1.1rem', textDecoration: 'line-through', color: 'var(--text-light)', fontWeight: '800', marginTop: '-0.75rem' }}>
                                                        ₹{test.discountedPrice}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => navigate('/checkout', { state: { test } })}
                                                style={{ padding: '1.3rem 3.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.15rem' }}
                                            >
                                                Book Appointment <ArrowRight size={22} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .premium-card {
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                .premium-card:hover {
                    transform: translateY(-8px) scale(1.01) !important;
                    box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.1) !important;
                    border-color: hsla(var(--primary-hsl), 0.3) !important;
                }
                @media (max-width: 950px) {
                    .premium-card {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        padding: 1.5rem !important;
                    }
                    .premium-card > div:first-child {
                        width: 100% !important;
                    }
                    div[style*="marginLeft: '5.4rem'"] {
                        margin-left: 0 !important;
                        margin-top: 1.5rem !important;
                        gap: 1rem !important;
                    }
                    div[style*="textAlign: 'right'"] {
                        width: 100% !important;
                        flex-direction: row !important;
                        justify-content: space-between !important;
                        margin-top: 2rem !important;
                        border-top: 1px solid var(--border-light);
                        padding-top: 1.5rem !important;
                        text-align: left !important;
                        align-items: center !important;
                    }
                    h1 {
                        font-size: 2.2rem !important;
                    }
                }
                @media (max-width: 600px) {
                    div[style*="textAlign: 'right'"] {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 1.5rem !important;
                    }
                    div[style*="textAlign: 'right'"] button {
                        width: 100% !important;
                    }
                    div[style*="fontSize: '2.8rem'"] {
                        font-size: 2.2rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default SearchResults;
