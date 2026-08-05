import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Search,
    MapPin,
    Clock,
    Star,
    ChevronRight,
    Activity,
    ShieldCheck,
    Building2,
    Navigation,
    Filter,
    LocateFixed,
    MessageSquare,
    Phone,
    CheckCircle2,
    Zap,
    TrendingUp
} from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const Labs = () => {
    const [searchParams] = useSearchParams();
    const urlPincode = searchParams.get('pincode');
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, _setSearchQuery] = useState('');
    const [cityFilter, _setCityFilter] = useState('');
    const [statusFilter, _setStatusFilter] = useState('all'); 
    const [activeCategory, setActiveCategory] = useState('All');
    
    const categories = ['All', 'Pathology', 'Diagnostics', 'X-Ray', 'Blood Collection', 'Radiology', 'Clinic'];

    const fetchLabs = async () => {
        try {
            setLoading(true);
            const lat = searchParams.get('lat');
            const lng = searchParams.get('lng');
            
            let url = `${API_BASE_URL}/api/labs`;
            if (urlPincode) {
                url += `?pincode=${urlPincode}`;
            } else if (lat && lng) {
                url += `/search-live?lat=${lat}&lng=${lng}`;
            }
            
            const res = await axios.get(url);
            const tieredLabs = (res.data || []).map(lab => {
                const r = lab.rating || 3.5;
                if (r >= 4.5 || lab.isVerified) lab.category = "Premium";
                else if (r >= 4.2) lab.category = "Scalable";
                else lab.category = "Standard";
                return lab;
            });
            setLabs(tieredLabs);
        } catch (err) {
            console.error('Error fetching labs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLabs();
        // eslint-disable-next-line
    }, [searchParams]);

    const isLabOpen = (openingTime, closingTime) => {
        if (!openingTime || !closingTime) return true;

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const parseTime = (timeStr) => {
            const [time, modifier] = timeStr.split(' ');
            let [hours, minutes] = time.split(':');
            hours = parseInt(hours);
            minutes = parseInt(minutes);

            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;

            return hours * 60 + minutes;
        };

        const open = parseTime(openingTime);
        const close = parseTime(closingTime);

        return currentTime >= open && currentTime <= close;
    };

    const filteredLabs = labs.filter(lab => {
        const matchesSearch = (lab.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (lab.address || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCity = cityFilter === '' || (lab.city || '').toLowerCase().includes(cityFilter.toLowerCase());
        
        const labTags = lab.tags || [];
        const labTypeCased = lab.labType ? lab.labType.charAt(0).toUpperCase() + lab.labType.slice(1) : '';
        const matchesCategory = activeCategory === 'All' || labTags.includes(activeCategory) || labTypeCased === activeCategory;
        
        const isOpen = lab.isOpenNow || isLabOpen(lab.openingTime, lab.closingTime);
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'open' && isOpen);

        // Premium Only Constraint: Just show verified clinical partners
        return matchesSearch && matchesCity && matchesStatus && matchesCategory && lab.isVerified;
    });

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: 'clamp(5.5rem, 9vw, 7.5rem)', paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
            {/* Header Section */}
            <div className="container" style={{ marginBottom: 'clamp(2rem, 4vw, 3.5rem)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.4rem 0.9rem', borderRadius: '100px', border: '1px solid var(--border)', marginBottom: '1rem' }}
                        >
                            <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />
                            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Clinical Discovery Network</span>
                        </motion.div>
                        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3.2rem)', fontWeight: '900', color: 'var(--primary)', marginBottom: '1rem', lineHeight: '1.15', letterSpacing: '-0.03em' }}>
                            India's Most Advanced <br />
                            <span style={{ color: 'var(--accent-gold)' }}>Medical Partners</span>
                        </h1>
                        <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)', color: 'var(--text-secondary)', lineHeight: '1.5', fontWeight: '500', margin: 0 }}>
                            Discover NABL-certified laboratories, precision diagnostic centers, and specialized clinical hubs mapped across India.
                        </p>
                    </div>

                    {/* Search & Filter Command Center */}
                    <div style={{ background: 'white', padding: 'clamp(0.85rem, 2vw, 1.25rem)', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.85rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                            <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 0 }}>
                                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Search lab, test, specialty..."
                                    value={searchQuery}
                                    onChange={(e) => _setSearchQuery(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: '#f8fafc', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ position: 'relative', flex: '1 1 140px', minWidth: 0 }}>
                                <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="City..."
                                    value={cityFilter}
                                    onChange={(e) => _setCityFilter(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: '#f8fafc', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', background: '#f8fafc', padding: '0.3rem', borderRadius: '12px', border: '1px solid var(--border-light)', width: 'fit-content' }}>
                            <button
                                onClick={() => _setStatusFilter('all')}
                                style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: statusFilter === 'all' ? 'white' : 'transparent', color: statusFilter === 'all' ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: statusFilter === 'all' ? '700' : '600', boxShadow: statusFilter === 'all' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', fontSize: '0.85rem' }}
                            >
                                All Partners
                            </button>
                            <button
                                onClick={() => _setStatusFilter('open')}
                                style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: statusFilter === 'open' ? 'white' : 'transparent', color: statusFilter === 'open' ? 'var(--success)' : 'var(--text-muted)', fontWeight: statusFilter === 'open' ? '700' : '600', boxShadow: statusFilter === 'open' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', fontSize: '0.85rem' }}
                            >
                                Open Now
                            </button>
                        </div>
                    </div>

                    {/* Specialized Categories */}
                    <div style={{ 
                        display: 'flex', 
                        gap: '0.6rem', 
                        overflowX: 'auto', 
                        paddingBottom: '0.4rem',
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none'
                    }} className="hide-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    whiteSpace: 'nowrap',
                                    padding: '0.55rem 1.1rem',
                                    borderRadius: '100px',
                                    border: `1.5px solid ${activeCategory === cat ? 'var(--primary)' : 'var(--border)'}`,
                                    background: activeCategory === cat ? 'var(--primary-light)' : 'white',
                                    color: activeCategory === cat ? 'var(--primary)' : 'var(--text-main)',
                                    fontWeight: '800',
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: activeCategory === cat ? '0 8px 16px -8px hsla(var(--primary-hsl), 0.3)' : 'var(--shadow-sm)'
                                }}
                            >
                                {cat === 'All' && <Zap size={13} style={{ marginRight: '0.3rem', display: 'inline' }} />}
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Labs Grid */}
            <div className="container">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <div className="float-animation">
                            <Activity size={40} className="text-primary" style={{ animation: 'pulse 2s infinite' }} />
                        </div>
                        <p style={{ marginTop: '1rem', fontWeight: '700', color: 'var(--text-main)', fontSize: '1rem' }}>Scouring Digital Clinical Networks...</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>Synchronizing real-time data from OpenStreetMap & Pincode Registry</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 290px), 1fr))', gap: 'clamp(1rem, 3vw, 1.75rem)' }} className="grid-responsive footer-stack two-col-mobile-grid">
                        {filteredLabs.length > 0 ? (
                            filteredLabs.map((lab, index) => {
                                const isOpen = lab.isOpenNow || isLabOpen(lab.openingTime, lab.closingTime);
                                return (
                                    <motion.div
                                        key={lab._id || lab.googlePlaceId}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="glass-card test-result-card premium-card"
                                        style={{
                                            background: lab.category === 'Premium' ? 'linear-gradient(145deg, #ffffff, var(--surface-alt))' : (lab.category === 'Scalable' ? 'linear-gradient(145deg, #ffffff, #f8fafc)' : 'linear-gradient(145deg, #ffffff, #fff7ed)'),
                                            padding: '1.1rem 1.25rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            position: 'relative',
                                            border: lab.category === 'Premium' ? '1px solid rgba(245, 158, 11, 0.4)' : (lab.category === 'Scalable' ? '1px solid rgba(148, 163, 184, 0.4)' : '1px solid rgba(194, 65, 12, 0.3)'),
                                            borderRadius: '22px',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {/* Top Row: Icon + Status badges */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                                            <div style={{
                                                width: '44px', height: '44px',
                                                background: 'var(--primary-light)', color: 'var(--primary)',
                                                borderRadius: '12px', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                            }}>
                                                <Building2 size={22} />
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                                {isOpen && (
                                                    <div style={{ 
                                                        padding: '0.25rem 0.55rem', borderRadius: '100px', background: '#f0fdf4', color: '#16a34a',
                                                        fontSize: '0.65rem', fontWeight: '900', border: '1px solid #dcfce7', display: 'flex', alignItems: 'center', gap: '0.25rem'
                                                    }}>
                                                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#16a34a' }}></div> OPEN
                                                    </div>
                                                )}
                                                <div style={{ 
                                                    background: lab.isVerified ? 'linear-gradient(90deg, #0ea5e9, var(--primary))' : '#64748b',
                                                    color: 'white',
                                                    padding: '0.25rem 0.65rem',
                                                    borderRadius: '100px',
                                                    fontSize: '0.65rem',
                                                    fontWeight: '900',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {lab.isVerified ? 'VERIFIED' : 'COMMUNITY'}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '1rem' }}>
                                            <h3 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)', fontWeight: '900', marginBottom: '0.4rem', color: '#0f172a', lineHeight: '1.25' }}>{lab.name}</h3>
                                            
                                            {/* Service Chips */}
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                                                {(lab.tags || ['Pathology', 'Diagnostic Hub']).map(tag => (
                                                    <span key={tag} style={{ 
                                                        background: '#f1f5f9', color: '#475569', padding: '0.15rem 0.5rem', 
                                                        borderRadius: '6px', fontSize: '0.68rem', fontWeight: '800' 
                                                    }}>{tag}</span>
                                                ))}
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontWeight: '700', fontSize: '0.8rem' }}>
                                                <div style={{ color: 'var(--accent-gold)', fontSize: '0.95rem' }}>★</div>
                                                <span>{lab.rating || '4.5'}</span>
                                                <span style={{ color: '#cbd5e1' }}>|</span>
                                                <span>{lab.totalReviews || '0'} Reviews</span>
                                            </div>
                                        </div>

                                        <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid var(--border)', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.6rem' }}>
                                                <MapPin size={15} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                                                <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600', lineHeight: '1.35', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{lab.address}</div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.78rem', fontWeight: '700', color: '#64748b' }}>
                                                    <Navigation size={13} /> {lab.distance ? `${(lab.distance/1000).toFixed(1)} km` : 'Local'}
                                                </div>
                                                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--primary)' }}>
                                                    {lab.estimatedTime ? `${lab.estimatedTime} mins` : lab.distance ? `~${Math.ceil(lab.distance / 500)} mins` : 'Nearby'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons Bar */}
                                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                                            <a href={lab.whatsapp} target="_blank" rel="noreferrer" style={{ 
                                                flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                                                background: '#22c55e', color: 'white', padding: '0.65rem 0.5rem', borderRadius: '10px', 
                                                textDecoration: 'none', fontSize: '0.78rem', fontWeight: '800', minWidth: '85px'
                                            }}>
                                                <MessageSquare size={14} /> WhatsApp
                                            </a>
                                            <a href={`tel:${lab.phone}`} style={{ 
                                                flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                                                background: 'white', color: 'var(--primary)', padding: '0.65rem 0.5rem', borderRadius: '10px', 
                                                textDecoration: 'none', fontSize: '0.78rem', fontWeight: '800', border: '1.5px solid var(--primary)', minWidth: '80px'
                                            }}>
                                                <Phone size={14} /> Call
                                            </a>
                                            <Link to={`/lab/${lab._id}`} style={{ 
                                                width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: 'var(--primary)', color: 'white', borderRadius: '10px', textDecoration: 'none', flexShrink: 0
                                            }}>
                                                <ChevronRight size={16} />
                                            </Link>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 1rem' }}>
                                <div style={{ marginBottom: '1.5rem', opacity: 0.3 }}>
                                    <Filter size={48} />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: '800' }}>No clinical facilities found</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Try adjusting your filters or search query to find matching laboratories.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        <style>{`
            @media (max-width: 640px) {
                .grid-responsive {
                    grid-template-columns: 1fr !important;
                    gap: 1.15rem !important;
                }
            }
        `}</style>
    </div>
    );
};

export default Labs;
