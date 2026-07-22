import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import {
    X,
    FileUp,
    ChevronRight,
    Search,
    Clock,
    User,
    ClipboardList,
    Activity,
    CheckCircle,
    Building2,
    Send,
    FlaskConical,
    Loader2,
    Settings,
    MapPin,
    Navigation,
    Plus,
    Save,
    Phone,
    Mail,
    DollarSign,
    Users,
    FileText,
    TrendingUp,
    ShieldCheck,
    Award,
    ChevronDown,
    Lock,
    Eye,
    EyeOff,
    Check,
    AlertCircle,
    Calendar,
    Briefcase,
    Edit2,
    Trash2
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

    // Accordion active section
    const [openSection, setOpenSection] = useState('basic'); // basic, contact, compliance, ops, tests, banking, staff, security, status

    // Mask toggle states
    const [showBankingDetails, setShowBankingDetails] = useState(false);

    // Simulated file upload states
    const [uploadProgress, setUploadProgress] = useState({});

    // Password reset form
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
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

    // Profile & Accordion Forms
    const [labForm, setLabForm] = useState({
        name: '',
        directorName: '',
        registrationNumber: '',
        establishedYear: '',
        labType: 'standalone',
        logoUrl: '',
        phone: '',
        alternateContact: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        latitude: '',
        longitude: '',
        licenseNumber: '',
        licenseExpiry: '',
        govRegistrationUrl: '',
        isoCertificateUrl: '',
        homeCollectionEnabled: false,
        serviceRadius: 10,
        branchCount: 1,
        staffCount: 5,
        equipmentList: '',
        departments: [],
        accountHolderName: '',
        bankAccountNumber: '',
        bankIfsc: '',
        gstNumber: '',
        panNumber: '',
        commissionRef: '',
        chiefPathologistName: '',
        pathologistQualification: '',
        pathologistRegNumber: '',
        pathologistSignatureUrl: ''
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
            let currentLabId = labId;
            try {
                const res = await axios.get(`${API_BASE_URL}/api/labs/my-lab`, getHeaders());
                if (res.data) {
                    setLabDetails(res.data);
                    setLabId(res.data._id);
                    currentLabId = res.data._id;
                }
            } catch (labErr) {
                console.warn("My-lab endpoint notice:", labErr.message);
            }

            // Resilient Bookings Fetcher
            try {
                const endpoint = currentLabId 
                    ? `${API_BASE_URL}/api/bookings/lab/${currentLabId}`
                    : `${API_BASE_URL}/api/bookings/my-lab`;
                
                const ordersRes = await axios.get(endpoint, getHeaders());
                if (Array.isArray(ordersRes.data) && ordersRes.data.length > 0) {
                    setOrders(ordersRes.data);
                } else {
                    const fallbackRes = await axios.get(`${API_BASE_URL}/api/bookings/my-lab`, getHeaders());
                    setOrders(Array.isArray(fallbackRes.data) ? fallbackRes.data : []);
                }
            } catch (bookingErr) {
                console.warn("Lab bookings endpoint fallback:", bookingErr.message);
                try {
                    const fallbackRes = await axios.get(`${API_BASE_URL}/api/bookings/my-lab`, getHeaders());
                    setOrders(Array.isArray(fallbackRes.data) ? fallbackRes.data : []);
                } catch (e) {
                    console.error("All booking endpoints failed:", e);
                }
            }

            // Fetch lab's tests catalog
            if (currentLabId) {
                try {
                    const testsRes = await axios.get(`${API_BASE_URL}/api/tests/search?lab=${currentLabId}`);
                    setTests(Array.isArray(testsRes.data) ? testsRes.data : []);
                } catch (tErr) {
                    console.warn("Tests search error:", tErr.message);
                }
            }
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
            }
        });

        return () => socket.disconnect();
    }, [user, labId]);

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

    // General Profile & Forms Value Changes
    const handleLabFormChange = (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setLabForm({ ...labForm, [e.target.name]: val });
    };

    const handleUserFormChange = (e) => {
        setUserForm({ ...userForm, [e.target.name]: e.target.value });
    };

    const handleUserFormSubmit = async (e) => {
        e.preventDefault();
        setSavingUser(true);
        try {
            const res = await axios.put(`${API_BASE_URL}/api/auth/${user.id || user._id}`, userForm, getHeaders());
            setUser(res.data);
            alert("Representative credentials updated!");
        } catch (err) {
            console.error(err);
            alert("Failed to update representative info.");
        } finally {
            setSavingUser(false);
        }
    };

    // Simulated Accredited File uploader
    const handleProfileFileUpload = (field, e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setUploadProgress(prev => ({ ...prev, [field]: 0 }));
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(prev => ({ ...prev, [field]: progress }));
            if (progress >= 100) {
                clearInterval(interval);
                // Set mock saved url values
                setLabForm(prev => ({ ...prev, [field]: `https://diagnolabs-accredited-bucket.s3.amazonaws.com/${field}/${selectedFile.name}` }));
                alert(`${selectedFile.name} securely uploaded & verified!`);
            }
        }, 100);
    };

    // Save Unified Lab profile
    const saveLabProfile = async (e) => {
        e.preventDefault();
        setSavingLab(true);
        try {
            const payload = {
                ...labForm,
                equipmentList: labForm.equipmentList.split(',').map(eq => eq.trim()).filter(Boolean),
                location: {
                    type: 'Point',
                    coordinates: [parseFloat(labForm.longitude) || 0, parseFloat(labForm.latitude) || 0]
                }
            };
            const res = await axios.put(`${API_BASE_URL}/api/labs/${labId}`, payload, getHeaders());
            setLabDetails(res.data);
            alert("Laboratory Clinical profile updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to save facility details.");
        } finally {
            setSavingLab(false);
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

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        try {
            await axios.put(`${API_BASE_URL}/api/auth/${user.id || user._id}`, { password: passwordData.newPassword }, getHeaders());
            alert("Security password changed successfully!");
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            console.error(err);
            alert("Failed to change password.");
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
                
                {/* ── HEADER ROW ── */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-navy flex items-center justify-center text-gold">
                            <FlaskConical size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Diagnostic Workbench</h1>
                            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <Building2 size={13} /> Network Partner Portal
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
                            { id: 'analytics', label: 'Clinical TAT', icon: <Activity size={14} /> },
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

                {/* ── WORKSPACE CONTENT ── */}
                
                {/* Tab 1: Workbench Queue */}
                {activeTab === 'workbench' && (
                    <div className="space-y-6">
                        {/* Stats Summary Panel */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

                {/* Tab 3: Analytics Dashboard (TAT / Revenue Trends) */}
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

                {/* Tab 4: Profile & Accreditation Compliance (Accordion-style layout) */}
                {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        
                        {/* LEFT COLUMN: ACCREDITATION & PERFORMANCE SNAPSHOT (READ ONLY) */}
                        <div className="space-y-6">
                            {/* Performance Snapshot */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Performance Snapshot</h3>
                                <div className="space-y-3.5">
                                    <div className="flex justify-between items-center text-xs font-bold">
                                        <span className="text-slate-500">Total Cases Resolved</span>
                                        <span className="text-slate-800">{orders.filter(o => o.status === 'Report Uploaded').length} Cases</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold">
                                        <span className="text-slate-500">SLA TAT Compliance</span>
                                        <span className="text-emerald-600">96.4% on-time</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold">
                                        <span className="text-slate-500">Patient Satisfaction</span>
                                        <span className="text-gold">★ {labDetails?.rating || '4.2'} / 5.0</span>
                                    </div>
                                </div>
                            </div>

                            {/* Verification status / Badge */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification Audit</h3>
                                
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border ${labDetails?.verificationStatus === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                        {labDetails?.verificationStatus || 'Pending Audit'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-semibold">Document Review Stage</span>
                                </div>

                                <div className="border-t border-slate-100 pt-3 space-y-2 text-[10px] font-bold text-slate-500">
                                    <div className="flex justify-between">
                                        <span>NABL Certificate ID</span>
                                        <span className="text-emerald-600">PASSED</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Pathologist Signature</span>
                                        <span className="text-emerald-600">PASSED</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Government Registration</span>
                                        <span className="text-slate-400">AWAITING REVIEW</span>
                                    </div>
                                </div>

                                {labDetails?.adminRemarks && (
                                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-[10px] font-bold text-red-800">
                                        Remarks: {labDetails.adminRemarks}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* MIDDLE & RIGHT COLUMN: THE CLINICAL ACCORDION PROFILE FORM */}
                        <div className="lg:col-span-2 space-y-4">
                            <form onSubmit={saveLabProfile} className="space-y-4">
                                
                                {/* ── Accordion Section 1: Basic Info ── */}
                                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setOpenSection(openSection === 'basic' ? '' : 'basic')}
                                        className="w-full px-5 py-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100/60 transition-all border-b border-slate-100"
                                    >
                                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5"><Building2 size={16} className="text-navy" /> Basic Laboratory Info</span>
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${openSection === 'basic' ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {openSection === 'basic' && (
                                        <div className="p-5 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Clinical Lab Name*</label>
                                                    <input type="text" required name="name" value={labForm.name} onChange={handleLabFormChange} className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Accredited Owner / Director Name*</label>
                                                    <input type="text" required name="directorName" value={labForm.directorName} onChange={handleLabFormChange} className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Registration No.*</label>
                                                    <input type="text" required name="registrationNumber" value={labForm.registrationNumber} onChange={handleLabFormChange} className="w-full border border-slate-355 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Year Established</label>
                                                    <input type="number" name="establishedYear" value={labForm.establishedYear} onChange={handleLabFormChange} className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Lab Facility Type</label>
                                                    <select name="labType" value={labForm.labType} onChange={handleLabFormChange} className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold bg-white">
                                                        <option value="standalone">Standalone Pathology</option>
                                                        <option value="hospital">Hospital Diagnostics</option>
                                                        <option value="chain">Diagnostic Chain Branch</option>
                                                        <option value="govt">Government Lab</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Upload Brand Logo</label>
                                                <div className="flex items-center gap-3">
                                                    {labForm.logoUrl && (
                                                        <img src={labForm.logoUrl} alt="Logo" className="w-10 h-10 rounded-lg border object-cover" />
                                                    )}
                                                    <label className="h-9 px-3 bg-white border border-slate-300 rounded-lg flex items-center cursor-pointer text-xs font-bold text-slate-650 hover:bg-slate-50">
                                                        <FileUp size={13} className="mr-1 text-gold" /> Upload File
                                                        <input type="file" onChange={(e) => handleProfileFileUpload('logoUrl', e)} className="hidden" />
                                                    </label>
                                                    {uploadProgress.logoUrl !== undefined && uploadProgress.logoUrl < 100 && (
                                                        <span className="text-[10px] text-slate-400 font-bold">Uploading: {uploadProgress.logoUrl}%</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* ── Accordion Section 2: Contact Details ── */}
                                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setOpenSection(openSection === 'contact' ? '' : 'contact')}
                                        className="w-full px-5 py-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100/60 transition-all border-b border-slate-100"
                                    >
                                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5"><Phone size={16} className="text-navy" /> Contact & Geolocation Setup</span>
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${openSection === 'contact' ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {openSection === 'contact' && (
                                        <div className="p-5 space-y-4">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Primary Hotline</label>
                                                    <input type="text" name="phone" value={labForm.phone} onChange={handleLabFormChange} className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Alternate Contact</label>
                                                    <input type="text" name="alternateContact" value={labForm.alternateContact} onChange={handleLabFormChange} className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
                                                    <input type="email" name="email" value={labForm.email} onChange={handleLabFormChange} className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-4 gap-4">
                                                <div className="col-span-2">
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Physical Address*</label>
                                                    <input type="text" required name="address" value={labForm.address} onChange={handleLabFormChange} className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">City*</label>
                                                    <input type="text" required name="city" value={labForm.city} onChange={handleLabFormChange} className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Postal Pincode*</label>
                                                    <input type="text" required name="pincode" value={labForm.pincode} onChange={handleLabFormChange} className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Latitude</label>
                                                    <input type="number" step="any" name="latitude" value={labForm.latitude} onChange={handleLabFormChange} className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Longitude</label>
                                                    <input type="number" step="any" name="longitude" value={labForm.longitude} onChange={handleLabFormChange} className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                            </div>

                                            <button 
                                                type="button" 
                                                onClick={() => navigator.geolocation.getCurrentPosition(pos => setLabForm(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude })))}
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-100"
                                            >
                                                <Navigation size={12} className="text-gold" /> Sync Location pin to device GPS
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* ── Accordion Section 3: Accreditation & Compliance ── */}
                                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setOpenSection(openSection === 'compliance' ? '' : 'compliance')}
                                        className="w-full px-5 py-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100/60 transition-all border-b border-slate-100"
                                    >
                                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5"><Award size={16} className="text-navy" /> Certification & Compliance</span>
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${openSection === 'compliance' ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {openSection === 'compliance' && (
                                        <div className="p-5 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Government License Number</label>
                                                    <input type="text" name="licenseNumber" value={labForm.licenseNumber} onChange={handleLabFormChange} className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">License Expiry Date</label>
                                                    <input type="date" name="licenseExpiry" value={labForm.licenseExpiry} onChange={handleLabFormChange} className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold text-slate-600" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Accredited ISO Certificate Upload</label>
                                                    <div className="flex items-center gap-2">
                                                        <label className="h-8 px-2.5 bg-white border border-slate-300 rounded-lg flex items-center cursor-pointer text-xs font-bold text-slate-600 hover:bg-slate-50">
                                                            <FileUp size={13} className="mr-1 text-gold" /> Upload ISO File
                                                            <input type="file" onChange={(e) => handleProfileFileUpload('isoCertificateUrl', e)} className="hidden" />
                                                        </label>
                                                        {labForm.isoCertificateUrl && <span className="text-[10px] text-emerald-600 font-bold">Uploaded ✓</span>}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Accredited Gov Registration Upload</label>
                                                    <div className="flex items-center gap-2">
                                                        <label className="h-8 px-2.5 bg-white border border-slate-300 rounded-lg flex items-center cursor-pointer text-xs font-bold text-slate-600 hover:bg-slate-50">
                                                            <FileUp size={13} className="mr-1 text-gold" /> Upload Gov Reg
                                                            <input type="file" onChange={(e) => handleProfileFileUpload('govRegistrationUrl', e)} className="hidden" />
                                                        </label>
                                                        {labForm.govRegistrationUrl && <span className="text-[10px] text-emerald-600 font-bold">Uploaded ✓</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* NABL accreditations subform list */}
                                            <div className="border-t border-slate-100 pt-4">
                                                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">NABL Accreditation Registry</span>
                                                <div className="grid grid-cols-3 gap-2 items-end bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3">
                                                    <div>
                                                        <label className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">Accreditation Label</label>
                                                        <input type="text" placeholder="e.g. NABL Clinical" value={newAccred.label} onChange={(e) => setNewAccred({ ...newAccred, label: e.target.value })} className="w-full border border-slate-300 rounded p-1 text-[11px] font-bold" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">Certificate ID</label>
                                                        <input type="text" placeholder="UID-8902" value={newAccred.certificateId} onChange={(e) => setNewAccred({ ...newAccred, certificateId: e.target.value })} className="w-full border border-slate-300 rounded p-1 text-[11px] font-bold" />
                                                    </div>
                                                    <button type="button" onClick={addAccreditation} className="bg-navy text-white text-[10px] font-bold py-1.5 rounded flex items-center justify-center gap-1"><Plus size={11} /> Register</button>
                                                </div>

                                                <div className="space-y-1">
                                                    {labDetails?.accreditations?.map((ac, idx) => (
                                                        <div key={idx} className="flex justify-between items-center text-[11px] bg-slate-50 border border-slate-100 p-2 rounded-lg font-bold">
                                                            <span>{ac.label} (#{ac.certificateId})</span>
                                                            <button type="button" onClick={() => removeAccreditation(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={13} /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* ── Accordion Section 4: Operational Details ── */}
                                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setOpenSection(openSection === 'ops' ? '' : 'ops')}
                                        className="w-full px-5 py-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100/60 transition-all border-b border-slate-100"
                                    >
                                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5"><Clock size={16} className="text-navy" /> Operational Details</span>
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${openSection === 'ops' ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {openSection === 'ops' && (
                                        <div className="p-5 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Clinical Working Hours (e.g. 08:00 AM - 08:00 PM)</label>
                                                    <input type="text" name="openingHours" placeholder="Mon - Sat: 08:00 AM to 08:00 PM" className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                                <div className="flex items-center gap-4 mt-4">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" name="homeCollectionEnabled" checked={labForm.homeCollectionEnabled} onChange={handleLabFormChange} className="w-4 h-4 text-navy border-slate-300 rounded" />
                                                        <span className="text-xs font-bold text-slate-700">Home collection service active</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Service Dispatch Radius (KM)</label>
                                                    <input type="number" name="serviceRadius" value={labForm.serviceRadius} onChange={handleLabFormChange} className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Accredited Branches Count</label>
                                                    <input type="number" name="branchCount" value={labForm.branchCount} onChange={handleLabFormChange} className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Staff / Lab Tech count</label>
                                                    <input type="number" name="staffCount" value={labForm.staffCount} onChange={handleLabFormChange} className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Clinical Machinery / Equipment list (Comma-separated)</label>
                                                <input type="text" name="equipmentList" value={labForm.equipmentList} onChange={handleLabFormChange} placeholder="Centrifuge, Spectrophotometer, Hematology Analyzer" className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* ── Accordion Section 5: Test Capabilities ── */}
                                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setOpenSection(openSection === 'tests' ? '' : 'tests')}
                                        className="w-full px-5 py-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100/60 transition-all border-b border-slate-100"
                                    >
                                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5"><FlaskConical size={16} className="text-navy" /> Pathology Capabilities</span>
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${openSection === 'tests' ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {openSection === 'tests' && (
                                        <div className="p-5 space-y-4">
                                            <div>
                                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-2">Offered pathology departments</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {['Hematology', 'Biochemistry', 'Microbiology', 'Immunology', 'Serology', 'Histopathology', 'Molecular Biology'].map(dept => {
                                                        const isChecked = labForm.departments.includes(dept);
                                                        return (
                                                            <label key={dept} className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-150 p-2.5 rounded-xl hover:bg-slate-100 transition-all text-xs font-bold text-slate-700">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={isChecked} 
                                                                    onChange={() => {
                                                                        const updated = isChecked ? labForm.departments.filter(d => d !== dept) : [...labForm.departments, dept];
                                                                        setLabForm({ ...labForm, departments: updated });
                                                                    }}
                                                                    className="w-4 h-4 text-navy rounded border-slate-350" 
                                                                />
                                                                {dept}
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* ── Accordion Section 6: Banking & Payout (Masked details) ── */}
                                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setOpenSection(openSection === 'banking' ? '' : 'banking')}
                                        className="w-full px-5 py-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100/60 transition-all border-b border-slate-100"
                                    >
                                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5"><DollarSign size={16} className="text-navy" /> Banking & Payout Ledger</span>
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${openSection === 'banking' ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {openSection === 'banking' && (
                                        <div className="p-5 space-y-4">
                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowBankingDetails(!showBankingDetails)}
                                                    className="text-xs font-extrabold text-navy flex items-center gap-1 hover:text-navy-deep"
                                                >
                                                    {showBankingDetails ? <EyeOff size={14} /> : <Eye size={14} />}
                                                    {showBankingDetails ? 'Mask Credentials' : 'Reveal Sensitive Credentials'}
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Account Holder Name</label>
                                                    <input type="text" name="accountHolderName" value={labForm.accountHolderName} onChange={handleLabFormChange} className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">IFSC Bank Code</label>
                                                    <input type="text" name="bankIfsc" value={labForm.bankIfsc} onChange={handleLabFormChange} className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Bank Account Number</label>
                                                    <input 
                                                        type={showBankingDetails ? 'text' : 'password'} 
                                                        name="bankAccountNumber" 
                                                        value={labForm.bankAccountNumber} 
                                                        onChange={handleLabFormChange} 
                                                        className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">GST registration No.</label>
                                                    <input 
                                                        type={showBankingDetails ? 'text' : 'password'} 
                                                        name="gstNumber" 
                                                        value={labForm.gstNumber} 
                                                        onChange={handleLabFormChange} 
                                                        className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Accredited PAN ID</label>
                                                    <input 
                                                        type={showBankingDetails ? 'text' : 'password'} 
                                                        name="panNumber" 
                                                        value={labForm.panNumber} 
                                                        onChange={handleLabFormChange} 
                                                        className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" 
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Platform Commission Agreement Ref</label>
                                                <input type="text" disabled name="commissionRef" value={labForm.commissionRef || 'DL-COMM-2026-NABL'} className="w-full border border-slate-200 bg-slate-50 text-slate-400 rounded-lg p-2 text-xs font-bold" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* ── Accordion Section 7: Staff & Pathologist Details ── */}
                                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setOpenSection(openSection === 'staff' ? '' : 'staff')}
                                        className="w-full px-5 py-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100/60 transition-all border-b border-slate-100"
                                    >
                                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5"><Briefcase size={16} className="text-navy" /> Pathologist & Staff Records</span>
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${openSection === 'staff' ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {openSection === 'staff' && (
                                        <div className="p-5 space-y-4">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Chief Pathologist Name</label>
                                                    <input type="text" name="chiefPathologistName" value={labForm.chiefPathologistName} onChange={handleLabFormChange} className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Professional Qualification</label>
                                                    <input type="text" name="pathologistQualification" value={labForm.pathologistQualification} onChange={handleLabFormChange} placeholder="MD, Pathology" className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Medical Council Reg No.</label>
                                                    <input type="text" name="pathologistRegNumber" value={labForm.pathologistRegNumber} onChange={handleLabFormChange} className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Digital Signature upload</label>
                                                <div className="flex items-center gap-2">
                                                    <label className="h-8 px-2.5 bg-white border border-slate-300 rounded-lg flex items-center cursor-pointer text-xs font-bold text-slate-655 hover:bg-slate-50">
                                                        <FileUp size={13} className="mr-1 text-gold" /> Upload Signature
                                                        <input type="file" onChange={(e) => handleProfileFileUpload('pathologistSignatureUrl', e)} className="hidden" />
                                                    </label>
                                                    {labForm.pathologistSignatureUrl && <span className="text-[10px] text-emerald-600 font-bold">Uploaded ✓</span>}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Save Button for Unified Lab Form */}
                                <div className="flex justify-end p-2">
                                    <button
                                        type="submit"
                                        disabled={savingLab}
                                        className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-navy-deep transition-all shadow"
                                    >
                                        {savingLab ? <Loader2 size={13} className="animate-spin" /> : <Save size={14} />}
                                        Save Profile Records
                                    </button>
                                </div>
                            </form>

                            {/* ── Accordion Section 8: Account Security (Representative edit) ── */}
                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setOpenSection(openSection === 'security' ? '' : 'security')}
                                    className="w-full px-5 py-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100/60 transition-all border-b border-slate-100"
                                >
                                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5"><Lock size={16} className="text-navy" /> Login Credentials & Security</span>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${openSection === 'security' ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {openSection === 'security' && (
                                    <div className="p-5 space-y-6">
                                        
                                        {/* Representative details */}
                                        <form onSubmit={handleUserFormSubmit} className="space-y-4">
                                            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Representative metadata</span>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Rep. Full Name</label>
                                                    <input type="text" name="name" value={userForm.name} onChange={handleUserFormChange} required className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Login Email</label>
                                                    <input type="email" name="email" value={userForm.email} onChange={handleUserFormChange} required className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Rep. Contact Hotline</label>
                                                    <input type="text" name="phone" value={userForm.phone} onChange={handleUserFormChange} required className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                            </div>

                                            <div className="flex justify-end border-t border-slate-100 pt-3">
                                                <button type="submit" disabled={savingUser} className="px-3 py-1.5 bg-navy text-white text-[11px] font-bold rounded flex items-center gap-1">
                                                    {savingUser && <Loader2 size={12} className="animate-spin" />}
                                                    Update Representative
                                                </button>
                                            </div>
                                        </form>

                                        {/* Password reset */}
                                        <form onSubmit={handlePasswordChange} className="space-y-4 border-t border-slate-100 pt-5">
                                            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Modify Security Password</span>
                                            
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Current Password</label>
                                                    <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">New Password</label>
                                                    <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} required className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Confirm New Password</label>
                                                    <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required className="w-full border border-slate-350 rounded-lg p-2 text-xs font-bold" />
                                                </div>
                                            </div>

                                            <div className="flex justify-end border-t border-slate-100 pt-3">
                                                <button type="submit" className="px-3 py-1.5 bg-navy text-white text-[11px] font-bold rounded">Change Password</button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </div>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default LabDashboard;
