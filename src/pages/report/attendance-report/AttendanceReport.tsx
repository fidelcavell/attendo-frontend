import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { months } from "@/data/monthData";
import { useCallback, useEffect, useState, type JSX } from "react";
import type {
  Attendance,
  Loan,
  Profile,
  SalarySummary,
} from "@/data/dataTypes";
import api from "@/api/api-config";
import { useLoginContext } from "@/hooks/useLogin";
import {
  Ban,
  BanknoteArrowDown,
  Calculator,
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock,
  ClockFading,
  ClockPlus,
  CreditCard,
  FileDown,
  MinusCircle,
  PiggyBank,
  Wallet,
} from "lucide-react";
import { formatDate, formatDateTime, formatIDR } from "@/helper/Formatter";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AttendanceReportPage() {
  const statusConfig: Record<
    AttendanceStatus,
    {
      color: string;
      bgColor: string;
      borderColor: string;
      icon: JSX.Element;
      label: string;
    }
  > = {
    present: {
      color: "text-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      icon: <CircleCheck className="size-4" />,
      label: "Present",
    },
    absent: {
      color: "text-red-700",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      icon: <CircleX className="size-4" />,
      label: "Absent",
    },
    leave: {
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      icon: <ClockFading className="size-4" />,
      label: "Leave",
    },
    late: {
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      icon: <CircleAlert className="size-4" />,
      label: "Late",
    },
    overtime: {
      color: "text-purple-700",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      icon: <ClockPlus className="size-4" />,
      label: "Overtime",
    },
    "no-data": {
      color: "text-yellow-500",
      bgColor: "bg-white-50",
      borderColor: "border-yellow-200",
      icon: <Ban className="size-4" />,
      label: "Close",
    },
    "": {
      color: "text-muted-500",
      bgColor: "bg-muted-50",
      borderColor: "border-muted-200",
      icon: <></>,
      label: "",
    },
  };
  const { currentUser, currentStore } = useLoginContext();
  const { name, idUser } = useParams();
  const navigate = useNavigate();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [salarySummary, setSalarySummary] = useState<SalarySummary | null>(
    null
  );
  const [loanHistory, setLoanHistory] = useState<Loan[] | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const targetedName = name ?? selectedProfile?.name;
  const targetedUserId = idUser ?? currentUser?.idUser;

  const year = selectedYear;
  const month = selectedMonth - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  type AttendanceStatus =
    | "present"
    | "absent"
    | "late"
    | "leave"
    | "overtime"
    | "no-data"
    | "";
  const [attendanceList, setAttendanceList] = useState<Attendance[] | null>(
    null
  );

  const getProfileById = useCallback(async () => {
    if (!currentUser?.idProfile) return;

    try {
      const response = await api.get(`/profile/${currentUser.idProfile}`);
      setSelectedProfile(response.data);
      console.log(response.data);
    } catch (exception) {
      console.error(exception);
    }
  }, [currentUser?.idProfile]);

  useEffect(() => {
    if (!name) {
      getProfileById();
    }
  }, [getProfileById, name]);

  const getAttendanceList = useCallback(async () => {
    try {
      const response = await api.get(`/attendance/monthly/${targetedUserId}`, {
        params: { month: selectedMonth, year: selectedYear },
        headers: { "Content-Type": "application/json" },
      });
      setAttendanceList(response.data);
    } catch (exception) {
      console.log(exception);
    }
  }, [targetedUserId, selectedMonth, selectedYear]);
  
  useEffect(() => {
    getAttendanceList();
  }, [getAttendanceList]);

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    let status: AttendanceStatus = "no-data";
    let timeIn: string | undefined = "-";
    let timeOut: string | undefined = "-";
    let hasOvertime: boolean = false;
    let regularAttendance: any = null;
    let overtimeAttendance: any = null;

    const dayAttendances =
      attendanceList?.filter((att) => {
        if (!att.clockIn) return false;
        const attDate = new Date(att.clockIn);
        return (
          attDate.getFullYear() === year &&
          attDate.getMonth() === month &&
          attDate.getDate() === i + 1
        );
      }) || [];
    if (dayAttendances.length > 0) {
      // Pisahkan regular attendance dan overtime
      regularAttendance = dayAttendances.find((att) => att.type !== "OVERTIME");

      // Cari overtime yang benar-benar valid (bukan LEAVE atau kosong)
      overtimeAttendance = dayAttendances.find(
        (att) =>
          att.type === "OVERTIME" &&
          ["PRESENT", "LATE", "ABSENT"].includes(att.status) &&
          att.clockIn
      );

      const primaryAttendance = regularAttendance || overtimeAttendance;
      if (primaryAttendance) {
        // Map status from attendance's data
        switch (primaryAttendance.status) {
          case "PRESENT":
            status = "present";
            break;
          case "ABSENT":
            status = "absent";
            break;
          case "LATE":
            status = "late";
            break;
          case "LEAVE":
            status = "leave";
            break;
          default:
            status = "no-data";
        }
        hasOvertime = Boolean(overtimeAttendance);
        timeIn = primaryAttendance.clockIn
          ? formatDateTime(primaryAttendance.clockIn)
          : "-";
        timeOut = primaryAttendance.clockOut
          ? formatDateTime(primaryAttendance.clockIn)
          : "-";
      }
    } else {
      // No attendance data available
      if (dayOfWeek === 0) {
        // Sunday
        status = "no-data";
      } else {
        status = "";
        timeIn = "";
        timeOut = "";
      }
    }
    return {
      date,
      status,
      timeIn,
      timeOut,
      hasOvertime,
      regularAttendance,
      overtimeAttendance,
      allAttendances: dayAttendances,
    };
  });

  // Allow selection of years range -> current year + 5
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);

  // Allow selection of all months (1-12)
  const availableMonths = months.map((name, index) => ({
    name,
    value: index + 1,
  }));

  // Calendar layout: 7 columns (Sun-Sat)
  const firstDayOfMonth = new Date(year, month, 1);
  const startOffset = firstDayOfMonth.getDay(); // 0 = Sunday

  // Add blank cells before first day
  const leadingBlanks = Array.from({ length: startOffset }, () => null as null);
  const gridItems = [...leadingBlanks, ...days];
  const formatCalendarDate = (date: Date) => {
    const weekday = new Intl.DateTimeFormat(undefined, {
      weekday: "short",
    }).format(date);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return { weekday, dateStr: `${mm}/${dd}` };
  };

  // Count mark on calendar
  const getStatusCounts = () => {
    const counts = days.reduce((acc, day) => {
      // Count regular attendance status
      if (day.status && day.status !== "no-data") {
        acc[day.status] = (acc[day.status] || 0) + 1;
      }
      // Count overtime days (separate from regular attendance)
      if (day.hasOvertime) {
        acc["overtime"] = (acc["overtime"] || 0) + 1;
      }
      return acc;
    }, {} as Record<AttendanceStatus | "overtime", number>);
    return counts;
  };
  const statusCounts = getStatusCounts();

  const getAttendanceSummarySalary = useCallback(async () => {
    setSalarySummary(null);
    try {
      const response = await api.get(
        `/salary/monthly-salary-summary/${targetedUserId}`,
        {
          params: {
            store: currentStore?.id,
            month: selectedMonth,
            year: selectedYear,
          },
          headers: { "Content-Type": "application/json" },
        }
      );
      setSalarySummary(response.data);
    } catch (exception) {
      console.log(exception);
    }
  }, [currentStore?.id, targetedUserId, selectedMonth, selectedYear]);

  useEffect(() => {
    getAttendanceSummarySalary();
  }, [getAttendanceSummarySalary, selectedMonth, selectedYear]);

  const getLoanHistory = useCallback(async () => {
    try {
      const response = await api.get(`/loan/history/${targetedUserId}`, {
        params: {
          store: currentStore?.id,
          month: selectedMonth,
          year: selectedYear,
        },
        headers: { "Content-Type": "application/json" },
      });
      const { content } = response.data;
      console.log(content);
      setLoanHistory(content);
    } catch (exception) {
      console.log(exception);
    }
  }, [currentStore?.id, targetedUserId, selectedMonth, selectedYear]);

  useEffect(() => {
    getLoanHistory();
  }, [getLoanHistory]);

  const onDownloadReport = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {targetedName}'s Attendance Report
          </h1>
          <div className="flex gap-3 mt-3">
            <div>
              {/* Dropdown Month */}
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(Number(value))}
              >
                <SelectTrigger className="mb-4">
                  <SelectValue placeholder="Choose month" />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map(({ name, value }) => (
                    <SelectItem key={value} value={value.toString()}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              {/* Dropdown Year */}
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => {
                  setSelectedYear(Number(value));
                }}
              >
                <SelectTrigger className="mb-4">
                  <SelectValue placeholder="Choose year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Download button */}
        <Button
          onClick={onDownloadReport}
          className="no-print w-full sm:w-auto flex justify-center"
        >
          <FileDown className="mr-2 h-4 w-4" /> Download Report
        </Button>
      </div>

      {/* Status Summary */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(statusConfig).map(([status, config]) => {
          if (status == "" || status == "no-data") return;
          const count = statusCounts[status as AttendanceStatus] || 0;
          return (
            <Badge
              key={status}
              variant="secondary"
              className={`${config.bgColor} ${config.color} ${config.borderColor} border`}
            >
              <span className="mr-1">{config.icon}</span> {config.label} :{" "}
              {count}
            </Badge>
          );
        })}
      </div>

      {/* Attendance Calendar Grid */}
      <Card className="p-3 avoid-break">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 py-1"
            >
              {day}
            </div>
          ))}
        </div>
        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {gridItems.map((item, idx) => {
            if (item === null) {
              return <div key={`blank-${idx}`} className="h-14" />;
            }
            const config = statusConfig[item.status];
            const { weekday, dateStr } = formatCalendarDate(item.date);
            const isToday = item.date.toDateString() === now.toDateString();

            // Triggered only when it just has 1 attendance data in a day.
            const handleClick = () => {
              if (item.allAttendances && item.allAttendances.length == 1) {
                navigate(`/app/detail-attendance/${item.allAttendances[0].id}`);
              }
            };

            return (
              <Tooltip key={item.date.toISOString()}>
                <TooltipTrigger asChild>
                  <div
                    onClick={handleClick}
                    className={`h-14 p-1.5 rounded-md border cursor-pointer transition-all hover:shadow-md ${
                      config.bgColor
                    } ${config.borderColor} ${config.color} ${
                      isToday ? "ring-2 ring-blue-500 ring-offset-1" : ""
                    } ${
                      item.allAttendances && item.allAttendances.length > 0
                        ? "hover:scale-105"
                        : "cursor-default"
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">
                          {item.date.getDate()}
                        </span>
                        <div className="hidden md:flex gap-0.5">
                          {config.icon}
                          {item.hasOvertime && (
                            <ClockPlus className="size-4 text-purple-600" />
                          )}
                        </div>
                      </div>
                      <div className="mt-auto">
                        {/* Regular Attendance Status */}
                        <div className="text-[10px] font-medium truncate">
                          {item.regularAttendance && config.label}
                        </div>
                        {/* Overtime Status */}
                        {item.hasOvertime && (
                          <div className="text-[9px] text-purple-600 font-medium truncate">
                            OT:
                            {item.overtimeAttendance?.status === "PRESENT"
                              ? "Present"
                              : item.overtimeAttendance?.status === "LATE"
                              ? "Late"
                              : item.overtimeAttendance?.status === "ABSENT"
                              ? "Absent"
                              : "Unknown"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="px-3 py-2 text-xs max-w-xs"
                >
                  <div className="text-center space-y-1">
                    <div className="font-medium">
                      {weekday}, {dateStr}
                    </div>
                    {item.allAttendances.length > 1 &&
                      item.allAttendances.map((attendance) => (
                        <div
                          key={attendance.id}
                          className="border-t border-gray-200 pt-1 cursor-pointer hover:text-blue-600"
                          onClick={() =>
                            navigate(`/app/detail-attendance/${attendance.id}`)
                          }
                        >
                          <div className="text-xs font-medium">
                            {attendance.type}
                          </div>
                          <div className="text-xs opacity-60">
                            {attendance.status}
                          </div>
                          <div className="text-xs opacity-60">
                            {attendance.clockIn
                              ? formatDateTime(attendance.clockIn)
                              : "None"}
                            -
                            {attendance.clockOut
                              ? formatDateTime(attendance.clockOut)
                              : "None"}
                          </div>
                        </div>
                      ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </Card>

      {/* Attendance Summary */}
      <Card className="px-2 py-4 md:p-4 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-sm avoid-break">
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Base Salary */}
          <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl hover:bg-gray-200 transition">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5" />
              <div>
                <p className="text-gray-600 text-sm">Total Base Salary</p>
                <p className="font-semibold text-gray-800">
                  {formatIDR(salarySummary?.baseSalary ?? 0)}
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              ({(statusCounts["present"] || 0) + (statusCounts["late"] || 0)}{" "}
              days)
            </span>
          </div>

          {/* Total Deduction */}
          <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl hover:bg-gray-200 transition">
            <div className="flex items-center gap-3">
              <MinusCircle className="w-5 h-5" />
              <div>
                <p className="text-gray-600 text-sm">Total Deduction</p>
                <p className="font-semibold text-gray-800">
                  {formatIDR(salarySummary?.totalDeduction ?? 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Total Loan */}
          <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl hover:bg-gray-200 transition">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5" />
              <div>
                <p className="text-gray-600 text-sm">Total Loan</p>
                <p className="font-semibold text-gray-800">
                  {formatIDR(salarySummary?.totalLoan ?? 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Overtime Pay */}
          <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl hover:bg-gray-200 transition">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5" />
              <div>
                <p className="text-gray-600 text-sm">Overtime Pay</p>
                <p className="font-semibold text-gray-800">
                  {formatIDR(salarySummary?.totalOvertimePay ?? 0)}
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              ({statusCounts["overtime"] || 0} days)
            </span>
          </div>

          {/* Total Salary */}
          <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl hover:bg-gray-200 transition">
            <div className="flex items-center gap-3">
              <Calculator className="w-5 h-5" />
              <div>
                <p className="text-gray-600 text-sm">
                  Total Salary (include overtime)
                </p>
                <p className="font-semibold text-gray-800">
                  {formatIDR(salarySummary?.totalSalary ?? 0)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan and Deduction History List */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Loan List */}
        <Card className="w-full min-h-80 flex flex-col justify-start px-8 avoid-break">
          <div className="flex gap-3 font-semibold text-md">
            <PiggyBank /> Your loan amount list
          </div>
          {!loanHistory || loanHistory.length === 0 ? (
            <div className="text-gray-500 text-sm mt-8 border border-dashed p-8 rounded-lg text-center">
              No data recorded!
            </div>
          ) : (
            <div className="flex flex-col items-center w-full space-y-3">
              {loanHistory.map((loan) => (
                <Card
                  key={loan.id}
                  className="w-full flex-row items-center justify-between py-4 px-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
                >
                  <div className="text-sm text-gray-600">
                    {formatDate(loan.createdDate)}
                  </div>

                  <div className="text-right font-semibold text-gray-800">
                    Rp. {formatIDR(loan.amount)}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Deduction List */}
        <Card className="w-full min-h-80 flex flex-col justify-start px-8 avoid-break">
          <div className="flex gap-3 font-semibold text-md">
            <BanknoteArrowDown /> Your Deduction amount list
          </div>
          {!attendanceList ||
          attendanceList.length === 0 ||
          attendanceList.every(
            (attendance) => attendance.deductionAmount === 0
          ) ? (
            <div className="text-gray-500 text-sm mt-8 border border-dashed p-8 rounded-lg text-center">
              No data recorded!
            </div>
          ) : (
            <div className="flex flex-col items-center w-full space-y-3">
              {attendanceList
                .filter((attendance) => attendance.deductionAmount !== 0)
                .map((attendance) => (
                  <Card
                    key={attendance.id}
                    className={`w-full flex-row items-center justify-between py-4 px-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition ${
                      attendance.type == "OVERTIME"
                        ? "border-l-violet-500 border-l-8"
                        : "border-l-green-500 border-l-8"
                    }`}
                  >
                    <div className="text-sm text-gray-600">
                      {formatDate(attendance.clockIn ?? "")}
                    </div>

                    <div className="text-right font-semibold text-gray-800">
                      {formatIDR(attendance.deductionAmount)}
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
