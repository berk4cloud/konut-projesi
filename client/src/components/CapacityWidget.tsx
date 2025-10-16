import { Building2, Bed, Users } from "lucide-react";

interface CapacityWidgetProps {
  totalBeds: number;
  occupiedBeds: number;
  emptyBeds: number;
  oosBeds: number;
}

export default function CapacityWidget({
  totalBeds,
  occupiedBeds,
  emptyBeds,
  oosBeds,
}: CapacityWidgetProps) {
  const occupancyRate = ((occupiedBeds / totalBeds) * 100).toFixed(1);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Kapasite Özeti</h3>
        <Building2 className="w-5 h-5 text-blue-600" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-600">Toplam Yatak</p>
          <p className="text-3xl font-bold" data-testid="text-total-beds">
            {totalBeds}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-gray-600">Doluluk</p>
          <p className="text-3xl font-bold" data-testid="text-occupancy-rate">
            {occupancyRate}%
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-status-occupied" />
            <p className="text-sm text-gray-600">Dolu</p>
          </div>
          <p className="text-2xl font-semibold" data-testid="text-occupied-beds">
            {occupiedBeds}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-status-empty" />
            <p className="text-sm text-gray-600">Boş</p>
          </div>
          <p className="text-2xl font-semibold" data-testid="text-empty-beds">
            {emptyBeds}
          </p>
        </div>
      </div>

      {oosBeds > 0 && (
        <div className="pt-3 border-t border-blue-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Hizmet Dışı</span>
            <span className="font-semibold text-amber-600" data-testid="text-oos-beds">
              {oosBeds}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Kapasite</span>
          <span>{occupiedBeds} / {totalBeds}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-status-occupied transition-all duration-300"
            style={{ width: `${occupancyRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
