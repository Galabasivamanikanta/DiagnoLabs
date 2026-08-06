import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { 
    Stethoscope, FileText, AlertTriangle, MessageSquare, CheckCircle, 
    Clock, Search, User, ShieldCheck, Send, AlertCircle, LogOut, ChevronRight, X, Menu
} from 'lucide-react';
import '../styles/DashboardShared.css';
import { syncTelemetryToAI } from '../utils/telemetry';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'bot-escalations', 'patients', 'prescriptions'
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedBotChat, setSelectedBotChat] = useState(null);
  const [interpretationNote, setInterpretationNote] = useState('');
  const [classification, setClassification] = useState('Normal');
  const [docReply, setDocReply] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [reportsQueue, setReportsQueue] = useState([]);
  const [chatEscalations, setChatEscalations] = useState([]);
  const [patients] = useState([]);

  const handleLogout = () => {
    logout();
    navigate('/adminlogin');
  };

  const submitReportReview = (e) => {
    e.preventDefault();
    
    // Telemetry Sync to AI for self-learning
    syncTelemetryToAI(
      "Medical Interpretation Submitted",
      `Doctor diagnosed ${selectedReport.patient}'s report as [${classification}] with note: "${interpretationNote}"`,
      "doctor"
    );

    alert(`Medical Interpretation submitted for ${selectedReport.patient}! Classification: [${classification}]. Patient notified via email.`);
    setReportsQueue(prev => prev.map(r => r.id === selectedReport.id ? { ...r, status: classification, reviewed: true } : r));
    setSelectedReport(null);
    setInterpretationNote('');
  };

  const resolveChatEscalation = (id) => {
    // Telemetry Sync to AI for self-learning
    syncTelemetryToAI(
      "AI Chat Escalation Resolved",
      `Doctor provided manual medical guidance to resolve escalation #${id}. Reply: "${docReply}"`,
      "doctor"
    );

    alert(`Doctor response transmitted to patient. Chat Escalation [${id}] resolved.`);
    setChatEscalations(prev => prev.filter(c => c.id !== id));
    setSelectedBotChat(null);
    setDocReply('');
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
              <Stethoscope size={24} color="#003366" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#003366', margin: 0 }}>DiagnoLabs</h2>
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Clinical Physician Portal</span>
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
            <FileText size={18} /> Priority Report Queue ({reportsQueue.filter(r => !r.reviewed).length})
          </button>
          <button 
            onClick={() => setActiveTab('bot-escalations')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'bot-escalations' ? '#f0f7ff' : 'transparent', color: activeTab === 'bot-escalations' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <MessageSquare size={18} /> AI Chat Escalations ({chatEscalations.length})
          </button>
          <button 
            onClick={() => setActiveTab('patients')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'patients' ? '#f0f7ff' : 'transparent', color: activeTab === 'patients' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <User size={18} /> My Patients Timeline
          </button>
        </nav>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <div style={{ padding: '16px', marginBottom: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#003366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem', flexShrink: 0 }}>
                {(user?.name || 'Dr. Sarah Jenkins').charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Dr. Sarah Jenkins'}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'dr.@diagnolabs.com'}</div>
              </div>
            </div>
            <div style={{ background: '#f0f7ff', color: '#003366', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', alignSelf: 'flex-start', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Reg #MCI-88902 • Chief Physician
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
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="dashboard-header-mobile-toggle" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} color="#0f172a" />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>Clinical Review Workspace</h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Welcome back, Dr. Jenkins. Medical HIPAA Audit Logging is Active.</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#e0f2fe', color: '#0369a1', padding: '6px 14px', borderRadius: '100px', fontWeight: '800', fontSize: '0.8rem' }}>
            <ShieldCheck size={16} /> Patient Consent Enforcement Active
          </div>
        </div>

        {/* Top KPIs */}
        <div className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Reports Pending Review</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#003366', marginTop: '6px' }}>{reportsQueue.filter(r => !r.reviewed).length}</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #fee2e2', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Flagged Critical Results</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#dc2626', marginTop: '6px' }}>{reportsQueue.filter(r => r.status === 'CRITICAL').length}</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>AI Chatbot Escalations</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#d97706', marginTop: '6px' }}>{chatEscalations.length}</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Total Patients Reviewed</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#059669', marginTop: '6px' }}>142</div>
          </div>
        </div>

        {/* Priority Report Queue */}
        {activeTab === 'queue' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Priority Lab Report Review Queue (Urgency Sorted)</h3>
            <div className="dashboard-table-container">
              <table className="dashboard-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Report ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Patient Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Diagnostic Test</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Key Findings</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Urgency Level</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#0f172a', fontWeight: '800' }}>Action</th>
                  </tr>
                </thead>
              <tbody>
                {reportsQueue.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', background: r.status === 'CRITICAL' ? '#fff5f5' : 'white' }}>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#003366' }}>{r.id}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{r.patient} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({r.age}y / {r.gender})</span></td>
                    <td style={{ padding: '12px', color: '#334155' }}>{r.test}</td>
                    <td style={{ padding: '12px', color: r.status === 'CRITICAL' ? '#dc2626' : '#475569', fontWeight: r.status === 'CRITICAL' ? '700' : '400' }}>{r.keyFindings}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800',
                        background: r.status === 'CRITICAL' ? '#fee2e2' : (r.status === 'ABNORMAL' ? '#fef3c7' : '#dcfce7'),
                        color: r.status === 'CRITICAL' ? '#dc2626' : (r.status === 'ABNORMAL' ? '#92400e' : '#15803d'),
                        border: r.status === 'CRITICAL' ? '1px solid #fca5a5' : 'none'
                      }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button onClick={() => setSelectedReport(r)} style={{ padding: '6px 14px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
                        Review Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* AI Chatbot Escalations */}
        {activeTab === 'bot-escalations' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>AI Medical Health Chatbot Escalation Stream</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '20px' }}>Patient conversations flagged for physician review due to urgent symptoms or complex clinical queries.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {chatEscalations.map(esc => (
                <div key={esc.id} style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '800', color: '#003366', fontSize: '0.95rem' }}>{esc.patient}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{esc.time}</span>
                  </div>
                  <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', marginBottom: '10px' }}>
                    User Query: "{esc.userQuery}"
                  </div>
                  <div style={{ background: '#f0f7ff', color: '#003366', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '14px' }}>
                    AI Response: "{esc.aiResponse}"
                  </div>
                  <button onClick={() => setSelectedBotChat(esc)} style={{ padding: '8px 16px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
                    Respond & Resolve Escalation
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patient Timeline */}
        {activeTab === 'patients' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Patient Directory (Consent Verified)</h3>
            <div className="dashboard-table-container">
              <table className="dashboard-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Patient ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Consent Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Total Tests</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Last Consultation</th>
                  </tr>
                </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#003366' }}>{p.id}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{p.name}</td>
                    <td style={{ padding: '12px' }}><span style={{ padding: '4px 10px', background: '#dcfce7', color: '#166534', borderRadius: '100px', fontWeight: '800', fontSize: '0.75rem' }}>Active Consent</span></td>
                    <td style={{ padding: '12px' }}>{p.totalTests}</td>
                    <td style={{ padding: '12px' }}>{p.lastConsultation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </main>

      {/* Report Review & Annotation Modal */}
      {selectedReport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '640px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '800' }}>Clinical Interpretation: {selectedReport.patient}</h3>
              <button onClick={() => setSelectedReport(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '12px', marginBottom: '16px', fontSize: '0.85rem' }}>
              <div><strong>Test:</strong> {selectedReport.test}</div>
              <div style={{ marginTop: '4px' }}><strong>Key Findings:</strong> {selectedReport.keyFindings}</div>
            </div>

            <form onSubmit={submitReportReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>CLASSIFICATION</label>
                <select value={classification} onChange={e => setClassification(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none', background: 'white' }}>
                  <option value="Normal">Normal</option>
                  <option value="Abnormal">Abnormal (Follow-up Recommended)</option>
                  <option value="CRITICAL">CRITICAL (Immediate Urgent Care Alert)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>PHYSICIAN INTERPRETATION & RECOMMENDATIONS</label>
                <textarea required rows="4" value={interpretationNote} onChange={e => setInterpretationNote(e.target.value)} placeholder="Add clinical guidance, prescribed dosage, or recommended follow-up tests..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none' }}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setSelectedReport(null)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#003366', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Submit Interpretation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Bot Escalation Response Modal */}
      {selectedBotChat && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 14px', color: '#0f172a', fontWeight: '800' }}>Respond to AI Chat Escalation</h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '14px' }}>Patient: <strong>{selectedBotChat.patient}</strong> | Query: "{selectedBotChat.userQuery}"</p>
            <textarea rows="4" value={docReply} onChange={e => setDocReply(e.target.value)} placeholder="Type official physician guidance to send directly to patient chat..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}></textarea>
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button type="button" onClick={() => setSelectedBotChat(null)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={() => resolveChatEscalation(selectedBotChat.id)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#003366', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Send Advice & Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;

