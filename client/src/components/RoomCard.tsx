import BedCard from "./BedCard";
import { useTranslation } from "react-i18next";

interface Worker {
  id: string;
  name: string;
  gender: "male" | "female";
}

interface Bed {
  id: string;
  bedNumber: number;
  status: "available" | "occupied" | "reserved" | "oos";
  worker?: Worker;
}

interface RoomCardProps {
  roomNumber: string;
  floor?: number;
  beds: Bed[];
  onBedClick?: (bed: Bed) => void;
}

export default function RoomCard({ roomNumber, floor, beds, onBedClick }: RoomCardProps) {
  const { t } = useTranslation();
  
  return (
    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold" data-testid={`room-${roomNumber}`}>
          {t('housing.room')} {roomNumber}
        </h4>
        {floor !== undefined && (
          <span className="text-xs text-muted-foreground">{t('housing.floor')} {floor}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {beds.map((bed) => (
          <BedCard
            key={bed.id}
            bedNumber={bed.bedNumber}
            status={bed.status}
            worker={bed.worker}
            onClick={() => onBedClick?.(bed)}
          />
        ))}
      </div>
    </div>
  );
}
