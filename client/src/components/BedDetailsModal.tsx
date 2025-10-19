import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, User, Home, DoorOpen, Clock, FileText, ChevronDown, Plane, AlertTriangle, Calendar as CalendarIcon } from "lucide-react";
import { ModernDatePicker } from "@/components/ui/modern-date-picker";
import { format } from "date-fns";
import { getTodayString } from "@/utils/dateHelpers";

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
    checkOutDate?: string;
    expectedMoveOutDate?: string;
    reservationId?: string;
    roomNumber?: string;
    houseName?: string;
  } | null;
}

type CheckOutAction = 'immediate' | 'vacation' | 'unnotified' | 'future' | 'modify' | null;

export default function BedDetailsModal({
  open,
  onClose,
  bed,
}: BedDetailsModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedAction, setSelectedAction] = useState<CheckOutAction>(null);
  const [futureCheckOutDate, setFutureCheckOutDate] = useState("");
  const [vacationStart, setVacationStart] = useState("");
  const [vacationEnd, setVacationEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [reservationNotes, setReservationNotes] = useState<string[]>([]);

  // Load existing checkout date and notes when modal opens
  useEffect(() => {
    if (open && bed) {
      if (bed.checkOutDate) {
        setFutureCheckOutDate(bed.checkOutDate);
      }
      
      // Fetch reservation notes if we have a reservationId
      if (bed.reservationId) {
        apiRequest("GET", `/api/reservations/${bed.reservationId}/notes`)
          .then(data => {
            if (data.notes) {
              setReservationNotes(data.notes);
            }
          })
          .catch(err => {
            console.error('Failed to fetch notes:', err);
            setReservationNotes([]);
          });
      } else {
        setReservationNotes([]);
      }
    }
  }, [open, bed]);

  // Checkout mutation (must be before early return to maintain hook order)
  const checkoutMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!bed?.reservationId) {
        throw new Error("No reservation ID");
      }
      return apiRequest("PATCH", `/api/reservations/${bed.reservationId}/check-out`, data);
    },
    onSuccess: async () => {
      toast({
        title: t('common.success'),
        description: t('bedDetails.checkOutSuccess'),
      });
      await queryClient.refetchQueries({ queryKey: ['/api/houses'] });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('bedDetails.checkOutError'),
        variant: "destructive",
      });
    },
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (note: string) => {
      if (!bed?.reservationId) {
        throw new Error("No reservation ID");
      }
      return apiRequest("POST", `/api/reservations/${bed.reservationId}/notes`, { note });
    },
    onSuccess: async () => {
      toast({
        title: t('common.success'),
        description: t('bedDetails.noteAdded'),
      });
      setIsAddingNote(false);
      setNotes("");
      // Refresh notes
      if (bed?.reservationId) {
        try {
          const data = await apiRequest("GET", `/api/reservations/${bed.reservationId}/notes`);
          if (data.notes) {
            setReservationNotes(data.notes);
          }
        } catch (err) {
          console.error('Failed to refresh notes:', err);
        }
      }
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('bedDetails.noteError'),
        variant: "destructive",
      });
    },
  });

  // Early return after all hooks to maintain hook order
  if (!bed) return null;

  const handleClose = () => {
    setSelectedAction(null);
    setFutureCheckOutDate("");
    setVacationStart("");
    setVacationEnd("");
    setNotes("");
    setIsAddingNote(false);
    onClose();
  };

  const handleCheckOutAction = (action: CheckOutAction) => {
    setSelectedAction(action);
  };

  const handleConfirmCheckOut = () => {
    if (!bed.reservationId) {
      toast({
        title: t('common.error'),
        description: "No reservation found",
        variant: "destructive",
      });
      return;
    }

    // Use local date to avoid UTC timezone issues
    let checkOutDate = getTodayString();
    let checkOutType = selectedAction;

    // Validate inputs based on action type
    if (selectedAction === 'future' || selectedAction === 'modify') {
      if (!futureCheckOutDate) {
        toast({
          title: t('common.error'),
          description: t('bedDetails.selectCheckOutDate'),
          variant: "destructive",
        });
        return;
      }
      checkOutDate = futureCheckOutDate;
    } else if (selectedAction === 'vacation') {
      if (!vacationStart || !vacationEnd) {
        toast({
          title: t('common.error'),
          description: t('bedDetails.selectVacationDates'),
          variant: "destructive",
        });
        return;
      }
      checkOutType = 'vacation';
    }

    const data: any = {
      checkOutDate,
      checkOutType,
      notes: notes || undefined,
    };

    if (selectedAction === 'vacation') {
      data.vacationStart = vacationStart;
      data.vacationEnd = vacationEnd;
    }

    checkoutMutation.mutate(data);
  };

  const handleAddNote = () => {
    if (!notes.trim()) {
      toast({
        title: t('common.error'),
        description: t('bedDetails.emptyNote'),
        variant: "destructive",
      });
      return;
    }
    
    addNoteMutation.mutate(notes);
  };

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

  // Date conversion helpers
  const getTodayDate = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  };

  const stringToDate = (dateStr: string): Date | undefined => {
    if (!dateStr) return undefined;
    // Parse date as local time to avoid UTC conversion issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const dateToString = (date: Date | undefined): string => {
    if (!date) return "";
    // Use local date values to avoid timezone shifts
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Check if we can modify checkout date
  const hasScheduledCheckOut = bed?.checkOutDate && new Date(bed.checkOutDate) > new Date();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-bed-details">
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
                    <User className={bed.worker.gender === 'male' ? 'text-blue-600' : 'text-pink-600'} size={16} />
                    <span className={bed.worker.gender === 'male' ? 'text-blue-600' : 'text-pink-600'}>
                      {t(`common.${bed.worker.gender}`)}
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
                    <p className="text-xs text-muted-foreground mb-1">
                      {bed.checkOutDate ? t('bedDetails.scheduledCheckOut') : t('bedDetails.expectedCheckOut')}
                    </p>
                    <p className="font-medium">{formatDate(bed.checkOutDate || bed.expectedMoveOutDate)}</p>
                  </div>
                </div>
              </div>

              {/* Show scheduled checkout notice */}
              {hasScheduledCheckOut && !selectedAction && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        {t('bedDetails.scheduledCheckOutTitle')}
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {t('bedDetails.scheduledCheckOutDescription', { date: formatDate(bed.checkOutDate) })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reservation Notes */}
              {reservationNotes.length > 0 && !selectedAction && !isAddingNote && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {t('bedDetails.notes')}
                  </h4>
                  <div className="space-y-2">
                    {reservationNotes.map((note, idx) => (
                      <div key={idx} className="p-3 bg-muted/50 rounded-lg text-sm">
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Check-out Action Form */}
              {selectedAction && (
                <div className="p-4 bg-muted/30 border rounded-lg space-y-4">
                  <div className="flex items-center gap-2">
                    {selectedAction === 'immediate' && <DoorOpen className="w-5 h-5 text-green-600" />}
                    {selectedAction === 'future' && <CalendarIcon className="w-5 h-5 text-blue-600" />}
                    {selectedAction === 'modify' && <CalendarIcon className="w-5 h-5 text-orange-600" />}
                    {selectedAction === 'vacation' && <Plane className="w-5 h-5 text-blue-600" />}
                    {selectedAction === 'unnotified' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                    <h4 className="font-semibold">
                      {selectedAction === 'immediate' && t('bedDetails.immediateCheckOut')}
                      {selectedAction === 'future' && t('bedDetails.futureCheckOut')}
                      {selectedAction === 'modify' && t('bedDetails.modifyCheckOut')}
                      {selectedAction === 'vacation' && t('bedDetails.vacationHold')}
                      {selectedAction === 'unnotified' && t('bedDetails.unnotifiedDeparture')}
                    </h4>
                  </div>

                  {/* Future checkout date picker */}
                  {(selectedAction === 'future' || selectedAction === 'modify') && (
                    <div className="space-y-2">
                      <Label>{t('bedDetails.checkOutDate')}</Label>
                      <ModernDatePicker
                        date={stringToDate(futureCheckOutDate)}
                        onDateChange={(date) => setFutureCheckOutDate(dateToString(date))}
                        placeholder={t('common.selectDate')}
                        minDate={getTodayDate()}
                      />
                    </div>
                  )}

                  {/* Vacation date pickers */}
                  {selectedAction === 'vacation' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('bedDetails.vacationStart')}</Label>
                        <ModernDatePicker
                          date={stringToDate(vacationStart)}
                          onDateChange={(date) => setVacationStart(dateToString(date))}
                          placeholder={t('common.selectDate')}
                          minDate={getTodayDate()}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('bedDetails.vacationEnd')}</Label>
                        <ModernDatePicker
                          date={stringToDate(vacationEnd)}
                          onDateChange={(date) => setVacationEnd(dateToString(date))}
                          placeholder={t('common.selectDate')}
                          minDate={stringToDate(vacationStart) || getTodayDate()}
                        />
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label>{t('bedDetails.notesOptional')}</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t('bedDetails.addNotePlaceholder')}
                      rows={3}
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleConfirmCheckOut} 
                      className="flex-1"
                      disabled={checkoutMutation.isPending}
                    >
                      {checkoutMutation.isPending ? t('common.saving') : t('common.confirm')}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedAction(null)}
                      disabled={checkoutMutation.isPending}
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                </div>
              )}

              {/* Add Note Form */}
              {isAddingNote && !selectedAction && (
                <div className="p-4 bg-muted/30 border rounded-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold">{t('bedDetails.addNote')}</h4>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('bedDetails.note')}</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t('bedDetails.addNotePlaceholder')}
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddNote} 
                      className="flex-1"
                      disabled={addNoteMutation.isPending}
                    >
                      {addNoteMutation.isPending ? t('common.saving') : t('common.save')}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsAddingNote(false);
                        setNotes("");
                      }}
                      disabled={addNoteMutation.isPending}
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                </div>
              )}
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
          {bed.status === 'occupied' && bed.worker && !selectedAction && !isAddingNote && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" data-testid="button-checkout-menu">
                    <DoorOpen className="w-4 h-4 mr-2" />
                    {t('bedDetails.checkOut')}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuItem onClick={() => handleCheckOutAction('immediate')} data-testid="menu-checkout-immediate">
                    <DoorOpen className="w-4 h-4 mr-2" />
                    {t('bedDetails.immediateCheckOut')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCheckOutAction('future')} data-testid="menu-checkout-future">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {t('bedDetails.futureCheckOut')}
                  </DropdownMenuItem>
                  {hasScheduledCheckOut && (
                    <DropdownMenuItem onClick={() => handleCheckOutAction('modify')} data-testid="menu-checkout-modify">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {t('bedDetails.modifyCheckOut')}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleCheckOutAction('vacation')} data-testid="menu-checkout-vacation">
                    <Plane className="w-4 h-4 mr-2" />
                    {t('bedDetails.vacationHold')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCheckOutAction('unnotified')} data-testid="menu-checkout-unnotified">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {t('bedDetails.unnotifiedDeparture')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={() => setIsAddingNote(true)} data-testid="button-add-note">
                <FileText className="w-4 h-4 mr-2" />
                {t('bedDetails.addNote')}
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={handleClose} data-testid="button-close">
            {t('common.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
