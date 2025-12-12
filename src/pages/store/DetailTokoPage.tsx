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
  Navigation,
} from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";

export default function DetailTokoPage() {
  const { currentUser, currentStore, getAllOwnedStore } = useLoginContext();

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
    currentBreakCount: "",
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
    } catch (exception) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      setResponse(error.response?.data || null);
    }
  }, [currentStore]);

  // Checking user's current used device
  const isMobileDevice = () => {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  };

  const onSetCurrentLocation = () => {
    if (!isMobileDevice()) {
      setResponse({
        success: false,
        message:
          "Fitur ini memerlukan GPS dari perangkat mobile Anda untuk mendapatkan data lokasi yang akurat!",
      });
      setOpenDialog(true);
      return;
    }

    if (!navigator.geolocation) {
      setResponse({
        success: false,
        message: "Fitur geolokasi tidak didukung pada perangkat Anda!",
      });
      setOpenDialog(true);
      return;
    }

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
      () => {
        setResponse({
          success: false,
          message: `Gagal mendapatkan lokasi saat ini: Tidak ada koneksi internet atau GPS belum diaktifkan`,
        });
        setOpenDialog(true);
      }
    );
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setResponse(null);

    if (Number(store.currentBreakCount) < 0) {
      setIsLoading(false);
      setResponse({
        success: false,
        message: "Jumlah istirahat tidak boleh negatif!",
      });
      setOpenDialog(true);
      return;
    }

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
      if (currentUser) {
        getAllOwnedStore(currentUser.username);
      }
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
    return <Loading message="Detail Toko" />;
  }

  return (
    <>
      <div className="space-y-6 px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Detail Toko "{currentStore?.name}"
          </h1>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Store Info & Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Store Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="size-5 text-gray-700" />
                    Informasi Toko
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium">
                        Nama Toko
                      </Label>
                      <Input
                        className="mt-2"
                        id="name"
                        type="text"
                        placeholder="Enter nama toko"
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
                        htmlFor="break-duration"
                        className="text-sm font-medium"
                      >
                        Durasi Istirahat (in minute)
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
                            <p>Durasi istirahat dan makan per karyawan</p>
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
                        htmlFor="current-break"
                        className="text-sm font-medium"
                      >
                        Jumlah Karyawan yang Istirahat Saat Ini
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
                              Override jika terdapat jumlah data istirahat tidak
                              sesuai (default: 0)
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        className="mt-2"
                        id="current-break"
                        type="number"
                        placeholder="Enter jumlah istirahat saat ini"
                        value={store.currentBreakCount}
                        onChange={(event) =>
                          setStore({
                            ...store,
                            currentBreakCount: event.target.value,
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
                        Jumlah Maksimal Istirahat
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
                              Jumlah maksimal karyawan yang diperbolehkan
                              istirahat pada waktu yang sama
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
                  <div>
                    <Label
                      htmlFor="address"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <MapPin className="size-4" />
                      Alamat Toko
                    </Label>
                    <Textarea
                      className="mt-2"
                      id="address"
                      placeholder="Enter alamat toko"
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

              {/* Penalty & Overtime Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="size-5 text-gray-700" />
                    Pengaturan Penalti dan Lembur{" "}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="clock-in-penalty"
                        className="text-sm font-medium"
                      >
                        Penalti telat clock-in (in rupiah)
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
                              Potongan gaji yang diterapkan ketika karyawan
                              datang melewati waktu yang dijadwalkan
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
                        Penalti telat break-out (in rupiah)
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
                              Potongan gaji yang diterapkan ketika karyawan
                              beristirahat melebihi waktu istirahat yang
                              dialokasikan
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
                        Koefisien Lembur
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
                              Pengali yang diterapkan pada gaji pokok untuk
                              tanggal lembur
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        className="mt-2"
                        id="overtime-multiplier"
                        placeholder="Enter koefisien (eg. 1.2 = 120%)"
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
                        Radius Presensi (in meter)
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
                    Lokasi Toko
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="w-full h-[300px] sm:h-[350px] rounded-lg border overflow-hidden bg-gray-50">
                    {position ? (
                      <APIProvider
                        apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}
                      >
                        <div style={{ height: "100%", width: "100%" }}>
                          <Map defaultCenter={position} defaultZoom={16}>
                            <Marker position={position} />
                          </Map>
                        </div>
                      </APIProvider>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center space-y-2">
                          <Spinner className="size-6 mx-auto" />
                          <p className="text-sm">Memuat map...</p>
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
                    Gunakan Lokasi Saat Ini
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
                  Edit Toko
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="min-w-[120px]"
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsUpdate(false);
                    getTokoById();
                  }}
                  disabled={isLoading}
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
                    "Save"
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
            <AlertDialogTitle>Konfirmasi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin untuk{" "}
              {currentStore?.active ? "deaktivasi" : "aktivasi"} toko ini ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
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
