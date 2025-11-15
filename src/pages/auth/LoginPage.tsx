import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, type FormEvent } from "react";
import api from "@/api/api-config";
import type { AxiosError } from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
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
import { useLoginContext } from "@/hooks/useLogin";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  const { setToken, currentUser, currentStore } = useLoginContext();
  const navigate = useNavigate();

  const username = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setOpenDialog(false);

    try {
      const response = await api.post("/auth/sign-in", {
        username: username.current?.value ?? "",
        password: password.current?.value ?? "",
      });
      localStorage.setItem("JWT_TOKEN", response.data.jwtToken);
      localStorage.setItem("USERNAME", response.data.username);
      setToken(response.data.jwtToken);
    } catch (exception) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      setError(error.response?.data.message || "Login failed");
      setOpenDialog(true);
    } finally {
      setLoading(false);
    }
  };

  // Check the currentUser's value due to async is take a while to set new data on currentUser.
  useEffect(() => {
    if (!currentUser) return; // wait until user is fetched

    // Optional: You can also track loading states in your context
    if (currentUser.role === "ROLE_OWNER") {
      if (currentUser.idProfile == null) {
        navigate("/add-profile", { replace: true });
      } else if (currentStore === null) {
        return;
      } else {
        navigate("/app/dashboard", { replace: true });
      }
    } else if (currentUser.idProfile == null) {
      navigate("/add-profile", { replace: true });
    } else {
      navigate("/app/attendance-report", { replace: true });
    }
  }, [currentStore, currentUser, navigate]);

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="size-7 rounded-md bg-primary/10 grid place-items-center">
            <img src="/logo.png" alt="Logo" />
          </div>
          Attendo.
        </a>
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>Login with your Account!</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit}>
                <div className="grid gap-6">
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter username"
                        required
                        ref={username}
                      />
                    </div>
                    <div className="grid gap-3">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <Link
                          className="ml-auto text-sm underline-offset-4 hover:underline"
                          to="/forgot-password"
                        >
                          Forgot your password?
                        </Link>
                      </div>
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
                    </div>

                    {error && (
                      <AlertDialog open={openDialog}>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{error}</AlertDialogTitle>
                            <AlertDialogDescription>
                              Your username or password is invalid!
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogAction
                              onClick={() => setOpenDialog(false)}
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
                      {loading ? <Spinner className="size-6" /> : "Login"}
                    </Button>
                  </div>
                  <div className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link
                      to="/sign-up"
                      className="underline underline-offset-4"
                    >
                      Sign up
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
