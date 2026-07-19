import { useEffect, useState } from 'react';
import { Shield, Users, Sparkles, Activity } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import '../pages/Auth.css';

const ease = [0.16, 1, 0.3, 1];

const AuthLayout = ({
  pageTitle,
  pageSubtitle,
  showTabs,
  tabs,
  activeTab,
  onTabChange,
  children
}) => {
  const [reduceMotion, setReduceMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fn = (e) => setReduceMotion(e.matches);
    mq.addEventListener?.('change', fn);
    return () => mq.removeEventListener?.('change', fn);
  }, []);

  const cardT = reduceMotion ? { duration: 0 } : { duration: 0.55, ease };

  return (
    <main className="dl-page-shell">
      {/* Background SVG Curve */}
      <div className="dl-bg-curve" aria-hidden="true">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="dl-curve-svg">
          {/* Defs for gradients */}
          <defs>
            <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0a1a44" />
              <stop offset="100%" stopColor="#040b20" />
            </linearGradient>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4a754" />
              <stop offset="50%" stopColor="#f3d790" />
              <stop offset="100%" stopColor="#c5963b" />
            </linearGradient>
            {/* Hexagon pattern for left side */}
            <pattern id="hexagons" width="40" height="69.282" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
               <path d="M40 17.32l-20 11.547L0 17.32V-5.774l20-11.547L40-5.774V17.32zm0 46.188l-20 11.548-20-11.548V40.414L0 28.867 20 40.414l20-11.547v23.094z" fill="none" stroke="#e0eaf5" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Left light background with hex pattern */}
          <rect width="1440" height="900" fill="url(#hexagons)" opacity="0.6" />

          {/* Dark Blue Right Section with S-Curve and Gold Border */}
          <path 
            d="M1440 0V900H300C650 700 250 250 800 0H1440Z" 
            fill="url(#bgGrad)" 
            stroke="url(#goldGrad)" 
            strokeWidth="12"
          />
        </svg>

        {/* Faint tech particles on the dark blue side */}
        <div className="dl-tech-particles"></div>
      </div>

      <aside className="dl-hero-panel">
        <div className="dl-hero-content">
          <div className="dl-brand-bar">
            <div className="dl-logo-mark-custom">
              {/* Custom SVG logo based on image */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#e2e8f0" />
                <path d="M4 12h3l3 -5 4 10 3 -5h3" stroke="#d4a754" strokeWidth="2.5" />
              </svg>
            </div>
            <div>
              <p className="dl-logo-name">DiagnoLabs</p>
              <p className="dl-logo-label">CLINICAL DISCOVERY</p>
            </div>
          </div>

          <div className="dl-hero-badge">
            <div className="dl-badge-icon">AI</div>
            CLINICAL DISCOVERY GATEWAY ACTIVE
          </div>

          <h1 className="dl-hero-title">
            Precision<br/>Discovery.<br/>
            <span>Expert<br/>Diagnosis.</span>
          </h1>

          <p className="dl-hero-text">
            Unified gateway to India's most advanced<br/>
            clinical networks with NABL-certified<br/>
            precision.
          </p>

          <div className="dl-feature-list">
            <div className="dl-feature-item">
              <div className="dl-feature-icon-box dl-icon-blue">
                <Shield size={20} />
              </div>
              <div>
                <strong>Accurate</strong>
                <p>NABL-certified precision</p>
              </div>
            </div>
            <div className="dl-feature-item">
              <div className="dl-feature-icon-box dl-icon-blue">
                <Users size={20} />
              </div>
              <div>
                <strong>Reliable</strong>
                <p>Trusted by millions</p>
              </div>
            </div>
            <div className="dl-feature-item">
              <div className="dl-feature-icon-box dl-icon-blue">
                <Sparkles size={20} />
              </div>
              <div>
                <strong>Advanced</strong>
                <p>Cutting-edge technology</p>
              </div>
            </div>
          </div>

          <div className="dl-bottom-pill">
            <Shield size={16} color="#c79a43" />
            <span>Secure</span> • <span>Reliable</span> • <strong>NABL Certified</strong>
          </div>
        </div>

        {/* 3D Elements Area */}
        <div className="dl-3d-elements">
          {/* Glowing Hexagon */}
          <div className="dl-glow-hex-container">
            <div className="dl-hex-outer-glow" />
            <div className="dl-hex-shape">
              <div className="dl-hex-inner">
                <Activity size={48} className="dl-hex-heartbeat" />
              </div>
            </div>
          </div>

          {/* Placeholder for Microscope (styled as a 3D glass shape via CSS) */}
          <div className="dl-microscope-placeholder">
            {/* CSS microscope approximation */}
            <div className="dl-m-base"></div>
            <div className="dl-m-arm"></div>
            <div className="dl-m-lens"></div>
            <div className="dl-m-tube tube-1"></div>
            <div className="dl-m-tube tube-2"></div>
            <div className="dl-m-tube tube-3"></div>
          </div>
        </div>
      </aside>

      <section className="dl-login-panel">
        <motion.div
          className="dl-login-card"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={cardT}
        >
          <div className="dl-card-header">
            <h2 className="dl-card-title">{pageTitle}</h2>
            <p className="dl-card-subtitle">{pageSubtitle}</p>
            
            {showTabs && (
              <div className="dl-tabs-container">
                <div className="dl-tabs-row">
                  {tabs?.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      className={`dl-tab${activeTab === tab.key ? ' active' : ''}`}
                      onClick={() => onTabChange?.(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                  <div 
                    className="dl-tab-indicator" 
                    style={{ transform: `translateX(${tabs?.findIndex((tab) => tab.key === activeTab) * 100}%)` }} 
                  />
                </div>
              </div>
            )}
          </div>

          <div className="dl-card-form-area">
            {children}
          </div>
        </motion.div>
      </section>
    </main>
  );
};

export default AuthLayout;
