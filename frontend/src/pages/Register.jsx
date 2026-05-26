import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'patient'
    });
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [timer, setTimer] = useState(0);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOTP = async (e) => {
        if (e) e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/send-otp`, { 
                phone: formData.phone, 
                email: formData.email 
            });
            if (res.status === 200) {
                setOtpSent(true);
                setTimer(60); // Start 60s cooldown
                if (!e) {
                    alert("A new OTP has been sent!");
                } else {
                    alert("OTP sent successfully!");
                }
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to send OTP");
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setVerifying(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
                phone: formData.phone,
                email: formData.email,
                otp: otp
            });
            if (res.status === 200) {
                const regRes = await register(formData);
                if (regRes.success) {
                    alert("Registration & Verification Successful!");
                    navigate('/login');
                } else {
                    alert(regRes.message);
                }
            }
        } catch (err) {
            alert(err.response?.data?.message || "OTP Verification Failed");
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '400px' }}>
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
                <div className="card-body p-4">
                    <h2 className="text-center mb-4 fw-bold" style={{ color: 'var(--primary)' }}>Create Account</h2>
                    {!otpSent ? (
                        <form onSubmit={handleSendOTP}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">FULL NAME</label>
                                <input type="text" className="form-control form-control-lg fs-6" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">WORK EMAIL</label>
                                <input type="email" className="form-control form-control-lg fs-6" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">PHONE NUMBER</label>
                                <input type="text" className="form-control form-control-lg fs-6" name="phone" placeholder="9876543210" value={formData.phone} onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">ACCESS KEY (PASSWORD)</label>
                                <input type="password" className="form-control form-control-lg fs-6" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                            </div>
                            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold mt-2">Generate Identity Code</button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP}>
                            <div className="mb-4 text-center">
                                <div className="p-3 bg-light rounded-3 mb-3">
                                    <label className="form-label d-block small fw-bold text-muted mb-3">SECURE OTP VERIFICATION</label>
                                    <input 
                                        type="text" 
                                        className="form-control text-center fw-bold fs-3 border-0 bg-transparent" 
                                        style={{ letterSpacing: '8px' }}
                                        placeholder="000000"
                                        value={otp} 
                                        onChange={(e) => setOtp(e.target.value)} 
                                        maxLength="6"
                                        required 
                                    />
                                </div>
                                <div className="small text-muted mb-2">Sent to {formData.phone || formData.email}</div>
                            </div>
                            <button type="submit" className="btn btn-success w-100 py-3 fw-bold mb-3 shadow-sm" disabled={verifying}>
                                {verifying ? 'Validating Token...' : 'Verify & Complete Setup'}
                            </button>
                            
                            <div className="text-center">
                                {timer > 0 ? (
                                    <span className="text-muted small fw-bold">Resend code in <span className="text-primary">{timer}s</span></span>
                                ) : (
                                    <button type="button" className="btn btn-link btn-sm text-decoration-none fw-bold" onClick={() => handleSendOTP(null)}>
                                        Resend Verification Code
                                    </button>
                                )}
                            </div>
                            <hr className="my-3 opacity-10" />
                            <button type="button" className="btn btn-light btn-sm w-100 text-muted fw-bold" onClick={() => setOtpSent(false)}>Back to Profile Edit</button>
                        </form>
                    )}
                    <div className="mt-4 text-center pt-2 border-top">
                        <p className="small text-muted mb-0">Identity already established? <Link to="/login" className="text-primary fw-bold text-decoration-none">Login Portal</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;

