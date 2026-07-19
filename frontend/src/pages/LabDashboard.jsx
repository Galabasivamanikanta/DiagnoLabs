import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import {
    Activity,
    CheckCircle,
    Building2,
    Send,
    FlaskConical,
    Loader2,
    Settings,
    MapPin,
    Plus,
    Save,
    Phone,
    Mail,
    Search,
    Clock,
    User,
    ClipboardList,
    DollarSign,
    Users,
    FileText,
    TrendingUp,
    ShieldCheck,
    Bell,
    Check,
    Trash2,
    Edit2,
    AlertCircle,
    Download,
    Award,
    X
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import io from 'socket.io-client';

const LabDashboard = () => {
    const { user, setUser } = useContext(AuthContext);
    const location = useLocation();

    // Core States
    const [orders, setOrders] = useState([]);
    const [tests, setTests] = useState([]);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(null);
    const [labDetails, setLabDetails] = useState(null);
    const [labId, setLabId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    
    // Tab switching state
    const [activeTab, setActiveTab] = useState('workbench'); // 'workbench', 'catalog', 'reports', 'analytics', 'billing', 'profile'

    // Draft / Final report creator state
    const [reportForm, setReportForm] = useState({
        bookingId: '',
        glucose: '90',
        cholesterol: '180',
        hb: '14.2',
        isDraft: true,
        notes: ''
    });

    // Test Catalog Form
    const [catalogForm, setCatalogForm] = useState({
        id: '',
        testName: '',
        price: '',
        discountedPrice: '',
        category: 'Blood',
        description: '',
        turnaroundTime: '24 Hours'
    });
    const [showCatalogModal, setShowCatalogModal] = useState(false);
    const [catalogEditMode, setCatalogEditMode] = useState(false);

    // Profile forms
    const [labForm, setLabForm] = useState({
        name: '',
        city: '',
        address: '',
        latitude: '',
        longitude: ''
    });
    const [newPincode, setNewPincode] = useState('');
    const [newAccred, setNewAccred] = useState({
        label: '',
        certificateId: '',
        status: 'Active',
        expiryDate: ''
    });

    const [userForm, setUserForm] = useState({
        name: '',
        email: '',
        phone: ''
    });

    // Notifications
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'New Booking Assigned', desc: 'Patient John Doe - Complete Blood Count', time: '5m ago', read: false },
        { id: 2, title: 'Accreditation Renewal', desc: 'Your NABL certification is valid for 180 days.', time: '1h ago', read: true },
        { id: 3, title: 'Settlement Completed', desc: 'Payout of ₹14,250 processed successfully.', time: '1d ago', read: true }
    ]);

    const [savingLab, setSavingLab] = useState(false);
    const [savingUser, setSavingUser] = useState(false);
    const [savingCatalog, setSavingCatalog] = useState(false);

    const getHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    };

    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location]);

    const fetchLabInfoAndOrders = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/labs/my-lab`, getHeaders());
            setLabDetails(res.data);
            setLabId(res.data._id);
            
            // Populate forms
            setLabForm({
                name: res.data.name || '',
                city: res.data.city || '',
                address: res.data.address || '',
                latitude: res.data.location?.coordinates?.[1] || '',
                longitude: res.data.location?.coordinates?.[0] || ''
            });

            // Fetch bookings
            const ordersRes = await axios.get(`${API_BASE_URL}/api/bookings/lab/${res.data._id}`, getHeaders());
            setOrders(ordersRes.data);

            // Fetch lab's tests catalog
            const testsRes = await axios.get(`${API_BASE_URL}/api/tests/search?lab=${res.data._id}`);
            setTests(testsRes.data);
        } catch (err) {
            console.error("Error fetching lab partner data:", err);
        }
    };

    useEffect(() => {
        const socket = io(API_BASE_URL.replace('/api', ''));
        
        fetchLabInfoAndOrders();

        if (user) {
            setUserForm({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }

        socket.on('new_order', (data) => {
            if (labId && data.labId === labId) {
                fetchLabInfoAndOrders();
                setNotifications(prev => [
                    { id: Date.now(), title: 'Emergency booking assigned', desc: 'New sample collection request routing now.', time: 'Just now', read: false },
                    ...prev
                ]);
            }
        });

        return () => socket.disconnect();
    }, [user, labId]);

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
        if (!file) { alert("Please select a report file (PDF/Image) first!"); return; }
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
            alert("Accredited Report transmitted successfully!");
            setFile(null);
        } catch (err) {
            console.error(err);
            alert("Failed to upload report.");
        } finally {
            setUploading(null);
        }
    };

    // Test Catalog CRUD
    const handleCatalogSubmit = async (e) => {
        e.preventDefault();
        setSavingCatalog(true);
        try {
            const payload = {
                testName: catalogForm.testName,
                price: parseFloat(catalogForm.price),
                discountedPrice: parseFloat(catalogForm.discountedPrice) || parseFloat(catalogForm.price),
                category: catalogForm.category,
                description: catalogForm.description,
                turnaroundTime: catalogForm.turnaroundTime,
                lab: labId
            };

            if (catalogEditMode) {
                await axios.put(`${API_BASE_URL}/api/tests/${catalogForm.id}`, payload, getHeaders());
                alert("Catalog test updated!");
            } else {
                await axios.post(`${API_BASE_URL}/api/tests`, payload, getHeaders());
                alert("New test listed in catalog!");
            }
            setShowCatalogModal(false);
            fetchLabInfoAndOrders();
        } catch (err) {
            console.error(err);
            alert("Error saving test definition");
        } finally {
            setSavingCatalog(false);
        }
    };

    const deleteCatalogTest = async (testId) => {
        if (window.confirm("Are you sure you want to remove this test from your catalog?")) {
            try {
                await axios.delete(`${API_BASE_URL}/api/tests/${testId}`, getHeaders());
                fetchLabInfoAndOrders();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const openCreateCatalog = () => {
        setCatalogEditMode(false);
        setCatalogForm({
            id: '',
            testName: '',
            price: '',
            discountedPrice: '',
            category: 'Blood',
            description: '',
            turnaroundTime: '24 Hours'
        });
        setShowCatalogModal(true);
    };

    const openEditCatalog = (t) => {
        setCatalogEditMode(true);
        setCatalogForm({
            id: t._id,
            testName: t.testName,
            price: t.price,
            discountedPrice: t.discountedPrice || '',
            category: t.category || 'Blood',
            description: t.description || '',
            turnaroundTime: t.turnaroundTime || '24 Hours'
        });
        setShowCatalogModal(true);
    };

    // Profile & Accreditation Saving
    const saveLabProfile = async (e) => {
        e.preventDefault();
        setSavingLab(true);
        try {
            const payload = {
                name: labForm.name,
                city: labForm.city,
                address: labForm.address,
                location: {
                    type: 'Point',
                    coordinates: [parseFloat(labForm.longitude) || 0, parseFloat(labForm.latitude) || 0]
                }
            };
            const res = await axios.put(`${API_BASE_URL}/api/labs/${labId}`, payload, getHeaders());
            setLabDetails(res.data);
            alert("Facility compliance info updated successfully!");
        } catch (err) {
            console.error(err);
        } finally {
            setSavingLab(false);
        }
    };

    const addAccreditation = async (e) => {
        e.preventDefault();
        if (!newAccred.label || !newAccred.certificateId) {
            alert("Please fill in Label and Certificate ID.");
            return;
        }
        const updated = [...(labDetails?.accreditations || []), newAccred];
        try {
            const res = await axios.put(`${API_BASE_URL}/api/labs/${labId}`, { accreditations: updated }, getHeaders());
            setLabDetails(res.data);
            setNewAccred({ label: '', certificateId: '', status: 'Active', expiryDate: '' });
            alert("Compliance certificate registered successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to save certification.");
        }
    };

    const removeAccreditation = async (idx) => {
        if (!window.confirm("Remove this accreditation certificate?")) return;
        const updated = labDetails.accreditations.filter((_, i) => i !== idx);
        try {
            const res = await axios.put(`${API_BASE_URL}/api/labs/${labId}`, { accreditations: updated }, getHeaders());
            setLabDetails(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const addPincode = async () => {
        if (!newPincode.trim() || !labId) return;
        const updatedPincodes = [...(labDetails.servicePincodes || []), newPincode.trim()];
        try {
            const res = await axios.put(`${API_BASE_URL}/api/labs/${labId}`, { servicePincodes: updatedPincodes }, getHeaders());
            setLabDetails(res.data);
            setNewPincode('');
        } catch (err) {
            console.error(err);
        }
    };

    const removePincode = async (pin) => {
        if (!labId) return;
        const updatedPincodes = labDetails.servicePincodes.filter(p => p !== pin);
        try {
            const res = await axios.put(`${API_BASE_URL}/api/labs/${labId}`, { servicePincodes: updatedPincodes }, getHeaders());
            setLabDetails(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // Mock analytics generator
    const getAnalyticsData = () => {
        const weeklyCases = [
            { day: 'Mon', cases: 14, tat: 18 },
            { day: 'Tue', cases: 19, tat: 16 },
            { day: 'Wed', cases: 25, tat: 14 },
            { day: 'Thu', cases: 18, tat: 15 },
            { day: 'Fri', cases: 22, tat: 16 },
            { day: 'Sat', cases: 30, tat: 20 },
            { day: 'Sun', cases: 12, tat: 22 },
        ];
        
        const monthlyRevenue = [
            { week: 'Wk 1', amount: 34000 },
            { week: 'Wk 2', amount: 48000 },
            { week: 'Wk 3', amount: 56000 },
            { week: 'Wk 4', amount: 41000 },
        ];

        return { weeklyCases, monthlyRevenue };
    };

    const { weeklyCases, monthlyRevenue } = getAnalyticsData();

    // Filters
    const filteredOrders = orders.filter(order => {
        const matchesSearch = !searchQuery || (
            order.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.patient?.phone?.includes(searchQuery) ||
            order.testDetails?.some(t => t.testName.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusPipelines = (status) => {
        const steps = ['Received', 'Processing', 'Report Ready', 'Delivered'];
        let activeIdx = 0;
        if (status === 'Confirmed') activeIdx = 0;
        else if (status === 'Sample Collected') activeIdx = 1;
        else if (status === 'Sample Processing') activeIdx = 2;
        else if (status === 'Report Uploaded') activeIdx = 3;
        
        return { steps, activeIdx };
    };

    return (
        <div className="bg-slate-50 min-h-screen pt-28 pb-16 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* ── HEADER ACCREDITATION ROW ── */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-navy flex items-center justify-center text-gold">
                            <FlaskConical size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Diagnostic Workbench</h1>
                            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <Building2 size={13} /> {labDetails?.name || 'Authorized Lab Station'} 
                                <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 px-1.5 py-0.25 rounded text-[10px] font-bold border border-emerald-200">
                                    <ShieldCheck size={10} /> NABL Accredited
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Navigation Tab Menu */}
                    <div className="bg-slate-200/80 p-1 rounded-xl flex gap-1 border border-slate-300/40">
                        {[
                            { id: 'workbench', label: 'Samples Queue', icon: <ClipboardList size={14} /> },
                            { id: 'catalog', label: 'Test Catalog', icon: <FlaskConical size={14} /> },
                            { id: 'reports', label: 'Report Desk', icon: <FileText size={14} /> },
                            { id: 'analytics', label: 'Clinical TAT', icon: <Activity size={14} /> },
                            { id: 'billing', label: 'Billing Ledger', icon: <DollarSign size={14} /> },
                            { id: 'profile', label: 'Profile & Settings', icon: <User size={14} /> }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === t.id ? 'bg-navy text-white shadow' : 'text-slate-600 hover:text-navy hover:bg-slate-100'}`}
                            >
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── STATS ROW ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Active Specimen Queue', value: orders.filter(o => o.status !== 'Report Uploaded').length, desc: 'Samples awaiting report', icon: <Activity className="text-navy" />, bg: 'bg-blue-50' },
                        { label: 'Pending Processing', value: orders.filter(o => o.status === 'Sample Processing').length, desc: 'Analyzing in pathology', icon: <FlaskConical className="text-purple-600" />, bg: 'bg-purple-50' },
                        { label: 'Reports Transmitted', value: orders.filter(o => o.status === 'Report Uploaded').length, desc: 'Digitally verified PDFs', icon: <CheckCircle className="text-emerald-600" />, bg: 'bg-emerald-50' },
                        { label: 'Average Turnaround (TAT)', value: '14.2h', desc: 'Target TAT compliance: 98%', icon: <Clock className="text-amber-600" />, bg: 'bg-amber-50' }
                    ].map((s, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                            <div>
                                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">{s.label}</span>
                                <span className="text-2xl font-black text-slate-800 block mt-1 leading-none">{s.value}</span>
                                <span className="text-[10px] font-semibold text-slate-400 block mt-1">{s.desc}</span>
                            </div>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.bg}`}>
                                {s.icon}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── MAIN WORKSPACE CONTENT ── */}
                
                {/* Tab 1: Workbench Queue */}
                {activeTab === 'workbench' && (
                    <div className="space-y-6">
                        {/* Search & Filter Header */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                            <div className="flex flex-wrap gap-1">
                                {['All', 'Sample Collected', 'Sample Processing', 'Report Uploaded'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${statusFilter === status ? 'bg-navy border-navy text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {status === 'All' ? 'All Queue' : status === 'Report Uploaded' ? 'Ready/Delivered' : status}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by patient name, phone, or test..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:bg-white focus:outline-none w-full md:w-80"
                                />
                            </div>
                        </div>

                        {/* Active Pipeline Grid */}
                        {filteredOrders.length === 0 ? (
                            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                                <ClipboardList size={40} className="text-slate-300 mx-auto mb-3" />
                                <h4 className="text-sm font-bold text-slate-700">Specimen Queue Standby</h4>
                                <p className="text-xs text-slate-400 mt-1">There are no diagnostic requests matches in this category.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {filteredOrders.map(order => {
                                    const { steps, activeIdx } = statusPipelines(order.status);
                                    return (
                                        <div key={order._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-navy/20 transition-all">
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                
                                                {/* Patient & Test description */}
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                                                        <User size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-slate-800">{order.patient?.name}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">DL-{order._id.slice(-6).toUpperCase()}</span>
                                                        </div>
                                                        <span className="text-xs text-navy font-bold block mt-1">
                                                            {order.testDetails.map(t => t.testName).join(', ')}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Address: {order.sampleCollectionAddress}</span>
                                                    </div>
                                                </div>

                                                {/* Horizontal Pipeline Steps */}
                                                <div className="flex items-center gap-1 py-2 max-w-md w-full shrink-0">
                                                    {steps.map((step, idx) => (
                                                        <div key={step} className="flex-1 flex items-center">
                                                            <div className="flex flex-col items-center flex-1">
                                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${idx <= activeIdx ? 'bg-navy text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                                                    {idx < activeIdx ? <Check size={10} /> : idx + 1}
                                                                </div>
                                                                <span className={`text-[8px] font-extrabold mt-1 uppercase ${idx <= activeIdx ? 'text-navy' : 'text-slate-400'}`}>{step}</span>
                                                            </div>
                                                            {idx < steps.length - 1 && (
                                                                <div className={`h-[2px] w-full -mt-3 ${idx < activeIdx ? 'bg-navy' : 'bg-slate-100'}`} />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Operations Action Desk */}
                                                <div className="flex items-center justify-end gap-2 border-t lg:border-t-0 pt-3 lg:pt-0">
                                                    {order.status === 'Report Uploaded' ? (
                                                        <a href={order.reportUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg border border-slate-200 text-navy bg-slate-50 text-[11px] font-bold flex items-center gap-1 hover:bg-slate-100">
                                                            View Report <ChevronRight size={14} />
                                                        </a>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <select
                                                                value={order.status}
                                                                onChange={(e) => updateStatus(order._id, e.target.value)}
                                                                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 outline-none"
                                                            >
                                                                <option value="Confirmed">Received</option>
                                                                <option value="Sample Collected">Sample Collected</option>
                                                                <option value="Sample Processing">Processing</option>
                                                                <option value="Cancelled">Void Case</option>
                                                            </select>
                                                            
                                                            <label className="h-8 px-2.5 bg-white border border-dashed border-slate-300 rounded-lg flex items-center cursor-pointer text-xs font-bold text-slate-600 hover:bg-slate-50">
                                                                <FileUp size={13} className="mr-1 text-gold" /> {file ? 'Ready' : 'Attach'}
                                                                <input type="file" onChange={handleFileChange} accept=".pdf,.png,.jpg" className="hidden" />
                                                            </label>

                                                            <button
                                                                onClick={() => uploadReport(order._id)}
                                                                disabled={uploading === order._id}
                                                                className="h-8 px-3 rounded-lg bg-navy text-white text-xs font-bold flex items-center gap-1 hover:bg-navy-deep transition-all"
                                                            >
                                                                {uploading === order._id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                                                Transmit
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 2: Test Catalog Management */}
                {activeTab === 'catalog' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black text-slate-900">Laboratory Pathology Catalog</h2>
                                <p className="text-xs text-slate-500 font-semibold mt-0.5">Define tests offered, custom packaging, and pricing indices.</p>
                            </div>
                            <button
                                onClick={openCreateCatalog}
                                className="px-3 py-2 rounded-xl bg-navy text-white text-xs font-bold flex items-center gap-1.5 hover:bg-navy-deep"
                            >
                                <Plus size={15} /> Add Diagnostic Test
                            </button>
                        </div>

                        {/* Test Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tests.map(test => (
                                <div key={test._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase">{test.category || 'Blood'}</span>
                                            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1"><Clock size={11} /> {test.turnaroundTime || '24h TAT'}</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-800 mt-2">{test.testName}</h4>
                                        <p className="text-xs text-slate-400 font-semibold mt-1.5 leading-snug">{test.description || 'No diagnostic instructions set.'}</p>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                                        <div>
                                            <span className="text-xs text-slate-400 font-semibold line-through">₹{test.price}</span>
                                            <span className="text-base font-black text-emerald-600 block leading-none">₹{test.discountedPrice || test.price}</span>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button onClick={() => openEditCatalog(test)} className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100">
                                                <Edit2 size={13} />
                                            </button>
                                            <button onClick={() => deleteCatalogTest(test._id)} className="p-1.5 rounded-lg border border-red-100 text-red-600 hover:bg-red-50">
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add/Edit Modal */}
                        {showCatalogModal && (
                            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                                <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
                                    <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">
                                        <h3 className="font-black text-slate-900 text-sm">{catalogEditMode ? 'Modify Diagnostic Definition' : 'Define New Test'}</h3>
                                        <button onClick={() => setShowCatalogModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                                    </div>

                                    <form onSubmit={handleCatalogSubmit} className="p-5 space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Test Title</label>
                                            <input type="text" required value={catalogForm.testName} onChange={(e) => setCatalogForm({ ...catalogForm, testName: e.target.value })} placeholder="e.g. Thyroid Profile (T3, T4, TSH)" className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Standard Base Price (₹)</label>
                                                <input type="number" required value={catalogForm.price} onChange={(e) => setCatalogForm({ ...catalogForm, price: e.target.value })} placeholder="500" className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Discounted Offer (₹)</label>
                                                <input type="number" value={catalogForm.discountedPrice} onChange={(e) => setCatalogForm({ ...catalogForm, discountedPrice: e.target.value })} placeholder="450" className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pathology Specimen</label>
                                                <select value={catalogForm.category} onChange={(e) => setCatalogForm({ ...catalogForm, category: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold bg-white">
                                                    <option value="Blood">Blood Sample</option>
                                                    <option value="Urine">Urine Sample</option>
                                                    <option value="Stool">Stool Sample</option>
                                                    <option value="Biopsy">Biopsy / Swab</option>
                                                    <option value="Scan">Imaging Scan</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Turnaround Time (TAT)</label>
                                                <input type="text" required value={catalogForm.turnaroundTime} onChange={(e) => setCatalogForm({ ...catalogForm, turnaroundTime: e.target.value })} placeholder="e.g. 24 Hours" className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Diagnostic Guidelines</label>
                                            <textarea rows="2" value={catalogForm.description} onChange={(e) => setCatalogForm({ ...catalogForm, description: e.target.value })} placeholder="Fasting of 8-12 hours is recommended." className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold resize-none" />
                                        </div>

                                        <div className="border-t border-slate-200 pt-4 flex justify-end gap-2">
                                            <button type="button" onClick={() => setShowCatalogModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500">Cancel</button>
                                            <button type="submit" disabled={savingCatalog} className="px-4 py-2 bg-navy text-white rounded-lg text-xs font-bold flex items-center gap-1">
                                                {savingCatalog && <Loader2 size={13} className="animate-spin" />}
                                                Save Test
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 3: Report Desk (Draft / Final states) */}
                {activeTab === 'reports' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Queue selector */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                            <h3 className="text-sm font-black text-slate-800">Pending Pathology Reports</h3>
                            <div className="space-y-2 max-h-[480px] overflow-y-auto">
                                {orders.filter(o => o.status !== 'Report Uploaded').map(o => (
                                    <div
                                        key={o._id}
                                        onClick={() => setReportForm({ ...reportForm, bookingId: o._id })}
                                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${reportForm.bookingId === o._id ? 'border-navy bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-bold text-slate-800">{o.patient?.name}</span>
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">{o.status}</span>
                                        </div>
                                        <span className="text-[10px] text-navy font-bold block mt-1">{o.testDetails.map(t => t.testName).join(', ')}</span>
                                    </div>
                                ))}
                                {orders.filter(o => o.status !== 'Report Uploaded').length === 0 && (
                                    <div className="text-center text-slate-400 py-6 text-xs italic">All reports processed!</div>
                                )}
                            </div>
                        </div>

                        {/* Interactive Parameters compiler */}
                        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-sm font-black text-slate-800 mb-4">Pathology Parameter Verification</h3>
                            
                            {reportForm.bookingId ? (
                                <form onSubmit={(e) => { e.preventDefault(); alert("Report Draft Saved locally. Complete file attach and click Transmit to finalize."); }} className="space-y-4">
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold flex items-center justify-between text-slate-600">
                                        <span>Patient Case: DL-{reportForm.bookingId.slice(-6).toUpperCase()}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] ${reportForm.isDraft ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                            {reportForm.isDraft ? 'Draft Stage' : 'Approved State'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Glucose Level (mg/dL)</label>
                                            <input type="number" value={reportForm.glucose} onChange={(e) => setReportForm({ ...reportForm, glucose: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold" />
                                            <span className="text-[9px] text-slate-400 block mt-1">Normal: 70 - 100 mg/dL</span>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Total Cholesterol (mg/dL)</label>
                                            <input type="number" value={reportForm.cholesterol} onChange={(e) => setReportForm({ ...reportForm, cholesterol: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold" />
                                            <span className="text-[9px] text-slate-400 block mt-1">Normal: &lt; 200 mg/dL</span>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hemoglobin (g/dL)</label>
                                            <input type="number" step="any" value={reportForm.hb} onChange={(e) => setReportForm({ ...reportForm, hb: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold" />
                                            <span className="text-[9px] text-slate-400 block mt-1">Normal: 12.0 - 16.0 g/dL</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Clinical Remarks</label>
                                        <textarea rows="3" value={reportForm.notes} onChange={(e) => setReportForm({ ...reportForm, notes: e.target.value })} placeholder="Enter comments, critical values alerts, or diagnostic observations here..." className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold resize-none" />
                                    </div>

                                    <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                                        <div className="flex gap-2">
                                            <label className="h-9 px-3 bg-white border border-slate-300 rounded-lg flex items-center cursor-pointer text-xs font-bold text-slate-600 hover:bg-slate-50">
                                                <FileUp size={14} className="mr-1 text-gold" /> {file ? file.name.slice(0, 15) : 'Attach PDF Report'}
                                                <input type="file" onChange={handleFileChange} accept=".pdf,.png,.jpg" className="hidden" />
                                            </label>
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="submit" className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-xs font-bold">Save Draft</button>
                                            <button type="button" onClick={() => uploadReport(reportForm.bookingId)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                                                <CheckCircle size={13} /> Finalize & Transmit
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="text-center text-slate-400 py-16 text-xs italic">Select a pending pathology request from the sidebar queue.</div>
                            )}

                        </div>
                    </div>
                )}

                {/* Tab 4: Analytics Dashboard (TAT / Revenue Trends) */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* TAT Trend Chart */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                                <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-1.5"><Clock size={16} className="text-navy" /> Average Turnaround Time (TAT) Trend</h3>
                                <div style={{ height: '260px', width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={weeklyCases}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}h`} />
                                            <Tooltip formatter={(v) => [`${v} Hours`, 'Avg TAT']} />
                                            <Line type="monotone" dataKey="tat" stroke="#cc9a3d" strokeWidth={3} dot={{ stroke: '#cc9a3d', strokeWidth: 2, r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Weekly Cases load chart */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                                <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-1.5"><Activity size={16} className="text-emerald-600" /> Weekly Specimen Load (Cases)</h3>
                                <div style={{ height: '260px', width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={weeklyCases}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                            <Tooltip />
                                            <Bar dataKey="cases" fill="#0a1e46" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Revenue Performance Area */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-1.5"><TrendingUp size={16} className="text-purple-600" /> Monthly Settlement Volume</h3>
                            <div style={{ height: '240px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyRevenue}>
                                        <defs>
                                            <linearGradient id="colorSettlement" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0a1e46" stopOpacity={0.12}/>
                                                <stop offset="95%" stopColor="#0a1e46" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                                        <Tooltip formatter={(v) => [`₹${v}`, 'Settlements']} />
                                        <Area type="monotone" dataKey="amount" stroke="#0a1e46" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSettlement)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 5: Billing & Settlement Ledger */}
                {activeTab === 'billing' && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-6">
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Billing & Settlement Console</h2>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5">Track payout logs, payouts cycles, and partner revenue collection details.</p>
                        </div>

                        {/* Settlement metrics */}
                        <div className="grid grid-cols-3 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Unsettled Balance</span>
                                <span className="text-xl font-extrabold text-slate-700 block mt-1">₹4,250</span>
                                <span className="text-[9px] text-slate-400 block mt-0.5">Cycle: 20 Jul - 27 Jul</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Processing Settlements</span>
                                <span className="text-xl font-extrabold text-amber-600 block mt-1">₹6,800</span>
                                <span className="text-[9px] text-slate-400 block mt-0.5">Disbursal in 24 hours</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Settled (Lifetime)</span>
                                <span className="text-xl font-extrabold text-emerald-600 block mt-1">₹1,84,350</span>
                                <span className="text-[9px] text-slate-400 block mt-0.5">Direct Deposit to Bank Account</span>
                            </div>
                        </div>

                        {/* Settlement Ledger Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50 text-left">
                                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase">Disbursal Date</th>
                                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase">Cycle Reference</th>
                                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase">Accrued Volume</th>
                                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase">Payout Total</th>
                                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase text-right">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs font-bold text-slate-700">
                                    {[
                                        { date: '12 Jul 2026', ref: 'DL-SETT-0042', vol: 24, pay: '₹14,250', status: 'Completed' },
                                        { date: '05 Jul 2026', ref: 'DL-SETT-0041', vol: 30, pay: '₹18,900', status: 'Completed' },
                                        { date: '28 Jun 2026', ref: 'DL-SETT-0040', vol: 18, pay: '₹11,100', status: 'Completed' },
                                    ].map((s, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="p-3">{s.date}</td>
                                            <td className="p-3 text-navy">{s.ref}</td>
                                            <td className="p-3 text-slate-400">{s.vol} specimens</td>
                                            <td className="p-3 text-emerald-600">{s.pay}</td>
                                            <td className="p-3 text-right">
                                                <button className="p-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-100">
                                                    <Download size={13} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab 6: Profile & Accreditation Compliance */}
                {activeTab === 'profile' && (
                    <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-4 border-b border-slate-155 pb-6 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-navy text-gold text-2xl font-black flex items-center justify-center">
                                {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900">{user?.name || 'Authorized Staff'}</h3>
                                <div className="flex gap-1.5 items-center mt-1">
                                    <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border border-blue-200">
                                        Role: {user?.role === 'lab_partner' ? 'Lab Partner' : user?.role || 'Staff'}
                                    </span>
                                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border border-emerald-200">
                                        Status: ACTIVE
                                    </span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={saveUserProfile} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Full Representative Name</label>
                                <div className="relative">
                                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={userForm.name} 
                                        onChange={handleUserFormChange} 
                                        required 
                                        className="w-full border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs font-bold focus:outline-none focus:border-navy" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Registered Login Email</label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={userForm.email} 
                                        onChange={handleUserFormChange} 
                                        required 
                                        className="w-full border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs font-bold focus:outline-none focus:border-navy" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Contact Mobile Number</label>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="text" 
                                        name="phone"
                                        value={userForm.phone} 
                                        onChange={handleUserFormChange} 
                                        required 
                                        className="w-full border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs font-bold focus:outline-none focus:border-navy" 
                                    />
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-5 flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={savingUser}
                                    className="px-4 py-2 bg-navy hover:bg-navy-deep text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all"
                                >
                                    {savingUser ? <Loader2 size={13} className="animate-spin" /> : <Save size={14} />}
                                    Save Personal Profile
                                </button>
                            </div>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
};

export default LabDashboard;
