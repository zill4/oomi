import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token, isInitialized } = useAuth();

  // Show loading or nothing while checking authentication
  if (!isInitialized) {
    return null; // or return a loading spinner
  }

  if (!token) {
    console.log('No token found, redirecting to home');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
} 