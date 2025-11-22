/* eslint-disable react-hooks/exhaustive-deps */
import api from "@/api/api-config";
import FooterPagination from "@/components/shared/FooterPagination";
import Loading from "@/components/shared/Loading";
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
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Attendance } from "@/data/dataTypes";
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
import {
  CircleAlert,
  CircleCheck,
  CircleX,
  ClockFading,
  Image,
  MoreHorizontal,
  User,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Table Columns definition
// eslint-disable-next-line react-refresh/only-export-components
export const columns = (
  handleViewDetailAttendance: (attendance: Attendance) => void
): ColumnDef<Attendance>[] => [
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => <div>{row.getValue("username")}</div>,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <div>
        {row.getValue("role") === "ROLE_EMPLOYEE" ? (
          <Badge className="bg-amber-600 px-2 py-1 text-sm rounded-md">
            Employee
          </Badge>
        ) : (
          <Badge className="px-2 py-1 text-sm rounded-md">Admin</Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Attendance Status",
    cell: ({ row }) => (
      <div>
        {row.getValue("status") == "PRESENT" ? (
          <Badge className="bg-green-500 flex items-center gap-1 px-2 py-1 text-sm text-white rounded-md shadow-sm">
            <CircleCheck />
            Present
          </Badge>
        ) : row.getValue("status") == "LATE" ? (
          <Badge className="bg-amber-500 flex items-center gap-1 px-2 py-1 text-sm text-white rounded-md shadow-sm">
            <CircleAlert /> Late
          </Badge>
        ) : row.getValue("status") == "ABSENT" ? (
          <Badge
            variant={"destructive"}
            className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded-md shadow-sm"
          >
            <CircleX /> Absent
          </Badge>
        ) : (
          <Badge className="bg-blue-500 flex items-center gap-1 px-2 py-1 text-sm text-white rounded-md shadow-sm">
            <ClockFading />
            Leave
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Attendance Type",
    cell: ({ row }) => (
      <div>
        {row.getValue("type") == "DAILY" ? (
          <Badge className="bg-green-500 px-2 py-1 text-sm rounded-md">
            Daily
          </Badge>
        ) : row.getValue("type") == "OVERTIME" ? (
          <Badge className="bg-violet-500 px-2 py-1 text-sm rounded-md">
            Overtime
          </Badge>
        ) : (
          <Badge className="bg-blue-500 px-2 py-1 text-sm rounded-md">
            Leave
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "breakIn",
    header: "Break Status",
    cell: ({ row }) => {
      const { breakIn, breakOut } = row.original;

      return (
        <div>
          {breakIn && breakOut ? (
            <Badge className="px-2 py-1 text-sm rounded-md">
              Already break
            </Badge>
          ) : breakIn && !breakOut ? (
            <Badge
              variant="destructive"
              className="px-2 py-1 text-sm rounded-md"
            >
              On break
            </Badge>
          ) : (
            <Badge className="bg-amber-600 px-2 py-1 text-sm rounded-md">
              Not break yet
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const attendance = row.original;
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
              onClick={() => handleViewDetailAttendance(attendance)}
            >
              <Image className="mr-2" />
              View detail attendance
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function TodayAttendancesPage() {
  return <BreakEmployeeListTable />;
}

export function BreakEmployeeListTable() {
  // Table properties:
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Data and Pages properties:
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  // Global and Local variables:
  const { currentStore } = useLoginContext();
  const [data, setData] = useState<Attendance[] | null>(null);

  // Support variables:
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // boolean properties:
  const [openDialog, setOpenDialog] = useState(false);

  const navigate = useNavigate();

  const handleViewDetailAttendance = (attendance: Attendance) => {
    navigate(`/app/detail-attendance/${attendance.id}`);
  };

  const table = useReactTable({
    data: data ?? [],
    columns: columns(handleViewDetailAttendance),
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

  const getTodayAttendances = useCallback(async () => {
    try {
      const { pageIndex, pageSize } = table.getState().pagination;

      const response = await api.get(
        `/attendance/today-attendances/${currentStore?.id}`,
        {
          params: {
            keyword: debouncedSearch,
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
      setResponse(error.response?.data || null);
    }
  }, [currentStore, debouncedSearch]);

  // set data search + trim to debounced state (hit API) after delay 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Refetch data whenever pagination or search changes
  useEffect(() => {
    getTodayAttendances();
  }, [
    getTodayAttendances,
    table.getState().pagination.pageIndex,
    table.getState().pagination.pageSize,
    debouncedSearch,
  ]);

  // Reset to first page when search changes
  useEffect(() => {
    table.setPageIndex(0);
  }, [debouncedSearch]);

  if (!data) {
    return <Loading message="Today Attendances List" />;
  }

  return (
    <>
      <Card className="p-6 shadow-md">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <Input
            placeholder="Search username..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full sm:max-w-sm"
          />
          <div className="flex flex-row gap-2">
            <Badge variant={"outline"} className="text-sm px-3 py-1">
              Current break : {currentStore?.currentBreakCount} <User />
            </Badge>
            <Badge variant={"outline"} className="text-sm px-3 py-1">
              Max break : {currentStore?.maxBreakCount} <User />
            </Badge>
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
          dataName="employees"
          pageSize={table.getState().pagination.pageSize}
          setPageSize={table.setPageSize}
          onPreviousPage={table.previousPage}
          canPreviousPage={table.getCanPreviousPage}
          onNextPage={table.nextPage}
          canNextPage={table.getCanNextPage}
        />
      </Card>

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
                }}
              >
                Ok
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
