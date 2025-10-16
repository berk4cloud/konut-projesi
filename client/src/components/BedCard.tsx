import { cn } from "@/lib/utils";

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
    available: "bg-red-50 border-status-empty",
    occupied: "bg-green-50 border-status-occupied",
    reserved: "bg-purple-50 border-status-reserved",
    oos: "bg-amber-50 border-status-oos",
  };

  const genderColors = {
    male: "bg-gender-male",
    female: "bg-gender-female",
  };

  return (
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
            "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
            genderColors[worker.gender]
          )}
          title={worker.name}
        />
      )}

      {status === "oos" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-md">
          <span className="text-[8px] font-bold text-amber-700">OOS</span>
        </div>
      )}
    </button>
  );
}
