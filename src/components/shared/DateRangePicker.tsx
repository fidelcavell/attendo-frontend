import { Calendar } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { formatDate } from "@/helper/Formatter";

interface DateRangePickerProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  startDate: string;
  endDate: string;
  handleDateRangeChange: (field: string, value: string) => void;
  handleClearDateRange: () => void;
  position: "center" | "start" | "end" | undefined;
}

export default function DateRangePicker({
  isOpen,
  setIsOpen,
  startDate,
  endDate,
  handleDateRangeChange,
  handleClearDateRange,
  position,
}: DateRangePickerProps) {
  const formatDateRange = () => {
    if (!startDate && !endDate) {
      return "Pilih rentang tanggal";
    }
    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
    if (startDate) {
      return `From ${formatDate(startDate)}`;
    }
    if (endDate) {
      return `Until ${formatDate(endDate)}`;
    }
    return "Pilih rentang tanggal";
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align={position}>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">
              Filter dengan rentang tanggal
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label
                htmlFor="startDate"
                className="text-xs font-medium text-gray-600"
              >
                From
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(event) =>
                  handleDateRangeChange("startDate", event.target.value)
                }
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="endDate"
                className="text-xs font-medium text-gray-600"
              >
                To
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(event) =>
                  handleDateRangeChange("endDate", event.target.value)
                }
                min={startDate}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {(startDate || endDate) && (
            <div className="flex justify-between items-center pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearDateRange}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 text-xs"
              >
                Clear
              </Button>
              <div className="text-xs text-gray-500">{formatDateRange()}</div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
