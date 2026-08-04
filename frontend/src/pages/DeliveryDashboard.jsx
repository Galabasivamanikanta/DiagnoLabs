import React, { useState, useEffect } from 'react';

const DeliveryDashboard = () => {
  const [activeTab, setActiveTab] = useState('Today\'s Deliveries');
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data fallback
  const mockDeliveries = [
    { id: 'ORD-101', from: 'Central Lab', to: 'John Doe', testType: 'Blood Test', distance: '5 km', priority: 'High', status: 'Pending' },
    { id: 'ORD-102', from: 'North Clinic', to: 'Jane Smith', testType: 'Urine Culture', distance: '12 km', priority: 'Medium', status: 'In Transit' },
    { id: 'ORD-103', from: 'South Lab', to: 'Bob Wilson', testType: 'Thyroid Profile', distance: '3 km', priority: 'Low', status: 'Delivered' },
  ];

  const mockPickups = [
    { id: 'PU-201', address: '123 Main St, Apt 4B', timeSlot: '10:00 AM - 11:00 AM', samplesCount: 2 },
    { id: 'PU-202', address: '456 Oak Rd', timeSlot: '12:00 PM - 01:00 PM', samplesCount: 1 },
  ];

  const mockHistory = [
    { date: '2026-08-03', id: 'ORD-099', from: 'East Lab', to: 'Alice Brown', status: 'Delivered', timeTaken: '45 mins' },
    { date: '2026-08-03', id: 'ORD-098', from: 'Central Lab', to: 'Tom Clark', status: 'Delivered', timeTaken: '30 mins' },
  ];

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await fetch('/api/employee/delivery/assignments');
        if (response.ok) {
          const data = await response.json();
          setDeliveries(data);
        } else {
          setDeliveries(mockDeliveries);
        }
      } catch (error) {
        setDeliveries(mockDeliveries);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeliveries();
  }, []);

  const handleStatusUpdate = (id, newStatus) => {
    setDeliveries(deliveries.map(d => d.id === id ? { ...d, status: newStatus } : d));
    // In a real app, this would be a PATCH to /api/employee/delivery/status
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#ff4d4d'; // Red
      case 'In Transit': return '#ffa64d'; // Orange
      case 'Delivered': return '#4dff4d'; // Green
      default: return '#fff';
    }
  };

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#0a1128', // Dark Navy
      color: '#ffffff',
      fontFamily: "'Inter', sans-serif",
    },
    sidebar: {
      width: '250px',
      background: 'rgba(10, 17, 40, 0.7)',
      backdropFilter: 'blur(10px)',
      borderRight: '1px solid rgba(212, 175, 55, 0.2)', // Gold border
      padding: '2rem 0',
      display: 'flex',
      flexDirection: 'column',
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#d4af37', // Gold
      textAlign: 'center',
      marginBottom: '2rem',
      padding: '0 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    },
    navItem: {
      padding: '1rem 2rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      borderLeft: '4px solid transparent',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    navItemActive: {
      background: 'rgba(212, 175, 55, 0.1)',
      borderLeft: '4px solid #d4af37',
      color: '#d4af37',
    },
    mainContent: {
      flex: 1,
      padding: '2rem',
      overflowY: 'auto',
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    statCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(212, 175, 55, 0.2)',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#d4af37',
      marginBottom: '0.5rem',
    },
    statLabel: {
      fontSize: '0.9rem',
      color: '#a0aabf',
    },
    tabContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      paddingBottom: '0.5rem',
    },
    tab: {
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      color: '#a0aabf',
      fontWeight: '500',
      borderBottom: '2px solid transparent',
      transition: 'all 0.3s',
    },
    tabActive: {
      color: '#d4af37',
      borderBottom: '2px solid #d4af37',
    },
    glassPanel: {
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(212, 175, 55, 0.1)',
      borderRadius: '12px',
      padding: '1.5rem',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      textAlign: 'left',
      padding: '1rem',
      borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
      color: '#d4af37',
      fontWeight: '600',
    },
    td: {
      padding: '1rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    },
    badge: {
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.8rem',
      fontWeight: 'bold',
      color: '#000'
    },
    button: {
      background: 'transparent',
      border: '1px solid #d4af37',
      color: '#d4af37',
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      marginRight: '0.5rem',
    },
    select: {
      padding: '0.5rem',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '6px',
      color: '#fff',
      marginRight: '0.5rem'
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          📦 DiagnoLabs<br/>Delivery
        </div>
        {['Dashboard', 'My Deliveries', 'Pickup Queue', 'Route Map', 'History'].map(item => (
          <div key={item} style={{...styles.navItem, ...(item === 'My Deliveries' ? styles.navItemActive : {})}}>
            {item}
          </div>
        ))}
        <div style={{...styles.navItem, marginTop: 'auto', color: '#ff4d4d'}} onClick={() => window.location.href = '/adminlogin'}>
          Logout
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>🚗 {deliveries.length}</div>
            <div style={styles.statLabel}>Today's Deliveries</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>✅ {deliveries.filter(d => d.status === 'Delivered').length}</div>
            <div style={styles.statLabel}>Completed</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>⏳ {mockPickups.length}</div>
            <div style={styles.statLabel}>Pending Pickups</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>📍 42</div>
            <div style={styles.statLabel}>KM Covered</div>
          </div>
        </div>

        <div style={styles.tabContainer}>
          {['Today\'s Deliveries', 'Pickup Queue', 'Delivery History', 'My Stats'].map(tab => (
            <div key={tab} style={{...styles.tab, ...(activeTab === tab ? styles.tabActive : {})}} onClick={() => setActiveTab(tab)}>
              {tab}
            </div>
          ))}
        </div>

        <div style={styles.glassPanel}>
          {activeTab === 'Today\'s Deliveries' && (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Order #</th>
                  <th style={styles.th}>From (Lab)</th>
                  <th style={styles.th}>To (Patient)</th>
                  <th style={styles.th}>Test Type</th>
                  <th style={styles.th}>Distance</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map(d => (
                  <tr key={d.id}>
                    <td style={styles.td}>{d.id}</td>
                    <td style={styles.td}>{d.from}</td>
                    <td style={styles.td}>{d.to}</td>
                    <td style={styles.td}>{d.testType}</td>
                    <td style={styles.td}>{d.distance}</td>
                    <td style={styles.td}>
                      <span style={{...styles.badge, backgroundColor: getStatusColor(d.status)}}>
                        {d.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {d.status !== 'Delivered' && (
                        <div style={{display: 'flex', alignItems: 'center'}}>
                          <select 
                            style={styles.select}
                            onChange={(e) => handleStatusUpdate(d.id, e.target.value)}
                            value={d.status}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                          <button 
                            style={{...styles.button, background: '#d4af37', color: '#0a1128', padding: '0.5rem'}}
                            onClick={() => {}}
                          >
                            Confirm
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {activeTab === 'Pickup Queue' && (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Pickup #</th>
                  <th style={styles.th}>Address</th>
                  <th style={styles.th}>Time Slot</th>
                  <th style={styles.th}>Samples</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockPickups.map(p => (
                  <tr key={p.id}>
                    <td style={styles.td}>{p.id}</td>
                    <td style={styles.td}>{p.address}</td>
                    <td style={styles.td}>{p.timeSlot}</td>
                    <td style={styles.td}>{p.samplesCount}</td>
                    <td style={styles.td}>
                      <button style={{...styles.button, background: '#4dff4d', color: '#000', borderColor: '#4dff4d'}}>Accept</button>
                      <button style={{...styles.button, borderColor: '#ff4d4d', color: '#ff4d4d'}}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'Delivery History' && (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Order #</th>
                  <th style={styles.th}>Route</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Time Taken</th>
                </tr>
              </thead>
              <tbody>
                {mockHistory.map((h, i) => (
                  <tr key={i}>
                    <td style={styles.td}>{h.date}</td>
                    <td style={styles.td}>{h.id}</td>
                    <td style={styles.td}>{h.from} → {h.to}</td>
                    <td style={styles.td}>
                      <span style={{...styles.badge, backgroundColor: getStatusColor(h.status)}}>
                        {h.status}
                      </span>
                    </td>
                    <td style={styles.td}>{h.timeTaken}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'My Stats' && (
            <div style={{display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '2rem'}}>
              <div style={styles.statCard}>
                <div style={{...styles.statValue, color: '#4dff4d'}}>45</div>
                <div style={styles.statLabel}>This Week Deliveries</div>
              </div>
              <div style={styles.statCard}>
                <div style={{...styles.statValue, color: '#4dff4d'}}>98%</div>
                <div style={styles.statLabel}>On-Time %</div>
              </div>
              <div style={styles.statCard}>
                <div style={{...styles.statValue, color: '#ffa64d'}}>4.9 ⭐</div>
                <div style={styles.statLabel}>Rating</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>₹ 4,500</div>
                <div style={styles.statLabel}>Earnings</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
