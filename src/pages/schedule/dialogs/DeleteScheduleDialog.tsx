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
import type { Schedule } from "@/types/dataTypes";
import type { AxiosError } from "axios";
import { useState } from "react";

interface DeleteScheduleDialogProps {
  isOpen: boolean;
  setIsOpen: (value: React.SetStateAction<boolean>) => void;
  selectedSchedule: Schedule;
  setResponse: (
    value: React.SetStateAction<{
      success: boolean;
      message: string;
    } | null>
  ) => void;
  setResponseDialog: (value: React.SetStateAction<boolean>) => void;
  onRefresh: () => Promise<void>;
}

export default function DeleteScheduleDialog({
  isOpen,
  setIsOpen,
  selectedSchedule,
  setResponse,
  setResponseDialog,
  onRefresh,
}: DeleteScheduleDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const onDelete = async () => {
    setIsLoading(true);
    try {
      const response = await api.delete(`/schedule/${selectedSchedule.id}`);
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
      <AlertDialogContent className="max-w-[90%] sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Konfirmasi</AlertDialogTitle>
          <AlertDialogDescription className="mb-4">
            Apakah Anda yakin untuk menghapus jadwal kerja ini secara
            <span className="font-bold">PERMANENT</span> ?<br />
            <br />
            Catatan: Karyawan dengan jadwal ini akan tidak memiliki jadwal
            (unassigned)!
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
