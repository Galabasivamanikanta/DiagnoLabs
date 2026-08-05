import React from 'react';
import { Users, FileText, CheckCircle, Clock, MapPin, Navigation, Truck, Package } from 'lucide-react';

export const DoctorDashboard = ({ user }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '12px' }}>
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-main)' }}>12</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700' }}>Patients Today</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.75rem', background: '#fef3c7', color: '#d97706', borderRadius: '12px' }}>
                            <FileText size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-main)' }}>5</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700' }}>Pending Reports</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.75rem', background: '#dcfce7', color: '#16a34a', borderRadius: '12px' }}>
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-main)' }}>8</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700' }}>Consultations</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={20} className="text-primary" /> Today's Appointments
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'var(--surface-alt)', borderRadius: '16px', border: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '48px', height: '48px', background: 'var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                                    P{i}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>Patient Name {i}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Follow-up Consultation</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ padding: '0.4rem 1rem', background: 'white', border: '1px solid var(--border)', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '700' }}>
                                    10:30 AM
                                </span>
                                <button className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>View History</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const PhlebotomistDashboard = ({ user }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', color: 'white' }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: 'white', opacity: 0.9 }}>Active Collection</h3>
                    <div style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '0.5rem' }}>2 / 10</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Samples collected today</div>
                </div>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)' }}>Next Stop</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-light)', marginBottom: '1rem', fontWeight: '600' }}>
                        <MapPin size={18} className="text-primary" />
                        123 Healthcare Ave, Block A
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}>
                        <Navigation size={18} /> Navigate
                    </button>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Package size={20} className="text-primary" /> Home Collection Queue
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[1, 2].map(i => (
                        <div key={i} style={{ padding: '1.25rem', background: 'var(--surface-alt)', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>Order #DL-00{i}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Complete Blood Count (CBC)</div>
                                </div>
                                <span style={{ padding: '0.4rem 1rem', background: '#fef3c7', color: '#d97706', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '800', height: 'fit-content' }}>
                                    Pending Collection
                                </span>
                            </div>
                            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '0.6rem' }}>Scan Sample Barcode</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const DeliveryPartnerDashboard = ({ user }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--surface), var(--surface-alt))' }}>
                <div style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Truck size={40} />
                </div>
                <h2 style={{ marginBottom: '0.5rem' }}>Active Route Assigned</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                    You have 5 sample containers to deliver from Regional Center A to Apollo Diagnostics Main Hub.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}><Navigation size={18} /> Start Navigation</button>
                    <button className="btn btn-outline" style={{ padding: '0.8rem 2rem' }}>View Manifest</button>
                </div>
            </div>
        </div>
    );
};
