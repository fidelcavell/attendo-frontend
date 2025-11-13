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
import type { OvertimeApplication } from "@/data/dataTypes";
import type { AxiosError } from "axios";
import { useState } from "react";

interface DeleteOvertimeApplicationDialogProps {
  isOpen: boolean;
  setIsOpen: (value: React.SetStateAction<boolean>) => void;
  selectedOvertimeApplication: OvertimeApplication;
  setResponse: (
    value: React.SetStateAction<{
      success: boolean;
      message: string;
    } | null>
  ) => void;
  setResponseDialog: (value: React.SetStateAction<boolean>) => void;
  onRefresh: () => Promise<void>;
}

export default function DeleteOvertimeApplicationDialog({
  isOpen,
  setIsOpen,
  selectedOvertimeApplication,
  setResponse,
  setResponseDialog,
  onRefresh,
}: DeleteOvertimeApplicationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const onDelete = async () => {
    setIsLoading(true);
    try {
      const response = await api.delete(
        `/overtime/${selectedOvertimeApplication.id}`
      );
      setResponse(response.data);
      setIsOpen(false);
      onRefresh();
    } catch (exception) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      setResponse(error.response?.data || null);
      setResponseDialog(true);
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmation</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this overtime application? <br />{" "}
            This action cannot be <span className="font-semibold">UNDONE</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} disabled={isLoading}>
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
