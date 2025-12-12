import type { ActivityLog } from "@/types/dataTypes";
import { formatDate } from "@/helper/Formatter";
import type { ColumnDef } from "@tanstack/react-table";

export const ActivityLogColumns = (): ColumnDef<ActivityLog>[] => [
  {
    accessorKey: "createdOn",
    header: "Tanggal Pembuatan",
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
    header: "Nama Aksi",
    cell: ({ row }) => (
      <div className="text-xs">{row.getValue("actionName")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Deskripsi",
    cell: ({ row }) => (
      <div className="whitespace-normal break-words max-w-sm text-xs">
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "createdBy",
    header: "Dibuat Oleh",
    cell: ({ row }) => (
      <div className="text-xs">{row.getValue("createdBy")}</div>
    ),
  },
];
