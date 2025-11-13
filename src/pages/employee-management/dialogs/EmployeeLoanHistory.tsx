import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import LoanItem from "../components/LoanItem";
import type { Loan, Profile } from "@/data/dataTypes";
import { months } from "@/data/monthData";
import { useCallback, useEffect, useState } from "react";
import api from "@/api/api-config";
import { useLoginContext } from "@/hooks/useLogin";

interface EmployeeLoanHistoryProps {
  isOpen: boolean;
  setIsOpen: (value: React.SetStateAction<boolean>) => void;
  selectedProfile: Profile;
}

export default function EmployeeLoanHistory({
  isOpen,
  setIsOpen,
  selectedProfile,
}: EmployeeLoanHistoryProps) {
  const { currentStore } = useLoginContext();
  const [loanHistory, setLoanHistory] = useState<Loan[]>([]);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const getLoanHistory = useCallback(async () => {
    try {
      const response = await api.get(
        `/loan/history/${selectedProfile.idUser}`,
        {
          params: {
            store: currentStore?.id,
            month: currentMonth,
            year: currentYear,
          },
          headers: { "Content-Type": "application/json" },
        }
      );
      const { content } = response.data;
      setLoanHistory(content);
    } catch (exception) {
      console.log(exception);
    }
  }, [currentMonth, currentStore?.id, currentYear, selectedProfile.idUser]);

  useEffect(() => {
    if (isOpen) getLoanHistory();
  }, [getLoanHistory, isOpen]);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {selectedProfile.username}'s loan history -{" "}
            {months[new Date().getMonth()].toLowerCase()} {currentYear}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div className="w-full min-h-80 flex flex-col items-center justify-start pt-2">
              {!loanHistory || loanHistory.length === 0 ? (
                <div className="text-gray-500 text-sm mt-8 border border-dashed rounded-lg py-16 w-full text-center">
                  No data recorded!
                </div>
              ) : (
                <div className="flex flex-col items-center w-full space-y-3 max-h-80 pb-2 overflow-y-auto scroll-smooth">
                  {loanHistory.map((loan) => (
                    <LoanItem
                      key={loan.id}
                      loan={loan}
                      onSaved={getLoanHistory}
                    />
                  ))}
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Ok</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
