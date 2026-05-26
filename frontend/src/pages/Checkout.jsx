import { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const Checkout = () => {
    const { state } = useLocation();
    const { user, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const test = state?.test;

    const [address, setAddress] = useState(user?.address?.street || '');
    const [isEditing, setIsEditing] = useState(!user?.address?.street);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    useEffect(() => {
        if (user?.address?.street) {
            setAddress(user.address.street);
            setIsEditing(false);
        }
    }, [user]);

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
            lab: test.lab._id,
            testDetails: [{
                testId: test._id,
                testName: test.testName,
                price: test.price
            }],
            totalAmount: test.price,
            appointmentDate: date,
            appointmentTime: time,
            sampleCollectionAddress: address
        };

        try {
            // 2. Create the Booking as Pending
            const bookingRes = await axios.post(`${API_BASE_URL}/api/bookings`, bookingData);
            const bookingId = bookingRes.data._id;

            // 3. Create Razorpay Order
            const orderRes = await axios.post(`${API_BASE_URL}/api/bookings/razorpay-order`, { amount: test.price });
            const orderData = orderRes.data;

            // 4. Open Razorpay Modal
            const options = {
                key: 'rzp_test_YourTestKeyHere', // Replace with your actual Test Key
                amount: orderData.amount.toString(),
                currency: orderData.currency,
                name: "DiagnoLabs Payments",
                description: `Payment for ${test.testName}`,
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        // 5. Verify Signature on Success
                        const verifyRes = await axios.post(`${API_BASE_URL}/api/bookings/verify-payment`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingId: bookingId
                        });

                        if (verifyRes.data.success) {
                            // Update local user context to remember address
                            updateUser({
                                address: { ...user.address, street: address }
                            });
                            alert("Payment Successful! Booking Confirmed.");
                            navigate('/patient/dashboard');
                        } else {
                            alert("Payment verification failed.");
                        }
                    } catch (verifyErr) {
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

    return (
        <div className="container mt-5">
            <h2>Checkout</h2>
            <div className="card mt-3">
                <div className="card-body">
                    <h5>Test: {test.testName}</h5>
                    <p>Price: ₹{test.price}</p>
                    <hr />
                    <form onSubmit={handleBooking}>
                        <div className="mb-4">
                            <label className="form-label fw-bold text-secondary small text-uppercase">Collection Address</label>

                            {!isEditing ? (
                                <div className="d-flex align-items-center justify-content-between p-3 border rounded bg-light hover-shadow transition" style={{ cursor: 'pointer' }} onClick={() => setIsEditing(true)}>
                                    <div className="d-flex align-items-center gap-3">
                                        <i className="bi bi-geo-alt-fill text-primary fs-5"></i>
                                        <span className="text-dark">{address}</span>
                                    </div>
                                    <button type="button" className="btn btn-link p-0 text-primary text-decoration-none">
                                        <i className="bi bi-pencil-square me-1"></i> Edit
                                    </button>
                                </div>
                            ) : (
                                <div className="position-relative">
                                    <textarea
                                        className="form-control shadow-sm border-primary"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Enter your full house address, area, and city"
                                        rows="3"
                                        style={{ borderRadius: '10px' }}
                                        required
                                        autoFocus
                                    />
                                    {user?.address?.street && (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-secondary position-absolute bottom-0 end-0 m-2"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold text-secondary small text-uppercase">Preferred Date</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0"><i className="bi bi-calendar-event text-primary"></i></span>
                                    <input
                                        type="date"
                                        className="form-control border-start-0 ps-0"
                                        value={date}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold text-secondary small text-uppercase">Time Slot</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0"><i className="bi bi-clock text-primary"></i></span>
                                    <select
                                        className="form-select border-start-0 ps-0"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
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
                        </div>

                        <button type="submit" className="btn btn-success btn-lg w-100 py-3 fw-bold shadow-sm" style={{ borderRadius: '12px', background: 'linear-gradient(45deg, #198754, #20c997)', border: 'none' }}>
                            Confirm & Pay ₹{test.price}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
