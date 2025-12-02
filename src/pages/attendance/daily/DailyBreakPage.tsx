import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CalendarX2,
  Clock,
  ClockFading,
  PauseCircle,
  PlayCircle,
  Store,
} from "lucide-react";
import { formatDate, getLocalISOTime } from "@/helper/Formatter";
import type { Attendance } from "@/types/dataTypes";
import api from "@/api/api-config";
import type { AxiosError } from "axios";
import { useLoginContext } from "@/hooks/useLogin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import UnavailableCard from "@/components/shared/UnavailableCard";
import { Spinner } from "@/components/ui/spinner";

export default function DailyBreakPage() {
  const { currentUser, currentStore } = useLoginContext();

  const [selectedAttendance, setSelectedAttendance] =
    useState<Attendance | null>(null);
  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  );
  const [currentDuration, setCurrentDuration] = useState<number>(0);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getTodayAttendanceInfo = useCallback(async () => {
    try {
      const response = await api.get(
        `/attendance/daily-info/${currentUser?.idUser}`,
        {
          params: {
            currentDate: getLocalISOTime().slice(0, 10),
          },
          headers: { "Content-Type": "application/json" },
        }
      );
      setSelectedAttendance(response.data);
    } catch (exception) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      setResponse(error.response?.data || null);
    }
  }, [currentUser?.idUser]);

  const handleBreakIn = async () => {
    setResponse(null);
    setIsLoading(true);

    try {
      const requestParams = new URLSearchParams();
      requestParams.append("currentDateTime", getLocalISOTime());

      const response = await api.put(
        `/attendance/break-in/${selectedAttendance?.id}`,
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
      setIsDialogOpen(true);
      setIsLoading(false);
      getTodayAttendanceInfo();
    }
  };

  const handleBreakOut = async () => {
    setResponse(null);
    setIsLoading(true);

    try {
      const requestParams = new URLSearchParams();
      requestParams.append("currentDateTime", getLocalISOTime());

      const response = await api.put(
        `/attendance/break-out/${selectedAttendance?.id}`,
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
      setIsDialogOpen(true);
      setIsLoading(false);
      getTodayAttendanceInfo();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  useEffect(() => {
    getTodayAttendanceInfo();
  }, [getTodayAttendanceInfo]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      // Update displayed current time
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );

      if (selectedAttendance?.breakIn) {
        const breakInTime = new Date(selectedAttendance.breakIn);
        const breakOutTime = selectedAttendance.breakOut
          ? new Date(selectedAttendance.breakOut)
          : null;

        // Calculate duration
        const endTime = breakOutTime ?? now; // if still on break, use current date
        const seconds = Math.floor(
          (endTime.getTime() - breakInTime.getTime()) / 1000
        );
        setCurrentDuration(seconds);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedAttendance?.breakIn, selectedAttendance?.breakOut]);

  if (!currentStore) {
    return (
      <UnavailableCard
        icon={Store}
        title="Belum Ada Toko yang Ditugaskan"
        message="Anda belum ditambahkan ke toko mana pun. Silakan hubungi administrator untuk mendapatkan penugasan toko."
      />
    );
  }

  if (!currentUser?.idSchedule) {
    return (
      <UnavailableCard
        icon={CalendarX2}
        title="Belum Ada Jadwal"
        message="Jadwal kerja Anda belum ditetapkan. Silakan hubungi administrator untuk mendapatkan penugasan jadwal."
      />
    );
  }

  if (selectedAttendance?.type == "LEAVE") {
    return (
      <UnavailableCard
        icon={ClockFading}
        title="Anda sedang izin"
        message="Anda sedang dalam masa izin. Akses ke fitur ini akan tersedia kembali setelah masa izin berakhir."
      />
    );
  }

  return (
    <div className="flex flex-col items-center mt-10 sm:mt-14 px-3 sm:px-4">
      <Card className="w-full max-w-sm sm:max-w-md shadow-md rounded-xl border">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Daily Break
          </CardTitle>
          <p className="text-[11px] sm:text-xs text-muted-foreground">
            {currentTime}, {formatDate(new Date().toLocaleString())}
          </p>
        </CardHeader>

        <Separator className="mb-1" />

        <CardContent className="space-y-3 sm:space-y-4 text-center">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Status presensi saat ini
            </p>
            <p className="text-sm sm:text-base font-medium">
              {!selectedAttendance
                ? "Belum Clock In"
                : selectedAttendance.clockOut
                ? "Sudah Clock Out"
                : selectedAttendance.breakOut
                ? "Sudah Break Out"
                : selectedAttendance.breakIn
                ? "Sudah Break In"
                : "Sudah Clock In"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
            <div className="p-2.5 sm:p-3 rounded-lg border bg-muted/30">
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                Durasi istirahat yang dilakukan
              </p>
              <p className="text-sm sm:text-base font-semibold pt-2">
                {currentDuration ? formatDuration(currentDuration) : "—"}
              </p>
            </div>

            <div className="p-2.5 sm:p-3 rounded-lg border bg-muted/30">
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                Durasi istirahat yang berlaku
              </p>
              <p className="text-sm sm:text-base font-semibold pt-2">
                {currentStore.breakDuration}m
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center">
          <Button
            className="flex items-center gap-2 w-full sm:w-auto h-8 text-xs"
            disabled={
              selectedAttendance == null ||
              selectedAttendance.breakIn != null ||
              selectedAttendance.clockOut != null ||
              isLoading
            }
            onClick={handleBreakIn}
          >
            {isLoading ? (
              <>
                <Spinner className="w-3.5 h-3.5" /> Processing...
              </>
            ) : (
              <>
                <PlayCircle className="w-3.5 h-3.5" />
                Break In
              </>
            )}
          </Button>

          <Button
            variant="destructive"
            className="flex items-center gap-2 w-full sm:w-auto h-8 text-xs"
            disabled={
              selectedAttendance == null ||
              selectedAttendance.breakIn == null ||
              selectedAttendance.breakOut != null ||
              isLoading
            }
            onClick={handleBreakOut}
          >
            {isLoading ? (
              <>
                <Spinner className="w-3.5 h-3.5" /> Processing ...
              </>
            ) : (
              <>
                <PauseCircle className="w-3.5 h-3.5" />
                Break Out
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

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
              <AlertDialogAction onClick={() => setIsDialogOpen(false)}>
                Ok
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
