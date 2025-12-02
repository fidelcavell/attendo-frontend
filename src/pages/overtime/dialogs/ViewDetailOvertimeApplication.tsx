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
          <AlertDialogTitle>Detail Pengajuan Lembur</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="flex flex-col gap-3 mt-2 mb-4">
              <div className="flex gap-3">
                <div>Tanggal lembur :</div>
                <div>
                  {formatDate(selectedOvertimeApplication.overtimeDate)}
                </div>
              </div>
              <div className="flex gap-3">
                <div>Jadwal kerja :</div>
                <div>{selectedOvertimeApplication.assignedTime}</div>
              </div>
              <div className="flex flex-col gap-3 items-start">
                <div>Deksripsi :</div>
                <div>{selectedOvertimeApplication.description}</div>
              </div>
              <div className="col-span-2 flex justify-end mt-4">
                <div className="flex flex-col gap-3">
                  <div>
                    Diajukan Oleh : {selectedOvertimeApplication.issuedBy}
                  </div>
                  <div>
                    {selectedOvertimeApplication.status == "REJECTED"
                      ? "Ditolak"
                      : "Disetujui"}{" "}
                    oleh : {selectedOvertimeApplication.approvedBy}
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
