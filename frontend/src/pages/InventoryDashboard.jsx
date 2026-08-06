import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { 
    Package, AlertTriangle, Truck, Download, Plus, Check, X, 
    Search, Filter, ShoppingCart, Clock, CheckCircle2, AlertCircle, LogOut, Menu
} from 'lucide-react';
import '../styles/DashboardShared.css';

const InventoryDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'stock', 'suppliers', 'po'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPOModal, setShowPOModal] = useState(false);
  const [poForm, setPoForm] = useState({ item: 'Blood Collection Tubes (Red)', supplier: 'MedEquip Inc', qty: '500', price: '4500' });

  const [] = useState([]);

  const [stock] = useState([
    { id: 1, name: 'Latex Gloves (Medium)', category: 'PPE', quantity: 450, maxLevel: 1000, minLevel: 200, status: 'OK' },
    { id: 2, name: 'Syringes 5ml (Luer Lock)', category: 'Consumables', quantity: 150, maxLevel: 1000, minLevel: 200, status: 'Low' },
    { id: 3, name: 'Blood Collection Tubes (Red)', category: 'Tubes', quantity: 20, maxLevel: 500, minLevel: 100, status: 'Critical' },
    { id: 4, name: 'Isopropyl Alcohol Swabs', category: 'Consumables', quantity: 800, maxLevel: 1000, minLevel: 300, status: 'OK' },
    { id: 5, name: 'N95 Respirator Masks', category: 'PPE', quantity: 30, maxLevel: 500, minLevel: 100, status: 'Critical' }
  ]);

  const [suppliers] = useState([
    { id: 401, name: 'MedEquip Inc', contact: 'sales@medequip.com', phone: '+91 98765 00112', categories: 'Tubes, Syringes', leadTime: '2 Days', rating: '4.9 ★' },
    { id: 402, name: 'HealthCorp Supplies', contact: 'orders@healthcorp.com', phone: '+91 98765 00223', categories: 'PPE, Masks', leadTime: '1 Day', rating: '4.8 ★' },
    { id: 403, name: 'BioLab Reagents', contact: 'supply@biolab.com', phone: '+91 98765 00334', categories: 'Assay Kits, Solvents', leadTime: '3 Days', rating: '4.7 ★' }
  ]);

  const [purchaseOrders, setPurchaseOrders] = useState([
    { id: 'PO-8801', item: 'Blood Collection Tubes (Red)', supplier: 'MedEquip Inc', qty: 500, totalCost: '₹4,500', status: 'Shipped', date: '2026-08-03' },
    { id: 'PO-8802', item: 'N95 Masks', supplier: 'HealthCorp Supplies', qty: 1000, totalCost: '₹12,000', status: 'Ordered', date: '2026-08-04' }
  ]);

  const handleLogout = () => {
    logout();
    navigate('/adminlogin');
  };

  const handleApproveRequest = (id) => {
    alert(`Restock Request [${id}] APPROVED! Dispatch order generated.`);
    setRestockRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
  };

  const handleRejectRequest = (id) => {
    alert(`Restock Request [${id}] REJECTED.`);
    setRestockRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
  };

  const handleBulkApprove = () => {
    if (selectedRequests.length === 0) return alert("Please select restock requests to bulk approve.");
    alert(`Bulk Approved ${selectedRequests.length} Restock Requests! Dispatch orders queued.`);
    setRestockRequests(prev => prev.map(r => selectedRequests.includes(r.id) ? { ...r, status: 'Approved' } : r));
    setSelectedRequests([]);
  };

  const handlePOSubmit = (e) => {
    e.preventDefault();
    const newPO = {
      id: `PO-${Math.floor(8000 + Math.random()*1000)}`,
      item: poForm.item,
      supplier: poForm.supplier,
      qty: poForm.qty,
      totalCost: `₹${parseInt(poForm.price).toLocaleString('en-IN')}`,
      status: 'Ordered',
      date: '2026-08-04'
    };
    setPurchaseOrders([newPO, ...purchaseOrders]);
    alert(`Purchase Order [${newPO.id}] submitted to ${poForm.supplier}! Tracking initiated.`);
    setShowPOModal(false);
  };

  const exportCSVReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Item Name,Category,Quantity,Min Level,Status\n"
      + stock.map(s => `"${s.name}","${s.category}",${s.quantity},${s.minLevel},"${s.status}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "DiagnoLabs_Inventory_Stock_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <Package size={24} color="#003366" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#003366', margin: 0 }}>DiagnoLabs</h2>
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Warehouse & Supply Chain</span>
          </div>
          {/* Close button for mobile sidebar */}
          <div className="dashboard-header-mobile-toggle" style={{ border: 'none', padding: 0, margin: 0 }} onClick={() => setSidebarOpen(false)}>
             <X size={24} color="#64748b" />
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <button 
            onClick={() => setActiveTab('requests')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'requests' ? '#f0f7ff' : 'transparent', color: activeTab === 'requests' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <ShoppingCart size={18} /> Lab Restock Requests ({restockRequests.filter(r => r.status === 'Pending').length})
          </button>
          <button 
            onClick={() => setActiveTab('stock')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'stock' ? '#f0f7ff' : 'transparent', color: activeTab === 'stock' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <Package size={18} /> Stock Level Grid ({stock.length})
          </button>
          <button 
            onClick={() => setActiveTab('po')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'po' ? '#f0f7ff' : 'transparent', color: activeTab === 'po' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <Truck size={18} /> Purchase Orders ({purchaseOrders.length})
          </button>
          <button 
            onClick={() => setActiveTab('suppliers')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'suppliers' ? '#f0f7ff' : 'transparent', color: activeTab === 'suppliers' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <Truck size={18} /> Verified Suppliers ({suppliers.length})
          </button>
        </nav>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <div style={{ padding: '16px', marginBottom: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#003366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem', flexShrink: 0 }}>
                {(user?.name || 'Inventory Manager').charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Inventory Manager'}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'inventory@diagnolabs.com'}</div>
              </div>
            </div>
            <div style={{ background: '#f0f7ff', color: '#003366', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', alignSelf: 'flex-start', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Supply Chain Lead
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
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>Inventory & Procurement Control Console</h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Manage supplies, reorder thresholds, and vendor dispatches across network lab partners.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={exportCSVReport} style={{ padding: '10px 18px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download size={16} /> Export CSV Report
            </button>
            <button onClick={() => setShowPOModal(true)} style={{ padding: '10px 18px', background: '#003366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Create Purchase Order
            </button>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #fee2e2', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Low Stock Alerts</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#dc2626', marginTop: '6px' }}>{stock.filter(s => s.status !== 'OK').length}</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Pending Restock Requests</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#d97706', marginTop: '6px' }}>{restockRequests.filter(r => r.status === 'Pending').length}</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Active Vendors / Suppliers</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#003366', marginTop: '6px' }}>{suppliers.length}</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Monthly Procurement Spend</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#059669', marginTop: '6px' }}>₹1,45,000</div>
          </div>
        </div>

        {/* Tab 1: Lab Restock Requests Queue */}
        {activeTab === 'requests' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Incoming Lab Restock Requests Queue</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Review restock requests raised by onboarded Lab Partners.</p>
              </div>
              <button onClick={handleBulkApprove} style={{ padding: '8px 16px', background: '#059669', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                Bulk Approve Selected ({selectedRequests.length})
              </button>
            </div>

            <div className="dashboard-table-container">
            <table className="dashboard-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'center', width: '40px' }}>
                    <input type="checkbox" onChange={e => setSelectedRequests(e.target.checked ? restockRequests.map(r => r.id) : [])} />
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Req ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Lab Partner</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Item Requested</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Requested Qty</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Urgency</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#0f172a', fontWeight: '800' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {restockRequests.map(req => (
                  <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <input type="checkbox" checked={selectedRequests.includes(req.id)} onChange={e => setSelectedRequests(e.target.checked ? [...selectedRequests, req.id] : selectedRequests.filter(id => id !== req.id))} />
                    </td>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#003366' }}>{req.id}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{req.labName}</td>
                    <td style={{ padding: '12px', color: '#334155' }}>{req.item}</td>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#0f172a' }}>{req.requestedQty} units</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', background: req.urgency === 'High' ? '#fee2e2' : '#fef3c7', color: req.urgency === 'High' ? '#dc2626' : '#92400e' }}>
                        {req.urgency}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {req.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button onClick={() => handleApproveRequest(req.id)} style={{ padding: '6px 12px', background: '#059669', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>Approve</button>
                          <button onClick={() => handleRejectRequest(req.id)} style={{ padding: '6px 12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>Reject</button>
                        </div>
                      ) : (
                        <span style={{ fontWeight: '800', fontSize: '0.8rem', color: req.status === 'Approved' ? '#059669' : '#dc2626' }}>{req.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Tab 2: Stock Level Grid */}
        {activeTab === 'stock' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Central Warehouse Stock Progress Level</h3>
            <div className="dashboard-table-container">
            <table className="dashboard-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Item Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Category</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Current Quantity</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Stock Level Visual</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stock.map(item => {
                  const pct = Math.min(100, Math.round((item.quantity / item.maxLevel) * 100));
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{item.name}</td>
                      <td style={{ padding: '12px', color: '#64748b' }}>{item.category}</td>
                      <td style={{ padding: '12px', fontWeight: '800', color: '#003366' }}>{item.quantity} units</td>
                      <td style={{ padding: '12px', width: '220px' }}>
                        <div style={{ background: '#e2e8f0', borderRadius: '100px', height: '10px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: item.status === 'OK' ? '#059669' : (item.status === 'Low' ? '#d97706' : '#dc2626'), borderRadius: '100px' }}></div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', background: item.status === 'OK' ? '#dcfce7' : (item.status === 'Low' ? '#fef3c7' : '#fee2e2'), color: item.status === 'OK' ? '#166534' : (item.status === 'Low' ? '#92400e' : '#dc2626') }}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Tab 3: Purchase Orders */}
        {activeTab === 'po' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Active Purchase Orders (Procurement Stream)</h3>
            <div className="dashboard-table-container">
            <table className="dashboard-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>PO Number</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Item Description</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Supplier</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Total Cost</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Delivery Status</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map(po => (
                  <tr key={po.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#003366' }}>{po.id}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{po.item}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{po.supplier}</td>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#059669' }}>{po.totalCost}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', background: po.status === 'Shipped' ? '#e0f2fe' : '#f1f5f9', color: po.status === 'Shipped' ? '#0369a1' : '#475569' }}>
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Tab 4: Suppliers */}
        {activeTab === 'suppliers' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Verified Supplier Directory</h3>
            <div className="dashboard-table-container">
            <table className="dashboard-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Supplier Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Contact Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Supplied Categories</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Lead Time</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Vendor Rating</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map(sup => (
                  <tr key={sup.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#003366' }}>{sup.name}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{sup.contact}</td>
                    <td style={{ padding: '12px', color: '#334155' }}>{sup.categories}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{sup.leadTime}</td>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#d97706' }}>{sup.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </main>

      {/* Purchase Order Modal */}
      {showPOModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px', color: '#0f172a', fontWeight: '800' }}>Place New Purchase Order (PO)</h3>
            <form onSubmit={handlePOSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>ITEM TO PROCURE</label>
                <input type="text" required value={poForm.item} onChange={e => setPoForm({...poForm, item: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>SELECT SUPPLIER</label>
                <select value={poForm.supplier} onChange={e => setPoForm({...poForm, supplier: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none', background: 'white' }}>
                  {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>QUANTITY</label>
                  <input type="number" required value={poForm.qty} onChange={e => setPoForm({...poForm, qty: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>TOTAL COST (₹)</label>
                  <input type="number" required value={poForm.price} onChange={e => setPoForm({...poForm, price: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowPOModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#003366', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Submit Purchase Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;

