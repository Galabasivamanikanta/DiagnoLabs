import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Microscope } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, googleLogin, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || null;
    const fromState = location.state?.from?.state || null;
    const message = location.state?.message;

    const handleSuccessRedirect = (resUser) => {
        if (from) {
            navigate(from, { state: fromState, replace: true });
        } else if (resUser.role === 'admin' || resUser.role === 'employee') {
            navigate('/admin/dashboard');
        } else if (resUser.role === 'lab_partner') {
            navigate('/partner/dashboard');
        } else {
            navigate('/patient/dashboard');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(email, password);
        if (res.success) {
            handleSuccessRedirect(res.user);
        } else {
            alert(res.message);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        const res = await googleLogin(credentialResponse.credential);
        if (res.success) {
            handleSuccessRedirect(res.user);
        } else {
            alert(res.message);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true, state: { message: "Successfully logged out. Please login with a new account." } });
        setEmail('');
        setPassword('');
    };

    if (user && message && message.includes("Access Denied")) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-alt)', padding: '2rem' }}>
                <div className="premium-card shadow-premium" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', background: 'white' }}>
                    <div style={{ margin: '0 auto 2rem' }}>
                        <BrandLogo size={84} />
                    </div>
                    <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem', color: 'var(--primary)', fontWeight: '900' }}>Security Alert</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem', fontWeight: '500' }}>{message}</p>
                    
                    <div style={{ padding: '1.5rem', background: 'var(--surface-alt)', borderRadius: '20px', marginBottom: '3rem', border: '1px solid var(--border-light)' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '0.75rem' }}>ACTIVE SESSION IDENTITY</span>
                        <h4 style={{ margin: '0', color: 'var(--primary)', fontWeight: '800' }}>{user.name}</h4>
                        <span className="badge-gold" style={{ marginTop: '0.5rem', display: 'inline-block' }}>{user.role.replace('_', ' ').toUpperCase()}</span>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <button onClick={handleLogout} className="btn-gold btn" style={{ padding: '1.25rem' }}>End Session & Switch Identity</button>
                        <button onClick={() => navigate('/')} className="btn-outline btn" style={{ padding: '1.25rem' }}>Return to Gateway</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-alt)', padding: '2rem' }}>
            <div className="premium-card shadow-premium" style={{ maxWidth: '480px', width: '100%', background: 'white', padding: '4rem 3rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <div style={{ margin: '0 auto 2.5rem' }}>
                        <BrandLogo size={80} />
                    </div>
                    <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Portal Gateway</h2>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Authentication required for clinical access.</p>
                </div>

                {message && (
                    <div style={{ 
                        padding: '1rem', 
                        borderRadius: '12px', 
                        background: message.includes("UnAuthorized") ? '#fef2f2' : 'var(--primary-light)', 
                        color: message.includes("UnAuthorized") ? 'var(--danger)' : 'var(--primary)', 
                        fontSize: '0.85rem', 
                        fontWeight: '700', 
                        textAlign: 'center', 
                        marginBottom: '2.5rem',
                        border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                        {message}
                    </div>
                )}

                {/* Google Identity Integration */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => alert('Identity Verification Failed')}
                        useOneTap
                        theme="filled_blue"
                        shape="pill"
                        size="large"
                        text="signin_with"
                        width="100%"
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                    <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>OR PORTAL ID</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Work Email</label>
                        <input 
                            type="email" 
                            className="form-input"
                            placeholder="identity@diagnolabs.com" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Access Key</label>
                        <input 
                            type="password" 
                            className="form-input"
                            placeholder="••••••••" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '1.25rem', marginTop: '1rem', fontSize: '1rem' }}>Initiate Session</button>
                </form>

                <div style={{ marginTop: '3.5rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>
                        Unauthorized here? <a href="/register" style={{ color: 'var(--accent-gold)', textDecoration: 'none', fontWeight: '800' }}>Request Access Profile</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
