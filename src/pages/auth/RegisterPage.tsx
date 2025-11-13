import { Clock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useRef, useState, type FormEvent } from "react";
import type { AxiosError } from "axios";
import api from "@/api/api-config";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

export default function RegisterPage() {
  const navigate = useNavigate();

  const username = useRef<HTMLInputElement>(null);
  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setResponse(null);
    setOpenDialog(false);

    try {
      const response = await api.post("/auth/sign-up", {
        username: username.current?.value ?? "",
        email: email.current?.value ?? "",
        password: password.current?.value ?? "",
      });
      setResponse(response.data);
    } catch (exception: unknown) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      setResponse(error.response?.data || null);
    } finally {
      setLoading(false);
      setOpenDialog(true);
    }
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="size-6 rounded-md bg-primary/10 grid place-items-center">
            <Clock className="w-3.5 h-3.5 text-primary" />
          </div>
          Attendo.
        </a>
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Registration</CardTitle>
              <CardDescription>Create your own Account!</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                  <div className="grid gap-6">
                    <FieldSet>
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="username">Username</FieldLabel>
                          <Input
                            id="username"
                            type="text"
                            placeholder="Enter username"
                            required
                            ref={username}
                          />
                          <FieldDescription className="pl-1 text-xs">
                            Choose a unique username for your account.
                          </FieldDescription>
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="username">Email</FieldLabel>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter email"
                            required
                            ref={email}
                          />
                          <FieldDescription className="pl-1 text-xs">
                            Choose a unique email for your account.
                          </FieldDescription>
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="password">Password</FieldLabel>
                          <div className="relative">
                            <Input
                              id="password"
                              className="pr-10"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter password"
                              required
                              ref={password}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                              {showPassword ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </button>
                          </div>
                          <FieldDescription className="pl-1 text-xs">
                            Must be at least 8 characters long.
                          </FieldDescription>
                        </Field>
                      </FieldGroup>
                    </FieldSet>

                    {response && (
                      <AlertDialog open={openDialog}>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {response.success ? "Success" : "Error"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {response.message}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogAction
                              onClick={() => {
                                setOpenDialog(false);
                                if (response.success) {
                                  navigate("/sign-in", { replace: true });
                                }
                              }}
                            >
                              Ok
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-10"
                      disabled={loading}
                    >
                      {loading ? <Spinner className="size-6" /> : "Register"}
                    </Button>
                  </div>
                  <div className="text-center text-sm">
                    Already have an account?{" "}
                    <Link
                      to="/sign-in"
                      className="underline underline-offset-4"
                    >
                      Sign in
                    </Link>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
