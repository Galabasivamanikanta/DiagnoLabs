import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { AuthContext } from '../../context/AuthContext';
import { Download, DollarSign, PieChart, CheckCircle2, Clock } from 'lucide-react';

const FinanceAnalytics = () => {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/bookings/all`);
                setBookings(res.data);
            } catch (err) {
                console.error("Failed to fetch bookings for finance", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const netCommission = totalRevenue * 0.15; // 15% Platform Fee
    const labPayouts = totalRevenue * 0.85;

    const handleExportCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Booking ID,Date,Amount,Platform Fee (15%),Lab Payout (85%),Status\n";
        bookings.forEach(b => {
            const amount = b.totalAmount || 0;
            const fee = amount * 0.15;
            const payout = amount * 0.85;
            const date = new Date(b.createdAt).toLocaleDateString('en-IN');
            csvContent += `DH-${b._id.slice(-6).toUpperCase()},${date},${amount},${fee.toFixed(2)},${payout.toFixed(2)},${b.status}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `diagnolabs_finance_export_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                    <div>
                        <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '800' }}>
                            <PieChart size={24} color="#0369a1" /> Financial Settlements & Analytics
                        </h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Overview of platform revenue, partner payouts, and active settlements.</p>
                    </div>
                    <button onClick={handleExportCSV} style={{ padding: '0.85rem 1.5rem', background: '#166534', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={18} /> Export Statement (CSV)
                    </button>
                </div>

                <div className="grid-responsive-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.5rem' }}>
                    <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.5rem' }}>Gross Revenue (Total)</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a' }}>₹{totalRevenue.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.5rem' }}>Net Platform Commission (15%)</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#166534' }}>₹{netCommission.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.5rem' }}>Pending Lab Payouts (85%)</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#d97706' }}>₹{labPayouts.toLocaleString('en-IN')}</div>
                    </div>
                </div>
            </div>
            
            <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <h4 style={{ margin: '0 0 1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>Recent Settlement Activity</h4>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                                {['Date', 'Booking ID', 'Gross Amount', 'Platform Fee', 'Lab Payout', 'Status'].map(h => (
                                    <th key={h} style={{ padding: '1rem', textAlign: 'left', fontWeight: '800', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.slice(0, 10).map((b, idx) => {
                                const amount = b.totalAmount || 0;
                                return (
                                    <tr key={b._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem', fontWeight: '600' }}>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                                        <td style={{ padding: '1rem', fontWeight: '800', color: 'var(--primary)', fontFamily: 'monospace' }}>DH-{b._id.slice(-6).toUpperCase()}</td>
                                        <td style={{ padding: '1rem', fontWeight: '800' }}>₹{amount.toLocaleString('en-IN')}</td>
                                        <td style={{ padding: '1rem', fontWeight: '800', color: '#166534' }}>₹{(amount * 0.15).toLocaleString('en-IN')}</td>
                                        <td style={{ padding: '1rem', fontWeight: '800', color: '#d97706' }}>₹{(amount * 0.85).toLocaleString('en-IN')}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.8rem', borderRadius: '100px', background: b.status === 'Report Uploaded' ? '#dcfce7' : '#fef3c7', color: b.status === 'Report Uploaded' ? '#166534' : '#92400e', fontWeight: '800', fontSize: '0.8rem' }}>
                                                {b.status === 'Report Uploaded' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                                {b.status === 'Report Uploaded' ? 'Settled' : 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinanceAnalytics;
