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
import type { LeaveApplication } from "@/types/dataTypes";
import { formatDate } from "@/helper/Formatter";
import type { ColumnDef } from "@tanstack/react-table";
import { CircleCheck, CircleX, Info, MoreHorizontal } from "lucide-react";

export const LeaveRequestColumns = (
  handleViewRequestDetail: (leaveTicketRequest: LeaveApplication) => void,
  handleApprovalRequest: (
    leaveRequest: LeaveApplication,
    selectedAction: string
  ) => void
): ColumnDef<LeaveApplication>[] => [
  {
    accessorKey: "startDate",
    header: "Tanggal Mulai",
    cell: ({ row }) => <div>{formatDate(row.getValue("startDate"))}</div>,
  },
  {
    accessorKey: "endDate",
    header: "Tanggal Selesai",
    cell: ({ row }) => <div>{formatDate(row.getValue("endDate"))}</div>,
  },
  {
    accessorKey: "type",
    header: "Tipe",
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
    accessorKey: "issuedBy",
    header: "Dibuat Oleh",
    cell: ({ row }) => <div>{row.getValue("issuedBy")}</div>,
  },
  {
    accessorKey: "approvedBy",
    header: "Disetujui Oleh",
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
    header: "Aksi",
    cell: ({ row }) => {
      const leaveRequest = row.original;
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
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleViewRequestDetail(leaveRequest)}
            >
              <Info className="mr-2" />
              Detail pengajuan
            </DropdownMenuItem>
            {leaveRequest.status == "PENDING" ? (
              <>
                <DropdownMenuItem
                  onClick={() =>
                    handleApprovalRequest(leaveRequest, "APPROVED")
                  }
                >
                  <CircleCheck className="mr-2" />
                  Menyetujui pengajuan
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    handleApprovalRequest(leaveRequest, "REJECTED")
                  }
                >
                  <CircleX className="mr-2" />
                  Menolak pengajuan
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
