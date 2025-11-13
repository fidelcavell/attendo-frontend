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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLoginContext } from "@/hooks/useLogin";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import type { AxiosError } from "axios";
import { Info, MapPin } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

export default function AddStorePage() {
  const { currentUser, getUserData } = useLoginContext();
  const navigate = useNavigate();

  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const [store, setStore] = useState({
    name: "",
    address: "",
    lat: "",
    lng: "",
    radius: "",
    breakDuration: "",
    maxBreakCount: "",
    lateClockInPenaltyAmount: "",
    lateBreakOutPenaltyAmount: "",
    multiplierOvertime: "",
  });

  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSetCurrentLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported!");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setStore({
          ...store,
          lat: position.coords.latitude.toString(),
          lng: position.coords.longitude.toString(),
        });
      },
      (err) => alert("Failed to get current location: " + err.message)
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setResponse(null);
    setOpenDialog(false);

    try {
      const response = await api.post(`/store/${currentUser?.username}`, store, {
        headers: {
          "Content-Type": "application/json",
        },
      });
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
      <div className="flex w-full max-w-6xl flex-col gap-6">
        <div className="grid gap-2">
          <div className="text-xl font-semibold">
            Hi, Welcome {currentUser?.username}
          </div>
          <div className="text-[14px]">
            Please set up your store information!
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-6 w-full">
                      {/* Store Name */}
                      <div className="grid gap-3">
                        <Label htmlFor="name">Store Name</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter store name"
                          value={store.name}
                          onChange={(event) =>
                            setStore({ ...store, name: event.target.value })
                          }
                          required
                        />
                      </div>

                      {/* Break Settings */}
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-row gap-3">
                          <div className="w-1/2">
                            <Label htmlFor="break-duration">
                              Break duration (in minutes)
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Info className="size-4" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Individual rest and meal duration per
                                    employee
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </Label>
                            <Input
                              className="mt-2"
                              id="break-duration"
                              type="number"
                              placeholder="Enter break duration"
                              value={store.breakDuration}
                              onChange={(event) =>
                                setStore({
                                  ...store,
                                  breakDuration: event.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="w-1/2">
                            <Label htmlFor="max-break-count">
                              Max break count
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Info className="size-4" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Maximum number of employees allowed to rest
                                    at the same time
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </Label>
                            <Input
                              className="mt-2"
                              id="max-break-count"
                              type="number"
                              placeholder="Enter max break count"
                              value={store.maxBreakCount}
                              onChange={(event) =>
                                setStore({
                                  ...store,
                                  maxBreakCount: event.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Penalty Settings */}
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-row gap-3">
                          <div className="w-1/2">
                            <Label htmlFor="clock-in-penalty">
                              Late Clock in Penalty (in rupiah)
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Info className="size-4" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Salary deduction applied when an employee
                                    arrives after the scheduled time
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </Label>
                            <Input
                              className="mt-2"
                              id="clock-in-penalty"
                              type="number"
                              placeholder="Enter penalty amount (eg. 10000)"
                              value={store.lateClockInPenaltyAmount}
                              onChange={(event) =>
                                setStore({
                                  ...store,
                                  lateClockInPenaltyAmount: event.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="w-1/2">
                            <Label htmlFor="break-out-penalty">
                              Late Break out penalty (in rupiah)
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Info className="size-4" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Salary deduction applied when an employee
                                    rests beyond the allocated break time
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </Label>
                            <Input
                              className="mt-2"
                              id="break-out-penalty"
                              type="number"
                              placeholder="Enter penalty amount (eg. 10000)"
                              value={store.lateBreakOutPenaltyAmount}
                              onChange={(event) =>
                                setStore({
                                  ...store,
                                  lateBreakOutPenaltyAmount: event.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Overtime and Radius */}
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-row gap-3">
                          <div className="w-1/2">
                            <Label htmlFor="overtime-multiplier">
                              Overtime multiplier
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Info className="size-4" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Multiplier applied to base salary for
                                    overtime pay
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </Label>
                            <Input
                              className="mt-2"
                              id="overtime-multiplier"
                              type="number"
                              step="0.1"
                              placeholder="Enter multiplier (eg. 1.2 = 120%)"
                              value={store.multiplierOvertime}
                              onChange={(event) =>
                                setStore({
                                  ...store,
                                  multiplierOvertime: event.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="w-1/2">
                            <Label htmlFor="radius">Radius (in meter)</Label>
                            <Input
                              className="mt-2"
                              id="radius"
                              type="number"
                              placeholder="Enter radius"
                              value={store.radius}
                              onChange={(event) =>
                                setStore({
                                  ...store,
                                  radius: event.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="grid gap-3">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          placeholder="Enter store address"
                          value={store.address}
                          onChange={(event) =>
                            setStore({ ...store, address: event.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    {/* Right Column - Map */}
                    <div className="flex flex-col gap-4">
                      <div className="w-full h-[300px] rounded-lg border overflow-hidden">
                        {position ? (
                          <APIProvider apiKey="AIzaSyAvl5i7s8MeMKpCtor0KRXkW_ClEFPOD2A">
                            <div style={{ height: "100%", width: "100%" }}>
                              <Map
                                defaultCenter={position}
                                defaultZoom={16}
                                onClick={(event) => {
                                  if (!event.detail.latLng) return;
                                  const { lat, lng } = event.detail.latLng;
                                  setPosition({ lat, lng });
                                  setStore({
                                    ...store,
                                    lat: lat.toString(),
                                    lng: lng.toString(),
                                  });
                                }}
                              >
                                <Marker position={position} />
                              </Map>
                            </div>
                          </APIProvider>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                              <MapPin className="size-8 mx-auto mb-2" />
                              <p>Click "Set Store Location" to load map</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        className="w-full"
                        onClick={handleSetCurrentLocation}
                      >
                        Set Store Location
                      </Button>
                    </div>
                  </div>
                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-10 mb-4"
                    disabled={loading}
                  >
                    {loading ? <Spinner className="size-6" /> : "Create Store"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Response Dialog */}
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
                    navigate("/app/dashboard", { replace: true });
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
