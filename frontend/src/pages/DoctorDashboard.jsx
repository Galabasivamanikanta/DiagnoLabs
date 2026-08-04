import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Assuming API_BASE_URL is exported from '../config'
// import { API_BASE_URL } from '../config';

const API_BASE_URL = 'http://localhost:5000'; // fallback

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('patients');
  const [patients, setPatients] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    // Fetch patients
    axios.get(`${API_BASE_URL}/api/employee/doctor/patients`)
      .then(res => setPatients(res.data))
      .catch(() => {
        // Fallback mock data
        setPatients([
          { id: 1, name: 'Alice Smith', testType: 'Blood Panel', status: 'Waiting' },
          { id: 2, name: 'Bob Johnson', testType: 'MRI', status: 'In Progress' }
        ]);
      });

    // Fetch test results
    axios.get(`${API_BASE_URL}/api/employee/doctor/test-results`)
      .then(res => setTestResults(res.data))
      .catch(() => {
        setTestResults([
          { id: 101, patient: 'Charlie Brown', test: 'Complete Blood Count', result: 'Normal', date: '2026-08-04' },
          { id: 102, patient: 'Diana Prince', test: 'Lipid Panel', result: 'High Cholesterol', date: '2026-08-03' }
        ]);
      });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/adminlogin');
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
          
          :root {
            --color-navy: #0a1e46;
            --color-navy-light: #153268;
            --color-gold: #d4af37;
            --color-gold-hover: #b8962d;
            --text-light: #f0f4f8;
            --glass-bg: rgba(255, 255, 255, 0.05);
            --glass-border: rgba(212, 175, 55, 0.2);
          }
          
          * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
          body { margin: 0; background-color: var(--color-navy); color: var(--text-light); }
          
          .glass-card {
            background: var(--glass-bg);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            padding: 20px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .glass-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          }
          
          .btn {
            background: var(--color-gold);
            color: var(--color-navy);
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s ease;
          }
          .btn:hover { background: var(--color-gold-hover); }
          .btn-outline {
            background: transparent;
            color: var(--color-gold);
            border: 1px solid var(--color-gold);
          }
          .btn-outline:hover { background: rgba(212, 175, 55, 0.1); }
          
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid var(--glass-border); }
          th { color: var(--color-gold); font-weight: 600; }
          tr:hover { background: rgba(255, 255, 255, 0.02); }
        `}
      </style>

      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.profile}>
          <div style={styles.avatar}>Dr</div>
          <h3 style={{ margin: '10px 0 5px' }}>Dr. Sarah Jenkins</h3>
          <span style={styles.badge}>Chief Physician</span>
        </div>
        <nav style={styles.nav}>
          {['Dashboard', 'Patients', 'Test Results', 'Prescriptions', 'Schedule', 'Reports'].map(item => (
            <a key={item} href="#" style={styles.navLink}>{item}</a>
          ))}
          <a href="#" onClick={handleLogout} style={{...styles.navLink, color: '#ff6b6b', marginTop: 'auto'}}>Logout</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>Welcome back, Dr. Jenkins</h1>
            <p style={{ margin: '5px 0 0', opacity: 0.8 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div style={styles.bell}>🔔</div>
        </header>

        {/* Stats Row */}
        <div style={styles.statsRow}>
          {[
            { label: "Today's Patients", value: '24' },
            { label: 'Pending Reports', value: '7' },
            { label: 'Prescriptions Issued', value: '18' },
            { label: 'Appointments', value: '6' }
          ].map((stat, i) => (
            <div key={i} className="glass-card" style={styles.statCard}>
              <h4 style={{ margin: '0 0 10px', color: 'var(--color-gold)', fontWeight: 400 }}>{stat.label}</h4>
              <h2 style={{ margin: 0, fontSize: '32px' }}>{stat.value}</h2>
            </div>
          ))}
        </div>

        {/* Tabs Content */}
        <div className="glass-card" style={{ marginTop: '30px' }}>
          <div style={styles.tabs}>
            <button 
              style={activeTab === 'patients' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('patients')}
            >Patients Today</button>
            <button 
              style={activeTab === 'results' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('results')}
            >Test Results</button>
            <button 
              style={activeTab === 'prescriptions' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('prescriptions')}
            >Prescriptions</button>
          </div>

          <div style={{ paddingTop: '20px' }}>
            {activeTab === 'patients' && (
              <table>
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Test Type</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.testType}</td>
                      <td><span style={styles.statusBadge}>{p.status}</span></td>
                      <td><button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px' }}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'results' && (
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Test</th>
                    <th>Result</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map(r => (
                    <tr key={r.id}>
                      <td>{r.patient}</td>
                      <td>{r.test}</td>
                      <td style={{ color: r.result.includes('High') ? '#ff6b6b' : '#51cf66' }}>{r.result}</td>
                      <td>{r.date}</td>
                      <td><button className="btn" onClick={() => setSelectedResult(r)} style={{ padding: '4px 10px', fontSize: '12px' }}>Review</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {activeTab === 'prescriptions' && (
               <div>
                  <p style={{opacity: 0.7}}>No recent prescriptions to display.</p>
               </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {selectedResult && (
        <div style={styles.modalOverlay}>
          <div className="glass-card" style={styles.modal}>
            <h2 style={{ color: 'var(--color-gold)', marginTop: 0 }}>Review Test Result</h2>
            <div style={{ margin: '20px 0' }}>
              <p><strong>Patient:</strong> {selectedResult.patient}</p>
              <p><strong>Test:</strong> {selectedResult.test}</p>
              <p><strong>Result:</strong> <span style={{ color: selectedResult.result.includes('High') ? '#ff6b6b' : '#51cf66' }}>{selectedResult.result}</span></p>
              <p><strong>Date:</strong> {selectedResult.date}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setSelectedResult(null)}>Close</button>
              <button className="btn" onClick={() => setSelectedResult(null)}>Acknowledge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-navy)' },
  sidebar: { width: '250px', background: 'rgba(0,0,0,0.2)', padding: '30px 20px', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--glass-border)' },
  profile: { textAlign: 'center', marginBottom: '40px' },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-gold)', color: 'var(--color-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', margin: '0 auto' },
  badge: { background: 'rgba(212,175,55,0.2)', color: 'var(--color-gold)', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 },
  navLink: { color: 'var(--text-light)', textDecoration: 'none', padding: '10px 15px', borderRadius: '8px', transition: 'background 0.3s', fontWeight: 500, ':hover': { background: 'var(--glass-bg)' } },
  main: { flex: 1, padding: '40px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  bell: { background: 'var(--glass-bg)', padding: '10px', borderRadius: '50%', cursor: 'pointer', border: '1px solid var(--glass-border)' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
  statCard: { textAlign: 'center' },
  tabs: { display: 'flex', gap: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' },
  tab: { background: 'none', border: 'none', color: 'var(--text-light)', opacity: 0.6, fontSize: '16px', fontWeight: 600, cursor: 'pointer', padding: '10px 5px' },
  activeTab: { background: 'none', border: 'none', color: 'var(--color-gold)', borderBottom: '2px solid var(--color-gold)', fontSize: '16px', fontWeight: 600, cursor: 'pointer', padding: '10px 5px' },
  statusBadge: { background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10, 30, 70, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { width: '400px', maxWidth: '90%' }
};

export default DoctorDashboard;
