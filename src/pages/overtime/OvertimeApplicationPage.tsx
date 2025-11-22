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
import type { OvertimeApplication, Schedule } from "@/data/dataTypes";
import { formatDate, formatIDR } from "@/helper/Formatter";
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
import Loading from "@/components/shared/Loading";
import UnavailableCard from "@/components/shared/UnavailableCard";
import FooterPagination from "@/components/shared/FooterPagination";
import AddOvertimeApplicationDialog from "./dialogs/AddOvertimeApplicationDialog";
import ViewDetailOvertimeApplication from "./dialogs/ViewDetailOvertimeApplication";
import DeleteOvertimeApplicationDialog from "./dialogs/DeleteOvertimeApplicationDialog";

// Table Columns definition
// eslint-disable-next-line react-refresh/only-export-components
export const columns = (
  handleViewOvertimeApplication: (
    overtimeApplication: OvertimeApplication
  ) => void,
  handleDeleteOvertimeApplication: (
    overtimeApplication: OvertimeApplication
  ) => void
): ColumnDef<OvertimeApplication>[] => [
  {
    accessorKey: "overtimeDate",
    header: "Overtime Date",
    cell: ({ row }) => <div>{formatDate(row.getValue("overtimeDate"))}</div>,
  },
  {
    accessorKey: "assignedTime",
    header: "Assigned Time",
    cell: ({ row }) => <div>{row.getValue("assignedTime")}</div>,
  },
  {
    accessorKey: "overtimePay",
    header: "Overtime Pay",
    cell: ({ row }) => <div>{formatIDR(row.getValue("overtimePay"))}</div>,
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
      const overtimeApplication = row.original;
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
              onClick={() => handleViewOvertimeApplication(overtimeApplication)}
            >
              <Info className="mr-2" />
              View application detail
            </DropdownMenuItem>
            {overtimeApplication.status == "PENDING" ? (
              <>
                {" "}
                <DropdownMenuItem
                  onClick={() =>
                    handleDeleteOvertimeApplication(overtimeApplication)
                  }
                >
                  <CircleX className="mr-2" />
                  Delete application
                </DropdownMenuItem>
              </>
            ) : (
              ""
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function OvertimeApplicationPage() {
  return <OvertimeApplicationTable />;
}

export function OvertimeApplicationTable() {
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

  const [data, setData] = useState<OvertimeApplication[] | null>(null);
  const [selectedOvertimeApplication, setSelectedOvertimeApplication] =
    useState<OvertimeApplication | null>(null);

  const [status, setStatus] = useState("PENDING");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [isViewDetailApplication, setIsViewDetailApplication] = useState(false);
  const [isDeleteApplication, setIsDeleteApplication] = useState(false);
  const [isAddOvetimeApplication, setIsAddOvertimeApplication] =
    useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleViewOvertimeApplication = (
    overtimeApplication: OvertimeApplication
  ) => {
    setIsViewDetailApplication(true);
    setSelectedOvertimeApplication(overtimeApplication);
  };

  const handleDeleteOvertimeApplication = (
    overtimeApplication: OvertimeApplication
  ) => {
    setIsDeleteApplication(true);
    setSelectedOvertimeApplication(overtimeApplication);
  };

  const handleAddOvertimeApplication = () => {
    setIsAddOvertimeApplication(true);
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
    columns: columns(
      handleViewOvertimeApplication,
      handleDeleteOvertimeApplication
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

  const getAllRequestedOvertimeApplication = useCallback(async () => {
    try {
      const { pageIndex, pageSize } = table.getState().pagination;

      const response = await api.get(
        `/overtime/requested/${currentUser?.idUser}`,
        {
          params: {
            store: currentStore?.id,
            status: status,
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
    dateRange.startDate,
    dateRange.endDate,
  ]);

  useEffect(() => {
    getAllRequestedOvertimeApplication();
  }, [
    getAllRequestedOvertimeApplication,
    table.getState().pagination.pageIndex,
    table.getState().pagination.pageSize,
    status,
    dateRange.startDate,
    dateRange.endDate,
  ]);

  const [availableSchedules, setAvailableSchedules] = useState<
    Schedule[] | null
  >(null);

  const getAllSchedule = useCallback(async () => {
    try {
      const response = await api.get(`/schedule/store/${currentStore?.id}`);
      setAvailableSchedules(response.data);
    } catch (exception) {
      console.log("Error on getAllSchedule function: " + exception);
    }
  }, [currentStore]);

  useEffect(() => {
    getAllSchedule();
  }, [getAllSchedule]);

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
    return <Loading message="Overtime Application" />;
  }

  return (
    <>
      <div>
        <div className="mb-6 px-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Overtime Application
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View, request and manage your overtime applications.
          </p>
        </div>
        <Card className="p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-row gap-3 md:gap-6 w-full">
              {/* Date Range Picker */}
              <DateRangePicker
                isOpen={isDateRangeOpen}
                setIsOpen={setIsDateRangeOpen}
                message="Select start and end dates to filter overtime application."
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                handleDateRangeChange={handleDateRangeChange}
                handleClearDateRange={handleClearDateRange}
                position="start"
              />
              {/* Overtime Application's status selection */}
              <div>
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
              </div>
            </div>
            {/* Add new Overtime Application's button */}
            <div>
              <Button className="w-full" onClick={handleAddOvertimeApplication}>
                <Plus />
                Add Overtime Application
              </Button>
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
        <AlertDialog open={isDialogOpen}>
          <AlertDialogContent className="w-4/5 md:w-1/3">
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
                  setIsDialogOpen(false);
                  getAllRequestedOvertimeApplication();
                }}
              >
                Ok
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* View Overtime Application Detail dialog */}
      {selectedOvertimeApplication && (
        <ViewDetailOvertimeApplication
          isOpen={isViewDetailApplication}
          setIsOpen={setIsViewDetailApplication}
          selectedOvertimeApplication={selectedOvertimeApplication}
          onRefresh={getAllRequestedOvertimeApplication}
        />
      )}

      {/* Delete Overtime Application dialog */}
      {selectedOvertimeApplication && (
        <DeleteOvertimeApplicationDialog
          isOpen={isDeleteApplication}
          setIsOpen={setIsDeleteApplication}
          selectedOvertimeApplication={selectedOvertimeApplication}
          setResponse={setResponse}
          setResponseDialog={setIsDialogOpen}
          onRefresh={getAllRequestedOvertimeApplication}
        />
      )}

      {/* Add Leave Application Dialog */}
      <AddOvertimeApplicationDialog
        isOpen={isAddOvetimeApplication}
        setIsOpen={setIsAddOvertimeApplication}
        availableSchedules={availableSchedules}
        setResponse={setResponse}
        setResponseDialog={setIsDialogOpen}
        onRefresh={getAllRequestedOvertimeApplication}
      />
    </>
  );
}
