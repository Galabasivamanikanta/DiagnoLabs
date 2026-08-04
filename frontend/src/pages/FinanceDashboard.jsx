import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { 
    DollarSign, CreditCard, RefreshCw, FileText, Download, CheckCircle2, 
    XCircle, AlertCircle, ArrowUpRight, TrendingUp, ShieldCheck, LogOut, ChevronRight, Filter, Printer
} from 'lucide-react';

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('payouts'); // 'payouts', 'refunds', 'invoices', 'revenue'
  const [showPayoutModal, setShowPayoutModal] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(null);

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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', background: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 12px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={24} color="#003366" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#003366', margin: 0 }}>DiagnoLabs</h2>
          </div>
          <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Finance & Accounts Console</span>
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
        </nav>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <div style={{ padding: '8px 12px', marginBottom: '12px', background: '#f1f5f9', borderRadius: '10px' }}>
            <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#0f172a' }}>{user?.name || 'Accounts Officer'}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Finance Manager • 2FA Active</div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #fee2e2', background: '#fff5f5', color: '#dc2626', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {/* Header bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>Platform Accounts & Financial Control</h1>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Financial Year 2026-27 • Commission reconciliation & GST tax reporting.</p>
          </div>
          <button onClick={exportFinancialReport} style={{ padding: '10px 18px', background: '#003366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={16} /> Export Financial CSV
          </button>
        </div>

        {/* Top Financial KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
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
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
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
        )}

        {/* Tab 2: Refund Escrow Manager */}
        {activeTab === 'refunds' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Patient Refund Escalation Queue</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Refund ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Patient Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Booking ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Reason</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#0f172a' }}>Action</th>
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
        )}

        {/* Tab 3: GST Invoices */}
        {activeTab === 'invoices' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>GST-Compliant Tax Invoices Directory</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Invoice #</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Billing Entity</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Invoice Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>Subtotal</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>GST 18%</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#0f172a' }}>Action</th>
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
    </div>
  );
};

export default FinanceDashboard;

