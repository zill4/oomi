import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { token, isInitialized } = useAuth();

  // Show loading or nothing while checking authentication
  if (!isInitialized) {
    return null;
  }

  if (token) {
    // Redirect to profile if already authenticated
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
} 