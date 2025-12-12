import api from "@/api/api-config";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Loan } from "@/types/dataTypes";
import { formatDate, formatIDR } from "@/helper/Formatter";
import { useLoginContext } from "@/hooks/useLogin";
import type { AxiosError } from "axios";
import { useState } from "react";

export default function LoanItem({
  loan,
  onSaved,
}: {
  loan: Loan;
  onSaved: () => void;
}) {
  const { currentUser } = useLoginContext();

  const [isEditing, setIsEditing] = useState(false);
  const [newAmount, setNewAmount] = useState<string>(loan.amount.toString());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSave = async () => {
    setResponse(null);
    try {
      const requestParams = new URLSearchParams();
      requestParams.append("currentLoggedIn", currentUser?.username ?? "");
      requestParams.append("newLoanAmount", newAmount);

      const response = await api.put(`/loan/${loan.id}`, requestParams, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      setResponse(response.data);
      onSaved();
    } catch (exception: unknown) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      setResponse(error.response?.data || null);
    } finally {
      setIsEditing(false);
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <Card
        onClick={() => !isEditing && !isDialogOpen && setIsEditing(true)}
        className={`w-full flex-row items-center justify-between py-4 px-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer ${
          isEditing ? "bg-gray-50 border-blue-300" : ""
        }`}
      >
        <div className="text-sm text-gray-600">
          {formatDate(loan.createdDate)}
        </div>

        {isEditing ? (
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              className="w-28"
              value={newAmount}
              onChange={(event) => setNewAmount(event.target.value)}
            />
            <div className="flex flex-col space-y-1">
              <Button
                size="sm"
                variant="default"
                onClick={handleSave}
                className="w-16"
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setNewAmount(loan.amount.toString());
                }}
                className="w-16"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-right font-semibold text-gray-800 truncate max-w-[8rem]">
            {formatIDR(loan.amount)}
          </div>
        )}
      </Card>

      {response && (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent className="w-4/5 md:w-1/4">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {response.success ? "Success" : "Error"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {response.message}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setIsDialogOpen(false)}>
                Ok
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
