import { Building2, MapPin } from "lucide-react";
import RoomCard from "./RoomCard";

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
  onBedClick?: (bed: Bed) => void;
}

export default function HouseCard({
  name,
  city,
  totalBeds,
  occupiedBeds,
  rooms,
  onBedClick,
}: HouseCardProps) {
  const emptyBeds = totalBeds - occupiedBeds;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold" data-testid={`house-${name}`}>
            {name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{city}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
            <Building2 className="w-4 h-4" />
            <span data-testid={`house-bed-count-${name}`}>
              {occupiedBeds}/{totalBeds}
            </span>
          </div>
        </div>
      </div>

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

      <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-gray-600">
            Empty: <span className="font-semibold text-status-empty">{emptyBeds}</span>
          </span>
          <span className="text-gray-600">
            Occupied: <span className="font-semibold text-status-occupied">{occupiedBeds}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
