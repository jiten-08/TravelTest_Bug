import { Navigate, useLocation } from 'react-router-dom';
import { getStoredSession } from '../utils/authSession.js';

function ProtectedRoute({ children }) {
  const location = useLocation();
  const session = getStoredSession();

  if (!session) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?from=${encodeURIComponent(from)}`} replace state={{ message: 'Please login to continue.' }} />;
  }

  return children;
}

export default ProtectedRoute;
