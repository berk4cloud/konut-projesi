import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { User } from "lucide-react";

interface Worker {
  id: string;
  name: string;
  gender: "male" | "female";
}

interface BedCardProps {
  bedNumber: number;
  status: "available" | "occupied" | "reserved" | "oos";
  worker?: Worker;
  onClick?: () => void;
}

export default function BedCard({ bedNumber, status, worker, onClick }: BedCardProps) {
  const statusColors = {
    available: "bg-status-empty/10 dark:bg-status-empty/20 border-status-empty",
    occupied: "bg-status-occupied/10 dark:bg-status-occupied/20 border-status-occupied",
    reserved: "bg-status-reserved/10 dark:bg-status-reserved/20 border-status-reserved",
    oos: "bg-status-oos/10 dark:bg-status-oos/20 border-status-oos",
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

      {status === "oos" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 dark:bg-white/10 rounded-md">
          <span className="text-[8px] font-bold text-status-oos">OOS</span>
        </div>
      )}
    </button>
  );

  if (worker) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {bedContent}
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-2">
              <User className="w-3 h-3" />
              <span className="font-medium">{worker.name}</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return bedContent;
}
