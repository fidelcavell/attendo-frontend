import api from "@/api/api-config";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useLoginContext } from "@/hooks/useLogin";
import type { AxiosError } from "axios";
import { useState } from "react";

interface AddEmployeeDialogProps {
  open: boolean;
  setIsOpen: (value: React.SetStateAction<boolean>) => void;
  setResponse: (
    value: React.SetStateAction<{
      success: boolean;
      message: string;
    } | null>
  ) => void;
  setResponseDialog: React.Dispatch<React.SetStateAction<boolean>>;
  onRefresh: () => Promise<void>;
}

export default function AddEmployeeDialog({
  open,
  setIsOpen,
  setResponse,
  setResponseDialog,
  onRefresh,
}: AddEmployeeDialogProps) {
  const { currentStore, currentUser } = useLoginContext();

  const [newEmployee, setNewEmployee] = useState("");
  const [salaryAmount, setSalaryAmount] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const onAddNewEmployee = async () => {
    setResponse(null);
    setIsLoading(true);

    try {
      const requestParams = new URLSearchParams();
      requestParams.append("store", currentStore?.id.toString() ?? "");
      requestParams.append("currentUser", currentUser?.username ?? "");
      requestParams.append("salaryAmount", salaryAmount);

      const response = await api.post(`/user/${newEmployee}`, requestParams, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      setResponse(response.data);
    } catch (exception: unknown) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      setResponse(error.response?.data || null);
    } finally {
      setNewEmployee("");
      setSalaryAmount("");
      setIsOpen(false);
      setResponseDialog(true);
      onRefresh();
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tambah Karyawan Baru</AlertDialogTitle>
          <AlertDialogDescription>
            <div>
              <Label className="my-4" htmlFor="username">
                Username
              </Label>
              <Input
                className="mb-2"
                id="username"
                type="text"
                placeholder="Enter username karyawan"
                value={newEmployee}
                onChange={(event) => setNewEmployee(event.target.value)}
                required
              />
            </div>
            <div>
              <Label className="my-4" htmlFor="salary">
                Gaji
              </Label>
              <Input
                className="mb-4"
                id="salary"
                type="number"
                placeholder="Enter gaji karyawan"
                value={salaryAmount}
                onChange={(event) => setSalaryAmount(event.target.value)}
                required
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => setSalaryAmount("")}
            disabled={isLoading}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onAddNewEmployee}
            disabled={!newEmployee.trim() || !salaryAmount.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Spinner className="size-4 mr-2" />
                Adding...
              </>
            ) : (
              "Add"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
