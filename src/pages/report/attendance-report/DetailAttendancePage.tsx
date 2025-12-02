import {
  Clock,
  Calendar,
  User,
  Camera,
  CheckCircle,
  XCircle,
  AlertCircle,
  Coffee,
  ArrowRight,
  ClockFading,
  CameraOff,
  Banknote,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { useLoginContext } from "@/hooks/useLogin";
import { useCallback, useEffect, useState } from "react";
import type {
  AttendanceInfo,
  OvertimeApplication,
  Profile,
} from "@/types/dataTypes";
import api from "@/api/api-config";
import Loading from "@/components/shared/Loading";
import { formatDate, formatIDR } from "@/helper/Formatter";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import type { AxiosError } from "axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { AlertDialogTitle } from "@radix-ui/react-alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DetailAttendancePage() {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PRESENT":
        return {
          color: "text-green-700",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          icon: <CheckCircle className="size-4" />,
          label: "Hadir",
        };
      case "LATE":
        return {
          color: "text-amber-700",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          icon: <AlertCircle className="size-4" />,
          label: "Telat",
        };
      case "ABSENT":
        return {
          color: "text-red-700",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          icon: <XCircle className="size-4" />,
          label: "Absen",
        };
      case "LEAVE":
        return {
          color: "text-blue-700",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          icon: <ClockFading className="size-4" />,
          label: "Izin",
        };
      default:
        return {
          color: "text-gray-700",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          icon: <Clock className="size-4" />,
          label: "Unknown",
        };
    }
  };

  const { attendanceId } = useParams();
  const { currentUser } = useLoginContext();
  const navigate = useNavigate();

  const [selectedAttendance, setSelectedAttendance] =
    useState<AttendanceInfo | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedOvertimeApplication, setSelectedOvertimeApplication] =
    useState<OvertimeApplication | null>(null);

  const [profileUrl, setProfileUrl] = useState<string | undefined>(undefined);
  const [photoInUrl, setPhotoInUrl] = useState<string | undefined>(undefined);
  const [photoOutUrl, setPhotoOutUrl] = useState<string | undefined>(undefined);

  const [isUpdateAttendance, setIsUpdateAttendance] = useState(false);
  const [isDeleteAttendance, setIsDeleteAttendance] = useState(false);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);

  const [attendanceStatus, setAttendanceStatus] = useState("");
  const [deductionAmount, setDeductionAmount] = useState("");
  const [attendanceDescription, setAttendanceDescription] = useState("");

  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const getAttendanceDetail = useCallback(async () => {
    try {
      const response = await api.get(`/attendance/${attendanceId}`);
      setSelectedAttendance(response.data);
    } catch (exception) {
      console.log(exception);
    }
  }, [attendanceId]);

  useEffect(() => {
    if (selectedAttendance) {
      setDeductionAmount(
        selectedAttendance.attendanceData.deductionAmount.toString()
      );
      setAttendanceStatus(selectedAttendance.attendanceData.status);
      setAttendanceDescription(
        selectedAttendance.attendanceData.description ?? ""
      );
    }
  }, [selectedAttendance, isUpdateAttendance]);

  const getAttendancePhoto = useCallback(
    async (selectedPhotoType: string) => {
      try {
        if (!attendanceId) return;
        let objectUrl: string;

        api
          .get(`/attendance/photo/${attendanceId}`, {
            responseType: "blob",
            params: {
              type: selectedPhotoType,
            },
          })
          .then((res) => {
            objectUrl = URL.createObjectURL(res.data);
            if (selectedPhotoType === "IN") {
              setPhotoInUrl(objectUrl);
            } else {
              setPhotoOutUrl(objectUrl);
            }
          });

        return () => {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
      } catch (exception) {
        console.error(exception);
      }
    },
    [attendanceId]
  );

  useEffect(() => {
    if (attendanceId) {
      getAttendanceDetail();
      getAttendancePhoto("IN");
      if (selectedAttendance?.attendanceData.clockOut) {
        getAttendancePhoto("OUT");
      }
    }
  }, [
    attendanceId,
    getAttendanceDetail,
    getAttendancePhoto,
    selectedAttendance?.attendanceData.clockOut,
  ]);

  const getProfileInfo = useCallback(async () => {
    try {
      const response = await api.get(
        `/profile/${selectedAttendance?.attendanceData.idProfile}`
      );
      setSelectedProfile(response.data);
    } catch (exception) {
      console.error(exception);
    }
  }, [selectedAttendance?.attendanceData.idProfile]);

  const getProfilePicture = useCallback(async () => {
    if (!selectedProfile?.id) return;
    let objectUrl: string;

    api
      .get(`/profile/${selectedProfile?.id}/profile-picture`, {
        responseType: "blob",
      })
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data);
        setProfileUrl(objectUrl);
      });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [selectedProfile?.id]);

  const onDeleteAttendance = async () => {
    try {
      const response = await api.delete(
        `/attendance/${selectedAttendance?.attendanceData.id}`,
        {
          params: {
            currentLoggedIn: currentUser?.username,
          },
          headers: { "Content-Type": "application/json" },
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
      setIsResponseDialogOpen(true);
    }
  };

  const onUpdateAttendance = async () => {
    try {
      const requestParams = new URLSearchParams();
      requestParams.append("currentLoggedIn", currentUser?.username ?? "");
      requestParams.append("attendanceStatus", attendanceStatus);
      requestParams.append("deductionAmount", deductionAmount);
      requestParams.append("attendanceDescription", attendanceDescription);

      const response = await api.put(
        `/attendance/${selectedAttendance?.attendanceData.id}`,
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
      setIsResponseDialogOpen(true);
    }
  };

  useEffect(() => {
    if (selectedAttendance) {
      getProfileInfo();
      getProfilePicture();
    }
  }, [getProfileInfo, getProfilePicture, selectedAttendance]);

  const statusConfig = getStatusConfig(
    selectedAttendance?.attendanceData.status ?? ""
  );

  useEffect(() => {
    // only trigger timer if data is still not loaded
    if (!selectedAttendance) {
      const timer = setTimeout(() => {
        navigate("/not-found", { replace: true });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [selectedAttendance, navigate]);

  const getOvertimeApplication = useCallback(async () => {
    try {
      const response = await api.get(
        `/overtime/${selectedAttendance?.attendanceData.idOvertime}`
      );
      setSelectedOvertimeApplication(response.data);
    } catch (exception) {
      console.error(exception);
    }
  }, [selectedAttendance?.attendanceData.idOvertime]);

  useEffect(() => {
    if (selectedAttendance?.attendanceData.idOvertime) {
      getOvertimeApplication();
    }
  }, [getOvertimeApplication, selectedAttendance?.attendanceData.idOvertime]);

  if (!selectedAttendance) {
    return <Loading message="Detail Presensi" />;
  }

  return (
    <div className="min-h-screen p-2 md:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Detail Presensi
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border">
            <Calendar className="size-4" />
            {formatDate(selectedAttendance.attendanceData.clockIn ?? "")}
          </div>
        </div>

        {/* Employee Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <User className="size-5" />
                Informasi Karyawan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <img
                    src={profileUrl}
                    alt={selectedProfile?.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  />

                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {selectedAttendance.attendanceData.username}
                      </h3>
                      <p className="text-gray-600">
                        {selectedAttendance.attendanceData.name}
                      </p>
                    </div>

                    <Badge
                      className={`${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} border mt-1`}
                    >
                      <span className="mr-1">{statusConfig.icon}</span>
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-end items-start">
                  <Badge className="text-sm">
                    {selectedAttendance.attendanceData.type === "DAILY"
                      ? "Harian"
                      : "Lembur"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Banknote className="size-5" />
                Informasi Gaji
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                {/* Base Salary */}
                <div className="flex flex-col items-start gap-2 mb-4">
                  <p className="font-semibold">Gaji Kotor (per hari)</p>
                  <div className="text-gray-800 font-semibold">
                    {selectedOvertimeApplication
                      ? formatIDR(
                          Number(selectedOvertimeApplication?.overtimePay || 0)
                        )
                      : formatIDR(selectedAttendance.baseSalary)}
                  </div>
                </div>

                {/* Deduction Amount */}
                <div className="flex flex-col items-start gap-2">
                  <p className="font-semibold">Jumlah Potongan</p>
                  <div className="text-gray-800 font-semibold">
                    {formatIDR(
                      selectedAttendance.attendanceData.deductionAmount
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="size-5" />
              Deskripsi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 px-7">
              {selectedAttendance.attendanceData.description ??
                "Belum ada deskripsi yang ditambahkan!"}
            </p>
          </CardContent>
        </Card>

        {/* Clock In/Out Photos and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clock In */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Clock className="size-5" />
                Clock In
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                {photoInUrl &&
                selectedAttendance.attendanceData.type !== "LEAVE" ? (
                  <>
                    <img
                      src={photoInUrl}
                      alt="Clock In Photo"
                      className="w-full h-72 object-contain rounded-lg border"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-lg">
                      {selectedAttendance.attendanceData.clockIn?.replace(
                        "T",
                        " - "
                      )}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center">
                      <Camera className="size-3 inline mr-1" />
                      Clock In
                    </div>
                  </>
                ) : (
                  <div className="flex-col justify-center items-center w-full h-72 border border-dashed rounded-sm flex">
                    <CameraOff className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-gray-500">
                      Tidak ada data yag tersedia!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Clock Out */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Clock className="size-5" />
                Clock Out
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                {photoOutUrl &&
                selectedAttendance.attendanceData.type !== "LEAVE" ? (
                  <>
                    <img
                      src={photoOutUrl}
                      alt="Clock Out Photo"
                      className="w-full h-72 object-contain rounded-lg border"
                    />{" "}
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-lg">
                      {selectedAttendance.attendanceData.clockOut?.replace(
                        "T",
                        " - "
                      )}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center">
                      <Camera className="size-3 inline mr-1" />
                      Clock Out
                    </div>{" "}
                  </>
                ) : (
                  <div className="flex-col justify-center items-center w-full h-72 border border-dashed rounded-sm flex">
                    <CameraOff className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-gray-500">
                      Tidak ada data yag tersedia!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" />
              Ringkasan Waktu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <Clock className="size-6 text-green-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">Clock In</p>
                <p className="text-md font-semibold text-green-700">
                  {selectedAttendance.attendanceData.clockIn
                    ? selectedAttendance.attendanceData.clockIn?.slice(11)
                    : "No data recorded"}
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <Clock className="size-6 text-red-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">Clock Out</p>
                <p className="text-md font-semibold text-red-700">
                  {selectedAttendance.attendanceData.clockOut
                    ? selectedAttendance.attendanceData.clockOut?.slice(11)
                    : "No data recorded"}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Coffee className="size-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">Break In</p>
                <p className="text-md font-semibold text-blue-700">
                  {selectedAttendance.attendanceData.breakIn
                    ? selectedAttendance.attendanceData.breakIn?.slice(11)
                    : "No data recorded"}
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <ArrowRight className="size-6 text-orange-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">Break Out</p>
                <p className="text-md font-semibold text-orange-700">
                  {selectedAttendance.attendanceData.breakOut
                    ? selectedAttendance.attendanceData.breakOut?.slice(11)
                    : "No data recorded"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        {currentUser?.role !== "ROLE_EMPLOYEE" &&
          selectedAttendance.attendanceData.type !== "LEAVE" &&
          currentUser?.username !==
            selectedAttendance.attendanceData.username && (
            <>
              <Separator />
              <div className="flex justify-end gap-3">
                <Button
                  variant={"destructive"}
                  onClick={() => setIsDeleteAttendance(true)}
                >
                  Delete Presensi
                </Button>
                <Button onClick={() => setIsUpdateAttendance(true)}>
                  Edit Presensi
                </Button>
              </div>
            </>
          )}
      </div>

      {response && (
        <AlertDialog
          open={isResponseDialogOpen}
          onOpenChange={setIsResponseDialogOpen}
        >
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
              <AlertDialogAction onClick={() => navigate(-1)}>
                Ok
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <AlertDialog
        open={isDeleteAttendance}
        onOpenChange={setIsDeleteAttendance}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin untuk menghapus presensi ini secara{" "}
              <span className="font-bold">PERMANENT</span> ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteAttendance}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isUpdateAttendance}
        onOpenChange={setIsUpdateAttendance}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update presensi</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex flex-row gap-4">
                  <div className="flex-1">
                    <Label className="my-4" htmlFor="attendance-status">
                      Status presensi
                    </Label>
                    <Select
                      value={attendanceStatus}
                      onValueChange={(value) => setAttendanceStatus(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="PRESENT">Hadir</SelectItem>
                          <SelectItem value="LATE">Telat</SelectItem>
                          <SelectItem value="ABSENT">Absen</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="my-4">Jumlah Potongan</Label>
                    <Input
                      className="mb-4"
                      id="deduction-amount"
                      type="number"
                      value={deductionAmount}
                      onChange={(event) =>
                        setDeductionAmount(event.target.value)
                      }
                      placeholder="Enter jumlah potongan"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-4" htmlFor="attendance-description">
                    Deskripsi
                  </Label>
                  <Textarea
                    className="mb-4"
                    id="attendance-description"
                    value={attendanceDescription}
                    onChange={(event) =>
                      setAttendanceDescription(event.target.value)
                    }
                    placeholder="Enter deskripsi"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onUpdateAttendance}>
              Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
