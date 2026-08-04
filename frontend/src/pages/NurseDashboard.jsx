import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Assuming API_BASE_URL is exported from '../config'
// import { API_BASE_URL } from '../config';

const API_BASE_URL = 'http://localhost:5000'; // fallback

const NurseDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('queue');
  const [queue, setQueue] = useState([]);
  const [vitalsForm, setVitalsForm] = useState({ patient: '', bp: '', pulse: '', temp: '', o2: '' });

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/employee/nurse/queue`)
      .then(res => setQueue(res.data))
      .catch(() => {
        setQueue([
          { id: 1, patient: 'John Doe', test: 'Blood Draw', priority: 'High', room: 'A-102' },
          { id: 2, patient: 'Emma Watson', test: 'Urine Sample', priority: 'Normal', room: 'B-205' },
          { id: 3, patient: 'Michael Scott', test: 'ECG', priority: 'Normal', room: 'A-105' }
        ]);
      });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/adminlogin');
  };

  const handleVitalsSubmit = (e) => {
    e.preventDefault();
    alert(`Vitals recorded for ${vitalsForm.patient}`);
    setVitalsForm({ patient: '', bp: '', pulse: '', temp: '', o2: '' });
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
          
          :root {
            --color-navy: #0a1e46;
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
          .glass-card:hover { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); }
          
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
          
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid var(--glass-border); }
          th { color: var(--color-gold); font-weight: 600; }
          tr:hover { background: rgba(255, 255, 255, 0.02); }
          
          .input-field {
            width: 100%;
            padding: 10px 15px;
            background: rgba(255,255,255,0.05);
            border: 1px solid var(--glass-border);
            border-radius: 6px;
            color: white;
            margin-bottom: 15px;
            font-family: 'Inter';
          }
          .input-field:focus { outline: none; border-color: var(--color-gold); }
        `}
      </style>

      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.profile}>
          <div style={styles.avatar}>Nu</div>
          <h3 style={{ margin: '10px 0 5px' }}>Nurse Clara</h3>
          <span style={styles.badge}>Senior Nurse</span>
        </div>
        <nav style={styles.nav}>
          {['Dashboard', 'Sample Queue', 'Vitals', 'Patients', 'Schedule'].map(item => (
            <a key={item} href="#" style={styles.navLink}>{item}</a>
          ))}
          <a href="#" onClick={handleLogout} style={{...styles.navLink, color: '#ff6b6b', marginTop: 'auto'}}>Logout</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>Nurse Dashboard</h1>
            <p style={{ margin: '5px 0 0', opacity: 0.8 }}>Shift: Morning (08:00 AM - 04:00 PM)</p>
          </div>
        </header>

        {/* Stats Row */}
        <div style={styles.statsRow}>
          {[
            { label: "Queue Size", value: queue.length },
            { label: 'Samples Collected', value: '14' },
            { label: 'Vitals Recorded', value: '22' },
            { label: 'Patients Attended', value: '28' }
          ].map((stat, i) => (
            <div key={i} className="glass-card" style={styles.statCard}>
              <h4 style={{ margin: '0 0 10px', color: 'var(--color-gold)', fontWeight: 400 }}>{stat.label}</h4>
              <h2 style={{ margin: 0, fontSize: '32px' }}>{stat.value}</h2>
            </div>
          ))}
        </div>

        {/* Main Section */}
        <div className="glass-card" style={{ marginTop: '30px' }}>
          <div style={styles.tabs}>
            <button 
              style={activeTab === 'queue' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('queue')}
            >Sample Collection Queue</button>
            <button 
              style={activeTab === 'vitals' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('vitals')}
            >Vitals Recording</button>
            <button 
              style={activeTab === 'schedule' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('schedule')}
            >My Schedule</button>
          </div>

          <div style={{ paddingTop: '20px' }}>
            {activeTab === 'queue' && (
              <table>
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Test</th>
                    <th>Priority</th>
                    <th>Room</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map(q => (
                    <tr key={q.id}>
                      <td>{q.patient}</td>
                      <td>{q.test}</td>
                      <td style={{ color: q.priority === 'High' ? '#ff6b6b' : 'inherit' }}>{q.priority}</td>
                      <td>{q.room}</td>
                      <td><button className="btn" style={{ padding: '4px 10px', fontSize: '12px' }}>Collect</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'vitals' && (
              <form onSubmit={handleVitalsSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
                <h3 style={{ color: 'var(--color-gold)', marginTop: 0 }}>Record Patient Vitals</h3>
                <input type="text" placeholder="Patient Search (ID or Name)" className="input-field" value={vitalsForm.patient} onChange={e => setVitalsForm({...vitalsForm, patient: e.target.value})} required />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <input type="text" placeholder="Blood Pressure (e.g. 120/80)" className="input-field" value={vitalsForm.bp} onChange={e => setVitalsForm({...vitalsForm, bp: e.target.value})} required />
                  <input type="text" placeholder="Pulse (bpm)" className="input-field" value={vitalsForm.pulse} onChange={e => setVitalsForm({...vitalsForm, pulse: e.target.value})} required />
                  <input type="text" placeholder="Temperature (°F)" className="input-field" value={vitalsForm.temp} onChange={e => setVitalsForm({...vitalsForm, temp: e.target.value})} required />
                  <input type="text" placeholder="SpO2 (%)" className="input-field" value={vitalsForm.o2} onChange={e => setVitalsForm({...vitalsForm, o2: e.target.value})} required />
                </div>
                <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }}>Save Vitals</button>
              </form>
            )}

            {activeTab === 'schedule' && (
              <div>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={styles.scheduleItem}><strong>08:00 AM</strong> - Shift Starts, Handover</li>
                  <li style={styles.scheduleItem}><strong>09:00 AM</strong> - Ward A Rounds</li>
                  <li style={styles.scheduleItem}><strong>11:00 AM</strong> - Sample Collections</li>
                  <li style={styles.scheduleItem}><strong>01:00 PM</strong> - Lunch Break</li>
                  <li style={styles.scheduleItem}><strong>02:00 PM</strong> - Ward B Rounds</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
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
  navLink: { color: 'var(--text-light)', textDecoration: 'none', padding: '10px 15px', borderRadius: '8px', transition: 'background 0.3s', fontWeight: 500 },
  main: { flex: 1, padding: '40px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
  statCard: { textAlign: 'center' },
  tabs: { display: 'flex', gap: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' },
  tab: { background: 'none', border: 'none', color: 'var(--text-light)', opacity: 0.6, fontSize: '16px', fontWeight: 600, cursor: 'pointer', padding: '10px 5px' },
  activeTab: { background: 'none', border: 'none', color: 'var(--color-gold)', borderBottom: '2px solid var(--color-gold)', fontSize: '16px', fontWeight: 600, cursor: 'pointer', padding: '10px 5px' },
  scheduleItem: { padding: '15px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }
};

export default NurseDashboard;
