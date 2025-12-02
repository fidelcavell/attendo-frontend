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
import type { LeaveApplication } from "@/types/dataTypes";
import type { AxiosError } from "axios";
import { useState } from "react";

interface DeleteLeaveApplicationDialogProps {
  isOpen: boolean;
  setIsOpen: (value: React.SetStateAction<boolean>) => void;
  selectedLeaveApplication: LeaveApplication;
  setResponse: (
    value: React.SetStateAction<{
      success: boolean;
      message: string;
    } | null>
  ) => void;
  setResponseDialog: (value: React.SetStateAction<boolean>) => void;
  onRefresh: () => Promise<void>;
}

export default function DeleteLeaveApplicationDialog({
  isOpen,
  setIsOpen,
  selectedLeaveApplication,
  setResponse,
  setResponseDialog,
  onRefresh,
}: DeleteLeaveApplicationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const onDeleteLeaveApplication = async () => {
    setIsLoading(true);
    try {
      const response = await api.delete(
        `/leave/${selectedLeaveApplication.id}`
      );
      setResponse(response.data);

      setResponseDialog(true);
      setIsOpen(false);
      onRefresh();
    } catch (exception) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      setResponse(error.response?.data || null);
    } finally {
      setResponseDialog(true);
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Konfirmasi</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin untuk menghapus pengajuan perizinan ini? <br />{" "}
            Aksi ini bersifat <span className="font-semibold">PERMANENT</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDeleteLeaveApplication}
            disabled={isLoading}
          >
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
