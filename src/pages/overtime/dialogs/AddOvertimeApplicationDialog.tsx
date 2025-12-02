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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { Schedule } from "@/types/dataTypes";
import { useLoginContext } from "@/hooks/useLogin";
import type { AxiosError } from "axios";
import { useState } from "react";

interface AddOvertimeApplicationDialogProps {
  isOpen: boolean;
  setIsOpen: (value: React.SetStateAction<boolean>) => void;
  availableSchedules: Schedule[] | null;
  setResponse: (
    value: React.SetStateAction<{
      success: boolean;
      message: string;
    } | null>
  ) => void;
  setResponseDialog: (value: React.SetStateAction<boolean>) => void;
  onRefresh: () => Promise<void>;
}

export default function AddOvertimeApplicationDialog({
  isOpen,
  setIsOpen,
  availableSchedules,
  setResponse,
  setResponseDialog,
  onRefresh,
}: AddOvertimeApplicationDialogProps) {
  const { currentUser } = useLoginContext();

  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    overtimeDate: "",
    startTime: "",
    endTime: "",
    description: "",
  });

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onSubmitOvertimeApplication = async () => {
    if (
      !formData.overtimeDate ||
      !formData.description ||
      selectedScheduleId.length == 0
    ) {
      setResponse({
        success: false,
        message: "Harap isi semua field yang wajib diisi.",
      });
      setResponseDialog(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post(
        `/overtime/${currentUser?.idUser}?schedule=${selectedScheduleId}`,
        {
          overtimeDate: formData.overtimeDate,
          description: formData.description,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
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
    } finally {
      setSelectedScheduleId("");
      setFormData({
        overtimeDate: "",
        startTime: "",
        endTime: "",
        description: "",
      });
      setResponseDialog(true);
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tambah Pengajuan Lembur</AlertDialogTitle>
          <AlertDialogDescription>
            Isi detail di bawah ini untuk membuat pengajuan lembur baru
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Overtime Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Tanggal Lembur *</Label>
            <Input
              id="overtimeDate"
              type="date"
              value={formData.overtimeDate}
              onChange={(event) =>
                handleFormChange("overtimeDate", event.target.value)
              }
              min={
                new Date(Date.now() + 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0]
              }
              required
            />
          </div>
          {/* Schedule */}
          <div>
            <Label className="my-4">Jadwal kerja *</Label>
            <Select
              value={selectedScheduleId}
              onValueChange={(value) => setSelectedScheduleId(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select schedule" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {availableSchedules
                    ? availableSchedules.map((schedule) => {
                        const startTime = schedule.startTime
                          ?.split(":")
                          .slice(0, 2)
                          .join(".");
                        const endTime = schedule.endTime
                          ?.split(":")
                          .slice(0, 2)
                          .join(".");
                        return (
                          <SelectItem value={schedule.id.toString()}>
                            {startTime} WIB - {endTime} WIB
                          </SelectItem>
                        );
                      })
                    : ""}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {/* Overtime Application Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi *</Label>
            <Textarea
              id="description"
              placeholder="Enter alasan melakukan lembur..."
              value={formData.description}
              onChange={(event) =>
                handleFormChange("description", event.target.value)
              }
              required
              rows={3}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setIsOpen(false);
              setSelectedScheduleId("");
              setFormData({
                overtimeDate: "",
                startTime: "",
                endTime: "",
                description: "",
              });
            }}
            disabled={isLoading}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onSubmitOvertimeApplication}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner className="size-4 mr-2" />
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
