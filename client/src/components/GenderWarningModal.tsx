import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GenderWarningModalProps {
  open: boolean;
  onClose: () => void;
  onMarkAsCouple: () => void;
  onReassign: () => void;
  onContinueAnyway: () => void;
  workerName: string;
  roomNumber: string;
}

export default function GenderWarningModal({
  open,
  onClose,
  onMarkAsCouple,
  onReassign,
  onContinueAnyway,
  workerName,
  roomNumber,
}: GenderWarningModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-gender-warning">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle>Cinsiyet Uyuşmazlığı Tespit Edildi</DialogTitle>
            </div>
          </div>
          <DialogDescription className="pt-3">
            {workerName} isimli çalışan, Oda {roomNumber}'deki farklı soy isimlere sahip diğer sakinlerden farklı cinsiyete sahip.
            Bu durum konaklama politikalarını ihlal edebilir.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-amber-900">Ne yapmak istersiniz?</p>
          <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
            <li>Evli çift olarak işaretle (uygunsa)</li>
            <li>Farklı bir odaya ata</li>
            <li>Yine de bu atamayla devam et</li>
          </ul>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={onMarkAsCouple}
            variant="default"
            className="w-full"
            data-testid="button-mark-couple"
          >
            Evli Çift Olarak İşaretle
          </Button>
          <Button
            onClick={onReassign}
            variant="outline"
            className="w-full"
            data-testid="button-reassign"
          >
            Farklı Odaya Ata
          </Button>
          <Button
            onClick={onContinueAnyway}
            variant="outline"
            className="w-full"
            data-testid="button-continue-anyway"
          >
            Yine de Devam Et
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
