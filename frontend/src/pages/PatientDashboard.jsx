import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import {
    Calendar,
    Mail,
    Phone,
    MapPin,
    Download,
    ChevronRight,
    FileText,
    Activity,
    ArrowUpRight,
    Search,
    UserCircle,
    Clock,
    CheckCircle2,
    ShieldCheck,
    Sparkles
} from 'lucide-react';
import io from 'socket.io-client';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import PatientProfile from '../components/patient/PatientProfile';

const PatientDashboard = () => {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const socket = io(API_BASE_URL.replace('/api', ''));

        const fetchBookings = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/bookings/user/${user._id}`);
                setBookings(res.data);
                res.data.forEach(booking => socket.emit('join_order', booking._id));
            } catch (err) {
                console.error("Error fetching bookings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
        socket.on('status_update', () => fetchBookings());
        return () => socket.disconnect();
    }, [user, navigate]);

    const downloadInvoice = (booking) => {
        const doc = new jsPDF();
        
        // Brand Header
        doc.setFillColor(15, 23, 42); // Navy Blue
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('DiagnoLabs', 20, 25);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('AI-Powered Diagnostic Platform', 20, 32);
        
        // Invoice Meta
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(18);
        doc.text('INVOICE', 140, 60);
        doc.setFontSize(10);
        doc.text(`Invoice No: DH-${booking._id.slice(-6).toUpperCase()}`, 140, 68);
        doc.text(`Date: ${new Date(booking.appointmentDate).toLocaleDateString()}`, 140, 74);

        // Billing Details
        doc.setFont('helvetica', 'bold');
        doc.text('Patient Details:', 20, 60);
        doc.setFont('helvetica', 'normal');
        doc.text(user.name, 20, 68);
        doc.text(user.email, 20, 74);
        doc.text(user.phone || 'N/A', 20, 80);

        doc.setFont('helvetica', 'bold');
        doc.text('Laboratory Partner:', 20, 95);
        doc.setFont('helvetica', 'normal');
        doc.text(booking.lab?.name || 'Authorized Lab', 20, 103);
        doc.text(booking.lab?.city || 'Diagnostic Center', 20, 109);

        // Table
        const tableData = booking.testDetails.map(t => [
            t.testName,
            t.category || 'Diagnostic',
            `Rs. ${t.price || 0}`
        ]);

        doc.autoTable({
            startY: 125,
            head: [['Diagnostic Test', 'Category', 'Amount']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
            margin: { left: 20, right: 20 }
        });

        // Total
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`Total Payable: Rs. ${booking.totalAmount}`, 140, finalY);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('This is a computer-generated invoice and requires no signature.', 105, 280, null, null, 'center');
        doc.text('Thank you for choosing DiagnoLabs for your healthcare needs.', 105, 285, null, null, 'center');

        doc.save(`Invoice_DH_${booking._id.slice(-6).toUpperCase()}.pdf`);
    };

    if (!user) return null;

    return (
        <div style={{ background: 'var(--background)', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '5rem' }}>
            <div className="container animate-fade-in">

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', borderBottom: '2px solid var(--border)' }}>
                    <button 
                        onClick={() => setActiveTab('overview')} 
                        style={{ padding: '1rem 2rem', background: 'none', border: 'none', borderBottom: activeTab === 'overview' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '800', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s' }}>
                        <Activity size={20} /> Dashboard Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('profile')} 
                        style={{ padding: '1rem 2rem', background: 'none', border: 'none', borderBottom: activeTab === 'profile' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '800', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s' }}>
                        <UserCircle size={20} /> Identity & Document Manager
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <div className="animate-fade-in">
                        {/* Profile Header */}
                        <div className="glass-card" style={{ padding: '3.5rem', marginBottom: '3rem', position: 'relative', overflow: 'hidden', background: 'white' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '100%', background: 'linear-gradient(90deg, transparent, hsla(var(--primary-hsl), 0.04))', zIndex: 0 }}></div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                        <div style={{
                            width: '130px',
                            height: '130px',
                            borderRadius: '32px',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '3.5rem',
                            fontWeight: '900',
                            boxShadow: 'var(--shadow-premium)'
                        }}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
                                <h1 style={{ margin: 0, fontSize: '2.8rem', color: '#0f172a' }}>{user.name}</h1>
                                <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.6rem 1.2rem', borderRadius: '100px', fontWeight: '800', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ShieldCheck size={16} /> Verified Patient
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '3rem', color: 'var(--text-muted)', fontWeight: '700', fontSize: '1rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Mail size={18} /> {user.email}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Phone size={18} /> {user.phone || '9876543210'}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><MapPin size={18} /> {user.address?.street || 'Nagpur, India'}</span>
                            </div>
                        </div>
                        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ padding: '1.2rem 3rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            New Booking <ArrowUpRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem', marginBottom: '4rem' }}>
                    <div className="glass-card" style={{ padding: '2.5rem', background: 'white' }}>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: '#0f172a' }}>
                            <Calendar size={24} className="text-primary" /> Active Appointments
                        </h3>
                        {bookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed').length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                <p style={{ color: 'var(--text-light)', fontWeight: '700', fontSize: '1.1rem' }}>No pending collections</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '1.25rem' }}>
                                {bookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed').map(b => (
                                    <div key={b._id} style={{ padding: '1.5rem', background: 'var(--background)', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>{b.testDetails[0].testName}</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Clock size={14} /> Scheduled for Tomorrow
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-light" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="glass-card" style={{ padding: '2.5rem', background: 'white' }}>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: '#0f172a' }}>
                            <Activity size={24} className="text-primary" /> Health Overview
                        </h3>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <div style={{ flex: 1, padding: '2rem 1.5rem', background: '#f0fdf4', borderRadius: '24px', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#166534', marginBottom: '0.25rem' }}>{bookings.length}</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Tests</div>
                            </div>
                            <div style={{ flex: 1, padding: '2rem 1.5rem', background: '#eff6ff', borderRadius: '24px', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#1e40af', marginBottom: '0.25rem' }}>{bookings.filter(b => b.status === 'Report Uploaded').length}</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '1px' }}>Available Reports</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '2.2rem', color: '#0f172a' }}>Electronic Health Records</h2>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                        <input
                            type="text"
                            placeholder="Find a specific report..."
                            style={{
                                padding: '0.8rem 1rem 0.8rem 2.8rem',
                                borderRadius: '14px',
                                border: '1px solid var(--border)',
                                minWidth: '300px',
                                fontWeight: '600',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '8rem 0' }}>
                        <div style={{ width: '50px', height: '50px', border: '5px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="glass-card" style={{ padding: '6rem 4rem', textAlign: 'center', background: 'white' }}>
                        <div style={{ width: '80px', height: '80px', background: 'var(--border)', color: 'var(--text-light)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem' }}>
                            <FileText size={40} />
                        </div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>No health records yet</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>Your diagnostic history will appear here once you book and complete your first laboratory test.</p>
                    </div>
                ) : (
                    <div className="glass-card" style={{ overflow: 'hidden', padding: 0, background: 'white', border: '1px solid var(--border)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#fafafa' }}>
                                <tr>
                                    <th style={{ padding: '2rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Portfolio Details</th>
                                    <th style={{ padding: '2rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Partner Lab</th>
                                    <th style={{ padding: '2rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Current Status</th>
                                    <th style={{ padding: '2rem', textAlign: 'right', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking, idx) => (
                                    <tr key={booking._id} style={{ borderBottom: idx === bookings.length - 1 ? 'none' : '1px solid var(--border)' }}>
                                        <td style={{ padding: '2.5rem 2rem' }}>
                                            <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#0f172a', marginBottom: '0.4rem' }}>
                                                {booking.testDetails.map(t => t.testName).join(', ')}
                                            </div>
                                            {booking.mentorNote && (
                                                <div style={{ 
                                                    marginTop: '1rem', 
                                                    padding: '1rem', 
                                                    background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', 
                                                    borderRadius: '16px', 
                                                    border: '1px solid #bae6fd',
                                                    display: 'flex',
                                                    gap: '0.75rem',
                                                    fontSize: '0.88rem',
                                                    color: '#0369a1',
                                                    fontWeight: '700',
                                                    lineHeight: '1.5'
                                                }}>
                                                    <Sparkles size={20} className="text-primary" style={{ flexShrink: 0 }} />
                                                    <div>
                                                        <div style={{ textTransform: 'uppercase', fontSize: '0.65rem', marginBottom: '0.2rem', opacity: 0.8 }}>Clinical Mentor Insight</div>
                                                        {booking.mentorNote}
                                                    </div>
                                                </div>
                                            )}
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                <ShieldCheck size={14} /> ID: DH-{booking._id.slice(-6).toUpperCase()} • ₹{booking.totalAmount}
                                            </div>

                                        </td>
                                        <td style={{ padding: '2.5rem 2rem' }}>
                                            <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>{booking.lab?.name || 'Authorized Lab'}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700' }}>In-home Sample Collection</div>
                                        </td>
                                        <td style={{ padding: '2.5rem 2rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {booking.status === 'Report Uploaded' ? <CheckCircle2 size={16} className="text-success" /> : <Clock size={16} className="text-warning" />}
                                                    <span style={{
                                                        fontSize: '0.8rem',
                                                        fontWeight: '800',
                                                        color: booking.status === 'Report Uploaded' ? '#166534' : '#92400e',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {booking.status}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '5px', height: '6px', width: '130px' }}>
                                                    {[1, 2, 3, 4].map(step => (
                                                        <div key={step} style={{
                                                            flex: 1,
                                                            borderRadius: '100px',
                                                            background: step <= (booking.status === 'Pending' ? 1 : booking.status === 'Confirmed' ? 2 : booking.status === 'Sample Collected' ? 3 : 4) ? 'var(--primary)' : 'var(--border)'
                                                        }}></div>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '2.5rem 2rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                                {booking.status === 'Report Uploaded' ? (
                                                    <a 
                                                        href={`${API_BASE_URL.replace('/api', '')}${booking.reportUrl}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="btn btn-primary" 
                                                        style={{ padding: '0.8rem 1.8rem', fontSize: '0.9rem', borderRadius: '14px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                                                    >
                                                        Report <Download size={18} />
                                                    </a>
                                                ) : (

                                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: '800', padding: '0.8rem 1.8rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid var(--border)' }}>Processing</span>
                                                )}
                                                <button 
                                                    onClick={() => downloadInvoice(booking)}
                                                    className="btn" 
                                                    style={{ 
                                                        padding: '0.8rem 1.2rem', 
                                                        fontSize: '0.9rem', 
                                                        borderRadius: '14px', 
                                                        background: 'white', 
                                                        border: '1px solid var(--border)',
                                                        display: 'inline-flex', 
                                                        alignItems: 'center', 
                                                        gap: '0.5rem',
                                                        color: 'var(--text-main)',
                                                        fontWeight: '800'
                                                    }}
                                                >
                                                    Invoice <FileText size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                </div>
                )}

                {activeTab === 'profile' && (
                    <PatientProfile bookings={bookings} onDownloadInvoice={downloadInvoice} />
                )}

            </div>
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default PatientDashboard;
