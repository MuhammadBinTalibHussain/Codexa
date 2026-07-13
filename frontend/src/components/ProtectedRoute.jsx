import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = ({ children }) => {
  const { user, authLoading } = useAuth();

  if (authLoading) return <LoadingSpinner label="Checking your session..." />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;