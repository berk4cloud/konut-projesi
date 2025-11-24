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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  // Birth date mode: use compact dropdowns instead of calendar
  if (birthDateMode) {
    const currentYear = new Date().getFullYear();
    const selectedDay = date ? date.getDate() : undefined;
    const selectedMonth = date ? date.getMonth() : undefined;
    const selectedYear = date ? date.getFullYear() : undefined;

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
      { value: 0, label: t('months.january') || 'Ocak' },
      { value: 1, label: t('months.february') || 'Şubat' },
      { value: 2, label: t('months.march') || 'Mart' },
      { value: 3, label: t('months.april') || 'Nisan' },
      { value: 4, label: t('months.may') || 'Mayıs' },
      { value: 5, label: t('months.june') || 'Haziran' },
      { value: 6, label: t('months.july') || 'Temmuz' },
      { value: 7, label: t('months.august') || 'Ağustos' },
      { value: 8, label: t('months.september') || 'Eylül' },
      { value: 9, label: t('months.october') || 'Ekim' },
      { value: 10, label: t('months.november') || 'Kasım' },
      { value: 11, label: t('months.december') || 'Aralık' },
    ];
    const years = Array.from({ length: currentYear - 1940 + 1 }, (_, i) => currentYear - i).filter(y => y <= currentYear - 16);

    const updateDate = (day?: number, month?: number, year?: number) => {
      // Use current date as fallback if no date is selected yet
      const today = new Date();
      const newDay = day !== undefined ? day : (selectedDay ?? today.getDate());
      const newMonth = month !== undefined ? month : (selectedMonth ?? today.getMonth());
      const newYear = year !== undefined ? year : (selectedYear ?? today.getFullYear());
      
      // Validate the date - if day is invalid for the month, use the last day of the month
      const daysInMonth = new Date(newYear, newMonth + 1, 0).getDate();
      const validDay = Math.min(newDay, daysInMonth);
      
      const newDate = new Date(newYear, newMonth, validDay);
      // Set time to midnight to avoid timezone issues
      newDate.setHours(0, 0, 0, 0);
      onDateChange(newDate);
    };

    return (
      <div className={cn("flex gap-2", className)} data-testid={dataTestId}>
        {/* Day */}
        <Select
          value={selectedDay?.toString()}
          onValueChange={(value) => updateDate(parseInt(value), selectedMonth, selectedYear)}
          disabled={disabled}
        >
          <SelectTrigger className="w-20">
            <SelectValue placeholder="Gün" />
          </SelectTrigger>
          <SelectContent>
            {days.map((day) => (
              <SelectItem key={day} value={day.toString()}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Month */}
        <Select
          value={selectedMonth?.toString()}
          onValueChange={(value) => updateDate(selectedDay, parseInt(value), selectedYear)}
          disabled={disabled}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Ay" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value.toString()}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year */}
        <Select
          value={selectedYear?.toString()}
          onValueChange={(value) => updateDate(selectedDay, selectedMonth, parseInt(value))}
          disabled={disabled}
        >
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Yıl" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Normal calendar mode
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
        />
      </PopoverContent>
    </Popover>
  );
}
