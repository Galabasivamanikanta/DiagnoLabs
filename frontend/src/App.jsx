import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import LabDashboard from './pages/LabDashboard';
import UserProfile from './pages/UserProfile';
import BookingHistory from './pages/BookingHistory';
import Labs from './pages/Labs';
import LabDetails from './pages/LabDetails';
import NearbySearch from './pages/NearbySearch';
import IndiaLabsFinder from './pages/IndiaLabsFinder';
import { AuthProvider } from './context/AuthContext';
import DemoGuard from './components/DemoGuard';
import Demo from './pages/Demo';
import { useLocation } from 'react-router-dom';

// Utility Portals (Admin & Lab)
const SpecializedLogin = ({ title }) => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', paddingTop: '8rem' }}>
      <div className="glass-card shadow-premium" style={{ padding: '5rem', textAlign: 'center', background: 'white', maxWidth: '500px' }}>
        <div style={{ width: '80px', height: '80px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
          <ShieldCheck size={40} />
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>{title}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontWeight: '500' }}>Please use the centralized gateway to access the secure clinical environment.</p>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: '1.2rem', borderRadius: '14px' }}>Enter Portal Gateway</button>
        </div>
      </div>
    </div>
  );
};

const LabLogin = () => <SpecializedLogin title="Lab Partner Portal" />;
const AdminLogin = () => <SpecializedLogin title="DAA Administration" />;

const MainLayout = () => {
  const location = useLocation();
  const isDemoRoute = location.pathname === '/demo';

  return (
    <>
      {!isDemoRoute && <Navbar />}
      {!isDemoRoute && <ChatBot />}
      <Routes>
        <Route path="/demo" element={<Demo />} />
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/labs" element={<Labs />} />
        <Route path="/lab/:id" element={<LabDetails />} />
        <Route path="/nearby-search" element={<NearbySearch />} />
        <Route path="/india-labs-finder" element={<IndiaLabsFinder />} />
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />
        {/* Patient Portal - Protected */}
        <Route path="/patient/dashboard" element={<Navigate to="/patient/history" replace />} />
        
        <Route path="/patient/profile" element={
          <ProtectedRoute roles={['patient']}>
            <UserProfile />
          </ProtectedRoute>
        } />

        <Route path="/patient/history" element={
          <ProtectedRoute roles={['patient']}>
            <BookingHistory />
          </ProtectedRoute>
        } />

        {/* Checkout - Protected for Patients */}
        <Route path="/checkout" element={
          <ProtectedRoute roles={['patient']}>
            <Checkout />
          </ProtectedRoute>
        } />

        {/* Lab Portal */}
        <Route path="/partner/login" element={<LabLogin />} />
        <Route path="/partner/dashboard" element={<LabDashboard />} />

        {/* Admin Portal - Protected */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute roles={[
            'admin', 'employee', 'doctor', 'phlebotomist', 'nurse', 'receptionist', 
            'inventory_manager', 'finance_manager', 'marketing_head', 'support_staff', 
            'delivery_partner', 'quality_auditor', 'it_specialist'
          ]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <DemoGuard>
          <MainLayout />
        </DemoGuard>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
