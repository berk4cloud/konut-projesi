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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-gender-warning">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle>{t('genderWarning.title')}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="pt-3">
            {workerName} {t('genderWarning.roomPrefix')}{roomNumber}{t('genderWarning.roomSuffix')}
            {t('genderWarning.policyViolation')}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-amber-900">{t('genderWarning.whatToDo')}</p>
          <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
            <li>{t('genderWarning.markAsCouple')}</li>
            <li>{t('genderWarning.assignDifferentRoom')}</li>
            <li>{t('genderWarning.continueAnyway')}</li>
          </ul>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={onMarkAsCouple}
            variant="default"
            className="w-full"
            data-testid="button-mark-couple"
          >
            {t('genderWarning.markAsCoupleBtn')}
          </Button>
          <Button
            onClick={onReassign}
            variant="outline"
            className="w-full"
            data-testid="button-reassign"
          >
            {t('genderWarning.assignDifferentBtn')}
          </Button>
          <Button
            onClick={onContinueAnyway}
            variant="outline"
            className="w-full"
            data-testid="button-continue-anyway"
          >
            {t('genderWarning.continueAnywayBtn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
