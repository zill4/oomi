import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token, user, isInitialized } = useAuth();
  const location = useLocation();

  // Show loading or nothing while checking authentication
  if (!isInitialized) {
    return null;
  }

  if (!token) {
    // Redirect to home if not authenticated
    return <Navigate to="/" replace />;
  }

  // If user needs to complete onboarding and isn't already on the onboarding page
  if (user && (!user.firstName || !user.lastName) && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
} 