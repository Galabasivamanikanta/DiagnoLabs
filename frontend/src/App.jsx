import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import AdminProfile from './pages/AdminProfile';
import BookingHistory from './pages/BookingHistory';
import Labs from './pages/Labs';
import LabDetails from './pages/LabDetails';
import NearbySearch from './pages/NearbySearch';
import IndiaLabsFinder from './pages/IndiaLabsFinder';
import SampleCollectorDashboard from './pages/SampleCollectorDashboard';
import { AuthProvider } from './context/AuthContext';
import DemoGuard from './components/DemoGuard';
import Demo from './pages/Demo';
import AdminLoginForm from './pages/AdminLogin';

import DoctorDashboard from './pages/DoctorDashboard';
import NurseDashboard from './pages/NurseDashboard';
import ReceptionDashboard from './pages/ReceptionDashboard';
import InventoryDashboard from './pages/InventoryDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import MarketingDashboard from './pages/MarketingDashboard';
import SupportDashboard from './pages/SupportDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import QualityDashboard from './pages/QualityDashboard';
import ITDashboard from './pages/ITDashboard';
import StaffDashboard from './pages/StaffDashboard';

const MainLayout = () => {
  const location = useLocation();
  const isDemoRoute = location.pathname === '/demo';
  const isStandaloneDashboard = [
    '/admin/dashboard',
    '/doctor/dashboard',
    '/nurse/dashboard',
    '/reception/dashboard',
    '/inventory/dashboard',
    '/finance/dashboard',
    '/marketing/dashboard',
    '/support/dashboard',
    '/delivery/dashboard',
    '/quality/dashboard',
    '/it/dashboard',
    '/partner/dashboard',
    '/collector/dashboard',
    '/employee/dashboard'
  ].some(path => location.pathname.startsWith(path));

  const showNavbar = !isDemoRoute && !isStandaloneDashboard;

  return (
    <>
      {showNavbar && <Navbar />}
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
        <Route path="/userlogin" element={<Login />} />

        <Route path="/register" element={<Register />} />
        {/* Patient Portal - Protected */}
        <Route path="/patient/dashboard" element={<Navigate to="/patient/history" replace />} />
        
        <Route path="/patient/profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />

        {/* Admin Profile Route - accessible by finance manager and admin */}
        <Route path="/admin/profile" element={
          <ProtectedRoute fallback="/adminlogin" roles={['admin', 'employee', 'doctor', 'nurse', 'receptionist', 'inventory_manager', 'finance_manager', 'marketing_head', 'support_staff', 'delivery_partner', 'quality_auditor', 'it_specialist', 'phlebotomist', 'lab_partner']}>
            <AdminProfile />
          </ProtectedRoute>
        } />

        <Route path="/patient/history" element={
          <ProtectedRoute>
            <BookingHistory />
          </ProtectedRoute>
        } />

        {/* Checkout - Protected for all authenticated users */}
        <Route path="/checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />

        {/* Lab Portal */}
        <Route path="/partner/login" element={<Navigate to="/adminlogin" replace />} />
        <Route path="/partner/dashboard" element={<LabDashboard />} />

        {/* Sample Collector Portal */}
        <Route path="/collector/dashboard" element={
          <ProtectedRoute fallback="/adminlogin" roles={['admin', 'phlebotomist', 'employee', 'nurse', 'lab_partner']}>
            <SampleCollectorDashboard />
          </ProtectedRoute>
        } />

        {/* Admin Portal - Protected */}
        <Route path="/adminlogin" element={<AdminLoginForm />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute fallback="/adminlogin" roles={[
            'admin', 'employee', 'doctor', 'phlebotomist', 'nurse', 'receptionist', 
            'inventory_manager', 'finance_manager', 'marketing_head', 'support_staff', 
            'delivery_partner', 'quality_auditor', 'it_specialist'
          ]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Role-specific Dashboards */}
        <Route path="/doctor/dashboard" element={<ProtectedRoute fallback="/adminlogin" roles={['doctor', 'admin']}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/nurse/dashboard" element={<ProtectedRoute fallback="/adminlogin" roles={['nurse', 'admin']}><NurseDashboard /></ProtectedRoute>} />
        <Route path="/reception/dashboard" element={<ProtectedRoute fallback="/adminlogin" roles={['receptionist', 'admin']}><ReceptionDashboard /></ProtectedRoute>} />
        <Route path="/inventory/dashboard" element={<ProtectedRoute fallback="/adminlogin" roles={['inventory_manager', 'admin']}><InventoryDashboard /></ProtectedRoute>} />
        <Route path="/finance/dashboard" element={<ProtectedRoute fallback="/adminlogin" roles={['finance_manager', 'admin']}><FinanceDashboard /></ProtectedRoute>} />
        <Route path="/marketing/dashboard" element={<ProtectedRoute fallback="/adminlogin" roles={['marketing_head', 'admin']}><MarketingDashboard /></ProtectedRoute>} />
        <Route path="/support/dashboard" element={<ProtectedRoute fallback="/adminlogin" roles={['support_staff', 'admin']}><SupportDashboard /></ProtectedRoute>} />
        <Route path="/delivery/dashboard" element={<ProtectedRoute fallback="/adminlogin" roles={['delivery_partner', 'admin']}><DeliveryDashboard /></ProtectedRoute>} />
        <Route path="/quality/dashboard" element={<ProtectedRoute fallback="/adminlogin" roles={['quality_auditor', 'admin']}><QualityDashboard /></ProtectedRoute>} />
        <Route path="/it/dashboard" element={<ProtectedRoute fallback="/adminlogin" roles={['it_specialist', 'admin']}><ITDashboard /></ProtectedRoute>} />
        <Route path="/employee/dashboard" element={<ProtectedRoute fallback="/adminlogin" roles={['employee', 'admin']}><StaffDashboard /></ProtectedRoute>} />

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
