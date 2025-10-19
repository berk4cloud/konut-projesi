import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function ColorStatusLegend() {
  const { t } = useTranslation();

  const statusItems = [
    {
      color: "bg-red-500",
      label: t('housing.statusEmpty'),
      description: t('housing.statusEmptyDesc')
    },
    {
      color: "bg-green-500",
      label: t('housing.statusOccupied'),
      description: t('housing.statusOccupiedDesc')
    },
    {
      color: "bg-purple-500",
      label: t('housing.statusReserved'),
      description: t('housing.statusReservedDesc')
    },
    {
      color: "bg-amber-500",
      label: t('housing.statusOutOfService'),
      description: t('housing.statusOutOfServiceDesc')
    }
  ];

  return (
    <Card data-testid="card-color-legend">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          {t('housing.colorLegend')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {statusItems.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2" data-testid={`legend-item-${idx}`}>
            <div className={`w-3 h-3 rounded-full ${item.color} mt-0.5 flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
