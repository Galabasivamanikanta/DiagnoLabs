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
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#0a1128', color: '#e0e0e0', fontFamily: 'Inter, sans-serif' },
    sidebar: { width: '250px', background: 'rgba(10, 17, 40, 0.7)', backdropFilter: 'blur(10px)', borderRight: '1px solid rgba(212, 175, 55, 0.3)', padding: '20px' },
    logo: { color: '#d4af37', fontSize: '24px', fontWeight: 'bold', marginBottom: '40px', textAlign: 'center' },
    menuItem: { padding: '15px 20px', margin: '10px 0', borderRadius: '8px', cursor: 'pointer', transition: '0.3s' },
    activeMenu: { background: 'linear-gradient(90deg, rgba(212,175,55,0.2) 0%, rgba(10,17,40,0) 100%)', borderLeft: '4px solid #d4af37', color: '#d4af37' },
    main: { flex: 1, padding: '30px', overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' },
    statCard: { background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '15px', padding: '20px', textAlign: 'center' },
    statValue: { fontSize: '36px', color: '#d4af37', fontWeight: 'bold', margin: '10px 0' },
    tabs: { display: 'flex', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '30px' },
    tab: { padding: '10px 20px', cursor: 'pointer', color: '#aaa', borderBottom: '2px solid transparent' },
    activeTab: { color: '#d4af37', borderBottom: '2px solid #d4af37' },
    contentArea: { background: 'rgba(0, 0, 0, 0.2)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '15px', borderBottom: '1px solid rgba(212, 175, 55, 0.3)', color: '#d4af37' },
    td: { padding: '15px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' },
    button: { background: '#d4af37', color: '#0a1128', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    progressBarContainer: { background: 'rgba(255,255,255,0.1)', borderRadius: '10px', height: '10px', marginTop: '10px' },
    progressBar: { background: '#d4af37', height: '100%', borderRadius: '10px', transition: 'width 1s ease-in-out' },
    scoreCard: { background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '10px', marginBottom: '20px' }
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
