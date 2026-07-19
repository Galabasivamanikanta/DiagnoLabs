import React from 'react';
import { X, Download, CheckCircle2, Clock, FlaskConical, AlertCircle, Building2, FileText, Shield } from 'lucide-react';

const ReceiptModal = ({ booking, onClose, user }) => {
    if (!booking) return null;

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
    const bookingId = `DH-${booking._id?.slice(-8).toUpperCase()}`;
    const receiptDate = new Date(booking.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const Row = ({ label, value, mono = false, highlight = false }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0', borderBottom: '1px dashed rgba(255,255,255,0.08)' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
            <span style={{ fontFamily: mono ? 'monospace' : 'inherit', fontSize: mono ? '0.82rem' : '0.88rem', fontWeight: '700', color: highlight ? '#4ade80' : '#f1f5f9', letterSpacing: mono ? '0.03em' : 'normal' }}>{value}</span>
        </div>
    );

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '1.5rem', fontFamily: "'Inter', 'Segoe UI', sans-serif"
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
                .receipt-scroll::-webkit-scrollbar { width: 4px; }
                .receipt-scroll::-webkit-scrollbar-track { background: #1e293b; }
                .receipt-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
                @media print {
                    body * { visibility: hidden !important; }
                    .receipt-print, .receipt-print * { visibility: visible !important; }
                    .receipt-print { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className="receipt-print receipt-scroll" style={{
                background: '#0f172a',
                borderRadius: '20px',
                width: '100%', maxWidth: '680px',
                maxHeight: '92vh', overflowY: 'auto',
                boxShadow: '0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
                color: '#f1f5f9'
            }}>
                {/* ── TOP HEADER ── */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 60%)',
                    padding: '1.75rem 2rem',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                }}>
                    <div>
                        <img src="/diagnolabs_logo.png" alt="DiagnoLabs" style={{ height: '36px', objectFit: 'contain', filter: 'brightness(1.3)' }} />
                        <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: '#64748b', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Official Digital Receipt</div>
                    </div>
                    <div className="no-print" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button onClick={() => window.print()} style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            background: '#2563eb', color: 'white', border: 'none',
                            borderRadius: '10px', padding: '0.5rem 1.1rem',
                            fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer'
                        }}>
                            <Download size={14} /> Download PDF
                        </button>
                        <button onClick={onClose} style={{
                            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '50%', width: '34px', height: '34px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#94a3b8'
                        }}>
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* ── STATUS BADGE ── */}
                <div style={{ padding: '1.25rem 2rem', background: '#0a1628', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80', animation: 'pulse 2s infinite' }} />
                        <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#4ade80', letterSpacing: '0.05em' }}>
                            {booking.paymentStatus === 'Paid' ? 'PAYMENT CONFIRMED' : booking.paymentStatus?.toUpperCase()}
                        </span>
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', color: '#64748b', fontWeight: '600' }}>
                        {receiptDate} &nbsp;|&nbsp; {bookingId}
                    </div>
                </div>

                <div style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* ── TRACKING STEPPER ── */}
                    <div className="no-print" style={{ background: '#1e293b', borderRadius: '14px', padding: '1.25rem 1.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Booking Progress</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '14px', left: '5%', right: '5%', height: '2px', background: '#334155', zIndex: 1 }} />
                            <div style={{ position: 'absolute', top: '14px', left: '5%', width: `${currentStageIdx >= 0 ? (currentStageIdx / (STAGES.length - 1)) * 90 : 0}%`, height: '2px', background: '#22c55e', zIndex: 2, transition: 'width 0.5s ease' }} />
                            {STAGES.map((stage, idx) => {
                                const done = idx <= currentStageIdx;
                                const curr = idx === currentStageIdx;
                                return (
                                    <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, flex: 1 }}>
                                        <div style={{
                                            width: '28px', height: '28px', borderRadius: '50%',
                                            background: done ? '#22c55e' : '#1e293b',
                                            border: `2px solid ${done ? '#22c55e' : '#334155'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: curr ? '0 0 0 4px rgba(34,197,94,0.2)' : 'none'
                                        }}>
                                            {done ? <CheckCircle2 size={14} color="white" /> : <Clock size={12} color="#475569" />}
                                        </div>
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', fontWeight: '700', textAlign: 'center', color: done ? '#22c55e' : '#475569', whiteSpace: 'nowrap' }}>{stage}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── TRANSACTION DETAILS ── */}
                    <div style={{ background: '#1e293b', borderRadius: '14px', padding: '1.25rem 1.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <FileText size={14} color="#3b82f6" />
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Transaction Details</span>
                        </div>
                        <Row label="Booking ID" value={bookingId} mono />
                        <Row label="Transaction ID" value={booking.razorpayPaymentId || 'N/A'} mono />
                        <Row label="UTR / Order ID" value={booking.razorpayOrderId || 'N/A'} mono />
                        <Row label="Date" value={receiptDate} />
                        <Row label="Status" value={booking.paymentStatus === 'Paid' ? 'PAID SUCCESSFULLY' : booking.paymentStatus} highlight />
                    </div>

                    {/* ── PATIENT + LAB ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ background: '#1e293b', borderRadius: '14px', padding: '1.25rem 1.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Patient</div>
                            <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#f1f5f9', marginBottom: '0.25rem' }}>{user?.name}</div>
                            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#475569', fontWeight: '600' }}>{user?.customerId || 'DL-XXXXXXXX'}</div>
                        </div>
                        <div style={{ background: '#1e293b', borderRadius: '14px', padding: '1.25rem 1.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                                <Building2 size={12} color="#64748b" />
                                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Assigned Lab</span>
                            </div>
                            <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#f1f5f9', lineHeight: '1.4' }}>{booking.lab?.name || 'DAA Network Lab'}</div>
                        </div>
                    </div>

                    {/* ── TEST DETAILS TABLE ── */}
                    <div style={{ background: '#1e293b', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ padding: '0.75rem 1.5rem', background: '#162032', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Test Description</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Amount</span>
                        </div>
                        {booking.testDetails?.map((t, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.9rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{t.testName}</span>
                                <span style={{ fontWeight: '700', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.88rem' }}>₹{t.price}</span>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem', background: '#162032', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                            <span style={{ fontWeight: '800', fontSize: '0.88rem', color: '#94a3b8' }}>TOTAL PAID</span>
                            <span style={{ fontWeight: '900', fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1rem', color: '#4ade80' }}>₹{booking.totalAmount}</span>
                        </div>
                    </div>

                    {/* ── CLINICAL INSTRUCTIONS ── */}
                    <div style={{ background: '#1c1a08', border: '1px solid #3d3000', borderRadius: '14px', padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <AlertCircle size={14} color="#fbbf24" />
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Clinical Instructions & Precautions</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: '700', marginBottom: '0.2rem' }}>
                                    <FlaskConical size={12} /> Collection Items:
                                </div>
                                <div style={{ color: '#d97706', paddingLeft: '1.1rem', lineHeight: '1.5' }}>{instructions.items}</div>
                            </div>
                            <div>
                                <div style={{ color: '#fbbf24', fontWeight: '700', marginBottom: '0.2rem' }}>🍽️ Food & Fasting:</div>
                                <div style={{ color: '#d97706', paddingLeft: '1.1rem', lineHeight: '1.5' }}>{instructions.food}</div>
                            </div>
                            <div>
                                <div style={{ color: '#fbbf24', fontWeight: '700', marginBottom: '0.2rem' }}>⚠️ Precautions:</div>
                                <div style={{ color: '#d97706', paddingLeft: '1.1rem', lineHeight: '1.5' }}>{instructions.precautions}</div>
                            </div>
                        </div>
                    </div>

                    {/* ── FOOTER ── */}
                    <div style={{ textAlign: 'center', padding: '0.5rem 0 0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#334155', fontSize: '0.72rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                            <Shield size={12} /> Digitally verified by DiagnoLabs Clinical Network
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#1e293b', fontWeight: '600' }}>
                            This is an electronically generated receipt. No physical signature required.
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#334155', marginTop: '0.2rem' }}>
                            support@diagnolabs.in &nbsp;|&nbsp; 1800-XXX-XXXX
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiptModal;
