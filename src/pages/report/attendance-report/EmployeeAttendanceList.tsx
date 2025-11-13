/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLoginContext } from "@/hooks/useLogin";
import { useCallback, useEffect, useState } from "react";
import type { AxiosError } from "axios";
import api from "@/api/api-config";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/data/dataTypes";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import FooterPagination from "@/components/shared/FooterPagination";
import Loading from "@/components/shared/Loading";

// Table Columns definition
// eslint-disable-next-line react-refresh/only-export-components
export const columns = (
  handleViewAttendanceReport: (employee: Profile) => void
): ColumnDef<Profile>[] => [
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => <div>{row.getValue("username")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
    cell: ({ row }) => <div>{row.getValue("phoneNumber")}</div>,
  },
  {
    accessorKey: "roleName",
    header: "Role",
    cell: ({ row }) => (
      <div>
        {row.getValue("roleName") === "ROLE_EMPLOYEE" ? (
          <Badge className="bg-amber-600 px-2 py-1 text-sm rounded-md">
            Employee
          </Badge>
        ) : (
          <Badge className="bg-blue-500 px-2 py-1 text-sm rounded-md">
            Admin
          </Badge>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <Button
          className="hover:bg-sky-700"
          onClick={() => handleViewAttendanceReport(employee)}
          size="sm"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Report
        </Button>
      );
    },
  },
];

export default function EmployeeAttendanceList() {
  return <EmployeeAttendanceListTable />;
}

export function EmployeeAttendanceListTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [data, setData] = useState<Profile[] | null>(null);

  const navigate = useNavigate();

  const { currentUser, currentStore } = useLoginContext();

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

  const handleViewAttendanceReport = (employee: Profile) => {
    navigate(
      `/app/store/${currentStore?.id}/attendance-report/${employee.name}/${employee.idUser}`
    );
  };

  const table = useReactTable({
    data: data ?? [],
    columns: columns(handleViewAttendanceReport),
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

  const getAllEmployees = useCallback(async () => {
    try {
      const { pageIndex, pageSize } = table.getState().pagination;

      const response = await api.get("/profile/employees", {
        params: {
          store: currentStore?.id,
          currentUser: currentUser?.username ?? "",
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
  }, [currentStore, currentUser?.username, debouncedSearch]);

  // Refetch data setiap pagination atau search berubah
  useEffect(() => {
    getAllEmployees();
  }, [
    getAllEmployees,
    table.getState().pagination.pageIndex,
    table.getState().pagination.pageSize,
    debouncedSearch,
  ]);

  // Reset to page 1 when search changes
  useEffect(() => {
    table.setPageIndex(0);
  }, [debouncedSearch]);

  if (!data) {
    return <Loading message="Employee Attendance List" />;
  }

  return (
    <Card className="p-6 shadow-md">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <Input
          placeholder="Search username..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full sm:max-w-sm"
        />
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
                  No results found.
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
  );
}
