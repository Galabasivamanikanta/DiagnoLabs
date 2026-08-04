import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import BrandLogo from '../components/BrandLogo';
import { Lock, Mail, ChevronRight, Activity, ShieldCheck, BarChart3, Users, Eye, EyeOff, AlertTriangle } from 'lucide-react';


const AdminLogin = () => {
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // For First Login Password Change
    const [isFirstLogin, setIsFirstLogin] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Recovery State
    const [isRecovering, setIsRecovering] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [recoveryPhone, setRecoveryPhone] = useState('');
    const [recoveryRole, setRecoveryRole] = useState('admin');
    const [recoveryMsg, setRecoveryMsg] = useState('');
    
    const { login, manualLogin } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleRecover = async (e) => {
        e.preventDefault();
        setError('');
        setRecoveryMsg('');
        setLoading(true);

        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/admin-recover`, {
                email: recoveryEmail,
                phone: recoveryPhone,
                role: recoveryRole
            });
            setRecoveryMsg(res.data);
            setTimeout(() => {
                setIsRecovering(false);
                setRecoveryMsg('');
            }, 5000);
        } catch (err) {
            setError(err.response?.data || "Failed to process recovery request.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/admin-login`, {
                employeeId: employeeId.trim(),
                password
            });
            
            const userData = res.data;
            
            if (userData.isFirstLogin) {
                localStorage.setItem('tempToken', userData.accessToken);
                setIsFirstLogin(true);
            } else {
                manualLogin(userData);
                
                // Route based on role — all 14 roles correctly mapped
                const role = userData.role;
                if (role === 'admin') navigate('/admin/dashboard');
                else if (role === 'lab_partner') navigate('/partner/dashboard');
                else if (['phlebotomist', 'nurse'].includes(role)) navigate('/collector/dashboard');
                else if (role === 'doctor') navigate('/doctor/dashboard');
                else if (role === 'receptionist') navigate('/reception/dashboard');
                else if (role === 'inventory_manager') navigate('/inventory/dashboard');
                else if (role === 'finance_manager') navigate('/finance/dashboard');
                else if (role === 'marketing_head') navigate('/marketing/dashboard');
                else if (role === 'support_staff') navigate('/support/dashboard');
                else if (role === 'delivery_partner') navigate('/delivery/dashboard');
                else if (role === 'quality_auditor') navigate('/quality/dashboard');
                else if (role === 'it_specialist') navigate('/it/dashboard');
                else navigate('/admin/dashboard'); // default fallback for 'employee' or unknown
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Invalid ID or password.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAdminSuccess = async (credentialResponse) => {

        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/admin-google`, {
                token: credentialResponse.credential
            });
            const userData = res.data;
            manualLogin(userData);

            const role = userData.role;
            if (role === 'admin') navigate('/admin/dashboard');
            else if (role === 'lab_partner') navigate('/partner/dashboard');
            else if (['phlebotomist', 'nurse'].includes(role)) navigate('/collector/dashboard');
            else if (role === 'doctor') navigate('/doctor/dashboard');
            else if (role === 'receptionist') navigate('/reception/dashboard');
            else if (role === 'inventory_manager') navigate('/inventory/dashboard');
            else if (role === 'finance_manager') navigate('/finance/dashboard');
            else if (role === 'marketing_head') navigate('/marketing/dashboard');
            else if (role === 'support_staff') navigate('/support/dashboard');
            else if (role === 'delivery_partner') navigate('/delivery/dashboard');
            else if (role === 'quality_auditor') navigate('/quality/dashboard');
            else if (role === 'it_specialist') navigate('/it/dashboard');
            else navigate('/admin/dashboard'); // default fallback for 'employee' or unknown
        } catch (err) {
            setError(err.response?.data?.message || 'Google Admin Login Failed. Email not authorized.');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {

        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        
        setError('');
        setLoading(true);
        
        try {
            const token = localStorage.getItem('tempToken');
            await axios.post(`${API_BASE_URL}/api/auth/change-password`, {
                oldPassword: password,
                newPassword: newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const res = await axios.post(`${API_BASE_URL}/api/auth/admin-login`, {
                employeeId,
                password: newPassword
            });
            
            localStorage.removeItem('tempToken');
            manualLogin(res.data);
            routeToDashboard(res.data);
            
        } catch (err) {
            let errorMsg = "Failed to change password";
            if (err.response?.data) {
                errorMsg = typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data;
            }
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const routeToDashboard = (user) => {
        const role = user.role;
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'lab_partner') navigate('/partner/dashboard');
        else if (['employee', 'phlebotomist', 'nurse'].includes(role)) navigate('/collector/dashboard');
        else navigate('/staff/dashboard');
    };

    return (
        <div className="flex min-h-screen bg-[#F5F7FA] overflow-hidden relative">
            
            {/* Left Side - Brand Content */}
            <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 relative z-10">
                {/* Logo Area */}
                <div className="flex items-center gap-3">
                    <BrandLogo size={42} color="#0A192F" />
                    <div>
                        <h1 className="text-2xl font-bold text-[#0A192F] leading-tight">DiagnoLabs</h1>
                        <p className="text-xs font-bold text-[#D4AF37] tracking-widest uppercase">Clinical Discovery</p>
                    </div>
                </div>

                {/* Main Copy */}
                <div className="max-w-xl mt-12">
                    <h2 className="text-6xl font-extrabold text-[#0A192F] mb-4">Admin Portal</h2>
                    <h3 className="text-3xl font-bold text-[#D4AF37] mb-6">Secure. Manage. Make an Impact.</h3>
                    <p className="text-[#4B5563] text-lg leading-relaxed">
                        Access your admin dashboard to manage users, studies, and clinical data with precision and confidence.
                    </p>
                </div>

                {/* High Fidelity CSS Illustration (As Requested) */}
                <div className="flex-1 flex items-center justify-center my-12 relative">
                    
                    {/* Inner wrapper that tightly fits the illustration so the shield sticks to the window */}
                    {/* Added scale-[0.85] to reduce the overall size slightly as requested */}
                    <div className="relative transform scale-[0.85] transform-gpu origin-center">
                        {/* Pedestal Base */}
                        <div className="absolute -bottom-8 -left-4 w-80 h-16 bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0] rounded-[50%] shadow-xl border border-white"></div>
                        <div className="absolute -bottom-5 left-0 w-72 h-12 bg-white rounded-[50%] border-b border-gray-200"></div>

                        {/* Main White Card (Browser Window) */}
                        <div className="relative w-[400px] h-[260px] bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 p-4 flex flex-col gap-4 transform -rotate-2 z-10 overflow-hidden backdrop-blur-md bg-white/90">
                            
                            {/* Browser Header */}
                            <div className="flex gap-2 mb-2 items-center">
                                <div className="w-3 h-3 rounded-full bg-[#FF5F56] shadow-sm"></div>
                                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-sm"></div>
                                <div className="w-3 h-3 rounded-full bg-[#27C93F] shadow-sm"></div>
                                <div className="ml-2 flex-1 h-3 bg-gray-100 rounded-full"></div>
                            </div>

                            {/* Dashboard Grid */}
                        <div className="flex gap-4 h-full">
                            {/* Left Column (3 Pills) */}
                            <div className="w-1/2 flex flex-col gap-3 justify-center">
                                {/* Pill 1 */}
                                <div className="bg-[#F8FAFC] rounded-full p-2 flex items-center gap-3 shadow-sm border border-gray-50">
                                    <div className="w-8 h-8 rounded-full border-[4px] border-[var(--primary)] border-t-[var(--primary-light)]"></div>
                                    <div className="flex flex-col flex-1 pr-2 justify-center">
                                        <span className="text-[9px] font-bold text-gray-700 leading-none mb-1">Active Users</span>
                                        <span className="text-[8px] font-semibold text-gray-400 leading-none">2,451 online</span>
                                    </div>
                                </div>
                                {/* Pill 2 */}
                                <div className="bg-[#F8FAFC] rounded-full p-2 flex items-center gap-3 shadow-sm border border-gray-50">
                                    <div className="w-8 h-8 rounded-full border-[4px] border-[var(--primary-hover)] border-t-[var(--primary)]"></div>
                                    <div className="flex flex-col flex-1 pr-2 justify-center">
                                        <span className="text-[9px] font-bold text-gray-700 leading-none mb-1">Pending Tests</span>
                                        <span className="text-[8px] font-semibold text-gray-400 leading-none">142 in queue</span>
                                    </div>
                                </div>
                                {/* Pill 3 */}
                                <div className="bg-[#F8FAFC] rounded-full p-2 flex items-center gap-3 shadow-sm border border-gray-50">
                                    <div className="w-8 h-8 rounded-full border-[4px] border-[var(--primary-light)] border-t-[#DBEAFE]"></div>
                                    <div className="flex flex-col flex-1 pr-2 justify-center">
                                        <span className="text-[9px] font-bold text-gray-700 leading-none mb-1">System Health</span>
                                        <span className="text-[8px] font-semibold text-green-500 leading-none">99.9% uptime</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Right Column */}
                            <div className="w-1/2 flex flex-col gap-3">
                                {/* Top Donut */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3 flex-1">
                                    <div className="w-10 h-10 rounded-full border-[4px] border-[#94A3B8] border-r-[#CBD5E1] border-b-[#CBD5E1]"></div>
                                    <div className="flex flex-col flex-1 justify-center">
                                        <span className="text-[10px] font-bold text-gray-800 leading-none mb-1">Monthly Reports</span>
                                        <span className="text-[9px] font-semibold text-navy leading-none">+12.5% vs last month</span>
                                    </div>
                                </div>
                                {/* Bottom Bar Chart */}
                                    <div className="bg-[#F8FAFC] rounded-xl shadow-sm border border-gray-50 p-3 flex items-end justify-around h-[100px] flex-none">
                                        <div className="w-4 bg-[var(--primary-light)] h-[40%] rounded-t-sm shadow-sm"></div>
                                        <div className="w-4 bg-[var(--primary-light)] h-[80%] rounded-t-sm shadow-sm"></div>
                                        <div className="w-4 bg-[var(--primary-light)] h-[60%] rounded-t-sm shadow-sm"></div>
                                        <div className="w-4 bg-[var(--primary-light)] h-[100%] rounded-t-sm shadow-sm"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Highly Detailed 3D Shield */}
                        <div className="absolute -bottom-8 -right-12 w-[140px] h-[160px] z-20 flex items-center justify-center transform rotate-6">
                            {/* Shield Background / Gold Border */}
                            <div className="absolute inset-0 bg-gradient-to-b from-[#FCD34D] to-[#B45309]" style={{ clipPath: 'polygon(50% 0%, 100% 20%, 100% 70%, 50% 100%, 0% 70%, 0% 20%)', borderRadius: '4px' }}></div>
                            
                            {/* Inner Shield (Dark Blue) */}
                            <div className="absolute inset-1 bg-gradient-to-br from-[var(--primary-hover)] to-[#0F172A] shadow-inner" style={{ clipPath: 'polygon(50% 0%, 100% 20%, 100% 70%, 50% 100%, 0% 70%, 0% 20%)' }}>
                                {/* Inner 3D Highlight / Glass Effect */}
                                <div className="absolute top-0 left-0 w-1/2 h-full bg-white opacity-10"></div>
                                <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full opacity-60"></div>
                            </div>

                            {/* Gold Padlock inside Shield */}
                            <div className="absolute z-30 flex flex-col items-center justify-center mt-2">
                                {/* Lock Hook */}
                                <div className="w-10 h-10 border-[5px] border-[#FCD34D] rounded-t-full border-b-0 mb-[-4px]"></div>
                                {/* Lock Body */}
                                <div className="w-14 h-12 bg-gradient-to-b from-[#FDE68A] to-[var(--accent-gold-hover)] rounded-md shadow-lg flex items-center justify-center border border-[var(--accent-gold)]">
                                    {/* Keyhole */}
                                    <div className="w-3 h-3 bg-[#78350F] rounded-full relative">
                                        <div className="absolute top-2 left-1 w-1 h-3 bg-[#78350F] rounded-b-sm"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Features */}
                <div className="flex gap-12 text-[#4B5563]">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={20} className="text-navy" />
                        <span className="text-sm font-semibold">Secure Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <BarChart3 size={20} className="text-navy" />
                        <span className="text-sm font-semibold">Powerful Insights</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users size={20} className="text-navy" />
                        <span className="text-sm font-semibold">Better Outcomes</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form Background */}
            <div className="w-full lg:w-[45%] bg-[#0A192F] relative flex items-center justify-center p-8 lg:p-0 overflow-visible">
                
                {/* The curved golden divider shape */}
                <div className="hidden lg:block absolute -left-32 top-0 bottom-0 w-64 bg-[#0A192F] rounded-l-[100%] border-l-[6px] border-[#D4AF37]" style={{ transform: 'scaleY(1.2)' }}></div>
                
                {/* The Glowing Hexagon */}
                <div className="hidden lg:flex absolute -left-12 top-1/2 transform -translate-y-1/2 z-20 w-24 h-24 items-center justify-center filter drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-[#D4AF37] fill-[#0A192F]" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="50 3, 93 25, 93 75, 50 97, 7 75, 7 25" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
                    </svg>
                    <Activity size={32} className="text-[#38bdf8] relative z-10" strokeWidth={2} />
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl z-30 relative">
                    
                    {error && (
                        <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2 transition-all">
                            <AlertTriangle size={18} /> {error}
                        </div>
                    )}

                    {recoveryMsg && (
                        <div className="mb-6 bg-green-50 text-green-700 p-3 rounded-lg text-sm font-medium border border-green-100 flex items-center gap-2 transition-all">
                            <ShieldCheck size={18} /> {recoveryMsg}
                        </div>
                    )}

                    {isRecovering ? (
                        <>
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-[#0A192F] mb-2">Recover Account</h2>
                                <p className="text-gray-500 text-sm">Automated ID and Password recovery system.</p>
                            </div>

                            <form onSubmit={handleRecover} className="space-y-5">
                                <div>
                                    <div className="relative">
                                        <Users size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <select 
                                            value={recoveryRole}
                                            onChange={(e) => setRecoveryRole(e.target.value)}
                                            required
                                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-[#0A192F] focus:ring-1 focus:ring-[#0A192F] transition-all appearance-none"
                                        >
                                            <option value="admin">System Administrator</option>
                                            <option value="lab_partner">Lab Partner</option>
                                            <option value="employee">Phlebotomist / Employee</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="email" 
                                            value={recoveryEmail}
                                            onChange={(e) => setRecoveryEmail(e.target.value)}
                                            required
                                            placeholder="Registered Email Address"
                                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-[#0A192F] focus:ring-1 focus:ring-[#0A192F] transition-all"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="relative">
                                        <Users size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="tel" 
                                            value={recoveryPhone}
                                            onChange={(e) => setRecoveryPhone(e.target.value)}
                                            required
                                            placeholder="Registered Phone Number"
                                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-[#0A192F] focus:ring-1 focus:ring-[#0A192F] transition-all"
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-[#0A192F] hover:bg-[#112240] text-white py-4 rounded-xl font-bold text-sm transition-all shadow-lg"
                                >
                                    {loading ? 'Searching System...' : 'Recover My Account'}
                                </button>
                                
                                <div className="text-center mt-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsRecovering(false)} 
                                        className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                                    >
                                        Back to Secure Login
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : !isFirstLogin ? (
                        <>
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-[#0A192F] mb-2">Admin Login</h2>
                                <p className="text-gray-500 text-sm">Sign in to access the admin dashboard</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-5">
                                <div>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="text" 
                                            value={employeeId}
                                            onChange={(e) => setEmployeeId(e.target.value)}
                                            required
                                            placeholder="Employee or Admin ID"
                                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-[#0A192F] focus:ring-1 focus:ring-[#0A192F] transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            placeholder="Password"
                                            className="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-[#0A192F] focus:ring-1 focus:ring-[#0A192F] transition-all"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0A192F] focus:ring-[#0A192F]" />
                                        <span className="text-xs text-gray-500 font-medium">Remember me</span>
                                    </label>
                                    <button type="button" onClick={() => setIsRecovering(true)} className="text-xs font-semibold text-navy hover:text-navy transition-colors">Forgot Password?</button>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-[#0A192F] hover:bg-[#112240] text-white py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 relative mt-4 group shadow-lg"
                                >
                                    {loading ? 'Authenticating...' : 'Login'}
                                    {!loading && (
                                        <span className="absolute right-4 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-all">
                                            <ChevronRight size={14} className="text-white" />
                                        </span>
                                    )}
                                </button>
                            </form>

                            <div className="relative my-6 flex items-center justify-center">
                                <div className="border-t border-gray-200 w-full"></div>
                                <span className="bg-white px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider absolute">OR</span>
                            </div>

                            <div className="flex justify-center w-full">
                                <GoogleLogin
                                    onSuccess={handleGoogleAdminSuccess}
                                    onError={() => setError('Google Authentication Failed. Please try again.')}
                                    theme="outline"
                                    shape="pill"
                                    size="large"
                                    width="100%"
                                />
                            </div>

                        </>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-[#0A192F] mb-2">Update Password</h2>
                                <p className="text-gray-500 text-sm">Please change your temporary password.</p>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-5">
                                <div>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type={showNewPassword ? "text" : "password"} 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            placeholder="New Password"
                                            className="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-[#0A192F] focus:ring-1 focus:ring-[#0A192F] transition-all"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#0A192F] focus:outline-none"
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type={showConfirmPassword ? "text" : "password"} 
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            placeholder="Confirm Password"
                                            className="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-[#0A192F] focus:ring-1 focus:ring-[#0A192F] transition-all"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#0A192F] focus:outline-none"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-[#D4AF37] hover:bg-[#c29f2f] text-white py-4 rounded-xl font-bold text-sm transition-all shadow-lg"
                                >
                                    {loading ? 'Updating...' : 'Secure Account'}
                                </button>
                            </form>
                        </>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs font-medium text-gray-500">
                            Need Help? <button type="button" onClick={() => setIsRecovering(true)} className="text-navy font-bold hover:underline ml-1">Contact Support</button>
                        </p>
                    </div>
                </div>

                {/* Footer Copyright */}
                <div className="absolute bottom-6 right-8 text-white/50 text-xs flex items-center gap-2">
                    <span>© 2024 DiagnoLabs. All rights reserved.</span>
                    <ShieldCheck size={14} />
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
