import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { User, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Worker {
  employmentId: string; // Federated model - unique per employment
  name: string;
  gender: "male" | "female";
}

interface BedCardProps {
  bedNumber: number;
  status: "available" | "occupied" | "reserved" | "out_of_service";
  worker?: Worker;
  hasFutureReservation?: boolean;
  expectedMoveInDate?: string;
  onClick?: () => void;
  referenceDate?: string; // The "zero point" for date calculations (selected date from dashboard)
}

export default function BedCard({ bedNumber, status, worker, hasFutureReservation, expectedMoveInDate, onClick, referenceDate }: BedCardProps) {
  const { t } = useTranslation();
  const statusColors = {
    available: "bg-status-empty/10 dark:bg-status-empty/20 border-status-empty",
    occupied: "bg-status-occupied/10 dark:bg-status-occupied/20 border-status-occupied",
    reserved: "bg-status-reserved/10 dark:bg-status-reserved/20 border-status-reserved",
    out_of_service: "bg-status-oos/10 dark:bg-status-oos/20 border-status-oos",
  };

  const genderColors = {
    male: "bg-gender-male",
    female: "bg-gender-female",
  };

  const bedContent = (
    <button
      onClick={onClick}
      className={cn(
        "relative w-12 h-12 rounded-md border-2 transition-all duration-200 hover:scale-105 hover:shadow-md",
        statusColors[status],
        onClick && "cursor-pointer"
      )}
      data-testid={`bed-card-${bedNumber}`}
    >
      <div className="flex items-center justify-center h-full">
        <span className="text-xs font-semibold">{bedNumber}</span>
      </div>

      {worker && (
        <div
          className={cn(
            "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
            genderColors[worker.gender]
          )}
        />
      )}

      {hasFutureReservation && (
        <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full border-2 border-background bg-amber-500 flex items-center justify-center">
          <Clock className="w-2.5 h-2.5 text-white" />
        </div>
      )}

      {status === "out_of_service" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 dark:bg-white/10 rounded-md">
          <span className="text-[8px] font-bold text-status-oos">{t('bedCard.oos')}</span>
        </div>
      )}
    </button>
  );

  if (worker || hasFutureReservation) {
    // Calculate days until check-in for future reservations using referenceDate as "zero point"
    let daysUntil = 0;
    let absoluteDateStr = "";
    if (hasFutureReservation && expectedMoveInDate) {
      const refDate = referenceDate ? new Date(referenceDate) : new Date();
      const checkInDate = new Date(expectedMoveInDate);
      daysUntil = Math.ceil((checkInDate.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Format absolute date (e.g., "30 Eki")
      absoluteDateStr = checkInDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {bedContent}
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex flex-col gap-1">
              {hasFutureReservation ? (
                <>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span className="font-medium">{worker?.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('bedCard.daysUntil', { days: daysUntil })} ({absoluteDateStr})
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  <span className="font-medium">{worker?.name}</span>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return bedContent;
}
