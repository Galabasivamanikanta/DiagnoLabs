import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MarketingDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Campaigns');
  const [campaignData, setCampaignData] = useState(null);

  // Mock Data
  const stats = [
    { title: 'Active Campaigns', value: '12', trend: '↑ 2 new', trendUp: true },
    { title: 'Total Leads', value: '4,520', trend: '↑ 18%', trendUp: true },
    { title: 'Conversion Rate', value: '14.5%', trend: '↑ 2.1%', trendUp: true },
    { title: 'Monthly Reach', value: '85.2K', trend: '↓ 1.5%', trendUp: false }
  ];

  const mockCampaigns = [
    { name: 'Summer Health Check', type: 'Email', start: '2026-07-01', end: '2026-08-31', budget: '₹ 25,000', leads: 450, roi: '120%', status: 'Active' },
    { name: 'Diabetes Awareness', type: 'Social', start: '2026-08-01', end: '2026-08-15', budget: '₹ 15,000', leads: 210, roi: '85%', status: 'Active' },
    { name: 'Senior Citizen Package', type: 'SMS', start: '2026-07-15', end: '2026-07-31', budget: '₹ 10,000', leads: 320, roi: '150%', status: 'Completed' },
    { name: 'Full Body Scan Promo', type: 'Email', start: '2026-08-10', end: '2026-09-10', budget: '₹ 30,000', leads: 45, roi: 'TBD', status: 'Upcoming' },
    { name: 'Cardiac Care Special', type: 'Social', start: '2026-06-01', end: '2026-06-30', budget: '₹ 20,000', leads: 180, roi: '90%', status: 'Completed' },
  ];

  const mockLeads = [
    { name: 'Amit Kumar', source: 'Facebook Ad', test: 'Full Body Scan', date: '2026-08-04', status: 'New' },
    { name: 'Sneha Patel', source: 'Email Newsletter', test: 'Thyroid Profile', date: '2026-08-03', status: 'Contacted' },
    { name: 'Ravi Verma', source: 'Google Search', test: 'Lipid Profile', date: '2026-08-01', status: 'Converted' },
  ];

  const mockPromotions = [
    { name: 'MONSOON20', discount: '20%', valid: '2026-08-31', tests: 'All Basic Profiles', active: true },
    { name: 'FAMILY50', discount: '50% on 2nd', valid: '2026-12-31', tests: 'Full Body Packages', active: true },
    { name: 'DIAB10', discount: '10%', valid: '2026-07-31', tests: 'Diabetes Care', active: false },
  ];

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get('/api/employee/marketing/campaigns');
        setCampaignData(response.data);
      } catch (error) {
        console.log("Using fallback mock data for campaigns");
        setCampaignData(mockCampaigns);
      }
    };
    fetchCampaigns();
  }, []);

  const handleLogout = () => {
    navigate('/adminlogin');
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Active': 'bg-green-500/20 text-green-400 border border-green-500/30',
      'Completed': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      'Upcoming': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      'New': 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      'Contacted': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      'Converted': 'bg-green-500/20 text-green-400 border border-green-500/30'
    };
    return <span className={`px-2 py-1 rounded text-xs ${colors[status] || 'bg-gray-500/20 text-gray-400'}`}>{status}</span>;
  };

  return (
    <div style={{ backgroundColor: '#051124', minHeight: '100vh', color: '#e2e8f0', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: '250px', borderRight: '1px solid rgba(212, 175, 55, 0.2)', padding: '20px', background: 'linear-gradient(180deg, rgba(5,17,36,1) 0%, rgba(9,27,51,1) 100%)' }}>
        <h2 style={{ color: '#d4af37', fontSize: '24px', fontWeight: 'bold', marginBottom: '40px', letterSpacing: '1px' }}>DiagnoLabs<span style={{color:'white', fontSize:'14px', display:'block', fontWeight:'normal'}}>Marketing Hub</span></h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {['Dashboard', 'Campaigns', 'Leads', 'Analytics', 'Promotions', 'Social Media'].map(item => (
            <button key={item} style={{ textAlign: 'left', padding: '10px 15px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', transition: 'all 0.3s', ':hover': { background: 'rgba(212, 175, 55, 0.1)', color: '#d4af37' } }}>
              {item}
            </button>
          ))}
          <button onClick={handleLogout} style={{ marginTop: 'auto', textAlign: 'left', padding: '10px 15px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', cursor: 'pointer', transition: 'all 0.3s' }}>
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>Marketing Head Dashboard</h1>
          <div style={{ display: 'flex', gap: '15px' }}>
             <button style={{ padding: '10px 20px', background: '#d4af37', color: '#051124', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+ New Campaign</button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(212, 175, 55, 0.15)', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '10px' }}>{stat.title}</h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', marginBottom: '5px' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: stat.trendUp ? '#4ade80' : '#f87171' }}>{stat.trend}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
          {['Campaigns', 'Leads', 'Promotions', 'Analytics'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 20px', borderRadius: '8px', background: activeTab === tab ? 'rgba(212, 175, 55, 0.2)' : 'transparent', border: activeTab === tab ? '1px solid rgba(212, 175, 55, 0.5)' : '1px solid transparent', color: activeTab === tab ? '#d4af37' : '#cbd5e1', cursor: 'pointer', fontWeight: activeTab === tab ? 'bold' : 'normal', transition: 'all 0.3s' }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(10px)', borderRadius: '15px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
          
          {activeTab === 'Campaigns' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', color: '#d4af37' }}>
                  <th style={{ padding: '15px' }}>Campaign Name</th>
                  <th style={{ padding: '15px' }}>Type</th>
                  <th style={{ padding: '15px' }}>Duration</th>
                  <th style={{ padding: '15px' }}>Budget</th>
                  <th style={{ padding: '15px' }}>Leads</th>
                  <th style={{ padding: '15px' }}>ROI</th>
                  <th style={{ padding: '15px' }}>Status</th>
                  <th style={{ padding: '15px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {(campaignData || mockCampaigns).map((camp, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{camp.name}</td>
                    <td style={{ padding: '15px' }}>{camp.type}</td>
                    <td style={{ padding: '15px', fontSize: '12px' }}>{camp.start} to {camp.end}</td>
                    <td style={{ padding: '15px' }}>{camp.budget}</td>
                    <td style={{ padding: '15px' }}>{camp.leads}</td>
                    <td style={{ padding: '15px', color: camp.roi.includes('-') ? '#f87171' : '#4ade80' }}>{camp.roi}</td>
                    <td style={{ padding: '15px' }}>{getStatusBadge(camp.status)}</td>
                    <td style={{ padding: '15px' }}>
                      {camp.status === 'Active' ? (
                        <button style={{ padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Pause</button>
                      ) : (
                        <button style={{ padding: '6px 12px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#d4af37', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Resume</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'Leads' && (
             <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
             <thead>
               <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', color: '#d4af37' }}>
                 <th style={{ padding: '15px' }}>Name</th>
                 <th style={{ padding: '15px' }}>Source</th>
                 <th style={{ padding: '15px' }}>Test Interested</th>
                 <th style={{ padding: '15px' }}>Date</th>
                 <th style={{ padding: '15px' }}>Status</th>
                 <th style={{ padding: '15px' }}>Action</th>
               </tr>
             </thead>
             <tbody>
               {mockLeads.map((lead, i) => (
                 <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                   <td style={{ padding: '15px' }}>{lead.name}</td>
                   <td style={{ padding: '15px' }}>{lead.source}</td>
                   <td style={{ padding: '15px' }}>{lead.test}</td>
                   <td style={{ padding: '15px' }}>{lead.date}</td>
                   <td style={{ padding: '15px' }}>{getStatusBadge(lead.status)}</td>
                   <td style={{ padding: '15px' }}>
                     <button style={{ padding: '6px 12px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#d4af37', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Follow Up</button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
          )}

          {activeTab === 'Promotions' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {mockPromotions.map((promo, i) => (
                <div key={i} style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.2)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <h3 style={{ color: '#d4af37', fontSize: '18px', fontWeight: 'bold' }}>{promo.name}</h3>
                    <div style={{ width: '40px', height: '20px', background: promo.active ? '#4ade80' : '#475569', borderRadius: '10px', position: 'relative', cursor: 'pointer' }}>
                      <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: promo.active ? '22px' : '2px', transition: 'left 0.3s' }}></div>
                    </div>
                  </div>
                  <div style={{ fontSize: '24px', color: '#fff', marginBottom: '10px' }}>{promo.discount} Off</div>
                  <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '5px' }}>Valid till: {promo.valid}</div>
                  <div style={{ color: '#cbd5e1', fontSize: '14px' }}>Applies to: {promo.tests}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Analytics' && (
            <div style={{ display: 'flex', gap: '40px' }}>
              <div style={{ flex: 1 }}>
                 <h3 style={{ color: '#fff', marginBottom: '20px', fontSize: '18px' }}>Traffic Sources</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {[
                      { source: 'Google Search', value: 65, color: '#4285F4' },
                      { source: 'Facebook Ads', value: 20, color: '#1877F2' },
                      { source: 'Email', value: 10, color: '#EA4335' },
                      { source: 'Direct', value: 5, color: '#34A853' }
                    ].map(item => (
                      <div key={item.source}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px', color: '#cbd5e1' }}>
                          <span>{item.source}</span>
                          <span>{item.value}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${item.value}%`, height: '100%', background: item.color, borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#fff', marginBottom: '20px', fontSize: '18px' }}>Conversion Funnel</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '100%', padding: '15px', background: 'rgba(212, 175, 55, 0.4)', textAlign: 'center', color: '#fff', borderRadius: '4px' }}>Site Visitors (100%)</div>
                    <div style={{ fontSize: '20px', color: '#d4af37' }}>↓</div>
                    <div style={{ width: '75%', padding: '15px', background: 'rgba(212, 175, 55, 0.3)', textAlign: 'center', color: '#fff', borderRadius: '4px' }}>Leads Captured (45%)</div>
                    <div style={{ fontSize: '20px', color: '#d4af37' }}>↓</div>
                    <div style={{ width: '50%', padding: '15px', background: 'rgba(212, 175, 55, 0.2)', textAlign: 'center', color: '#fff', borderRadius: '4px' }}>Contacted (28%)</div>
                    <div style={{ fontSize: '20px', color: '#d4af37' }}>↓</div>
                    <div style={{ width: '25%', padding: '15px', background: 'rgba(212, 175, 55, 0.1)', textAlign: 'center', color: '#fff', borderRadius: '4px' }}>Converted (14.5%)</div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;
