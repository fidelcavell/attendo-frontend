import type { Updater } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";

interface FooterPaginationProps {
  pageIndex: number;
  totalPages: number;
  dataLength: number;
  totalElements: number;
  dataName: string;
  pageSize: number;
  setPageSize: (updater: Updater<number>) => void;
  onPreviousPage: () => void;
  canPreviousPage: () => boolean;
  onNextPage: () => void;
  canNextPage: () => boolean;
}

export default function FooterPagination({
  pageIndex,
  totalPages,
  dataLength,
  totalElements,
  dataName,
  pageSize,
  setPageSize,
  onPreviousPage,
  canPreviousPage,
  onNextPage,
  canNextPage,
}: FooterPaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-center md:justify-between py-4 gap-4 px-2">
      <div className="text-xs sm:text-sm text-muted-foreground">
        Page {pageIndex + 1} of {totalPages || 1} | Showing {dataLength} of{" "}
        {totalElements} {dataName}
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-8 justify-center sm:justify-end w-full sm:w-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">
            Rows per page:
          </span>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger className="w-20 h-8 text-xs sm:text-sm">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent align="end">
              {[5, 10, 20, 30].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreviousPage()}
            disabled={!canPreviousPage()}
            className="h-8 text-xs sm:text-sm"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNextPage()}
            disabled={!canNextPage()}
            className="h-8 text-xs sm:text-sm"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
