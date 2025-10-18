import RoomCard from "./RoomCard";
import { useTranslation } from "react-i18next";

interface Worker {
  employmentId: string; // Federated model - unique per employment
  name: string;
  gender: "male" | "female";
}

interface Bed {
  id: string;
  bedNumber: number;
  status: "available" | "occupied" | "reserved" | "oos";
  worker?: Worker;
}

interface Room {
  id: string;
  roomNumber: string;
  floor?: number;
  beds: Bed[];
}

interface HouseCardProps {
  name: string;
  city: string;
  totalBeds: number;
  occupiedBeds: number;
  rooms: Room[];
  ownershipType?: string;
  onBedClick?: (bed: Bed) => void;
  onLeaseClick?: () => void;
}

export default function HouseCard({
  name,
  city,
  totalBeds,
  occupiedBeds,
  rooms,
  ownershipType,
  onBedClick,
  onLeaseClick,
}: HouseCardProps) {
  const { t } = useTranslation();
  const emptyBeds = totalBeds - occupiedBeds;

  return (
    <div className="bg-card border rounded-xl p-6 space-y-4 hover:shadow-md transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            roomNumber={room.roomNumber}
            floor={room.floor}
            beds={room.beds}
            onBedClick={onBedClick}
          />
        ))}
      </div>

      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">
            {t('housing.empty')}: <span className="font-semibold text-status-empty">{emptyBeds}</span>
          </span>
          <span className="text-gray-600">
            {t('housing.occupiedBeds')}: <span className="font-semibold text-status-occupied">{occupiedBeds}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
