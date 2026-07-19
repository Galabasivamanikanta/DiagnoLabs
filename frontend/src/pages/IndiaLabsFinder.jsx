import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import Navbar from '../components/Navbar';
import {
  MapPin,
  Search,
  TrendingUp,
  Phone,
  Building2,
  ChevronRight,
  Loader2
} from 'lucide-react';

const IndiaLabsFinder = () => {
  const navigate = useNavigate();

  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const isPincodeValid = useMemo(() => {
    return !pincode || /^\d{6}$/.test(pincode);
  }, [pincode]);

  const onSearch = async () => {
    setError('');
    setLoading(true);
    setResults([]);

    try {
      if (!state && !city && !pincode) {
        setError('Please enter State + City or Pincode.');
        return;
      }
      if (!isPincodeValid) {
        setError('Pincode must be 6 digits.');
        return;
      }

      let url = '';
      if (pincode) {
        url = `${API_BASE_URL}/api/india-labs/find-by-pincode?pincode=${encodeURIComponent(pincode)}`;
      } else {
        url = `${API_BASE_URL}/api/india-labs/find-by-location?state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}`;
      }

      const res = await axios.get(url);
      setResults(res.data || []);

      if ((res.data || []).length === 0) {
        setError('No labs found for this location.');
      }
    } catch {
      setError('Failed to fetch lab details.');
    } finally {
      setLoading(false);
    }
  };

  const pageTitle = useMemo(() => {
    if (pincode) return `Labs in #${pincode}`;
    if (state && city) return `Labs in ${city}, ${state}`;
    return 'India Labs Finder';
  }, [state, city, pincode]);

  useEffect(() => {
    document.title = 'DiagnoLabs | India Labs Finder';
  }, []);

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>
              <Building2 size={16} /> India Medical Labs Finder
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: '900', margin: '0.5rem 0 0.5rem', lineHeight: '1.1' }}>{pageTitle}</h1>
            <p style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '1.1rem', margin: 0, maxWidth: 720 }}>
              Select a location to see labs with their available diagnostic tests.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', padding: '0.6rem 1.2rem', borderRadius: 999, border: '1px solid var(--border)', background: 'white' }}>
              <TrendingUp size={18} /> <span style={{ fontWeight: 900 }}>{results.length}</span> labs
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2.5rem', background: 'white', border: '1px solid var(--border)', borderRadius: 28, padding: '1.8rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>State</label>
              <input value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. Andhra Pradesh" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>City</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Visakhapatnam" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Pincode (optional)</label>
              <input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit" style={inputStyle} />
              {!isPincodeValid && <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.85rem', marginTop: 6 }}>Invalid pincode.</div>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={onSearch} className="btn btn-primary" style={{ padding: '1.1rem 2.2rem', borderRadius: 18, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10 }}>
              {loading ? <Loader2 size={18} className="spin" /> : <Search size={18} />} Search Labs
            </button>
            <button
              onClick={() => { setState(''); setCity(''); setPincode(''); setResults([]); setError(''); }}
              className="btn"
              style={{ padding: '1.1rem 1.6rem', borderRadius: 18, fontWeight: 900, border: '1px solid var(--border)', background: 'white', color: 'var(--primary)' }}
            >
              Reset
            </button>
            {error && <div style={{ color: '#ef4444', fontWeight: 900 }}>{error}</div>}
          </div>
        </div>

        <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.8rem' }}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 28, padding: '1.8rem', minHeight: 220 }} />
            ))
          ) : results.length ? (
            results.map(({ lab, tests }, idx) => {
              const representativePincode = lab.pincode || (lab.servicePincodes?.[0] || '');
              return (
                <div key={lab._id || idx} className="glass-card" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 28, padding: '1.8rem', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.55rem', fontWeight: '900', color: '#0f172a' }}>{lab.name}</h3>
                      <div style={{ marginTop: 10, color: '#475569', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <MapPin size={14} /> {lab.city}{lab.state ? `, ${lab.state}` : ''}{representativePincode ? ` • ${representativePincode}` : ''}
                      </div>
                      <div style={{ marginTop: 8, color: '#64748b', fontWeight: 700, fontSize: '0.95rem' }}>{lab.address}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ padding: '0.35rem 0.7rem', borderRadius: 999, background: lab.isVerified ? '#eff6ff' : '#fefce8', border: '1px solid var(--border)', fontWeight: 900, color: lab.isVerified ? '#1d4ed8' : '#ca8a04' }}>
                        {lab.isVerified ? 'Verified Partner' : 'Community'}
                      </div>
                      <div style={{ marginTop: 10, fontWeight: 900, color: '#0f172a' }}>{tests.length} tests</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.2rem', display: 'grid', gridTemplateColumns: '1fr', gap: '0.6rem' }}>
                    {(tests || []).slice(0, 8).map((t) => (
                      <div key={t._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '0.75rem 0.9rem', borderRadius: 16, border: '1px solid #eef2f6', background: '#f8fafc' }}>
                        <div style={{ fontWeight: 900, color: '#0f172a', fontSize: '0.95rem' }}>{t.testName}</div>
                        <div style={{ fontWeight: 900, color: '#0ea5e9', whiteSpace: 'nowrap' }}>₹{t.discountedPrice || t.price}</div>
                      </div>
                    ))}
                    {tests.length > 8 && (
                      <div style={{ color: '#64748b', fontWeight: 800, fontSize: '0.9rem' }}>+ {tests.length - 8} more tests</div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.4rem', alignItems: 'center' }}>
                    <button
                      onClick={() => navigate(`/lab/${lab._id}`)}
                      className="btn"
                      style={{ flex: 1, background: 'var(--primary)', border: 'none', color: 'white', borderRadius: 18, padding: '0.9rem 1rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                      View Lab <ChevronRight size={18} />
                    </button>
                    {lab.phone && (
                      <a
                        href={`tel:${lab.phone}`}
                        className="btn"
                        style={{ width: 52, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 18, border: '1px solid var(--border)', background: 'white', color: 'var(--primary)' }}
                      >
                        <Phone size={18} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 1rem', background: 'white', borderRadius: 28, border: '1px solid var(--border)' }}>
              <div style={{ width: 90, height: 90, borderRadius: 24, background: 'var(--primary-light)', margin: '0 auto 1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={34} color='var(--primary)' />
              </div>
              <h3 style={{ fontWeight: 900, fontSize: '1.8rem', marginBottom: 10 }}>No labs to display</h3>
              <p style={{ color: '#64748b', fontWeight: 700, margin: 0 }}>Enter location details and hit Search Labs.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        input { outline: none; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '1rem 1rem',
  borderRadius: 18,
  border: '1px solid var(--border)',
  background: 'white',
  fontWeight: 700
};

export default IndiaLabsFinder;

