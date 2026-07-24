import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
    Timer, Bike, TestTube, FileSearch, X, Map
} from 'lucide-react';

// Fix leaflet default icon broken in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const STATUS_CONFIG = {
    'Pending':          { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', label: 'Pending',          icon: <Timer size={13}/> },
    'Confirmed':        { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', label: 'Confirmed',        icon: <BadgeCheck size={13}/> },
    'Sample Collected': { color: '#10b981', bg: '#f0fdf4', border: '#6ee7b7', label: 'Collected',        icon: <CheckCircle size={13}/> },
    'Sample Processing':{ color: '#8b5cf6', bg: '#f5f3ff', border: '#c4b5fd', label: 'Processing',       icon: <Activity size={13}/> },
    'Report Uploaded':  { color: '#0ea5e9', bg: '#f0f9ff', border: '#7dd3fc', label: 'Report Ready',     icon: <FileSearch size={13}/> },
    'Cancelled':        { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', label: 'Cancelled',        icon: <AlertCircle size={13}/> },
};

export default function SampleCollectorDashboard() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [assignments, setAssignments] = useState([]);
    const [stats, setStats] = useState({ pending: 0, confirmed: 0, collected: 0, processing: 0, todayCollections: 0 });
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [noteMap, setNoteMap] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [activeTab, setActiveTab] = useState('assignments');
    const [mapModal, setMapModal] = useState(null); // { address, lat, lng, patientName }
    const [geocoding, setGeocoding] = useState(false);

    const allowedRoles = ['admin', 'phlebotomist', 'employee', 'nurse', 'lab_partner'];

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
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
        { label: 'Today\'s Assignments', value: todayBookings.length, icon: <Calendar size={20}/>, color: '#3b82f6', bg: '#eff6ff' },
        { label: 'Today Collected', value: stats.todayCollections || 0, icon: <TestTube size={20}/>, color: '#10b981', bg: '#f0fdf4' },
        { label: 'Pending Pickup', value: (stats.pending || 0) + (stats.confirmed || 0), icon: <Timer size={20}/>, color: '#f59e0b', bg: '#fffbeb' },
        { label: 'In Processing', value: stats.processing || 0, icon: <Activity size={20}/>, color: '#8b5cf6', bg: '#f5f3ff' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0c1a2e 100%)', paddingTop: '5.5rem', paddingBottom: '2rem' }}>

            {/* ── In-Site Map Modal ── */}
            {mapModal && (
                <div onClick={() => setMapModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.12)', width: '100%', maxWidth: '700px', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
                        <div style={{ padding: '1.2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <div>
                                <div style={{ color: 'white', fontWeight: '800', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MapPin size={16} style={{ color: '#10b981' }} /> {mapModal.patientName} — Collection Point
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', fontWeight: '600', marginTop: '0.2rem' }}>{mapModal.address}</div>
                            </div>
                            <button onClick={() => setMapModal(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', display: 'flex' }}>
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
                        <div style={{ padding: '0.9rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Map size={12} /> Powered by OpenStreetMap · DiagnoLabs Internal Map
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Header ── */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(16,185,129,0.35)' }}>
                            <Bike size={26} color="white" />
                        </div>
                        <div>
                            <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
                                Sample Collector <span style={{ color: '#10b981' }}>Dashboard</span>
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', margin: 0, fontWeight: '600' }}>
                                Welcome, {user?.name || 'Collector'} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={fetchData}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}
                    >
                        <RefreshCw size={15} /> Refresh
                    </button>
                </div>
            </div>

            {/* ── Stats Cards ── */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem 1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    {STAT_CARDS.map((s, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', borderRadius: '18px', padding: '1.4rem 1.6rem', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '46px', height: '46px', borderRadius: '13px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                                {s.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white', lineHeight: 1 }}>{s.value}</div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', marginTop: '0.2rem' }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Tabs ── */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem 1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem', borderRadius: '14px', width: 'fit-content' }}>
                    {[
                        { id: 'assignments', label: 'All Assignments', icon: <ClipboardList size={15}/> },
                        { id: 'today', label: "Today's Route", icon: <Navigation size={15}/> },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === tab.id ? 'white' : 'transparent', color: activeTab === tab.id ? '#0f172a' : 'rgba(255,255,255,0.5)' }}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Main Content ── */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>

                {/* Search & Filter */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Search by patient name, phone, address or test..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ flex: 1, minWidth: '220px', padding: '0.65rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: '0.85rem', outline: 'none', fontWeight: '600' }}
                    />
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        style={{ padding: '0.65rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                        <option value="All" style={{ background: '#1e293b' }}>All Status</option>
                        <option value="Pending" style={{ background: '#1e293b' }}>Pending</option>
                        <option value="Confirmed" style={{ background: '#1e293b' }}>Confirmed</option>
                        <option value="Sample Collected" style={{ background: '#1e293b' }}>Collected</option>
                        <option value="Sample Processing" style={{ background: '#1e293b' }}>Processing</option>
                    </select>
                </div>

                {/* Assignment Cards */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem', color: 'rgba(255,255,255,0.4)' }}>
                        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem', display: 'block' }} />
                        <p style={{ fontWeight: '700' }}>Loading assignments...</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {(activeTab === 'today' ? todayBookings : filteredAssignments).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <TestTube size={40} style={{ color: 'rgba(255,255,255,0.2)', margin: '0 auto 1rem', display: 'block' }} />
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '700', fontSize: '1rem' }}>No assignments found</p>
                                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>All collections are up to date!</p>
                            </div>
                        ) : (
                            (activeTab === 'today' ? todayBookings : filteredAssignments).map(booking => {
                                const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG['Pending'];
                                const isUpdating = updatingId === booking._id;
                                const isCollected = booking.status === 'Sample Collected' || booking.status === 'Sample Processing' || booking.status === 'Report Uploaded';

                                return (
                                    <div key={booking._id} style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', borderRadius: '20px', border: `1px solid ${isCollected ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.08)'}`, padding: '1.4rem 1.6rem', transition: 'all 0.2s' }}>

                                        {/* Top Row */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <User size={18} color="rgba(255,255,255,0.5)" />
                                                </div>
                                                <div>
                                                    <div style={{ color: 'white', fontWeight: '800', fontSize: '0.98rem' }}>{booking.patient?.name || 'Patient'}</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', fontWeight: '600' }}>
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
                                            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '0.75rem 1rem' }}>
                                                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Tests</div>
                                                {booking.testDetails?.map((t, i) => (
                                                    <div key={i} style={{ color: 'white', fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                        <FlaskConical size={11} style={{ color: '#10b981' }} /> {t.testName}
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '0.75rem 1rem' }}>
                                                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Appointment</div>
                                                <div style={{ color: 'white', fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Calendar size={12} style={{ color: '#3b82f6' }} />
                                                    {booking.appointmentDate ? new Date(booking.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                                </div>
                                                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', fontWeight: '600', marginTop: '0.2rem', paddingLeft: '1.1rem' }}>
                                                    {booking.appointmentTime || 'N/A'}
                                                </div>
                                            </div>
                                            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '0.75rem 1rem' }}>
                                                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Collection Address</div>
                                                <div style={{ color: 'white', fontSize: '0.8rem', fontWeight: '700', display: 'flex', gap: '0.3rem' }}>
                                                    <MapPin size={12} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                                                    <span>{booking.sampleCollectionAddress || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '0.75rem 1rem' }}>
                                                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Amount</div>
                                                <div style={{ color: '#10b981', fontSize: '0.98rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                    <IndianRupee size={14} /> {booking.totalAmount?.toLocaleString('en-IN') || 0}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: booking.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b', fontWeight: '700', marginTop: '0.2rem' }}>
                                                    {booking.paymentStatus || 'Pending'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Collector Note */}
                                        {!isCollected && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>
                                                    <StickyNote size={11} /> Collector Note (Optional)
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Patient was fasting, used left arm vein..."
                                                    value={noteMap[booking._id] || ''}
                                                    onChange={e => setNoteMap(prev => ({ ...prev, [booking._id]: e.target.value }))}
                                                    style={{ width: '100%', padding: '0.6rem 0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.8rem', outline: 'none', fontWeight: '600', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                                            {/* In-Site Map Button */}
                                            <button
                                                onClick={() => openMap(booking)}
                                                disabled={geocoding}
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '10px', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                                            >
                                                {geocoding ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Map size={13} />} View Map
                                            </button>

                                            {/* Call Patient */}
                                            {booking.patient?.phone && (
                                                <a
                                                    href={`tel:${booking.patient.phone}`}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', fontWeight: '700', fontSize: '0.78rem', textDecoration: 'none' }}
                                                >
                                                    <Phone size={13} /> Call Patient
                                                </a>
                                            )}

                                            {/* Mark as Collected — main CTA */}
                                            {!isCollected && (
                                                <button
                                                    onClick={() => markCollected(booking._id)}
                                                    disabled={isUpdating}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.1rem', background: isUpdating ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: isUpdating ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
                                                >
                                                    {isUpdating ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Updating...</> : <><CheckCircle size={13} /> Mark Collected</>}
                                                </button>
                                            )}

                                            {/* If Confirmed, allow Send to Processing */}
                                            {booking.status === 'Sample Collected' && (
                                                <button
                                                    onClick={() => updateStatus(booking._id, 'Sample Processing')}
                                                    disabled={isUpdating}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '10px', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                                                >
                                                    <Zap size={13} /> Send to Lab <ArrowRight size={11} />
                                                </button>
                                            )}

                                            {/* Collected badge */}
                                            {isCollected && (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', fontWeight: '700', fontSize: '0.78rem' }}>
                                                    <CheckCircle size={13} /> {booking.status}
                                                </span>
                                            )}
                                        </div>

                                        {/* Existing note */}
                                        {booking.mentorNote && (
                                            <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.9rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', fontWeight: '600', display: 'flex', gap: '0.4rem' }}>
                                                <StickyNote size={13} style={{ flexShrink: 0, marginTop: '1px' }} /> {booking.mentorNote}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                input::placeholder { color: rgba(255,255,255,0.25); }
                select option { background: #1e293b; color: white; }
            `}</style>
        </div>
    );
}
