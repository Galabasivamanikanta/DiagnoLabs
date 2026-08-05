import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, Calendar, Users, DollarSign, FileText, ClipboardList } from 'lucide-react';
import '../styles/DashboardShared.css';

const ReceptionDashboard = () => {
  const [activeTab, setActiveTab] = useState('Appointments');
  const [appointments, setAppointments] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const mockAppointments = [
    { id: 1, time: '09:00 AM', patientName: 'John Doe', test: 'Complete Blood Count', doctor: 'Dr. Smith', status: 'Confirmed' },
    { id: 2, time: '10:30 AM', patientName: 'Jane Smith', test: 'Lipid Profile', doctor: 'Dr. Adams', status: 'Pending' },
    { id: 3, time: '11:15 AM', patientName: 'Robert Johnson', test: 'Thyroid Function', doctor: 'Dr. Lee', status: 'Cancelled' },
    { id: 4, time: '01:00 PM', patientName: 'Emily Davis', test: 'HbA1c', doctor: 'Dr. Smith', status: 'Confirmed' },
  ];

  const mockBills = [
    { id: 101, patient: 'John Doe', test: 'Complete Blood Count', amount: '$50', status: 'Paid' },
    { id: 102, patient: 'Jane Smith', test: 'Lipid Profile', amount: '$80', status: 'Unpaid' },
  ];

  useEffect(() => {
    // Fetch from API
    fetch('/api/employee/reception/appointments')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setAppointments(data);
        else setAppointments(mockAppointments);
      })
      .catch(() => setAppointments(mockAppointments));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/adminlogin';
  };

  const handleBooking = (e) => {
    e.preventDefault();
    alert('Booking submitted');
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: <Calendar size={18} /> },
    { name: 'Appointments', icon: <Calendar size={18} /> },
    { name: 'Check-In', icon: <Users size={18} /> },
    { name: 'Billing', icon: <DollarSign size={18} /> },
    { name: 'Walk-Ins', icon: <ClipboardList size={18} /> },
    { name: 'Reports', icon: <FileText size={18} /> }
  ];

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
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#003366', margin: 0 }}>DiagnoLabs</h2>
            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Front Desk Reception</span>
          </div>
          <button className="dashboard-header-mobile-toggle" style={{ border: 'none', padding: 0, margin: 0 }} onClick={() => setSidebarOpen(false)}>
             <X size={24} color="#64748b" />
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {sidebarItems.map(item => {
            const isActive = activeTab === item.name || (item.name === 'Dashboard' && activeTab === 'Appointments');
            return (
              <div 
                key={item.name} 
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', cursor: 'pointer', borderRadius: '10px', background: isActive ? '#f0f7ff' : 'transparent', color: isActive ? '#003366' : '#475569', fontWeight: '800', transition: 'all 0.3s' }}
                onClick={() => setActiveTab(item.name === 'Dashboard' ? 'Appointments' : item.name)}
              >
                {item.icon}
                {item.name}
              </div>
            );
          })}
        </div>
        <div style={{ padding: '16px', marginBottom: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#003366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem', flexShrink: 0 }}>
                {(user?.name || 'Employee').charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Employee'}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'employee@diagnolabs.com'}</div>
              </div>
            </div>
            <div style={{ background: '#f0f7ff', color: '#003366', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', alignSelf: 'flex-start', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Staff Member
            </div>
            <button onClick={() => window.location.href = '/admin/profile'} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              View Full Profile 
            </button>
          </div>
        <div onClick={handleLogout} style={{ padding: '12px 16px', cursor: 'pointer', color: '#dc2626', background: '#fff5f5', borderRadius: '10px', border: '1px solid #fee2e2', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s' }}>
          <LogOut size={16} /> Logout
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="dashboard-header-mobile-toggle" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} color="#0f172a" />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>Front Desk / Reception</h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Manage patient walk-ins, appointments, and billing.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setActiveTab('New Booking')} style={{ padding: '10px 18px', background: '#003366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}>+ New Booking</button>
            <button onClick={() => setActiveTab('Walk-In Registration')} style={{ padding: '10px 18px', background: '#f8fafc', color: '#003366', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}>Walk-In</button>
          </div>
        </div>

        {/* Stats */}
        <div className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {[
            { label: "Today's Appointments", value: '42' },
            { label: 'Check-Ins Done', value: '28' },
            { label: 'Pending Bills', value: '14' },
            { label: 'Walk-Ins', value: '7' }
          ].map((stat, i) => (
            <div key={i} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
              <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>{stat.label}</span>
              <span style={{ color: '#003366', fontSize: '2rem', fontWeight: '800' }}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Tabs Content */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          
          {activeTab === 'Appointments' && (
            <div>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Appointments</h3>
              <div className="dashboard-table-container">
              <table className="dashboard-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Time</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Patient Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Test</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Doctor</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(apt => (
                    <tr key={apt.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '700', color: '#003366' }}>{apt.time}</td>
                      <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{apt.patientName}</td>
                      <td style={{ padding: '12px', color: '#334155' }}>{apt.test}</td>
                      <td style={{ padding: '12px', color: '#334155' }}>{apt.doctor}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', background: apt.status === 'Confirmed' ? '#dcfce7' : apt.status === 'Pending' ? '#fef3c7' : '#fee2e2', color: apt.status === 'Confirmed' ? '#15803d' : apt.status === 'Pending' ? '#b45309' : '#dc2626' }}>
                          {apt.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {apt.status !== 'Cancelled' && (
                          <button style={{ padding: '6px 14px', background: 'transparent', border: '1px solid #003366', color: '#003366', borderRadius: '8px', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>Check-In</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}

          {activeTab === 'New Booking' && (
            <div>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>New Booking</h3>
              <form onSubmit={handleBooking} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <input type="text" placeholder="Patient Name" required style={inputStyle} />
                <input type="tel" placeholder="Phone Number" required style={inputStyle} />
                <select style={inputStyle} defaultValue="">
                  <option value="" disabled>Select Test Type</option>
                  <option value="cbc">Complete Blood Count</option>
                  <option value="lipid">Lipid Profile</option>
                  <option value="thyroid">Thyroid Function</option>
                </select>
                <input type="text" placeholder="Doctor (Optional)" style={inputStyle} />
                <input type="datetime-local" required style={inputStyle} />
                <button type="submit" style={{ gridColumn: '1 / -1', padding: '14px', background: '#003366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', marginTop: '10px' }}>Book Appointment</button>
              </form>
            </div>
          )}

          {activeTab === 'Billing' && (
            <div>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Billing</h3>
              <div className="dashboard-table-container">
              <table className="dashboard-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Patient</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Test</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Amount</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBills.map(bill => (
                    <tr key={bill.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{bill.patient}</td>
                      <td style={{ padding: '12px', color: '#334155' }}>{bill.test}</td>
                      <td style={{ padding: '12px', fontWeight: '800', color: '#003366' }}>{bill.amount}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', background: bill.status === 'Paid' ? '#dcfce7' : '#fee2e2', color: bill.status === 'Paid' ? '#15803d' : '#dc2626' }}>
                          {bill.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button style={{ padding: '6px 14px', background: 'transparent', border: '1px solid #003366', color: '#003366', borderRadius: '8px', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>Print Receipt</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}

          {activeTab === 'Walk-In Registration' && (
            <div>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Walk-In Registration</h3>
              <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
                <input type="text" placeholder="Patient Name" required style={inputStyle} />
                <input type="tel" placeholder="Phone Number" required style={inputStyle} />
                <select style={inputStyle} defaultValue="">
                  <option value="" disabled>Select Test Type</option>
                  <option value="cbc">Complete Blood Count</option>
                  <option value="lipid">Lipid Profile</option>
                  <option value="thyroid">Thyroid Function</option>
                  <option value="glucose">Fasting Glucose</option>
                </select>
                <button type="submit" style={{ padding: '14px', background: '#003366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', marginTop: '10px' }}>Register Walk-In</button>
              </form>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

const inputStyle = {
  padding: '14px',
  background: '#f8fafc',
  border: '1px solid #cbd5e1',
  borderRadius: '10px',
  color: '#0f172a',
  outline: 'none',
  fontSize: '0.9rem',
  fontWeight: '500'
};

export default ReceptionDashboard;
