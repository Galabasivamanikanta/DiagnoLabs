import React, { useState, useEffect } from 'react';

const InventoryDashboard = () => {
  const [activeTab, setActiveTab] = useState('Stock Overview');
  const [stock, setStock] = useState([]);
  
  const mockStock = [
    { id: 1, name: 'Latex Gloves (Medium)', category: 'PPE', quantity: 450, minLevel: 200, status: 'OK' },
    { id: 2, name: 'Syringes 5ml', category: 'Consumables', quantity: 150, minLevel: 200, status: 'Low' },
    { id: 3, name: 'Blood Collection Tubes (Red)', category: 'Tubes', quantity: 20, minLevel: 100, status: 'Critical' },
    { id: 4, name: 'Isopropyl Alcohol Pads', category: 'Consumables', quantity: 800, minLevel: 300, status: 'OK' },
    { id: 5, name: 'Microscope Slides', category: 'Lab Supplies', quantity: 50, minLevel: 100, status: 'Low' },
    { id: 6, name: 'Petri Dishes', category: 'Lab Supplies', quantity: 400, minLevel: 150, status: 'OK' },
    { id: 7, name: 'Face Masks (N95)', category: 'PPE', quantity: 30, minLevel: 100, status: 'Critical' },
    { id: 8, name: 'Pipette Tips (200ul)', category: 'Lab Supplies', quantity: 1000, minLevel: 500, status: 'OK' },
    { id: 9, name: 'Urine Specimen Containers', category: 'Containers', quantity: 120, minLevel: 200, status: 'Low' },
    { id: 10, name: 'Tourniquets', category: 'Consumables', quantity: 45, minLevel: 50, status: 'Low' },
  ];

  const mockReorders = [
    { id: 201, item: 'Blood Collection Tubes (Red)', supplier: 'MedEquip Inc', qty: 500, date: '2026-08-01', status: 'Pending' },
    { id: 202, item: 'Face Masks (N95)', supplier: 'HealthCorp', qty: 1000, date: '2026-08-02', status: 'Shipped' },
  ];

  const mockExpiry = [
    { id: 301, item: 'Reagent Kit A', batch: 'B7892', expiryDate: '2026-08-15', daysRemaining: 11 },
    { id: 302, item: 'Control Solution B', batch: 'C1029', expiryDate: '2026-09-20', daysRemaining: 47 },
    { id: 303, item: 'Rapid Test Strips', batch: 'R4451', expiryDate: '2026-08-25', daysRemaining: 21 },
  ];

  const mockSuppliers = [
    { id: 401, name: 'MedEquip Inc', contact: 'sales@medequip.com', items: 'Tubes, Needles', lastOrder: '2026-08-01' },
    { id: 402, name: 'HealthCorp', contact: 'orders@healthcorp.com', items: 'PPE', lastOrder: '2026-08-02' },
    { id: 403, name: 'BioLab Supply', contact: 'supply@biolab.com', items: 'Reagents, Kits', lastOrder: '2026-07-15' },
  ];

  useEffect(() => {
    // Fetch from API
    fetch('/api/employee/inventory/stock')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setStock(data);
        else setStock(mockStock);
      })
      .catch(() => setStock(mockStock));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/adminlogin';
  };

  const sidebarItems = ['Dashboard', 'Stock Overview', 'Reorder Management', 'Expiry Tracker', 'Suppliers', 'Reports'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'OK': return { bg: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71' };
      case 'Low': return { bg: 'rgba(241, 196, 15, 0.1)', color: '#f1c40f' };
      case 'Critical': return { bg: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' };
      default: return { bg: 'rgba(136, 146, 176, 0.1)', color: '#8892b0' };
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a192f', color: '#e6f1ff', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: '250px', background: 'rgba(2, 12, 27, 0.7)', backdropFilter: 'blur(10px)', borderRight: '1px solid rgba(212, 175, 55, 0.2)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ color: '#d4af37', marginBottom: '40px', fontWeight: 'bold' }}>DiagnoLabs</h2>
        <div style={{ flex: 1 }}>
          {sidebarItems.map(item => {
            const mappedTab = item === 'Dashboard' ? 'Stock Overview' : item;
            return (
              <div 
                key={item} 
                style={{ padding: '15px 10px', margin: '5px 0', cursor: 'pointer', borderRadius: '8px', background: activeTab === mappedTab ? 'rgba(212, 175, 55, 0.15)' : 'transparent', color: activeTab === mappedTab ? '#d4af37' : '#8892b0', transition: 'all 0.3s' }}
                onClick={() => setActiveTab(mappedTab)}
              >
                {item === 'Stock Overview' && item !== 'Dashboard' ? 'Stock' : item === 'Reorder Management' ? 'Reorders' : item}
              </div>
            );
          })}
        </div>
        <div onClick={handleLogout} style={{ padding: '15px 10px', cursor: 'pointer', color: '#ff6b6b', borderRadius: '8px', transition: 'all 0.3s' }}>
          Logout
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: '#ccd6f6', margin: 0 }}>Inventory Manager</h1>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
          {[
            { label: 'Total Items', value: '142' },
            { label: 'Low Stock Alerts', value: '4', color: '#f1c40f' },
            { label: 'Pending Reorders', value: '8' },
            { label: 'Expiring Soon', value: '2', color: '#e74c3c' }
          ].map((stat, i) => (
            <div key={i} style={{ background: 'rgba(17, 34, 64, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(212, 175, 55, 0.1)', borderRadius: '15px', padding: '25px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#8892b0', fontSize: '14px', marginBottom: '10px' }}>{stat.label}</span>
              <span style={{ color: stat.color || '#d4af37', fontSize: '32px', fontWeight: 'bold' }}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Tabs Content */}
        <div style={{ background: 'rgba(17, 34, 64, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(212, 175, 55, 0.1)', borderRadius: '15px', padding: '30px' }}>
          
          {activeTab === 'Stock Overview' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#ccd6f6', margin: 0 }}>Stock Overview</h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', color: '#8892b0', textAlign: 'left' }}>
                    <th style={{ padding: '15px' }}>Item Name</th>
                    <th style={{ padding: '15px' }}>Category</th>
                    <th style={{ padding: '15px' }}>Quantity</th>
                    <th style={{ padding: '15px' }}>Min Level</th>
                    <th style={{ padding: '15px' }}>Status</th>
                    <th style={{ padding: '15px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(230, 241, 255, 0.05)' }}>
                      <td style={{ padding: '15px', color: '#e6f1ff' }}>{item.name}</td>
                      <td style={{ padding: '15px', color: '#a8b2d1' }}>{item.category}</td>
                      <td style={{ padding: '15px', color: '#e6f1ff' }}>{item.quantity}</td>
                      <td style={{ padding: '15px', color: '#a8b2d1' }}>{item.minLevel}</td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '12px', background: getStatusColor(item.status).bg, color: getStatusColor(item.status).color }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        {(item.status === 'Low' || item.status === 'Critical') && (
                          <button style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #d4af37', color: '#d4af37', borderRadius: '5px', cursor: 'pointer' }}>Reorder</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Reorder Management' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#ccd6f6', margin: 0 }}>Reorders</h3>
                <button style={{ padding: '8px 16px', background: '#d4af37', color: '#020c1b', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>+ New Reorder</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', color: '#8892b0', textAlign: 'left' }}>
                    <th style={{ padding: '15px' }}>Item</th>
                    <th style={{ padding: '15px' }}>Supplier</th>
                    <th style={{ padding: '15px' }}>Qty Ordered</th>
                    <th style={{ padding: '15px' }}>Date</th>
                    <th style={{ padding: '15px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockReorders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid rgba(230, 241, 255, 0.05)' }}>
                      <td style={{ padding: '15px', color: '#e6f1ff' }}>{order.item}</td>
                      <td style={{ padding: '15px', color: '#a8b2d1' }}>{order.supplier}</td>
                      <td style={{ padding: '15px', color: '#e6f1ff' }}>{order.qty}</td>
                      <td style={{ padding: '15px', color: '#a8b2d1' }}>{order.date}</td>
                      <td style={{ padding: '15px' }}>
                         <span style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '12px', background: order.status === 'Shipped' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(241, 196, 15, 0.1)', color: order.status === 'Shipped' ? '#2ecc71' : '#f1c40f' }}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Expiry Tracker' && (
            <div>
              <h3 style={{ color: '#ccd6f6', marginBottom: '20px' }}>Expiry Tracker</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', color: '#8892b0', textAlign: 'left' }}>
                    <th style={{ padding: '15px' }}>Item</th>
                    <th style={{ padding: '15px' }}>Batch</th>
                    <th style={{ padding: '15px' }}>Expiry Date</th>
                    <th style={{ padding: '15px' }}>Days Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {mockExpiry.map(exp => (
                    <tr key={exp.id} style={{ borderBottom: '1px solid rgba(230, 241, 255, 0.05)' }}>
                      <td style={{ padding: '15px', color: '#e6f1ff' }}>{exp.item}</td>
                      <td style={{ padding: '15px', color: '#a8b2d1' }}>{exp.batch}</td>
                      <td style={{ padding: '15px', color: '#a8b2d1' }}>{exp.expiryDate}</td>
                      <td style={{ padding: '15px' }}>
                         <span style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '12px', background: exp.daysRemaining < 30 ? 'rgba(231, 76, 60, 0.1)' : 'rgba(46, 204, 113, 0.1)', color: exp.daysRemaining < 30 ? '#e74c3c' : '#2ecc71', fontWeight: exp.daysRemaining < 30 ? 'bold' : 'normal' }}>
                          {exp.daysRemaining} days
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Suppliers' && (
            <div>
              <h3 style={{ color: '#ccd6f6', marginBottom: '20px' }}>Suppliers</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', color: '#8892b0', textAlign: 'left' }}>
                    <th style={{ padding: '15px' }}>Name</th>
                    <th style={{ padding: '15px' }}>Contact</th>
                    <th style={{ padding: '15px' }}>Items Supplied</th>
                    <th style={{ padding: '15px' }}>Last Order</th>
                  </tr>
                </thead>
                <tbody>
                  {mockSuppliers.map(sup => (
                    <tr key={sup.id} style={{ borderBottom: '1px solid rgba(230, 241, 255, 0.05)' }}>
                      <td style={{ padding: '15px', color: '#e6f1ff' }}>{sup.name}</td>
                      <td style={{ padding: '15px', color: '#a8b2d1' }}>{sup.contact}</td>
                      <td style={{ padding: '15px', color: '#a8b2d1' }}>{sup.items}</td>
                      <td style={{ padding: '15px', color: '#a8b2d1' }}>{sup.lastOrder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
