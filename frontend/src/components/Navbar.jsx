import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MapPin, User, LogOut, LayoutDashboard, ChevronDown, Menu, X, Clock } from 'lucide-react';
import BrandLogo from './BrandLogo';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Hide navbar on auth and dashboard pages
    const hideNavbarPaths = ['/admin/dashboard', '/login', '/register', '/partner/login', '/admin/login', '/demo'];
    if (hideNavbarPaths.includes(location.pathname)) return null;

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            transition: 'var(--transition)',
            padding: scrolled ? '0.8rem 0' : '1.5rem 0',
            background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
            backdropFilter: scrolled ? 'blur(16px)' : 'none',
            borderBottom: scrolled ? '1px solid var(--border-light)' : '1px solid transparent',
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Authority Brand Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
                    <BrandLogo size={48} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                            DiagnoLabs
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--accent-gold)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2.5px', marginTop: '4px' }}>
                            Clinical Discovery
                        </span>
                    </div>
                </Link>

                {/* Unified Gateway Menu */}
                <div className="desktop-menu" style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        {(!user || (user.role !== 'lab_partner' && user.role !== 'admin' && user.role !== 'employee')) ? (
                            <>
                                <Link to="/" className="nav-link">Home</Link>
                                <Link to="/labs" className="nav-link">Medical Partners</Link>
                                <Link to="/nearby-search" className="nav-link-special">
                                    <MapPin size={16} /> Near Me
                                </Link>
                            </>
                        ) : user.role === 'lab_partner' ? (
                            <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--primary)' }}>
                                Pathology Lab Workbench
                            </span>
                        ) : (
                            <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--primary)' }}>
                                System Control Console
                            </span>
                        )}
                    </div>

                    <div style={{ height: '32px', width: '1px', background: 'var(--border)' }}></div>

                    {user ? (
                        <div className="profile-section" style={{ position: 'relative', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ textAlign: 'right' }} className="hide-mobile">
                                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)' }}>{user.name}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--accent-gold)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {user.role === 'admin' ? 'Administrator' : user.role === 'lab_partner' ? 'Lab Partner' : 'Patient'}
                                    </div>
                                </div>
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: 'var(--primary-light)',
                                    color: 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '800',
                                    fontSize: '0.95rem',
                                    border: '1px solid rgba(0, 51, 102, 0.1)',
                                }}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                            </div>

                            {/* Premium Dropdown */}
                            <div className="profile-dropdown shadow-premium" style={{
                                position: 'absolute',
                                top: '120%',
                                right: 0,
                                minWidth: '260px',
                                background: 'white',
                                borderRadius: '20px',
                                border: '1px solid var(--border-light)',
                                padding: '0.75rem',
                                display: 'none',
                                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}>
                                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)', marginBottom: '0.5rem' }}>
                                    <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1rem' }}>{user.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>{user.email}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    {user.role === 'admin' ? (
                                        <Link to="/admin/dashboard" className="dropdown-item">
                                            <LayoutDashboard size={18} /> Admin Dashboard
                                        </Link>
                                    ) : user.role === 'lab_partner' ? (
                                        <>
                                            <Link to="/partner/dashboard" className="dropdown-item">
                                                <LayoutDashboard size={18} /> Partner Workbench
                                            </Link>
                                            <button onClick={() => navigate('/partner/dashboard', { state: { tab: 'profile' } })} className="dropdown-item">
                                                <User size={18} /> Profile & Settings
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link to="/patient/profile" className="dropdown-item">
                                                <User size={18} /> Profile
                                            </Link>
                                            <Link to="/patient/history" className="dropdown-item">
                                                <Clock size={18} /> History
                                            </Link>
                                        </>
                                    )}
                                    <button onClick={handleLogout} className="dropdown-item text-danger">
                                        <LogOut size={18} /> Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="mobile-toggle" style={{ display: 'none' }}>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Content */}
            {mobileMenuOpen && (
                <div className="mobile-menu-content" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    padding: '1rem',
                    borderBottom: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-premium)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    animation: 'slideUp 0.3s ease'
                }}>
                    <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                    <Link to="/labs" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Medical Partners</Link>
                    <Link to="/nearby-search" className="nav-link-special" style={{ width: 'fit-content' }} onClick={() => setMobileMenuOpen(false)}>
                        <MapPin size={16} /> Near Me
                    </Link>
                    {user ? (
                        <>
                            <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.5rem 0' }}></div>
                            <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>{user.name}</div>
                            {user.role === 'admin' ? (
                                <Link to="/admin/dashboard" className="dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                                    <LayoutDashboard size={18} /> Admin Dashboard
                                </Link>
                            ) : user.role === 'lab_partner' ? (
                                <Link to="/partner/dashboard" className="dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                                    <LayoutDashboard size={18} /> Partner Workbench
                                </Link>
                            ) : (
                                <>
                                    <Link to="/patient/profile" className="dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                                        <User size={18} /> Profile
                                    </Link>
                                    <Link to="/patient/history" className="dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                                        <Clock size={18} /> History
                                    </Link>
                                </>
                            )}
                            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="dropdown-item text-danger">
                                <LogOut size={18} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.5rem 0' }}></div>
                            <Link to="/login" className="dropdown-item" onClick={() => setMobileMenuOpen(false)}>Login / Register</Link>
                        </>
                    )}
                </div>
            )}

            <style>{`
                .nav-link {
                    text-decoration: none;
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: var(--text-secondary);
                    transition: var(--transition);
                    position: relative;
                }
                .nav-link:hover {
                    color: var(--primary);
                }
                .nav-link-special {
                    text-decoration: none;
                    font-size: 0.85rem;
                    font-weight: 800;
                    color: white;
                    background: var(--accent-gold);
                    padding: 0.6rem 1.4rem;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    box-shadow: 0 4px 12px rgba(197, 160, 89, 0.2);
                    transition: var(--transition);
                }
                .nav-link-special:hover {
                    background: var(--accent-gold-hover);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(197, 160, 89, 0.3);
                }
                .profile-section:hover .profile-dropdown {
                    display: block !important;
                }
                .dropdown-item {
                    padding: 0.85rem 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.85rem;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 0.9rem;
                    text-decoration: none;
                    color: var(--text-secondary);
                    transition: var(--transition);
                    border: none;
                    background: transparent;
                    width: 100%;
                    text-align: left;
                    cursor: pointer;
                }
                .dropdown-item:hover {
                    background: var(--primary-light);
                    color: var(--primary);
                }
                .text-danger:hover {
                    background: #fef2f2 !important;
                    color: #dc2626 !important;
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @media (max-width: 1024px) {
                    .desktop-menu { display: none !important; }
                    .mobile-toggle { display: block !important; }
                    .hide-mobile { display: none !important; }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
