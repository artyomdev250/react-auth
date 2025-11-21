import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function RequireAuth() {
    const { accessToken, initializing } = useAuth();
    const location = useLocation();

    if (initializing) {
        return null;
    }

    if (!accessToken) {
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    return <Outlet />;
}

export default RequireAuth;
