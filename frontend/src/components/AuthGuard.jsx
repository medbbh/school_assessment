import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const AuthGuard = ({ children, allowedRoles = [] }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/" />;
  }

  // e.g. user.role = "Direction" for both admin & supervisor
  if (allowedRoles.length > 0) {
    const userRole = user.role.toLowerCase(); // "direction"
    const allowedRolesLower = allowedRoles.map(r => r.toLowerCase());
    if (!allowedRolesLower.includes(userRole)) {
      return <Navigate to="/" />;
    }
  }

  return children;
};

export default AuthGuard;
