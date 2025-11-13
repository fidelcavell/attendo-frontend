import api from "@/api/api-config";
import Loading from "@/components/shared/Loading";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Info,
  Store,
  MapPin,
  Settings,
  DollarSign,
  Clock,
  Navigation,
} from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";

export default function DetailTokoPage() {
  const { currentUser, currentStore, getAllOwnedStore } = useLoginContext();

  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [store, setStore] = useState<any>({
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

  const [isUpdate, setIsUpdate] = useState(false);
  const [isActivation, setIsActivation] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const getTokoById = useCallback(async () => {
    if (!currentStore) return;

    try {
      const response = await api.get(`/store/${currentStore.id}`);
      setStore(response.data);
      setPosition({
        lat: response.data.lat,
        lng: response.data.lng,
      });
      console.log(response.data);
    } catch (exception) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      setResponse(error.response?.data || null);
    }
  }, [currentStore]);

  const onSetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setResponse({ success: false, message: "Geolocation not supported!" });
      setOpenDialog(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setResponse({
          success: false,
          message: `Failed to get current location: No Internet Connection! Please turn on your GPS feature`,
        });
        setOpenDialog(true);
      }
    );
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setResponse(null);

    try {
      const response = await api.put(`/store/${currentStore?.id}`, store, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setResponse(response.data);
    } catch (exception: unknown) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      setResponse(error.response?.data || null);
    } finally {
      setOpenDialog(true);
      setIsLoading(false);
      setIsUpdate(false);
    }
  };

  const onActivation = async () => {
    setResponse(null);
    setIsLoading(true);

    try {
      const response = await api.put(
        `/store/store-activation/${currentStore?.id}`
      );
      setResponse(response.data);
    } catch (exception: unknown) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      setResponse(error.response?.data || null);
    } finally {
      setIsActivation(false);
      setOpenDialog(true);
      if (currentUser) {
        getAllOwnedStore(currentUser.username);
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getTokoById();
  }, [getTokoById]);

  if (!store) {
    return <Loading message="Detail Store" />;
  }

  return (
    <>
      <div className="space-y-6 px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Store Details</h1>
            <p className="text-gray-600">
              Manage store information and settings
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Store Info & Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Store Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="size-5 text-gray-700" />
                    Store Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">
                      Store Name
                    </Label>
                    <Input
                      className="mt-2"
                      id="name"
                      type="text"
                      placeholder="Enter store name"
                      value={store.name}
                      onChange={(event) =>
                        setStore({ ...store, name: event.target.value })
                      }
                      readOnly={!isUpdate}
                      required
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="address"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <MapPin className="size-4" />
                      Address
                    </Label>
                    <Textarea
                      className="mt-2"
                      id="address"
                      placeholder="Enter store address"
                      value={store.address}
                      onChange={(event) =>
                        setStore({ ...store, address: event.target.value })
                      }
                      readOnly={!isUpdate}
                      rows={3}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Break Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="size-5 text-gray-700" />
                    Break Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="break-duration"
                        className="text-sm font-medium"
                      >
                        Break Duration (minutes)
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex items-center ml-1 text-gray-400 hover:text-gray-600"
                            >
                              <Info className="size-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Individual rest and meal duration per employee
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        className="mt-2"
                        id="break-duration"
                        placeholder="e.g. 60"
                        value={store.breakDuration}
                        onChange={(event) =>
                          setStore({
                            ...store,
                            breakDuration: event.target.value,
                          })
                        }
                        readOnly={!isUpdate}
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="max-break-count"
                        className="text-sm font-medium"
                      >
                        Max Break Count
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex items-center ml-1 text-gray-400 hover:text-gray-600"
                            >
                              <Info className="size-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Maximum number of employees allowed to rest at the
                              same time
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        className="mt-2"
                        id="max-break-count"
                        placeholder="e.g. 5"
                        value={store.maxBreakCount}
                        onChange={(event) =>
                          setStore({
                            ...store,
                            maxBreakCount: event.target.value,
                          })
                        }
                        readOnly={!isUpdate}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Penalty & Overtime Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="size-5 text-gray-700" />
                    Penalty & Overtime Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="clock-in-penalty"
                        className="text-sm font-medium"
                      >
                        Late Clock In Penalty (Rupiah)
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex items-center ml-1 text-gray-400 hover:text-gray-600"
                            >
                              <Info className="size-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Salary deduction applied when an employee arrives
                              after the scheduled time
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        className="mt-2"
                        id="clock-in-penalty"
                        placeholder="e.g. 10000"
                        value={store.lateClockInPenaltyAmount}
                        onChange={(event) =>
                          setStore({
                            ...store,
                            lateClockInPenaltyAmount: event.target.value,
                          })
                        }
                        readOnly={!isUpdate}
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="break-out-penalty"
                        className="text-sm font-medium"
                      >
                        Late Break Out Penalty (Rupiah)
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex items-center ml-1 text-gray-400 hover:text-gray-600"
                            >
                              <Info className="size-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Salary deduction applied when an employee rests
                              beyond the allocated break time
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        className="mt-2"
                        id="break-out-penalty"
                        placeholder="e.g. 10000"
                        value={store.lateBreakOutPenaltyAmount}
                        onChange={(event) =>
                          setStore({
                            ...store,
                            lateBreakOutPenaltyAmount: event.target.value,
                          })
                        }
                        readOnly={!isUpdate}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="overtime-multiplier"
                        className="text-sm font-medium"
                      >
                        Overtime Multiplier
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex items-center ml-1 text-gray-400 hover:text-gray-600"
                            >
                              <Info className="size-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Multiplier applied to base salary for overtime
                              date
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        className="mt-2"
                        id="overtime-multiplier"
                        placeholder="e.g. 1.2 (120%)"
                        value={store.multiplierOvertime}
                        onChange={(event) =>
                          setStore({
                            ...store,
                            multiplierOvertime: event.target.value,
                          })
                        }
                        readOnly={!isUpdate}
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="radius"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <Settings className="size-4" />
                        Radius (meters)
                      </Label>
                      <Input
                        className="mt-2"
                        id="radius"
                        placeholder="e.g. 100"
                        value={store.radius}
                        onChange={(event) =>
                          setStore({ ...store, radius: event.target.value })
                        }
                        readOnly={!isUpdate}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Map */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="size-5 text-gray-700" />
                    Store Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="w-full h-[300px] sm:h-[350px] rounded-lg border overflow-hidden bg-gray-50">
                    {position ? (
                      <APIProvider
                        apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}
                      >
                        <div style={{ height: "100%", width: "100%" }}>
                          <Map
                            defaultCenter={position}
                            defaultZoom={16}
                            onClick={(event) => {
                              console.log(position);
                              if (!isUpdate) return;
                              if (!event.detail.latLng) return;
                              const { lat, lng } = event.detail.latLng;
                              setPosition({ lat, lng });
                              setStore({ ...store, lat: lat, lng: lng });
                            }}
                          >
                            <Marker position={position} />
                          </Map>
                        </div>
                      </APIProvider>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center space-y-2">
                          <Spinner className="size-6 mx-auto" />
                          <p className="text-sm">Loading map...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    className="w-full"
                    variant="outline"
                    disabled={!isUpdate}
                    onClick={() => onSetCurrentLocation()}
                  >
                    <Navigation className="size-4 mr-2" />
                    Use Current Location
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
            {!isUpdate ? (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setIsActivation(true)}
                  className="min-w-[120px]"
                >
                  {currentStore?.active ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    setIsUpdate(true);
                  }}
                  className="min-w-[120px]"
                >
                  Edit Store
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsUpdate(false);
                  }}
                  className="min-w-[120px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <Spinner className="size-4 mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </>
            )}
          </div>
        </form>
      </div>

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
              <AlertDialogAction onClick={() => setOpenDialog(false)}>
                Ok
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <AlertDialog open={isActivation} onOpenChange={setIsActivation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure want to{" "}
              {currentStore?.active ? "deactivate" : "activate"} store:{" "}
              <span className="font-semibold">{currentStore?.name}</span> ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onActivation}>
              {isLoading ? (
                <>
                  <Spinner className="size-4 mr-2" />{" "}
                  {currentStore?.active ? "Deactivating..." : "Activating..."}
                </>
              ) : (
                <>{currentStore?.active ? "Deactivate" : "Activate"}</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
