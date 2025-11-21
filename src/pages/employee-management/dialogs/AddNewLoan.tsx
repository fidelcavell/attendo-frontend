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
import { Spinner } from "@/components/ui/spinner";
import type { Profile } from "@/data/dataTypes";
import { formatIDR } from "@/helper/Formatter";
import { useLoginContext } from "@/hooks/useLogin";
import type { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";

interface AddnewLoanProps {
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
}

export default function AddNewLoan({
  isOpen,
  setIsOpen,
  selectedProfile,
  setResponse,
  setResponseDialog,
}: AddnewLoanProps) {
  const { currentUser, currentStore } = useLoginContext();
  const [loanAmount, setLoanAmount] = useState("");
  const [currentTotalSalary, setCurrentTotalSalary] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const onAddLoan = async () => {
    setResponse(null);
    setIsLoading(true);

    try {
      const requestParams = new URLSearchParams();
      requestParams.append("currentLoggedIn", currentUser?.username ?? "");
      requestParams.append("newLoanAmount", loanAmount);

      const response = await api.post(
        `/loan/${selectedProfile.idUser}`,
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
      setLoanAmount("");
      setIsOpen(false);
      setResponseDialog(true);
      setIsLoading(false);
    }
  };

  const getCurrentTotalSalary = useCallback(
    async (selectedUserId: number, storeId: number) => {
      try {
        const response = await api.get(
          `/salary/current-total-salary/${selectedUserId}`,
          {
            params: {
              store: storeId,
            },
            headers: { "Content-Type": "application/json" },
          }
        );
        setCurrentTotalSalary(response.data);
      } catch (exception) {
        console.log("Error on getCurrentTotalSalary function: " + exception);
      }
    },
    []
  );

  useEffect(() => {
    if (isOpen && selectedProfile.idUser && currentStore?.id) {
      getCurrentTotalSalary(selectedProfile.idUser, currentStore.id);
    }
  }, [selectedProfile, getCurrentTotalSalary, currentStore?.id, isOpen]);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add Loan</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="mb-2">
              Current total salary:{" "}
              <strong>{formatIDR(currentTotalSalary)}</strong>
            </div>
            <Label className="my-4" htmlFor="loan-amount">
              Loan amount
            </Label>
            <Input
              className="mb-4"
              id="loan-amount"
              type="text"
              value={loanAmount}
              onChange={(event) => setLoanAmount(event.target.value)}
              placeholder="Enter loan amount"
              required
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setLoanAmount("")}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onAddLoan}
            disabled={loanAmount.trim().length == 0}
          >
            {isLoading ? (
              <>
                <Spinner className="size-4 mr-2" /> Adding...
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
