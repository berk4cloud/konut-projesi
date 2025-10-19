import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, MapPin, Home, DoorOpen, Clock, FileText } from "lucide-react";
import { format } from "date-fns";

interface BedDetailsModalProps {
  open: boolean;
  onClose: () => void;
  bed: {
    id: string;
    bedNumber: number;
    status: "occupied" | "reserved" | "out_of_service";
    worker?: {
      employmentId: string;
      name: string;
      gender: "male" | "female";
    };
    checkInDate?: string;
    expectedMoveOutDate?: string;
    roomNumber?: string;
    houseName?: string;
  } | null;
}

export default function BedDetailsModal({
  open,
  onClose,
  bed,
}: BedDetailsModalProps) {
  const { t } = useTranslation();

  if (!bed) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      occupied: {
        label: t('housing.statusOccupied'),
        className: "bg-green-500 text-white hover:bg-green-600"
      },
      reserved: {
        label: t('housing.statusReserved'),
        className: "bg-purple-500 text-white hover:bg-purple-600"
      },
      out_of_service: {
        label: t('housing.statusOutOfService'),
        className: "bg-red-500 text-white hover:bg-red-600"
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.occupied;
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('common.unknown');
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="dialog-bed-details">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Home className="w-6 h-6 text-primary" />
            {bed.houseName} - {t('housing.room')} {bed.roomNumber}, {t('housing.bed')} {bed.bedNumber}
          </DialogTitle>
          <DialogDescription>
            {bed.status === 'occupied' && bed.worker ? 
              t('bedDetails.workerInformation') : 
              t('bedDetails.bedInformation')
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status */}
          <div className="flex items-center justify-between pb-4 border-b">
            <span className="text-sm text-muted-foreground">{t('common.status')}:</span>
            {getStatusBadge(bed.status)}
          </div>

          {/* Worker Information (if occupied) */}
          {bed.status === 'occupied' && bed.worker && (
            <>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{bed.worker.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className={bed.worker.gender === 'male' ? 'text-blue-600' : 'text-pink-600'}>
                      {bed.worker.gender === 'male' ? '♂' : '♀'} {t(`common.${bed.worker.gender}`)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('bedDetails.checkInDate')}</p>
                    <p className="font-medium">{formatDate(bed.checkInDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('bedDetails.expectedCheckOut')}</p>
                    <p className="font-medium">{formatDate(bed.expectedMoveOutDate)}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Reserved Bed Information */}
          {bed.status === 'reserved' && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">
                    {t('bedDetails.reservedBed')}
                  </h4>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    {t('bedDetails.reservedDescription')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Out of Service Information */}
          {bed.status === 'out_of_service' && (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900 dark:text-red-100 mb-1">
                    {t('bedDetails.outOfService')}
                  </h4>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {t('bedDetails.maintenanceDescription')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          {bed.status === 'occupied' && bed.worker && (
            <>
              <Button variant="outline" onClick={onClose}>
                <DoorOpen className="w-4 h-4 mr-2" />
                {t('bedDetails.checkOut')}
              </Button>
              <Button variant="outline" onClick={onClose}>
                <FileText className="w-4 h-4 mr-2" />
                {t('bedDetails.addNote')}
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
