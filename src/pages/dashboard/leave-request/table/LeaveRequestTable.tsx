/* eslint-disable react-hooks/exhaustive-deps */
import type { LeaveApplication } from "@/types/dataTypes";
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
import { LeaveRequestColumns } from "./LeaveRequestColumn";
import api from "@/api/api-config";
import type { AxiosError } from "axios";
import { Input } from "@/components/ui/input";
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
import { Card } from "@/components/ui/card";
import LeaveRequestDetailDialog from "../dialogs/LeaveRequestDetailDialog";
import LeaveApprovalDialog from "../dialogs/LeaveApprovalDialog";
import DefaultResponseDialog from "@/components/shared/DefaultResponseDialog";
import FooterPagination from "@/components/shared/FooterPagination";
import Loading from "@/components/shared/Loading";
import DateRangePicker from "@/components/shared/DateRangePicker";

export default function LeaveRequestTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [data, setData] = useState<LeaveApplication[] | null>(null);

  const [selectedLeaveRequest, setSelectedLeaveRequest] =
    useState<LeaveApplication | null>(null);

  const { currentUser, currentStore } = useLoginContext();
  const [status, setStatus] = useState("PENDING");
  const [type, setType] = useState("All");

  const [selectedAction, setSelectedAction] = useState("");
  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [isViewRequestDetail, setIsViewRequestDetail] = useState(false);
  const [isApproval, setIsApproval] = useState(false);

  const handleViewRequestDetail = (leaveRequest: LeaveApplication) => {
    setIsViewRequestDetail(true);
    setSelectedLeaveRequest(leaveRequest);
  };

  const handleApproveRejectRequest = (
    leaveRequest: LeaveApplication,
    selectedAction: string
  ) => {
    setIsApproval(true);
    setSelectedLeaveRequest(leaveRequest);
    setSelectedAction(selectedAction);
  };

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

  const table = useReactTable({
    data: data ?? [],
    columns: LeaveRequestColumns(
      handleViewRequestDetail,
      handleApproveRejectRequest
    ),
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

  const getAllLeaveRequest = useCallback(async () => {
    try {
      const { pageIndex, pageSize } = table.getState().pagination;

      const response = await api.get("/leave", {
        params: {
          store: currentStore?.id,
          currentLoggedIn: currentUser?.username ?? "",
          status: status,
          type: type,
          keyword: debouncedSearch,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
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
    status,
    type,
    dateRange.startDate,
    dateRange.endDate,
  ]);

  // Refetch data whenever pagination or search changes
  useEffect(() => {
    getAllLeaveRequest();
  }, [
    getAllLeaveRequest,
    table.getState().pagination.pageIndex,
    table.getState().pagination.pageSize,
    debouncedSearch,
    status,
    type,
    dateRange.startDate,
    dateRange.endDate,
  ]);

  // Reset to first page when search changes.
  useEffect(() => {
    table.setPageIndex(0);
  }, [debouncedSearch]);

  if (!data) {
    return <Loading message="Daftar Pengajuan Perizinan" />;
  }

  return (
    <>
      <Card className="p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          {/* Search Bar */}
          <Input
            placeholder="Cari berdasarkan username..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full sm:max-w-sm"
          />
          <div className="flex flex-col md:flex-row gap-4">
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
            <div className="flex flex-row gap-2">
              {/* Status selection */}
              <Select
                value={status}
                onValueChange={(value) => setStatus(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {/* Type Selection */}
              <Select value={type} onValueChange={(value) => setType(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="SICK">Sick</SelectItem>
                    <SelectItem value="PERSONAL">Personal</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
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
          dataName="applications"
          pageSize={table.getState().pagination.pageSize}
          setPageSize={table.setPageSize}
          onPreviousPage={table.previousPage}
          canPreviousPage={table.getCanPreviousPage}
          onNextPage={table.nextPage}
          canNextPage={table.getCanNextPage}
        />
      </Card>

      {/* Default Response Message's dialog */}
      {response && (
        <DefaultResponseDialog
          isOpen={isResponseDialogOpen}
          setIsOpen={setIsResponseDialogOpen}
          response={response}
          onRefreshData={getAllLeaveRequest}
        />
      )}

      {/* View Leave Request Detail's dialog */}
      {selectedLeaveRequest && (
        <LeaveRequestDetailDialog
          isOpen={isViewRequestDetail}
          setIsOpen={setIsViewRequestDetail}
          selectedLeaveRequest={selectedLeaveRequest}
          getAllLeaveRequest={getAllLeaveRequest}
        />
      )}

      {/* Approve and Reject Leave Request's dialog */}
      <LeaveApprovalDialog
        isOpen={isApproval}
        setIsOpen={setIsApproval}
        setResponse={setResponse}
        selectedLeaveRequest={selectedLeaveRequest}
        selectedAction={selectedAction}
        setIsResponseDialogOpen={setIsResponseDialogOpen}
        getAllLeaveRequest={getAllLeaveRequest}
      />
    </>
  );
}
