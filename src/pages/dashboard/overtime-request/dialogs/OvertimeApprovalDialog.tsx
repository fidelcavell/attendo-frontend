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
import type { OvertimeApplication } from "@/types/dataTypes";
import { useLoginContext } from "@/hooks/useLogin";
import type { AxiosError } from "axios";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

interface OvertimeApprovalDialogProps {
  isOpen: boolean;
  setIsOpen: (value: React.SetStateAction<boolean>) => void;
  setResponse: (
    value: React.SetStateAction<{
      success: boolean;
      message: string;
    } | null>
  ) => void;
  selectedOvertimeRequest: OvertimeApplication;
  selectedAction: string;
  setIsResponseDialogOpen: (value: React.SetStateAction<boolean>) => void;
  getAllOvertimeRequest: () => Promise<void>;
}

export default function OvertimeApprovalDialog({
  isOpen,
  setIsOpen,
  setResponse,
  selectedOvertimeRequest,
  selectedAction,
  setIsResponseDialogOpen,
  getAllOvertimeRequest,
}: OvertimeApprovalDialogProps) {
  const { currentUser } = useLoginContext();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmitApprovalRequest = async () => {
    setResponse(null);
    setIsOpen(false);
    setIsLoading(true);

    try {
      const requestParams = new URLSearchParams();
      requestParams.append("approver", currentUser?.username ?? "");
      requestParams.append("status", selectedAction);

      const response = await api.put(
        `/overtime/${selectedOvertimeRequest.id}`,
        requestParams,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      setResponse(response.data);
    } catch (exception: unknown) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      setResponse(error.response?.data || null);
    } finally {
      setIsResponseDialogOpen(true);
      setIsLoading(false);
      getAllOvertimeRequest();
    }
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Konfirmasi</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin{" "}
            <span className="font-bold">
              {selectedAction == "APPROVED" ? "MENYETUJUI" : "MENOLAK"}
            </span>{" "}
            pengajuan lembur yang diajukan oleh{" "}
            {selectedOvertimeRequest.issuedBy} ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onSubmitApprovalRequest}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
