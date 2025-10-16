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
              <DialogTitle>Gender Conflict Detected</DialogTitle>
            </div>
          </div>
          <DialogDescription className="pt-3">
            {workerName} has a different gender than other occupants in Room {roomNumber} with different surnames.
            This may violate housing policies.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-amber-900">What would you like to do?</p>
          <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
            <li>Mark them as a married couple (if applicable)</li>
            <li>Assign to a different room</li>
            <li>Continue with this assignment anyway</li>
          </ul>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={onMarkAsCouple}
            variant="default"
            className="w-full"
            data-testid="button-mark-couple"
          >
            Mark as Married Couple
          </Button>
          <Button
            onClick={onReassign}
            variant="outline"
            className="w-full"
            data-testid="button-reassign"
          >
            Assign to Different Room
          </Button>
          <Button
            onClick={onContinueAnyway}
            variant="outline"
            className="w-full"
            data-testid="button-continue-anyway"
          >
            Continue Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
