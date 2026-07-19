import { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const DemoGuard = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;

        const hasViewedDemo = localStorage.getItem('hasViewedDemo') === 'true';
        const isDemoRoute = location.pathname === '/demo';
        const isPublicAuthRoute = ['/login', '/register', '/partner/login', '/admin/login'].includes(location.pathname);

        // If there is no logged-in user, and they haven't viewed the demo yet,
        // and they are not currently on the demo or auth pages, redirect to /demo
        if (!user && !hasViewedDemo && !isDemoRoute && !isPublicAuthRoute) {
            navigate('/demo', { replace: true });
        }
    }, [user, loading, location.pathname, navigate]);

    if (loading) {
        return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;
    }

    return children;
};

export default DemoGuard;
