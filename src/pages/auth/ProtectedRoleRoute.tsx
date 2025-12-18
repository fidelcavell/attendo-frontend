import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useJwtExpiryWatcher, { isTokenExpired } from "@/hooks/useJwtExpiry";
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
  const { expired, acknowledgeExpiry } = useJwtExpiryWatcher();
  const { storeId } = useParams();

  // Expired -> To check JWT Token expired based on timer when user dont close the browser tab
  // isTokenExpired -> To check JWT Token expired when user try to enter specific route
  if (expired || isTokenExpired(token)) {
    localStorage.removeItem("JWT_TOKEN");
    localStorage.removeItem("USERNAME");

    return (
      <AlertDialog open={expired}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sesi berakhir</AlertDialogTitle>
            <AlertDialogDescription>
              Sesi login Anda telah berakhir. Silakan sign in kembali.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={acknowledgeExpiry}>
              Sign in
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Check JWT Token expire date and clear the local storage!
  if (isTokenExpired(token)) {
    localStorage.removeItem("JWT_TOKEN");
    localStorage.removeItem("USERNAME");
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
