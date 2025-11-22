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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type { Schedule } from "@/data/dataTypes";
import { useLoginContext } from "@/hooks/useLogin";
import type { AxiosError } from "axios";
import { useEffect, useState, type FormEvent } from "react";

interface AddUpdateScheduleDialogProps {
  isOpen: boolean;
  setIsOpen: (value: React.SetStateAction<boolean>) => void;
  selectedSchedule: Schedule | null;
  setResponse: (
    value: React.SetStateAction<{
      success: boolean;
      message: string;
    } | null>
  ) => void;
  setResponseDialog: (value: React.SetStateAction<boolean>) => void;
  onRefresh: () => Promise<void>;
}

export default function AddUpdateScheduleDialog({
  isOpen,
  setIsOpen,
  selectedSchedule,
  setResponse,
  setResponseDialog,
  onRefresh,
}: AddUpdateScheduleDialogProps) {
  const { currentUser, currentStore } = useLoginContext();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    startTime: "",
    endTime: "",
    lateTolerance: "",
  });

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setResponse(null);
    setIsLoading(true);

    try {
      const response = selectedSchedule
        ? await api.put(
            `/schedule/${selectedSchedule.id}?currentLoggedIn=${currentUser?.username}`,
            form
          )
        : await api.post(
            `/schedule/${currentStore?.id}?currentLoggedIn=${currentUser?.username}`,
            form
          );
      setResponse(response.data);
      setIsOpen(false);
    } catch (exception) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      setResponse(error.response?.data || null);
    } finally {
      setResponseDialog(true);
      onRefresh();
      setIsLoading(false);
      setForm({
        name: "",
        startTime: "",
        endTime: "",
        lateTolerance: "",
      });
    }
  };

  useEffect(() => {
    if (selectedSchedule) {
      setForm({
        name: selectedSchedule.name,
        startTime: selectedSchedule.startTime,
        endTime: selectedSchedule.endTime,
        lateTolerance: String(selectedSchedule.lateTolerance),
      });
    } else {
      setForm({
        name: "",
        startTime: "",
        endTime: "",
        lateTolerance: "",
      });
    }
  }, [selectedSchedule]);

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-[90%] sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {selectedSchedule ? "Update Schedule" : "Add New Schedule"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {selectedSchedule
              ? "Modify the existing schedule below"
              : "Fill in the details below to create a new schedule"}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <div>
            <Label className="mt-4 mb-2" htmlFor="name">
              Schedule name *
            </Label>
            <Input
              id="name"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              placeholder="Enter schedule's name"
              required
            />
          </div>
          <div>
            <Label className="mt-4 mb-2" htmlFor="late-tolerance">
              Late tolerance (minutes) *
            </Label>
            <Input
              id="late-tolerance"
              type="number"
              value={form.lateTolerance}
              onChange={(event) =>
                setForm({ ...form, lateTolerance: event.target.value })
              }
              placeholder="Enter late tolerate"
              required
            />
          </div>

          <div>
            <Label className="mt-4 mb-2" htmlFor="start-time">
              Start time *
            </Label>
            <Input
              id="start-time"
              type="time"
              value={form.startTime}
              onChange={(event) =>
                setForm({ ...form, startTime: event.target.value })
              }
              required
            />
          </div>

          <div>
            <Label className="mt-4 mb-2" htmlFor="end-time">
              End time *
            </Label>
            <Input
              id="end-time"
              type="time"
              value={form.endTime}
              onChange={(event) =>
                setForm({ ...form, endTime: event.target.value })
              }
              required
            />
          </div>

          <AlertDialogFooter className="mt-6 col-span-full flex flex-col sm:flex-row gap-2 sm:justify-end">
            <AlertDialogCancel
              className="w-full sm:w-auto"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <button type="submit" className="w-full sm:w-auto">
                {selectedSchedule ? (
                  <>
                    {isLoading ? (
                      <>
                        <Spinner className="size-4 mr-2" /> Updating...
                      </>
                    ) : (
                      "Update"
                    )}
                  </>
                ) : (
                  <>
                    {isLoading ? (
                      <>
                        <Spinner className="size-4 mr-2" /> Submitting...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </>
                )}
              </button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
