import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const QualityDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Audit Schedule');
  const [audits, setAudits] = useState([]);
  const [ncrs, setNcrs] = useState([]);

  useEffect(() => {
    // Mock data fallback
    setAudits([
      { id: 'AUD-001', dept: 'Pathology', type: 'Internal', auditor: 'Dr. Smith', date: '2026-08-10', status: 'Scheduled' },
      { id: 'AUD-002', dept: 'Radiology', type: 'External', auditor: 'NABL Rep', date: '2026-08-15', status: 'In Progress' }
    ]);
    setNcrs([
      { id: 'NCR-101', area: 'Sample Collection', finding: 'Missing labels', severity: 'Major', raisedBy: 'J. Doe', dueDate: '2026-08-05', status: 'Open' },
      { id: 'NCR-102', area: 'Storage', finding: 'Temp log not signed', severity: 'Minor', raisedBy: 'S. Lee', dueDate: '2026-08-10', status: 'CAPA Pending' }
    ]);
  }, []);

  const handleLogout = () => {
    navigate('/adminlogin');
  };

  const styles = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" },
    sidebar: { width: '260px', background: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '24px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    logo: { color: '#003366', fontSize: '22px', fontWeight: '800', marginBottom: '32px', textAlign: 'left', paddingLeft: '12px' },
    menuItem: { padding: '12px 16px', margin: '6px 0', borderRadius: '10px', cursor: 'pointer', transition: '0.2s', fontWeight: '600', fontSize: '0.9rem', color: '#475569' },
    activeMenu: { background: '#f0f7ff', color: '#003366', fontWeight: '800', borderLeft: '4px solid #003366' },
    main: { flex: 1, padding: '32px', overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' },
    statCard: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' },
    statValue: { fontSize: '32px', color: '#003366', fontWeight: '800', margin: '8px 0' },
    tabs: { display: 'flex', gap: '16px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px' },
    tab: { padding: '12px 20px', cursor: 'pointer', color: '#64748b', fontWeight: '700', borderBottom: '3px solid transparent', transition: '0.2s' },
    activeTab: { color: '#003366', borderBottom: '3px solid #003366' },
    contentArea: { background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '14px 16px', borderBottom: '2px solid #e2e8f0', color: '#0f172a', fontWeight: '800', fontSize: '0.85rem' },
    td: { padding: '14px 16px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '0.9rem', fontWeight: '600' },
    button: { background: '#003366', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(0,51,102,0.15)' },
    progressBarContainer: { background: '#e2e8f0', borderRadius: '10px', height: '10px', marginTop: '10px' },
    progressBar: { background: '#003366', height: '100%', borderRadius: '10px', transition: 'width 1s ease-in-out' },
    scoreCard: { background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #e2e8f0' }
  };

  const renderTab = () => {
    switch(activeTab) {
      case 'Audit Schedule':
        return (
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Audit #</th><th style={styles.th}>Lab/Dept</th><th style={styles.th}>Type</th><th style={styles.th}>Auditor</th><th style={styles.th}>Date</th><th style={styles.th}>Status</th><th style={styles.th}>Action</th></tr></thead>
            <tbody>
              {audits.map(a => (
                <tr key={a.id}><td style={styles.td}>{a.id}</td><td style={styles.td}>{a.dept}</td><td style={styles.td}>{a.type}</td><td style={styles.td}>{a.auditor}</td><td style={styles.td}>{a.date}</td><td style={styles.td}>{a.status}</td><td style={styles.td}><button style={styles.button}>Start</button></td></tr>
              ))}
            </tbody>
          </table>
        );
      case 'NCR (Non-Conformance Reports)':
        return (
          <div>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
              <h3>Non-Conformance Reports</h3>
              <button style={styles.button}>+ New NCR</button>
            </div>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>NCR #</th><th style={styles.th}>Area</th><th style={styles.th}>Finding</th><th style={styles.th}>Severity</th><th style={styles.th}>Raised By</th><th style={styles.th}>Status</th></tr></thead>
              <tbody>
                {ncrs.map(n => (
                  <tr key={n.id}><td style={styles.td}>{n.id}</td><td style={styles.td}>{n.area}</td><td style={styles.td}>{n.finding}</td><td style={{...styles.td, color: n.severity==='Major'?'#ff4d4d':'#ffd700'}}>{n.severity}</td><td style={styles.td}>{n.raisedBy}</td><td style={styles.td}>{n.status}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'Compliance Dashboard':
        return (
          <div>
            <div style={styles.scoreCard}>
              <h4>NABL Compliance (92%)</h4>
              <div style={styles.progressBarContainer}><div style={{...styles.progressBar, width: '92%'}}></div></div>
              <p style={{fontSize:'12px', color:'#aaa', marginTop:'10px'}}>Last audit: 2026-07-01</p>
            </div>
            <div style={styles.scoreCard}>
              <h4>ISO 9001:2015 (95%)</h4>
              <div style={styles.progressBarContainer}><div style={{...styles.progressBar, width: '95%'}}></div></div>
              <p style={{fontSize:'12px', color:'#aaa', marginTop:'10px'}}>Last audit: 2026-06-15</p>
            </div>
            <div style={styles.scoreCard}>
              <h4>CAP Compliance (88%)</h4>
              <div style={styles.progressBarContainer}><div style={{...styles.progressBar, width: '88%'}}></div></div>
              <p style={{fontSize:'12px', color:'#aaa', marginTop:'10px'}}>Last audit: 2026-05-20</p>
            </div>
          </div>
        );
      case 'Certifications':
        return (
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Cert Name</th><th style={styles.th}>Issuing Body</th><th style={styles.th}>Issue Date</th><th style={styles.th}>Expiry</th><th style={styles.th}>Days Left</th><th style={styles.th}>Action</th></tr></thead>
            <tbody>
              <tr><td style={styles.td}>NABL Accreditation</td><td style={styles.td}>NABL</td><td style={styles.td}>2024-01-10</td><td style={styles.td}>2026-09-10</td><td style={{...styles.td, color: '#ff4d4d'}}>37 Days</td><td style={styles.td}><button style={styles.button}>Renew</button></td></tr>
              <tr><td style={styles.td}>ISO 9001</td><td style={styles.td}>ISO</td><td style={styles.td}>2025-02-15</td><td style={styles.td}>2027-02-15</td><td style={styles.td}>195 Days</td><td style={styles.td}><button style={{...styles.button, opacity:0.5}}>Valid</button></td></tr>
            </tbody>
          </table>
        );
      default: return null;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>DiagnoLabs Quality</div>
        {['Dashboard', 'Audits', 'Compliance', 'NCR Reports', 'Certifications'].map(item => (
          <div key={item} style={{...styles.menuItem, ...(item==='Dashboard'?styles.activeMenu:{})}}>{item}</div>
        ))}
        <div style={{...styles.menuItem, marginTop:'auto', color:'#ff4d4d'}} onClick={handleLogout}>Logout</div>
      </div>
      <div style={styles.main}>
        <div style={styles.header}>
          <h2>Quality Auditor Dashboard</h2>
          <div>Welcome, Auditor</div>
        </div>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}><div>Audits This Month</div><div style={styles.statValue}>12</div></div>
          <div style={styles.statCard}><div>Compliance Score</div><div style={styles.statValue}>94%</div></div>
          <div style={styles.statCard}><div>Open NCRs</div><div style={styles.statValue}>5</div></div>
          <div style={styles.statCard}><div>Certs Expiring Soon</div><div style={{...styles.statValue, color:'#ff4d4d'}}>1</div></div>
        </div>
        <div style={styles.tabs}>
          {['Audit Schedule', 'NCR (Non-Conformance Reports)', 'Compliance Dashboard', 'Certifications'].map(tab => (
            <div key={tab} style={{...styles.tab, ...(activeTab===tab?styles.activeTab:{})}} onClick={() => setActiveTab(tab)}>{tab}</div>
          ))}
        </div>
        <div style={styles.contentArea}>
          {renderTab()}
        </div>
      </div>
    </div>
  );
};

export default QualityDashboard;
