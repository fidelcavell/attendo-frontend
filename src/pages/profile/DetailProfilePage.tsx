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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { ProfileForm } from "@/data/dataTypes";
import URLtoFile from "@/helper/URLToFileConverter";
import { useLoginContext } from "@/hooks/useLogin";
import type { AxiosError } from "axios";
import { Camera, TriangleAlert } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 720,
  height: 540,
  facingMode: "user",
};

export default function DetailProfilePage() {
  const { currentUser, getUserData } = useLoginContext();

  const [profile, setProfile] = useState<ProfileForm>({
    name: "",
    phoneNumber: "",
    address: "",
    birthDate: "",
    gender: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const [isUpdate, setIsUpdate] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [isCaptureEnable, setCaptureEnable] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const [url, setUrl] = useState<string | undefined>(undefined);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setUrl(imageSrc);
      setCaptureEnable(false);
    }
  }, [webcamRef]);

  const getProfileById = useCallback(async () => {
    if (!currentUser?.idProfile) return;
    setIsLoading(true);

    try {
      const response = await api.get(`/profile/${currentUser.idProfile}`);
      setProfile(response.data);
      console.log(response.data);
    } catch (exception: unknown) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      setResponse(error.response?.data || null);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.idProfile]);

  const getProfilePicture = useCallback(async () => {
    if (!currentUser?.idProfile) return;
    let objectUrl: string;

    console.log("Fetch image");

    api
      .get(`/profile/${currentUser.idProfile}/profile-picture`, {
        responseType: "blob",
      })
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data);
        setUrl(objectUrl);
      });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [currentUser?.idProfile]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setResponse(null);
    setOpenDialog(false);

    try {
      const formData = new FormData();
      formData.append(
        "profileDTO",
        new Blob([JSON.stringify(profile)], { type: "application/json" })
      );

      if (url) {
        if (url.startsWith("blob:")) {
          const res = await fetch(url);
          const blob = await res.blob();
          formData.append("profilePicture", blob, "profile.jpg");
        } else if (url.startsWith("data:image")) {
          const file = URLtoFile(url, "profile.jpg");
          formData.append("profilePicture", file);
        }
      }

      const response = await api.put(
        `/profile/${currentUser?.idProfile}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
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
      setOpenDialog(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProfileById();
    getProfilePicture();
  }, [getProfileById, getProfilePicture]);

  return (
    <div>
      <form className="grid lg:grid-cols-3 gap-6" onSubmit={onSubmit}>
        <div className="flex flex-col gap-3 items-center">
          {url === undefined ? (
            <div className="p-8 border rounded-2xl">
              <Camera />
            </div>
          ) : (
            <img
              className="w-60 rounded-2xl border border-black object-center object-cover"
              src={url}
              alt="Profile picture"
            />
          )}

          {isCaptureEnable || (
            <Button
              className="w-50"
              disabled={!isUpdate}
              onClick={() => setCaptureEnable(true)}
            >
              Update Profile Picture
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter name"
              value={profile.name}
              onChange={(event) =>
                setProfile({ ...profile, name: event.target.value })
              }
              readOnly={!isUpdate}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              value={profile.phoneNumber}
              onChange={(event) =>
                setProfile({ ...profile, phoneNumber: event.target.value })
              }
              readOnly={!isUpdate}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              placeholder="Enter address"
              value={profile.address}
              onChange={(event) =>
                setProfile({ ...profile, address: event.target.value })
              }
              readOnly={!isUpdate}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="birthDate">Tanggal Lahir</Label>
            <Input
              id="birthDate"
              type="date"
              placeholder="Enter birth date"
              value={profile.birthDate}
              onChange={(event) =>
                setProfile({ ...profile, birthDate: event.target.value })
              }
              readOnly={!isUpdate}
              required
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={profile.gender}
              onValueChange={(value) =>
                setProfile({ ...profile, gender: value })
              }
              disabled={!isUpdate}
              required
            >
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
        </div>
        <div className="flex justify-end mt-8 lg:col-span-3">
          {!isUpdate ? (
            <Button
              className="w-40"
              type="button"
              onClick={() => setIsUpdate(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-4">
              <Button
                className="w-40"
                type="button"
                variant={"outline"}
                onClick={() => setIsUpdate(false)}
              >
                Cancel
              </Button>
              <Button className="w-40" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner className="size-4 mr-2" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          )}
        </div>
      </form>

      {isCaptureEnable && (
        <AlertDialog open={isCaptureEnable}>
          <AlertDialogContent>
            <div className="flex justify-between items-center">
              <div className="font-semibold text-sm flex items-center gap-2">
                <TriangleAlert className="size-4" />
                <div>
                  Make sure your face is not blurred and clearly visible
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
                    setOpenDialog(false);
                    setIsUpdate(false);
                    getUserData();
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
    </div>
  );
}
