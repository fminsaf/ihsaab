import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../auth/authProvider";

const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <h1>Loading Ihsaab...</h1>;
  }

  if (!user) {
    return <Navigate to="/auth/sign-in" state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default ProtectedLayout;
