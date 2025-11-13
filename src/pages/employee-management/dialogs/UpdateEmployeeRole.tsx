import api from "@/api/api-config";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import type { Profile } from "@/data/dataTypes";
import type { AxiosError } from "axios";
import { useState } from "react";

interface UpdateRoleDialogProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedProfile: Profile;
  setResponse: (
    value: React.SetStateAction<{
      success: boolean;
      message: string;
    } | null>
  ) => void;
  setResponseDialog: React.Dispatch<React.SetStateAction<boolean>>;
  onRefresh: () => Promise<void>;
}

export default function UpdateEmployeeRole({
  isOpen,
  setIsOpen,
  selectedProfile,
  setResponse,
  setResponseDialog,
  onRefresh,
}: UpdateRoleDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const onUpdateRole = async () => {
    setResponse(null);
    setIsLoading(true);

    try {
      const response = await api.put(
        `/user/assign-role/${selectedProfile.username}`
      );
      setResponse(response.data);
    } catch (exception) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      setResponse(error.response?.data || null);
    } finally {
      setIsOpen(false);
      setResponseDialog(true);
      onRefresh();
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmation</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure to update{" "}
            <span className="font-bold">{selectedProfile.username}</span>'s role
            to{" "}
            <span className="font-bold">
              {selectedProfile.roleName === "ROLE_EMPLOYEE"
                ? "Admin"
                : "Employee"}
            </span>{" "}
            ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onUpdateRole}>
            {isLoading ? (
              <>
                <Spinner className="size-4 mr-2" /> Updating...
              </>
            ) : (
              "Update"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
