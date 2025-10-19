import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModernDatePicker } from "@/components/ui/modern-date-picker";
import { 
  User, 
  Calendar,
  Wrench,
  UserPlus,
  Check,
  ChevronsUpDown,
  BedDouble
} from "lucide-react";

interface EnhancedBedActionModalProps {
  open: boolean;
  onClose: () => void;
  bedNumber?: number;
  roomNumber?: string;
  houseName?: string;
  bedId?: string;
  onAction: (action: 'assign' | 'reserve' | 'maintenance', data: any) => void;
}

export default function EnhancedBedActionModal({
  open,
  onClose,
  bedNumber,
  roomNumber,
  houseName,
  bedId,
  onAction,
}: EnhancedBedActionModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'assign' | 'reserve' | 'maintenance'>('assign');
  const [workerComboboxOpen, setWorkerComboboxOpen] = useState(false);
  const [showQuickRegister, setShowQuickRegister] = useState(false);

  // Assign Worker State
  const [selectedEmploymentId, setSelectedEmploymentId] = useState("");
  const [selectedWorkerName, setSelectedWorkerName] = useState("");
  const [assignStartDate, setAssignStartDate] = useState("");
  const [assignEndDate, setAssignEndDate] = useState("");

  // Quick Register State
  const [quickRegisterData, setQuickRegisterData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
  });

  // Reserve Bed State
  const [reserveStartDate, setReserveStartDate] = useState("");
  const [reserveEndDate, setReserveEndDate] = useState("");
  const [reserveNotes, setReserveNotes] = useState("");

  // Maintenance State
  const [maintenanceStartDate, setMaintenanceStartDate] = useState("");
  const [maintenanceEndDate, setMaintenanceEndDate] = useState("");
  const [maintenanceOpenEnded, setMaintenanceOpenEnded] = useState(false);
  const [maintenanceReason, setMaintenanceReason] = useState("");

  // Fetch workers
  const { data: workers = [] } = useQuery<any[]>({
    queryKey: ['/api/workers'],
    enabled: open && activeTab === 'assign',
  });

  const handleClose = () => {
    // Reset all state
    setActiveTab('assign');
    setSelectedEmploymentId("");
    setSelectedWorkerName("");
    setAssignStartDate("");
    setAssignEndDate("");
    setShowQuickRegister(false);
    setQuickRegisterData({ firstName: "", lastName: "", gender: "", dateOfBirth: "" });
    setReserveStartDate("");
    setReserveEndDate("");
    setReserveNotes("");
    setMaintenanceStartDate("");
    setMaintenanceEndDate("");
    setMaintenanceOpenEnded(false);
    setMaintenanceReason("");
    onClose();
  };

  const handleAssign = () => {
    if (showQuickRegister) {
      // Quick register and assign
      onAction('assign', {
        quickRegister: quickRegisterData,
        startDate: assignStartDate,
        endDate: assignEndDate || null,
      });
    } else {
      // Assign existing worker
      onAction('assign', {
        employmentId: selectedEmploymentId,
        startDate: assignStartDate,
        endDate: assignEndDate || null,
      });
    }
    handleClose();
  };

  const handleReserve = () => {
    onAction('reserve', {
      startDate: reserveStartDate,
      endDate: reserveEndDate,
      notes: reserveNotes,
    });
    handleClose();
  };

  const handleMaintenance = () => {
    onAction('maintenance', {
      startDate: maintenanceStartDate,
      endDate: maintenanceOpenEnded ? null : maintenanceEndDate,
      reason: maintenanceReason,
    });
    handleClose();
  };

  const handleSelectWorker = (worker: any) => {
    setSelectedEmploymentId(worker.employmentId);
    setSelectedWorkerName(`${worker.firstName} ${worker.lastName}`);
    setWorkerComboboxOpen(false);
  };

  const getTodayStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl" data-testid="dialog-bed-action">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-primary" />
            {houseName} - {t('housing.room')} {roomNumber}, {t('housing.bed')} {bedNumber}
          </DialogTitle>
          <DialogDescription>
            {t('bedAction.selectAction')}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assign" className="gap-2" data-testid="tab-assign">
              <User className="w-4 h-4" />
              {t('bedAction.assignWorker')}
            </TabsTrigger>
            <TabsTrigger value="reserve" className="gap-2" data-testid="tab-reserve">
              <Calendar className="w-4 h-4" />
              {t('bedAction.reserveBed')}
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="gap-2" data-testid="tab-maintenance">
              <Wrench className="w-4 h-4" />
              {t('bedAction.setMaintenance')}
            </TabsTrigger>
          </TabsList>

          {/* Assign Worker Tab */}
          <TabsContent value="assign" className="space-y-4 mt-4">
            {!showQuickRegister ? (
              <>
                <div className="space-y-2">
                  <Label>{t('bedAction.selectWorker')}</Label>
                  <Popover open={workerComboboxOpen} onOpenChange={setWorkerComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={workerComboboxOpen}
                        className="w-full justify-between"
                        data-testid="button-select-worker"
                      >
                        {selectedWorkerName || t('bedAction.searchWorker')}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder={t('bedAction.searchWorker')} />
                        <CommandList>
                          <CommandEmpty>{t('bedAction.noWorkerFound')}</CommandEmpty>
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
                                    selectedEmploymentId === worker.employmentId
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  }`}
                                />
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {worker.firstName} {worker.lastName}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {worker.gender === 'male' ? '♂' : '♀'} {t(`common.${worker.gender}`)}
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

                <Button
                  variant="outline"
                  onClick={() => setShowQuickRegister(true)}
                  className="w-full gap-2"
                  data-testid="button-quick-register"
                >
                  <UserPlus className="w-4 h-4" />
                  {t('bedAction.quickRegister')}
                </Button>
              </>
            ) : (
              <>
                <div className="p-4 bg-muted/30 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      {t('bedAction.quickRegisterWorker')}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQuickRegister(false)}
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('workers.firstName')}</Label>
                      <Input
                        value={quickRegisterData.firstName}
                        onChange={(e) => setQuickRegisterData({ ...quickRegisterData, firstName: e.target.value })}
                        placeholder={t('workers.firstName')}
                        data-testid="input-quick-firstname"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('workers.lastName')}</Label>
                      <Input
                        value={quickRegisterData.lastName}
                        onChange={(e) => setQuickRegisterData({ ...quickRegisterData, lastName: e.target.value })}
                        placeholder={t('workers.lastName')}
                        data-testid="input-quick-lastname"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('common.gender')}</Label>
                      <Select
                        value={quickRegisterData.gender}
                        onValueChange={(val) => setQuickRegisterData({ ...quickRegisterData, gender: val })}
                      >
                        <SelectTrigger data-testid="select-quick-gender">
                          <SelectValue placeholder={t('common.selectGender')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">{t('common.male')}</SelectItem>
                          <SelectItem value="female">{t('common.female')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('workers.dateOfBirth')}</Label>
                      <Input
                        type="date"
                        value={quickRegisterData.dateOfBirth}
                        onChange={(e) => setQuickRegisterData({ ...quickRegisterData, dateOfBirth: e.target.value })}
                        data-testid="input-quick-dob"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('bedAction.startDate')}</Label>
                <ModernDatePicker
                  date={assignStartDate}
                  onDateChange={(date) => setAssignStartDate(date || "")}
                  placeholder={t('common.selectDate')}
                  minDate={getTodayStr()}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('bedAction.endDate')} ({t('common.optional')})</Label>
                <ModernDatePicker
                  date={assignEndDate}
                  onDateChange={(date) => setAssignEndDate(date || "")}
                  placeholder={t('common.selectDate')}
                  minDate={assignStartDate || getTodayStr()}
                />
              </div>
            </div>
          </TabsContent>

          {/* Reserve Bed Tab */}
          <TabsContent value="reserve" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              {t('bedAction.reserveDescription')}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('bedAction.reserveStart')}</Label>
                <ModernDatePicker
                  date={reserveStartDate}
                  onDateChange={(date) => setReserveStartDate(date || "")}
                  placeholder={t('common.selectDate')}
                  minDate={getTodayStr()}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('bedAction.reserveEnd')}</Label>
                <ModernDatePicker
                  date={reserveEndDate}
                  onDateChange={(date) => setReserveEndDate(date || "")}
                  placeholder={t('common.selectDate')}
                  minDate={reserveStartDate || getTodayStr()}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('bedDetails.notesOptional')}</Label>
              <Input
                value={reserveNotes}
                onChange={(e) => setReserveNotes(e.target.value)}
                placeholder={t('bedAction.reserveNotesPlaceholder')}
                data-testid="input-reserve-notes"
              />
            </div>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              {t('bedAction.maintenanceDescription')}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('bedAction.maintenanceStart')}</Label>
                <ModernDatePicker
                  date={maintenanceStartDate}
                  onDateChange={(date) => setMaintenanceStartDate(date || "")}
                  placeholder={t('common.selectDate')}
                  minDate={getTodayStr()}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {t('bedAction.maintenanceEnd')}
                  {maintenanceOpenEnded && <Badge variant="secondary" className="ml-2 bg-amber-500 text-white">{t('bedAction.openEnded')}</Badge>}
                </Label>
                <ModernDatePicker
                  date={maintenanceEndDate}
                  onDateChange={(date) => setMaintenanceEndDate(date || "")}
                  placeholder={t('common.selectDate')}
                  minDate={maintenanceStartDate || getTodayStr()}
                  disabled={maintenanceOpenEnded}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="open-ended"
                checked={maintenanceOpenEnded}
                onChange={(e) => setMaintenanceOpenEnded(e.target.checked)}
                data-testid="checkbox-open-ended"
              />
              <Label htmlFor="open-ended" className="cursor-pointer">
                {t('bedAction.openEndedMaintenance')}
              </Label>
            </div>
            <div className="space-y-2">
              <Label>{t('bedAction.maintenanceReason')}</Label>
              <Input
                value={maintenanceReason}
                onChange={(e) => setMaintenanceReason(e.target.value)}
                placeholder={t('bedAction.maintenanceReasonPlaceholder')}
                data-testid="input-maintenance-reason"
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} data-testid="button-cancel">
            {t('common.cancel')}
          </Button>
          {activeTab === 'assign' && (
            <Button
              onClick={handleAssign}
              disabled={
                (!showQuickRegister && !selectedEmploymentId) ||
                (showQuickRegister && (!quickRegisterData.firstName || !quickRegisterData.lastName || !quickRegisterData.gender)) ||
                !assignStartDate
              }
              data-testid="button-confirm-assign"
            >
              {t('bedAction.assign')}
            </Button>
          )}
          {activeTab === 'reserve' && (
            <Button
              onClick={handleReserve}
              disabled={!reserveStartDate || !reserveEndDate}
              data-testid="button-confirm-reserve"
            >
              {t('bedAction.reserve')}
            </Button>
          )}
          {activeTab === 'maintenance' && (
            <Button
              onClick={handleMaintenance}
              disabled={!maintenanceStartDate || (!maintenanceOpenEnded && !maintenanceEndDate)}
              data-testid="button-confirm-maintenance"
            >
              {t('bedAction.setMaintenance')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
