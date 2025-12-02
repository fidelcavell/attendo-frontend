import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { OvertimeApplication } from "@/types/dataTypes";
import { formatDate } from "@/helper/Formatter";

interface OvertimeRequestDetailDialogProps {
  isOpen: boolean;
  setIsOpen: (value: React.SetStateAction<boolean>) => void;
  selectedOvertimeRequest: OvertimeApplication;
  getAllOvertimeRequest: () => Promise<void>;
}

export default function OvertimeRequestDetailDialog({
  isOpen,
  setIsOpen,
  selectedOvertimeRequest,
  getAllOvertimeRequest,
}: OvertimeRequestDetailDialogProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Detail pengajuan lembur</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="flex flex-col gap-3 mt-2 mb-4">
              <div className="flex gap-3">
                <div>Tanggal lembur :</div>
                <div>{formatDate(selectedOvertimeRequest.overtimeDate)}</div>
              </div>
              <div className="flex gap-3">
                <div>Jadwal Kerja :</div>
                <div>{selectedOvertimeRequest.assignedTime}</div>
              </div>
              <div className="flex flex-col gap-3 items-start">
                <div>Deskripsi :</div>
                <div>{selectedOvertimeRequest.description}</div>
              </div>
              <div className="col-span-2 flex justify-end mt-4">
                <div className="flex flex-col gap-3">
                  <div>Diajukan oleh : {selectedOvertimeRequest.issuedBy}</div>
                  <div>
                    {selectedOvertimeRequest.status == "REJECTED"
                      ? "Ditolak"
                      : "Disetujui"}{" "}
                    oleh : {selectedOvertimeRequest.approvedBy}
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
              getAllOvertimeRequest();
            }}
          >
            Ok
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
