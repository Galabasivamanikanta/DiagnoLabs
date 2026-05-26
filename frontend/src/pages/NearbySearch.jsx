import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import {
    MapPin,
    Search,
    Navigation,
    Activity,
    TrendingUp,
    Clock,
    ChevronLeft,
    ShieldCheck,
    LocateFixed,
    Sparkles
} from 'lucide-react';
import NetworkMap from '../components/NetworkMap';


const NearbySearch = () => {
    const [testQuery, setTestQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");
    const [userLocation, setUserLocation] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [visibleCount, setVisibleCount] = useState(10);
    const [sortBy, setSortBy] = useState('nearest');
    const [openOnly, setOpenOnly] = useState(false);
    const [homeSample, setHomeSample] = useState(false);
    const navigate = useNavigate();

    const handleSearch = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setStatusMsg("Detecting your high-precision location...");
        setLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setUserLocation({ lat, lng });

                setStatusMsg("Current Location Found! Searching Accredited Labs...");

                try {
                    const res = await axios.get(
                        `${API_BASE_URL}/api/labs/search-live?lat=${lat}&lng=${lng}&radius=50000`
                    );
                    
                    // FRONTEND FAIL-SAFE: Re-evaluating tiers locally for consistent counting
                    const tieredLabs = (res.data || []).map(lab => {
                        if (!lab.category) {
                            const r = lab.rating || 4.2;
                            const isHospital = lab.labType === 'hospital' || lab.labType === 'chain';
                            
                            // PREMIUM: NABL Verified OR High Rating OR Hospital Grade
                            if (lab.isVerified || r >= 4.4 || isHospital) lab.category = "Premium";
                            else if (r >= 3.8) lab.category = "Scalable";
                            else lab.category = "Low Category";
                        }
                        return lab;
                    });

                    setResults(tieredLabs); 
                    setVisibleCount(10);
                    setActiveFilter('All');
                    setLoading(false);
                    setStatusMsg("");
                } catch (err) {
                    console.error(err);
                    setStatusMsg("Service temporarily unavailable. Please verify your connection.");
                    setLoading(false);
                }
            },
            (error) => {
                console.error(error);
                setStatusMsg("Access denied. Please enable location permissions in your browser.");
                setLoading(false);
            }
        );
    };

    return (
        <div style={{ background: 'var(--background)', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '5rem' }}>
            <div className="container animate-fade-in">
                <div style={{ marginBottom: '3rem' }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
                        <ChevronLeft size={20} /> Return to Home
                    </button>
                </div>

                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', marginBottom: '4rem', background: 'white' }}>
                    <div style={{ width: '80px', height: '80px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                        <LocateFixed size={40} />
                    </div>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: '1.2' }}>Discover Labs <span className="text-gradient">Near You</span></h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '650px', margin: '0 auto 3rem', fontSize: '1.2rem', lineHeight: '1.6' }}>
                        Utilize our DAA network to identify <b>Premium</b> high-precision diagnostic centers within an 8km radius of your current medical environment.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                        <div style={{ 
                            background: 'white', 
                            padding: '0.75rem 1.5rem', 
                            borderRadius: '100px', 
                            border: '1px solid var(--border)', 
                            boxShadow: 'var(--shadow-sm)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <div style={{ width: '28px', height: '28px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Sparkles size={16} />
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)' }}>Unsure what you need?</span>
                            <button 
                                onClick={() => document.querySelector('button[style*="fixed"]').click()} 
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '900', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                            >
                                Ask AI Recommender
                            </button>
                        </div>
                    </div>
                    <div style={{
                        maxWidth: '800px',
                        margin: '0 auto',
                        display: 'flex',
                        gap: '0.75rem',
                        background: '#f8fafc',
                        padding: '0.75rem',
                        borderRadius: '24px',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '0 1rem' }}>
                            <Search size={20} style={{ marginRight: '0.75rem', color: 'var(--text-light)' }} />
                            <input
                                type="text"
                                placeholder="Enter specific diagnostics (e.g. Thyroid Panel, Lipid Portfolio)"
                                value={testQuery}
                                onChange={(e) => setTestQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                style={{ border: 'none', background: 'transparent', flex: 1, fontSize: '1.1rem', fontWeight: '500', outline: 'none' }}
                            />
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={handleSearch}
                            disabled={loading}
                            style={{ padding: '1rem 3rem', borderRadius: '16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                        >
                            {loading ? 'Processing...' : (<span><Navigation size={18} /> Locate & Search</span>)}
                        </button>
                    </div>

                    {statusMsg && (
                        <p style={{ marginTop: '2rem', fontSize: '1rem', color: 'var(--primary)', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <TrendingUp size={18} /> {statusMsg}
                        </p>
                    )}

                    {/* Category Filter Buttons */}
                    {results.length > 0 && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem', flexWrap: 'wrap' }}>
                                 {['All', 'Premium', 'Scalable', 'Low Category'].map(filter => {
                                    const count = filter === 'All' ? results.length : results.filter(l => (l.category || '').toLowerCase() === filter.toLowerCase()).length;
                                    
                                    return (
                                        <button
                                            key={filter}
                                            onClick={() => { setActiveFilter(filter); setVisibleCount(10); }}
                                            style={{
                                                padding: '0.6rem 1.5rem',
                                                borderRadius: '100px',
                                                border: activeFilter === filter ? 'none' : '1px solid var(--border)',
                                                background: activeFilter === filter ? 'var(--primary)' : 'white',
                                                color: activeFilter === filter ? 'white' : 'var(--text-muted)',
                                                fontWeight: '800',
                                                fontSize: '0.9rem',
                                                cursor: 'pointer',
                                                boxShadow: activeFilter === filter ? '0 4px 10px hsla(var(--primary-hsl), 0.3)' : 'none',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            {filter === 'Premium' ? 'Premium' : filter === 'Low Category' ? 'Low Category' : filter}
                                            <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>({count})</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* LIVE NETWORK VISUALIZATION - FREE MAPPING BRIDGE */}
                {results.length > 0 && (
                    <div className="animate-fade-in" style={{ marginBottom: '4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse-green 2s infinite' }}></div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Interactive Network Intelligence</h2>
                        </div>
                        <NetworkMap 
                            labs={results} 
                            userLocation={userLocation} 
                            height="500px" 
                        />
                    </div>
                )}



                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
                    {(
                        (() => {
                            const processedResults = results.map(lab => {
                                if (!lab.category) {
                                    const r = lab.rating || 4.2;
                                    const isHospital = lab.labType === 'hospital' || lab.labType === 'chain';
                                    
                                    // PREMIUM: Verify by Certification, Type, or Rating
                                    if (lab.isVerified || r >= 4.4 || isHospital) lab.category = "Premium";
                                    else if (r >= 3.8) lab.category = "Scalable";
                                    else lab.category = "Low Category";
                                }
                                return lab;
                            });

                            const filteredResults = activeFilter === 'All' 
                                ? processedResults 
                                : processedResults.filter(lab => (lab.category || '').toLowerCase() === activeFilter.toLowerCase());

                            return filteredResults.slice(0, 40); // Increased visibility pool
                        })()
                    ).map((lab, index) => (
                        <div key={lab._id || lab.googlePlaceId} className="glass-card premium-card animate-fade-in" style={{
                            padding: '2rem',
                            borderRadius: '28px',
                            display: 'flex',
                            flexDirection: 'column',
                            animationDelay: `${index * 0.1}s`,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            position: 'relative',
                            overflow: 'hidden',
                            height: '100%',
                            border: '1px solid rgba(226, 232, 240, 0.8)'
                        }}>
                            {/* High-Accuracy Label Overlay */}
                            <div style={{
                                position: 'absolute',
                                top: '15px', right: '-35px',
                                background: lab.accuracyScore >= 90 ? 'linear-gradient(90deg, #16a34a, #22c55e)' : (lab.accuracyScore >= 75 ? '#ca8a04' : '#ea580c'),
                                color: 'white',
                                padding: '6px 45px',
                                transform: 'rotate(45deg)',
                                fontSize: '0.7rem',
                                fontWeight: '900',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                zIndex: 10
                            }}>
                                {lab.accuracyScore}% ACCURATE
                            </div>

                            {/* Trust & Status Row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    {lab.category && (
                                        <div style={{ 
                                            padding: '0.4rem 0.8rem', 
                                            background: lab.category === 'Premium' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : (lab.category === 'Scalable' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#94a3b8'), 
                                            color: 'white',
                                            borderRadius: '100px', 
                                            fontSize: '0.65rem', 
                                            fontWeight: '900', 
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}>
                                            {lab.category}
                                        </div>
                                    )}
                                    <div style={{ 
                                        padding: '0.4rem 0.8rem', 
                                        background: lab.isVerified ? 'rgba(30, 64, 175, 0.1)' : 'rgba(234, 179, 8, 0.1)', 
                                        border: `1px solid ${lab.isVerified ? 'rgba(30, 64, 175, 0.2)' : 'rgba(234, 179, 8, 0.2)'}`, 
                                        borderRadius: '100px', 
                                        fontSize: '0.65rem', 
                                        fontWeight: '800', 
                                        color: lab.isVerified ? '#1e40af' : '#ca8a04', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.3rem' 
                                    }}>
                                        <ShieldCheck size={14} /> {lab.isVerified ? 'NABL Partner' : 'Community Discovery'}
                                    </div>
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    color: lab.isOpenNow ? '#16a34a' : '#ef4444', 
                                    fontSize: '0.75rem', 
                                    fontWeight: '900', 
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {lab.isOpenNow && <span className="status-dot"></span>}
                                    {lab.isOpenNow ? 'Open Now' : 'Closed'}
                                </div>
                            </div>

                            {/* Brand Identifier */}
                            <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem' }}>
                                <div style={{ 
                                    width: '56px', height: '56px', 
                                    background: 'var(--primary-light)', 
                                    color: 'var(--primary)', 
                                    borderRadius: '18px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    flexShrink: 0,
                                    border: '1px solid hsla(var(--primary-hsl), 0.1)'
                                }}>
                                    <Activity size={28} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 
                                        onClick={() => navigate(`/lab/${lab._id || lab.googlePlaceId}`)}
                                        style={{ 
                                            margin: '0 0 0.25rem', 
                                            fontSize: '1.35rem', 
                                            fontWeight: '900', 
                                            color: '#0f172a', 
                                            letterSpacing: '-0.3px',
                                            lineHeight: '1.2',
                                            paddingRight: '1rem',
                                            cursor: 'pointer',
                                            transition: 'color 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                                        onMouseOut={(e) => e.currentTarget.style.color = '#0f172a'}
                                    >
                                        {lab.name}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ color: '#f59e0b', display: 'flex', gap: '1px' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} style={{ fontSize: '0.8rem' }}>{i < Math.floor(lab.rating || 4) ? '★' : '☆'}</span>
                                            ))}
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                                            {lab.rating || '4.8'} ({lab.totalReviews || '0'} views)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Clinical Metadata */}
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ 
                                    fontSize: '0.95rem', 
                                    color: '#475569', 
                                    display: 'flex', 
                                    alignItems: 'flex-start', 
                                    gap: '0.6rem', 
                                    marginBottom: '1.25rem',
                                    lineHeight: '1.4',
                                    minHeight: '2.8rem'
                                }}>
                                    <MapPin size={18} className="text-primary" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <span>{lab.address || lab.city}</span>
                                </div>

                                {lab.drivingDistance && (
                                    <div style={{ 
                                        background: '#f8fafc', 
                                        borderRadius: '20px', 
                                        padding: '1.2rem', 
                                        display: 'grid', 
                                        gridTemplateColumns: '1fr 1fr', 
                                        gap: '1rem',
                                        border: '1px solid #eef2f6'
                                    }}>
                                        <div style={{ borderRight: '1.5px solid #e2e8f0' }}>
                                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.5px' }}>Road Mileage</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Navigation size={16} className="text-secondary" /> {(lab.drivingDistance / 1000).toFixed(1)} km
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.5px' }}>Travel Time</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Clock size={16} /> {lab.estimatedTime} mins
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Decision Actions */}
                            <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => navigate('/checkout', { state: { test: { lab: lab, testName: testQuery || "General Consultation", price: 499 } } })}
                                    className="btn btn-primary"
                                    style={{ 
                                        flex: 2, 
                                        padding: '1.1rem', 
                                        borderRadius: '16px', 
                                        fontSize: '1rem', 
                                        fontWeight: '900',
                                        boxShadow: '0 10px 25px -5px hsla(var(--primary-hsl), 0.3)'
                                    }}
                                >
                                    Book Now
                                </button>
                                {lab.location?.coordinates && (
                                    <a 
                                        href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation ? `${userLocation.lat},${userLocation.lng}` : ''}&destination=${lab.location.coordinates[1]},${lab.location.coordinates[0]}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn"
                                        style={{ 
                                            flex: 1,
                                            background: '#f1f5f9', 
                                            color: 'var(--primary)', 
                                            padding: '1.1rem', 
                                            borderRadius: '16px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            gap: '0.6rem',
                                            border: '1px solid #e2e8f0',
                                            textDecoration: 'none',
                                            fontWeight: '800',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        <Navigation size={20} /> Direct
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* View More Logic */}
                {(() => {
                    const filteredResultsCnt = activeFilter === 'All' ? results.length : results.filter(lab => lab.category?.includes(activeFilter)).length;
                    if (visibleCount < filteredResultsCnt) {
                        return (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
                                <button 
                                    onClick={() => setVisibleCount(prev => prev + 10)}
                                    className="btn"
                                    style={{ 
                                        padding: '1rem 4rem', 
                                        background: '#f8fafc', 
                                        color: 'var(--primary)', 
                                        border: '2px solid #e2e8f0', 
                                        borderRadius: '100px', 
                                        fontWeight: '800', 
                                        fontSize: '1rem',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    View More Results
                                </button>
                            </div>
                        );
                    }
                    return null;
                })()}

                {results.length === 0 && !loading && statusMsg === "" && testQuery !== "" && (
                    <div style={{ textAlign: 'center', padding: '8rem 0' }}>
                        <div style={{ width: '100px', height: '100px', background: 'var(--border)', color: 'var(--text-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem' }}>
                            <Navigation size={48} />
                        </div>
                        <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Zero results in your vicinity</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>We couldn't localise this specific diagnostic portfolio nearby. Try expanding your search criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NearbySearch;

// Premium Styles
const styles = `
@keyframes pulse-green {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}
.status-dot {
    width: 8px; height: 8px; background: #22c55e; border-radius: 50%;
    display: inline-block; margin-right: 8px;
    animation: pulse-green 2s infinite;
}
.premium-card {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
.premium-card:hover {
    transform: translateY(-10px) !important;
    box-shadow: 0 40px 80px -15px rgba(0, 0, 0, 0.12) !important;
    border-color: hsla(var(--primary-hsl), 0.4) !important;
}
`;

if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}
