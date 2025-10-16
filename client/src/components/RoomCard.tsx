import BedCard from "./BedCard";

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
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold" data-testid={`room-${roomNumber}`}>
          Room {roomNumber}
        </h4>
        {floor !== undefined && (
          <span className="text-xs text-gray-500">Floor {floor}</span>
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
