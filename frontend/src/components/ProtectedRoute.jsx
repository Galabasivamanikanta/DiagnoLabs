import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location, message: "UnAuthorized User plz login in Portel" }} />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/login" replace state={{
            from: location,
            message: `Access Denied: You are logged in as '${user.role}' but this page is for '${roles.join(', ')}'. Please login with the correct account.`
        }} />;
    }

    return children;
};

export default ProtectedRoute;
