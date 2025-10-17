import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ModernDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "data-testid"?: string;
  minDate?: Date;
  maxDate?: Date;
}

export function ModernDatePicker({
  date,
  onDateChange,
  placeholder = "Tarih seçin",
  disabled = false,
  className,
  "data-testid": dataTestId,
  minDate,
  maxDate,
}: ModernDatePickerProps) {
  const [open, setOpen] = useState(false);

  const handleTodayClick = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    onDateChange(today);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
          data-testid={dataTestId}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "d MMMM yyyy", { locale: tr }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTodayClick}
            className="w-full"
            data-testid={`${dataTestId}-today-button`}
          >
            Bugün
          </Button>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            onDateChange(newDate);
            setOpen(false);
          }}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          initialFocus
          locale={tr}
        />
      </PopoverContent>
    </Popover>
  );
}
