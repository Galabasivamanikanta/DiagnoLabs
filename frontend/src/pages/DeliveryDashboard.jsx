import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
    Truck, MapPin, Navigation, CheckCircle2, AlertCircle, Clock, 
    ShieldCheck, Camera, KeyRound, LogOut, Map, List, Phone, IndianRupee, X
} from 'lucide-react';

// Fix leaflet default icon in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [showPodModal, setShowPodModal] = useState(null);
  const [showIssueModal, setShowIssueModal] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [issueReason, setIssueReason] = useState('Recipient Unavailable');
  const [issueNote, setIssueNote] = useState('');

  // Mock Delivery Assignments
  const [deliveries, setDeliveries] = useState([
    { id: 'DEL-501', recipient: 'Apollo Diagnostics Lab', type: 'Sample Transport (Blood/Urine)', address: 'Gachibowli Main Rd, Hyderabad', lat: 17.4401, lng: 78.3489, phone: '+91 98765 43210', status: 'In Transit', payout: 120 },
    { id: 'DEL-502', recipient: 'Rahul Sharma', type: 'Physical Lab Report', address: 'Plot 42, Jubilee Hills, Hyderabad', lat: 17.4319, lng: 78.4071, phone: '+91 91234 56789', status: 'Assigned', payout: 80 },
    { id: 'DEL-503', recipient: 'Vijaya Diagnostic Center', type: 'Supervised Sample Vial', address: 'Secunderabad Station Rd', lat: 17.4399, lng: 78.4983, phone: '+91 99887 76655', status: 'Delivered', payout: 150 }
  ]);

  const handleLogout = () => {
    logout();
    navigate('/adminlogin');
  };

  const handleStatusChange = (id, newStatus) => {
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    alert(`Delivery [${id}] status updated to: ${newStatus}`);
  };

  const handlePodSubmit = (e) => {
    e.preventDefault();
    if (otpInput.length < 4) return alert("Please enter valid 4-digit OTP from recipient.");
    alert(`Proof of Delivery VERIFIED for ${showPodModal.recipient}! Status marked Delivered. Payout credited.`);
    setDeliveries(prev => prev.map(d => d.id === showPodModal.id ? { ...d, status: 'Delivered' } : d));
    setShowPodModal(null);
    setOtpInput('');
  };

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    alert(`Delivery issue reported for ${showIssueModal.recipient}! Reason: [${issueReason}]. Front Desk notified to resolve.`);
    setShowIssueModal(null);
    setIssueNote('');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif", paddingBottom: '32px' }}>
      {/* Top Mobile Bar */}
      <header style={{ background: '#003366', color: 'white', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Truck size={24} color="#38bdf8" />
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>DiagnoLabs Delivery</h2>
            <span style={{ fontSize: '0.7rem', color: '#93c5fd' }}>Field Logistics Agent</span>
          </div>
        </div>
                      <button onClick={() => navigate('/admin/profile')} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
                View Full Profile
              </button>
<button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '6px 12px', color: 'white', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
          Logout
        </button>
      </header>

      {/* Main Container */}
      <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
        {/* Top Field KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'white', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Active Deliveries</span>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#003366', marginTop: '2px' }}>{deliveries.filter(d => d.status !== 'Delivered').length}</div>
          </div>
          <div style={{ background: 'white', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Completed Drops</span>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#059669', marginTop: '2px' }}>{deliveries.filter(d => d.status === 'Delivered').length}</div>
          </div>
        </div>

        {/* View Mode Toggle Switch */}
        <div style={{ display: 'flex', background: '#e2e8f0', padding: '4px', borderRadius: '12px', marginBottom: '20px' }}>
          <button onClick={() => setViewMode('list')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '10px', background: viewMode === 'list' ? 'white' : 'transparent', color: viewMode === 'list' ? '#003366' : '#64748b', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <List size={16} /> List View
          </button>
          <button onClick={() => setViewMode('map')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '10px', background: viewMode === 'map' ? 'white' : 'transparent', color: viewMode === 'map' ? '#003366' : '#64748b', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Map size={16} /> Route Map
          </button>
        </div>

        {/* Map View */}
        {viewMode === 'map' && (
          <div style={{ height: '350px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
            <MapContainer center={[17.4401, 78.3489]} zoom={11} style={{ width: '100%', height: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {deliveries.map(d => (
                <Marker key={d.id} position={[d.lat, d.lng]}>
                  <Popup>
                    <strong>{d.recipient}</strong><br/>{d.type}<br/>Status: {d.status}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {/* Deliveries List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {deliveries.map(item => (
            <div key={item.id} style={{ background: 'white', borderRadius: '16px', padding: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: '800', color: '#003366', fontSize: '0.85rem' }}>{item.id}</span>
                <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', background: item.status === 'Delivered' ? '#dcfce7' : (item.status === 'In Transit' ? '#e0f2fe' : '#fef3c7'), color: item.status === 'Delivered' ? '#166534' : (item.status === 'In Transit' ? '#0369a1' : '#92400e') }}>
                  {item.status}
                </span>
              </div>

              <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>{item.recipient}</h3>
              <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '700', marginBottom: '8px' }}>{item.type}</div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.8rem', color: '#475569', marginBottom: '14px' }}>
                <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#003366' }} />
                <span>{item.address}</span>
              </div>

              {/* Action Buttons Toolbar */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', padding: '8px 14px', background: '#003366', color: 'white', borderRadius: '10px', fontWeight: '800', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Navigation size={14} /> Maps Nav
                </a>

                {item.status === 'Assigned' && (
                  <button onClick={() => handleStatusChange(item.id, 'In Transit')} style={{ padding: '8px 14px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                    Mark Picked Up
                  </button>
                )}

                {item.status === 'In Transit' && (
                  <button onClick={() => setShowPodModal(item)} style={{ padding: '8px 14px', background: '#059669', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <KeyRound size={14} /> Deliver with OTP
                  </button>
                )}

                {item.status !== 'Delivered' && (
                  <button onClick={() => setShowIssueModal(item)} style={{ padding: '8px 12px', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', borderRadius: '10px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                    Issue
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proof of Delivery OTP Modal */}
      {showPodModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 12px', color: '#0f172a', fontWeight: '800' }}>Confirm Proof of Delivery</h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748b' }}>Enter 4-digit recipient OTP or upload handover photo for {showPodModal.recipient}.</p>

            <form onSubmit={handlePodSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>RECIPIENT VERIFICATION OTP</label>
                <input type="text" maxLength="4" required value={otpInput} onChange={e => setOtpInput(e.target.value)} placeholder="e.g. 4892" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '4px', fontWeight: '800' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowPodModal(null)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#059669', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Verify & Complete</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {showIssueModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 12px', color: '#dc2626', fontWeight: '800' }}>Report Delivery Issue</h3>
            <form onSubmit={handleIssueSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>REASON FOR NON-DELIVERY</label>
                <select value={issueReason} onChange={e => setIssueReason(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', outline: 'none', background: 'white', fontWeight: '700' }}>
                  <option>Recipient Unavailable / Phone Unreachable</option>
                  <option>Incorrect or Untraceable Address</option>
                  <option>Item Damaged / Sample Leakage</option>
                  <option>Recipient Refused Handover</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowIssueModal(null)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#dc2626', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Transmit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
