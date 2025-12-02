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
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Schedule } from "@/types/dataTypes";
import { useLoginContext } from "@/hooks/useLogin";
import { useCallback, useEffect, useState } from "react";
import { AlarmClock, Calendar, Clock, Plus } from "lucide-react";
import Loading from "@/components/shared/Loading";
import AddUpdateScheduleDialog from "./dialogs/AddUpdateScheduleDialog";
import DeleteScheduleDialog from "./dialogs/DeleteScheduleDialog";

export default function SchedulePage() {
  const { currentUser, currentStore } = useLoginContext();

  const [schedules, setSchedules] = useState<Schedule[] | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );

  const [isAddOrUpdateSchedule, setIsAddOrUpdateSchedule] = useState(false);
  const [isDeleteSchedule, setIsDeleteSchedule] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const getAllSchedule = useCallback(async () => {
    try {
      const response = await api.get(`/schedule/store/${currentStore?.id}`);
      setSchedules(response.data);
    } catch (error) {
      console.log("Error on getAllSchedule function: " + error);
    }
  }, [currentStore]);

  useEffect(() => {
    getAllSchedule();
  }, [getAllSchedule]);

  const addOrUpdateDialog = (schedule?: Schedule) => {
    if (schedule !== undefined) {
      // Update mode
      setSelectedSchedule(schedule);
    } else {
      // Add mode
      setSelectedSchedule(null);
    }
    setIsAddOrUpdateSchedule(true);
  };

  if (!schedules) {
    return <Loading message="Daftar Jadwal Kerja" />;
  }

  return (
    <>
      <div className="px-4 sm:px-6 w-full">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Jadwal Kerja
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => addOrUpdateDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Jadwal Kerja
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {schedules.length > 0 ? (
            schedules.map((schedule) => {
              const startTime = schedule.startTime
                ?.split(":")
                .slice(0, 2)
                .join(".");
              const endTime = schedule.endTime
                ?.split(":")
                .slice(0, 2)
                .join(".");

              return (
                <Card key={schedule.id} className="border">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg md:text-xl flex items-center mb-4">
                          {schedule.name}
                        </CardTitle>
                        <CardDescription className="mt-2 text-sm md:text-base">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="px-2 py-1">
                              <Clock className="mr-1 h-3.5 w-3.5" />
                              {startTime} - {endTime} WIB
                            </Badge>
                            <Badge variant="outline" className="px-2 py-1">
                              <AlarmClock className="mr-1 h-3.5 w-3.5" />
                              Batas keterlambatan {schedule.lateTolerance} minutes
                            </Badge>
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex flex-wrap gap-2">
                    <Button
                      className="hover:bg-sky-700"
                      size="sm"
                      onClick={() => addOrUpdateDialog(schedule)}
                    >
                      Update
                    </Button>
                    {currentUser?.role == "ROLE_OWNER" ? (
                      <Button
                        className="hover:bg-red-700"
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedSchedule(schedule);
                          setIsDeleteSchedule(true);
                        }}
                      >
                        Delete
                      </Button>
                    ) : null}
                  </CardFooter>
                </Card>
              );
            })
          ) : (
            <div className="flex justify-center col-span-full mt-16">
              <div className="w-full sm:w-[80%] md:w-[60%] text-center border rounded-lg p-8">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold">
                  Belum ada jadwal kerja
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Buat jadwal kerja pertama Anda untuk mulai menggunakan fitur
                  ini.
                </p>
                <div className="mt-4">
                  <Button onClick={() => addOrUpdateDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah jadwal kerja
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Response Dialog */}
      {response && (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent className="max-w-[90%] sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {response.success ? "Success" : "Error"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {response.message}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>Ok</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Shared Dialog for Add and Update */}
      <AddUpdateScheduleDialog
        isOpen={isAddOrUpdateSchedule}
        setIsOpen={setIsAddOrUpdateSchedule}
        selectedSchedule={selectedSchedule}
        setResponse={setResponse}
        setResponseDialog={setIsDialogOpen}
        onRefresh={getAllSchedule}
      />

      {/* Delete Schedule alert dialog */}
      {selectedSchedule && (
        <DeleteScheduleDialog
          isOpen={isDeleteSchedule}
          setIsOpen={setIsDeleteSchedule}
          selectedSchedule={selectedSchedule}
          setResponse={setResponse}
          setResponseDialog={setIsDialogOpen}
          onRefresh={getAllSchedule}
        />
      )}
    </>
  );
}
