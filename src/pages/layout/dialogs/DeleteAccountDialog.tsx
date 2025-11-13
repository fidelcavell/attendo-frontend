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
import { useLoginContext } from "@/hooks/useLogin";
import type { AxiosError } from "axios";
import { useState } from "react";

interface DeleteAccountDialogProps {
  isOpen: boolean;
  setIsOpen: (value: React.SetStateAction<boolean>) => void;
  setResponse: (
    value: React.SetStateAction<{
      success: boolean;
      message: string;
    } | null>
  ) => void;
  setResponseDialog: (value: React.SetStateAction<boolean>) => void;
  setLastAction: React.Dispatch<
    React.SetStateAction<"email" | "password" | "logout" | "delete" | null>
  >;
}

export default function DeleteAccountDialog({
  isOpen,
  setIsOpen,
  setResponse,
  setResponseDialog,
  setLastAction,
}: DeleteAccountDialogProps) {
  const { currentUser } = useLoginContext();
  const [isLoading, setIsLoading] = useState(false);

  const onDeleteAccount = async () => {
    setResponse(null);
    setIsLoading(true);

    try {
      const response = await api.put(
        `/user/delete-account/${currentUser?.username}`
      );
      setResponse(response.data);
      setLastAction("delete");
    } catch (exception) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      setResponse(error.response?.data || null);
    } finally {
      setIsLoading(false);
      setResponseDialog(true);
    }
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmation</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure to <span className="font-bold">PERMANENT DELETE</span>{" "}
            your account ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => onDeleteAccount()}>
            {isLoading ? (
              <>
                <Spinner className="size-4 mr-2" /> Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
