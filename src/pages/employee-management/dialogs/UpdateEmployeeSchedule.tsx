import api from "@/api/api-config";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import type { Profile, Schedule } from "@/data/dataTypes";
import { useLoginContext } from "@/hooks/useLogin";
import type { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";

interface UpdateEmployeeScheduleProps {
  isOpen: boolean;
  setIsOpen: (value: React.SetStateAction<boolean>) => void;
  selectedProfile: Profile;
  setResponse: (
    value: React.SetStateAction<{
      success: boolean;
      message: string;
    } | null>
  ) => void;
  setResponseDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function UpdateEmployeeSchedule({
  isOpen,
  setIsOpen,
  selectedProfile,
  setResponse,
  setResponseDialog,
}: UpdateEmployeeScheduleProps) {
  const { currentStore, currentUser } = useLoginContext();

  const [selectedSchedule, setSelectedSchedule] = useState(
    selectedProfile.idSchedule?.toString() ?? ""
  );
  const [availableSchedules, setAvailableSchedules] = useState<Schedule[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const onUpdateSchedule = async () => {
    setResponse(null);
    setIsLoading(true);

    try {
      const requestParams = new URLSearchParams();
      requestParams.append("schedule", selectedSchedule);
      requestParams.append("currentUser", currentUser?.username ?? "");

      const response = await api.put(
        `/profile/assign-schedule/${selectedProfile?.id}`,
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
      setSelectedSchedule("");
      setIsOpen(false);
      setResponseDialog(true);
      setIsLoading(false);
    }
  };

  const getAllSchedule = useCallback(async () => {
    try {
      const response = await api.get(`/schedule/store/${currentStore?.id}`);
      setAvailableSchedules(response.data);
    } catch (exception) {
      console.log("Error on getAllSchedule function: " + exception);
    }
  }, [currentStore]);

  useEffect(() => {
    getAllSchedule();
  }, [getAllSchedule]);

  useEffect(() => {
    if (selectedProfile?.idSchedule && availableSchedules.length > 0) {
      setSelectedSchedule(selectedProfile.idSchedule.toString());
    }
  }, [availableSchedules.length, selectedProfile.idSchedule]);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Update {selectedProfile.username}'s work schedule
          </AlertDialogTitle>
          <AlertDialogDescription>
            Select on available schedule below
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div>
          <Label className="my-4">Available work schedule</Label>
          <Select
            value={selectedSchedule}
            onValueChange={(value) => setSelectedSchedule(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select schedule" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {availableSchedules?.map((schedule) => {
                  const startTime = schedule.startTime
                    ?.split(":")
                    .slice(0, 2)
                    .join(".");
                  const endTime = schedule.endTime
                    ?.split(":")
                    .slice(0, 2)
                    .join(".");
                  return (
                    <SelectItem
                      key={schedule.id}
                      value={schedule.id.toString()}
                    >
                      {startTime} WIB - {endTime} WIB
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setSelectedSchedule("")}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onUpdateSchedule}>
            {isLoading ? (
              <>
                <Spinner className="size-4 mr-2" /> Updating...
              </>
            ) : (
              "Update"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
