import { useLoginContext } from "@/hooks/useLogin";
import type { ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";

interface RoleRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoleRoute({
  children,
  allowedRoles,
}: RoleRouteProps) {
  const { token, currentUser, currentStore } = useLoginContext();
  const { storeId } = useParams();

  if (!token) {
    return <Navigate to="/sign-in" replace />;
  }

  if (currentUser == undefined) return;

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/access-denied" />;
  }

  if (storeId && currentStore && currentStore?.id.toString() !== storeId) {
    return <Navigate to="/access-denied" />;
  }

  return <>{children}</>;
}
