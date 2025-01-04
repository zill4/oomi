import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { token, isInitialized, user } = useAuth();
  const location = useLocation();

  // Show loading or nothing while checking authentication
  if (!isInitialized) {
    return null;
  }

  // Only redirect to profile if user is authenticated AND has completed onboarding
  if (token && user?.firstName && user?.lastName) {
    return <Navigate to="/profile" replace />;
  }

  // If user is authenticated but hasn't completed onboarding, redirect to onboarding
  if (token && (!user?.firstName || !user?.lastName) && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
} 