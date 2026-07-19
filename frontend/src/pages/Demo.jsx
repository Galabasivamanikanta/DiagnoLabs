import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  X,
  Zap,
  ShieldCheck,
  MapPin,
  Activity,
  Users,
  Award,
  ArrowRight,
  Heart,
  Clock,
  Microscope,
  Mail,
  Phone,
  MapPinIcon,
  Building2,
  BadgeCheck,
  FlaskConical,
  Globe
} from 'lucide-react';
import './Demo.css';
import BrandLogo from '../components/BrandLogo';

const Demo = () => {
  const [_mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="demo-container">
      {/* Demo-specific header: left = logo + auth, center = reference links */}
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
          <button onClick={() => scrollToSection('about')} className="demo-nav-link">About</button>
          <button onClick={() => scrollToSection('features')} className="demo-nav-link">Features</button>
          <button onClick={() => scrollToSection('partners')} className="demo-nav-link">Partners</button>
          <button onClick={() => scrollToSection('contact')} className="demo-nav-link">Contact</button>
        </nav>

        <div className="demo-custom-right">
          <div className="demo-auth-buttons">
            <button className="demo-btn demo-btn-secondary" style={{ border: '1px solid var(--demo-accent)' }} onClick={() => handleExitDemo('/')}>Explore Site</button>
            <button className="demo-btn demo-btn-secondary" onClick={() => handleExitDemo('/login')}>Login</button>
            <button className="demo-btn demo-btn-primary" onClick={() => handleExitDemo('/login', { state: { tab: 'citizen' } })}>Register</button>
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
            <button className="demo-btn demo-btn-primary demo-btn-large" onClick={() => handleExitDemo('/login', { state: { tab: 'citizen' } })}>
              Get Started <ArrowRight size={20} />
            </button>
            <button className="demo-btn demo-btn-secondary demo-btn-large" onClick={() => handleExitDemo('/')}>
              Explore as Guest <ArrowRight size={20} />
            </button>
            <button className="demo-btn demo-btn-secondary demo-btn-large" style={{ border: 'none' }} onClick={() => scrollToSection('about')}>
              Learn More
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

      {/* About Section */}
      <section id="about" className="demo-section demo-about">
        <div className="demo-container-inner">
          <div className="demo-section-header">
            <h2>Why Choose DiagnoLabs?</h2>
            <p>Your trusted partner for accurate, reliable, and accessible clinical diagnostics</p>
          </div>

          <div className="demo-about-content">
            <div className="demo-about-item">
              <div className="demo-about-icon">
                <Heart size={32} />
              </div>
              <h3>Our Mission</h3>
              <p>To democratize access to world-class diagnostic services across India with NABL-certified precision and patient-centric care, ensuring every individual gets accurate health insights quickly and affordably.</p>
            </div>

            <div className="demo-about-item">
              <div className="demo-about-icon">
                <Microscope size={32} />
              </div>
              <h3>Our Vision</h3>
              <p>Bring precision clinical discovery to every doorstep. We envision a healthcare ecosystem where advanced diagnostics are accessible, affordable, and trusted by millions across Southeast Asia.</p>
            </div>

            <div className="demo-about-item">
              <div className="demo-about-icon">
                <Award size={32} />
              </div>
              <h3>Our Values</h3>
              <p>Accuracy, reliability, transparency, and compassion. Every test result represents our commitment to excellence and your trust in our expertise. We maintain the highest standards of quality and ethics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="demo-section demo-features">
        <div className="demo-container-inner">
          <div className="demo-section-header">
            <h2>Key Features</h2>
            <p>Everything you need for convenient and reliable diagnostic testing</p>
          </div>

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

      {/* Functionalities Section */}
      <section className="demo-section demo-functionalities">
        <div className="demo-container-inner">
          <div className="demo-section-header">
            <h2>How It Works</h2>
            <p>Simple, secure, and seamless diagnostic experience</p>
          </div>

          <div className="demo-functionalities-list">
            {functionalities.map((item, index) => (
              <div key={index} className="demo-functionality-item">
                <div className="demo-functionality-number">{item.number}</div>
                <div className="demo-functionality-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                {index < functionalities.length - 1 && <div className="demo-functionality-arrow"><ArrowRight size={24} /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="demo-section demo-partners">
        <div className="demo-container-inner">
          <div className="demo-section-header">
            <h2>Trusted Partners</h2>
            <p>Accreditations and certifications that ensure quality</p>
          </div>

          <div className="demo-partners-grid">
            {partners.map((partner, index) => (
              <div key={index} className="demo-partner-card">
                <div className="demo-partner-icon">{partner.icon}</div>
                <h3>{partner.name}</h3>
                <p>{partner.desc}</p>
              </div>
            ))}
          </div>

          <div className="demo-certifications">
            <p>ISO 15189:2022 Certified | CAP Accredited | Quality Assured | NABL Registered</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="demo-section demo-cta">
        <div className="demo-container-inner">
          <div className="demo-cta-content">
            <h2>Ready to Experience Better Diagnostics?</h2>
            <p>Join thousands of patients who trust DiagnoLabs for accurate, reliable, and accessible testing.</p>
            <button className="demo-btn demo-btn-primary demo-btn-large" onClick={() => handleExitDemo('/login', { state: { tab: 'citizen' } })}>
              Get Started Now <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="demo-section demo-contact">
        <div className="demo-container-inner">
          <div className="demo-section-header">
            <h2>Get in Touch</h2>
            <p>Have questions? We're here to help!</p>
          </div>

          <div className="demo-contact-grid">
            <div className="demo-contact-card">
              <div className="demo-contact-icon">
                <Mail size={28} />
              </div>
              <h3>Email Us</h3>
              <p>support@diagnolabs.in</p>
              <a href="mailto:support@diagnolabs.in" className="demo-contact-link">Send Email</a>
            </div>

            <div className="demo-contact-card">
              <div className="demo-contact-icon">
                <Phone size={28} />
              </div>
              <h3>Call Us</h3>
              <p>+91 (XXX) XXX-XXXX</p>
              <a href="tel:+911234567890" className="demo-contact-link">Call Now</a>
            </div>

            <div className="demo-contact-card">
              <div className="demo-contact-icon">
                <MapPinIcon size={28} />
              </div>
              <h3>Visit Us</h3>
              <p>DiagnoLabs Head Office, India</p>
              <a href="#" className="demo-contact-link">Get Directions</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="demo-footer">
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
                <button onClick={() => handleExitDemo('/login')} className="demo-footer-link">Login</button>
                <button onClick={() => handleExitDemo('/login', { state: { tab: 'citizen' } })} className="demo-footer-link">Register</button>
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
