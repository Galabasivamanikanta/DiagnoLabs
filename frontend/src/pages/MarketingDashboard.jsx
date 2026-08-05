import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { 
    Megaphone, Ticket, Send, Users, TrendingUp, Sparkles, Plus, CheckCircle2, 
    XCircle, Eye, BarChart2, Gift, LogOut, ChevronRight, Copy, Share2, Menu, X
} from 'lucide-react';
import '../styles/DashboardShared.css';

const MarketingDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns', 'coupons', 'broadcast', 'referrals', 'analytics'
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Coupon Creation Form state
  const [couponForm, setCouponForm] = useState({
    code: 'DIAGNO20', discountType: 'Percentage', value: '20', minBooking: '999', expiry: '2026-08-31', maxUses: '500'
  });

  // Broadcast Email Form state
  const [broadcastForm, setBroadcastForm] = useState({
    subject: '🎉 Exclusive 20% Off Your Next Full Body Health Checkup!',
    targetSegment: 'All Registered Patients',
    message: 'Book your comprehensive diagnostic package today and get 20% off using code DIAGNO20. Valid till end of month!'
  });

  // Mock Active Campaigns
  const [campaigns, setCampaigns] = useState([
    { id: 'CAMP-101', title: 'Monsoon Preventive Health Drive', channel: 'Email & Push', reach: '45,000', leads: 820, conversions: 164, roi: '+142%', status: 'Active' },
    { id: 'CAMP-102', title: 'Senior Citizen Cardiac Care', channel: 'SMS Broadcast', reach: '12,000', leads: 310, conversions: 88, roi: '+95%', status: 'Active' },
    { id: 'CAMP-103', title: 'Diabetes Awareness Screening', channel: 'Social Banner', reach: '28,000', leads: 490, conversions: 102, roi: '+110%', status: 'Completed' }
  ]);

  // Mock Active Coupons
  const [coupons, setCoupons] = useState([
    { code: 'DIAGNO20', discount: '20% OFF', minBooking: '₹999', redemptions: 412, expiry: '2026-08-31', active: true },
    { code: 'FLAT200', discount: '₹200 OFF', minBooking: '₹1,499', redemptions: 189, expiry: '2026-09-15', active: true },
    { code: 'SENIOR50', discount: '50% OFF', minBooking: '₹1,999', redemptions: 95, expiry: '2026-08-15', active: true }
  ]);

  // Mock Referral Program
  const [referrals] = useState({
    referrerReward: 150,
    refereeReward: 100,
    topReferrers: [
      { name: 'Dr. Ramesh Rao', phone: '+91 98765 11002', referralsCount: 42, earnings: '₹6,300' },
      { name: 'Sneha Reddy', phone: '+91 91234 55667', referralsCount: 28, earnings: '₹4,200' },
      { name: 'Amitabh Sharma', phone: '+91 99887 44332', referralsCount: 19, earnings: '₹2,850' }
    ]
  });

  const handleLogout = () => {
    logout();
    navigate('/adminlogin');
  };

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    const newCoupon = {
      code: couponForm.code.toUpperCase(),
      discount: couponForm.discountType === 'Percentage' ? `${couponForm.value}% OFF` : `₹${couponForm.value} OFF`,
      minBooking: `₹${couponForm.minBooking}`,
      redemptions: 0,
      expiry: couponForm.expiry,
      active: true
    };
    setCoupons([newCoupon, ...coupons]);
    alert(`Coupon Code [${newCoupon.code}] created and activated platform-wide!`);
    setShowCouponModal(false);
  };

  const handleBroadcastSend = (e) => {
    e.preventDefault();
    alert(`Broadcast email transmitted via Nodemailer to ${broadcastForm.targetSegment}! Delivery report queued.`);
    setShowBroadcastModal(false);
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Overlay */}
      <div 
        className={`dashboard-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '0 12px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Megaphone size={24} color="#003366" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#003366', margin: 0 }}>DiagnoLabs</h2>
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Marketing & Growth Workspace</span>
          </div>
          {/* Close button for mobile sidebar */}
          <div className="dashboard-header-mobile-toggle" style={{ border: 'none', padding: 0, margin: 0 }} onClick={() => setSidebarOpen(false)}>
             <X size={24} color="#64748b" />
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <button 
            onClick={() => setActiveTab('campaigns')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'campaigns' ? '#f0f7ff' : 'transparent', color: activeTab === 'campaigns' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <Megaphone size={18} /> Active Campaigns ({campaigns.filter(c => c.status === 'Active').length})
          </button>
          <button 
            onClick={() => setActiveTab('coupons')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'coupons' ? '#f0f7ff' : 'transparent', color: activeTab === 'coupons' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <Ticket size={18} /> Coupon & Discount Codes ({coupons.length})
          </button>
          <button 
            onClick={() => setActiveTab('broadcast')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'broadcast' ? '#f0f7ff' : 'transparent', color: activeTab === 'broadcast' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <Send size={18} /> Nodemailer Email Broadcast
          </button>
          <button 
            onClick={() => setActiveTab('referrals')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'referrals' ? '#f0f7ff' : 'transparent', color: activeTab === 'referrals' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <Gift size={18} /> Referral Program Leaderboard
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'analytics' ? '#f0f7ff' : 'transparent', color: activeTab === 'analytics' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <BarChart2 size={18} /> Funnel & ROI Analytics
          </button>
        </nav>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <div style={{ padding: '8px 12px', marginBottom: '12px', background: '#f1f5f9', borderRadius: '10px' }}>
            <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#0f172a' }}>{user?.name || 'Marketing Lead'}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Growth & Promotions Specialist</div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #fee2e2', background: '#fff5f5', color: '#dc2626', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="dashboard-header-mobile-toggle" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} color="#0f172a" />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>Marketing & Patient Acquisition Engine</h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Drive booking retention with coupon promotions, targeted broadcasts, and referral rewards.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowCouponModal(true)} style={{ padding: '10px 18px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Ticket size={16} /> + New Coupon Code
            </button>
            <button onClick={() => setShowBroadcastModal(true)} style={{ padding: '10px 18px', background: '#003366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Send size={16} /> Compose Broadcast
            </button>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Active Growth Campaigns</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#003366', marginTop: '6px' }}>{campaigns.filter(c => c.status === 'Active').length}</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Coupon Redemptions (This Month)</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#059669', marginTop: '6px' }}>696</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Campaign Signups</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#2563eb', marginTop: '6px' }}>1,620</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Email Open Rate</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#d97706', marginTop: '6px' }}>42.8%</div>
          </div>
        </div>

        {/* Tab 1: Campaigns */}
        {activeTab === 'campaigns' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Promotional & Seasonal Campaigns Stream</h3>
            <div className="dashboard-table-container">
            <table className="dashboard-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Campaign ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Campaign Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Channel</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Reach</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Conversions</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Est ROI</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#0f172a', fontWeight: '800' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#003366' }}>{c.id}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{c.title}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{c.channel}</td>
                    <td style={{ padding: '12px', color: '#334155' }}>{c.reach}</td>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#059669' }}>{c.conversions} bookings</td>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#2563eb' }}>{c.roi}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', background: c.status === 'Active' ? '#dcfce7' : '#f1f5f9', color: c.status === 'Active' ? '#166534' : '#64748b' }}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Tab 2: Coupon Codes with Live Preview Card */}
        {activeTab === 'coupons' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Active Patient Promo & Coupon Codes</h3>
            <div className="dashboard-table-container">
            <table className="dashboard-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Coupon Code</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Discount Offer</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Min Order Value</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Total Redemptions</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Expiry Date</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#0f172a' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((cp, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#003366', fontFamily: 'monospace', fontSize: '1rem' }}>{cp.code}</td>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#059669' }}>{cp.discount}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{cp.minBooking}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{cp.redemptions} users</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{cp.expiry}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', background: cp.active ? '#dcfce7' : '#fee2e2', color: cp.active ? '#166534' : '#dc2626' }}>
                        {cp.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Tab 3: Nodemailer Broadcast Composer */}
        {activeTab === 'broadcast' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', maxWidth: '640px', margin: '0 auto' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>Compose Targeted Nodemailer Broadcast</h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: '#64748b' }}>Broadcast emails are delivered via Nodemailer to target patient cohorts.</p>

            <form onSubmit={handleBroadcastSend} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>TARGET AUDIENCE SEGMENT</label>
                <select value={broadcastForm.targetSegment} onChange={e => setBroadcastForm({...broadcastForm, targetSegment: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none', background: 'white', fontWeight: '700' }}>
                  <option>All Registered Patients (45,000+)</option>
                  <option>Inactive Patients (Over 30 Days)</option>
                  <option>New Signups (Last 7 Days)</option>
                  <option>Patients with Pending Reports</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>EMAIL SUBJECT LINE</label>
                <input type="text" required value={broadcastForm.subject} onChange={e => setBroadcastForm({...broadcastForm, subject: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none', fontWeight: '700' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>BROADCAST BODY (MARKDOWN / HTML)</label>
                <textarea rows="4" value={broadcastForm.message} onChange={e => setBroadcastForm({...broadcastForm, message: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none' }}></textarea>
              </div>

              <button type="submit" style={{ padding: '12px', background: '#003366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Send size={16} /> Transmit Nodemailer Broadcast Now
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: Referral Program Leaderboard */}
        {activeTab === 'referrals' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Patient Referral Program Leaderboard</h3>
            <div className="dashboard-table-container">
            <table className="dashboard-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Referrer Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Contact Phone</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Successful Referrals</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Total Wallet Cash Back Earned</th>
                </tr>
              </thead>
              <tbody>
                {referrals.topReferrers.map((r, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#003366' }}>{r.name}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{r.phone}</td>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#0f172a' }}>{r.referralsCount} patients</td>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#059669' }}>{r.earnings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Tab 5: Analytics */}
        {activeTab === 'analytics' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Marketing Conversion Funnel & ROI Attribution</h3>
            <div className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px', color: '#003366', fontWeight: '800' }}>Patient Conversion Funnel</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <div style={{ padding: '10px', background: '#e0f2fe', color: '#0369a1', borderRadius: '6px', fontWeight: '700' }}>Site Visitors: 1,00,000 (100%)</div>
                  <div style={{ padding: '10px', background: '#bae6fd', color: '#0369a1', borderRadius: '6px', fontWeight: '700' }}>Campaign Clicks: 42,000 (42%)</div>
                  <div style={{ padding: '10px', background: '#7dd3fc', color: '#0c4a6e', borderRadius: '6px', fontWeight: '700' }}>Test Bookings Placed: 16,200 (16.2%)</div>
                </div>
              </div>
              <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px', color: '#003366', fontWeight: '800' }}>Campaign Blended ROI</h4>
                <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#059669' }}>+135%</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', fontWeight: '700' }}>Attributed Revenue: ₹4,50,000 vs Campaign Budget: ₹1,90,000</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* New Coupon Modal */}
      {showCouponModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px', color: '#0f172a', fontWeight: '800' }}>Create New Coupon Code</h3>
            <form onSubmit={handleCouponSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>COUPON CODE (UPPERCASE)</label>
                <input type="text" required value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none', fontWeight: '800' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>DISCOUNT TYPE</label>
                  <select value={couponForm.discountType} onChange={e => setCouponForm({...couponForm, discountType: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none', background: 'white' }}>
                    <option>Percentage</option>
                    <option>Flat Amount</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>VALUE ({couponForm.discountType === 'Percentage' ? '%' : '₹'})</label>
                  <input type="number" required value={couponForm.value} onChange={e => setCouponForm({...couponForm, value: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>MIN BOOKING AMOUNT (₹)</label>
                <input type="number" required value={couponForm.minBooking} onChange={e => setCouponForm({...couponForm, minBooking: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowCouponModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#003366', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Activate Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px', color: '#0f172a', fontWeight: '800' }}>Confirm Nodemailer Broadcast Transmission</h3>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Target Segment: <strong>{broadcastForm.targetSegment}</strong></div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Subject: <strong>{broadcastForm.subject}</strong></div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowBroadcastModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleBroadcastSend} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#003366', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Transmit Email</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingDashboard;

