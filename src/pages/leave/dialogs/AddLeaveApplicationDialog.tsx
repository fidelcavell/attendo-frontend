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
import { useLoginContext } from "@/hooks/useLogin";
import type { AxiosError } from "axios";
import { useState } from "react";

interface AddLeaveApplicationDialogProps {
  isOpen: boolean;
  setIsOpen: (value: React.SetStateAction<boolean>) => void;
  setResponse: (
    value: React.SetStateAction<{
      success: boolean;
      message: string;
    } | null>
  ) => void;
  setResponseDialog: (value: React.SetStateAction<boolean>) => void;
  onRefresh: () => Promise<void>;
}

export default function AddLeaveApplicationDialog({
  isOpen,
  setIsOpen,
  setResponse,
  setResponseDialog,
  onRefresh,
}: AddLeaveApplicationDialogProps) {
  const { currentUser } = useLoginContext();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    type: "",
    description: "",
  });

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onAddLeaveApplication = async () => {
    if (
      !formData.startDate ||
      !formData.endDate ||
      !formData.type ||
      !formData.description
    ) {
      setResponse({
        success: false,
        message: "Harap isi semua field yang wajib diisi.",
      });
      setResponseDialog(true);
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setResponse({
        success: false,
        message: "Tanggal mulai tidak boleh lebih besar dari tanggal selesai.",
      });
      setResponseDialog(true);
      return;
    }
    setIsLoading(true);

    try {
      const response = await api.post(
        `/leave/${currentUser?.idUser}`,
        {
          startDate: formData.startDate,
          endDate: formData.endDate,
          type: formData.type,
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
      setFormData({
        startDate: "",
        endDate: "",
        type: "",
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
          <AlertDialogTitle>Tambah Pengajuan Perizinan</AlertDialogTitle>
          <AlertDialogDescription>
            Isi detail di bawah ini untuk membuat pengajuan perizinan baru
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Tanggal Mulai *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(event) =>
                handleFormChange("startDate", event.target.value)
              }
              min={new Date(Date.now()).toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Tanggal Selesai *</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(event) =>
                handleFormChange("endDate", event.target.value)
              }
              min={new Date(Date.now()).toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipe Perizinan *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleFormChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe perizinan" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="SICK">Sick</SelectItem>
                  <SelectItem value="PERSONAL">Personal</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi *</Label>
            <Textarea
              id="description"
              placeholder="Enter alasan melakukan perizinan..."
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
              setFormData({
                startDate: "",
                endDate: "",
                type: "",
                description: "",
              });
            }}
            disabled={isLoading}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onAddLeaveApplication}
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
