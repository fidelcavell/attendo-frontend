import api from "@/api/api-config";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useLoginContext } from "@/hooks/useLogin";
import type { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

interface ChangeEmailDialogProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setResponse: (
    value: React.SetStateAction<{
      success: boolean;
      message: string;
    } | null>
  ) => void;
  setResponseDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setLastAction: React.Dispatch<
    React.SetStateAction<"email" | "password" | "logout" | "delete" | null>
  >;
}

export default function ChangeEmailDialog({
  isOpen,
  setIsOpen,
  setResponse,
  setResponseDialog,
  setLastAction,
}: ChangeEmailDialogProps) {
  const { currentUser } = useLoginContext();

  const newEmail = useRef<HTMLInputElement>(null);
  const currentPassword = useRef<HTMLInputElement>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const onChangeEmail = async (event: FormEvent) => {
    event.preventDefault();
    setResponse(null);

    setIsLoading(true);
    try {
      const response = await api.put(
        `/auth/change-email/${currentUser?.username}`,
        {
          newEmail: newEmail.current?.value ?? "",
          currentPassword: currentPassword.current?.value ?? "",
        }
      );
      setResponse(response.data);
      setLastAction("email");
    } catch (exception) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      setResponse(error.response?.data || null);
    } finally {
      setIsOpen(false);
      setIsLoading(false);
      setResponseDialog(true);
    }
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ubah Email</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={onChangeEmail}>
          <div>
            <Label className="mt-4 mb-2" htmlFor="new-email">
              Email baru
            </Label>
            <div className="relative">
              <Input
                id="new-email"
                className="pr-10"
                type="text"
                placeholder="Enter email baru"
                required
                ref={newEmail}
              />
            </div>
          </div>
          <div>
            <Label className="mt-4 mb-2" htmlFor="name">
              Password saat ini
            </Label>
            <div className="relative">
              <Input
                id="current-password"
                className="pr-10"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter password saat ini"
                required
                ref={currentPassword}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner className="size-4 mr-2" /> Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
