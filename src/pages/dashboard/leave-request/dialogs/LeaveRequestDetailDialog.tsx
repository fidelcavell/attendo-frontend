import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { LeaveApplication } from "@/data/dataTypes";
import { formatDate } from "@/helper/Formatter";

interface LeaveRequestDetailDialogProps {
  selectedLeaveRequest: LeaveApplication;
  isOpen: boolean;
  setIsOpen: (value: React.SetStateAction<boolean>) => void;
  getAllLeaveRequest: () => Promise<void>;
}

export default function LeaveRequestDetailDialog({
  selectedLeaveRequest,
  isOpen,
  setIsOpen,
  getAllLeaveRequest,
}: LeaveRequestDetailDialogProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave Request Detail</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="flex flex-col gap-3 mt-2 mb-4">
              <div className="flex gap-3">
                <div>Start Date :</div>
                <div>{formatDate(selectedLeaveRequest.startDate)}</div>
              </div>
              <div className="flex gap-3">
                <div>End Date :</div>
                <div>{formatDate(selectedLeaveRequest.endDate)}</div>
              </div>
              <div className="flex gap-3">
                <div>Description :</div>
                <div>{selectedLeaveRequest.description}</div>
              </div>
              <div className="col-span-2 flex justify-end">
                <div className="flex flex-col gap-3">
                  <div>Issued by : {selectedLeaveRequest?.issuedBy}</div>
                  <div>
                    {selectedLeaveRequest.status == "REJECTED"
                      ? "Rejected"
                      : "Approved"}{" "}
                    by : {selectedLeaveRequest.approvedBy}
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={() => {
              setIsOpen(false);
              getAllLeaveRequest();
            }}
          >
            Ok
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
