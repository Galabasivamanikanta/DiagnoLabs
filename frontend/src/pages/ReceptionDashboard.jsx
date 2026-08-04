import React, { useState, useEffect } from 'react';

const ReceptionDashboard = () => {
  const [activeTab, setActiveTab] = useState('Appointments');
  const [appointments, setAppointments] = useState([]);
  
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
    // Simulate booking
    alert('Booking submitted');
  };

  const sidebarItems = ['Dashboard', 'Appointments', 'Check-In', 'Billing', 'Walk-Ins', 'Reports'];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a192f', color: '#e6f1ff', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: '250px', background: 'rgba(2, 12, 27, 0.7)', backdropFilter: 'blur(10px)', borderRight: '1px solid rgba(212, 175, 55, 0.2)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ color: '#d4af37', marginBottom: '40px', fontWeight: 'bold' }}>DiagnoLabs</h2>
        <div style={{ flex: 1 }}>
          {sidebarItems.map(item => (
            <div 
              key={item} 
              style={{ padding: '15px 10px', margin: '5px 0', cursor: 'pointer', borderRadius: '8px', background: activeTab === item || (item === 'Dashboard' && activeTab === 'Appointments') ? 'rgba(212, 175, 55, 0.15)' : 'transparent', color: activeTab === item || (item === 'Dashboard' && activeTab === 'Appointments') ? '#d4af37' : '#8892b0', transition: 'all 0.3s' }}
              onClick={() => setActiveTab(item === 'Dashboard' ? 'Appointments' : item)}
            >
              {item}
            </div>
          ))}
        </div>
        <div onClick={handleLogout} style={{ padding: '15px 10px', cursor: 'pointer', color: '#ff6b6b', borderRadius: '8px', transition: 'all 0.3s' }}>
          Logout
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: '#ccd6f6', margin: 0 }}>Front Desk / Reception</h1>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button onClick={() => setActiveTab('New Booking')} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #d4af37, #f3e5ab)', color: '#020c1b', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>+ New Booking</button>
            <button onClick={() => setActiveTab('Walk-In Registration')} style={{ padding: '10px 20px', background: 'rgba(212, 175, 55, 0.1)', color: '#d4af37', border: '1px solid #d4af37', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Walk-In</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
          {[
            { label: "Today's Appointments", value: '42' },
            { label: 'Check-Ins Done', value: '28' },
            { label: 'Pending Bills', value: '14' },
            { label: 'Walk-Ins', value: '7' }
          ].map((stat, i) => (
            <div key={i} style={{ background: 'rgba(17, 34, 64, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(212, 175, 55, 0.1)', borderRadius: '15px', padding: '25px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#8892b0', fontSize: '14px', marginBottom: '10px' }}>{stat.label}</span>
              <span style={{ color: '#d4af37', fontSize: '32px', fontWeight: 'bold' }}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Tabs Content */}
        <div style={{ background: 'rgba(17, 34, 64, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(212, 175, 55, 0.1)', borderRadius: '15px', padding: '30px' }}>
          
          {activeTab === 'Appointments' && (
            <div>
              <h3 style={{ color: '#ccd6f6', marginBottom: '20px' }}>Appointments</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', color: '#8892b0', textAlign: 'left' }}>
                    <th style={{ padding: '15px' }}>Time</th>
                    <th style={{ padding: '15px' }}>Patient Name</th>
                    <th style={{ padding: '15px' }}>Test</th>
                    <th style={{ padding: '15px' }}>Doctor</th>
                    <th style={{ padding: '15px' }}>Status</th>
                    <th style={{ padding: '15px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(apt => (
                    <tr key={apt.id} style={{ borderBottom: '1px solid rgba(230, 241, 255, 0.05)' }}>
                      <td style={{ padding: '15px', color: '#a8b2d1' }}>{apt.time}</td>
                      <td style={{ padding: '15px', color: '#e6f1ff' }}>{apt.patientName}</td>
                      <td style={{ padding: '15px', color: '#a8b2d1' }}>{apt.test}</td>
                      <td style={{ padding: '15px', color: '#a8b2d1' }}>{apt.doctor}</td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '12px', background: apt.status === 'Confirmed' ? 'rgba(46, 204, 113, 0.1)' : apt.status === 'Pending' ? 'rgba(241, 196, 15, 0.1)' : 'rgba(231, 76, 60, 0.1)', color: apt.status === 'Confirmed' ? '#2ecc71' : apt.status === 'Pending' ? '#f1c40f' : '#e74c3c' }}>
                          {apt.status}
                        </span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        {apt.status !== 'Cancelled' && (
                          <button style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #d4af37', color: '#d4af37', borderRadius: '5px', cursor: 'pointer' }}>Check-In</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'New Booking' && (
            <div>
              <h3 style={{ color: '#ccd6f6', marginBottom: '20px' }}>New Booking</h3>
              <form onSubmit={handleBooking} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                <button type="submit" style={{ gridColumn: 'span 2', padding: '15px', background: '#d4af37', color: '#020c1b', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>Book Appointment</button>
              </form>
            </div>
          )}

          {activeTab === 'Billing' && (
            <div>
              <h3 style={{ color: '#ccd6f6', marginBottom: '20px' }}>Billing</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', color: '#8892b0', textAlign: 'left' }}>
                    <th style={{ padding: '15px' }}>Patient</th>
                    <th style={{ padding: '15px' }}>Test</th>
                    <th style={{ padding: '15px' }}>Amount</th>
                    <th style={{ padding: '15px' }}>Status</th>
                    <th style={{ padding: '15px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBills.map(bill => (
                    <tr key={bill.id} style={{ borderBottom: '1px solid rgba(230, 241, 255, 0.05)' }}>
                      <td style={{ padding: '15px', color: '#e6f1ff' }}>{bill.patient}</td>
                      <td style={{ padding: '15px', color: '#a8b2d1' }}>{bill.test}</td>
                      <td style={{ padding: '15px', color: '#e6f1ff' }}>{bill.amount}</td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '12px', background: bill.status === 'Paid' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)', color: bill.status === 'Paid' ? '#2ecc71' : '#e74c3c' }}>
                          {bill.status}
                        </span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <button style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #8892b0', color: '#8892b0', borderRadius: '5px', cursor: 'pointer' }}>Print Receipt</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Walk-In Registration' && (
            <div>
              <h3 style={{ color: '#ccd6f6', marginBottom: '20px' }}>Walk-In Registration</h3>
              <form onSubmit={handleBooking} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', maxWidth: '500px' }}>
                <input type="text" placeholder="Patient Name" required style={inputStyle} />
                <input type="tel" placeholder="Phone Number" required style={inputStyle} />
                <select style={inputStyle} defaultValue="">
                  <option value="" disabled>Select Test Type</option>
                  <option value="cbc">Complete Blood Count</option>
                  <option value="lipid">Lipid Profile</option>
                  <option value="thyroid">Thyroid Function</option>
                  <option value="glucose">Fasting Glucose</option>
                </select>
                <button type="submit" style={{ padding: '15px', background: 'linear-gradient(135deg, #d4af37, #f3e5ab)', color: '#020c1b', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>Register Walk-In</button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  padding: '15px',
  background: 'rgba(10, 25, 47, 0.5)',
  border: '1px solid rgba(136, 146, 176, 0.2)',
  borderRadius: '8px',
  color: '#e6f1ff',
  outline: 'none',
  fontSize: '15px'
};

export default ReceptionDashboard;
