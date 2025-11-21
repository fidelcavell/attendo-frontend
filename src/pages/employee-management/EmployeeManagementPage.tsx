/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useCallback, useEffect, useState } from "react";
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
import {
  ArrowDownUp,
  BadgeDollarSign,
  CalendarSync,
  HandCoins,
  MoreHorizontal,
  PiggyBank,
  Plus,
  UserRoundX,
  UserSearch,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLoginContext } from "@/hooks/useLogin";
import type { AxiosError } from "axios";
import api from "@/api/api-config";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { Profile, Schedule, User } from "@/data/dataTypes";
import { months } from "@/data/monthData";
import UpdateEmployeeRole from "./dialogs/UpdateEmployeeRole";
import AddNewEmployee from "./dialogs/AddNewEmployee";
import RemoveEmployee from "./dialogs/RemoveEmployee";
import { Card } from "@/components/ui/card";
import Loading from "@/components/shared/Loading";
import EmployeeLoanHistory from "./dialogs/EmployeeLoanHistory";
import DetailProfile from "./dialogs/DetailProfile";
import AddNewLoan from "./dialogs/AddNewLoan";
import UpdateEmployeeSalary from "./dialogs/UpdateEmployeeSalary";
import { Spinner } from "@/components/ui/spinner";
import FooterPagination from "@/components/shared/FooterPagination";

// Table Columns definition
// eslint-disable-next-line react-refresh/only-export-components
export const columns = (
  handlePromoteDemote: (employee: Profile) => void,
  handleViewDetailProfile: (employee: Profile) => void,
  handleUpdateSchedule: (employee: Profile) => void,
  handleUpdateSalary: (employee: Profile) => void,
  handleNewLoan: (employee: Profile) => void,
  handleViewLoanList: (employee: Profile) => void,
  handleRemoveEmployee: (employee: Profile) => void,
  currentUser: User | null
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
    accessorKey: "idSchedule",
    header: "Schedule",
    cell: ({ row }) => (
      <div>
        {row.getValue("idSchedule") != null ? (
          <Badge className="bg-green-600 flex items-center gap-1 px-2 py-1 text-sm text-white rounded-md shadow-sm">
            Assigned
          </Badge>
        ) : (
          <Badge className="bg-red-500 flex items-center gap-1 px-2 py-1 text-sm text-white rounded-md shadow-sm">
            Unassigned
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "roleName",
    header: "Role",
    cell: ({ row }) => (
      <div>
        {row.getValue("roleName") === "ROLE_EMPLOYEE" ? (
          <Badge className="bg-amber-600 flex items-center gap-1 px-2 py-1 text-sm text-white rounded-md shadow-sm">
            Employee
          </Badge>
        ) : (
          <Badge className="bg-blue-500 flex items-center gap-1 px-2 py-1 text-sm text-white rounded-md shadow-sm">
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
      const monthName = months[new Date().getMonth()].toLowerCase();

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
            <DropdownMenuItem onClick={() => handleViewDetailProfile(employee)}>
              <UserSearch className="mr-2" />
              View profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleUpdateSchedule(employee)}>
              <CalendarSync className="mr-2" />
              Update work schedule
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleUpdateSalary(employee)}>
              <BadgeDollarSign className="mr-2" />
              Update salary
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNewLoan(employee)}>
              <HandCoins className="mr-2" />
              Add new loan
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleViewLoanList(employee)}>
              <PiggyBank className="mr-2" />
              View {monthName}'s loan
            </DropdownMenuItem>
            {currentUser?.role == "ROLE_OWNER" ? (
              <>
                <DropdownMenuItem onClick={() => handlePromoteDemote(employee)}>
                  <ArrowDownUp className="mr-2" />
                  {employee.roleName === "ROLE_ADMIN"
                    ? "Demote as employee"
                    : "Promote as admin"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleRemoveEmployee(employee)}
                >
                  <UserRoundX className="mr-2" />
                  Remove employee
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function EmployeeManagementPage() {
  return <EmployeeManagementTable />;
}

export function EmployeeManagementTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [data, setData] = useState<Profile[] | null>(null);

  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [availableSchedule, setAvailableSchedule] = useState<Schedule[] | null>(
    null
  );

  const { currentUser, currentStore } = useLoginContext();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const [isViewDetailProfile, setIsViewDetailProfile] = useState(false);

  const [isAddEmployee, setIsAddEmployee] = useState(false);
  const [isUpdateSalary, setIsUpdateSalary] = useState(false);
  const [isRemoveEmployee, setIsRemoveEmployee] = useState(false);
  const [isUpdateRoleEmployee, setIsUpdateRoleEmployee] = useState(false);
  const [isNewLoan, setIsNewLoan] = useState(false);
  const [isUpdateSchedule, setIsUpdateSchedule] = useState(false);

  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const [isViewLoan, setIsViewLoan] = useState(false);

  const handlePromoteDemote = (employee: Profile) => {
    setSelectedProfile(employee);
    setIsUpdateRoleEmployee(true);
  };

  const handleViewDetailProfile = (employee: Profile) => {
    setSelectedProfile(employee);
    setIsViewDetailProfile(true);
  };

  const handleUpdateSchedule = (employee: Profile) => {
    setSelectedProfile(employee);
    setSelectedScheduleId(employee.idSchedule?.toString() ?? "");
    setIsUpdateSchedule(true);
  };

  const handleUpdateSalary = (employee: Profile) => {
    setSelectedProfile(employee);
    setIsUpdateSalary(true);
  };

  const handleNewLoan = (employee: Profile) => {
    setSelectedProfile(employee);
    setIsNewLoan(true);
  };

  const handleViewLoanList = (employee: Profile) => {
    setSelectedProfile(employee);
    setIsViewLoan(true);
  };

  const handleRemoveEmployee = (employee: Profile) => {
    setSelectedProfile(employee);
    setIsRemoveEmployee(true);
  };

  const table = useReactTable({
    data: data ?? [],
    columns: columns(
      handlePromoteDemote,
      handleViewDetailProfile,
      handleUpdateSchedule,
      handleUpdateSalary,
      handleNewLoan,
      handleViewLoanList,
      handleRemoveEmployee,
      currentUser
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
  }, [currentStore, currentUser?.username, debouncedSearch, table]);

  useEffect(() => {
    getAllEmployees();
  }, [
    getAllEmployees,
    table.getState().pagination.pageIndex,
    table.getState().pagination.pageSize,
    debouncedSearch,
  ]);

  useEffect(() => {
    table.setPageIndex(0);
  }, [debouncedSearch]);

  const onUpdateSchedule = async () => {
    setResponse(null);
    setIsUpdateSchedule(false);
    setIsLoading(true);

    try {
      const requestParams = new URLSearchParams();
      requestParams.append("schedule", selectedScheduleId);
      requestParams.append("currentUser", currentUser?.username ?? "");

      const response = await api.put(
        `/profile/assign-schedule/${selectedProfile?.id}`,
        requestParams,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      setResponse(response.data);
    } catch (exception) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      setResponse(error.response?.data || null);
    } finally {
      setOpenDialog(true);
      setSelectedScheduleId("");
      setIsLoading(false);
    }
  };

  const getAllSchedule = useCallback(async () => {
    try {
      const response = await api.get(`/schedule/store/${currentStore?.id}`);
      setAvailableSchedule(response.data);
    } catch (exception) {
      console.log("Error on getAllSchedule function: " + exception);
    }
  }, [currentStore]);

  useEffect(() => {
    getAllSchedule();
  }, [getAllSchedule]);

  if (!data) {
    return <Loading message="Employee Management" />;
  }

  return (
    <>
      <div className="mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Employee Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and monitor employee data, roles, work status and salary
          records efficiently.
        </p>
      </div>
      <Card className="p-6 shadow-md">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <Input
            placeholder="Search username..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full sm:max-w-sm"
          />
          <Button
            className="w-full sm:w-auto"
            onClick={() => setIsAddEmployee(true)}
          >
            <Plus />
            Add new employee
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
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="h-24 text-center"
                  >
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
          dataName="requests"
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
                  getAllEmployees();
                }}
              >
                Ok
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Add New Employee alert dialog */}
      <AddNewEmployee
        open={isAddEmployee}
        setIsOpen={setIsAddEmployee}
        setResponse={setResponse}
        setResponseDialog={setOpenDialog}
        onRefresh={getAllEmployees}
      />

      {/* Update Employee Role alert dialog */}
      {selectedProfile && (
        <UpdateEmployeeRole
          isOpen={isUpdateRoleEmployee}
          setIsOpen={setIsUpdateRoleEmployee}
          selectedProfile={selectedProfile}
          setResponse={setResponse}
          setResponseDialog={setOpenDialog}
          onRefresh={getAllEmployees}
        />
      )}

      {/* Update Work Schedule alert dialog */}
      <AlertDialog open={isUpdateSchedule} onOpenChange={setIsUpdateSchedule}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Update {selectedProfile?.username}'s work schedule
            </AlertDialogTitle>
            <AlertDialogDescription>
              Select on available schedule below
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <Label className="my-4">Available work schedule</Label>
            <Select
              value={selectedScheduleId}
              onValueChange={(value) => setSelectedScheduleId(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select schedule" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {availableSchedule?.map((schedule) => {
                    const startTime = schedule.startTime
                      ?.split(":")
                      .slice(0, 2)
                      .join(".");
                    const endTime = schedule.endTime
                      ?.split(":")
                      .slice(0, 2)
                      .join(".");
                    return (
                      <SelectItem
                        key={schedule.id}
                        value={schedule.id.toString()}
                      >
                        {startTime} WIB - {endTime} WIB
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedScheduleId("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onUpdateSchedule} disabled={isLoading || selectedScheduleId.length == 0}>
              {isLoading ? (
                <>
                  <Spinner className="size-4 mr-2" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Employee Salary dialog */}
      {selectedProfile && (
        <UpdateEmployeeSalary
          isOpen={isUpdateSalary}
          setIsOpen={setIsUpdateSalary}
          selectedProfile={selectedProfile}
          setResponse={setResponse}
          setResponseDialog={setOpenDialog}
          onRefresh={getAllEmployees}
        />
      )}

      {/* Add Loan dialog */}
      {selectedProfile && (
        <AddNewLoan
          isOpen={isNewLoan}
          setIsOpen={setIsNewLoan}
          selectedProfile={selectedProfile}
          setResponse={setResponse}
          setResponseDialog={setOpenDialog}
        />
      )}

      {/* Remove Employee alert dialog */}
      {selectedProfile && (
        <RemoveEmployee
          isOpen={isRemoveEmployee}
          setIsOpen={setIsRemoveEmployee}
          selectedProfile={selectedProfile}
          setResponse={setResponse}
          setResponseDialog={setOpenDialog}
          onRefresh={getAllEmployees}
        />
      )}

      {/* View Detail Profile */}
      {selectedProfile && (
        <DetailProfile
          isOpen={isViewDetailProfile}
          setIsOpen={setIsViewDetailProfile}
          selectedProfile={selectedProfile}
        />
      )}

      {/*  Loan History's dialog */}
      {selectedProfile && (
        <EmployeeLoanHistory
          isOpen={isViewLoan}
          setIsOpen={setIsViewLoan}
          selectedProfile={selectedProfile}
        />
      )}
    </>
  );
}
