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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { Profile } from "@/types/dataTypes";
import { months } from "@/data/monthData";
import { formatIDR } from "@/helper/Formatter";
import { useLoginContext } from "@/hooks/useLogin";
import type { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";

interface UpdateEmployeeSalaryProps {
  isOpen: boolean;
  setIsOpen: (value: React.SetStateAction<boolean>) => void;
  selectedProfile: Profile;
  setResponse: (
    value: React.SetStateAction<{
      success: boolean;
      message: string;
    } | null>
  ) => void;
  setResponseDialog: React.Dispatch<React.SetStateAction<boolean>>;
  onRefresh: () => Promise<void>;
}

export default function UpdateEmployeeSalary({
  isOpen,
  setIsOpen,
  selectedProfile,
  setResponse,
  setResponseDialog,
  onRefresh,
}: UpdateEmployeeSalaryProps) {
  const { currentUser } = useLoginContext();

  const [salaryAmount, setSalaryAmount] = useState("");
  const [currentBaseSalary, setCurrentBaseSalary] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);
  const availableMonths = months
    .map((name, index) => ({ name, value: index + 1 }))
    .filter(({ value }) => {
      if (selectedYear === currentYear) return value >= currentMonth;
      return true;
    });

  const onUpdateSalary = async () => {
    setResponse(null);
    setIsLoading(true);

    try {
      const requestParams = new URLSearchParams();
      requestParams.append("salaryAmount", salaryAmount);
      requestParams.append("currentLoggedIn", currentUser?.username ?? "");
      requestParams.append("targetMonth", selectedMonth.toString());
      requestParams.append("targetYear", selectedYear.toString());

      const response = await api.post(
        `/salary/add-new-salary/${selectedProfile?.idUser}`,
        requestParams,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      setResponse(response.data);
    } catch (exception) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      setResponse(error.response?.data || null);
    } finally {
      setSalaryAmount("");
      setIsOpen(false);
      setResponseDialog(true);
      onRefresh();
      setIsLoading(false);
    }
  };

  const getLatestActiveSalary = useCallback(async (selectedUserId: number) => {
    try {
      const response = await api.get(`/salary/latest/${selectedUserId}`);
      setCurrentBaseSalary(response.data.amount);
    } catch (exception) {
      console.log("Error on getLatestActiveSalary function: " + exception);
    }
  }, []);

  useEffect(() => {
    if (isOpen && selectedProfile.idUser) {
      getLatestActiveSalary(selectedProfile.idUser);
    }
  }, [getLatestActiveSalary, isOpen, selectedProfile.idUser]);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Gaji</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="mb-2">
              Data gaji yang berlaku saat ini:{" "}
              <strong>{formatIDR(currentBaseSalary)}</strong>
            </div>
          </AlertDialogDescription>
          <Label className="my-2" htmlFor="salary">
            Jumlah gaji yang ingin diterapkan
          </Label>
          <Input
            id="salary"
            type="number"
            placeholder="Enter jumlah gaji baru"
            value={salaryAmount}
            onChange={(event) => setSalaryAmount(event.target.value)}
            required
            className="mb-4"
          />
          <div className="flex gap-6">
            <div>
              <Label className="my-2">Tahun efektif</Label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => {
                  setSelectedYear(Number(value));
                  if (Number(value) !== currentYear) {
                    setSelectedMonth(1);
                  } else if (selectedMonth < currentMonth) {
                    setSelectedMonth(currentMonth);
                  }
                }}
              >
                <SelectTrigger className="mb-4">
                  <SelectValue placeholder="Choose year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="my-2">Bulan efektif</Label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(Number(value))}
              >
                <SelectTrigger className="mb-4">
                  <SelectValue placeholder="Choose month" />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map(({ name, value }) => (
                    <SelectItem key={value} value={value.toString()}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => setSalaryAmount("")}
            disabled={isLoading}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onUpdateSalary}
            disabled={salaryAmount.trim().length == 0 || isLoading}
          >
            {isLoading ? (
              <>
                <Spinner className="size-4 mr-2" /> Updating...
              </>
            ) : (
              "Update"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
