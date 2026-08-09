import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner";

// Landing on "/" should never just dump the visitor into public content —
// it should send logged-in users straight to their dashboard, and anyone
// else to the login page. Public browsing still lives at "/explore".
const RootRedirect = () => {
  const { user, authLoading } = useAuth();

  if (authLoading) return <LoadingSpinner label="Loading..." />;
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
};

export default RootRedirect;
