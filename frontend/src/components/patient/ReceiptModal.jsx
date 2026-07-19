import React from 'react';
import { X, Download, CheckCircle2, Clock, FlaskConical, AlertCircle, Building2, FileText, Shield, User } from 'lucide-react';
import BrandLogo from '../BrandLogo';

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
    const receiptDate = new Date(booking.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '1.5rem', fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif"
        }}>
            <style>{`
                .rcpt-scroll::-webkit-scrollbar { width: 5px; }
                .rcpt-scroll::-webkit-scrollbar-track { background: #f1f5f9; }
                .rcpt-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                @media print {
                    body * { visibility: hidden !important; }
                    .receipt-print, .receipt-print * { visibility: visible !important; }
                    .receipt-print { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className="receipt-print rcpt-scroll" style={{
                background: '#ffffff',
                borderRadius: '20px',
                width: '100%', maxWidth: '700px',
                maxHeight: '92vh', overflowY: 'auto',
                boxShadow: '0 32px 80px rgba(0,51,102,0.18), 0 0 0 1px rgba(0,51,102,0.08)',
            }}>
                {/* ── HEADER ── */}
                <div style={{
                    background: 'linear-gradient(135deg, #003366 0%, #002244 100%)',
                    padding: '1.75rem 2rem',
                    borderRadius: '20px 20px 0 0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    {/* Brand */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '12px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BrandLogo size={38} />
                        </div>
                        <div>
                            <div style={{ fontWeight: '900', fontSize: '1.25rem', color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>DiagnoLabs</div>
                            <div style={{ fontSize: '0.6rem', color: '#c5a059', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '3px' }}>Clinical Discovery</div>
                        </div>
                    </div>

                    {/* Right side */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                        <div className="no-print" style={{ display: 'flex', gap: '0.6rem' }}>
                            <button onClick={() => window.print()} style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                background: '#c5a059', color: 'white', border: 'none',
                                borderRadius: '10px', padding: '0.45rem 1rem',
                                fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer'
                            }}>
                                <Download size={13} /> Download PDF
                            </button>
                            <button onClick={onClose} style={{
                                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '50%', width: '32px', height: '32px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: '#ffffff'
                            }}>
                                <X size={15} />
                            </button>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '900', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Official Receipt</div>
                            <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#c5a059', fontWeight: '700', letterSpacing: '0.04em', marginTop: '2px' }}>{bookingId}</div>
                        </div>
                    </div>
                </div>

                {/* ── STATUS STRIP ── */}
                <div style={{
                    background: '#059669',
                    padding: '0.65rem 2rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={15} color="white" />
                        <span style={{ fontWeight: '800', fontSize: '0.82rem', color: 'white', letterSpacing: '0.06em' }}>
                            {booking.paymentStatus === 'Paid' ? 'PAYMENT CONFIRMED' : booking.paymentStatus?.toUpperCase()}
                        </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>{receiptDate}</span>
                </div>

                <div style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* ── TRACKING STEPPER ── */}
                    <div className="no-print" style={{ background: '#f0f7ff', borderRadius: '14px', padding: '1.25rem 1.5rem', border: '1px solid #e0eeff' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: '800', color: '#003366', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1rem', opacity: 0.6 }}>Booking Progress</div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '13px', left: '5%', right: '5%', height: '2px', background: '#dce8f5', zIndex: 1 }} />
                            <div style={{ position: 'absolute', top: '13px', left: '5%', width: `${currentStageIdx >= 0 ? (currentStageIdx / (STAGES.length - 1)) * 90 : 0}%`, height: '2px', background: '#059669', zIndex: 2, transition: 'width 0.5s ease' }} />
                            {STAGES.map((stage, idx) => {
                                const done = idx <= currentStageIdx;
                                const curr = idx === currentStageIdx;
                                return (
                                    <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, flex: 1 }}>
                                        <div style={{
                                            width: '26px', height: '26px', borderRadius: '50%',
                                            background: done ? '#059669' : 'white',
                                            border: `2px solid ${done ? '#059669' : '#dce8f5'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: curr ? '0 0 0 4px rgba(5,150,105,0.15)' : 'none'
                                        }}>
                                            {done ? <CheckCircle2 size={13} color="white" /> : <Clock size={11} color="#94a3b8" />}
                                        </div>
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.62rem', fontWeight: '700', textAlign: 'center', color: done ? '#059669' : '#94a3b8', lineHeight: 1.3 }}>{stage}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── TRANSACTION REFERENCE ── */}
                    <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1.25rem 1.5rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                            <FileText size={14} color="#003366" />
                            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#003366', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7 }}>Transaction Reference</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', fontSize: '0.8rem' }}>
                            <div>
                                <span style={{ color: '#94a3b8', display: 'block', marginBottom: '0.25rem', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase' }}>Booking ID</span>
                                <span style={{ fontWeight: '700', color: '#0f172a', fontFamily: 'monospace', fontSize: '0.85rem' }}>{bookingId}</span>
                            </div>
                            <div>
                                <span style={{ color: '#94a3b8', display: 'block', marginBottom: '0.25rem', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase' }}>Transaction ID</span>
                                <span style={{ fontWeight: '700', color: '#0f172a', fontFamily: 'monospace', fontSize: '0.85rem' }}>{booking.razorpayPaymentId || 'N/A'}</span>
                            </div>
                            <div>
                                <span style={{ color: '#94a3b8', display: 'block', marginBottom: '0.25rem', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase' }}>Order ID</span>
                                <span style={{ fontWeight: '700', color: '#0f172a', fontFamily: 'monospace', fontSize: '0.85rem' }}>{booking.razorpayOrderId || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── TRANSACTION + PATIENT + LAB GRID ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        {/* Patient & Booking Details */}
                        <div style={{ background: '#f0f7ff', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e0eeff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.8rem' }}>
                                <User size={13} color="#003366" />
                                <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#003366', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7 }}>Patient & Schedule</span>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>Name:</span>
                                    <span style={{ fontWeight: '700', color: '#0f172a' }}>{user?.name || booking.patient?.name}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>Customer ID:</span>
                                    <span style={{ fontWeight: '700', color: '#0f172a', fontFamily: 'monospace' }}>{user?.customerId || 'DL-202607-md'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>Phone:</span>
                                    <span style={{ fontWeight: '700', color: '#0f172a' }}>{user?.phone || booking.patient?.phone || 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>Email:</span>
                                    <span style={{ fontWeight: '700', color: '#0f172a' }}>{user?.email || booking.patient?.email || 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>Appointment:</span>
                                    <span style={{ fontWeight: '700', color: '#059669' }}>
                                        {new Date(booking.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} ({booking.appointmentTime})
                                    </span>
                                </div>
                                <div style={{ borderTop: '1px dashed #dbeafe', marginTop: '0.4rem', paddingTop: '0.4rem' }}>
                                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Collection Address:</span>
                                    <span style={{ fontWeight: '700', color: '#334155', lineHeight: 1.4, display: 'block' }}>{booking.sampleCollectionAddress}</span>
                                </div>
                            </div>
                        </div>

                        {/* Lab Details */}
                        <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.8rem' }}>
                                <Building2 size={13} color="#003366" />
                                <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#003366', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7 }}>Assigned Laboratory</span>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>Lab Name:</span>
                                    <span style={{ fontWeight: '700', color: '#0f172a' }}>{booking.lab?.name || 'DiagnoLabs Partner'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>Phone:</span>
                                    <span style={{ fontWeight: '700', color: '#0f172a' }}>{booking.lab?.phone || '1800-120-4121'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>Email:</span>
                                    <span style={{ fontWeight: '700', color: '#0f172a' }}>{booking.lab?.email || 'support@diagnolabs.in'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>Hours:</span>
                                    <span style={{ fontWeight: '700', color: '#0f172a' }}>
                                        {booking.lab?.openingTime || '08:00 AM'} - {booking.lab?.closingTime || '08:00 PM'}
                                    </span>
                                </div>
                                <div style={{ borderTop: '1px dashed #e2e8f0', marginTop: '0.4rem', paddingTop: '0.4rem' }}>
                                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Lab Location:</span>
                                    <span style={{ fontWeight: '700', color: '#334155', lineHeight: 1.4, display: 'block' }}>
                                        {booking.lab?.address || 'DAA Network Hub, India'}, {booking.lab?.city || ''} {booking.lab?.pincode || ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── TEST DETAILS ── */}
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
                        <div style={{ background: '#003366', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Test Description</span>
                            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Amount</span>
                        </div>
                        {booking.testDetails?.map((t, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: 'white' }}>
                                <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>{t.testName}</span>
                                <span style={{ fontWeight: '700', fontFamily: 'monospace', fontSize: '0.88rem', color: '#475569' }}>₹{t.price}</span>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: '#f0f7ff', borderTop: '2px solid #003366' }}>
                            <span style={{ fontWeight: '800', fontSize: '0.85rem', color: '#003366' }}>TOTAL PAID</span>
                            <span style={{ fontWeight: '900', fontFamily: 'monospace', fontSize: '1.2rem', color: '#003366' }}>₹{booking.totalAmount}</span>
                        </div>
                    </div>

                    {/* ── CLINICAL INSTRUCTIONS ── */}
                    <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '14px', padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <AlertCircle size={14} color="#d97706" />
                            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Clinical Instructions & Precautions</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.82rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#92400e', fontWeight: '800', marginBottom: '0.2rem' }}>
                                    <FlaskConical size={12} /> Collection Items:
                                </div>
                                <div style={{ color: '#b45309', paddingLeft: '1.1rem', lineHeight: 1.5 }}>{instructions.items}</div>
                            </div>
                            <div>
                                <div style={{ color: '#92400e', fontWeight: '800', marginBottom: '0.2rem' }}>🍽️ Food & Fasting:</div>
                                <div style={{ color: '#b45309', paddingLeft: '1.1rem', lineHeight: 1.5 }}>{instructions.food}</div>
                            </div>
                            <div>
                                <div style={{ color: '#92400e', fontWeight: '800', marginBottom: '0.2rem' }}>⚠️ Precautions:</div>
                                <div style={{ color: '#b45309', paddingLeft: '1.1rem', lineHeight: 1.5 }}>{instructions.precautions}</div>
                            </div>
                        </div>
                    </div>

                    {/* ── FOOTER ── */}
                    <div style={{ textAlign: 'center', paddingTop: '0.25rem', borderTop: '1px dashed #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.72rem', fontWeight: '700', marginBottom: '0.3rem' }}>
                            <Shield size={11} /> Digitally verified by DiagnoLabs Clinical Network
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: '600' }}>
                            Electronically generated — no physical signature required. &nbsp;|&nbsp; support@diagnolabs.in
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiptModal;
