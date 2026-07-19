import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import {
    LayoutDashboard,
    MapPin,
    Plus,
    X,
    Navigation,
    Package,
    FileUp,
    ChevronRight,
    Search,
    Clock,
    User,
    ClipboardList,
    TrendingUp,
    PieChart as PieChartIcon,
    BarChart3,
    DollarSign,
    Users
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import io from 'socket.io-client';

const LabDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(null);
    const [labDetails, setLabDetails] = useState(null);
    const [newPincode, setNewPincode] = useState('');
    const [labId, setLabId] = useState(null);

    const getHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    };

    useEffect(() => {
        const socket = io(API_BASE_URL.replace('/api', ''));
        let activeLabId = null;

        const fetchLabInfoAndOrders = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/labs/my-lab`, getHeaders());
                setLabDetails(res.data);
                setLabId(res.data._id);
                activeLabId = res.data._id;
                
                // Fetch bookings for this lab
                const ordersRes = await axios.get(`${API_BASE_URL}/api/bookings/lab/${res.data._id}`, getHeaders());
                setOrders(ordersRes.data);
            } catch (err) {
                console.error("Error fetching lab partner data:", err);
            }
        };

        fetchLabInfoAndOrders();

        socket.on('new_order', (data) => {
            if (activeLabId && data.labId === activeLabId) {
                // Refresh orders
                axios.get(`${API_BASE_URL}/api/bookings/lab/${activeLabId}`, getHeaders())
                    .then(res => setOrders(res.data))
                    .catch(err => console.error(err));
            }
        });

        return () => socket.disconnect();
    }, []);

    const addPincode = async () => {
        if (!newPincode.trim() || !labId) return;
        const updatedPincodes = [...(labDetails.servicePincodes || []), newPincode.trim()];
        updateLabData({ servicePincodes: updatedPincodes });
        setNewPincode('');
    };

    const removePincode = async (pin) => {
        if (!labId) return;
        const updatedPincodes = labDetails.servicePincodes.filter(p => p !== pin);
        updateLabData({ servicePincodes: updatedPincodes });
    };

    const updateLabData = async (data) => {
        if (!labId) return;
        try {
            const res = await axios.put(`${API_BASE_URL}/api/labs/${labId}`, data, getHeaders());
            setLabDetails(res.data);
        } catch (err) {
            console.error("Error updating lab details:", err);
        }
    };

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const updateStatus = async (bookingId, newStatus) => {
        try {
            await axios.put(`${API_BASE_URL}/api/bookings/${bookingId}`, { status: newStatus }, getHeaders());
            setOrders(prev => prev.map(order => order._id === bookingId ? { ...order, status: newStatus } : order));
        } catch (err) {
            console.error(err);
        }
    };

    const uploadReport = async (bookingId) => {
        if (!file) { alert("Please select a file first!"); return; }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bookingId', bookingId);
        
        const token = localStorage.getItem('token');
        try {
            setUploading(bookingId);
            const res = await axios.post(`${API_BASE_URL}/api/upload`, formData, { 
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                } 
            });
            setOrders(prev => prev.map(order => order._id === bookingId ? { ...order, status: 'Report Uploaded', reportUrl: res.data.url } : order));
            alert("Report Sent to Patient successfully!");
            setFile(null);
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(null);
        }
    };

    // Prepare Analytics Data
    const getChartData = () => {
        const revenueMap = {};
        const testMap = {};
        
        orders.forEach(order => {
            const date = new Date(order.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            revenueMap[date] = (revenueMap[date] || 0) + (order.totalAmount || 0);
            
            order.testDetails.forEach(test => {
                testMap[test.testName] = (testMap[test.testName] || 0) + 1;
            });
        });

        const revenueData = Object.entries(revenueMap).map(([date, amount]) => ({ date, amount })).reverse().slice(0, 7).reverse();
        const testData = Object.entries(testMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5);
        
        return { revenueData, testData };
    };

    const { revenueData, testData } = getChartData();
    const COLORS = ['#0ea5e9', '#2563eb', '#8b5cf6', '#d946ef', '#f43f5e'];

    return (
        <div style={{ background: 'var(--background)', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '5rem' }}>
            <div className="container">
                {/* Header Card */}
                <div className="glass-card" style={{ padding: '3rem', marginBottom: '3rem', background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--text-main)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <LayoutDashboard size={40} />
                            </div>
                            <div>
                                <h1 style={{ margin: 0, fontSize: '2.4rem', color: '#0f172a' }}>Partner Workspace</h1>
                                <p style={{ color: 'var(--text-muted)', fontWeight: '700', margin: 0 }}>Managing <span className="text-gradient">{labDetails?.name}</span></p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>License ID</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)' }}>#{myLabId.slice(-8).toUpperCase()}</div>
                        </div>
                    </div>
                </div>

                {/* Analytics & Insights Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2.5rem', marginBottom: '4rem' }}>
                    <div className="glass-card" style={{ padding: '2.5rem', background: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '1rem', color: '#0f172a' }}>
                                <TrendingUp size={24} className="text-primary" /> Revenue Velocity
                            </h3>
                            <div style={{ background: '#f0fdf4', color: '#166534', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>
                                +12.4% vs last week
                            </div>
                        </div>
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => [`₹${value}`, 'Revenue']}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '2.5rem', background: 'white' }}>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: '#0f172a' }}>
                            <BarChart3 size={24} className="text-primary" /> Test Distribution
                        </h3>
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={testData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={100} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                                        {testData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Status Counter Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                    <div className="glass-card" style={{ padding: '2rem', background: 'white', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign size={28} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>₹{orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0)}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Portfolio Value</div>
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: '2rem', background: 'white', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={28} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>{orders.length}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Acquired Patients</div>
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: '2rem', background: 'white', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={28} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>{orders.filter(o => o.status === 'Report Uploaded').length}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed Pipelines</div>
                        </div>
                    </div>
                </div>

                {/* Configuration Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem', marginBottom: '4rem' }}>
                    {/* Pincode Manager */}
                    <div className="glass-card" style={{ padding: '2.5rem', background: 'white' }}>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', color: '#0f172a' }}>
                            <MapPin size={24} className="text-primary" /> Service Jurisdictions
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem', fontWeight: '600' }}>Manage regional coverage for diagnostic home collection.</p>

                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter area pincode"
                                value={newPincode}
                                onChange={(e) => setNewPincode(e.target.value)}
                                style={{ flex: 1, borderRadius: '12px' }}
                            />
                            <button className="btn btn-primary" onClick={addPincode} style={{ borderRadius: '12px', padding: '0 1.5rem' }}>
                                <Plus size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {labDetails?.servicePincodes?.map(pin => (
                                <div key={pin} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: 'var(--background)', borderRadius: '100px', border: '1px solid var(--border)', fontWeight: '800', fontSize: '0.9rem' }}>
                                    {pin}
                                    <X size={16} onClick={() => removePincode(pin)} style={{ cursor: 'pointer', color: 'var(--danger)' }} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Geolocation Manager */}
                    <div className="glass-card" style={{ padding: '2.5rem', background: 'white' }}>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', color: '#0f172a' }}>
                            <Navigation size={24} className="text-primary" /> Precise Geolocation
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem', fontWeight: '600' }}>Maintain high-accuracy coordinates for proximity-based discovery.</p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-light)', textTransform: 'uppercase' }}>Latitude</label>
                                <input type="number" className="form-input" value={labDetails?.location?.coordinates?.[1] || ''} onChange={(e) => updateLabData({ location: { type: 'Point', coordinates: [labDetails?.location?.coordinates?.[0] || 0, parseFloat(e.target.value)] } })} style={{ borderRadius: '12px', padding: '0.6rem' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-light)', textTransform: 'uppercase' }}>Longitude</label>
                                <input type="number" className="form-input" value={labDetails?.location?.coordinates?.[0] || ''} onChange={(e) => updateLabData({ location: { type: 'Point', coordinates: [parseFloat(e.target.value), labDetails?.location?.coordinates?.[1] || 0] } })} style={{ borderRadius: '12px', padding: '0.6rem' }} />
                            </div>
                        </div>

                        <button className="btn" style={{ width: '100%', background: 'var(--background)', color: 'var(--text-main)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontWeight: '800', borderRadius: '12px' }} onClick={() => navigator.geolocation.getCurrentPosition((pos) => updateLabData({ location: { type: 'Point', coordinates: [pos.coords.longitude, pos.coords.latitude] } }))}>
                            <TrendingUp size={18} /> Resync to Current Location
                        </button>
                    </div>
                </div>

                {/* Orders Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '2.2rem', color: '#0f172a' }}>Inbound Medical Orders</h2>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                        <input type="text" placeholder="Filter by patient or test..." style={{ padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '14px', border: '1px solid var(--border)', minWidth: '320px', fontWeight: '600', outline: 'none' }} />
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="glass-card" style={{ padding: '6rem 4rem', textAlign: 'center', background: 'white' }}>
                        <ClipboardList size={60} style={{ color: 'var(--border)', marginBottom: '1.5rem' }} />
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Standby Mode</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No medical collection requests have been assigned to your lab yet.</p>
                    </div>
                ) : (
                    <div className="glass-card" style={{ overflow: 'hidden', padding: 0, background: 'white', border: '1px solid var(--border)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#fafafa' }}>
                                <tr>
                                    <th style={{ padding: '2rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Date</th>
                                    <th style={{ padding: '2rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Patient Info</th>
                                    <th style={{ padding: '2rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Diagnostic Test</th>
                                    <th style={{ padding: '2rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Workflow</th>
                                    <th style={{ padding: '2rem', textAlign: 'right', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Reporting</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order, idx) => (
                                    <tr key={order._id} style={{ borderBottom: idx === orders.length - 1 ? 'none' : '1px solid var(--border)' }}>
                                        <td style={{ padding: '2.5rem 2rem' }}>
                                            <div style={{ fontWeight: '800', color: '#0f172a' }}>{new Date(order.appointmentDate).toLocaleDateString()}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: '700' }}><Clock size={14} /> Assigned Today</div>
                                        </td>
                                        <td style={{ padding: '2.5rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <User size={20} className="text-muted" />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '800', color: '#0f172a' }}>{order.patient?.name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700' }}>{order.patient?.phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '2.5rem 2rem' }}>
                                            <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{order.testDetails.map(t => t.testName).join(', ')}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: '900' }}>₹{order.totalAmount} PAYABLE</div>
                                        </td>
                                        <td style={{ padding: '2.5rem 2rem' }}>
                                            {order.status === 'Report Uploaded' ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', color: '#166534', padding: '0.6rem 1.2rem', borderRadius: '100px', fontWeight: '800', fontSize: '0.75rem', width: 'fit-content' }}>
                                                    COMPLETED
                                                </div>
                                            ) : (
                                                <select className="form-input" value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)} style={{ padding: '0.6rem', fontSize: '0.85rem', fontWeight: '800', borderRadius: '10px', background: 'white', border: '1px solid var(--primary-light)', color: 'var(--primary)' }}>
                                                    <option value="Pending">Pending Assignment</option>
                                                    <option value="Confirmed">Confirmed Appointment</option>
                                                    <option value="Sample Collected">Collection Completed</option>
                                                    <option value="Sample Processing">Sample Processing</option>
                                                    <option value="Cancelled">Void Appointment</option>
                                                </select>
                                            )}
                                        </td>
                                        <td style={{ padding: '2.5rem 2rem', textAlign: 'right' }}>
                                            {order.status === 'Report Uploaded' ? (
                                                <a href={order.reportUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    Archived Portfolio <ChevronRight size={16} />
                                                </a>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                                    <label style={{ height: '42px', padding: '0 1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '800' }}>
                                                        <FileUp size={18} style={{ marginRight: '0.75rem' }} /> {file ? 'Ready to Sync' : 'Attach PDF'}
                                                        <input type="file" onChange={handleFileChange} accept=".pdf,.jpg,.png" style={{ display: 'none' }} />
                                                    </label>
                                                    <button onClick={() => uploadReport(order._id)} className="btn btn-primary" disabled={uploading === order._id} style={{ height: '42px', padding: '0 1.5rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                                                        {uploading === order._id ? 'Uploading...' : 'Transmit Report'}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LabDashboard;
