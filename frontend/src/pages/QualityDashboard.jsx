import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { 
    ShieldCheck, AlertTriangle, FileText, CheckCircle2, XCircle, 
    Download, Award, Ban, AlertOctagon, Send, Clock, User, LogOut, ChevronRight, BarChart2
} from 'lucide-react';

const QualityDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('cases'); // 'cases', 'audit', 'renewals', 'actions'
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(null);

  // Multi-step Audit Checklist Form state
  const [auditForm, setAuditForm] = useState({
    labName: 'Apollo Diagnostics - Gachibowli',
    hygiene: true,
    calibration: true,
    turnaround: false,
    staffCertified: true,
    findings: 'Turnaround SLA breached by 45 mins due to analyzer maintenance.'
  });

  // Blacklist Recommendation state
  const [blacklistForm, setBlacklistForm] = useState({
    reason: 'Repeated Mismatched Test Results & Hygiene Violation',
    note: 'Lab failed 2 consecutive audits. Recommending 30-day suspension pending corrective action.'
  });

  // Mock Open QC Flagged Cases
  const [qcCases, setQcCases] = useState([
    { id: 'QC-901', lab: 'Apollo Diagnostics', testType: 'Thyroid Profile', issue: 'Delayed Result SLA (> 8 hrs)', severity: 'Medium', date: '2026-08-04', status: 'Under Review' },
    { id: 'QC-902', lab: 'Vijaya Pathology Center', testType: 'Lipid Profile', issue: 'Mismatched Cholesterol Value Reported', severity: 'Critical', date: '2026-08-03', status: 'Warning Issued' },
    { id: 'QC-903', lab: 'MedPlus Diagnostics', testType: 'Complete Blood Count (CBC)', issue: 'Sample Hemolysis Reported', severity: 'High', date: '2026-08-02', status: 'Resolved' }
  ]);

  // Mock Lab License Compliance Tracker
  const [labLicenses] = useState([
    { lab: 'Apollo Diagnostics - Gachibowli', cert: 'NABL Accreditation', expiry: '2026-09-10', daysLeft: 37, status: 'Expiring Soon' },
    { lab: 'Vijaya Diagnostic Center', cert: 'ISO 9001:2015', expiry: '2027-02-15', daysLeft: 195, status: 'Compliant' },
    { lab: 'MedPlus Labs', cert: 'CAP Accreditation', expiry: '2026-08-15', daysLeft: 11, status: 'Urgent Renewal Required' }
  ]);

  const handleLogout = () => {
    logout();
    navigate('/adminlogin');
  };

  const handleAuditSubmit = (e) => {
    e.preventDefault();
    const checkedCount = [auditForm.hygiene, auditForm.calibration, auditForm.turnaround, auditForm.staffCertified].filter(Boolean).length;
    const score = (checkedCount / 4) * 100;
    alert(`Lab Audit Completed for [${auditForm.labName}]!\nCompliance Score: ${score}%\nFindings logged in audit trail.`);
    setShowAuditModal(false);
  };

  const handleBlacklistSubmit = (e) => {
    e.preventDefault();
    alert(`Blacklist & Suspension Recommendation for [${showBlacklistModal.lab}] TRANSMITTED to Admin! Pending super-user sign-off.`);
    setShowBlacklistModal(null);
  };

  const exportQCReport = () => {
    const headers = ["QC Case ID", "Lab Partner", "Test Type", "Issue Description", "Severity", "Status"];
    const rows = qcCases.map(c => [c.id, c.lab, c.testType, c.issue, c.severity, c.status]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DiagnoLabs_QC_Audit_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', background: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 12px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={24} color="#003366" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#003366', margin: 0 }}>DiagnoLabs</h2>
          </div>
          <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Quality & Compliance Auditor</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <button 
            onClick={() => setActiveTab('cases')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'cases' ? '#f0f7ff' : 'transparent', color: activeTab === 'cases' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <AlertTriangle size={18} /> Flagged QC Cases ({qcCases.filter(c => c.status !== 'Resolved').length})
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'audit' ? '#f0f7ff' : 'transparent', color: activeTab === 'audit' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <FileText size={18} /> Conduct Lab Audit
          </button>
          <button 
            onClick={() => setActiveTab('renewals')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'renewals' ? '#f0f7ff' : 'transparent', color: activeTab === 'renewals' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <Award size={18} /> NABL / ISO Renewals
          </button>
        </nav>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <div style={{ padding: '8px 12px', marginBottom: '12px', background: '#f1f5f9', borderRadius: '10px' }}>
            <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#0f172a' }}>{user?.name || 'QC Lead Auditor'}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Clinical Quality Specialist</div>
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
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>Clinical Quality Control & Compliance Console</h1>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Audit diagnostic accuracy, resolve test report disputes, and enforce NABL standards.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={exportQCReport} style={{ padding: '10px 18px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download size={16} /> Export QC Ledger CSV
            </button>
            <button onClick={() => setShowAuditModal(true)} style={{ padding: '10px 18px', background: '#003366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> Start New Lab Audit
            </button>
          </div>
        </div>

        {/* Top KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Open QC Cases</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#003366', marginTop: '6px' }}>{qcCases.filter(c => c.status !== 'Resolved').length}</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Labs Under Active Audit</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#2563eb', marginTop: '6px' }}>4</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Complaints (This Month)</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#d97706', marginTop: '6px' }}>8</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Avg Compliance Score</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#059669', marginTop: '6px' }}>94.2%</div>
          </div>
        </div>

        {/* Tab 1: QC Cases Stream */}
        {activeTab === 'cases' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Flagged Disputed Test Reports & Complaints</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Case ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Lab Partner</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Test Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Issue Description</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Severity</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#0f172a' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#0f172a' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {qcCases.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#003366' }}>{c.id}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{c.lab}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{c.testType}</td>
                    <td style={{ padding: '12px', color: '#334155' }}>{c.issue}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', background: c.severity === 'Critical' ? '#fee2e2' : '#ffedd5', color: c.severity === 'Critical' ? '#dc2626' : '#c2410c' }}>
                        {c.severity}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', background: c.status === 'Resolved' ? '#dcfce7' : '#e0f2fe', color: c.status === 'Resolved' ? '#166534' : '#0369a1' }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button onClick={() => setShowBlacklistModal(c)} style={{ padding: '6px 12px', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', borderRadius: '8px', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
                        Recommend Blacklist
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: NABL / ISO Renewals Tracker */}
        {activeTab === 'renewals' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Lab Accreditation & License Expiry Tracker</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Lab Partner Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Accreditation Certificate</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Expiry Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Days Remaining</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#0f172a' }}>Compliance Status</th>
                </tr>
              </thead>
              <tbody>
                {labLicenses.map((lic, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#003366' }}>{lic.lab}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{lic.cert}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{lic.expiry}</td>
                    <td style={{ padding: '12px', fontWeight: '800', color: lic.daysLeft < 30 ? '#dc2626' : '#059669' }}>{lic.daysLeft} days</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', background: lic.status === 'Compliant' ? '#dcfce7' : '#fee2e2', color: lic.status === 'Compliant' ? '#166534' : '#dc2626' }}>
                        {lic.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Multi-step Lab Audit Checklist Modal */}
      {showAuditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px', color: '#003366', fontWeight: '800' }}>Lab Quality Audit Checklist</h3>
            <form onSubmit={handleAuditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>LAB PARTNER UNDER AUDIT</label>
                <input type="text" required value={auditForm.labName} onChange={e => setAuditForm({...auditForm, labName: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none', fontWeight: '700' }} />
              </div>

              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>
                  <input type="checkbox" checked={auditForm.hygiene} onChange={e => setAuditForm({...auditForm, hygiene: e.target.checked})} />
                  1. Hygiene & Biosafety Standards (Sterile Vials / Disposal)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>
                  <input type="checkbox" checked={auditForm.calibration} onChange={e => setAuditForm({...auditForm, calibration: e.target.checked})} />
                  2. Equipment Calibration Verification (Centrifuge / Analyzers)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>
                  <input type="checkbox" checked={auditForm.turnaround} onChange={e => setAuditForm({...auditForm, turnaround: e.target.checked})} />
                  3. Report Upload Turnaround Time SLA Compliance
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>
                  <input type="checkbox" checked={auditForm.staffCertified} onChange={e => setAuditForm({...auditForm, staffCertified: e.target.checked})} />
                  4. Staff License & MD Pathologist Oversight Verification
                </label>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>AUDIT FINDINGS & CAPA NOTES</label>
                <textarea rows="3" value={auditForm.findings} onChange={e => setAuditForm({...auditForm, findings: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none' }}></textarea>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAuditModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#003366', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Submit Audit Score</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blacklist Recommendation Modal */}
      {showBlacklistModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px', color: '#dc2626', fontWeight: '800' }}>Recommend Lab Suspension / Blacklist</h3>
            <form onSubmit={handleBlacklistSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>TARGET LAB PARTNER</label>
                <input type="text" disabled value={showBlacklistModal.lab} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', background: '#f1f5f9', fontWeight: '800' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>REASON FOR SUSPENSION RECOMMENDATION</label>
                <textarea rows="3" required value={blacklistForm.note} onChange={e => setBlacklistForm({...blacklistForm, note: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none' }}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowBlacklistModal(null)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#dc2626', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Transmit to Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityDashboard;

