import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { userId, ready } = useAuth();

  if (!ready) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  return userId ? children : <Navigate to="/" replace />;
}