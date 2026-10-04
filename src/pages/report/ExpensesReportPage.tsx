import { useCallback, useEffect, useState } from "react";
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
import {
  DollarSign,
  TrendingUp,
  Calendar,
  BarChart3,
  FileDown,
} from "lucide-react";
import api from "@/api/api-config";
import { useLoginContext } from "@/hooks/useLogin";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { formatIDR } from "@/helper/Formatter";
import type { ExpensesReport } from "@/types/report-types";
import { Button } from "@/components/ui/button";

export default function ExpensesReportPage() {
  const chartConfig = {
    desktop: {
      label: "Expense",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  const { currentStore } = useLoginContext();
  const [period, setPeriod] = useState<"3" | "6" | "12">("6");
  const [expensesReport, setExpensesReport] = useState<ExpensesReport>();

  const getExpensesReport = useCallback(async () => {
    try {
      const response = await api.get(`/report/expenses/${currentStore?.id}`, {
        params: {
          period: period,
        },
        headers: { "Content-Type": "application/json" },
      });
      setExpensesReport(response.data);
      console.log(response);
    } catch (exception) {
      console.error(exception);
    }
  }, [currentStore?.id, period]);

  useEffect(() => {
    if (currentStore) {
      getExpensesReport();
    }
  }, [currentStore, getExpensesReport]);

  let chartData;
  if (expensesReport) {
    chartData = expensesReport.monthlyTotals;
  }

  const handleDownloadReport = () => {
    window.print();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        {/* title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Laporan Pengeluaran Toko
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          {/* Period selection */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="h-5 w-5 text-gray-500 shrink-0" />
            <Select
              value={period}
              onValueChange={(value) => setPeriod(value as "3" | "6" | "12")}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="avoid-break">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pengeluaran
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {formatIDR(expensesReport?.totalExpenses ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Dalam {period} bulan
            </p>
          </CardContent>
        </Card>

        <Card className="avoid-break">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rerata per Bulan
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {formatIDR(expensesReport?.averageExpenses ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">Dalam {period} bulan</p>
          </CardContent>
        </Card>

        <Card className="avoid-break">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pengeluaran Tertinggi
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {formatIDR(expensesReport?.highestMonth.amount ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {expensesReport?.highestMonth.month}
            </p>
          </CardContent>
        </Card>

        <Card className="avoid-break">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pengeluaran Terendah
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {formatIDR(expensesReport?.lowestMonth.amount ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {expensesReport?.lowestMonth.month}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Expenses Chart */}
      <Card className="avoid-break">
        <CardHeader>
          <CardTitle>Dsitribusi Pengeluaran</CardTitle>
          <CardDescription>
            {expensesReport?.monthlyTotals.at(0)?.month} -{" "}
            {expensesReport?.monthlyTotals.at(-1)?.month}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ChartContainer config={chartConfig} className="max-h-[350px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
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
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="amount" fill="var(--color-desktop)" radius={8}>
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
            Menampilkan distribusi pengeluaran pada {period} bulan terakhir
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardFooter>
      </Card>

      {/* Monthly Breakdown */}
      <Card className="avoid-break">
        <CardHeader>
          <CardTitle>Rincian Bulanan</CardTitle>
          <CardDescription>Detail jumlah pengeluaran tiap bulan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {expensesReport?.monthlyTotals.map((item) => (
              <div
                key={`${item.month}`}
                className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-colors"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                    {item.month.charAt(0)}
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.month}
                  </p>
                  <p className="text-md font-bold text-gray-800 mt-1">
                    Rp {(item.amount / 1000000).toFixed(2)} jt
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Statistics */}
      <Card className="avoid-break">
        <CardHeader>
          <CardTitle>Analisis Pengeluaran</CardTitle>
          <CardDescription>
            Menyajikan berbagai insight dan tren berdasarkan data pengeluaran toko
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {expensesReport?.highestMonth?.amount
                  ? (
                      ((expensesReport.highestMonth.amount -
                        (expensesReport.lowestMonth?.amount ?? 0)) /
                        expensesReport.highestMonth.amount) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600">Rentang Variasi</div>
              <div className="text-xs text-gray-500 mt-1">
                Antara bulan tertinggi dan terendah
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatIDR(expensesReport?.averageExpenses ?? 0 * 12)}
              </div>
              <div className="text-sm text-gray-600">Proyeksi Tahunan</div>
              <div className="text-xs text-gray-500 mt-1">
                Berdasarkan rata-rata saat ini
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {expensesReport?.monthlyTotals.length}
              </div>
              <div className="text-sm text-gray-600">Jumlah Bulan Tercatat</div>
              <div className="text-xs text-gray-500 mt-1">
                Dalam periode ini
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
