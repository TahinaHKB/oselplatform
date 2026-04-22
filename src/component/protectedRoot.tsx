import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../component/useAuth";
import Loading from "./Loading";

type Props = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const { User, emailVerified, loading } = useAuth();
  
    if (loading) return <Loading />;
  if (!User) return <Navigate to="/login" replace />;
  if (!emailVerified) return <Navigate to="/verify-email" replace />;

  return <>{children}</>;
}
