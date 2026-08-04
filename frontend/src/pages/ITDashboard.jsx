import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { 
    Cpu, Terminal, Activity, AlertOctagon, CheckCircle2, 
    RefreshCw, KeyRound, Lock, Unlock, Server, Database, Mail, ShieldAlert, LogOut, Search, Filter, AlertTriangle
} from 'lucide-react';

const ITDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('health'); // 'health', 'logs', 'tickets', 'unlocks'
  const [logFilter, setLogFilter] = useState('ALL'); // 'ALL', 'INFO', 'WARN', 'ERROR', 'CRITICAL'
  const [logSearch, setLogSearch] = useState('');
  const [showUnlockModal, setShowUnlockModal] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);

  // Mock Live Services Health Status
  const [services] = useState([
    { name: 'Frontend Client App (Vite / Netlify)', status: 'Operational', uptime: '99.99%', latency: '24ms', type: 'Frontend' },
    { name: 'Backend REST API Cluster (Node.js)', status: 'Operational', uptime: '99.95%', latency: '48ms', type: 'Backend' },
    { name: 'Primary Database (PostgreSQL / Mongo)', status: 'Operational', uptime: '100%', latency: '12ms', type: 'Database' },
    { name: 'Google OAuth 2.0 Auth Service', status: 'Operational', uptime: '99.98%', latency: '110ms', type: 'Integration' },
    { name: 'Payment Gateway API (Razorpay/Stripe)', status: 'Operational', uptime: '99.90%', latency: '185ms', type: 'Integration' },
    { name: 'Nodemailer SMTP Email Transporter', status: 'Operational', uptime: '99.85%', latency: '310ms', type: 'Integration' }
  ]);

  // Mock System Error Logs
  const [systemLogs] = useState([
    { id: 'LOG-701', time: '2026-08-04 14:48:22', level: 'ERROR', service: 'Email Transporter', message: 'Nodemailer SMTP timeout (5000ms) on email dispatch to user@gmail.com' },
    { id: 'LOG-702', time: '2026-08-04 14:45:10', level: 'WARN', service: 'API Cluster', message: 'Memory spike 84% on worker node-2. Garbage collection triggered.' },
    { id: 'LOG-703', time: '2026-08-04 14:30:00', level: 'INFO', service: 'OAuth Service', message: 'JWT token re-issuance verified for user EMP-402' },
    { id: 'LOG-704', time: '2026-08-04 14:15:05', level: 'CRITICAL', service: 'Report Upload PDF', message: 'Failed PDF conversion: Ghostscript binary missing on worker image' }
  ]);

  // Mock Escalated Technical Tickets
  const [techTickets, setTechTickets] = useState([
    { id: 'TKT-991', title: 'OAuth Callback 500 Error on Google Login', category: 'Auth / OAuth', priority: 'High', date: '2026-08-04', status: 'Open', reportedBy: 'Support Team' },
    { id: 'TKT-992', title: 'Payment Gateway Webhook Signature Mismatch', category: 'Payment API', priority: 'Critical', date: '2026-08-04', status: 'In Progress', reportedBy: 'Finance Team' },
    { id: 'TKT-993', title: 'Patient PDF Report Download Timeout', category: 'Storage / Storage Bucket', priority: 'Medium', date: '2026-08-03', status: 'Resolved', reportedBy: 'Doctor Portal' }
  ]);

  // Mock Technically Blocked Accounts
  const [lockedAccounts, setLockedAccounts] = useState([
    { id: 'ACC-101', user: 'Dr. Suresh Mehta', email: 'suresh.mehta@diagnolabs.com', role: 'Doctor', reason: '5 Consecutive Failed OAuth JWT Attempts', lockTime: '2026-08-04 13:20' },
    { id: 'ACC-102', user: 'Sunita Rao (Nurse)', email: 'sunita.n@diagnolabs.com', role: 'Nurse', reason: 'Session Expiry Token Loop', lockTime: '2026-08-04 11:45' }
  ]);

  const handleLogout = () => {
    logout();
    navigate('/adminlogin');
  };

  const filteredLogs = systemLogs.filter(log => {
    const matchesLevel = logFilter === 'ALL' || log.level === logFilter;
    const matchesSearch = log.message.toLowerCase().includes(logSearch.toLowerCase()) || log.service.toLowerCase().includes(logSearch.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const handleResolveTicket = (tktId) => {
    alert(`Technical Ticket [${tktId}] RESOLVED! Escalating Support Team notified.`);
    setTechTickets(prev => prev.map(t => t.id === tktId ? { ...t, status: 'Resolved' } : t));
  };

  const handleUnlockAccount = (e) => {
    e.preventDefault();
    alert(`Technical Lock Removed for [${showUnlockModal.user}]! Password reset token dispatched.`);
    setLockedAccounts(prev => prev.filter(a => a.id !== showUnlockModal.id));
    setShowUnlockModal(null);
  };

  const handleAlertSubmit = (e) => {
    e.preventDefault();
    alert("Emergency Service Restart Request transmitted to System Admin!");
    setShowAlertModal(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', background: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 12px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={24} color="#003366" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#003366', margin: 0 }}>DiagnoLabs</h2>
          </div>
          <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>IT Support & Infrastructure</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <button 
            onClick={() => setActiveTab('health')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'health' ? '#f0f7ff' : 'transparent', color: activeTab === 'health' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <Activity size={18} /> System & Service Health
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'logs' ? '#f0f7ff' : 'transparent', color: activeTab === 'logs' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <Terminal size={18} /> Error Logs Viewer
          </button>
          <button 
            onClick={() => setActiveTab('tickets')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'tickets' ? '#f0f7ff' : 'transparent', color: activeTab === 'tickets' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <AlertOctagon size={18} /> Tech Tickets ({techTickets.filter(t => t.status !== 'Resolved').length})
          </button>
          <button 
            onClick={() => setActiveTab('unlocks')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'unlocks' ? '#f0f7ff' : 'transparent', color: activeTab === 'unlocks' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <Unlock size={18} /> Unlock Tech Accounts ({lockedAccounts.length})
          </button>
        </nav>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <div style={{ padding: '8px 12px', marginBottom: '12px', background: '#f1f5f9', borderRadius: '10px' }}>
            <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#0f172a' }}>{user?.name || 'IT Support Lead'}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>DevOps & Systems Engineer</div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #fee2e2', background: '#fff5f5', color: '#dc2626', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {/* Header bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>Platform Technical Operations Console</h1>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Monitor API uptime, inspect system logs, and resolve technical integration issues.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowAlertModal(true)} style={{ padding: '10px 18px', background: '#fff1f2', color: '#dc2626', border: '1px solid #fecdd3', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={16} /> Restart Service Alert
            </button>
          </div>
        </div>

        {/* Top KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Overall System Uptime</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#059669', marginTop: '6px' }}>99.98%</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Open Tech Tickets</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#003366', marginTop: '6px' }}>{techTickets.filter(t => t.status !== 'Resolved').length}</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>API Error Rate (24h)</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#2563eb', marginTop: '6px' }}>0.02%</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>3rd-Party Integrations</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#059669', marginTop: '6px' }}>All Operational</div>
          </div>
        </div>

        {/* Tab 1: Services Health Grid */}
        {activeTab === 'health' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Live Infrastructure & Service Panel</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {services.map((srv, idx) => (
                <div key={idx} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>{srv.type}</span>
                    <span style={{ padding: '2px 8px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '800', background: '#dcfce7', color: '#166534' }}>
                      {srv.status}
                    </span>
                  </div>
                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a', marginBottom: '6px' }}>{srv.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>Uptime: <strong>{srv.uptime}</strong> • Latency: <strong>{srv.latency}</strong></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Monospace Error Logs Viewer */}
        {activeTab === 'logs' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Application System & API Error Logs</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select value={logFilter} onChange={e => setLogFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: '700', outline: 'none' }}>
                  <option value="ALL">All Severities</option>
                  <option value="INFO">INFO</option>
                  <option value="WARN">WARN</option>
                  <option value="ERROR">ERROR</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
                <input type="text" placeholder="Search log keywords..." value={logSearch} onChange={e => setLogSearch(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none' }} />
              </div>
            </div>

            {/* Dark Monospace Console Window */}
            <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px', height: '380px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.85rem' }}>
              {filteredLogs.map(l => (
                <div key={l.id} style={{ marginBottom: '10px', color: l.level === 'CRITICAL' ? '#f87171' : (l.level === 'ERROR' ? '#fb923c' : (l.level === 'WARN' ? '#facc15' : '#38bdf8')) }}>
                  [{l.time}] [{l.level}] [{l.service}] — {l.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Tech Tickets */}
        {activeTab === 'tickets' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Escalated Technical Tickets Queue</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Ticket ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Issue Subject</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Category</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Priority</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#0f172a' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#0f172a' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {techTickets.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#003366' }}>{t.id}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{t.title}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{t.category}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', background: t.priority === 'Critical' ? '#fee2e2' : '#ffedd5', color: t.priority === 'Critical' ? '#dc2626' : '#c2410c' }}>
                        {t.priority}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', background: t.status === 'Resolved' ? '#dcfce7' : '#e0f2fe', color: t.status === 'Resolved' ? '#166534' : '#0369a1' }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {t.status !== 'Resolved' && (
                        <button onClick={() => handleResolveTicket(t.id)} style={{ padding: '6px 12px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
                          Mark Fixed
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Technical Unlock Accounts */}
        {activeTab === 'unlocks' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Technically Locked User Accounts</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Account ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>User Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Email Address</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Lock Cause</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#0f172a' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {lockedAccounts.map(acc => (
                  <tr key={acc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#003366' }}>{acc.id}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{acc.user} ({acc.role})</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{acc.email}</td>
                    <td style={{ padding: '12px', color: '#dc2626', fontWeight: '700' }}>{acc.reason}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button onClick={() => setShowUnlockModal(acc)} style={{ padding: '6px 12px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Unlock size={14} /> Remove Tech Lock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Unlock Technical Lock Modal */}
      {showUnlockModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 12px', color: '#003366', fontWeight: '800' }}>Unlock Technical Access</h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748b' }}>Confirm unlocking OAuth login lockout for <strong>{showUnlockModal.user}</strong>.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowUnlockModal(null)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleUnlockAccount} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#003366', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Remove Lock</button>
            </div>
          </div>
        </div>
      )}

      {/* Service Alert Modal */}
      {showAlertModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 12px', color: '#dc2626', fontWeight: '800' }}>Alert Admin / Restart Service</h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748b' }}>Transmit emergency infrastructure service restart alert to Admin.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowAlertModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAlertSubmit} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#dc2626', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Transmit Alert</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ITDashboard;

