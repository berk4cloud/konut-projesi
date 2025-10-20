import { useState } from "react";
import { format } from "date-fns";
import { tr, enUS, de, nl, fr, pl, bg, type Locale } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "react-i18next";

interface ModernDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "data-testid"?: string;
  minDate?: Date;
  maxDate?: Date;
  birthDateMode?: boolean; // Enable year/month dropdowns for easier birth date selection
}

// Locale mapping for date-fns
const localeMap: Record<string, Locale> = {
  tr: tr,
  en: enUS,
  de: de,
  nl: nl,
  fr: fr,
  pl: pl,
  bg: bg,
};

export function ModernDatePicker({
  date,
  onDateChange,
  placeholder = "Tarih seçin",
  disabled = false,
  className,
  "data-testid": dataTestId,
  minDate,
  maxDate,
  birthDateMode = false,
}: ModernDatePickerProps) {
  const [open, setOpen] = useState(false);
  const { t, i18n } = useTranslation();
  
  // Get current locale from i18n
  const currentLocale = localeMap[i18n.language] || tr;

  const handleTodayClick = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    onDateChange(today);
    setOpen(false);
  };

  // Birth date mode: defaults to show dates from ~30 years ago, with year/month dropdowns
  const currentYear = new Date().getFullYear();
  const birthDateDefaults = birthDateMode ? {
    captionLayout: "dropdown-buttons" as const,
    fromYear: 1940,
    toYear: currentYear - 16, // Minimum 16 years old
    defaultMonth: new Date(currentYear - 30, 0), // Default to 30 years ago
  } : {};

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
          {date ? format(date, "d MMMM yyyy", { locale: currentLocale }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {!birthDateMode && (
          <div className="p-3 border-b">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTodayClick}
              className="w-full"
              data-testid={`${dataTestId}-today-button`}
            >
              {t('common.today')}
            </Button>
          </div>
        )}
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
          locale={currentLocale}
          {...birthDateDefaults}
        />
      </PopoverContent>
    </Popover>
  );
}
