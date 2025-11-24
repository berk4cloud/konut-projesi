import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ModernDatePicker } from "@/components/ui/modern-date-picker";
import { 
  Calendar, 
  User, 
  Home,
  Bed as BedIcon,
  DoorOpen,
  Check,
  ChevronsUpDown,
  Plane,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";

interface CheckOutWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type CheckOutType = 'immediate' | 'vacation' | 'unnotified';

export default function CheckOutWizard({
  open,
  onClose,
  onComplete,
}: CheckOutWizardProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [workerComboboxOpen, setWorkerComboboxOpen] = useState(false);
  
  // Wizard data
  const [wizardData, setWizardData] = useState({
    employmentId: "",
    workerName: "",
    bedId: "",
    roomNumber: "",
    bedNumber: "",
    houseName: "",
    checkInDate: "",
    checkOutType: "" as CheckOutType | "",
    vacationStart: "",
    vacationEnd: "",
    notes: "",
  });

  // Fetch workers with current accommodation
  const { data: workers = [] } = useQuery<any[]>({
    queryKey: ['/api/workers-with-accommodation'],
    enabled: open,
  });

  const handleClose = () => {
    setStep(1);
    setWizardData({
      employmentId: "",
      workerName: "",
      bedId: "",
      roomNumber: "",
      bedNumber: "",
      houseName: "",
      checkInDate: "",
      checkOutType: "",
      vacationStart: "",
      vacationEnd: "",
      notes: "",
    });
    onClose();
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSelectWorker = (worker: any) => {
    setWizardData({
      ...wizardData,
      employmentId: worker.employmentId,
      workerName: `${worker.firstName} ${worker.lastName}`,
      bedId: worker.currentBedId,
      roomNumber: worker.roomNumber,
      bedNumber: worker.bedNumber,
      houseName: worker.houseName,
      checkInDate: worker.checkInDate,
    });
    setWorkerComboboxOpen(false);
  };

  const handleComplete = async () => {
    // TODO: API call to check-out worker
    // Check-out data prepared
    onComplete();
    handleClose();
  };

  const getTodayDate = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  };

  const stringToDate = (dateStr: string): Date | undefined => {
    if (!dateStr) return undefined;
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const dateToString = (date: Date | undefined): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-checkout-wizard">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DoorOpen className="w-6 h-6 text-primary" />
            {t('checkOut.wizard.title')}
          </DialogTitle>
          <DialogDescription>
            {t('checkOut.wizard.description')}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {s}
              </div>
              {s < 4 && (
                <div
                  className={`w-12 h-1 transition-colors ${
                    step > s ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Step 1: Search Worker */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <User className="w-5 h-5" />
                {t('checkOut.wizard.step1')}
              </div>
              <p className="text-sm text-muted-foreground">
                {t('checkOut.wizard.step1Description')}
              </p>

              <div className="space-y-2">
                <Label>{t('checkOut.wizard.selectWorker')}</Label>
                <Popover open={workerComboboxOpen} onOpenChange={setWorkerComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={workerComboboxOpen}
                      className="w-full justify-between"
                      data-testid="button-select-worker"
                    >
                      {wizardData.workerName || t('checkOut.wizard.searchWorkerPlaceholder')}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder={t('checkOut.wizard.searchWorkerPlaceholder')} />
                      <CommandList>
                        <CommandEmpty>{t('checkOut.wizard.noWorkerFound')}</CommandEmpty>
                        <CommandGroup>
                          {workers.map((worker: any) => (
                            <CommandItem
                              key={worker.employmentId}
                              value={`${worker.firstName} ${worker.lastName}`}
                              onSelect={() => handleSelectWorker(worker)}
                              data-testid={`worker-option-${worker.employmentId}`}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  wizardData.employmentId === worker.employmentId
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                }`}
                              />
                              <div className="flex-1">
                                <div className="font-medium">
                                  {worker.firstName} {worker.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {worker.houseName} - {t('housing.room')} {worker.roomNumber}, {t('housing.bed')} {worker.bedNumber}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Step 2: Current Accommodation Info */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Home className="w-5 h-5" />
                {t('checkOut.wizard.step2')}
              </div>
              <p className="text-sm text-muted-foreground">
                {t('checkOut.wizard.step2Description')}
              </p>

              <div className="p-6 bg-muted/30 border rounded-lg space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{wizardData.workerName}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                    <Home className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('housing.accommodation')}</p>
                      <p className="font-medium">
                        {wizardData.houseName} - {t('housing.room')} {wizardData.roomNumber}, {t('housing.bed')} {wizardData.bedNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                    <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('bedDetails.checkInDate')}</p>
                      <p className="font-medium">{formatDate(wizardData.checkInDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Check-Out Type */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <DoorOpen className="w-5 h-5" />
                {t('checkOut.wizard.step3')}
              </div>
              <p className="text-sm text-muted-foreground">
                {t('checkOut.wizard.step3Description')}
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => setWizardData({ ...wizardData, checkOutType: 'immediate' })}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                    wizardData.checkOutType === 'immediate'
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                  data-testid="button-checkout-type-immediate"
                >
                  <div className="flex items-start gap-3">
                    <DoorOpen className={`w-5 h-5 mt-0.5 ${wizardData.checkOutType === 'immediate' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{t('bedDetails.immediateCheckOut')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('checkOut.wizard.immediateDescription')}
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setWizardData({ ...wizardData, checkOutType: 'vacation' })}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                    wizardData.checkOutType === 'vacation'
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                  data-testid="button-checkout-type-vacation"
                >
                  <div className="flex items-start gap-3">
                    <Plane className={`w-5 h-5 mt-0.5 ${wizardData.checkOutType === 'vacation' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{t('bedDetails.vacationHold')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('checkOut.wizard.vacationDescription')}
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setWizardData({ ...wizardData, checkOutType: 'unnotified' })}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                    wizardData.checkOutType === 'unnotified'
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                  data-testid="button-checkout-type-unnotified"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${wizardData.checkOutType === 'unnotified' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{t('bedDetails.unnotifiedDeparture')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('checkOut.wizard.unnotifiedDescription')}
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Vacation Dates (if vacation selected) */}
              {wizardData.checkOutType === 'vacation' && (
                <div className="p-4 bg-muted/30 border rounded-lg space-y-4 mt-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t('checkOut.wizard.vacationDates')}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('bedDetails.vacationStart')}</Label>
                      <ModernDatePicker
                        date={stringToDate(wizardData.vacationStart)}
                        onDateChange={(date) => setWizardData({ ...wizardData, vacationStart: dateToString(date) })}
                        placeholder={t('common.selectDate')}
                        minDate={getTodayDate()}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('bedDetails.vacationEnd')}</Label>
                      <ModernDatePicker
                        date={stringToDate(wizardData.vacationEnd)}
                        onDateChange={(date) => setWizardData({ ...wizardData, vacationEnd: dateToString(date) })}
                        placeholder={t('common.selectDate')}
                        minDate={stringToDate(wizardData.vacationStart) || getTodayDate()}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Optional Notes */}
              <div className="space-y-2">
                <Label>{t('bedDetails.notesOptional')}</Label>
                <Textarea
                  value={wizardData.notes}
                  onChange={(e) => setWizardData({ ...wizardData, notes: e.target.value })}
                  placeholder={t('bedDetails.addNotePlaceholder')}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <CheckCircle className="w-5 h-5" />
                {t('checkOut.wizard.step4')}
              </div>
              <p className="text-sm text-muted-foreground">
                {t('checkOut.wizard.step4Description')}
              </p>

              <div className="p-6 bg-muted/30 border rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('checkOut.wizard.worker')}</p>
                    <p className="font-medium">{wizardData.workerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('housing.accommodation')}</p>
                    <p className="font-medium">
                      {wizardData.houseName} - {t('housing.room')} {wizardData.roomNumber}, {t('housing.bed')} {wizardData.bedNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('checkOut.wizard.checkOutType')}</p>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {wizardData.checkOutType === 'immediate' && t('bedDetails.immediateCheckOut')}
                      {wizardData.checkOutType === 'vacation' && t('bedDetails.vacationHold')}
                      {wizardData.checkOutType === 'unnotified' && t('bedDetails.unnotifiedDeparture')}
                    </Badge>
                  </div>
                  {wizardData.checkOutType === 'vacation' && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('checkOut.wizard.vacationDates')}</p>
                      <p className="font-medium text-sm">
                        {formatDate(wizardData.vacationStart)} - {formatDate(wizardData.vacationEnd)}
                      </p>
                    </div>
                  )}
                </div>

                {wizardData.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('bedDetails.note')}</p>
                    <p className="text-sm bg-background p-3 rounded border">{wizardData.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            data-testid="button-wizard-back"
          >
            {t('common.back')}
          </Button>
          
          <div className="flex gap-2">
            {step < 4 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (step === 1 && !wizardData.employmentId) ||
                  (step === 3 && !wizardData.checkOutType) ||
                  (step === 3 && wizardData.checkOutType === 'vacation' && (!wizardData.vacationStart || !wizardData.vacationEnd))
                }
                data-testid="button-wizard-next"
              >
                {t('common.next')}
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                data-testid="button-wizard-complete"
              >
                {t('common.complete')}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
