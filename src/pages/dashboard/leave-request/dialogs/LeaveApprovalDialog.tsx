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
import type { LeaveApplication } from "@/types/dataTypes";
import { useLoginContext } from "@/hooks/useLogin";
import type { AxiosError } from "axios";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

interface LeaveApprovalDialogProps {
  isOpen: boolean;
  setIsOpen: (value: React.SetStateAction<boolean>) => void;
  setResponse: (
    value: React.SetStateAction<{
      success: boolean;
      message: string;
    } | null>
  ) => void;
  selectedLeaveRequest: LeaveApplication | null;
  selectedAction: string;
  setIsResponseDialogOpen: (value: React.SetStateAction<boolean>) => void;
  getAllLeaveRequest: () => Promise<void>;
}

export default function LeaveApprovalDialog({
  isOpen,
  setIsOpen,
  setResponse,
  selectedLeaveRequest,
  selectedAction,
  setIsResponseDialogOpen,
  getAllLeaveRequest,
}: LeaveApprovalDialogProps) {
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
        `/leave/${selectedLeaveRequest?.id}`,
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
      getAllLeaveRequest();
    }
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {selectedAction == "APPROVED" ? "Menyetujui" : "Menolak"} pengajuan
            perizinan
          </AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin{" "}
            {selectedAction == "APPROVED" ? "menyetujui" : "menolak"} pengajuan
            perizinan yang diajukan oleh {selectedLeaveRequest?.issuedBy} ?
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
