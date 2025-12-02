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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useLoginContext } from "@/hooks/useLogin";
import type { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

interface ChangePasswordDialogProps {
  isOpen: boolean;
  setIsOpen: (value: React.SetStateAction<boolean>) => void;
  setResponse: (
    value: React.SetStateAction<{
      success: boolean;
      message: string;
    } | null>
  ) => void;
  setResponseDialog: (value: React.SetStateAction<boolean>) => void;
  setLastAction: React.Dispatch<
    React.SetStateAction<"email" | "password" | "logout" | "delete" | null>
  >;
}

export default function ChangePasswordDialog({
  isOpen,
  setIsOpen,
  setResponse,
  setResponseDialog,
  setLastAction,
}: ChangePasswordDialogProps) {
  const { currentUser } = useLoginContext();

  const currentPassword = useRef<HTMLInputElement>(null);
  const newPassword = useRef<HTMLInputElement>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const onChangePassword = async (event: FormEvent) => {
    event.preventDefault();
    setResponse(null);
    setIsLoading(true);

    try {
      const response = await api.put(
        `/auth/change-password/${currentUser?.username}`,
        {
          currentPassword: currentPassword.current?.value ?? "",
          newPassword: newPassword.current?.value ?? "",
        }
      );
      setResponse(response.data);
      setLastAction("password");
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
          <AlertDialogTitle>Ubah Password</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={onChangePassword}>
          <div>
            <Label className="mt-4 mb-2" htmlFor="name">
              Password baru
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                className="pr-10"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter password baru"
                required
                ref={newPassword}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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
            <AlertDialogAction asChild disabled={isLoading}>
              <Button type="submit">
                {isLoading ? (
                  <>
                    <Spinner className="size-4 mr-2" /> Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
