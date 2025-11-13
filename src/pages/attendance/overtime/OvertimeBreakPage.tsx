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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Attendance } from "@/data/dataTypes";
import { formatDate, getLocalISOTime } from "@/helper/Formatter";
import { useLoginContext } from "@/hooks/useLogin";
import type { AxiosError } from "axios";
import { Clock, Info, PauseCircle, PlayCircle, Store } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function OvertimeBreakPage() {
  const { currentUser, currentStore } = useLoginContext();

  const [selectedOvertime, setSelectedOvertime] = useState<Attendance | null>(
    null
  );

  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  );
  const [currentDuration, setCurrentDuration] = useState<number>(0);

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

  const handleBreakIn = async () => {
    setResponse(null);

    try {
      const requestParams = new URLSearchParams();
      requestParams.append("currentDateTime", getLocalISOTime());

      const response = await api.put(
        `/attendance/break-in/${selectedOvertime?.id}`,
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
      getTodayOvertimeInfo();
    }
  };

  const handleBreakOut = async () => {
    setResponse(null);

    try {
      const requestParams = new URLSearchParams();
      requestParams.append("currentDateTime", getLocalISOTime());

      const response = await api.put(
        `/attendance/break-out/${selectedOvertime?.id}`,
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
      getTodayOvertimeInfo();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  useEffect(() => {
    getTodayOvertimeInfo();
  }, [getTodayOvertimeInfo]);

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

      if (selectedOvertime?.breakIn) {
        const breakInTime = new Date(selectedOvertime.breakIn);
        const breakOutTime = selectedOvertime.breakOut
          ? new Date(selectedOvertime.breakOut)
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
  }, [selectedOvertime?.breakIn, selectedOvertime?.breakOut]);

  if (!currentStore) {
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
    <div className="flex flex-col items-center mt-10 sm:mt-14 px-3 sm:px-4">
      <Card className="w-full max-w-sm sm:max-w-md shadow-md rounded-xl border">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Overtime Break
          </CardTitle>
          <p className="text-[11px] sm:text-xs text-muted-foreground">
            {currentTime}, {formatDate(new Date().toLocaleString())}
          </p>
        </CardHeader>

        <Separator className="mb-1" />

        <CardContent className="space-y-3 sm:space-y-4 text-center">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Current Attendance Status
            </p>
            <p className="text-sm sm:text-base font-medium">
              {!selectedOvertime
                ? "Not clocked in yet"
                : selectedOvertime.clockOut
                ? "Clocked Out"
                : selectedOvertime.breakOut
                ? "Break Out"
                : selectedOvertime.breakIn
                ? "Break In"
                : "Clocked In"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
            <div className="p-2.5 sm:p-3 rounded-lg border bg-muted/30">
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                Current Duration
              </p>
              <p className="text-sm sm:text-base font-semibold">
                {currentDuration ? formatDuration(currentDuration) : "—"}
              </p>
            </div>

            <div className="p-2.5 sm:p-3 rounded-lg border bg-muted/30">
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                Allowed Duration
              </p>
              <p className="text-sm sm:text-base font-semibold">60m</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center">
          <Button
            className="flex items-center gap-2 w-full sm:w-auto h-8 text-xs"
            disabled={
              selectedOvertime.clockIn == null ||
              selectedOvertime.breakIn != null ||
              selectedOvertime.clockOut != null
            }
            onClick={handleBreakIn}
          >
            <PlayCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Break In
          </Button>

          <Button
            variant="destructive"
            className="flex items-center gap-2 w-full sm:w-auto h-8 text-xs"
            disabled={
              selectedOvertime == null ||
              selectedOvertime.breakIn == null ||
              selectedOvertime.breakOut != null
            }
            onClick={handleBreakOut}
          >
            <PauseCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Break Out
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
