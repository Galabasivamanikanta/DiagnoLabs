import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { 
    HeartPulse, Syringe, Users, MessageSquare, AlertCircle, 
    FileText, CheckCircle2, Clock, LogOut, ChevronRight, Menu, X 
} from 'lucide-react';
import '../styles/DashboardShared.css';
import { syncTelemetryToAI } from '../utils/telemetry';

const NurseDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'vitals', 'followups', 'doctor-requests'
  const [unitTemp, setUnitTemp] = useState('F'); // F or C
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [vitalsForm, setVitalsForm] = useState({ 
    patient: 'John Doe (P-101)', bpSystolic: '120', bpDiastolic: '80', pulse: '72', temp: '98.6', weight: '70', o2: '98' 
  });

  const [followupForm, setFollowupForm] = useState({
    patient: '', outcome: "Doctor's Advice Followed", notes: ''
  });

  const [showFollowupModal, setShowFollowupModal] = useState(false);

  // Mock Data
  const [queue, setQueue] = useState([
    { id: 'N-201', patient: 'John Doe', test: 'IV Blood Draw & Vitals Check', priority: 'High', location: 'Home Visit - Jubilee Hills', doctorNote: 'Check BP before draw' },
    { id: 'N-202', patient: 'Emma Watson', test: 'Pediatric Venipuncture Supervision', priority: 'Normal', location: 'Clinic Room A-102', doctorNote: 'Use butterfly needle' },
    { id: 'N-203', patient: 'Michael Scott', test: 'Post-Report Vitals & ECG Check', priority: 'Normal', location: 'Clinic Room B-205', doctorNote: 'Monitor pulse' }
  ]);

  const [followups, setFollowups] = useState([
    { id: 'F-501', patient: 'Suresh Raina', phone: '+91 98765 22114', test: 'Lipid Profile', status: 'Pending', note: 'Check if statin dosage started' },
    { id: 'F-502', patient: 'Ananya Roy', phone: '+91 91234 44332', test: 'Thyroid Panel', status: 'Completed', note: 'Patient confirmed taking T4 supplement' }
  ]);

  const [doctorRequests] = useState([
    { id: 'DR-99', doctor: 'Dr. Sarah Jenkins', patient: 'Charlie Brown', request: 'Record 24-hr Ambulatory BP trend before evening review', urgency: 'High' }
  ]);

  const handleLogout = () => {
    logout();
    navigate('/adminlogin');
  };

  const handleVitalsSubmit = (e) => {
    e.preventDefault();
    const isAbnormal = parseInt(vitalsForm.bpSystolic) > 140 || parseInt(vitalsForm.o2) < 95;
    
    syncTelemetryToAI(
      "Patient Vitals Recorded",
      `Nurse recorded vitals for ${vitalsForm.patient}. BP: ${vitalsForm.bpSystolic}/${vitalsForm.bpDiastolic}, SpO2: ${vitalsForm.o2}%. Status: ${isAbnormal ? 'Abnormal' : 'Normal'}`,
      "nurse"
    );

    if (isAbnormal) {
      alert(`⚠️ Vitals recorded for ${vitalsForm.patient}! Abnormal reading detected (BP: ${vitalsForm.bpSystolic}/${vitalsForm.bpDiastolic}, SpO2: ${vitalsForm.o2}%). Urgent alert transmitted to Doctor.`);
    } else {
      alert(`Vitals recorded for ${vitalsForm.patient}! Saved to patient health record.`);
    }
    setVitalsForm({ patient: '', bpSystolic: '', bpDiastolic: '', pulse: '', temp: '', weight: '', o2: '' });
  };

  const handleFollowupSubmit = (e) => {
    e.preventDefault();
    
    syncTelemetryToAI(
      "Post-Care Follow-up Logged",
      `Nurse completed follow-up for ${followupForm.patient}. Outcome: [${followupForm.outcome}]. Notes: ${followupForm.notes}`,
      "nurse"
    );

    alert(`Follow-up log saved for ${followupForm.patient}! Outcome: [${followupForm.outcome}]. Recorded in Audit Trail.`);
    setShowFollowupModal(false);
    setFollowupForm({ patient: '', outcome: "Doctor's Advice Followed", notes: '' });
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
              <HeartPulse size={24} color="#003366" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#003366', margin: 0 }}>DiagnoLabs</h2>
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Clinical Nursing Workspace</span>
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
            <Activity size={18} /> Supervised Collection Queue ({queue.length})
          </button>
          <button 
            onClick={() => setActiveTab('vitals')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'vitals' ? '#f0f7ff' : 'transparent', color: activeTab === 'vitals' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <HeartPulse size={18} /> Clinical Vitals Entry
          </button>
          <button 
            onClick={() => setActiveTab('followups')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'followups' ? '#f0f7ff' : 'transparent', color: activeTab === 'followups' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <PhoneCall size={18} /> Patient Follow-ups ({followups.filter(f => f.status === 'Pending').length})
          </button>
          <button 
            onClick={() => setActiveTab('doctor-requests')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'doctor-requests' ? '#f0f7ff' : 'transparent', color: activeTab === 'doctor-requests' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <Stethoscope size={18} /> Doctor Requests ({doctorRequests.length})
          </button>
        </nav>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <div style={{ padding: '16px', marginBottom: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#003366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem', flexShrink: 0 }}>
                {(user?.name || 'Nurse Clara').charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Nurse Clara'}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'nurse@diagnolabs.com'}</div>
              </div>
            </div>
            <div style={{ background: '#f0f7ff', color: '#003366', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', alignSelf: 'flex-start', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Reg #RN-44091 • Senior Clinical Nurse
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
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>Clinical Nurse Executive Dashboard</h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Welcome back, Nurse Clara. Shift: Morning (08:00 AM - 04:00 PM).</p>
            </div>
          </div>
          <button onClick={() => setActiveTab('vitals')} style={{ padding: '10px 18px', background: '#003366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Quick Vitals Entry
          </button>
        </div>

        {/* Top KPIs */}
        <div className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Assigned Clinical Tasks</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#003366', marginTop: '6px' }}>{queue.length}</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Vitals Recorded Today</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#059669', marginTop: '6px' }}>22</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Follow-ups Pending</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#d97706', marginTop: '6px' }}>{followups.filter(f => f.status === 'Pending').length}</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Doctor Requests</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#2563eb', marginTop: '6px' }}>{doctorRequests.length}</div>
          </div>
        </div>

        {/* Tab 1: Supervised Collection Queue */}
        {activeTab === 'queue' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Supervised Clinical Sample Collection & Vitals Check Queue</h3>
            <div className="dashboard-table-container">
              <table className="dashboard-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Task ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Patient Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Clinical Requirement</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Location</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Doctor Instructions</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#0f172a', fontWeight: '800' }}>Action</th>
                  </tr>
                </thead>
              <tbody>
                {queue.map(q => (
                  <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#003366' }}>{q.id}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{q.patient}</td>
                    <td style={{ padding: '12px', color: '#334155' }}>{q.test}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{q.location}</td>
                    <td style={{ padding: '12px', color: '#d97706', fontWeight: '600' }}>{q.doctorNote}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button 
                        onClick={() => {
                          alert(`Clinical sample procedure completed for ${q.patient}! Sample transferred to collector.`);
                          setQueue(prev => prev.filter(item => item.id !== q.id));
                        }}
                        style={{ padding: '6px 14px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        Mark Complete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Tab 2: Vitals Entry Form */}
        {activeTab === 'vitals' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', maxWidth: '640px', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>Clinical Vitals Recording Entry</h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: '#64748b' }}>Recorded vitals are automatically attached to the patient's booking file and logged in the HIPAA audit trail.</p>

            <form onSubmit={handleVitalsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>SELECT PATIENT</label>
                <input type="text" required value={vitalsForm.patient} onChange={e => setVitalsForm({...vitalsForm, patient: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none', fontSize: '0.9rem' }} placeholder="Search patient name or ID..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>BLOOD PRESSURE (mmHg)</label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <input type="number" required placeholder="Systolic (120)" value={vitalsForm.bpSystolic} onChange={e => setVitalsForm({...vitalsForm, bpSystolic: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                    <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>/</span>
                    <input type="number" required placeholder="Diastolic (80)" value={vitalsForm.bpDiastolic} onChange={e => setVitalsForm({...vitalsForm, bpDiastolic: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>PULSE RATE (BPM)</label>
                  <input type="number" required value={vitalsForm.pulse} onChange={e => setVitalsForm({...vitalsForm, pulse: e.target.value})} placeholder="e.g. 72" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>BODY TEMP ({unitTemp})</label>
                    <button type="button" onClick={() => setUnitTemp(unitTemp === 'F' ? 'C' : 'F')} style={{ fontSize: '0.7rem', fontWeight: '800', color: '#003366', background: '#f0f7ff', border: 'none', borderRadius: '6px', padding: '2px 6px', cursor: 'pointer' }}>Toggle °{unitTemp === 'F' ? 'C' : 'F'}</button>
                  </div>
                  <input type="number" step="0.1" required value={vitalsForm.temp} onChange={e => setVitalsForm({...vitalsForm, temp: e.target.value})} placeholder="e.g. 98.6" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>OXYGEN SATURATION SpO2 (%)</label>
                  <input type="number" required value={vitalsForm.o2} onChange={e => setVitalsForm({...vitalsForm, o2: e.target.value})} placeholder="e.g. 98" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none' }} />
                </div>
              </div>

              <button type="submit" style={{ padding: '12px', background: '#003366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', marginTop: '8px' }}>
                Save Vitals Record & Notify Doctor
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Patient Follow-up Logger */}
        {activeTab === 'followups' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Post-Report Patient Follow-up Call List</h3>
              <button onClick={() => setShowFollowupModal(true)} style={{ padding: '8px 16px', background: '#003366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>
                + Log Follow-up Call
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Follow-up ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Patient Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Phone</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Test Context</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {followups.map(f => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#003366' }}>{f.id}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{f.patient}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{f.phone}</td>
                    <td style={{ padding: '12px', color: '#334155' }}>{f.test}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', background: f.status === 'Completed' ? '#dcfce7' : '#fef3c7', color: f.status === 'Completed' ? '#166534' : '#92400e' }}>
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Doctor Requests */}
        {activeTab === 'doctor-requests' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Physician Coordination Requests</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {doctorRequests.map(dr => (
                <div key={dr.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '800', color: '#003366' }}>From: {dr.doctor}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: '100px' }}>{dr.urgency} Urgency</span>
                  </div>
                  <p style={{ margin: '8px 0', fontSize: '0.85rem', color: '#334155' }}>Patient: <strong>{dr.patient}</strong> — {dr.request}</p>
                  <button onClick={() => alert(`Completed Doctor Request [${dr.id}]. Confirmation sent back to ${dr.doctor}.`)} style={{ padding: '6px 14px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
                    Send Confirmation Note to Doctor
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Log Follow-up Modal */}
      {showFollowupModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px', color: '#0f172a', fontWeight: '800' }}>Log Patient Follow-up Call Outcome</h3>
            <form onSubmit={handleFollowupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>PATIENT NAME</label>
                <input type="text" required value={followupForm.patient} onChange={e => setFollowupForm({...followupForm, patient: e.target.value})} placeholder="e.g. Suresh Raina" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>CALL OUTCOME</label>
                <select value={followupForm.outcome} onChange={e => setFollowupForm({...followupForm, outcome: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none', background: 'white' }}>
                  <option>Doctor's Advice Followed</option>
                  <option>Needs Re-consultation</option>
                  <option>Patient Unreachable / No Response</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>CLINICAL NOTES</label>
                <textarea rows="3" value={followupForm.notes} onChange={e => setFollowupForm({...followupForm, notes: e.target.value})} placeholder="Add details from the call..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none' }}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowFollowupModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#003366', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Save Follow-up Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseDashboard;

