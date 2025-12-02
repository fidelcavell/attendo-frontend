import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useJwtExpiryWatcher from "@/hooks/useJwtExpiry";
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

  if (expired) {
    return (
      <AlertDialog open={expired}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sesi berakhir</AlertDialogTitle>
            <AlertDialogDescription>
              Sesi login Anda telah berakhir. Silakan masuk kembali.
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
