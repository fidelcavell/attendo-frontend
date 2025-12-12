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

export default function FrequentlyLateReportPage() {
  const chartConfig = {
    lateCount: {
      label: "Late Count",
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
      console.log(response.data);
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
            Laporan Karyawan yang Sering Telat
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
              Rata-rata Jam Telat
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lateReport?.totalLateHours}h
            </div>
            <p className="text-xs text-muted-foreground">Per kejadian telat</p>
          </CardContent>
        </Card>

        <Card className="avoid-break">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rata-rata Bulanan
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lateReport?.totalLateHours}
            </div>
            <p className="text-xs text-muted-foreground">
              Frekuensi telat per bulan
            </p>
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
          <CardTitle>Top 5 Karyawan yang Telat</CardTitle>
          <CardDescription>
            {lateReport?.monthlyLateDistribution.at(0)?.month} -{" "}
            {lateReport?.monthlyLateDistribution.at(-1)?.month}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {lateReport && lateReport.top5LateEmployees.length > 0 ? (
            <ChartContainer
              config={chartConfig}
              className="max-h-[300px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={lateReport.top5LateEmployees}
                margin={{
                  top: 40,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="username"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="lateCount"
                  fill="var(--color-lateCount)"
                  radius={8}
                >
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
            <div className="border border-dashed text-center text-sm rounded-lg px-12 sm:px-24 py-8 my-8">
              Tidak ada data yang tersedia!
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Menampilkan top 5 karyawan yang sering telat pada {selectedPeriod}{" "}
            bulan terakhir <TrendingUp className="h-4 w-4" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
