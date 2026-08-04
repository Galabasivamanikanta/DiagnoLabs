import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  ShieldCheck,
  MapPin,
  Activity,
  Users,
  Award,
  ArrowRight,
  Building2,
  BadgeCheck,
  FlaskConical,
  Globe
} from 'lucide-react';
import './Demo.css';
import BrandLogo from '../components/BrandLogo';

const Demo = () => {
  const [_mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoverMenu, setHoverMenu] = useState(null);
  const navigate = useNavigate();

  const handleExitDemo = (targetPath, options = {}) => {
    localStorage.setItem('hasViewedDemo', 'true');
    navigate(targetPath, options);
  };

  const features = [
    {
      icon: <Zap size={32} />,
      title: 'Quick Booking',
      description: 'Book your test appointment in seconds with our intuitive platform.'
    },
    {
      icon: <ShieldCheck size={32} />,
      title: 'NABL Certified',
      description: 'All partner labs meet NABL ISO 15189 standards for accuracy and reliability.'
    },
    {
      icon: <MapPin size={32} />,
      title: 'Nearby Labs',
      description: 'Find NABL-certified labs near you with real-time availability.'
    },
    {
      icon: <Activity size={32} />,
      title: 'Real-time Results',
      description: 'Access your test results online instantly with expert insights.'
    },
    {
      icon: <Users size={32} />,
      title: 'Expert Network',
      description: 'Connect with certified pathologists and lab professionals.'
    },
    {
      icon: <Award size={32} />,
      title: 'Premium Quality',
      description: 'Precision diagnostics with cutting-edge laboratory technology.'
    }
  ];

  const functionalities = [
    {
      number: '01',
      title: 'Search & Discover',
      description: 'Browse 500+ NABL-certified partner labs across India with detailed information.'
    },
    {
      number: '02',
      title: 'Smart Booking',
      description: 'Schedule appointments based on your preferred location and time slots.'
    },
    {
      number: '03',
      title: 'Secure Testing',
      description: 'Professional sample collection with secure chain-of-custody procedures.'
    },
    {
      number: '04',
      title: 'Online Results',
      description: 'Get certified reports with expert interpretations delivered securely.'
    }
  ];

  const partners = [
    { name: 'NABL Accredited', icon: <Building2 size={40} />, desc: 'ISO 15189:2022 Certified' },
    { name: 'CAP Laboratory', icon: <FlaskConical size={40} />, desc: 'College of American Pathologists' },
    { name: 'ISO Audited', icon: <BadgeCheck size={40} />, desc: 'Quality Management System' },
    { name: 'Premium Networks', icon: <Globe size={40} />, desc: '500+ Lab Partners' }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="demo-container">
      {/* Demo-specific header */}
      <header className="demo-custom-navbar">
        <div className="demo-custom-left">
          <div onClick={() => handleExitDemo('/')} className="demo-brand" style={{ cursor: 'pointer' }}>
            <BrandLogo size={40} />
            <div className="demo-brand-text">
              <span className="demo-brand-name">DiagnoLabs</span>
              <span className="demo-brand-tag">Clinical Discovery</span>
            </div>
          </div>
        </div>

        <nav className="demo-custom-center">
          {/* ABOUT Mega Menu */}
          <div
            className="demo-nav-item-wrapper"
            onMouseEnter={() => setHoverMenu('about')}
            onMouseLeave={() => setHoverMenu(null)}
          >
            <button className={`demo-nav-link ${hoverMenu === 'about' ? 'active' : ''}`}>About</button>
            {hoverMenu === 'about' && (
              <div className="demo-mega-menu demo-mega-about">
                <div className="demo-mega-inner">
                  <div className="demo-mega-card demo-mega-card-highlight">
                    <div className="demo-mega-card-img">
                      <img src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80" alt="Lab" />
                    </div>
                    <div className="demo-mega-card-body">
                      <span className="demo-mega-badge">Est. 2020</span>
                      <h3>Our Mission</h3>
                      <p>Democratizing world-class diagnostics for every Indian.</p>
                    </div>
                  </div>
                  <div className="demo-mega-card demo-mega-card-highlight">
                    <div className="demo-mega-card-img">
                      <img src="https://images.unsplash.com/photo-1581595219315-a187dd40c322?auto=format&fit=crop&w=600&q=80" alt="Team" />
                    </div>
                    <div className="demo-mega-card-body">
                      <span className="demo-mega-badge">100K+ Patients</span>
                      <h3>Our Vision</h3>
                      <p>Precision clinical discovery at every doorstep across India.</p>
                    </div>
                  </div>
                  <div className="demo-mega-links-col">
                    <h4 className="demo-mega-col-title">Company</h4>
                    <a className="demo-mega-link" href="#about"><img className="demo-mega-link-img" src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=48&h=48&q=80" alt="Our Story" />Our Story</a>
                    <a className="demo-mega-link" href="#about"><img className="demo-mega-link-img" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=48&h=48&q=80" alt="Leadership" />Leadership Team</a>
                    <a className="demo-mega-link" href="#about"><img className="demo-mega-link-img" src="https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=48&h=48&q=80" alt="Awards" />Awards & Recognition</a>
                    <a className="demo-mega-link" href="#about"><img className="demo-mega-link-img" src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=48&h=48&q=80" alt="Press" />Press & Media</a>
                    <a className="demo-mega-link" href="#about"><img className="demo-mega-link-img" src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=48&h=48&q=80" alt="Careers" />Careers</a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FEATURES Mega Menu */}
          <div
            className="demo-nav-item-wrapper"
            onMouseEnter={() => setHoverMenu('features')}
            onMouseLeave={() => setHoverMenu(null)}
          >
            <button className={`demo-nav-link ${hoverMenu === 'features' ? 'active' : ''}`}>Features</button>
            {hoverMenu === 'features' && (
              <div className="demo-mega-menu demo-mega-features">
                <div className="demo-mega-inner">
                  <div className="demo-mega-feature-grid">
                    <div className="demo-mega-feature-item">
                      <div className="demo-mega-feature-icon-img">
                        <img src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=80&h=80&q=80" alt="AI Diagnostics" />
                      </div>
                      <div>
                        <h4>AI-Powered Diagnostics</h4>
                        <p>Smart analysis with ML-powered accuracy for faster results.</p>
                      </div>
                    </div>
                    <div className="demo-mega-feature-item">
                      <div className="demo-mega-feature-icon-img">
                        <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=80&h=80&q=80" alt="Real-time Tracking" />
                      </div>
                      <div>
                        <h4>Real-time Tracking</h4>
                        <p>Live updates on your test status and sample progress.</p>
                      </div>
                    </div>
                    <div className="demo-mega-feature-item">
                      <div className="demo-mega-feature-icon-img">
                        <img src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=80&h=80&q=80" alt="Secure Data" />
                      </div>
                      <div>
                        <h4>Secure Data Storage</h4>
                        <p>End-to-end encrypted health records, HIPAA compliant.</p>
                      </div>
                    </div>
                    <div className="demo-mega-feature-item">
                      <div className="demo-mega-feature-icon-img">
                        <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=80&h=80&q=80" alt="Expert Consultation" />
                      </div>
                      <div>
                        <h4>Expert Consultations</h4>
                        <p>Connect with certified pathologists for report insights.</p>
                      </div>
                    </div>
                    <div className="demo-mega-feature-item">
                      <div className="demo-mega-feature-icon-img">
                        <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=80&h=80&q=80" alt="Nearby Lab" />
                      </div>
                      <div>
                        <h4>Nearby Lab Finder</h4>
                        <p>Locate NABL labs within 5 km with real-time slots.</p>
                      </div>
                    </div>
                    <div className="demo-mega-feature-item">
                      <div className="demo-mega-feature-icon-img">
                        <img src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=80&h=80&q=80" alt="Digital Reports" />
                      </div>
                      <div>
                        <h4>Digital Reports</h4>
                        <p>Instant certified PDF reports shared to your phone.</p>
                      </div>
                    </div>
                  </div>
                  <div className="demo-mega-cta-strip">
                    <span>Ready to experience precision diagnostics?</span>
                    <button className="demo-btn demo-btn-primary" onClick={() => handleExitDemo('/userlogin', { state: { tab: 'citizen' } })}>Get Started →</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PARTNERS Mega Menu */}
          <div
            className="demo-nav-item-wrapper"
            onMouseEnter={() => setHoverMenu('partners')}
            onMouseLeave={() => setHoverMenu(null)}
          >
            <button className={`demo-nav-link ${hoverMenu === 'partners' ? 'active' : ''}`}>Partners</button>
            {hoverMenu === 'partners' && (
              <div className="demo-mega-menu demo-mega-partners">
                <div className="demo-mega-inner">
                  <div className="demo-mega-partner-grid">
                    {/* Apollo Diagnostics */}
                    <div className="demo-mega-partner-card">
                      <div className="demo-mega-partner-img">
                        <img src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=300&h=160&q=80" alt="Apollo Diagnostics" />
                        <div className="demo-mega-partner-logo-overlay">
                          <img className="demo-partner-real-logo" src="/images/partners/apollo.png" alt="Apollo Diagnostics Logo" />
                        </div>
                      </div>
                      <div className="demo-mega-partner-info">
                        <h4>Apollo Diagnostics</h4>
                        <p>250+ centres across India</p>
                        <span className="demo-mega-partner-tag">NABL Certified</span>
                      </div>
                    </div>
                    {/* Dr. Lal PathLabs */}
                    <div className="demo-mega-partner-card">
                      <div className="demo-mega-partner-img">
                        <img src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=300&h=160&q=80" alt="Dr. Lal PathLabs" />
                        <div className="demo-mega-partner-logo-overlay">
                          <img className="demo-partner-real-logo" src="/images/partners/drlal.png" alt="Dr. Lal PathLabs Logo" />
                        </div>
                      </div>
                      <div className="demo-mega-partner-info">
                        <h4>Dr. Lal PathLabs</h4>
                        <p>200+ collection points</p>
                        <span className="demo-mega-partner-tag">ISO Audited</span>
                      </div>
                    </div>
                    {/* Thyrocare */}
                    <div className="demo-mega-partner-card">
                      <div className="demo-mega-partner-img">
                        <img src="https://images.unsplash.com/photo-1581595219315-a187dd40c322?auto=format&fit=crop&w=300&h=160&q=80" alt="Thyrocare" />
                        <div className="demo-mega-partner-logo-overlay">
                          <img className="demo-partner-real-logo" src="/images/partners/thyrocare.png" alt="Thyrocare Logo" />
                        </div>
                      </div>
                      <div className="demo-mega-partner-info">
                        <h4>Thyrocare</h4>
                        <p>Specialised thyroid testing</p>
                        <span className="demo-mega-partner-tag">CAP Accredited</span>
                      </div>
                    </div>
                    {/* Metropolis Healthcare */}
                    <div className="demo-mega-partner-card">
                      <div className="demo-mega-partner-img">
                        <img src="https://images.unsplash.com/photo-1530026405186-ed1f139313f3?auto=format&fit=crop&w=300&h=160&q=80" alt="Metropolis Healthcare" />
                        <div className="demo-mega-partner-logo-overlay">
                          <img className="demo-partner-real-logo" src="/images/partners/metropolis.png" alt="Metropolis Healthcare Logo" />
                        </div>
                      </div>
                      <div className="demo-mega-partner-info">
                        <h4>Metropolis Healthcare</h4>
                        <p>Advanced molecular tests</p>
                        <span className="demo-mega-partner-tag">NABL Certified</span>
                      </div>
                    </div>
                  </div>
                  <div className="demo-mega-partners-footer">
                    <span>500+ partner labs across 50 cities</span>
                    <a href="#partners" className="demo-mega-view-all">View All Partners →</a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CONTACT Mega Menu */}
          <div
            className="demo-nav-item-wrapper"
            onMouseEnter={() => setHoverMenu('contact')}
            onMouseLeave={() => setHoverMenu(null)}
          >
            <button className={`demo-nav-link ${hoverMenu === 'contact' ? 'active' : ''}`}>Contact</button>
            {hoverMenu === 'contact' && (
              <div className="demo-mega-menu demo-mega-contact">
                <div className="demo-mega-inner">
                  <div className="demo-mega-contact-grid">
                    <div className="demo-mega-contact-item">
                      <div className="demo-mega-contact-icon-img">
                        <img src="https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=80&h=80&q=80" alt="Email" />
                      </div>
                      <div>
                        <h4>Email Us</h4>
                        <p>support@diagnolabs.in</p>
                        <span>Response within 24 hours</span>
                      </div>
                    </div>
                    <div className="demo-mega-contact-item">
                      <div className="demo-mega-contact-icon-img">
                        <img src="https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&w=80&h=80&q=80" alt="Call" />
                      </div>
                      <div>
                        <h4>Call Us</h4>
                        <p>1800-123-4567</p>
                        <span>Mon–Sat, 8 AM – 8 PM</span>
                      </div>
                    </div>
                    <div className="demo-mega-contact-item">
                      <div className="demo-mega-contact-icon-img">
                        <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=80&h=80&q=80" alt="Location" />
                      </div>
                      <div>
                        <h4>Headquarters</h4>
                        <p>Hyderabad, Telangana</p>
                        <span>India – 500001</span>
                      </div>
                    </div>
                    <div className="demo-mega-contact-item">
                      <div className="demo-mega-contact-icon-img">
                        <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=80&h=80&q=80" alt="Live Chat" />
                      </div>
                      <div>
                        <h4>Live Chat</h4>
                        <p>Talk to an expert now</p>
                        <span>Available 24/7</span>
                      </div>
                    </div>
                  </div>
                  <div className="demo-mega-cta-strip">
                    <span>Need immediate assistance?</span>
                    <button className="demo-btn demo-btn-primary" onClick={() => handleExitDemo('/userlogin')}>Book a Call →</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>


        <div className="demo-custom-right">
          <div className="demo-auth-buttons">
            <button className="demo-btn demo-btn-secondary" style={{ border: '1px solid var(--demo-accent)' }} onClick={() => handleExitDemo('/')}>Explore Site</button>
            <button className="demo-btn demo-btn-secondary" onClick={() => handleExitDemo('/userlogin')}>Login</button>
            <button className="demo-btn demo-btn-primary" onClick={() => handleExitDemo('/userlogin', { state: { tab: 'citizen' } })}>Register</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="demo-hero">
        <div className="demo-hero-content">
          <div className="demo-hero-badge">India's Most Advanced Clinical Network</div>
          <h1 className="demo-hero-title">Precision Discovery.<br /><span>Expert Diagnosis.</span></h1>
          <p className="demo-hero-subtitle">Unified gateway to India's most trusted NABL-certified clinical networks with cutting-edge technology and expert pathologists.</p>
          <div className="demo-hero-buttons">
            <button className="demo-btn demo-btn-primary demo-btn-large" onClick={() => handleExitDemo('/userlogin', { state: { tab: 'citizen' } })}>
              Get Started <ArrowRight size={20} />
            </button>
            <button className="demo-btn demo-btn-secondary demo-btn-large" onClick={() => handleExitDemo('/')}>
              Explore as Guest <ArrowRight size={20} />
            </button>
          </div>
          <div className="demo-hero-stats">
            <div className="demo-stat">
              <p className="demo-stat-number">500+</p>
              <p className="demo-stat-label">Partner Labs</p>
            </div>
            <div className="demo-stat">
              <p className="demo-stat-number">100K+</p>
              <p className="demo-stat-label">Users Trust Us</p>
            </div>
            <div className="demo-stat">
              <p className="demo-stat-number">NABL</p>
              <p className="demo-stat-label">Certified</p>
            </div>
          </div>

          <div className="demo-hero-image-grid">
            <article className="demo-hero-image-card">
              <img
                src="https://images.unsplash.com/photo-1581595219315-a187dd40c322?auto=format&fit=crop&w=1200&q=80"
                alt="Certified diagnostics team in laboratory workspace"
                loading="lazy"
              />
              <div className="demo-hero-image-meta">
                <h3>Certified Clinical Teams</h3>
                <p>Qualified specialists delivering precise reports with strict quality controls.</p>
              </div>
            </article>
            <article className="demo-hero-image-card">
              <img
                src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80"
                alt="Advanced diagnostic equipment in modern medical lab"
                loading="lazy"
              />
              <div className="demo-hero-image-meta">
                <h3>Advanced Lab Infrastructure</h3>
                <p>Modern diagnostics powered by NABL-aligned workflows and secure data handling.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="demo-features" id="features">
        <div className="demo-container-inner">
          <h2 className="demo-section-title">Why DiagnoLabs?</h2>
          <p className="demo-section-subtitle">Everything you need for precision diagnostics, all in one place.</p>
          <div className="demo-features-grid">
            {features.map((feature, index) => (
              <div key={index} className="demo-feature-card">
                <div className="demo-feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="demo-how-it-works" id="about">
        <div className="demo-container-inner">
          <h2 className="demo-section-title">How It Works</h2>
          <p className="demo-section-subtitle">Simple, secure, and transparent — every step of the way.</p>
          <div className="demo-steps">
            {functionalities.map((step, index) => (
              <div key={index} className="demo-step-card">
                <div className="demo-step-number">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="demo-partners" id="partners">
        <div className="demo-container-inner">
          <h2 className="demo-section-title">Our Certifications</h2>
          <p className="demo-section-subtitle">Trusted by India's most respected diagnostic standards.</p>
          <div className="demo-partners-grid">
            {partners.map((partner, index) => (
              <div key={index} className="demo-partner-card">
                <div className="demo-partner-icon">{partner.icon}</div>
                <h3>{partner.name}</h3>
                <p>{partner.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="demo-cta">
        <div className="demo-container-inner">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of patients who trust DiagnoLabs for precise, reliable diagnostics.</p>
          <div className="demo-cta-buttons">
            <button className="demo-btn demo-btn-primary demo-btn-large" onClick={() => handleExitDemo('/userlogin', { state: { tab: 'citizen' } })}>
              Create Account <ArrowRight size={20} />
            </button>
            <button className="demo-btn demo-btn-secondary demo-btn-large" onClick={() => handleExitDemo('/')}>
              Explore Platform
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="demo-footer" id="contact">
        <div className="demo-container-inner">
          <div className="demo-footer-content">
            <div className="demo-footer-brand">
              <div className="demo-logo">
                <span className="demo-logo-mark">DL</span>
                <span className="demo-logo-text">DiagnoLabs</span>
              </div>
              <p>India's most advanced clinical discovery network with NABL-certified precision.</p>
            </div>

            <div className="demo-footer-links">
              <div className="demo-footer-col">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#about">About Us</a>
                <a href="#partners">Partners</a>
              </div>
              <div className="demo-footer-col">
                <h4>Company</h4>
                <a href="#contact">Contact</a>
                <a href="/">Privacy Policy</a>
                <a href="/">Terms of Service</a>
              </div>
              <div className="demo-footer-col">
                <h4>Quick Links</h4>
                <button onClick={() => handleExitDemo('/userlogin')} className="demo-footer-link">Login</button>
                <button onClick={() => handleExitDemo('/userlogin', { state: { tab: 'citizen' } })} className="demo-footer-link">Register</button>
                <button onClick={() => handleExitDemo('/')} className="demo-footer-link" style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'inherit', cursor: 'pointer', textAlign: 'left', textDecoration: 'none' }}>Home</button>
              </div>
            </div>
          </div>

          <div className="demo-footer-bottom">
            <p>&copy; 2024 DiagnoLabs. All rights reserved. | NABL Certified | ISO 15189:2022</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Demo;
