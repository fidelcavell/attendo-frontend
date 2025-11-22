import api from "@/api/api-config";
import UnavailableCard from "@/components/shared/UnavailableCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import type { Attendance } from "@/data/dataTypes";
import { formatDate, getLocalISOTime } from "@/helper/Formatter";
import URLtoFile from "@/helper/URLToFileConverter";
import { useLoginContext } from "@/hooks/useLogin";
import type { AxiosError } from "axios";
import {
  Camera,
  Clock,
  Info,
  LogIn,
  LogOut,
  Store,
  TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 720,
  height: 540,
  facingMode: "user",
};

export default function OvertimeClockPage() {
  const { currentUser, currentStore } = useLoginContext();

  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const [selectedOvertime, setSelectedOvertime] = useState<Attendance | null>(
    null
  );

  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const webcamRef = useRef<Webcam>(null);
  const [isCaptureEnable, setCaptureEnable] = useState(false);
  const [url, setUrl] = useState<string | undefined>(undefined);

  const [areaStatus, setAreaStatus] = useState("");

  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setUrl(imageSrc);
      setCaptureEnable(false);
    }
  }, []);

  const getInAreaStatus = useCallback(async () => {
    try {
      const response = await api.get("/attendance/in-area-status", {
        params: {
          store: currentStore?.id,
          lat: position?.lat,
          lng: position?.lng,
        },
        headers: { "Content-Type": "application/json" },
      });
      setAreaStatus(response.data.message);
    } catch (error) {
      console.log(error);
    }
  }, [currentStore?.id, position?.lat, position?.lng]);

  const getTodayOvertimeInfo = useCallback(async () => {
    try {
      const response = await api.get(
        `/attendance/overtime-info/${currentUser?.idUser}`
      );
      setSelectedOvertime(response.data);
    } catch (exception) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      setResponse(error.response?.data || null);
    }
  }, [currentUser?.idUser]);

  const handleClock = async (type: "IN" | "OUT") => {
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append("currentDateTime", getLocalISOTime());
      formData.append("lat", position?.lat.toString() ?? "");
      formData.append("lng", position?.lng.toString() ?? "");

      if (url) {
        const file = URLtoFile(url, "attendance.jpg");
        formData.append("photo", file);
      }

      const response =
        type === "IN"
          ? await api.put(
              `/attendance/overtime-clock-in/${selectedOvertime?.id}`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            )
          : await api.put(
              `/attendance/overtime-clock-out/${selectedOvertime?.id}`,
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
      setIsDialogOpen(true);
      setUrl(undefined);
    }
  };

  useEffect(() => {
    if (currentUser && position?.lat && position.lng) {
      getInAreaStatus();
    }
  }, [currentUser, getInAreaStatus, position?.lat, position?.lng]);

  useEffect(() => {
    getTodayOvertimeInfo();
  }, [getTodayOvertimeInfo]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Checking user's current used device
  const isMobileDevice = () => {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  };

  const onSetCurrentLocation = useCallback(() => {
    if (!isMobileDevice()) {
      setResponse({
        success: false,
        message:
          "This feature requires your mobile device’s GPS to provide accurate location data!",
      });
      setIsDialogOpen(true);
      return;
    }

    if (!navigator.geolocation) {
      setResponse({ success: false, message: "Geolocation is not supported!" });
      setIsDialogOpen(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setResponse({
          success: false,
          message: `Failed to get current location: No Internet Connection or Turn on your GPS feature`,
        });
        setIsDialogOpen(true);
      }
    );
  }, []);

  useEffect(() => {
    onSetCurrentLocation();
  }, [onSetCurrentLocation]);

  if (!currentStore && position?.lat && position.lng) {
    return (
      <UnavailableCard
        icon={Store}
        title="No Store Assigned"
        message="You are not added to any store yet. Please contact your
               administrator to be assigned to a store."
      />
    );
  }

  if (!selectedOvertime) {
    return (
      <UnavailableCard
        icon={Info}
        title="No overtime available today"
        message={
          <>
            You are not requested any overtime application yet.
            <br /> Please make a new application or contact your administrator
            for approval.
          </>
        }
      />
    );
  }

  return (
    <div className="flex justify-center p-2 sm:p-3">
      <Card className="w-full max-w-xl md:max-w-2xl p-3 sm:p-4 md:p-5 shadow-md rounded-xl">
        {/* Header */}
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Overtime Clock
          </CardTitle>
          <p className="text-[11px] sm:text-xs text-muted-foreground">
            {currentTime}, {formatDate(new Date().toLocaleString())}
          </p>
        </CardHeader>

        <Separator className="mb-4" />

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Capture / Preview */}
          <div className="flex flex-col items-center gap-2.5 sm:gap-3">
            <div className="w-full max-w-[16rem] sm:max-w-xs aspect-square rounded-lg border bg-muted/30 overflow-hidden flex items-center justify-center">
              {url ? (
                <img
                  src={url}
                  alt="Captured"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center gap-2 p-3 sm:p-4">
                  <div className="rounded-md border border-dashed p-3 sm:p-4">
                    <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </div>
                  <p className="text-[11px] text-muted-foreground max-w-[14rem]">
                    No photo captured yet. Click the button below to take a
                    picture.
                  </p>
                </div>
              )}
            </div>

            {!isCaptureEnable && (
              <Button
                className="w-full max-w-[16rem] sm:max-w-xs h-8 text-xs"
                onClick={() => setCaptureEnable(true)}
                disabled={position == null}
              >
                Take a Picture
              </Button>
            )}
          </div>

          {/* Right side: Status, Actions, Log */}
          <div className="flex flex-col gap-4">
            {/* Location Status */}
            <div className="rounded-lg border bg-muted/40 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Location Status</p>
                <Badge
                  variant={
                    areaStatus === "In the Area" ? "default" : "destructive"
                  }
                  className="text-[10px] py-0.5 px-1.5"
                >
                  {areaStatus || (
                    <>
                      <Spinner className="size-4" /> Getting Location
                      information
                    </>
                  )}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-lg border p-3 bg-background/60">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  disabled={!url || selectedOvertime.clockIn != null}
                  onClick={() => handleClock("IN")}
                  className="w-full sm:flex-1 h-8 text-xs"
                >
                  <LogIn className="mr-2 h-3.5 w-3.5" /> Clock In
                </Button>
                <Button
                  disabled={
                    !url ||
                    selectedOvertime?.clockIn == null ||
                    selectedOvertime.clockOut != null
                  }
                  onClick={() => handleClock("OUT")}
                  variant="destructive"
                  className="w-full sm:flex-1 h-8 text-xs"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" /> Clock Out
                </Button>
              </div>
              <p className="mt-1.5 text-[10px] text-muted-foreground text-center">
                You must capture a photo before clocking in or out.
              </p>
            </div>

            {/* Attendance Log */}
            <div className="rounded-lg border bg-muted/30 p-3">
              <h4 className="font-medium text-xs mb-1.5">Attendance Log</h4>
              {!selectedOvertime.clockIn && !selectedOvertime.clockOut ? (
                <p className="text-[11px] text-muted-foreground">
                  No activity yet.
                </p>
              ) : (
                <div className="space-y-0.5 text-[11px]">
                  {selectedOvertime.clockIn &&
                    (() => {
                      const [dateIn, timeIn] =
                        selectedOvertime.clockIn.split("T");
                      return (
                        <p>
                          Clock In at {timeIn.slice(0, 8)}, {formatDate(dateIn)}
                        </p>
                      );
                    })()}

                  {selectedOvertime.clockOut &&
                    (() => {
                      const [dateOut, timeOut] =
                        selectedOvertime.clockOut.split("T");
                      return (
                        <p>
                          Clock Out at {timeOut.slice(0, 8)},{" "}
                          {formatDate(dateOut)}
                        </p>
                      );
                    })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

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
                className="w-full h-auto"
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
              />
            </div>
            <Button className="h-8 text-xs" onClick={capture}>
              Capture
            </Button>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {response && (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                onClick={async () => {
                  setIsDialogOpen(false);
                  await getTodayOvertimeInfo();
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
