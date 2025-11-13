/* eslint-disable react-hooks/exhaustive-deps */
import api from "@/api/api-config";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { LeaveApplication } from "@/data/dataTypes";
import { formatDate } from "@/helper/Formatter";
import { useLoginContext } from "@/hooks/useLogin";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import type { AxiosError } from "axios";
import { CircleX, Info, MoreHorizontal, Plus, Store } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import DateRangePicker from "@/components/shared/DateRangePicker";
import FooterPagination from "@/components/shared/FooterPagination";
import Loading from "@/components/shared/Loading";
import UnavailableCard from "@/components/shared/UnavailableCard";
import AddLeaveApplicationDialog from "./dialogs/AddLeaveApplicationDialog";
import DeleteLeaveApplicationDialog from "./dialogs/DeleteLeaveApplicationDialog";
import ViewDetailLeaveApplication from "./dialogs/ViewDetailLeaveApplicationDialog";

// Table Columns definition
// eslint-disable-next-line react-refresh/only-export-components
export const columns = (
  handleViewLeaveApplication: (LeaveApplication: LeaveApplication) => void,
  handleDeleteLeaveApplication: (leaveApplication: LeaveApplication) => void
): ColumnDef<LeaveApplication>[] => [
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => <div>{formatDate(row.getValue("startDate"))}</div>,
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => <div>{formatDate(row.getValue("endDate"))}</div>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <div>
        {row.getValue("type") === "SICK" ? (
          <Badge className="bg-red-500 px-2 py-1 text-sm rounded-md">
            Sick
          </Badge>
        ) : row.getValue("type") === "PERSONAL" ? (
          <Badge className="bg-green-500 px-2 py-1 text-sm rounded-md">
            Personal
          </Badge>
        ) : (
          <Badge className="bg-yellow-500 px-2 py-1 text-sm rounded-md">
            Other
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "approvedBy",
    header: "Approved by",
    cell: ({ row }) => <div>{row.getValue("approvedBy")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div>
        {row.getValue("status") === "PENDING" ? (
          <Badge className="bg-yellow-500 px-2 py-1 text-sm rounded-md">
            Pending
          </Badge>
        ) : row.getValue("status") === "APPROVED" ? (
          <Badge className="bg-green-500 px-2 py-1 text-sm rounded-md">
            Approved
          </Badge>
        ) : (
          <Badge className="bg-red-500 px-2 py-1 text-sm rounded-md">
            Rejected
          </Badge>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const leaveApplication = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 cursor-pointer hover:border border-blue-400"
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleViewLeaveApplication(leaveApplication)}
            >
              <Info className="mr-2" />
              View application detail
            </DropdownMenuItem>
            {leaveApplication.status == "PENDING" ? (
              <DropdownMenuItem
                onClick={() => handleDeleteLeaveApplication(leaveApplication)}
              >
                <CircleX className="mr-2" />
                Delete application
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function LeaveApplicationPage() {
  return <LeaveApplicationTable />;
}

export function LeaveApplicationTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const { currentUser, currentStore } = useLoginContext();

  const [data, setData] = useState<LeaveApplication[] | null>(null);
  const [selectedLeaveApplication, setSelectedLeaveApplication] =
    useState<LeaveApplication | null>(null);

  const [status, setStatus] = useState("PENDING");
  const [type, setType] = useState("All");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isViewDetailApplication, setIsViewDetailApplication] = useState(false);
  const [isDeleteApplication, setIsDeleteApplication] = useState(false);
  const [isAddLeaveApplication, setIsAddLeaveApplication] = useState(false);

  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleViewLeaveApplication = (leaveApplication: LeaveApplication) => {
    setIsViewDetailApplication(true);
    setSelectedLeaveApplication(leaveApplication);
  };

  const handleDeleteLeaveApplication = (leaveApplication: LeaveApplication) => {
    setIsDeleteApplication(true);
    setSelectedLeaveApplication(leaveApplication);
  };

  const handleAddLeaveApplication = () => {
    setIsAddLeaveApplication(true);
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
    columns: columns(handleViewLeaveApplication, handleDeleteLeaveApplication),
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

  const getAllLeaveApplication = useCallback(async () => {
    try {
      const { pageIndex, pageSize } = table.getState().pagination;

      const response = await api.get(
        `/leave/requested/${currentUser?.idUser}`,
        {
          params: {
            store: currentStore?.id,
            status: status,
            type: type,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            pageNumber: pageIndex,
            pageSize: pageSize,
          },
          headers: { "Content-Type": "application/json" },
        }
      );

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
    status,
    type,
    dateRange.startDate,
    dateRange.endDate,
  ]);

  // Refetch data setiap pagination atau search berubah
  useEffect(() => {
    getAllLeaveApplication();
  }, [
    getAllLeaveApplication,
    table.getState().pagination.pageIndex,
    table.getState().pagination.pageSize,
    status,
    type,
    dateRange.startDate,
    dateRange.endDate,
  ]);

  if (!currentStore) {
    return (
      <UnavailableCard
        icon={Store}
        title="No Store Assigned"
        message="You are not added to any store yet. Please contact your
                   administrator to be assigned to a store."
      />
    );
  }

  if (!data) {
    return <Loading message="Leave Application" />;
  }

  return (
    <>
      <div>
        <div className="mb-6 px-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Leave Application
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View, request and manage your leave applications.
          </p>
        </div>
        <Card className="p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-6 w-full">
              {/* Date Range Picker */}
              <DateRangePicker
                isOpen={isDateRangeOpen}
                setIsOpen={setIsDateRangeOpen}
                message="Select start and end dates to filter leave application."
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                handleDateRangeChange={handleDateRangeChange}
                handleClearDateRange={handleClearDateRange}
                position="start"
              />
              <div className="flex gap-2">
                {/* Leave Application's status selection */}
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
                {/* Leave Application's type selection */}
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
            {/* Add new Leave Application's button */}
            <Button onClick={handleAddLeaveApplication}>
              <Plus /> Add Leave Application
            </Button>
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
                      No data available
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
      </div>

      {/* Response Message alert dialog */}
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
              <AlertDialogAction
                onClick={() => {
                  setOpenDialog(false);
                  getAllLeaveApplication();
                }}
              >
                Ok
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* View Leave Application Detail dialog */}
      {selectedLeaveApplication && (
        <ViewDetailLeaveApplication
          isOpen={isViewDetailApplication}
          setIsOpen={setIsViewDetailApplication}
          selectedLeaveApplication={selectedLeaveApplication}
          onRefresh={getAllLeaveApplication}
        />
      )}

      {/* Delete Leave Application dialog */}
      {selectedLeaveApplication && (
        <DeleteLeaveApplicationDialog
          isOpen={isDeleteApplication}
          setIsOpen={setIsDeleteApplication}
          selectedLeaveApplication={selectedLeaveApplication}
          setResponse={setResponse}
          setResponseDialog={setOpenDialog}
          onRefresh={getAllLeaveApplication}
        />
      )}

      {/* Add Leave Application dialog */}
      <AddLeaveApplicationDialog
        isOpen={isAddLeaveApplication}
        setIsOpen={setIsAddLeaveApplication}
        setResponse={setResponse}
        setResponseDialog={setOpenDialog}
        onRefresh={getAllLeaveApplication}
      />
    </>
  );
}
