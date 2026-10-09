import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Globe,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  CheckCircle2,
  Mic,
  ChevronRight,
  ChevronLeft,
  Lock,
  QrCode,
  Thermometer,
  Layers
} from 'lucide-react';
import './Demo.css';
import BrandLogo from '../components/BrandLogo';

const Demo = () => {
  const [_mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoverMenu, setHoverMenu] = useState(null);
  const [activeTourIndex, setActiveTourIndex] = useState(0);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const navigate = useNavigate();

  const handleExitDemo = (targetPath, options = {}) => {
    if (synthRef.current) synthRef.current.cancel();
    localStorage.setItem('hasViewedDemo', 'true');
    navigate(targetPath, options);
  };

  const marketingTourSteps = [
    {
      id: 'nabl',
      icon: <Building2 size={26} className="text-amber-500" />,
      title: '500+ NABL Accredited Labs',
      subtitle: 'Real-Time Geospatial Discovery',
      badge: 'ISO 15189:2022 Certified',
      description: 'Find top-tier diagnostic centers within seconds. Our intelligent Haversine algorithm sorts certified laboratories by live GPS distance, transparent package pricing, and verified turnaround times.',
      stat: '500+ Certified Labs',
      statLabel: 'Across Major Indian Cities',
      speech: 'Welcome to DiagnoLabs! Step one: We bring together over 500 NABL accredited partner labs across India, giving you transparent pricing and instant GPS distance calculation to verified clinical centers.'
    },
    {
      id: 'voice',
      icon: <Mic size={26} className="text-teal-400" />,
      title: 'Universal Voice Automation',
      subtitle: '100% Hands-Free Operation',
      badge: 'English • Telugu • Hindi',
      description: 'Simply speak your symptoms like "I have fever and show labs near me". DiagnoLabs analyzes clinical etiology, maps the required tests, turns on GPS, and guides you through booking without typing a single word.',
      stat: '0 Typing Required',
      statLabel: 'Full Voice Control',
      speech: 'Step two: Experience hands-free voice automation. Just speak your symptoms in English, Telugu, or Hindi, and our AI analyzes the clinical tests you need and navigates the platform automatically.'
    },
    {
      id: 'coldchain',
      icon: <Thermometer size={26} className="text-sky-400" />,
      title: 'Cold-Chain Phlebotomy & OTP',
      subtitle: 'Digital Chain-of-Custody',
      badge: 'Zero Sample Degradation',
      description: 'Certified phlebotomists arrive at your doorstep equipped with temperature-regulated cold boxes. 4-digit OTP authentication guarantees your specimen is never tampered with or degraded in transit.',
      stat: '100% Verified',
      statLabel: 'Tamper-Proof Home Collection',
      speech: 'Step three: Our cold-chain home sample collection uses digital OTP verification and strict temperature monitoring, ensuring zero specimen degradation from your home directly to the lab.'
    },
    {
      id: 'qr',
      icon: <QrCode size={26} className="text-emerald-400" />,
      title: 'Tamper-Proof QR Lab Reports',
      subtitle: 'Cryptographic Authenticity',
      badge: 'Instant Verification',
      description: 'Every diagnostic report is digitally signed by accredited pathologists with a cryptographic QR code. Doctors can scan to verify authentic clinical results anytime, anywhere on mobile devices.',
      stat: '< 6 Hours',
      statLabel: 'Average Digital Delivery',
      speech: 'Step four: All reports feature a cryptographic QR code digitally signed by NABL pathologists, guaranteeing 100% tamper-proof medical authenticity accessible on any mobile phone.'
    },
    {
      id: 'roles',
      icon: <Layers size={26} className="text-indigo-400" />,
      title: '14-Tier Healthcare Ecosystem',
      subtitle: 'Unified Multi-Tenant Platform',
      badge: 'Doctors • Nurses • Labs',
      description: 'Seamlessly connects Patients, Pathologists, Radiologists, Phlebotomists, Quality Auditors, and Clinic Managers in one cohesive, secure healthcare cloud.',
      stat: '14 Dedicated Portals',
      statLabel: 'Role-Based Clinical Access',
      speech: 'Step five: DiagnoLabs unites 14 dedicated healthcare workspaces, connecting patients, doctors, and lab managers in one seamless cloud. Ready to begin? Click Get Started or say "Take me to login"!'
    }
  ];

  // 5-Second Automatic Carousel Shift Engine
  useEffect(() => {
    if (isNarrating) return; // When AI audio narration is active, it coordinates the pace

    const DURATION = 5000; // 5.0 seconds per slide
    const INTERVAL = 50; // Smooth 50ms ticks for progress bar
    let elapsed = 0;
    setSlideProgress(0);

    const timer = setInterval(() => {
      if (isHovered || !isAutoPlaying) return;

      elapsed += INTERVAL;
      setSlideProgress(Math.min((elapsed / DURATION) * 100, 100));

      if (elapsed >= DURATION) {
        elapsed = 0;
        setSlideProgress(0);
        setActiveTourIndex((prev) => (prev + 1) % marketingTourSteps.length);
      }
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [isNarrating, isHovered, isAutoPlaying, activeTourIndex, marketingTourSteps.length]);

  // Stop Speech when navigating away
  useEffect(() => {
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const speakMarketingText = useCallback((text, onComplete) => {
    if (!synthRef.current || typeof window === 'undefined') return;
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = synthRef.current.getVoices ? synthRef.current.getVoices() : [];
    const preferredVoice =
      voices.find(v => v.name.includes('Google UK English Female')) ||
      voices.find(v => v.name.includes('Google US English Female')) ||
      voices.find(v => v.name.toLowerCase().includes('female') && v.lang.startsWith('en')) ||
      voices.find(v => v.name.toLowerCase().includes('zira')) ||
      voices.find(v => v.name.toLowerCase().includes('samantha')) ||
      voices.find(v => v.lang === 'en-IN') ||
      voices.find(v => v.lang.startsWith('en'));

    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => {
      if (onComplete) onComplete();
    };
    utterance.onerror = () => {
      setIsNarrating(false);
    };

    synthRef.current.speak(utterance);
  }, []);

  const handlePlayVoiceTour = (startIndex = 0) => {
    setIsNarrating(true);
    let curr = startIndex;
    setActiveTourIndex(curr);

    const playNext = (index) => {
      if (index >= marketingTourSteps.length) {
        setIsNarrating(false);
        return;
      }
      setActiveTourIndex(index);
      speakMarketingText(marketingTourSteps[index].speech, () => {
        setTimeout(() => {
          playNext(index + 1);
        }, 1200);
      });
    };

    playNext(curr);
  };

  const handleStopVoiceTour = () => {
    if (synthRef.current) synthRef.current.cancel();
    setIsNarrating(false);
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
                        <img src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=300&h=160&q=80" alt="Metropolis Healthcare" />
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
          <div className="demo-hero-badge">
            <Sparkles size={14} className="text-amber-600" />
            <span>India's Most Advanced Clinical Network</span>
          </div>
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

          {/* AI Marketing Voice Product Tour Presenter - Exact Pixel-Perfect UI from User Mockup */}
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              gridColumn: 'span 12',
              width: '100%',
              maxWidth: '1040px',
              margin: '2rem auto 2.5rem',
              boxSizing: 'border-box',
              background: '#ffffff',
              borderRadius: '28px',
              padding: '1.75rem 2.25rem',
              boxShadow: '0 20px 50px rgba(10, 30, 70, 0.08), 0 2px 6px rgba(10, 30, 70, 0.04)',
              border: '1px solid #e2e8f0',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* 1. Header Control & Branding Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingBottom: '1.25rem'
            }}>
              {/* Left Brand + Tour Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                <div onClick={() => handleExitDemo('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}>
                  <BrandLogo size={36} />
                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0a1e46', letterSpacing: '-0.3px' }}>DiagnoLabs</span>
                    <span style={{ fontSize: '0.58rem', fontWeight: '800', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Clinical Discovery</span>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div style={{ width: '1px', height: '28px', background: '#e2e8f0' }} className="hidden sm:block" />

                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, color: '#0a1e46', letterSpacing: '-0.2px' }}>
                    Interactive AI Product Tour
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.15rem 0 0', fontWeight: '500' }}>
                    Listen to our marketing pitch or explore breakthrough capabilities
                  </p>
                </div>
              </div>

              {/* Right: Play Voice Tour Button */}
              <div>
                {isNarrating ? (
                  <button
                    onClick={handleStopVoiceTour}
                    style={{
                      padding: '0.6rem 1.3rem',
                      background: '#fee2e2',
                      border: '1px solid #fecaca',
                      borderRadius: '100px',
                      color: '#dc2626',
                      fontWeight: '700',
                      fontSize: '0.84rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Square size={14} className="fill-current" /> Stop Audio Tour
                  </button>
                ) : (
                  <button
                    onClick={() => handlePlayVoiceTour(activeTourIndex)}
                    style={{
                      padding: '0.65rem 1.45rem',
                      background: '#e0f2fe',
                      border: 'none',
                      borderRadius: '100px',
                      color: '#0369a1',
                      fontWeight: '800',
                      fontSize: '0.84rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.55rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Play size={15} className="fill-current text-[#0284c7]" /> Play Voice Tour (AI Audio)
                  </button>
                )}
              </div>
            </div>

            {/* 2. Main Slide Content Area (2-Column Layout) */}
            <div style={{
              background: '#f8fafc',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              padding: '1.75rem 2rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <AnimatePresence mode="wait">
                {marketingTourSteps[activeTourIndex] && (
                  <motion.div
                    key={marketingTourSteps[activeTourIndex].id}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                      gap: '2rem',
                      alignItems: 'center'
                    }}
                  >
                    {/* Left Column: Title, Description, ISO Badge & Watermark */}
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      {/* Icon */}
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: '#e0f2fe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0284c7',
                        marginBottom: '1rem'
                      }}>
                        {marketingTourSteps[activeTourIndex].icon}
                      </div>

                      <span style={{
                        fontSize: '0.74rem',
                        fontWeight: '800',
                        color: '#0284c7',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        display: 'block',
                        marginBottom: '0.35rem'
                      }}>
                        {marketingTourSteps[activeTourIndex].subtitle}
                      </span>

                      <h4 style={{
                        fontSize: '1.55rem',
                        fontWeight: '900',
                        color: '#0a1e46',
                        margin: '0 0 0.85rem',
                        letterSpacing: '-0.3px',
                        lineHeight: '1.2'
                      }}>
                        {marketingTourSteps[activeTourIndex].title}
                      </h4>

                      <p style={{
                        fontSize: '0.9rem',
                        lineHeight: '1.65',
                        color: '#475569',
                        margin: '0 0 1.25rem',
                        fontWeight: '400'
                      }}>
                        {marketingTourSteps[activeTourIndex].description}
                      </p>

                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.4rem 0.9rem',
                        background: '#dcfce7',
                        border: '1px solid #bbf7d0',
                        borderRadius: '100px',
                        fontSize: '0.76rem',
                        color: '#15803d',
                        fontWeight: '700'
                      }}>
                        <CheckCircle2 size={14} className="text-emerald-600 fill-emerald-100" />
                        {marketingTourSteps[activeTourIndex].badge}
                      </div>

                      {/* Soft Light-Blue Medical Cross Decor */}
                      <div style={{
                        position: 'absolute',
                        right: '-20px',
                        bottom: '-10px',
                        color: '#e0f2fe',
                        opacity: 0.6,
                        pointerEvents: 'none',
                        zIndex: -1
                      }}>
                        <svg width="90" height="90" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>
                        </svg>
                      </div>
                    </div>

                    {/* Right Column: Deep Royal Navy Featured Metric Card */}
                    <div style={{
                      background: 'radial-gradient(circle at 90% 15%, rgba(56, 189, 248, 0.22) 0%, transparent 60%), linear-gradient(135deg, #071739 0%, #0a2558 100%)',
                      borderRadius: '24px',
                      padding: '2rem 2.25rem',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 14px 34px rgba(10, 37, 88, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '230px'
                    }}>
                      {/* Top Right Map Pin Decor */}
                      <div style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        pointerEvents: 'none'
                      }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          background: 'rgba(56, 189, 248, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(56, 189, 248, 0.4)',
                          boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)'
                        }}>
                          <MapPin size={22} className="text-[#38bdf8] fill-[#0284c7]" />
                        </div>
                      </div>

                      {/* Metric Content */}
                      <div>
                        <span style={{
                          fontSize: '0.72rem',
                          color: '#94a3b8',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          letterSpacing: '0.8px'
                        }}>
                          KEY METRIC
                        </span>
                        <div style={{
                          fontSize: '2.4rem',
                          fontWeight: '900',
                          color: '#38bdf8',
                          letterSpacing: '-0.8px',
                          marginTop: '0.2rem',
                          lineHeight: '1.1'
                        }}>
                          {marketingTourSteps[activeTourIndex].stat}
                        </div>
                        <div style={{
                          fontSize: '0.88rem',
                          color: '#e2e8f0',
                          fontWeight: '500',
                          marginTop: '0.45rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}>
                          <MapPin size={15} className="text-[#38bdf8]" />
                          <span>{marketingTourSteps[activeTourIndex].statLabel}</span>
                        </div>
                      </div>

                      {/* Action Buttons Row - Compact & Sleek Single-Line */}
                      <div style={{ display: 'flex', gap: '0.55rem', marginTop: '1.25rem', alignItems: 'center' }}>
                        <button
                          onClick={() => handleExitDemo('/userlogin')}
                          style={{
                            flex: '1 1 auto',
                            padding: '0.55rem 0.95rem',
                            background: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '100px',
                            fontWeight: '700',
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Users size={13} className="shrink-0" />
                          <span>Login & Experience</span>
                          <ArrowRight size={13} className="shrink-0" />
                        </button>

                        <button
                          onClick={() => {
                            const next = (activeTourIndex + 1) % marketingTourSteps.length;
                            setActiveTourIndex(next);
                            setSlideProgress(0);
                            if (isNarrating) speakMarketingText(marketingTourSteps[next].speech);
                          }}
                          style={{
                            padding: '0.55rem 0.85rem',
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#ffffff',
                            borderRadius: '100px',
                            fontWeight: '600',
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s'
                          }}
                        >
                          <span>Next</span>
                          <ArrowRight size={12} className="shrink-0" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4. Bottom Conversion & Navigation Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingTop: '1.25rem',
              position: 'relative'
            }}>
              {/* Voice Command Hint */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#0284c7',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
                }}>
                  <Mic size={16} />
                </div>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Voice Command: Say <strong style={{ color: '#0284c7' }}>"Take me to login"</strong> or <strong style={{ color: '#0284c7' }}>"Explain demo"</strong>
                </span>
              </div>

              {/* Center Pagination Dots (Fixed Position for all slides) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                justifyContent: 'center'
              }}>
                {marketingTourSteps.map((_, idx) => {
                  const isActive = activeTourIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveTourIndex(idx);
                        setSlideProgress(0);
                        if (isNarrating) speakMarketingText(marketingTourSteps[idx].speech);
                      }}
                      title={`Go to slide ${idx + 1}`}
                      style={{
                        width: isActive ? '24px' : '7px',
                        height: '7px',
                        borderRadius: '100px',
                        background: isActive ? 'linear-gradient(90deg, #0284c7, #38bdf8)' : '#cbd5e1',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isActive ? '0 0 10px rgba(2, 132, 199, 0.6)' : 'none'
                      }}
                    />
                  );
                })}
              </div>

              {/* Navigation Arrows */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  onClick={() => {
                    const prev = (activeTourIndex - 1 + marketingTourSteps.length) % marketingTourSteps.length;
                    setActiveTourIndex(prev);
                    setSlideProgress(0);
                    if (isNarrating) speakMarketingText(marketingTourSteps[prev].speech);
                  }}
                  title="Previous Slide"
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    color: '#64748b',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  onClick={() => {
                    const next = (activeTourIndex + 1) % marketingTourSteps.length;
                    setActiveTourIndex(next);
                    setSlideProgress(0);
                    if (isNarrating) speakMarketingText(marketingTourSteps[next].speech);
                  }}
                  title="Next Slide"
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    color: '#64748b',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
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
