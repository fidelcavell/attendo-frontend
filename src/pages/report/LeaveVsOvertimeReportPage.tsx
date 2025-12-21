import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileDown, TrendingUp } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useLoginContext } from "@/hooks/useLogin";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import type { LeaveVsOvertimeReport } from "@/types/report-types";
import api from "@/api/api-config";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function LeaveVsOvertimeReportPage() {
  const { currentStore } = useLoginContext();
  const [selectedPeriod, setSelectedPeriod] = useState<"3" | "6" | "12">("6");
  const [leaveVsOvertimeReport, setLeaveVsOvertimeReport] =
    useState<LeaveVsOvertimeReport>();

  const getLeaveVsOvertimeReport = useCallback(async () => {
    try {
      const response = await api.get(
        `/report/leave-vs-overtime/${currentStore?.id}`,
        {
          params: {
            period: selectedPeriod,
          },
          headers: { "Content-Type": "application/json" },
        }
      );
      setLeaveVsOvertimeReport(response.data);
    } catch (exception) {
      console.error(exception);
    }
  }, [currentStore?.id, selectedPeriod]);

  useEffect(() => {
    if (currentStore) {
      getLeaveVsOvertimeReport();
    }
  }, [currentStore, getLeaveVsOvertimeReport]);

  const handleDownloadReport = () => {
    window.print();
  };

  const leavePieChartConfig = {
    sick: {
      label: "Sick",
      color: "var(--color-red-500)",
    },
    personal: {
      label: "Personal",
      color: "var(--color-amber-500)",
    },
    other: {
      label: "Other",
      color: "var(--color-violet-500)",
    },
  } satisfies ChartConfig;

  const leaveBarChartConfig = {
    sick: {
      label: "Sick",
      color: "var(--color-red-500)",
    },
    personal: {
      label: "Personal",
      color: "var(--color-amber-500)",
    },
    other: {
      label: "Other",
      color: "var(--color-violet-500)",
    },
  } satisfies ChartConfig;

  const overtimeBarChartConfig = {
    overtime: {
      label: "Overtime Day",
      color: "var(--color-green-500)",
    },
  } satisfies ChartConfig;

  const comparisonDistribution = [
    {
      type: "Hari Izin",
      total: leaveVsOvertimeReport?.totalLeaveDaysInPeriod ?? 0,
      color: "var(--color-amber-500)",
    },
    {
      type: "Hari Lembur",
      total: leaveVsOvertimeReport?.totalOvertimeDaysInPeriod ?? 0,
      color: "var(--color-green-500)",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Laporan Perizinan vs Lembur
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          {/* Period selection */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="h-5 w-5 text-gray-500 shrink-0" />
            <Select
              value={selectedPeriod}
              onValueChange={(value) =>
                setSelectedPeriod(value as "3" | "6" | "12")
              }
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="3">3 Bulan Terakhir</SelectItem>
                  <SelectItem value="6">6 Bulan Terakhir</SelectItem>
                  <SelectItem value="12">12 Bulan Terakhir</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {/* Download as PDF button */}
          <Button
            onClick={handleDownloadReport}
            className="no-print w-full sm:w-auto flex justify-center"
          >
            <FileDown className="mr-2 h-4 w-4" /> Download Laporan
          </Button>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="avoid break">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Hari Izin
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {leaveVsOvertimeReport?.totalLeaveDaysInPeriod}
            </div>
            <p className="text-xs text-muted-foreground">
              Dalam {leaveVsOvertimeReport?.totalLeaveRequestInPeriod} pengajuan
              perizinan
            </p>
          </CardContent>
        </Card>

        <Card className="avoid-break">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Hari Lembur
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {leaveVsOvertimeReport?.totalOvertimeDaysInPeriod}
            </div>
            <p className="text-xs text-muted-foreground">
              Dalam {leaveVsOvertimeReport?.totalOvertimeDaysInPeriod} pengajuan
              lembur
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leave Type Distribution by month */}
      <Card className="avoid-break">
        <CardHeader>
          <CardTitle>Distribusi Perizinan per Bulan</CardTitle>
          <CardDescription>
            {leaveVsOvertimeReport?.leaveDistributionByMonth.at(0)?.month} -{" "}
            {leaveVsOvertimeReport?.leaveDistributionByMonth.at(-1)?.month}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={leaveBarChartConfig}
            className="max-h-[300px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={leaveVsOvertimeReport?.leaveDistributionByMonth}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} tickMargin={10} />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar
                dataKey="SICK"
                name="Sick"
                fill="var(--color-sick)"
                radius={4}
              />
              <Bar
                dataKey="PERSONAL"
                name="Personal"
                fill="var(--color-personal)"
                radius={4}
              />
              <Bar
                dataKey="OTHER"
                name="Other"
                fill="var(--color-other)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Menampilkan distribusi perizinan per bulan pada{" "}
            {selectedPeriod} bulan terakhir <TrendingUp className="h-4 w-4" />
          </div>
        </CardFooter>
      </Card>

      {/* Pie Chart Distribution */}
      <Card className="avoid-break">
        <CardHeader>
          <CardTitle>Distribusi Perizinan per Tipe</CardTitle>
          <CardDescription>
            Rincian berbagai jenis perizinan yang diambil oleh karyawan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0 lg:space-x-8">
            <div className="flex-1">
              {leaveVsOvertimeReport &&
              leaveVsOvertimeReport.pieDistribution.some(
                (item) => item.leaveDays !== 0
              ) ? (
                <ChartContainer
                  config={leavePieChartConfig}
                  className="mx-auto aspect-square md:h-[300px] h-48"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={leaveVsOvertimeReport?.pieDistribution}
                      dataKey="leaveDays"
                      nameKey="type"
                    >
                      {leaveVsOvertimeReport?.pieDistribution?.map(
                        (entry, index) => {
                          const color =
                            leavePieChartConfig[entry.type]?.color ??
                            "var(--color-gray-300)";
                          return <Cell key={`cell-${index}`} fill={color} />;
                        }
                      )}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="border border-dashed text-center text-sm rounded-lg p-8 md:py-12">
                  Tidak ada data yang tersedia!
                </div>
              )}
            </div>
            <div className="flex-2 space-y-4">
              {leaveVsOvertimeReport?.pieDistribution.map(
                ({ type, leaveDays, totalRequests, percentage }) => (
                  <div
                    key={type}
                    className="border rounded-lg p-4 bg-gradient-to-r from-gray-50 to-gray-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: leavePieChartConfig[type]?.color,
                          }}
                        />
                        <h3 className="font-semibold capitalize">{type}</h3>
                      </div>
                      <Badge variant="outline">{totalRequests} pengajuan</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-lg">{leaveDays}</div>
                        <div className="text-gray-600">Total Hari</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg">
                          {totalRequests > 0 ? (leaveDays / totalRequests).toFixed(1) : 0}
                        </div>
                        <div className="text-gray-600">Avg Hari</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg">{percentage}%</div>
                        <div className="text-gray-600">of Total</div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overtime Distribution by month */}
      <Card className="avoid-break">
        <CardHeader>
          <CardTitle>Distribusi Lembur per Bulan</CardTitle>
          <CardDescription>
            {leaveVsOvertimeReport?.leaveDistributionByMonth.at(0)?.month} -{" "}
            {leaveVsOvertimeReport?.leaveDistributionByMonth.at(-1)?.month}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={overtimeBarChartConfig}
            className="max-h-[300px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={leaveVsOvertimeReport?.overtimeDaysDistributionByMonth}
              margin={{
                top: 50,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-green-500)" radius={8}>
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Menampilkan distribusi lembur per bulan pada {selectedPeriod} bulan
            terakhir <TrendingUp className="h-4 w-4" />
          </div>
        </CardFooter>
      </Card>

      {/* Comparison Chart Distribution */}
      <Card className="avoid-break">
        <CardHeader>
          <CardTitle>Distribusi Perbandingan Antara Perizinan dan Lembur</CardTitle>
          <CardDescription>
            Rincian distribusi perizinan dan lembur yang dilakukan oleh karyawan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0 lg:space-x-8">
            <div className="flex-1">
              {comparisonDistribution.some((item) => item.total !== 0) ? (
                <ChartContainer
                  config={leavePieChartConfig}
                  className="mx-auto aspect-square md:h-[300px] h-48"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={comparisonDistribution}
                      dataKey="total"
                      nameKey="type"
                    >
                      {comparisonDistribution.map((item, index) => {
                        const color = item.color ?? "var(--color-gray-300)";
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="border border-dashed text-center text-sm rounded-lg p-8 md:py-12">
                  Tidak ada data yang tersedia!
                </div>
              )}
            </div>
            <div className="flex-1 space-y-4">
              {comparisonDistribution.map(({ type, total }) => (
                <div
                  key={type}
                  className="border rounded-lg p-4 bg-gradient-to-r from-gray-50 to-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full" />
                      <h3 className="font-semibold capitalize">{type}</h3>
                    </div>
                    <Badge variant="outline">{total} pengajuan</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-lg">{total}</div>
                      <div className="text-gray-600">Total Hari</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg">
                        {total == 0 &&
                        comparisonDistribution[0].total == 0 &&
                        comparisonDistribution[1].total == 0
                          ? 0
                          : (
                              (total /
                                (comparisonDistribution[0].total +
                                  comparisonDistribution[1].total)) *
                              100
                            ).toFixed(2)}
                        %
                      </div>
                      <div className="text-gray-600">of Total</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
