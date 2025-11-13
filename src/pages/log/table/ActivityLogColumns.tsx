import type { ActivityLog } from "@/data/dataTypes";
import { formatDate } from "@/helper/Formatter";
import type { ColumnDef } from "@tanstack/react-table";

export const ActivityLogColumns = (): ColumnDef<ActivityLog>[] => [
  {
    accessorKey: "createdOn",
    header: "Created Date",
    cell: ({ row }) => (
      <div className="text-xs">{formatDate(row.getValue("createdOn"))}</div>
    ),
  },
  {
    accessorKey: "actionMethod",
    header: "Method",
    cell: ({ row }) => (
      <div className="text-xs">{row.getValue("actionMethod")}</div>
    ),
  },
  {
    accessorKey: "entity",
    header: "Entity",
    cell: ({ row }) => <div className="text-xs">{row.getValue("entity")}</div>,
  },
  {
    accessorKey: "actionName",
    header: "Action Name",
    cell: ({ row }) => (
      <div className="text-xs">{row.getValue("actionName")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="whitespace-normal break-words max-w-sm text-xs">
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "createdBy",
    header: "Performed by",
    cell: ({ row }) => (
      <div className="text-xs">{row.getValue("createdBy")}</div>
    ),
  },
];
