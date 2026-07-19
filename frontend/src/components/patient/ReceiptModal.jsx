import React from 'react';
import { X, Activity, Building2, MapPin, BadgeIndianRupee, Phone, CalendarDays, FlaskConical, AlertCircle, FileText, Download, CheckCircle2, Clock } from 'lucide-react';

const ReceiptModal = ({ booking, onClose, user }) => {
    if (!booking) return null;

    // Helper for clinical precautions based on test name
    const getClinicalInstructions = (testName = '') => {
        const t = testName.toLowerCase();
        if (t.includes('blood') || t.includes('cbc') || t.includes('sugar') || t.includes('lipid')) {
            return {
                items: "EDTA Vacutainer (Purple Top), Fluoride Tube (Grey Top), Syringe, Tourniquet, Alcohol Swabs.",
                food: "Fasting required for 8-10 hours. Only water is permitted. Avoid alcohol for 24 hours prior.",
                precautions: "Do not exercise heavily before the test. Inform the phlebotomist of any blood-thinning medication."
            };
        } else if (t.includes('urine')) {
            return {
                items: "Sterile Urine Specimen Container (Wide-mouth, 50ml).",
                food: "No specific fasting required unless otherwise advised.",
                precautions: "Collect mid-stream urine for accurate results. Wash hands before collection."
            };
        } else if (t.includes('thyroid')) {
            return {
                items: "Serum Separator Tube (SST - Yellow Top).",
                food: "No fasting required.",
                precautions: "Take the test before your morning thyroid medication, unless advised otherwise by your doctor."
            };
        } else {
            return {
                items: "Standard collection kit (Swabs, Vials as per specific pathology requirement).",
                food: "Maintain normal diet unless instructed otherwise.",
                precautions: "Follow general hygiene protocols."
            };
        }
    };

    const instructions = getClinicalInstructions(booking.testDetails?.[0]?.testName);

    const STAGES = ['Pending', 'Confirmed', 'Sample Collected', 'Report Uploaded'];
    const currentStageIdx = booking.status === 'Cancelled' ? -1 : Math.max(0, STAGES.indexOf(booking.status));

    return (
        <div className="receipt-modal-container" style={{
            fontFamily: "'Caveat', cursive",
            fontSize: '1.25rem',
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '2rem'
        }}>
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap');`}
            </style>
            <div style={{
                background: 'white', borderRadius: '24px', width: '100%', maxWidth: '800px',
                maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
            }}>
                {/* Header (DiagnoLabs Branding) */}
                <div style={{ 
                    padding: '2rem', borderBottom: '1px dashed var(--border)', display: 'flex', 
                    justifyContent: 'space-between', alignItems: 'flex-start', background: '#f8fafc' 
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img 
                            src="/diagnolabs_logo.png" 
                            alt="DiagnoLabs Logo" 
                            style={{ height: '45px', objectFit: 'contain' }} 
                        />
                    </div>
                    <div className="no-print" style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', padding: '0.5rem 1rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                            <Download size={16} /> Download PDF
                        </button>
                        <button onClick={onClose} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div style={{ padding: '2rem' }}>
                    
                    {/* Visual Tracking Stepper */}
                    <div className="no-print" style={{ marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                            {/* Connecting Line */}
                            <div style={{ position: 'absolute', top: '24px', left: '10%', right: '10%', height: '4px', background: 'var(--border-light)', zIndex: 1, borderRadius: '2px' }} />
                            <div style={{ position: 'absolute', top: '24px', left: '10%', width: `${currentStageIdx >= 0 ? (currentStageIdx / (STAGES.length - 1)) * 80 : 0}%`, height: '4px', background: 'var(--success)', zIndex: 2, borderRadius: '2px', transition: 'width 0.5s ease' }} />
                            
                            {STAGES.map((stage, idx) => {
                                const isCompleted = idx <= currentStageIdx;
                                const isCurrent = idx === currentStageIdx;
                                const isCancelled = booking.status === 'Cancelled';
                                
                                return (
                                    <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, flex: 1 }}>
                                        <div style={{ 
                                            width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: isCancelled ? '#fee2e2' : (isCompleted ? 'var(--success)' : 'white'),
                                            color: isCancelled ? 'var(--danger)' : (isCompleted ? 'white' : 'var(--text-muted)'),
                                            border: `4px solid ${isCancelled ? '#fecaca' : (isCompleted ? '#a7f3d0' : 'var(--border)')}`,
                                            transition: 'all 0.3s ease',
                                            boxShadow: isCurrent ? '0 0 0 4px rgba(5, 150, 105, 0.1)' : 'none'
                                        }}>
                                            {isCancelled ? <X size={20} /> : (isCompleted ? <CheckCircle2 size={20} /> : <Clock size={20} />)}
                                        </div>
                                        <div style={{ 
                                            marginTop: '0.75rem', fontSize: '0.8rem', fontWeight: '800', textAlign: 'center',
                                            color: isCancelled ? 'var(--danger)' : (isCurrent ? 'var(--text-main)' : (isCompleted ? 'var(--success)' : 'var(--text-muted)'))
                                        }}>
                                            {stage}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* Top Info Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                        {/* Transaction Info */}
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileText size={16} style={{ color: 'var(--primary)' }}/> Transaction Details
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Booking ID:</span>
                                    <span style={{ fontWeight: '700', fontFamily: 'monospace' }}>DH-{booking._id.slice(-8).toUpperCase()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Transaction ID:</span>
                                    <span style={{ fontWeight: '700', fontFamily: 'monospace' }}>{booking.razorpayPaymentId || 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>UTR / Order ID:</span>
                                    <span style={{ fontWeight: '700', fontFamily: 'monospace' }}>{booking.razorpayOrderId || 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Date:</span>
                                    <span style={{ fontWeight: '700' }}>{new Date(booking.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                                    <span style={{ fontWeight: '800', color: '#166534' }}>{booking.paymentStatus === 'Paid' ? 'PAID SUCCESSFULLY' : booking.paymentStatus}</span>
                                </div>
                            </div>
                        </div>

                        {/* Patient & Lab Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Patient Details</div>
                                <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>{user?.name}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>ID: {user?.customerId || 'DL-XXXXXXXX'}</div>
                            </div>
                            <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px', background: '#fdfdfd' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Building2 size={14} /> Assigned Lab
                                </div>
                                <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>{booking.lab?.name || 'DAA Authorized Network Lab'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Test Details Table */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>Test Details</h3>
                        <div style={{ border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700', color: 'var(--text-muted)' }}>Test Description</th>
                                        <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: 'var(--text-muted)' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {booking.testDetails?.map((t, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '1rem', fontWeight: '700' }}>{t.testName}</td>
                                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700' }}>₹{t.price}</td>
                                        </tr>
                                    ))}
                                    <tr style={{ background: '#f8fafc' }}>
                                        <td style={{ padding: '1rem', fontWeight: '800', textAlign: 'right' }}>Total Paid:</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '900', fontSize: '1.2rem', color: 'var(--primary)' }}>₹{booking.totalAmount}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pre-analytics & Precautions Section */}
                    <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '1.5rem', borderRadius: '16px', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#92400e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertCircle size={18} /> Clinical Instructions & Precautions
                        </h3>
                        
                        <div style={{ display: 'grid', gap: '1rem', fontSize: '0.9rem' }}>
                            <div>
                                <div style={{ fontWeight: '800', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <FlaskConical size={14} /> Collection Items Required (For Phlebotomist):
                                </div>
                                <div style={{ color: '#b45309', marginTop: '0.2rem', paddingLeft: '1.2rem' }}>{instructions.items}</div>
                            </div>
                            <div>
                                <div style={{ fontWeight: '800', color: '#92400e' }}>🍽️ Food & Fasting:</div>
                                <div style={{ color: '#b45309', marginTop: '0.2rem', paddingLeft: '1.2rem' }}>{instructions.food}</div>
                            </div>
                            <div>
                                <div style={{ fontWeight: '800', color: '#92400e' }}>⚠️ General Precautions:</div>
                                <div style={{ color: '#b45309', marginTop: '0.2rem', paddingLeft: '1.2rem' }}>{instructions.precautions}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: '600' }}>
                        This is an electronically generated receipt and does not require a physical signature.<br/>
                        For support, contact support@diagnolabs.in or call 1800-XXX-XXXX.
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ReceiptModal;
