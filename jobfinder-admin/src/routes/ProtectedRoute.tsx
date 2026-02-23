import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("admin_token");
  const userRaw = localStorage.getItem("admin_user");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!userRaw) {
    return <Navigate to="/login" replace />;
  }

  let user: any = null;

  try {
    user = JSON.parse(userRaw);
  } catch {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
