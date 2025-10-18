import { Building2, Bed, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const occupancyRate = ((occupiedBeds / totalBeds) * 100).toFixed(1);

  return (
    <div className="bg-primary/10 rounded-xl p-6 space-y-4 border border-primary/20">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('capacity.summary')}</h3>
        <Building2 className="w-5 h-5 text-primary" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{t('capacity.totalBeds')}</p>
          <p className="text-3xl font-bold" data-testid="text-total-beds">
            {totalBeds}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{t('capacity.occupancy')}</p>
          <p className="text-3xl font-bold" data-testid="text-occupancy-rate">
            {occupancyRate}%
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-status-occupied" />
            <p className="text-sm text-muted-foreground">{t('capacity.occupied')}</p>
          </div>
          <p className="text-2xl font-semibold" data-testid="text-occupied-beds">
            {occupiedBeds}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-status-empty" />
            <p className="text-sm text-muted-foreground">{t('capacity.empty')}</p>
          </div>
          <p className="text-2xl font-semibold" data-testid="text-empty-beds">
            {emptyBeds}
          </p>
        </div>
      </div>

      {oosBeds > 0 && (
        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('capacity.outOfService')}</span>
            <span className="font-semibold text-amber-600" data-testid="text-oos-beds">
              {oosBeds}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{t('capacity.capacity')}</span>
          <span>{occupiedBeds} / {totalBeds}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-status-occupied transition-all duration-300"
            style={{ width: `${occupancyRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
