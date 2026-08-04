import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ITDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('System Health');

  const handleLogout = () => {
    navigate('/adminlogin');
  };

  const styles = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#050a15', color: '#e0e0e0', fontFamily: 'Inter, sans-serif' },
    sidebar: { width: '250px', background: 'rgba(5, 10, 21, 0.9)', backdropFilter: 'blur(10px)', borderRight: '1px solid rgba(212, 175, 55, 0.2)', padding: '20px' },
    logo: { color: '#d4af37', fontSize: '24px', fontWeight: 'bold', marginBottom: '40px', textAlign: 'center' },
    menuItem: { padding: '15px 20px', margin: '10px 0', borderRadius: '8px', cursor: 'pointer', transition: '0.3s' },
    activeMenu: { background: 'linear-gradient(90deg, rgba(212,175,55,0.15) 0%, rgba(5,10,21,0) 100%)', borderLeft: '4px solid #d4af37', color: '#d4af37' },
    main: { flex: 1, padding: '30px', overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' },
    statCard: { background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', padding: '20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' },
    statValue: { fontSize: '36px', color: '#d4af37', fontWeight: 'bold', margin: '10px 0' },
    tabs: { display: 'flex', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '30px' },
    tab: { padding: '10px 20px', cursor: 'pointer', color: '#888', borderBottom: '2px solid transparent' },
    activeTab: { color: '#d4af37', borderBottom: '2px solid #d4af37' },
    contentArea: { background: 'rgba(0, 0, 0, 0.3)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' },
    healthGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
    healthCard: { background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' },
    dot: { display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#00ff00', boxShadow: '0 0 10px #00ff00', marginRight: '10px', animation: 'pulse 2s infinite' },
    dotRed: { display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff0000', boxShadow: '0 0 10px #ff0000', marginRight: '10px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px', borderBottom: '1px solid rgba(212, 175, 55, 0.3)', color: '#d4af37' },
    td: { padding: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' },
    button: { background: '#d4af37', color: '#050a15', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', marginRight: '5px' },
    logViewer: { background: '#000', color: '#0f0', fontFamily: 'monospace', padding: '20px', borderRadius: '8px', height: '400px', overflowY: 'scroll', border: '1px solid #333' }
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
