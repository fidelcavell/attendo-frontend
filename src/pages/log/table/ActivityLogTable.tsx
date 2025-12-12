/* eslint-disable react-hooks/exhaustive-deps */
import type { ActivityLog } from "@/types/dataTypes";
import { useLoginContext } from "@/hooks/useLogin";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import { ActivityLogColumns } from "./ActivityLogColumns";
import api from "@/api/api-config";
import type { AxiosError } from "axios";
import Loading from "@/components/shared/Loading";
import { Input } from "@/components/ui/input";
import DateRangePicker from "@/components/shared/DateRangePicker";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import FooterPagination from "@/components/shared/FooterPagination";
import { Card } from "@/components/ui/card";

export default function ActivityLogTable() {
  // Table Configurations.
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Pagination Configurations.
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const [data, setData] = useState<ActivityLog[] | null>(null);

  const { currentUser, currentStore } = useLoginContext();

  const [methodType, setMethodType] = useState("ADD");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const table = useReactTable({
    data: data ?? [],
    columns: ActivityLogColumns(),
    manualPagination: true,
    pageCount: totalPages,
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  });

  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

  const getAllActivityLog = useCallback(async () => {
    try {
      const { pageIndex, pageSize } = table.getState().pagination;

      const response = await api.get("/activity-log", {
        params: {
          store: currentStore?.id,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          method: methodType,
          keyword: debouncedSearch,
          pageNumber: pageIndex,
          pageSize: pageSize,
        },
        headers: { "Content-Type": "application/json" },
      });

      const { content, totalElements, totalPages } = response.data;
      setData(content);
      setTotalPages(totalPages);
      setTotalElements(totalElements);
    } catch (exception) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      console.error(error.response?.data || null);
    }
  }, [
    currentStore,
    currentUser?.username,
    debouncedSearch,
    methodType,
    dateRange.startDate,
    dateRange.endDate,
  ]);

  // Refetch data whenever pagination or search changes.
  useEffect(() => {
    getAllActivityLog();
  }, [
    getAllActivityLog,
    table.getState().pagination.pageIndex,
    table.getState().pagination.pageSize,
    debouncedSearch,
    methodType,
    dateRange.startDate,
    dateRange.endDate,
  ]);

  // Reset to first page when search changes.
  useEffect(() => {
    table.setPageIndex(0);
  }, [debouncedSearch]);

  const handleDateRangeChange = (field: string, value: string) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearDateRange = () => {
    setDateRange({
      startDate: "",
      endDate: "",
    });
  };

  if (!data) {
    return <Loading message="Aktivitas Log Admin" />;
  }

  return (
    <>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Aktivitas Log Admin
          </h1>
        </div>
        <Card className="p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            {/* Search Bar */}
            <Input
              placeholder="Cari berdasarkan username..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full sm:max-w-sm"
            />
            <div className="flex flex-row gap-4">
              {/* Date Range Picker */}
              <DateRangePicker
                isOpen={isDateRangeOpen}
                setIsOpen={setIsDateRangeOpen}
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                handleDateRangeChange={handleDateRangeChange}
                handleClearDateRange={handleClearDateRange}
                position="end"
              />
              {/* Method Type Selection */}
              <Select
                value={methodType}
                onValueChange={(value) => setMethodType(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ADD">Add</SelectItem>
                    <SelectItem value="UPDATE">Update</SelectItem>
                    <SelectItem value="DELETE">Delete</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto rounded-md border shadow-sm">
            <Table className="[&_th]:px-6 [&_td]:pl-6 [&_th]:py-3 [&_td]:py-3 min-w-[600px]">
              <TableHeader className="bg-primary">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-white">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Tidak ada data yang tersedia
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <FooterPagination
            pageIndex={table.getState().pagination.pageIndex}
            totalPages={totalPages}
            dataLength={data.length}
            totalElements={totalElements}
            dataName="aktivitas"
            pageSize={table.getState().pagination.pageSize}
            setPageSize={table.setPageSize}
            onPreviousPage={table.previousPage}
            canPreviousPage={table.getCanPreviousPage}
            onNextPage={table.nextPage}
            canNextPage={table.getCanNextPage}
          />
        </Card>
      </div>
    </>
  );
}
