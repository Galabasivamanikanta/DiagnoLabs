import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
    FlaskConical, MapPin, Phone, User, Calendar, Clock,
    CheckCircle, AlertCircle, RefreshCw, ClipboardList,
    TrendingUp, Activity, Zap, Navigation, ChevronRight,
    Loader2, StickyNote, ArrowRight, IndianRupee, BadgeCheck,
    Timer, Bike, TestTube, FileSearch, X, Map,
    ScanLine, Camera, CreditCard, Home
} from 'lucide-react';
import BarcodeScanner from '../components/BarcodeScanner';

// Fix leaflet default icon broken in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const STATUS_CONFIG = {
    'Pending':          { color: 'var(--accent-gold)', bg: 'var(--surface-alt)', border: '#fde68a', label: 'Pending',          icon: <Timer size={13}/> },
    'Confirmed':        { color: 'var(--primary)', bg: 'var(--surface-alt)', border: 'var(--primary-light)', label: 'Confirmed',        icon: <BadgeCheck size={13}/> },
    'Sample Collected': { color: 'var(--success)', bg: '#f0fdf4', border: '#6ee7b7', label: 'Collected',        icon: <CheckCircle size={13}/> },
    'Sample Processing':{ color: '#8b5cf6', bg: '#f5f3ff', border: '#c4b5fd', label: 'Processing',       icon: <Activity size={13}/> },
    'Report Uploaded':  { color: '#0ea5e9', bg: '#f0f9ff', border: '#7dd3fc', label: 'Report Ready',     icon: <FileSearch size={13}/> },
    'Cancelled':        { color: 'var(--danger)', bg: '#fef2f2', border: '#fecaca', label: 'Cancelled',        icon: <AlertCircle size={13}/> },
};

export default function SampleCollectorDashboard() {
    const { user, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [userForm, setUserForm] = useState({ name: '', email: '', phone: '' });
    const [savingUser, setSavingUser] = useState(false);

    useEffect(() => {
        if (user) {
            setUserForm({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const handleUserFormChange = (e) => {
        setUserForm({ ...userForm, [e.target.name]: e.target.value });
    };

    const handleUserFormSubmit = async (e) => {
        e.preventDefault();
        setSavingUser(true);
        try {
            const res = await axios.put(`${API_BASE_URL}/api/auth/${user.id || user._id}`, userForm, getHeaders());
            updateUser(res.data);
            alert("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to update profile.");
        } finally {
            setSavingUser(false);
        }
    };

    const [assignments, setAssignments] = useState([]);
    const [stats, setStats] = useState({ pending: 0, confirmed: 0, collected: 0, processing: 0, todayCollections: 0 });
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [noteMap, setNoteMap] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'assignments');
    const [mapModal, setMapModal] = useState(null);
    const [scanningBookingId, setScanningBookingId] = useState(null);
    const [paymentModal, setPaymentModal] = useState(null);
    const [proofUploading, setProofUploading] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const fileInputRef = useRef(null); // { address, lat, lng, patientName }
    const [geocoding, setGeocoding] = useState(false);

    const allowedRoles = ['admin', 'phlebotomist', 'employee', 'nurse', 'lab_partner'];

    useEffect(() => {
        if (!user) { navigate('/userlogin'); return; }
        if (!allowedRoles.includes(user.role)) { navigate('/'); return; }
        fetchData();
    }, [user]);

    const getHeaders = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [assignRes, statsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/collector-dashboard/assignments`, getHeaders()),
                axios.get(`${API_BASE_URL}/api/collector-dashboard/stats`, getHeaders()),
            ]);
            setAssignments(Array.isArray(assignRes.data) ? assignRes.data : []);
            setStats(statsRes.data || {});
        } catch (err) {
            console.error('Failed to fetch collector data:', err);
        } finally {
            setLoading(false);
        }
    };

    
    const handleBarcodeSuccess = async (barcode) => {
        try {
            await axios.put(`${API_BASE_URL}/api/collector-dashboard/barcode/${scanningBookingId}`, { barcode }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setScanningBookingId(null);
            fetchData();
        } catch (err) { alert('Failed to save barcode'); }
    };

    const handleProofUpload = async (e, bookingId) => {
        const file = e.target.files[0];
        if(!file) return;
        setProofUploading(bookingId);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('bookingId', ''); // Don't send bookingId so it just returns URL
            
            const res = await axios.post(`${API_BASE_URL}/api/upload`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' } });
            
            await axios.put(`${API_BASE_URL}/api/collector-dashboard/proof/${bookingId}`, { proofUrl: res.data.url }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to upload proof');
        } finally {
            setProofUploading(null);
        }
    };

    const collectPayment = async (bookingId) => {
        setUpdatingId(bookingId);
        try {
            await axios.put(`${API_BASE_URL}/api/collector-dashboard/payment/${bookingId}`, { paymentMethod }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setPaymentModal(null);
            fetchData();
        } catch(err) { alert('Failed to collect payment'); }
        setUpdatingId(null);
    };

    

    const markCollected = async (bookingId) => {
        setUpdatingId(bookingId);
        try {
            await axios.put(`${API_BASE_URL}/api/collector-dashboard/collect/${bookingId}`,
                { collectorNote: noteMap[bookingId] || '' },
                getHeaders()
            );
            setAssignments(prev => prev.map(b =>
                b._id === bookingId ? { ...b, status: 'Sample Collected', mentorNote: noteMap[bookingId] || '' } : b
            ));
            setStats(prev => ({ ...prev, collected: (prev.collected || 0) + 1, todayCollections: (prev.todayCollections || 0) + 1 }));
        } catch (err) {
            alert('Failed to update status. Please try again.');
        } finally {
            setUpdatingId(null);
        }
    };

    const updateStatus = async (bookingId, status) => {
        setUpdatingId(bookingId);
        try {
            await axios.put(`${API_BASE_URL}/api/collector-dashboard/status/${bookingId}`,
                { status, collectorNote: noteMap[bookingId] || '' },
                getHeaders()
            );
            setAssignments(prev => prev.map(b => b._id === bookingId ? { ...b, status } : b));
        } catch (err) {
            alert('Failed to update status. Please try again.');
        } finally {
            setUpdatingId(null);
        }
    };

    const openMap = async (booking) => {
        const address = booking.sampleCollectionAddress || '';
        if (!address) return;
        setGeocoding(true);
        try {
            const query = encodeURIComponent(address + ', India');
            const geoRes = await axios.get(
                `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
                { headers: { 'Accept-Language': 'en' } }
            );
            if (geoRes.data && geoRes.data.length > 0) {
                const { lat, lon } = geoRes.data[0];
                setMapModal({ address, lat: parseFloat(lat), lng: parseFloat(lon), patientName: booking.patient?.name || 'Patient' });
            } else {
                setMapModal({ address, lat: 17.3850, lng: 78.4867, patientName: booking.patient?.name || 'Patient' });
            }
        } catch {
            setMapModal({ address, lat: 17.3850, lng: 78.4867, patientName: booking.patient?.name || 'Patient' });
        } finally {
            setGeocoding(false);
        }
    };

    const filteredAssignments = assignments.filter(b => {
        const matchStatus = filterStatus === 'All' || b.status === filterStatus;
        const search = searchQuery.toLowerCase();
        const matchSearch = !searchQuery ||
            b.patient?.name?.toLowerCase().includes(search) ||
            b.patient?.phone?.includes(search) ||
            b.sampleCollectionAddress?.toLowerCase().includes(search) ||
            b.testDetails?.some(t => t.testName?.toLowerCase().includes(search));
        return matchStatus && matchSearch;
    });

    const todayBookings = assignments.filter(b => {
        const apDate = new Date(b.appointmentDate);
        const today = new Date();
        return apDate.toDateString() === today.toDateString();
    });

    const STAT_CARDS = [
        { label: 'Today\'s Assignments', value: todayBookings.length, icon: <Calendar size={20}/>, color: 'var(--primary)', bg: 'var(--surface-alt)' },
        { label: 'Today Collected', value: stats.todayCollections || 0, icon: <TestTube size={20}/>, color: 'var(--success)', bg: '#f0fdf4' },
        { label: 'Pending Pickup', value: (stats.pending || 0) + (stats.confirmed || 0), icon: <Timer size={20}/>, color: 'var(--accent-gold)', bg: 'var(--surface-alt)' },
        { label: 'In Processing', value: stats.processing || 0, icon: <Activity size={20}/>, color: '#8b5cf6', bg: '#f5f3ff' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--surface-alt)', paddingTop: 'calc(var(--nav-height) + 2rem)', paddingBottom: '2rem' }}>

            {/* ── In-Site Map Modal ── */}
            {mapModal && (
                <div onClick={() => setMapModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px', border: '1px solid var(--border)', width: '100%', maxWidth: '700px', overflow: 'hidden', boxShadow: 'var(--shadow-premium)' }}>
                        <div style={{ padding: '1.2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
                            <div>
                                <div style={{ color: 'var(--text-main)', fontWeight: '800', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MapPin size={16} style={{ color: 'var(--success)' }} /> {mapModal.patientName} — Collection Point
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: '600', marginTop: '0.2rem' }}>{mapModal.address}</div>
                            </div>
                            <button onClick={() => setMapModal(null)} style={{ background: 'var(--border-light)', border: 'none', color: 'white', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', display: 'flex' }}>
                                <X size={18} />
                            </button>
                        </div>
                        <div style={{ height: '430px', width: '100%' }}>
                            <MapContainer center={[mapModal.lat, mapModal.lng]} zoom={15} style={{ height: '100%', width: '100%' }} key={`${mapModal.lat}-${mapModal.lng}`}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[mapModal.lat, mapModal.lng]}>
                                    <Popup><strong>{mapModal.patientName}</strong><br />{mapModal.address}</Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                        <div style={{ padding: '0.9rem 1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Map size={12} /> Powered by OpenStreetMap · DiagnoLabs Internal Map
                            </span>
                            <a 
                                href={`https://www.google.com/maps/dir/?api=1&destination=${mapModal.lat},${mapModal.lng}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', textDecoration: 'none', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800' }}
                            >
                                <Navigation size={14} /> Get Directions
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Header ── */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                            <Bike size={26} color="var(--primary)" />
                        </div>
                        <div>
                            <h1 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
                                Sample Collector <span style={{ color: 'var(--success)' }}>Dashboard</span>
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0, fontWeight: '600' }}>
                                Welcome, {user?.name || 'Collector'} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/')}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}
                        >
                            <Home size={15} /> Book Test (Home)
                        </button>
                        <button
                            onClick={fetchData}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: 'var(--border-light)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}
                        >
                            <RefreshCw size={15} /> Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Stats Cards ── */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem 1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    {STAT_CARDS.map((s, i) => (
                        <div key={i} style={{ background: 'var(--surface-alt)', backdropFilter: 'blur(12px)', borderRadius: '18px', padding: '1.4rem 1.6rem', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '46px', height: '46px', borderRadius: '13px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                                {s.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1 }}>{s.value}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '0.2rem' }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Tabs ── */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem 1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', background: 'white', padding: '0.4rem', borderRadius: '14px', width: 'fit-content' }}>
                    {[
                        { id: 'assignments', label: 'All Assignments', icon: <ClipboardList size={15}/> },
                        { id: 'today', label: "Today's Route", icon: <Navigation size={15}/> },
                        { id: 'profile', label: 'My Profile', icon: <User size={15}/> },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === tab.id ? 'var(--primary)' : 'transparent', color: activeTab === tab.id ? 'white' : 'var(--text-muted)' }}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>

                {activeTab === 'profile' ? (
                    <div style={{ background: 'var(--surface-alt)', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                        <div style={{ padding: '2rem', background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'white', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '900', boxShadow: 'var(--shadow-lg)' }}>
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem', fontWeight: '800' }}>{user?.name}</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.9, fontSize: '0.9rem', fontWeight: '600' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><BadgeCheck size={16} /> Verified Collector</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={16} /> ID: {user?.employeeId || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 600px)', justifyContent: 'center' }}>
                                <div style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                                    <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '800' }}>Personal Details</h3>
                                    <form onSubmit={handleUserFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Full Name</label>
                                            <input type="text" name="name" value={userForm.name} onChange={handleUserFormChange} style={{ width: '100%', padding: '0.8rem 1rem', background: 'white', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '600', outline: 'none' }} required />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Email Address</label>
                                            <input type="email" name="email" value={userForm.email} onChange={handleUserFormChange} style={{ width: '100%', padding: '0.8rem 1rem', background: 'white', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '600', outline: 'none' }} required />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Phone Number</label>
                                            <input type="text" name="phone" value={userForm.phone} onChange={handleUserFormChange} style={{ width: '100%', padding: '0.8rem 1rem', background: 'white', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '600', outline: 'none' }} required />
                                        </div>
                                        <button type="submit" disabled={savingUser} style={{ marginTop: '0.5rem', padding: '0.8rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.95rem', cursor: savingUser ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                            {savingUser ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                                            {savingUser ? 'Updating...' : 'Update Profile'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Search & Filter */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Search by patient name, phone, address or test..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ flex: 1, minWidth: '220px', padding: '0.65rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'white', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none', fontWeight: '600' }}
                    />
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        style={{ padding: '0.65rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'white', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                        <option value="All" style={{ background: 'white' }}>All Status</option>
                        <option value="Pending" style={{ background: 'white' }}>Pending</option>
                        <option value="Confirmed" style={{ background: 'white' }}>Confirmed</option>
                        <option value="Sample Collected" style={{ background: 'white' }}>Collected</option>
                        <option value="Sample Processing" style={{ background: 'white' }}>Processing</option>
                    </select>
                </div>

                {/* Assignment Cards */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem', display: 'block' }} />
                        <p style={{ fontWeight: '700' }}>Loading assignments...</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {(activeTab === 'today' ? todayBookings : filteredAssignments).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--surface-alt)', borderRadius: '20px', border: '1px solid var(--border-light)' }}>
                                <TestTube size={40} style={{ color: 'var(--border)', margin: '0 auto 1rem', display: 'block' }} />
                                <p style={{ color: 'var(--text-muted)', fontWeight: '700', fontSize: '1rem' }}>No assignments found</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>All collections are up to date!</p>
                            </div>
                        ) : (
                            (activeTab === 'today' ? todayBookings : filteredAssignments).map(booking => {
                                const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG['Pending'];
                                const isUpdating = updatingId === booking._id;
                                const isCollected = booking.status === 'Sample Collected' || booking.status === 'Sample Processing' || booking.status === 'Report Uploaded';

                                return (
                                    <div key={booking._id} style={{ background: 'var(--surface-alt)', backdropFilter: 'blur(12px)', borderRadius: '20px', border: `1px solid ${isCollected ? 'rgba(16,185,129,0.25)' : 'var(--border-light)'}`, padding: '1.4rem 1.6rem', transition: 'all 0.2s' }}>

                                        {/* Top Row */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <User size={18} color="var(--text-muted)" />
                                                </div>
                                                <div>
                                                    <div style={{ color: 'var(--text-main)', fontWeight: '800', fontSize: '0.98rem' }}>{booking.patient?.name || 'Patient'}</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: '600' }}>
                                                        <Phone size={11} /> {booking.patient?.phone || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', borderRadius: '20px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontWeight: '800', fontSize: '0.75rem' }}>
                                                {cfg.icon} {cfg.label}
                                            </span>
                                        </div>

                                        {/* Details Grid */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                                            <div style={{ background: 'var(--surface-alt)', borderRadius: '12px', padding: '0.75rem 1rem' }}>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Tests</div>
                                                {booking.testDetails?.map((t, i) => (
                                                    <div key={i} style={{ color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                        <FlaskConical size={11} style={{ color: 'var(--success)' }} /> {t.testName}
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ background: 'var(--surface-alt)', borderRadius: '12px', padding: '0.75rem 1rem' }}>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Appointment</div>
                                                <div style={{ color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Calendar size={12} style={{ color: 'var(--primary)' }} />
                                                    {booking.appointmentDate ? new Date(booking.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                                </div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: '600', marginTop: '0.2rem', paddingLeft: '1.1rem' }}>
                                                    {booking.appointmentTime || 'N/A'}
                                                </div>
                                            </div>
                                            <div style={{ background: 'var(--surface-alt)', borderRadius: '12px', padding: '0.75rem 1rem' }}>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Collection Address</div>
                                                <div style={{ color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: '700', display: 'flex', gap: '0.3rem' }}>
                                                    <MapPin size={12} style={{ color: 'var(--accent-gold)', flexShrink: 0, marginTop: '2px' }} />
                                                    <span>{booking.sampleCollectionAddress || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div style={{ background: 'var(--surface-alt)', borderRadius: '12px', padding: '0.75rem 1rem' }}>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Amount</div>
                                                <div style={{ color: 'var(--success)', fontSize: '0.98rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                    <IndianRupee size={14} /> {booking.totalAmount?.toLocaleString('en-IN') || 0}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: booking.paymentStatus === 'Paid' ? 'var(--success)' : 'var(--accent-gold)', fontWeight: '700', marginTop: '0.2rem' }}>
                                                    {booking.paymentStatus || 'Pending'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Collector Note */}
                                        {!isCollected && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>
                                                    <StickyNote size={11} /> Collector Note (Optional)
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Patient was fasting, used left arm vein..."
                                                    value={noteMap[booking._id] || ''}
                                                    onChange={e => setNoteMap(prev => ({ ...prev, [booking._id]: e.target.value }))}
                                                    style={{ width: '100%', padding: '0.6rem 0.9rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'white', color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none', fontWeight: '600', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                        )}

                                        
                                        {/* Action Buttons */}
                                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                                            {/* Call Patient */}
                                            {booking.patient?.phone && (
                                                <a href={`tel:${booking.patient.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', background: 'var(--surface-alt)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '10px', fontWeight: '700', fontSize: '0.78rem', textDecoration: 'none' }}>
                                                    <Phone size={13} /> Call Patient
                                                </a>
                                            )}
                                            
                                            {/* View Map */}
                                            <button onClick={() => openMap(booking)} disabled={geocoding} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', background: 'var(--surface-alt)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '10px', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}>
                                                {geocoding ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Map size={13} />} View Map
                                            </button>

                                            {/* Payment Button */}
                                            {booking.paymentStatus !== 'Paid' && (
                                                <button onClick={() => setPaymentModal(booking)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}>
                                                    <IndianRupee size={13} /> Collect Payment
                                                </button>
                                            )}

                                            {/* Advanced Collection Flow based on status */}
                                            {booking.status === 'Confirmed' && (
                                                <button onClick={() => updateStatus(booking._id, 'Out for Collection')} disabled={isUpdating} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
                                                    <Bike size={13} /> Start Journey
                                                </button>
                                            )}

                                            {booking.status === 'Out for Collection' && (
                                                <>
                                                    {!booking.vialBarcode && (
                                                        <button onClick={() => setScanningBookingId(booking._id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', background: 'var(--accent-gold-light)', color: '#92400e', border: '1px solid #fde68a', borderRadius: '10px', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}>
                                                            <ScanLine size={13} /> Scan Barcode
                                                        </button>
                                                    )}
                                                    {!booking.collectionProofUrl && (
                                                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe', borderRadius: '10px', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}>
                                                            {proofUploading === booking._id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Camera size={13} />} Upload Proof
                                                            <input type="file" accept="image/*" capture="environment" onChange={(e) => handleProofUpload(e, booking._id)} style={{ display: 'none' }} />
                                                        </label>
                                                    )}
                                                    
                                                    {/* Mark Collected CTA */}
                                                    <button onClick={() => markCollected(booking._id)} disabled={isUpdating} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.1rem', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: isUpdating ? 'not-allowed' : 'pointer', boxShadow: 'var(--shadow-sm)' }}>
                                                        {isUpdating ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Updating...</> : <><CheckCircle size={13} /> Mark Collected</>}
                                                    </button>
                                                </>
                                            )}

                                            {booking.status === 'Sample Collected' && (
                                                <button onClick={() => updateStatus(booking._id, 'Sample Processing')} disabled={isUpdating} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}>
                                                    <Zap size={13} /> Send to Lab <ArrowRight size={11} />
                                                </button>
                                            )}

                                            {isCollected && (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.78rem' }}>
                                                    <CheckCircle size={13} /> {booking.status}
                                                </span>
                                            )}
                                        </div>

                                        {/* Existing note */}
                                        {booking.mentorNote && (
                                            <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.9rem', background: 'var(--surface-alt)', borderRadius: '10px', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: '600', display: 'flex', gap: '0.4rem' }}>
                                                <StickyNote size={13} style={{ flexShrink: 0, marginTop: '1px' }} /> {booking.mentorNote}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
                </>
                )}
            </div>

            
            {/* Barcode Scanner */}
            {scanningBookingId && (
                <BarcodeScanner 
                    onScanSuccess={handleBarcodeSuccess} 
                    onClose={() => setScanningBookingId(null)} 
                />
            )}

            {/* Payment Modal */}
            {paymentModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }} onClick={() => setPaymentModal(null)}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CreditCard size={18} style={{ color: 'var(--primary)' }} /> Collect Payment</h3>
                            <button onClick={() => setPaymentModal(null)} style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.4rem', cursor: 'pointer' }}><X size={16} /></button>
                        </div>
                        
                        <div style={{ padding: '1rem', background: 'var(--surface-alt)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Amount to Collect</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}><IndianRupee size={22} /> {paymentModal.totalAmount?.toLocaleString('en-IN') || 0}</div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Payment Method</label>
                            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'white', color: 'var(--text-main)', fontWeight: '600', outline: 'none' }}>
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="Card">Card Reader</option>
                            </select>
                        </div>

                        <button onClick={() => collectPayment(paymentModal._id)} disabled={updatingId === paymentModal._id} style={{ width: '100%', padding: '1rem', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            {updatingId === paymentModal._id ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={18} />} Mark as Paid
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                input::placeholder { color: var(--text-muted); }
                select option { background: white; color: var(--text-main); }
            `}</style>
        </div>
    );
}

