import React, { useState, useEffect } from 'react';

const SupportDashboard = () => {
  const [activeTab, setActiveTab] = useState('Ticket Queue');
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data fallback
  const mockTickets = [
    { id: 'TKT-001', patient: 'John Doe', type: 'Booking', priority: 'High', created: '2026-08-04T10:00:00Z', status: 'Open', assignedTo: null },
    { id: 'TKT-002', patient: 'Jane Smith', type: 'Report', priority: 'Medium', created: '2026-08-04T11:30:00Z', status: 'In Progress', assignedTo: 'me' },
    { id: 'TKT-003', patient: 'Bob Wilson', type: 'Payment', priority: 'Low', created: '2026-08-04T09:15:00Z', status: 'Resolved', assignedTo: 'me' },
    { id: 'TKT-004', patient: 'Alice Brown', type: 'Other', priority: 'High', created: '2026-08-04T13:45:00Z', status: 'Open', assignedTo: null },
  ];

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/employee/support/tickets');
        if (response.ok) {
          const data = await response.json();
          setTickets(data);
        } else {
          setTickets(mockTickets);
        }
      } catch (error) {
        setTickets(mockTickets);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const handleAssign = (id) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, assignedTo: 'me', status: 'In Progress' } : t));
  };

  const handleResolve = (id) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: 'Resolved' } : t));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#ff4d4d'; // Red
      case 'Medium': return '#ffa64d'; // Orange
      case 'Low': return '#4dff4d'; // Green
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
    buttonHover: {
      background: '#d4af37',
      color: '#0a1128',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '6px',
      color: '#fff',
      marginBottom: '1rem',
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '6px',
      color: '#fff',
      marginBottom: '1rem',
    },
    donutChart: {
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      background: 'conic-gradient(#ff4d4d 0% 30%, #ffa64d 30% 70%, #4dff4d 70% 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto',
    },
    donutHole: {
      width: '100px',
      height: '100px',
      backgroundColor: '#0a1128',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  };

  const renderTable = (data) => (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Ticket #</th>
          <th style={styles.th}>Patient Name</th>
          <th style={styles.th}>Issue Type</th>
          <th style={styles.th}>Priority</th>
          <th style={styles.th}>Status</th>
          <th style={styles.th}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map(ticket => (
          <tr key={ticket.id}>
            <td style={styles.td}>{ticket.id}</td>
            <td style={styles.td}>{ticket.patient}</td>
            <td style={styles.td}>{ticket.type}</td>
            <td style={styles.td}>
              <span style={{...styles.badge, backgroundColor: getPriorityColor(ticket.priority), color: '#000'}}>
                {ticket.priority}
              </span>
            </td>
            <td style={styles.td}>{ticket.status}</td>
            <td style={styles.td}>
              {ticket.status === 'Open' && (
                <button style={styles.button} onClick={() => handleAssign(ticket.id)}>Assign to me</button>
              )}
              {ticket.status === 'In Progress' && ticket.assignedTo === 'me' && (
                <button style={{...styles.button, background: '#d4af37', color: '#0a1128'}} onClick={() => handleResolve(ticket.id)}>Resolve</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>DiagnoLabs Support</div>
        {['Dashboard', 'Tickets', 'Live Chat', 'Knowledge Base', 'Reports'].map(item => (
          <div key={item} style={{...styles.navItem, ...(item === 'Tickets' ? styles.navItemActive : {})}}>
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
            <div style={styles.statValue}>{tickets.filter(t => t.status === 'Open').length}</div>
            <div style={styles.statLabel}>Open Tickets</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{tickets.filter(t => t.status === 'Resolved').length}</div>
            <div style={styles.statLabel}>Resolved Today</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>15m</div>
            <div style={styles.statLabel}>Avg Response Time</div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statValue, color: '#ff4d4d'}}>2</div>
            <div style={styles.statLabel}>SLA Breached</div>
          </div>
        </div>

        <div style={styles.tabContainer}>
          {['Ticket Queue', 'My Tickets', 'Create Ticket', 'Reports'].map(tab => (
            <div key={tab} style={{...styles.tab, ...(activeTab === tab ? styles.tabActive : {})}} onClick={() => setActiveTab(tab)}>
              {tab}
            </div>
          ))}
        </div>

        <div style={styles.glassPanel}>
          {activeTab === 'Ticket Queue' && renderTable(tickets)}
          
          {activeTab === 'My Tickets' && renderTable(tickets.filter(t => t.assignedTo === 'me'))}
          
          {activeTab === 'Create Ticket' && (
            <div style={{maxWidth: '600px', margin: '0 auto'}}>
              <h3 style={{color: '#d4af37', marginBottom: '1.5rem'}}>Create New Ticket</h3>
              <input type="text" placeholder="Search Patient..." style={styles.input} />
              <select style={styles.select}>
                <option value="">Select Issue Type</option>
                <option value="Booking">Booking</option>
                <option value="Report">Report</option>
                <option value="Payment">Payment</option>
                <option value="Other">Other</option>
              </select>
              <select style={styles.select}>
                <option value="">Select Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <textarea placeholder="Description" style={{...styles.input, minHeight: '120px'}}></textarea>
              <button style={{...styles.button, background: '#d4af37', color: '#0a1128', width: '100%'}}>Submit Ticket</button>
            </div>
          )}

          {activeTab === 'Reports' && (
            <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap'}}>
              <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                <h3 style={{color: '#d4af37', marginBottom: '1rem'}}>SLA Compliance</h3>
                <div style={{fontSize: '3rem', fontWeight: 'bold', color: '#4dff4d'}}>94%</div>
              </div>
              <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                <h3 style={{color: '#d4af37', marginBottom: '1rem'}}>Tickets by Priority</h3>
                <div style={styles.donutChart}>
                  <div style={styles.donutHole}>Total</div>
                </div>
                <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem'}}>
                  <span style={{color: '#ff4d4d'}}>High 30%</span>
                  <span style={{color: '#ffa64d'}}>Med 40%</span>
                  <span style={{color: '#4dff4d'}}>Low 30%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;
