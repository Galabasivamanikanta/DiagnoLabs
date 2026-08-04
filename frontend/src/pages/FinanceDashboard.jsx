import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Revenue Overview');
  const [revenueData, setRevenueData] = useState(null);

  // Mock Data
  const stats = [
    { title: 'Total Revenue (This Month)', value: '₹ 12,45,000', trend: '↑ 15%', trendUp: true },
    { title: 'Pending Invoices', value: '34', trend: '↓ 5%', trendUp: false },
    { title: 'Collections Today', value: '₹ 45,200', trend: '↑ 8%', trendUp: true },
    { title: 'Outstanding Amount', value: '₹ 3,12,000', trend: '↓ 2%', trendUp: false }
  ];

  const mockRevenue = [
    { month: 'Jan', value: 800000, height: '40%' },
    { month: 'Feb', value: 950000, height: '50%' },
    { month: 'Mar', value: 1100000, height: '65%' },
    { month: 'Apr', value: 1050000, height: '60%' },
    { month: 'May', value: 1300000, height: '80%' },
    { month: 'Jun', value: 1500000, height: '100%' },
  ];

  const mockInvoices = [
    { id: 'INV-1001', patient: 'Rahul Sharma', amount: '₹ 4,500', date: '2026-08-01', status: 'Paid' },
    { id: 'INV-1002', patient: 'City Hospital', amount: '₹ 25,000', date: '2026-08-02', status: 'Pending' },
    { id: 'INV-1003', patient: 'Priya Singh', amount: '₹ 1,200', date: '2026-07-28', status: 'Overdue' },
  ];

  const mockPayments = [
    { id: 'PAY-801', from: 'Rahul Sharma', amount: '₹ 4,500', method: 'UPI', date: '2026-08-01' },
    { id: 'PAY-802', from: 'Apollo Clinic', amount: '₹ 12,000', method: 'Bank Transfer', date: '2026-08-03' },
  ];

  const mockExpenses = [
    { category: 'Equipment Maintenance', description: 'MRI Scanner Service', amount: '₹ 45,000', date: '2026-08-01', approvedBy: 'Dr. Mehta' },
    { category: 'Supplies', description: 'Chemical Reagents', amount: '₹ 18,500', date: '2026-08-02', approvedBy: 'Admin' },
  ];

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const response = await axios.get('/api/employee/finance/revenue');
        setRevenueData(response.data);
      } catch (error) {
        console.log("Using fallback mock data for revenue");
        setRevenueData(mockRevenue);
      }
    };
    fetchRevenue();
  }, []);

  const handleLogout = () => {
    navigate('/adminlogin');
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Paid': 'bg-green-500/20 text-green-400 border border-green-500/30',
      'Pending': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      'Overdue': 'bg-red-500/20 text-red-400 border border-red-500/30'
    };
    return <span className={`px-2 py-1 rounded text-xs ${colors[status] || 'bg-gray-500/20 text-gray-400'}`}>{status}</span>;
  };

  return (
    <div style={{ backgroundColor: '#051124', minHeight: '100vh', color: '#e2e8f0', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: '250px', borderRight: '1px solid rgba(212, 175, 55, 0.2)', padding: '20px', background: 'linear-gradient(180deg, rgba(5,17,36,1) 0%, rgba(9,27,51,1) 100%)' }}>
        <h2 style={{ color: '#d4af37', fontSize: '24px', fontWeight: 'bold', marginBottom: '40px', letterSpacing: '1px' }}>DiagnoLabs<span style={{color:'white', fontSize:'14px', display:'block', fontWeight:'normal'}}>Finance Center</span></h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {['Dashboard', 'Revenue', 'Invoices', 'Payments', 'Expenses', 'Reports'].map(item => (
            <button key={item} style={{ textAlign: 'left', padding: '10px 15px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', transition: 'all 0.3s', ':hover': { background: 'rgba(212, 175, 55, 0.1)', color: '#d4af37' } }}>
              {item}
            </button>
          ))}
          <button onClick={handleLogout} style={{ marginTop: 'auto', textAlign: 'left', padding: '10px 15px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', cursor: 'pointer', transition: 'all 0.3s' }}>
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>Finance Manager Dashboard</h1>
          <div style={{ padding: '10px 20px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '20px', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#d4af37' }}>
            Financial Year 2026-27
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(212, 175, 55, 0.15)', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '10px' }}>{stat.title}</h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', marginBottom: '5px' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: stat.trendUp ? '#4ade80' : '#f87171' }}>{stat.trend} from last month</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
          {['Revenue Overview', 'Invoices', 'Payments', 'Expenses'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 20px', borderRadius: '8px', background: activeTab === tab ? 'rgba(212, 175, 55, 0.2)' : 'transparent', border: activeTab === tab ? '1px solid rgba(212, 175, 55, 0.5)' : '1px solid transparent', color: activeTab === tab ? '#d4af37' : '#cbd5e1', cursor: 'pointer', fontWeight: activeTab === tab ? 'bold' : 'normal', transition: 'all 0.3s' }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(10px)', borderRadius: '15px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {activeTab === 'Revenue Overview' && (
            <div>
              <h3 style={{ color: '#fff', marginBottom: '30px', fontSize: '18px' }}>Revenue Last 6 Months</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '300px', gap: '30px', padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {(revenueData || mockRevenue).map((data, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>₹{data.value / 100000}L</div>
                    <div style={{ width: '40px', height: data.height, background: 'linear-gradient(180deg, #d4af37 0%, rgba(212, 175, 55, 0.2) 100%)', borderRadius: '4px 4px 0 0', transition: 'height 1s ease-out' }}></div>
                    <div style={{ fontSize: '14px', color: '#cbd5e1' }}>{data.month}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Invoices' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', color: '#d4af37' }}>
                  <th style={{ padding: '15px' }}>Invoice #</th>
                  <th style={{ padding: '15px' }}>Patient/Lab</th>
                  <th style={{ padding: '15px' }}>Amount</th>
                  <th style={{ padding: '15px' }}>Date</th>
                  <th style={{ padding: '15px' }}>Status</th>
                  <th style={{ padding: '15px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {mockInvoices.map((inv, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '15px' }}>{inv.id}</td>
                    <td style={{ padding: '15px' }}>{inv.patient}</td>
                    <td style={{ padding: '15px' }}>{inv.amount}</td>
                    <td style={{ padding: '15px' }}>{inv.date}</td>
                    <td style={{ padding: '15px' }}>{getStatusBadge(inv.status)}</td>
                    <td style={{ padding: '15px' }}>
                      <button style={{ padding: '6px 12px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#d4af37', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Send Reminder</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'Payments' && (
             <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
             <thead>
               <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', color: '#d4af37' }}>
                 <th style={{ padding: '15px' }}>Payment #</th>
                 <th style={{ padding: '15px' }}>From</th>
                 <th style={{ padding: '15px' }}>Amount</th>
                 <th style={{ padding: '15px' }}>Method</th>
                 <th style={{ padding: '15px' }}>Date</th>
                 <th style={{ padding: '15px' }}>Action</th>
               </tr>
             </thead>
             <tbody>
               {mockPayments.map((pay, i) => (
                 <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                   <td style={{ padding: '15px' }}>{pay.id}</td>
                   <td style={{ padding: '15px' }}>{pay.from}</td>
                   <td style={{ padding: '15px' }}>{pay.amount}</td>
                   <td style={{ padding: '15px' }}>{pay.method}</td>
                   <td style={{ padding: '15px' }}>{pay.date}</td>
                   <td style={{ padding: '15px' }}>
                     <button style={{ padding: '6px 12px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>View Receipt</button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
          )}

          {activeTab === 'Expenses' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <button style={{ padding: '10px 20px', background: '#d4af37', color: '#051124', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add Expense</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', color: '#d4af37' }}>
                  <th style={{ padding: '15px' }}>Category</th>
                  <th style={{ padding: '15px' }}>Description</th>
                  <th style={{ padding: '15px' }}>Amount</th>
                  <th style={{ padding: '15px' }}>Date</th>
                  <th style={{ padding: '15px' }}>Approved By</th>
                </tr>
              </thead>
              <tbody>
                {mockExpenses.map((exp, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '15px' }}>{exp.category}</td>
                    <td style={{ padding: '15px' }}>{exp.description}</td>
                    <td style={{ padding: '15px', color: '#f87171' }}>-{exp.amount}</td>
                    <td style={{ padding: '15px' }}>{exp.date}</td>
                    <td style={{ padding: '15px' }}>{exp.approvedBy}</td>
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

export default FinanceDashboard;
