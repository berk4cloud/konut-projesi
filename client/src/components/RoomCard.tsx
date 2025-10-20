import BedCard from "./BedCard";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Home, Users } from "lucide-react";

interface Worker {
  employmentId: string; // Federated model - unique per employment
  name: string;
  gender: "male" | "female";
}

interface Bed {
  id: string;
  bedNumber: number;
  status: "available" | "occupied" | "reserved" | "out_of_service";
  worker?: Worker;
  hasFutureReservation?: boolean;
  expectedMoveInDate?: string;
}

interface RoomReservation {
  leadTenant: { employmentId: string; name: string } | null;
  occupants: Array<{ employmentId: string | null; name: string; guestName: string | null }>;
  monthlyRate: string | null;
  checkInDate: string | null;
}

interface RoomCardProps {
  roomNumber: string;
  floor?: number;
  beds: Bed[];
  roomReservation?: RoomReservation | null;
  onBedClick?: (bed: Bed) => void;
  referenceDate?: string; // The "zero point" for date calculations
}

export default function RoomCard({ roomNumber, floor, beds, roomReservation, onBedClick, referenceDate }: RoomCardProps) {
  const { t } = useTranslation();
  
  return (
    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold" data-testid={`room-${roomNumber}`}>
            {t('housing.room')} {roomNumber}
          </h4>
          {roomReservation && (
            <Badge variant="outline" className="text-xs gap-1" data-testid={`room-rental-badge-${roomNumber}`}>
              <Home className="w-3 h-3" />
              Oda Kiralandı
            </Badge>
          )}
        </div>
        {floor !== undefined && (
          <span className="text-xs text-muted-foreground">{t('housing.floor')} {floor}</span>
        )}
      </div>

      {roomReservation && roomReservation.leadTenant && (
        <div className="bg-card rounded border p-2 space-y-1 text-xs">
          <div className="flex items-center gap-1 font-medium">
            <Users className="w-3 h-3" />
            <span>Ödeme Yapan:</span>
            <span className="text-foreground">{roomReservation.leadTenant.name}</span>
          </div>
          {roomReservation.occupants.length > 1 && (
            <div className="text-muted-foreground pl-4">
              <span>Sakinler: </span>
              {roomReservation.occupants.map((occ, idx) => (
                <span key={idx} data-testid={`occupant-name-${idx}`}>
                  {occ.name}{idx < roomReservation.occupants.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          )}
          {roomReservation.monthlyRate && (
            <div className="text-muted-foreground pl-4">
              Aylık Kira: €{roomReservation.monthlyRate}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {beds.map((bed) => (
          <BedCard
            key={bed.id}
            bedNumber={bed.bedNumber}
            status={bed.status}
            worker={bed.worker}
            hasFutureReservation={bed.hasFutureReservation}
            expectedMoveInDate={bed.expectedMoveInDate}
            onClick={() => onBedClick?.(bed)}
            referenceDate={referenceDate}
          />
        ))}
      </div>
    </div>
  );
}
