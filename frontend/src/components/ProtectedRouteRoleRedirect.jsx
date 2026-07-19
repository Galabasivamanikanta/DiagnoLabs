import { useContext, useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * ProtectedRouteRoleRedirect
 * - Shows a toast-like inline banner (no external lib required)
 * - Redirects automatically to the correct dashboard based on user.role
 * - Works with React Router v6
 *
 * Usage:
 * <ProtectedRouteRoleRedirect
 *   allowedRoles={["patient"]}
 *   roleToPath={{ patient: "/patient/dashboard", admin: "/admin/dashboard", lab_partner: "/partner/dashboard" }}
 * >
 *   <PatientDashboard />
 * </ProtectedRouteRoleRedirect>
 */
const ProtectedRouteRoleRedirect = ({
  children,
  allowedRoles,
  roleToPath,
  deniedMessage = 'Access Denied! Redirecting...',
  redirectDelayMs = 900
}) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  const [showToast, setShowToast] = useState(false);
  const timerRef = useRef(null);


  const targetPath = (() => {

    const role = user?.role;
    if (!role || !roleToPath) return '/';
    return roleToPath[role] || '/';
  })();

    useEffect(() => {
    if (loading || !user) return;

    const allowed = Array.isArray(allowedRoles) && allowedRoles.length > 0
      ? allowedRoles.includes(user.role)
      : true;

    if (allowed) return;

    // Trigger toast using a microtask to avoid setting state inside effect body synchronously
    queueMicrotask(() => setShowToast(true));

    timerRef.current = setTimeout(() => {
      setShowToast(false);
    }, redirectDelayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loading, user, allowedRoles, redirectDelayMs]);


  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location, message: 'UnAuthorized User plz login in Portel' }}
      />
    );
  }

  const allowed = Array.isArray(allowedRoles) && allowedRoles.length > 0
    ? allowedRoles.includes(user.role)
    : true;

  if (!allowed) {
    // Render a toast banner immediately, then redirect after delay.
    return (
      <>
        {showToast && (
          <div
            style={{
              position: 'fixed',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.95)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: 12,
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              fontWeight: 800,
              letterSpacing: '-0.01em',
              maxWidth: 720,
              width: 'calc(100% - 24px)'
            }}
          >
            {deniedMessage}
          </div>
        )}

        <RedirectAfterDelay
          delayMs={redirectDelayMs}
          to={targetPath}
          replace
          state={{ from: location }}
        />
      </>
    );
  }

  return children;
};

const RedirectAfterDelay = ({ delayMs, to, replace, state }) => {
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShouldRedirect(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs, to, replace, state, location.key]);

  if (!shouldRedirect) return null;

  return <Navigate to={to} replace={replace} state={state} />;
};

export default ProtectedRouteRoleRedirect;

