import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    MapPin,
    Search,
    Target,
    LocateFixed,
    ShieldCheck,
    Zap,
    Home as HomeIcon,
    Droplets,
    HeartPulse,
    Baby,
    Bone,
    Microscope,
    ChevronRight,
    ArrowRight,
    Stethoscope,
    Thermometer,
    FlaskConical,
    Activity,
    Pill
} from 'lucide-react';

const Home = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [pincode, setPincode] = useState('');
    const [coords, setCoords] = useState(null);
    const [locLoading, setLocLoading] = useState(false);
    const navigate = useNavigate();

    const detectLocation = useCallback(() => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setLocLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setCoords({ lat, lng });
                
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    const data = await res.json();
                    const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
                    if (city) {
                        setPincode(city);
                    }
                } catch (err) {
                    console.error("Reverse geocoding failed", err);
                }
                
                setLocLoading(false);
            },
            (error) => {
                console.error(error);
                setLocLoading(false);
            }
        );
    }, []);

    useEffect(() => {
        detectLocation();
    }, [detectLocation]);

    const handleSearch = () => {
        // Redirect to Labs view if exploring without a specific test
        if (!searchTerm.trim() && (pincode.trim() || coords)) {
            // Priority to text input if they modified the reverse-geocoded string
            if (pincode.trim()) {
                navigate(`/labs?pincode=${encodeURIComponent(pincode)}`);
            } else {
                navigate(`/labs?lat=${coords.lat}&lng=${coords.lng}`);
            }
            return;
        }

        let url = `/search?q=${encodeURIComponent(searchTerm)}`;
        if (pincode.trim()) {
            url += `&pincode=${encodeURIComponent(pincode)}`;
        }
        
        if (coords) {
            url += `&lat=${coords.lat}&lng=${coords.lng}`;
        }
        
        navigate(url);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div style={{ background: 'var(--background)', minHeight: '100vh', paddingBottom: '0' }}>
            {/* Ultra-Premium Hero Section */}
            <section style={{
                padding: 'clamp(7rem, 12vw, 11rem) 0 clamp(3rem, 6vw, 6rem) 0',
                background: 'linear-gradient(to bottom, #f0f7ff 0%, #ffffff 100%)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '600px', height: '600px', background: 'rgba(0, 51, 102, 0.03)', borderRadius: '50%', filter: 'blur(120px)', zIndex: 0 }}></div>
                <div style={{ position: 'absolute', bottom: '0', left: '-10%', width: '500px', height: '500px', background: 'rgba(197, 160, 89, 0.05)', borderRadius: '50%', filter: 'blur(100px)', zIndex: 0 }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="fade-in">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'white', padding: '0.6rem 1.25rem', borderRadius: '100px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', marginBottom: '3rem' }}>
                            <div style={{ width: '24px', height: '24px', background: 'var(--accent-gold)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: '800' }}>AI</div>
                            <span style={{ color: 'var(--text-main)', fontWeight: '800', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Clinical Discovery Gateway Active</span>
                        </div>

                        <h1 style={{ fontSize: '5rem', marginBottom: '1.5rem', lineHeight: '1.1', color: 'var(--primary)', fontWeight: '900', letterSpacing: '-0.04em' }}>
                            Precision Discovery.<br />
                            <span style={{ color: 'var(--accent-gold)' }}>Expert Diagnosis.</span>
                        </h1>

                        <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', marginBottom: '4.5rem', maxWidth: '800px', margin: '0 auto 4.5rem auto', lineHeight: '1.6', fontWeight: '500' }}>
                            DiagnoLabs is the unified gateway to India's most advanced clinical networks. <br />
                            Experience medical excellence with NABL-certified precision.
                        </p>

                        {/* Search Cluster - Tesla Minimalist Style */}
                        <div className="search-cluster-main" style={{
                            maxWidth: '1000px',
                            margin: '0 auto',
                            background: 'white',
                            padding: '0.75rem',
                            borderRadius: '32px',
                            boxShadow: 'var(--shadow-premium)',
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                            border: '1px solid var(--border-light)'
                        }}>
                            <div className="search-location-input" style={{ display: 'flex', alignItems: 'center', flex: '0 0 240px', padding: '0 1.5rem', borderRight: '1px solid var(--border-light)' }}>
                                <MapPin size={22} style={{ color: 'var(--accent-gold)', marginRight: '1rem' }} />
                                <input
                                    type="text"
                                    placeholder="Location"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    style={{ border: 'none', width: '100%', fontSize: '1rem', fontWeight: '600', outline: 'none', color: 'var(--text-main)' }}
                                />
                            </div>

                            <div className="search-test-input" style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '0 1.5rem' }}>
                                <Search size={22} style={{ marginRight: '1rem', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Search clinical tests..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    style={{ border: 'none', width: '100%', fontSize: '1.05rem', fontWeight: '600', outline: 'none', color: 'var(--text-main)' }}
                                />
                            </div>

                            <div className="search-actions-group" style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={detectLocation}
                                    disabled={locLoading}
                                    style={{ 
                                        padding: '0', 
                                        width: '54px', 
                                        height: '54px', 
                                        borderRadius: '50%', 
                                        flexShrink: 0,
                                        background: 'white',
                                        border: coords ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        color: coords ? 'var(--primary)' : 'var(--text-muted)'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                                    title="My Location"
                                >
                                    {locLoading ? (
                                        <Activity size={22} style={{ animation: 'pulse 1s infinite' }} />
                                    ) : (
                                        <LocateFixed size={22} style={{ color: 'inherit' }} />
                                    )}
                                </button>

                                <button
                                    onClick={handleSearch}
                                    className="btn btn-primary search-submit-btn"
                                    style={{ padding: '0.85rem 3rem', borderRadius: '18px', fontSize: '1.05rem', whiteSpace: 'nowrap' }}
                                >
                                    Start Search
                                </button>
                            </div>
                        </div>

                        <style>{`
                            @media (max-width: 900px) {
                                .search-cluster-main {
                                    flex-direction: column;
                                    border-radius: 24px;
                                    padding: 1rem;
                                }
                                .search-location-input, .search-test-input {
                                    width: 100%;
                                    border-right: none !important;
                                    border-bottom: 1px solid var(--border-light);
                                    padding: 1rem 0.5rem !important;
                                    flex: none !important;
                                }
                                .search-actions-group {
                                    width: 100%;
                                    margin-top: 0.5rem;
                                }
                                .search-submit-btn {
                                    flex: 1;
                                }
                            }
                        `}</style>
                    </div>
                </div>
            </section>

            {/* Care Categories Section */}
            <section style={{ padding: '10rem 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                        <span className="label-mini">Advanced Diagnostics</span>
                        <h2 style={{ fontSize: '3.5rem', marginTop: '1rem', fontWeight: '900', color: 'var(--primary)' }}>Specialized Clinical Units</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '650px', margin: '0 auto', fontWeight: '500' }}>
                            Access disease-specific testing portfolios designed by master clinicians.
                        </p>
                    </div>

                    <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '2.5rem' }}>
                        {[
                            { title: 'Executive Wellness', query: 'Full Body', icon: <Stethoscope size={32} />, desc: 'Comprehensive physiological screening for all age groups.' },
                            { title: 'Metabolic Health', query: 'Diabetes', icon: <Zap size={32} />, desc: 'Glucose monitoring and clinical endocrinology insights.' },
                            { title: 'Cardiology Center', query: 'Cardiac', icon: <HeartPulse size={32} />, desc: 'Advanced heart rhythm analytics and lipid profiling.' },
                            { title: 'Hormonal Precision', query: 'Thyroid', icon: <FlaskConical size={32} />, desc: 'Thyroid panel and specialized endocrine discovery.' },
                            { title: 'Renal Analytics', query: 'Kidney', icon: <Target size={32} />, desc: 'Glomerular filtration and kidney health monitoring.' },
                            { title: 'Hematology Unit', query: 'Blood', icon: <Droplets size={32} />, desc: 'Cell count analysis and hematological health scans.' }
                        ].map(cat => (
                            <div key={cat.title}
                                onClick={() => navigate(`/search?q=${encodeURIComponent(cat.query)}`)}
                                className="premium-card"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1.5rem',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    background: 'var(--primary-light)',
                                    color: 'var(--primary)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {cat.icon}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', fontWeight: '800' }}>{cat.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>{cat.desc}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', fontWeight: '800', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        View Clinical Unit <ChevronRight size={18} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Smart Experience Section */}
            <section style={{ padding: 'clamp(4rem, 8vw, 10rem) 0', background: 'var(--surface-alt)', borderTop: '1px solid var(--border-light)' }}>
                <div className="container">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(2rem, 5vw, 5rem)', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: '1 1 300px', minWidth: 0 }}>
                            <span className="badge-gold" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>Official Medical Gateway</span>
                            <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 3.8rem)', marginBottom: '2rem', lineHeight: '1.1', fontWeight: '900' }}>Unified search. <br /><span style={{ color: 'var(--primary)' }}>One standard.</span></h2>
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '14px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
                                        <Activity size={24} style={{ color: 'var(--primary)' }} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', marginBottom: '0.4rem', fontWeight: '800' }}>Proximity Intelligence</h4>
                                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: 'clamp(0.85rem, 2vw, 1.05rem)' }}>Real-time GPS coordination ensuring phlebotomist arrival within 45 minutes across all metropolitan areas.</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '14px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
                                        <ShieldCheck size={24} style={{ color: 'var(--success)' }} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', marginBottom: '0.4rem', fontWeight: '800' }}>Quality Verification Protocol</h4>
                                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: 'clamp(0.85rem, 2vw, 1.05rem)' }}>Only NABL/CAP certified labs with ISO auditing participate in the DiagnoLabs network.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                            <div className="premium-card" style={{ padding: 'clamp(1.5rem, 4vw, 3rem)', textAlign: 'center', borderRadius: '32px' }}>
                                <div style={{ background: 'var(--primary-light)', padding: 'clamp(1rem, 3vw, 2rem)', borderRadius: '20px', marginBottom: '1.25rem', display: 'inline-flex' }}>
                                    <Microscope size={48} style={{ color: 'var(--primary)' }} />
                                </div>
                                <h3 style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)', marginBottom: '1rem', fontWeight: '900' }}>NABL Accreditation</h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: 'clamp(0.85rem, 2vw, 1.1rem)' }}>We enforce high-purity medical standards for every booking within our clinical environment.</p>
                                <button className="btn btn-primary" style={{ width: '100%' }}>View Clinical Standards</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact Metrics */}
            <section style={{ padding: 'clamp(4rem, 10vw, 10rem) 0' }}>
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 'clamp(1rem, 4vw, 4rem)',
                        textAlign: 'center',
                    }}>
                        <div>
                            <div style={{ fontSize: 'clamp(1.8rem, 7vw, 5rem)', fontWeight: '900', color: 'var(--primary)', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>1.2M+</div>
                            <div className="label-mini" style={{ fontSize: 'clamp(0.55rem, 1.8vw, 0.85rem)' }}>Citizen Consultations</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 'clamp(1.8rem, 7vw, 5rem)', fontWeight: '900', color: 'var(--primary)', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>480+</div>
                            <div className="label-mini" style={{ fontSize: 'clamp(0.55rem, 1.8vw, 0.85rem)' }}>Accredited Centers</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 'clamp(1.8rem, 7vw, 5rem)', fontWeight: '900', color: 'var(--primary)', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>100%</div>
                            <div className="label-mini" style={{ fontSize: 'clamp(0.55rem, 1.8vw, 0.85rem)' }}>Precision Assurance</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section style={{ padding: 'clamp(2rem, 5vw, 4rem) 1rem clamp(4rem, 8vw, 10rem)' }}>
                <div className="container">
                    <div style={{ padding: 'clamp(2.5rem, 6vw, 8rem) clamp(1.5rem, 5vw, 4rem)', background: '#000000', borderRadius: 'clamp(24px, 5vw, 60px)', color: 'white', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '0', right: '0', width: '300px', height: '300px', background: 'var(--primary)', opacity: 0.1, borderRadius: '50%', filter: 'blur(80px)' }}></div>
                        <h2 style={{ fontSize: 'clamp(1.6rem, 5vw, 4.5rem)', color: 'white', marginBottom: '1.25rem', fontWeight: '900', letterSpacing: '-0.04em', position: 'relative' }}>Your future health, secured.</h2>
                        <p style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.5rem)', color: 'rgba(255,255,255,0.6)', marginBottom: 'clamp(1.5rem, 4vw, 4rem)', maxWidth: '600px', margin: '0 auto clamp(1.5rem, 4vw, 4rem)', fontWeight: '500', position: 'relative' }}>
                            DiagnoLabs is not just a portal. It is a commitment to clinical excellence and absolute patient accuracy.
                        </p>
                        <button onClick={() => navigate('/register')} className="btn btn-gold" style={{ padding: 'clamp(0.9rem, 2vw, 1.5rem) clamp(2rem, 5vw, 5rem)', fontSize: 'clamp(0.95rem, 2vw, 1.4rem)', position: 'relative' }}>
                            Join Citizen Portal <ArrowRight size={22} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Official Footer */}
            <footer style={{ padding: 'clamp(3rem, 6vw, 6rem) 0', borderTop: '1px solid var(--border-light)', background: 'white' }}>
                <div className="container">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(2rem, 4vw, 4rem)', marginBottom: 'clamp(2rem, 5vw, 5rem)' }}>
                        <div style={{ flex: '2 1 200px', minWidth: 0 }}>
                            <div style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', fontWeight: '900', color: 'var(--primary)', marginBottom: '1rem', letterSpacing: '-0.03em' }}>DiagnoLabs Clinical</div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.85rem, 2vw, 1.1rem)', lineHeight: '1.6' }}>
                                The smart clinical discovery network for Southeast Asia, bringing NABL-certified precision to every doorstep.
                            </p>
                        </div>
                        <div style={{ flex: '1 1 130px', minWidth: 0 }}>
                            <h5 style={{ fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '1rem' }}>Platform</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', color: 'var(--text-main)', fontWeight: '700', fontSize: '0.9rem' }}>
                                <span>Medical Partners</span>
                                <span>Lab Provider Hub</span>
                                <span>Phlebotomist Portal</span>
                                <span>API Documentation</span>
                            </div>
                        </div>
                        <div style={{ flex: '1 1 130px', minWidth: 0 }}>
                            <h5 style={{ fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '1rem' }}>Standards</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', color: 'var(--text-main)', fontWeight: '700', fontSize: '0.9rem' }}>
                                <span>NABL ISO 15189</span>
                                <span>CAP Accreditation</span>
                                <span>Privacy Protocol</span>
                                <span>Terms of Governance</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '800' }}>
                        <span>© 2026 DIAGNOLABS GROUP — CENTRAL CLINICAL COMMAND.</span>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <Link to="/admin/login" style={{ textDecoration: 'none', color: 'inherit' }}>Admin Gateway</Link>
                            <Link to="/partner/login" style={{ textDecoration: 'none', color: 'inherit' }}>Partner Hub</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;

// Home Page Premium Styles
const styles = `
.premium-card {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
.premium-card:hover {
    transform: translateY(-12px) scale(1.02) !important;
    box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.12) !important;
    border-color: hsla(var(--primary-hsl), 0.4) !important;
}
`;

if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}
