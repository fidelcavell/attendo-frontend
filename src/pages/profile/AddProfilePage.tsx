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
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useLoginContext } from "@/hooks/useLogin";
import type { AxiosError } from "axios";
import { useCallback, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import Webcam from "react-webcam";
import { Camera, TriangleAlert } from "lucide-react";
import URLtoFile from "@/helper/URLToFileConverter";
import { Spinner } from "@/components/ui/spinner";

const videoConstraints = {
  width: 720,
  height: 540,
  facingMode: "user",
};

export default function AddProfilePage() {
  const { currentUser, getUserData, currentStore } = useLoginContext();
  const navigate = useNavigate();

  const name = useRef<HTMLInputElement>(null);
  const phone = useRef<HTMLInputElement>(null);
  const address = useRef<HTMLTextAreaElement>(null);
  const birthDate = useRef<HTMLInputElement>(null);
  const [gender, setGender] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [isCaptureEnable, setCaptureEnable] = useState<boolean>(false);
  const webcamRef = useRef<Webcam>(null);
  const [url, setUrl] = useState<string | undefined>(undefined);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setUrl(imageSrc);
      setCaptureEnable(false);
    }
  }, [webcamRef]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setResponse(null);
    setOpenDialog(false);

    try {
      const formData = new FormData();

      const profileDTO = {
        name: name.current?.value ?? "",
        phoneNumber: phone.current?.value ?? "",
        address: address.current?.value ?? "",
        birthDate: birthDate.current?.value ?? "",
        gender: gender,
      };

      formData.append(
        "profileDTO",
        new Blob([JSON.stringify(profileDTO)], { type: "application/json" })
      );

      if (url) {
        const file = URLtoFile(url, "profile.jpg");
        formData.append("profilePicture", file);
      }

      const response = await api.post(
        "/profile/" + currentUser?.username,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setResponse(response.data);
      await getUserData();
    } catch (exception: unknown) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      setResponse(error.response?.data || null);
    } finally {
      setOpenDialog(true);
      setLoading(false);
    }
  };

  return (
    <div className="bg-muted flex min-h-svh items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="grid gap-2">
          <div className="text-xl font-semibold">
            Hi, Welcome {currentUser?.username}
          </div>
          <div className="text-[14px]">Please fill up your data!</div>
        </div>

        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="grid gap-3">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter name"
                        required
                        ref={name}
                      />
                    </div>
                    {/* Profile Picture */}
                    <div className="flex gap-3 items-center">
                      {url === undefined ? (
                        <div className="p-8 border rounded-2xl">
                          <Camera />
                        </div>
                      ) : (
                        <img
                          className="w-32 rounded-2xl border border-black object-center object-cover"
                          src={url}
                          alt="Your picture profile"
                        />
                      )}

                      {isCaptureEnable || (
                        <Button
                          className="w-40"
                          onClick={() => setCaptureEnable(true)}
                        >
                          Take a picture
                        </Button>
                      )}
                    </div>
                    {/* Phone Number */}
                    <div className="grid gap-3">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter phone number"
                        required
                        ref={phone}
                      />
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="birthDate">Tanggal Lahir</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        placeholder="Enter birth date"
                        required
                        ref={birthDate}
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    {/* Gender */}
                    <div className="grid gap-3">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={gender} onValueChange={setGender} required>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Address */}
                    <div className="grid gap-3">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        placeholder="Enter address"
                        ref={address}
                        required
                      />
                    </div>
                  </div>

                  {isCaptureEnable && (
                    <AlertDialog open={isCaptureEnable}>
                      <AlertDialogContent>
                        <div className="flex justify-between items-center">
                          <div className="font-semibold text-sm flex items-center gap-2">
                            <TriangleAlert className="size-4" />
                            <div>
                              Make sure your face is not blurred and clearly
                              visible
                            </div>
                          </div>
                          <button
                            onClick={() => setCaptureEnable(false)}
                            className="text-gray-500 hover:text-gray-700 hover:font-bold hover:border-gray-700 border rounded-sm px-1"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="mt-2 border border-gray-300">
                          <Webcam
                            audio={false}
                            width={540}
                            height={360}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                          />
                        </div>
                        <Button onClick={capture}>Capture</Button>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

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
                              if (response.success) {
                                if (currentUser?.role == "ROLE_OWNER") {
                                  if (currentStore == null) {
                                    navigate("/add-store", { replace: true });
                                  } else {
                                    navigate("/app/dashboard", {
                                      replace: true,
                                    });
                                  }
                                } else {
                                  navigate("/app/attendance-report", {
                                    replace: true,
                                  });
                                }
                              } else {
                                setOpenDialog(false);
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
                    className="w-full h-10 mb-4"
                    disabled={loading}
                  >
                    {loading ? <Spinner className="size-6" /> : "Submit"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
