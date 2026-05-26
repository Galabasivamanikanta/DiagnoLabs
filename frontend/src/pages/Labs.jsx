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
import { motion, AnimatePresence } from 'framer-motion';

const Labs = () => {
    const [searchParams] = useSearchParams();
    const urlPincode = searchParams.get('pincode');
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); 
    const [activeCategory, setActiveCategory] = useState('All');
    
    const categories = ['All', 'Pathology', 'Diagnostics', 'X-Ray', 'Blood Collection', 'Radiology', 'Clinic'];

    useEffect(() => {
        fetchLabs();
    }, [urlPincode]);

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
            setLabs(res.data);
        } catch (err) {
            console.error('Error fetching labs:', err);
        } finally {
            setLoading(false);
        }
    };

    const isLabOpen = (openingTime, closingTime) => {
        if (!openingTime || !closingTime) return false;

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
        const matchesCategory = activeCategory === 'All' || labTags.includes(activeCategory);
        
        const isOpen = lab.isOpenNow || isLabOpen(lab.openingTime, lab.closingTime);
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'open' && isOpen);

        // Premium Only Constraint: Just show verified clinical partners
        return matchesSearch && matchesCity && matchesStatus && matchesCategory && lab.isVerified;
    });

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
            {/* Header Section */}
            <div className="container" style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                padding: '0.5rem 1.2rem',
                                background: 'white',
                                borderRadius: '100px',
                                border: '1px solid var(--border)',
                                color: 'var(--primary)',
                                fontWeight: '800',
                                fontSize: '0.85rem',
                                marginBottom: '1.5rem',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                        >
                            <Building2 size={16} /> NABL ACCREDITED NETWORK
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: '1.1' }}
                        >
                            {urlPincode ? (
                                <span>Labs in <span className="text-gradient">
                                    {/^\d+$/.test(urlPincode) ? `#${urlPincode}` : urlPincode.charAt(0).toUpperCase() + urlPincode.slice(1).toLowerCase()}
                                </span></span>
                            ) : (
                                <span>Partner <span className="text-gradient">Laboratories</span></span>
                            )}
                        </motion.h1>
                        {urlPincode && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.6rem 1.5rem',
                                    background: 'var(--primary-light)',
                                    color: 'var(--primary)',
                                    borderRadius: '100px',
                                    fontWeight: '900',
                                    fontSize: '0.9rem',
                                    marginBottom: '2rem',
                                    border: '2px solid hsla(var(--primary-hsl), 0.2)'
                                }}
                            >
                                <LocateFixed size={18} /> REGIONAL DISCOVERY ACTIVE
                            </motion.div>
                        )}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '500' }}
                        >
                            {urlPincode 
                                ? `Showing premium clinical facilities providing NABL-verified coverage for the "${urlPincode}" regional network.`
                                : "Access our exclusive network of premium NABL-accredited clinical laboratories for high-precision diagnostic services."
                            }
                        </motion.p>
                    </div>

                    {/* Quick Category Bubbles */}
                    <div style={{ 
                        display: 'flex', 
                        gap: '0.8rem', 
                        overflowX: 'auto', 
                        paddingBottom: '0.5rem',
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none'
                    }} className="hide-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    whiteSpace: 'nowrap',
                                    padding: '0.7rem 1.5rem',
                                    borderRadius: '100px',
                                    border: `1.5px solid ${activeCategory === cat ? 'var(--primary)' : 'var(--border)'}`,
                                    background: activeCategory === cat ? 'var(--primary-light)' : 'white',
                                    color: activeCategory === cat ? 'var(--primary)' : 'var(--text-main)',
                                    fontWeight: '800',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: activeCategory === cat ? '0 10px 20px -10px hsla(var(--primary-hsl), 0.3)' : 'var(--shadow-sm)'
                                }}
                            >
                                {cat === 'All' && <Zap size={14} style={{ marginRight: '0.4rem', display: 'inline' }} />}
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Labs Grid */}
            <div className="container">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '6rem 0' }}>
                        <div className="float-animation">
                            <Activity size={48} className="text-primary" style={{ animation: 'pulse 2s infinite' }} />
                        </div>
                        <p style={{ marginTop: '1.5rem', fontWeight: '700', color: 'var(--text-main)', fontSize: '1.1rem' }}>Scouring Digital Clinical Networks...</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>Synchronizing real-time data from OpenStreetMap & Pincode Registry</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }} className="grid-responsive footer-stack">
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
                                            background: 'white',
                                            padding: '2rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            position: 'relative',
                                            border: '1px solid var(--border)',
                                            borderRadius: '28px',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {/* Trust Badge Ribbon */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '12px', right: '-35px',
                                            background: lab.isVerified ? 'linear-gradient(90deg, #0ea5e9, #2563eb)' : '#64748b',
                                            color: 'white',
                                            padding: '4px 45px',
                                            transform: 'rotate(45deg)',
                                            fontSize: '0.65rem',
                                            fontWeight: '900',
                                            zIndex: 10,
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                        }}>
                                            {lab.isVerified ? 'VERIFIED' : 'COMMUNITY'}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                            <div style={{
                                                width: '56px', height: '56px',
                                                background: 'var(--primary-light)', color: 'var(--primary)',
                                                borderRadius: '16px', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <Building2 size={28} />
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {isOpen && (
                                                    <div style={{ 
                                                        padding: '0.4rem 0.8rem', borderRadius: '100px', background: '#f0fdf4', color: '#16a34a',
                                                        fontSize: '0.7rem', fontWeight: '900', border: '1px solid #dcfce7', display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                        animation: 'pulse 2s infinite'
                                                    }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }}></div> OPEN NOW
                                                    </div>
                                                )}
                                                {lab.googlePlaceId?.startsWith('osm_') && (
                                                    <div style={{ 
                                                        padding: '0.4rem 0.8rem', borderRadius: '100px', background: 'var(--primary-light)', color: 'var(--primary)',
                                                        fontSize: '0.7rem', fontWeight: '900', border: '1px solid hsla(var(--primary-hsl), 0.1)', display: 'flex', alignItems: 'center', gap: '0.3rem'
                                                    }}>
                                                        <Activity size={12} /> LIVE SYNC
                                                    </div>
                                                )}
                                                <div style={{ 
                                                    padding: '0.4rem 0.8rem', borderRadius: '100px', background: '#fefce8', color: '#ca8a04',
                                                    fontSize: '0.7rem', fontWeight: '900', border: '1px solid #fef9c3', display: 'flex', alignItems: 'center', gap: '0.3rem'
                                                }}>
                                                    <TrendingUp size={12} /> {lab.totalReviews > 100 ? 'Popular' : 'Active'}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '1.2rem' }}>
                                            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '0.5rem', color: '#0f172a', lineHeight: '1.2' }}>{lab.name}</h3>
                                            
                                            {/* Service Chips */}
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                                                {(lab.tags || ['Pathology', 'Diagnostic Hub']).map(tag => (
                                                    <span key={tag} style={{ 
                                                        background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.6rem', 
                                                        borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' 
                                                    }}>{tag}</span>
                                                ))}
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748b', fontWeight: '700', fontSize: '0.85rem' }}>
                                                <div style={{ color: '#f59e0b', fontSize: '1rem' }}>★</div>
                                                <span>{lab.rating || '4.5'}</span>
                                                <span style={{ color: '#cbd5e1' }}>|</span>
                                                <span>{lab.totalReviews || '0'} Ratings</span>
                                                <span style={{ color: '#cbd5e1' }}>|</span>
                                                <span>{lab.trustLevel || 'JD Trusted'}</span>
                                            </div>
                                        </div>

                                        <div style={{ padding: '1.2rem', background: '#f8fafc', borderRadius: '18px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                                            <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '0.8rem' }}>
                                                <MapPin size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                                                <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600', lineHeight: '1.4' }}>{lab.address}</div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', fontWeight: '700', color: '#64748b' }}>
                                                    <Navigation size={14} className="text-secondary" /> {lab.distance ? `${(lab.distance/1000).toFixed(1)} km` : 'Local'}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)' }}>{lab.estimatedTime || 'Nearby'} mins</div>
                                            </div>
                                        </div>

                                        {/* Action Buttons Bar */}
                                        <div className="test-card-actions-row" style={{ display: 'flex', gap: '0.6rem', marginTop: 'auto' }}>
                                            <a href={lab.whatsapp} target="_blank" rel="noreferrer" style={{ 
                                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                                background: '#22c55e', color: 'white', padding: '0.8rem', borderRadius: '12px', 
                                                textDecoration: 'none', fontSize: '0.85rem', fontWeight: '900', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)'
                                            }}>
                                                <MessageSquare size={16} /> WhatsApp
                                            </a>
                                            <a href={`tel:${lab.phone}`} style={{ 
                                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                                background: 'white', color: 'var(--primary)', padding: '0.8rem', borderRadius: '12px', 
                                                textDecoration: 'none', fontSize: '0.85rem', fontWeight: '900', border: '2px solid var(--primary)'
                                            }}>
                                                <Phone size={16} /> Call Now
                                            </a>
                                            <Link to={`/lab/${lab._id}`} style={{ 
                                                width: '45px', h: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: 'var(--primary)', color: 'white', borderRadius: '12px', textDecoration: 'none'
                                            }}>
                                                <ChevronRight size={20} />
                                            </Link>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '6rem' }}>
                                <div style={{ marginBottom: '2rem', opacity: 0.2 }}>
                                    <Filter size={64} />
                                </div>
                                <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>No clinical facilities found</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Try adjusting your filters or area to find matching laboratories.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        <style>{`
            @media (max-width: 768px) {
                div[style*="paddingTop: '8rem'"] {
                    padding-top: 6rem !important;
                }
                h1 {
                    font-size: 2.5rem !important;
                }
                .footer-stack {
                    grid-template-columns: 1fr !important;
                    gap: 1.5rem !important;
                }
                div[style*="minmax(320px, 1fr)"] {
                    grid-template-columns: 1fr !important;
                }
            }
        `}</style>
    </div>
    );
};

export default Labs;
