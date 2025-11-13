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
import type { OvertimeApplication } from "@/data/dataTypes";
import { formatDate, formatIDR } from "@/helper/Formatter";
import type { ColumnDef } from "@tanstack/react-table";
import { CircleCheck, CircleX, Info, MoreHorizontal } from "lucide-react";

export const OvertimeRequestColumns = (
  handleViewRequestDetail: (OvertimeRequest: OvertimeApplication) => void,
  handleApprovalRequest: (
    overtimeRequest: OvertimeApplication,
    selectedAction: string
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
    accessorKey: "issuedBy",
    header: "Issued by",
    cell: ({ row }) => <div>{row.getValue("issuedBy")}</div>,
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
      const overtimeRequest = row.original;
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
              onClick={() => handleViewRequestDetail(overtimeRequest)}
            >
              <Info className="mr-2" />
              View request detail
            </DropdownMenuItem>
            {overtimeRequest.status == "PENDING" ? (
              <>
                <DropdownMenuItem
                  onClick={() =>
                    handleApprovalRequest(overtimeRequest, "APPROVED")
                  }
                >
                  <CircleCheck className="mr-2" />
                  Approve request
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    handleApprovalRequest(overtimeRequest, "REJECTED")
                  }
                >
                  <CircleX className="mr-2" />
                  Reject request
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
