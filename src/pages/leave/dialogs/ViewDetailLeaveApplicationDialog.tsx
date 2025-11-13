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

interface ViewDetailLeaveApplicationProps {
  isOpen: boolean;
  setIsOpen: (value: React.SetStateAction<boolean>) => void;
  selectedLeaveApplication: LeaveApplication;
  onRefresh: () => Promise<void>;
}

export default function ViewDetailLeaveApplication({
  isOpen,
  setIsOpen,
  selectedLeaveApplication,
  onRefresh,
}: ViewDetailLeaveApplicationProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave Request Detail</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="flex flex-col gap-3 mt-2 mb-4">
              <div className="flex gap-3">
                <div>Start Date :</div>
                <div>{formatDate(selectedLeaveApplication.startDate)}</div>
              </div>
              <div className="flex gap-3">
                <div>End Date :</div>
                <div>{formatDate(selectedLeaveApplication.endDate)}</div>
              </div>
              <div className="flex gap-3">
                <div>Description :</div>
                <div>{selectedLeaveApplication.description}</div>
              </div>
              <div className="col-span-2 flex justify-end">
                <div className="flex flex-col gap-3">
                  <div>Issued by : {selectedLeaveApplication.issuedBy}</div>
                  <div>
                    {selectedLeaveApplication.status === "REJECTED"
                      ? "Rejected"
                      : "Approved"}{" "}
                    by : {selectedLeaveApplication.approvedBy}
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onRefresh()}>Ok</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
