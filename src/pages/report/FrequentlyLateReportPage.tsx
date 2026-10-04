import { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, TrendingUp, Users, Calendar, FileDown } from "lucide-react";
import api from "@/api/api-config";
import { useLoginContext } from "@/hooks/useLogin";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { LateEmployeesReport } from "@/types/report-types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function FrequentlyLateReportPage() {
  const chartConfig = {
    lateCount: {
      label: "Jumlah Telat",
      color: "var(--color-sky-500)",
    },
  } satisfies ChartConfig;

  const { currentStore } = useLoginContext();

  const [selectedPeriod, setSelectedPeriod] = useState<"1" | "3" | "6">("6");
  const [lateReport, setLateReport] = useState<LateEmployeesReport>();

  const getFrequentlyLateReport = useCallback(async () => {
    try {
      const response = await api.get(
        `/report/frequently-late/${currentStore?.id}`,
        {
          params: {
            period: selectedPeriod,
          },
          headers: { "Content-Type": "application/json" },
        }
      );
      setLateReport(response.data);
    } catch (exception) {
      console.error(exception);
    }
  }, [currentStore?.id, selectedPeriod]);

  useEffect(() => {
    if (currentStore) {
      getFrequentlyLateReport();
    }
  }, [currentStore, getFrequentlyLateReport]);

  const handleDownloadReport = () => {
    window.print();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Laporan Karyawan yang Telat
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          {/* Period selection */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="h-5 w-5 text-gray-500 shrink-0" />
            <Select
              value={selectedPeriod}
              onValueChange={(value) =>
                setSelectedPeriod(value as "1" | "3" | "6")
              }
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="1">1 Bulan Terakhir</SelectItem>
                  <SelectItem value="3">3 Bulan Terakhir</SelectItem>
                  <SelectItem value="6">6 Bulan Terakhir</SelectItem>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="avoid-break">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Jumlah Telat
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lateReport?.totalLateCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Dalam {selectedPeriod} bulan
            </p>
          </CardContent>
        </Card>

        <Card className="avoid-break">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Jam Telat
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lateReport?.totalLateHours}h
            </div>
            <p className="text-xs text-muted-foreground">
              Dalam {selectedPeriod} bulan
            </p>
          </CardContent>
        </Card>

        <Card className="avoid-break">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rerata Jam Telat
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lateReport && lateReport?.totalLateCount > 0
                ? (
                    lateReport.totalLateHours / lateReport.totalLateCount
                  ).toFixed(1)
                : 0}
              h
            </div>
            <p className="text-xs text-muted-foreground">Per kejadian</p>
          </CardContent>
        </Card>

        <Card className="avoid-break">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rerata per Bulan
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lateReport && Number(selectedPeriod) > 0
                ? (lateReport.totalLateCount / Number(selectedPeriod)).toFixed(
                    1
                  )
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Kejadian per bulan</p>
          </CardContent>
        </Card>
      </div>

      <Card className="avoid-break">
        <CardHeader>
          <CardTitle>Distribusi Jumlah Telat</CardTitle>
          <CardDescription>
            {lateReport?.monthlyLateDistribution.at(0)?.month} -{" "}
            {lateReport?.monthlyLateDistribution.at(-1)?.month}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {lateReport?.monthlyLateDistribution ? (
            <ChartContainer
              config={chartConfig}
              className="max-h-[300px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={lateReport.monthlyLateDistribution}
                margin={{
                  top: 40,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="count" fill="var(--color-lateCount)" radius={8}>
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="py-16">Data tidak tersedia</div>
          )}
        </CardContent>
        <CardFooter className="text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Menampilkan distribusi jumlah telat pada {selectedPeriod} bulan
            terakhir
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardFooter>
      </Card>

      {/* Top 5 Late Employees Chart */}
      <Card className="avoid-break">
        <CardHeader>
          <CardTitle>Daftar Karyawan yang Telat</CardTitle>
          <CardDescription>
            {lateReport?.monthlyLateDistribution.at(0)?.month} –{" "}
            {lateReport?.monthlyLateDistribution.at(-1)?.month}
            <div className="mt-4">
              Batas kategori keterlambatan:{" "}
              {currentStore?.maxLateMinutePerMonth} menit per bulan
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* DESKTOP TABLE */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Username</TableHead>
                  <TableHead className="text-center">Jumlah Telat</TableHead>
                  <TableHead className="text-right">Total Menit</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {lateReport?.top5LateEmployees?.length ? (
                  lateReport.top5LateEmployees.map((employee) => (
                    <TableRow key={employee.userId}>
                      <TableCell className="font-medium">
                        {employee.username}
                      </TableCell>
                      <TableCell className="text-center">
                        {employee.lateCount}x
                      </TableCell>
                      <TableCell className="text-right">
                        {employee.lateInMinutes} menit
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-6 text-muted-foreground"
                    >
                      Tidak ada data keterlambatan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* MOBILE CARD LIST */}
          <div className="md:hidden space-y-3">
            {lateReport?.top5LateEmployees?.length ? (
              lateReport.top5LateEmployees.map((employee, index) => (
                <div
                  key={employee.userId}
                  className="rounded-lg border p-4 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{employee.username}</span>
                    <span className="text-xs text-muted-foreground">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Jumlah Telat</span>
                    <span className="font-medium">{employee.lateCount}x</span>
                  </div>

                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Total Menit</span>
                    <span className="font-medium">
                      {employee.lateInMinutes} menit
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-muted-foreground py-6">
                Tidak ada data keterlambatan karyawan
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="text-sm text-muted-foreground">
          <div className="flex gap-2 items-center">
            Menampilkan daftar akumulasi keterlambatan karyawan dalam satuan
            menit dalam {selectedPeriod} bulan terakhir
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
