import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective dashboard if logged in with wrong role
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "restaurant") return <Navigate to="/restaurant" replace />;
    if (user.role === "ngo") return <Navigate to="/ngo" replace />;
    if (user.role === "volunteer") return <Navigate to="/volunteer" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
