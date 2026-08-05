import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { 
    DollarSign, CreditCard, RefreshCw, FileText, Download, CheckCircle2, 
    XCircle, AlertCircle, ArrowUpRight, TrendingUp, ShieldCheck, LogOut, ChevronRight, Filter, Printer, Menu, X,
    BarChart3, PieChart, ClipboardList, Wallet, Plus, Building2, Zap, Megaphone, Calendar
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import NotificationBell from '../components/NotificationBell';
import '../styles/DashboardShared.css';

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('payouts'); // 'payouts', 'refunds', 'invoices', 'revenue', 'pnl', 'expenses', 'audit'
  const [showPayoutModal, setShowPayoutModal] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock Lab Partner Payouts
  const [payouts, setPayouts] = useState([
    { id: 'PAY-701', labName: 'Apollo Diagnostics - Gachibowli', grossBookings: 84500, commissionPct: 20, platformFee: 16900, netPayout: 67600, cycle: 'July 2026 (W4)', status: 'Pending' },
    { id: 'PAY-702', labName: 'Vijaya Diagnostic Center - Secunderabad', grossBookings: 120000, commissionPct: 18, platformFee: 21600, netPayout: 98400, cycle: 'July 2026 (W4)', status: 'Pending' },
    { id: 'PAY-703', labName: 'Metropolis Labs - Hitec City', grossBookings: 56000, commissionPct: 20, platformFee: 11200, netPayout: 44800, cycle: 'July 2026 (W3)', status: 'Processed' }
  ]);

  // Mock Refund Requests
  const [refunds, setRefunds] = useState([
    { id: 'REF-301', patient: 'Rahul Sharma', bookingId: 'BK-8821', amount: 1450, reason: 'Patient cancelled 4 hours prior', gatewayTxn: 'pay_N99281A', status: 'Pending' },
    { id: 'REF-302', patient: 'Priya Singh', bookingId: 'BK-8844', amount: 850, reason: 'Sample collector delayed > 2 hours', gatewayTxn: 'pay_N99312B', status: 'Pending' },
    { id: 'REF-303', patient: 'Kiran Kumar', bookingId: 'BK-8790', amount: 2200, reason: 'Incorrect test booked', gatewayTxn: 'pay_N99105C', status: 'Approved' }
  ]);

  // Mock Invoices
  const [invoices] = useState([
    { id: 'INV-2026-001', entity: 'Rahul Sharma', type: 'Patient B2C', amount: 1450, gstAmount: 261, date: '2026-08-04', status: 'Paid' },
    { id: 'INV-2026-002', entity: 'Apollo Diagnostics', type: 'Lab B2B Commission', amount: 16900, gstAmount: 3042, date: '2026-08-03', status: 'Issued' },
    { id: 'INV-2026-003', entity: 'Vijaya Diagnostics', type: 'Lab B2B Commission', amount: 21600, gstAmount: 3888, date: '2026-08-02', status: 'Paid' }
  ]);

  // Mock Expenses
  const [expenses, setExpenses] = useState([
    { id: 'EXP-001', category: 'Salary', amount: 45000, description: 'August Payroll', date: '2026-08-01' },
    { id: 'EXP-002', category: 'Technology', amount: 12000, description: 'AWS Hosting', date: '2026-08-02' },
    { id: 'EXP-003', category: 'Marketing', amount: 8500, description: 'FB Ads', date: '2026-08-03' }
  ]);

  // Mock Audit Trail
  const [auditLogs] = useState([
    { id: 'AUD-001', timestamp: '2026-08-05 14:30', action: 'Payout Processed', user: 'Admin', details: 'Processed PAY-703', amount: 44800, status: 'Success' },
    { id: 'AUD-002', timestamp: '2026-08-05 13:15', action: 'Refund Approved', user: 'Finance Mgr', details: 'Approved REF-303', amount: 2200, status: 'Success' },
    { id: 'AUD-003', timestamp: '2026-08-04 09:00', action: 'Invoice Generated', user: 'System', details: 'Generated INV-2026-001', amount: 1450, status: 'Success' },
    { id: 'AUD-004', timestamp: '2026-08-03 10:20', action: 'Expense Added', user: 'Admin', details: 'Added Technology Exp', amount: 12000, status: 'Success' }
  ]);

  const handleLogout = () => {
    logout();
    navigate('/adminlogin');
  };

  const handleConfirmPayout = (payoutId) => {
    alert(`Payout [${payoutId}] successfully DISBURSED via Razorpay X Bank Transfer! Notification sent to Lab Partner.`);
    setPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status: 'Processed' } : p));
    setShowPayoutModal(null);
  };

  const handleConfirmRefund = (refundId) => {
    alert(`Refund [${refundId}] APPROVED & PROCESSED! ₹ amount credited back to patient's payment method via Razorpay. Email sent.`);
    setRefunds(prev => prev.map(r => r.id === refundId ? { ...r, status: 'Approved' } : r));
    setShowRefundModal(null);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newExpense = {
      id: `EXP-00${expenses.length + 1}`,
      category: formData.get('category'),
      amount: Number(formData.get('amount')),
      description: formData.get('description'),
      date: formData.get('date')
    };
    setExpenses([newExpense, ...expenses]);
    setShowExpenseModal(false);
  };

  const exportFinancialReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Transaction Type,ID,Entity,Amount (INR),GST (INR),Status\n"
      + invoices.map(i => `"Invoice","${i.id}","${i.entity}",${i.amount},${i.gstAmount},"${i.status}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "DiagnoLabs_Financial_Report_Q2_2026.csv");
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
              <BrandLogo size={32} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#003366', margin: 0 }}>DiagnoLabs</h2>
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Finance & Accounts Console</span>
          </div>
          {/* Close button for mobile sidebar */}
          <div className="dashboard-header-mobile-toggle" style={{ border: 'none', padding: 0, margin: 0 }} onClick={() => setSidebarOpen(false)}>
             <X size={24} color="#64748b" />
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <button 
            onClick={() => setActiveTab('payouts')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'payouts' ? '#f0f7ff' : 'transparent', color: activeTab === 'payouts' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <CreditCard size={18} /> Lab Partner Payouts ({payouts.filter(p => p.status === 'Pending').length})
          </button>
          <button 
            onClick={() => setActiveTab('refunds')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'refunds' ? '#f0f7ff' : 'transparent', color: activeTab === 'refunds' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <RefreshCw size={18} /> Refund Escrow Manager ({refunds.filter(r => r.status === 'Pending').length})
          </button>
          <button 
            onClick={() => setActiveTab('invoices')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'invoices' ? '#f0f7ff' : 'transparent', color: activeTab === 'invoices' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <FileText size={18} /> GST Invoicing Console ({invoices.length})
          </button>
          <button 
            onClick={() => setActiveTab('revenue')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'revenue' ? '#f0f7ff' : 'transparent', color: activeTab === 'revenue' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <TrendingUp size={18} /> Revenue Analytics & P&L
          </button>
          <button 
            onClick={() => setActiveTab('pnl')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'pnl' ? '#f0f7ff' : 'transparent', color: activeTab === 'pnl' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <BarChart3 size={18} /> P&L Charts
          </button>
          <button 
            onClick={() => setActiveTab('expenses')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'expenses' ? '#f0f7ff' : 'transparent', color: activeTab === 'expenses' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <Wallet size={18} /> Expense Tracker
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            style={{ padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'audit' ? '#f0f7ff' : 'transparent', color: activeTab === 'audit' ? '#003366' : '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
          >
            <ClipboardList size={18} /> Audit Trail
          </button>
        </nav>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <div style={{ padding: '16px', marginBottom: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#003366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem', flexShrink: 0 }}>
                {(user?.name || 'Accounts').charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Accounts Officer'}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'finance@diagnolabs.com'}</div>
              </div>
            </div>
            <div style={{ background: '#f0f7ff', color: '#003366', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', alignSelf: 'flex-start', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Finance Manager
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
        {/* Header bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="dashboard-header-mobile-toggle" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} color="#0f172a" />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>Platform Accounts & Financial Control</h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Financial Year 2026-27 • Commission reconciliation & GST tax reporting.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <NotificationBell />
            <button onClick={exportFinancialReport} style={{ padding: '10px 18px', background: '#003366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download size={16} /> Export Financial CSV
            </button>
          </div>
        </div>

        {/* Top Financial KPIs */}
        <div className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Today's Revenue</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#059669', marginTop: '6px' }}>₹1,45,200</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Pending Lab Payouts</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#003366', marginTop: '6px' }}>₹1,66,000</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Pending Refunds</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#d97706', marginTop: '6px' }}>₹2,300</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>GST Tax Collected (18%)</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#2563eb', marginTop: '6px' }}>₹32,400</div>
          </div>
        </div>

        {/* Tab 1: Lab Partner Payouts */}
        {activeTab === 'payouts' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Lab Partner Commission Payout Settlement Queue</h3>
            <div className="dashboard-table-container">
            <table className="dashboard-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Payout ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Lab Partner Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Gross Bookings</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Platform Cut</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Net Disbursable</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#0f172a', fontWeight: '800' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#003366' }}>{p.id}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{p.labName}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>₹{p.grossBookings.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px', color: '#dc2626', fontWeight: '600' }}>-₹{p.platformFee.toLocaleString('en-IN')} ({p.commissionPct}%)</td>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#059669' }}>₹{p.netPayout.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {p.status === 'Pending' ? (
                        <button onClick={() => setShowPayoutModal(p)} style={{ padding: '6px 14px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
                          Process Payout
                        </button>
                      ) : (
                        <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', background: '#dcfce7', color: '#166534' }}>
                          Disbursed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Tab 2: Refund Escrow Manager */}
        {activeTab === 'refunds' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Patient Refund Escalation Queue</h3>
            <div className="dashboard-table-container">
            <table className="dashboard-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Refund ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Patient Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Booking ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Reason</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#0f172a', fontWeight: '800' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {refunds.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#003366' }}>{r.id}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{r.patient}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{r.bookingId}</td>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#dc2626' }}>₹{r.amount.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px', color: '#334155' }}>{r.reason}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {r.status === 'Pending' ? (
                        <button onClick={() => setShowRefundModal(r)} style={{ padding: '6px 14px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
                          Approve Refund
                        </button>
                      ) : (
                        <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', background: '#dcfce7', color: '#166534' }}>
                          Refunded
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Tab 3: GST Invoices */}
        {activeTab === 'invoices' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>GST-Compliant Tax Invoices Directory</h3>
            <div className="dashboard-table-container">
            <table className="dashboard-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Invoice #</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Billing Entity</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Invoice Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Subtotal</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>GST 18%</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#0f172a', fontWeight: '800' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#003366' }}>{inv.id}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{inv.entity}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{inv.type}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>₹{inv.amount.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px', color: '#059669', fontWeight: '700' }}>₹{inv.gstAmount.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button onClick={() => setShowInvoiceModal(inv)} style={{ padding: '6px 12px', background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Printer size={12} /> View Tax Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Tab 4: Revenue & P&L Analytics */}
        {activeTab === 'revenue' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Platform Revenue & Profit/Loss Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px', color: '#003366', fontWeight: '800' }}>Gross Booking Volume</h4>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>₹ 14,50,000</div>
                <div style={{ fontSize: '0.8rem', color: '#059669', marginTop: '4px', fontWeight: '700' }}>↑ 18.5% growth vs Q1 2026</div>
              </div>
              <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px', color: '#003366', fontWeight: '800' }}>Net Platform Commission Retained</h4>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#059669' }}>₹ 2,85,000</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', fontWeight: '700' }}>20% average platform take rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: P&L Charts */}
        {activeTab === 'pnl' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Visual Profit & Loss (Last 6 Months)</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '250px', gap: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
              {[{m: 'Feb', r: 120, e: 80}, {m: 'Mar', r: 140, e: 90}, {m: 'Apr', r: 130, e: 85}, {m: 'May', r: 160, e: 100}, {m: 'Jun', r: 180, e: 110}, {m: 'Jul', r: 200, e: 115}].map((data, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100%', width: '100%', justifyContent: 'center' }}>
                    <div style={{ width: '30%', height: `${(data.r / 200) * 100}%`, background: '#059669', borderRadius: '4px 4px 0 0' }}></div>
                    <div style={{ width: '30%', height: `${(data.e / 200) * 100}%`, background: '#dc2626', borderRadius: '4px 4px 0 0' }}></div>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>{data.m}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '16px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', background: '#059669', borderRadius: '2px' }}></div> <strong>Revenue</strong></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', background: '#dc2626', borderRadius: '2px' }}></div> <strong>Expenses</strong></div>
            </div>
          </div>
        )}

        {/* Tab 6: Expense Tracker */}
        {activeTab === 'expenses' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Expense Tracker</h3>
              <button onClick={() => setShowExpenseModal(true)} style={{ padding: '8px 16px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} /> Add Expense
              </button>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>Category Breakdown</div>
              <div style={{ display: 'flex', height: '24px', borderRadius: '12px', overflow: 'hidden', gap: '2px' }}>
                <div style={{ width: '40%', background: '#3b82f6' }} title="Salary (40%)"></div>
                <div style={{ width: '25%', background: '#8b5cf6' }} title="Technology (25%)"></div>
                <div style={{ width: '20%', background: '#ec4899' }} title="Marketing (20%)"></div>
                <div style={{ width: '10%', background: '#f59e0b' }} title="Office (10%)"></div>
                <div style={{ width: '5%', background: '#10b981' }} title="Logistics (5%)"></div>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', background: '#3b82f6', borderRadius: '2px' }}></div> Salary</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', background: '#8b5cf6', borderRadius: '2px' }}></div> Technology</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', background: '#ec4899', borderRadius: '2px' }}></div> Marketing</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '2px' }}></div> Office</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px' }}></div> Logistics</div>
              </div>
            </div>
            <div className="dashboard-table-container">
              <table className="dashboard-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Category</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Description</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(exp => (
                    <tr key={exp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '800', color: '#003366' }}>{exp.id}</td>
                      <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{exp.category}</td>
                      <td style={{ padding: '12px', color: '#475569' }}>{exp.description}</td>
                      <td style={{ padding: '12px', color: '#475569' }}>{exp.date}</td>
                      <td style={{ padding: '12px', fontWeight: '800', color: '#dc2626' }}>₹{exp.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 7: Audit Trail */}
        {activeTab === 'audit' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Financial Audit Trail</h3>
            <div className="dashboard-table-container">
              <table className="dashboard-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Timestamp</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Action Type</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>User</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Details</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Amount</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontWeight: '800' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', color: '#475569' }}>{log.timestamp}</td>
                      <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{log.action}</td>
                      <td style={{ padding: '12px', color: '#475569' }}>{log.user}</td>
                      <td style={{ padding: '12px', color: '#475569' }}>{log.details}</td>
                      <td style={{ padding: '12px', fontWeight: '800', color: '#0f172a' }}>₹{log.amount.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', background: '#dcfce7', color: '#166534' }}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Payout Confirmation Modal */}
      {showPayoutModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px', color: '#0f172a', fontWeight: '800' }}>Confirm Bank Payout Disbursement</h3>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Lab Partner:</div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>{showPayoutModal.labName}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span>Gross Bookings:</span>
                <strong>₹{showPayoutModal.grossBookings.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: '#dc2626' }}>
                <span>Platform Commission ({showPayoutModal.commissionPct}%):</span>
                <strong>-₹{showPayoutModal.platformFee.toLocaleString('en-IN')}</strong>
              </div>
              <hr style={{ margin: '8px 0', borderTop: '1px solid #e2e8f0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '800', color: '#059669' }}>
                <span>Net Disbursable Payout:</span>
                <span>₹{showPayoutModal.netPayout.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowPayoutModal(null)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleConfirmPayout(showPayoutModal.id)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#003366', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Execute Disbursal</button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      {showRefundModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px', color: '#0f172a', fontWeight: '800' }}>Confirm Gateway Refund Authorization</h3>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Patient Name:</div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>{showRefundModal.patient} (Booking #{showRefundModal.bookingId})</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Refund Reason:</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>{showRefundModal.reason}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#059669' }}>Amount to Credit: ₹{showRefundModal.amount.toLocaleString('en-IN')}</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowRefundModal(null)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleConfirmRefund(showRefundModal.id)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#059669', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Process Refund</button>
            </div>
          </div>
        </div>
      )}

      {/* GST Tax Invoice Printable Modal */}
      {showInvoiceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ borderBottom: '2px solid #003366', paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: '#003366', fontWeight: '800' }}>DiagnoLabs Healthcare Pvt Ltd</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>GSTIN: 36AAACD9981A1Z9</span>
              </div>
              <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>{showInvoiceModal.id}</span>
            </div>
            <div style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
              <div>Billed To: <strong>{showInvoiceModal.entity}</strong></div>
              <div>Invoice Type: <strong>{showInvoiceModal.type}</strong></div>
              <div>Date: {showInvoiceModal.date}</div>
            </div>
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span>Subtotal:</span><strong>₹{showInvoiceModal.amount}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#059669' }}><span>CGST (9%) + SGST (9%):</span><strong>₹{showInvoiceModal.gstAmount}</strong></div>
              <hr style={{ margin: '6px 0', borderTop: '1px solid #cbd5e1' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1rem', color: '#003366' }}><span>Total Invoice Amount:</span><span>₹{(showInvoiceModal.amount + showInvoiceModal.gstAmount).toLocaleString('en-IN')}</span></div>
            </div>
            <button onClick={() => setShowInvoiceModal(null)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: 'none', background: '#003366', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Close Invoice View</button>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px', color: '#0f172a', fontWeight: '800' }}>Add New Expense</h3>
            <form onSubmit={handleAddExpense}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>Category</label>
                <select name="category" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="Salary">Salary</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Technology">Technology</option>
                  <option value="Office">Office</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>Amount (₹)</label>
                <input type="number" name="amount" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>Description</label>
                <input type="text" name="description" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>Date</label>
                <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowExpenseModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#003366', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Add Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceDashboard;

