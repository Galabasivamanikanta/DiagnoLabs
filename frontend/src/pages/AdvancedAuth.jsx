import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Eye, Lock, Mail, User, Loader, ShieldCheck, Microscope, Users, Building2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './AdvancedAuth.css';

const strengthLabel = (value) => {
  if (value >= 75) return 'Strong';
  if (value >= 45) return 'Medium';
  if (value > 0) return 'Weak';
  return 'Empty';
};

const computeStrength = (value) => {
  let score = 0;
  if (value.length >= 8) score += 30;
  if (/[A-Z]/.test(value)) score += 20;
  if (/[0-9]/.test(value)) score += 20;
  if (/[^A-Za-z0-9]/.test(value)) score += 30;
  return Math.min(100, score);
};

const validateContact = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.includes('@')) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  }
  return /^[0-9]{7,15}$/.test(trimmed.replace(/\s+/g, ''));
};

const AdvancedAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState({});

  // Register state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [registerErrors, setRegisterErrors] = useState({});

  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!loginEmail.trim()) {
      nextErrors.loginEmail = 'Email or phone is required.';
    } else if (!validateContact(loginEmail)) {
      nextErrors.loginEmail = 'Enter a valid email address or phone number.';
    }

    if (!loginPassword) {
      nextErrors.loginPassword = 'Password is required.';
    }

    if (Object.keys(nextErrors).length) {
      setLoginErrors(nextErrors);
      return;
    }

    setIsLoading(true);
    const response = await login(loginEmail.trim(), loginPassword);

    if (response.success) {
      navigate('/patient/dashboard');
    } else {
      setLoginErrors({ general: response.message || 'Login failed. Please try again.' });
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!registerName.trim()) nextErrors.registerName = 'Full name is required.';
    if (!registerEmail.trim()) {
      nextErrors.registerEmail = 'Email or phone is required.';
    } else if (!validateContact(registerEmail)) {
      nextErrors.registerEmail = 'Enter a valid email address or phone number.';
    }
    if (!registerPassword) nextErrors.registerPassword = 'Password is required.';
    if (!registerConfirm) nextErrors.registerConfirm = 'Please confirm your password.';
    if (registerPassword && registerConfirm && registerPassword !== registerConfirm) {
      nextErrors.registerConfirm = 'Passwords do not match.';
    }
    if (!termsAccepted) {
      nextErrors.terms = 'You must agree to the Terms of Service.';
    }

    if (Object.keys(nextErrors).length) {
      setRegisterErrors(nextErrors);
      return;
    }

    setIsLoading(true);

    const payload = {
      name: registerName.trim(),
      password: registerPassword,
      email: registerEmail.includes('@') ? registerEmail.trim() : '',
      phone: /^[0-9]/.test(registerEmail.trim()) ? registerEmail.replace(/\D/g, '') : '',
    };

    const response = await register(payload);
    if (response.success) {
      navigate('/login', { state: { message: 'Account created. Please login to continue.' } });
    } else {
      setRegisterErrors({ general: response.message || 'Unable to create account. Please try again.' });
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (event) => {
    const next = event.target.value;
    setRegisterPassword(next);
    setPasswordStrength(computeStrength(next));
    setRegisterErrors((prev) => ({ ...prev, registerPassword: '' }));
  };

  return (
    <div className="advanced-auth-container">
      <div className={`advanced-auth-wrapper ${!isLogin ? 'register-view' : ''}`}>
        {/* Left Side - Dynamic Content */}
        <div className="advanced-auth-content-section">
          <div className="advanced-auth-form-container">
            {/* Toggle Tabs */}
            <div className="advanced-auth-tabs">
              <button
                className={`advanced-auth-tab ${isLogin ? 'active' : ''}`}
                onClick={() => {
                  setIsLogin(true);
                  setLoginErrors({});
                  setRegisterErrors({});
                }}
              >
                Login
              </button>
              <button
                className={`advanced-auth-tab ${!isLogin ? 'active' : ''}`}
                onClick={() => {
                  setIsLogin(false);
                  setLoginErrors({});
                  setRegisterErrors({});
                }}
              >
                Register
              </button>
              <span className="advanced-auth-tab-indicator" style={{
                transform: isLogin ? 'translateX(0)' : 'translateX(100%)'
              }} />
            </div>

            {/* Login Form */}
            {isLogin && (
              <form className="advanced-auth-form" onSubmit={handleLoginSubmit}>
                <h2>Welcome Back</h2>
                <p className="advanced-auth-subtitle">Sign in to access your health insights</p>

                {loginErrors.general && <div className="advanced-auth-alert">{loginErrors.general}</div>}

                <div className="advanced-auth-field">
                  <label>Email or Phone</label>
                  <div className="advanced-auth-input-wrapper">
                    <Mail size={20} />
                    <input
                      type="text"
                      placeholder="Enter your email or phone"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        setLoginErrors((prev) => ({ ...prev, loginEmail: '' }));
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  {loginErrors.loginEmail && <p className="advanced-auth-error">{loginErrors.loginEmail}</p>}
                </div>

                <div className="advanced-auth-field">
                  <label>Password</label>
                  <div className="advanced-auth-input-wrapper">
                    <Lock size={20} />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        setLoginErrors((prev) => ({ ...prev, loginPassword: '' }));
                      }}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="advanced-auth-eye-button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      disabled={isLoading}
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                  {loginErrors.loginPassword && <p className="advanced-auth-error">{loginErrors.loginPassword}</p>}
                </div>

                <button type="submit" className="advanced-auth-button" disabled={isLoading}>
                  {isLoading ? <><Loader size={18} className="spinner" /> Logging in...</> : <>Login <ArrowRight size={18} /></>}
                </button>

                <div className="advanced-auth-footer-text">
                  Don't have an account? <button type="button" className="advanced-auth-link" onClick={() => setIsLogin(false)}>Register now</button>
                </div>
              </form>
            )}

            {/* Register Form */}
            {!isLogin && (
              <form className="advanced-auth-form" onSubmit={handleRegisterSubmit}>
                <h2>Create Account</h2>
                <p className="advanced-auth-subtitle">Join India's most trusted clinical network</p>

                {registerErrors.general && <div className="advanced-auth-alert">{registerErrors.general}</div>}

                <div className="advanced-auth-field">
                  <label>Full Name</label>
                  <div className="advanced-auth-input-wrapper">
                    <User size={20} />
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={registerName}
                      onChange={(e) => {
                        setRegisterName(e.target.value);
                        setRegisterErrors((prev) => ({ ...prev, registerName: '' }));
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  {registerErrors.registerName && <p className="advanced-auth-error">{registerErrors.registerName}</p>}
                </div>

                <div className="advanced-auth-field">
                  <label>Email or Phone</label>
                  <div className="advanced-auth-input-wrapper">
                    <Mail size={20} />
                    <input
                      type="text"
                      placeholder="Enter your email or phone"
                      value={registerEmail}
                      onChange={(e) => {
                        setRegisterEmail(e.target.value);
                        setRegisterErrors((prev) => ({ ...prev, registerEmail: '' }));
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  {registerErrors.registerEmail && <p className="advanced-auth-error">{registerErrors.registerEmail}</p>}
                </div>

                <div className="advanced-auth-field">
                  <label>Password</label>
                  <div className="advanced-auth-input-wrapper">
                    <Lock size={20} />
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={registerPassword}
                      onChange={handlePasswordChange}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="advanced-auth-eye-button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      disabled={isLoading}
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                  {registerErrors.registerPassword && <p className="advanced-auth-error">{registerErrors.registerPassword}</p>}
                  <div className="advanced-auth-strength">
                    <span className={`strength-label ${passwordStrength >= 75 ? 'strong' : passwordStrength >= 45 ? 'medium' : 'weak'}`}>
                      {strengthLabel(passwordStrength)}
                    </span>
                    <div className="strength-bar">
                      <div className="strength-fill" style={{ width: `${passwordStrength}%`, backgroundColor: passwordStrength >= 75 ? '#10b981' : passwordStrength >= 45 ? '#f59e0b' : '#ef4444' }} />
                    </div>
                  </div>
                </div>

                <div className="advanced-auth-field">
                  <label>Confirm Password</label>
                  <div className="advanced-auth-input-wrapper">
                    <Lock size={20} />
                    <input
                      type={showRegisterConfirm ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={registerConfirm}
                      onChange={(e) => {
                        setRegisterConfirm(e.target.value);
                        setRegisterErrors((prev) => ({ ...prev, registerConfirm: '' }));
                      }}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="advanced-auth-eye-button"
                      onClick={() => setShowRegisterConfirm(!showRegisterConfirm)}
                      disabled={isLoading}
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                  {registerErrors.registerConfirm && <p className="advanced-auth-error">{registerErrors.registerConfirm}</p>}
                </div>

                <label className="advanced-auth-checkbox">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      setRegisterErrors((prev) => ({ ...prev, terms: '' }));
                    }}
                    disabled={isLoading}
                  />
                  <span>I agree to the Terms of Service and Privacy Policy</span>
                </label>
                {registerErrors.terms && <p className="advanced-auth-error">{registerErrors.terms}</p>}

                <button type="submit" className="advanced-auth-button" disabled={isLoading}>
                  {isLoading ? <><Loader size={18} className="spinner" /> Creating account...</> : <>Create Account <ArrowRight size={18} /></>}
                </button>

                <div className="advanced-auth-footer-text">
                  Already have an account? <button type="button" className="advanced-auth-link" onClick={() => setIsLogin(true)}>Login here</button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="advanced-auth-form-section">
          <div className="advanced-auth-card">
            {/* Logo & Branding */}
            <div className="advanced-auth-branding">
              <div className="advanced-auth-logo">DL</div>
              <div>
                <h3 className="advanced-auth-brand-name">DiagnoLabs</h3>
                <p className="advanced-auth-brand-tagline">Clinical Discovery</p>
              </div>
            </div>

            {/* Dynamic Content */}
            <div className="advanced-auth-dynamic-content">
              {isLogin ? (
                <div className="advanced-auth-content-item">
                  <div className="advanced-auth-icon"><ShieldCheck size={42} /></div>
                  <h3>Your Health, Our Priority</h3>
                  <p>Secure access to your medical records and test bookings.</p>
                  <div className="advanced-auth-image-wrap">
                    <img
                      src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80"
                      alt="Clinical consultation at a diagnostic center"
                      loading="lazy"
                    />
                  </div>
                  <div className="advanced-auth-features">
                    <span className="feature-badge">Quick Booking</span>
                    <span className="feature-badge">Real-time Results</span>
                    <span className="feature-badge">Secure Data</span>
                  </div>
                </div>
              ) : (
                <div className="advanced-auth-content-item">
                  <div className="advanced-auth-icon"><Microscope size={42} /></div>
                  <h3>Join Our Network</h3>
                  <p>Access India's most trusted NABL-certified laboratories.</p>
                  <div className="advanced-auth-image-wrap">
                    <img
                      src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80"
                      alt="Modern laboratory environment with advanced equipment"
                      loading="lazy"
                    />
                  </div>
                  <div className="advanced-auth-features">
                    <span className="feature-badge">NABL Certified</span>
                    <span className="feature-badge">Expert Diagnosis</span>
                    <span className="feature-badge">Trusted by Millions</span>
                  </div>
                </div>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="advanced-auth-trust">
              <div className="trust-item">
                <div className="trust-icon"><Building2 size={22} /></div>
                <div>
                  <p className="trust-number">500+</p>
                  <p className="trust-text">Partner Labs</p>
                </div>
              </div>
              <div className="trust-item">
                <div className="trust-icon"><ShieldCheck size={22} /></div>
                <div>
                  <p className="trust-number">NABL</p>
                  <p className="trust-text">Certified</p>
                </div>
              </div>
              <div className="trust-item">
                <div className="trust-icon"><Users size={22} /></div>
                <div>
                  <p className="trust-number">100K+</p>
                  <p className="trust-text">Users</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="advanced-auth-cta">
              <Link to="/" className="advanced-auth-cta-link">
                Learn More About DiagnoLabs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAuth;
