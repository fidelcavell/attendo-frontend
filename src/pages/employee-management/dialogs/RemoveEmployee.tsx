import api from "@/api/api-config";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import type { Profile } from "@/data/dataTypes";
import { useLoginContext } from "@/hooks/useLogin";
import type { AxiosError } from "axios";
import { useState } from "react";

interface RemoveEmployeeDialogProps {
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

export default function RemoveEmployeeDialog({
  isOpen,
  setIsOpen,
  selectedProfile,
  setResponse,
  setResponseDialog,
  onRefresh,
}: RemoveEmployeeDialogProps) {
  const { currentStore } = useLoginContext();
  const [isLoading, setIsLoading] = useState(false);

  const onRemoveEmployee = async () => {
    setResponse(null);
    setIsLoading(true);

    try {
      const response = await api.put(`/user/${selectedProfile.username}`);
      setResponse(response.data);
    } catch (exception) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      setResponse(error.response?.data || null);
    } finally {
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
            Are you sure you want to remove this{" "}
            <span className="font-bold">{selectedProfile.username}</span> from{" "}
            <span className="font-bold">{currentStore?.name}</span> ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onRemoveEmployee}>
            {isLoading ? (
              <>
                <Spinner className="size-4 mr-2" /> Removing...
              </>
            ) : (
              "Remove"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
