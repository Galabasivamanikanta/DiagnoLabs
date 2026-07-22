import { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { CreditCard, MapPin, Calendar, Clock, ShieldCheck, CheckCircle2, Activity, Edit2, ArrowRight, Navigation, User, AlertCircle, Receipt, Info, Home, Building2, Syringe } from 'lucide-react';

const Checkout = () => {
    const { state } = useLocation();
    const { user, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const test = state?.test;

    const [flatNo, setFlatNo] = useState('');
    const [address, setAddress] = useState(user?.address?.street || '');
    const [isEditing, setIsEditing] = useState(!user?.address?.street);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [locating, setLocating] = useState(false);
    const [labFullAddress, setLabFullAddress] = useState('');
    const [collectionType, setCollectionType] = useState('home'); // 'home' or 'visit'

    const handleLocationClick = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setLocating(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const res = await axios.get(`${API_BASE_URL}/api/utils/geocode?lat=${latitude}&lng=${longitude}`);
                if (res.data && res.data.display_name) {
                    setAddress(res.data.display_name);
                } else {
                    alert('Could not resolve exact address.');
                }
            } catch (err) {
                console.error("Geocoding error:", err);
                alert('Failed to fetch address details. Please try again.');
            } finally {
                setLocating(false);
            }
        }, () => {
            alert('Please allow location access in your browser to auto-locate.');
            setLocating(false);
        }, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        });
    };

    useEffect(() => {
        if (user?.address?.street) {
            setAddress(curr => curr !== user.address.street ? user.address.street : curr);
            setIsEditing(curr => curr !== false ? false : curr);
        }
    }, [user]);

    useEffect(() => {
        if (test?.lab?.location?.coordinates) {
            const [lng, lat] = test.lab.location.coordinates;
            axios.get(`${API_BASE_URL}/api/utils/geocode?lat=${lat}&lng=${lng}&zoom=18`)
                .then(res => {
                    if (res.data?.display_name) {
                        setLabFullAddress(res.data.display_name);
                    }
                })
                .catch(err => console.error("Error fetching full lab address", err));
        }
    }, [test]);

    if (!test) return <div className="container mt-5">No test selected</div>;
    if (!user) {
        navigate('/login');
        return null; // Redirect logic usually handles this, just failsafe
    }

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        
        // 1. Load Razorpay Script
        const resScript = await loadRazorpayScript();
        if (!resScript) {
            alert("Razorpay SDK failed to load. Are you online?");
            return;
        }

        const bookingData = {
            patient: user._id,
            lab: test.lab?._id || test.lab?.googlePlaceId || "DAA_NETWORK_LAB",
            testDetails: [{
                testId: test._id,
                testName: test.testName,
                price: test.price
            }],
            totalAmount: test.price,
            appointmentDate: date,
            appointmentTime: time,
            collectionType: collectionType,
            sampleCollectionAddress: collectionType === 'home'
                ? (flatNo ? `${flatNo}, ${address}` : address)
                : (labFullAddress || test.lab?.address || 'Visit Lab')
        };

        try {
            // 2. Create the Booking as Pending
            const bookingRes = await axios.post(`${API_BASE_URL}/api/bookings`, bookingData);
            const bookingId = bookingRes.data._id;

            // 3. Create Razorpay Order
            const orderRes = await axios.post(`${API_BASE_URL}/api/bookings/razorpay-order`, { amount: test.price });
            const orderData = orderRes.data;

            // 4. Fetch Public Key
            const keyRes = await axios.get(`${API_BASE_URL}/api/bookings/razorpay-key`);
            const rzpKey = keyRes.data.key;

            // 5. Open Razorpay Modal
            const options = {
                key: rzpKey, // Dynamically fetched from backend
                amount: orderData.amount.toString(),
                currency: orderData.currency,
                name: "DiagnoLabs Payments",
                description: `Payment for ${test.testName}`,
                image: window.location.origin + '/logo.svg',
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        // 6. Verify Signature on Success
                        const verifyRes = await axios.post(`${API_BASE_URL}/api/bookings/verify-payment`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingId: bookingId
                        });

                        if (verifyRes.data.success) {
                            // Update local user context to remember address
                            updateUser({
                                address: { ...user.address, street: flatNo ? `${flatNo}, ${address}` : address }
                            });
                            alert("Payment Successful! Booking Confirmed.");
                            navigate('/patient/history');
                        } else {
                            alert("Payment verification failed.");
                        }
                    } catch {
                        alert("Error verifying payment.");
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone || "9999999999"
                },
                theme: {
                    color: "#2563eb"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (err) {
            console.error(err);
            alert("Booking/Payment Initialization Failed: " + (err.response?.data?.message || err.message));
        }
    };

    const formatTestName = (name) => {
        if (!name) return '';
        const n = name.trim().toLowerCase();
        const map = {
            'cbc': 'Complete Blood Count (CBC)',
            'lft': 'Liver Function Test (LFT)',
            'kft': 'Kidney Function Test (KFT)',
            'tft': 'Thyroid Function Test (TFT)',
            'lipid': 'Lipid Profile',
            'mri': 'Magnetic Resonance Imaging (MRI)',
            'ct': 'Computed Tomography (CT Scan)',
            'ecg': 'Electrocardiogram (ECG)',
            'eeg': 'Electroencephalogram (EEG)'
        };
        return map[n] || (name.charAt(0).toUpperCase() + name.slice(1));
    };

    return (
        <div style={{ minHeight: '100vh', background: 'white', padding: '4rem 2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                
                {/* Header (Test Name & Price) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem 0' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#111827', margin: 0 }}>
                        {formatTestName(test.testName)}
                    </h1>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#111827', margin: 0 }}>
                        ₹{test.price}
                    </h1>
                </div>

                {/* Lab Details Section */}
                <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '1.5rem', marginBottom: '3rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '1rem' }}>
                        Processing Laboratory
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={18} style={{ color: '#0369a1' }} /> {test.lab?.name || 'DiagnoLabs Network'}
                        </div>
                        <div style={{ color: '#4b5563', fontSize: '0.95rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', lineHeight: '1.4' }}>
                            <MapPin size={16} style={{ marginTop: '2px', flexShrink: 0, color: '#6b7280' }} /> 
                            {labFullAddress || test.lab?.address || `${test.lab?.city || 'Unknown City'}, ${test.lab?.servicePincodes?.[0] || ''}`}
                        </div>
                        {test.turnaroundTime && (
                            <div style={{ color: '#4b5563', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={16} style={{ color: '#6b7280' }} /> Reports in: {test.turnaroundTime}
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={handleBooking}>

                    {/* Collection Type Selector */}
                    <div style={{ marginBottom: '3rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111827', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Syringe size={20} style={{ color: '#7c3aed' }} /> How would you like your sample collected?
                        </h3>
                        <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            {/* Home Collection Card */}
                            <div
                                onClick={() => setCollectionType('home')}
                                style={{
                                    border: `2px solid ${collectionType === 'home' ? '#2563eb' : '#e2e8f0'}`,
                                    borderRadius: '20px',
                                    padding: '1.75rem',
                                    cursor: 'pointer',
                                    background: collectionType === 'home' ? '#eff6ff' : 'white',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    boxShadow: collectionType === 'home' ? '0 4px 20px rgba(37,99,235,0.15)' : 'none'
                                }}
                            >
                                {collectionType === 'home' && (
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#2563eb', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CheckCircle2 size={14} color="white" />
                                    </div>
                                )}
                                <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: collectionType === 'home' ? '#dbeafe' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <Home size={26} style={{ color: collectionType === 'home' ? '#2563eb' : '#6b7280' }} />
                                </div>
                                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#111827', marginBottom: '0.4rem' }}>Home Collection</div>
                                <div style={{ fontSize: '0.88rem', color: '#6b7280', lineHeight: '1.5' }}>Our certified technician will visit your home to collect the sample at your preferred time.</div>
                                <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#dcfce7', color: '#16a34a', fontSize: '0.78rem', fontWeight: '700', padding: '0.3rem 0.7rem', borderRadius: '20px' }}>
                                    <CheckCircle2 size={12} /> Doorstep Service
                                </div>
                            </div>

                            {/* Visit Lab Card */}
                            <div
                                onClick={() => setCollectionType('visit')}
                                style={{
                                    border: `2px solid ${collectionType === 'visit' ? '#7c3aed' : '#e2e8f0'}`,
                                    borderRadius: '20px',
                                    padding: '1.75rem',
                                    cursor: 'pointer',
                                    background: collectionType === 'visit' ? '#f5f3ff' : 'white',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    boxShadow: collectionType === 'visit' ? '0 4px 20px rgba(124,58,237,0.15)' : 'none'
                                }}
                            >
                                {collectionType === 'visit' && (
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#7c3aed', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CheckCircle2 size={14} color="white" />
                                    </div>
                                )}
                                <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: collectionType === 'visit' ? '#ede9fe' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <Building2 size={26} style={{ color: collectionType === 'visit' ? '#7c3aed' : '#6b7280' }} />
                                </div>
                                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#111827', marginBottom: '0.4rem' }}>Visit the Lab</div>
                                <div style={{ fontSize: '0.88rem', color: '#6b7280', lineHeight: '1.5' }}>Walk into the partner lab at your scheduled time. Sample collected on-site by professionals.</div>
                                <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#f3e8ff', color: '#7c3aed', fontSize: '0.78rem', fontWeight: '700', padding: '0.3rem 0.7rem', borderRadius: '20px' }}>
                                    <Building2 size={12} /> In-Lab Collection
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Collection Address - conditional on type */}
                    {collectionType === 'home' ? (
                    <div style={{ marginBottom: '3rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={20} style={{ color: '#d97706' }} /> Home Collection Address
                        </h3>
                        
                        {!isEditing ? (
                            <div 
                                style={{ background: '#f8fafc', border: '1px solid #f1f5f9', padding: '1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                <div style={{ fontSize: '1.05rem', fontWeight: '500', color: '#1f2937' }}>
                                    {flatNo ? `${flatNo}, ` : ''}{address}
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    style={{ color: '#0369a1', fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                >
                                    <Edit2 size={16} /> Edit
                                </button>
                            </div>
                        ) : (
                            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input
                                    type="text"
                                    value={flatNo}
                                    onChange={(e) => setFlatNo(e.target.value)}
                                    placeholder="Flat / House No. & Building Name"
                                    style={{ width: '100%', padding: '1.2rem 1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '1.05rem', fontWeight: '500', background: 'white' }}
                                    autoFocus
                                />
                                <div style={{ position: 'relative' }}>
                                    <textarea
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Street, Area, City (or Auto-Detect GPS)"
                                        rows="3"
                                        style={{ width: '100%', padding: '1.5rem', paddingBottom: '4rem', borderRadius: '16px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '1.05rem', fontWeight: '500', background: 'white', resize: 'vertical' }}
                                        required
                                    />
                                    <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            type="button"
                                            onClick={handleLocationClick}
                                            disabled={locating}
                                            style={{ background: '#e0f2fe', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '700', color: '#0369a1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                        >
                                            <Navigation size={16} /> {locating ? 'Locating...' : 'Auto Detect'}
                                        </button>
                                        {user?.address?.street && (
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '700', color: '#4b5563', cursor: 'pointer' }}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    ) : (
                    <div style={{ marginBottom: '3rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Building2 size={20} style={{ color: '#7c3aed' }} /> Lab Visit Location
                        </h3>
                        <div style={{ background: '#f5f3ff', border: '2px solid #ede9fe', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Building2 size={22} style={{ color: '#7c3aed' }} />
                            </div>
                            <div>
                                <div style={{ fontWeight: '800', fontSize: '1rem', color: '#111827', marginBottom: '0.3rem' }}>{test.lab?.name || 'DiagnoLabs Partner Lab'}</div>
                                <div style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.5' }}>{labFullAddress || test.lab?.address || `${test.lab?.city || ''} — Please check the lab address before visiting.`}</div>
                                <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#dcfce7', color: '#16a34a', fontSize: '0.78rem', fontWeight: '700', padding: '0.35rem 0.8rem', borderRadius: '20px' }}>
                                    <CheckCircle2 size={12} /> Please carry a valid ID and your booking confirmation
                                </div>
                            </div>
                        </div>
                    </div>
                    )}

                    {/* Date & Time Selection */}
                    <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={18} style={{ color: '#0369a1' }} /> Preferred Date
                            </h3>
                            <input
                                type="date"
                                value={date}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setDate(e.target.value)}
                                style={{ width: '100%', padding: '1.2rem 1.5rem', borderRadius: '16px', border: '1px solid #f1f5f9', outline: 'none', fontSize: '1.05rem', fontWeight: '500', color: '#1f2937', background: '#f8fafc' }}
                                required
                            />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={18} style={{ color: '#0369a1' }} /> Time Slot
                            </h3>
                            <select
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                style={{ width: '100%', padding: '1.2rem 1.5rem', borderRadius: '16px', border: '1px solid #f1f5f9', outline: 'none', fontSize: '1.05rem', fontWeight: '500', color: '#1f2937', background: '#f8fafc' }}
                                required
                            >
                                <option value="">Select a slot</option>
                                <option value="08:00 AM - 09:00 AM">Morning (08:00 - 09:00 AM)</option>
                                <option value="09:00 AM - 10:00 AM">Morning (09:00 - 10:00 AM)</option>
                                <option value="10:00 AM - 11:00 AM">Morning (10:00 - 11:00 AM)</option>
                                <option value="11:00 AM - 12:00 PM">Morning (11:00 - 12:00 PM)</option>
                                <option value="04:00 PM - 05:00 PM">Evening (04:00 - 05:00 PM)</option>
                            </select>
                        </div>
                    </div>

                    {/* Patient Details & Preparation */}
                    <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                        
                        {/* Patient Details */}
                        <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={18} style={{ color: '#0369a1' }} /> Patient Details
                            </h3>
                            <div style={{ color: '#1f2937', fontWeight: '700', fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                                {user?.name || 'Guest Patient'}
                            </div>
                            <div style={{ color: '#4b5563', fontSize: '0.95rem' }}>
                                +91 {user?.phone || '9999999999'}
                            </div>
                            <div style={{ color: '#4b5563', fontSize: '0.95rem' }}>
                                {user?.email || ''}
                            </div>
                        </div>

                        {/* Pre-Test Preparation */}
                        {test.description && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '16px', padding: '1.5rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#991b1b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <AlertCircle size={18} style={{ color: '#dc2626' }} /> Preparation Instructions
                                </h3>
                                <div style={{ color: '#7f1d1d', fontSize: '0.95rem', lineHeight: '1.5', fontWeight: '500' }}>
                                    {test.description}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Price Breakdown */}
                    <div style={{ marginBottom: '2rem', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Receipt size={20} style={{ color: '#059669' }} /> Payment Summary
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.05rem', color: '#4b5563', fontWeight: '500' }}>
                            <span>Test Price</span>
                            <span>₹{test.price}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.05rem', color: '#4b5563', fontWeight: '500' }}>
                            <span>Home Collection Fee</span>
                            <span style={{ color: '#059669', fontWeight: '700' }}><span style={{ textDecoration: 'line-through', color: '#9ca3af', fontWeight: '500', marginRight: '0.5rem' }}>₹100</span>FREE</span>
                        </div>
                        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#111827' }}>Total Amount</span>
                            <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#111827' }}>₹{test.price}</span>
                        </div>
                    </div>

                    {/* Cancellation Policy */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
                        <Info size={16} style={{ color: '#6b7280', flexShrink: 0, marginTop: '2px' }} />
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem', lineHeight: '1.5', fontWeight: '500' }}>
                            <strong style={{ color: '#374151' }}>Cancellation Policy:</strong> Free cancellation and 100% full refund available up to 4 hours before your selected time slot. No questions asked.
                        </p>
                    </div>

                    <button 
                        type="submit" 
                        style={{ width: '100%', padding: '1.5rem', borderRadius: '16px', fontSize: '1.2rem', fontWeight: '800', color: 'white', background: '#0284c7', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                    >
                        Confirm Booking
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
