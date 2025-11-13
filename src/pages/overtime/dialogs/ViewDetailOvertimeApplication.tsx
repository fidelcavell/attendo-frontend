import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { OvertimeApplication } from "@/data/dataTypes";
import { formatDate } from "@/helper/Formatter";

interface ViewDetailOvertimeApplicationProps {
  isOpen: boolean;
  setIsOpen: (value: React.SetStateAction<boolean>) => void;
  selectedOvertimeApplication: OvertimeApplication;
  onRefresh: () => Promise<void>;
}

export default function ViewDetailOvertimeApplication({
  isOpen,
  setIsOpen,
  selectedOvertimeApplication,
  onRefresh,
}: ViewDetailOvertimeApplicationProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Overtime Application Detail</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="flex flex-col gap-3 mt-2 mb-4">
              <div className="flex gap-3">
                <div>Overtime Date :</div>
                <div>
                  {formatDate(selectedOvertimeApplication.overtimeDate)}
                </div>
              </div>
              <div className="flex gap-3">
                <div>Schedule :</div>
                <div>{selectedOvertimeApplication.assignedTime}</div>
              </div>
              <div className="flex gap-3">
                <div>Description :</div>
                <div>{selectedOvertimeApplication.description}</div>
              </div>
              <div className="col-span-2 flex justify-end">
                <div className="flex flex-col gap-3">
                  <div>Issued by : {selectedOvertimeApplication.issuedBy}</div>
                  <div>
                    {selectedOvertimeApplication.status == "REJECTED"
                      ? "Rejected"
                      : "Approved"}{" "}
                    by : {selectedOvertimeApplication.approvedBy}
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
              onRefresh();
            }}
          >
            Ok
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
