import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { 
    LifeBuoy, MessageSquare, Clock, AlertOctagon, CheckCircle2, 
    Send, ShieldAlert, BookOpen, ArrowRightLeft, User, Search, Filter, LogOut, ChevronRight, X, Menu
} from 'lucide-react';
import '../styles/DashboardShared.css';

const SupportDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'my-tickets', 'knowledge', 'sla'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateDepartment, setEscalateDepartment] = useState('Accounts / Finance');
  const [escalateNote, setEscalateNote] = useState('');

  // Pre-formatted Quick Templates for Knowledge Base
  const quickTemplates = [
    { title: 'Refund Escalated to Finance', text: 'Thank you for reaching out. We have logged your refund request and escalated it directly to our Accounts & Finance team for processing.' },
    { title: 'Collector Delay Apology', text: 'We apologize for the delay. Our sample collector is en route and will arrive at your registered address within 15 minutes.' },
    { title: 'Report Processing Status', text: 'Your diagnostic samples are currently undergoing quality processing at the lab. Your verified digital report will be uploaded within 2 hours.' }
  ];

  // Mock Support Tickets Queue
  const [tickets, setTickets] = useState([
    { id: 'TKT-8801', raisedBy: 'Rahul Sharma (Patient)', role: 'Patient', issueType: 'Payment Refund Mismatch', priority: 'Critical', slaTimer: '12 mins remaining', date: '2026-08-04 14:10', status: 'Open', description: 'Charged twice for Blood Profile booking via UPI.', assignedTo: null },
    { id: 'TKT-8802', raisedBy: 'Apollo Diagnostics (Lab Partner)', role: 'Lab Partner', issueType: 'Reagent Supply Delay', priority: 'High', slaTimer: '45 mins remaining', date: '2026-08-04 13:30', status: 'In Progress', description: 'Need urgent restock of Blood Collection Red Tubes.', assignedTo: 'me' },
    { id: 'TKT-8803', raisedBy: 'Nurse Clara (Staff)', role: 'Internal Staff', issueType: 'App Vitals Sync Bug', priority: 'Medium', slaTimer: '2 hours remaining', date: '2026-08-04 12:00', status: 'In Progress', description: 'Patient BP vitals not syncing to doctor dashboard.', assignedTo: 'me' },
    { id: 'TKT-8804', raisedBy: 'Priya Singh (Patient)', role: 'Patient', issueType: 'Sample Collection Reschedule', priority: 'Low', slaTimer: 'SLA Met', date: '2026-08-04 10:00', status: 'Resolved', description: 'Requesting time slot shift from 8 AM to 11 AM.', assignedTo: 'me' }
  ]);

  useEffect(() => {
    if (tickets.length > 0 && !selectedTicket) {
      setSelectedTicket(tickets[0]);
    }
  }, [tickets]);

  const handleLogout = () => {
    logout();
    navigate('/adminlogin');
  };

  const handleAssignToMe = (ticketId) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, assignedTo: 'me', status: 'In Progress' } : t));
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(prev => ({ ...prev, assignedTo: 'me', status: 'In Progress' }));
    }
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    alert(`Response sent to ${selectedTicket.raisedBy}! Ticket updated.`);
    setReplyText('');
  };

  const handleCloseTicket = (ticketId) => {
    alert(`Ticket [${ticketId}] RESOLVED & CLOSED! CSAT Rating survey sent via Nodemailer to patient.`);
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'Resolved' } : t));
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(prev => ({ ...prev, status: 'Resolved' }));
    }
  };

  const handleEscalateSubmit = (e) => {
    e.preventDefault();
    alert(`Ticket [${selectedTicket.id}] ESCALATED to [${escalateDepartment}]! Category note logged in audit trail.`);
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: 'Escalated' } : t));
    setSelectedTicket(prev => ({ ...prev, status: 'Escalated' }));
    setShowEscalateModal(false);
    setEscalateNote('');
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
              <LifeBuoy size={24} color="#003366" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#003366', margin: 0 }}>DiagnoLabs</h2>
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Customer Support Helpdesk</span>
          </div>
          {/* Close button for mobile sidebar */}
          <div className="dashboard-header-mobile-toggle" style={{ border: 'none', padding: 0, margin: 0 }} onClick={() => setSidebarOpen(false)}>
             <X size={24} color="#64748b" />
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <button 
            onClick={() => setActiveTab('queue')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'queue' ? '#f0f7ff' : 'transparent', color: activeTab === 'queue' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <MessageSquare size={18} /> Support Queue ({tickets.filter(t => t.status !== 'Resolved').length})
          </button>
          <button 
            onClick={() => setActiveTab('my-tickets')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'my-tickets' ? '#f0f7ff' : 'transparent', color: activeTab === 'my-tickets' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <User size={18} /> My Assigned Tickets ({tickets.filter(t => t.assignedTo === 'me' && t.status !== 'Resolved').length})
          </button>
          <button 
            onClick={() => setActiveTab('knowledge')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'knowledge' ? '#f0f7ff' : 'transparent', color: activeTab === 'knowledge' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <BookOpen size={18} /> Quick Response Templates
          </button>
          <button 
            onClick={() => setActiveTab('sla')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'sla' ? '#f0f7ff' : 'transparent', color: activeTab === 'sla' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <Clock size={18} /> SLA & CSAT Performance
          </button>
        </nav>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <div style={{ padding: '16px', marginBottom: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#003366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem', flexShrink: 0 }}>
                {(user?.name || 'Support Executive').charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Support Executive'}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'support@diagnolabs.com'}</div>
              </div>
            </div>
            <div style={{ background: '#f0f7ff', color: '#003366', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', alignSelf: 'flex-start', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Helpdesk Specialist Tier-1
            </div>
            <button onClick={() => navigate('/admin/profile')} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              View Full Profile <ChevronRight size={14} />
            </button>
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
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>Omnichannel Customer Support Hub</h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Triage tickets across Patients, Lab Partners, and Internal Staff with SLA tracking.</p>
            </div>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Open Tickets Queue</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#003366', marginTop: '6px' }}>{tickets.filter(t => t.status === 'Open').length}</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Resolved Today</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#059669', marginTop: '6px' }}>18</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Avg. First Response Time</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#2563eb', marginTop: '6px' }}>14 mins</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #fee2e2', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>SLA Breach Warning Alerts</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#dc2626', marginTop: '6px' }}>1 Ticket</div>
          </div>
        </div>

        {/* Zendesk-style Split View Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Left Column: Ticket List */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Ticket Stream Queue</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tickets.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => setSelectedTicket(t)}
                  style={{ padding: '16px', borderRadius: '12px', border: selectedTicket?.id === t.id ? '2px solid #003366' : '1px solid #e2e8f0', background: selectedTicket?.id === t.id ? '#f0f7ff' : '#ffffff', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '800', color: '#003366', fontSize: '0.85rem' }}>{t.id} • {t.raisedBy}</span>
                    <span style={{ padding: '2px 8px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '800', background: t.priority === 'Critical' ? '#fee2e2' : (t.priority === 'High' ? '#ffedd5' : '#f1f5f9'), color: t.priority === 'Critical' ? '#dc2626' : (t.priority === 'High' ? '#c2410c' : '#475569') }}>
                      {t.priority}
                    </span>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a', marginBottom: '4px' }}>{t.issueType}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>SLA Target: <strong style={{ color: t.slaTimer.includes('remaining') ? '#dc2626' : '#059669' }}>{t.slaTimer}</strong></div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Selected Ticket Detail Panel */}
          {selectedTicket && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#003366' }}>{selectedTicket.id}</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {selectedTicket.assignedTo !== 'me' && (
                      <button onClick={() => handleAssignToMe(selectedTicket.id)} style={{ padding: '6px 12px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>
                        Assign to Me
                      </button>
                    )}
                    <button onClick={() => setShowEscalateModal(true)} style={{ padding: '6px 12px', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', borderRadius: '8px', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>
                      Escalate
                    </button>
                    <button onClick={() => handleCloseTicket(selectedTicket.id)} style={{ padding: '6px 12px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>
                      Mark Resolved
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#475569' }}>
                  <strong>From:</strong> {selectedTicket.raisedBy} • <strong>Category:</strong> {selectedTicket.issueType}
                </div>
              </div>

              {/* Ticket Description */}
              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', marginBottom: '16px', fontSize: '0.85rem', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                <strong>Issue Details:</strong> {selectedTicket.description}
              </div>

              {/* Quick Template Picker */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>INSERT KNOWLEDGE BASE TEMPLATE</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {quickTemplates.map((tmpl, idx) => (
                    <button key={idx} onClick={() => setReplyText(tmpl.text)} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.75rem', fontWeight: '700', color: '#003366', cursor: 'pointer' }}>
                      + {tmpl.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Response Editor */}
              <form onSubmit={handleSendReply} style={{ marginTop: 'auto' }}>
                <textarea 
                  rows="4" 
                  value={replyText} 
                  onChange={e => setReplyText(e.target.value)} 
                  placeholder="Type your response to the user..." 
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.85rem', fontFamily: 'inherit' }}
                ></textarea>
                <button type="submit" style={{ width: '100%', padding: '10px', background: '#003366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Send size={14} /> Send Reply & Notify User
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Escalation Modal */}
      {showEscalateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px', color: '#e11d48', fontWeight: '800' }}>Escalate Ticket #{selectedTicket?.id}</h3>
            <form onSubmit={handleEscalateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>SELECT TARGET DEPARTMENT</label>
                <select value={escalateDepartment} onChange={e => setEscalateDepartment(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none', background: 'white', fontWeight: '700' }}>
                  <option>Accounts / Finance (Payment / Refund Dispute)</option>
                  <option>IT Specialist (App Bug / Service Outage)</option>
                  <option>System Manager / Admin (Policy Escalation)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>ESCALATION CONTEXT NOTES</label>
                <textarea rows="3" required value={escalateNote} onChange={e => setEscalateNote(e.target.value)} placeholder="Provide reasoning for escalation..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none' }}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowEscalateModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#e11d48', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Transmit Escalation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportDashboard;
