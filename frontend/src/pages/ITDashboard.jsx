import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ITDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('System Health');

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
    healthGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' },
    healthCard: { background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', position: 'relative' },
    dot: { display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#059669', boxShadow: '0 0 8px #059669', marginRight: '10px', animation: 'pulse 2s infinite' },
    dotRed: { display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#dc2626', boxShadow: '0 0 8px #dc2626', marginRight: '10px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '14px 16px', borderBottom: '2px solid #e2e8f0', color: '#0f172a', fontWeight: '800', fontSize: '0.85rem' },
    td: { padding: '14px 16px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '0.9rem', fontWeight: '600' },
    button: { background: '#003366', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', marginRight: '6px' },
    logViewer: { background: '#0f172a', color: '#38bdf8', fontFamily: 'monospace', padding: '20px', borderRadius: '12px', height: '400px', overflowY: 'scroll', border: '1px solid #1e293b' }
  };

  const renderTab = () => {
    switch(activeTab) {
      case 'System Health':
        return (
          <div>
            <style>{`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }`}</style>
            <div style={styles.healthGrid}>
              {['API Server', 'Database', 'Storage', 'Email Service', 'Lab Integration'].map((srv, i) => (
                <div key={srv} style={styles.healthCard}>
                  <h3><span style={i===3 ? styles.dotRed : styles.dot}></span>{srv}</h3>
                  <p style={{color:'#aaa', margin:'10px 0'}}>Uptime: {i===3 ? '98.2%' : '99.9%'}</p>
                  <p style={{fontSize:'12px', color:'#666'}}>Last checked: Just now</p>
                  <button style={{...styles.button, marginTop:'15px', background:'transparent', color:'#d4af37', border:'1px solid #d4af37'}}>Restart</button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'User Management':
        return (
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Emp ID</th><th style={styles.th}>Name</th><th style={styles.th}>Role</th><th style={styles.th}>Status</th><th style={styles.th}>Actions</th></tr></thead>
            <tbody>
              <tr><td style={styles.td}>EMP-001</td><td style={styles.td}>John Doe</td><td style={styles.td}>Doctor</td><td style={{...styles.td, color:'#0f0'}}>Active</td><td style={styles.td}><button style={styles.button}>Reset Pass</button><button style={{...styles.button, background:'#ff4d4d', color:'#fff'}}>Disable</button></td></tr>
              <tr><td style={styles.td}>EMP-002</td><td style={styles.td}>Jane Smith</td><td style={styles.td}>Auditor</td><td style={{...styles.td, color:'#888'}}>Inactive</td><td style={styles.td}><button style={styles.button}>Reset Pass</button><button style={{...styles.button, background:'#0f0', color:'#000'}}>Enable</button></td></tr>
            </tbody>
          </table>
        );
      case 'Security Logs':
        return (
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Timestamp</th><th style={styles.th}>User</th><th style={styles.th}>Action</th><th style={styles.th}>IP Address</th><th style={styles.th}>Status</th></tr></thead>
            <tbody>
              <tr><td style={styles.td}>2026-08-04 14:30</td><td style={styles.td}>admin</td><td style={styles.td}>Login</td><td style={styles.td}>192.168.1.55</td><td style={{...styles.td, color:'#0f0'}}>Success</td></tr>
              <tr><td style={styles.td}>2026-08-04 14:25</td><td style={styles.td}>unknown</td><td style={styles.td}>Failed Login</td><td style={styles.td}>11.22.33.44</td><td style={{...styles.td, color:'#ff4d4d'}}>Suspicious</td></tr>
            </tbody>
          </table>
        );
      case 'Maintenance Tickets':
        return (
          <div>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}><h3 style={{margin:0}}>Open Tickets</h3><button style={styles.button}>+ New Ticket</button></div>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>Ticket #</th><th style={styles.th}>System</th><th style={styles.th}>Issue</th><th style={styles.th}>Priority</th><th style={styles.th}>Status</th><th style={styles.th}>Action</th></tr></thead>
              <tbody>
                <tr><td style={styles.td}>TKT-991</td><td style={styles.td}>Email Service</td><td style={styles.td}>Delayed sending</td><td style={{...styles.td, color:'#ff9900'}}>High</td><td style={styles.td}>Open</td><td style={styles.td}><button style={styles.button}>Assign to Me</button></td></tr>
              </tbody>
            </table>
          </div>
        );
      case 'System Logs':
        return (
          <div style={styles.logViewer}>
            <div>[2026-08-04 14:48:00] INFO: API Server starting...</div>
            <div>[2026-08-04 14:48:05] INFO: Database connected on port 5432.</div>
            <div>[2026-08-04 14:48:10] WARN: High memory usage detected on node-1.</div>
            <div style={{color: '#ff4d4d'}}>[2026-08-04 14:48:22] ERROR: Email service connection timeout (ms=5000).</div>
            <div>[2026-08-04 14:48:30] INFO: Health check passed for 4/5 services.</div>
            <div className="typing-effect">_</div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>DiagnoLabs IT</div>
        {['Dashboard', 'System Health', 'Users', 'Security', 'Maintenance', 'Logs'].map(item => (
          <div key={item} style={{...styles.menuItem, ...(item==='Dashboard'?styles.activeMenu:{})}}>{item}</div>
        ))}
        <div style={{...styles.menuItem, marginTop:'auto', color:'#ff4d4d'}} onClick={handleLogout}>Logout</div>
      </div>
      <div style={styles.main}>
        <div style={styles.header}>
          <h2>IT Specialist Dashboard</h2>
          <div>Welcome, SysAdmin</div>
        </div>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}><div>System Uptime</div><div style={styles.statValue}>99.98%</div></div>
          <div style={styles.statCard}><div>Active Users</div><div style={styles.statValue}>342</div></div>
          <div style={styles.statCard}><div>Security Alerts</div><div style={{...styles.statValue, color:'#ff4d4d'}}>3</div></div>
          <div style={styles.statCard}><div>Open Tickets</div><div style={styles.statValue}>12</div></div>
        </div>
        <div style={styles.tabs}>
          {['System Health', 'User Management', 'Security Logs', 'Maintenance Tickets', 'System Logs'].map(tab => (
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

export default ITDashboard;
