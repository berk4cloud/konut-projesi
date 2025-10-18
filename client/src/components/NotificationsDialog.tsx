import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Bell, CheckCircle2, Calendar, Building2, AlertCircle, StickyNote, User, FileText, CheckCircle, XCircle, Image as ImageIcon, ChevronDown, Phone, Mail, Hash, Cake, Users, Zap, Droplet, Flame } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { tr, enUS, de, nl, fr, pl, bg, type Locale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type Reminder = {
  id: string;
  type: "maintenance" | "lease_end" | "meter_reading" | "inspection" | "other";
  title: string;
  date: string;
  alertDaysBefore: number;
  note?: string;
  recurring?: "monthly" | "yearly" | "none";
  completed?: boolean;
  completedAt?: string;
  houseName?: string; // For display
};

type QRSubmission = {
  id: string;
  qrCode: string;
  taskType: "worker_registration" | "meter_reading" | "document_upload";
  submittedAt: string;
  data: {
    // Worker registration fields
    firstName?: string;
    lastName?: string;
    workerName?: string; // For backward compatibility
    nationality?: string;
    phone?: string;
    email?: string;
    idNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    // Meter reading fields
    meterType?: "electricity" | "water" | "gas";
    meterValue?: string;
    houseName?: string;
    // Document upload fields
    documentType?: string;
    // Photo for both meter reading and documents
    photo?: string;
  };
};

interface NotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingApprovalsCount?: number;
  pendingApprovals?: QRSubmission[];
  upcomingReminders: Reminder[];
  onCompleteReminder: (reminderId: string) => void;
  onAddNote: (reminderId: string, note: string) => void;
  onApproveSubmission?: (id: string) => void;
  onRejectSubmission?: (id: string) => void;
}

export default function NotificationsDialog({
  open,
  onOpenChange,
  pendingApprovalsCount = 0,
  pendingApprovals = [],
  upcomingReminders,
  onCompleteReminder,
  onAddNote,
  onApproveSubmission,
  onRejectSubmission,
}: NotificationsDialogProps) {
  const { t, i18n } = useTranslation();
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(new Set());

  const getDateFnsLocale = () => {
    const localeMap: Record<string, Locale> = {
      tr: tr,
      en: enUS,
      de: de,
      nl: nl,
      fr: fr,
      pl: pl,
      bg: bg,
    };
    return localeMap[i18n.language] || enUS;
  };

  const getLocaleDateFormat = () => {
    const formatMap: Record<string, string> = {
      tr: 'tr-TR',
      en: 'en-US',
      de: 'de-DE',
      nl: 'nl-NL',
      fr: 'fr-FR',
      pl: 'pl-PL',
      bg: 'bg-BG',
    };
    return formatMap[i18n.language] || 'en-US';
  };

  const toggleSubmissionExpanded = (id: string) => {
    setExpandedSubmissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getReminderTypeLabel = (type: Reminder["type"]) => {
    const labels = {
      maintenance: t("notifications.maintenance"),
      lease_end: t("notifications.leaseEnd"),
      meter_reading: t("notifications.meterReading"),
      inspection: t("notifications.inspection"),
      other: t("notifications.other"),
    };
    return labels[type];
  };

  const getReminderTypeColor = (type: Reminder["type"]) => {
    const colors = {
      maintenance: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      lease_end: "bg-red-500/10 text-red-700 dark:text-red-400",
      meter_reading: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      inspection: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
      other: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
    };
    return colors[type];
  };

  const getDaysUntil = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminderDate = new Date(date);
    reminderDate.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((reminderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil;
  };

  const handleSaveNote = (reminderId: string) => {
    onAddNote(reminderId, noteText);
    setEditingNote(null);
    setNoteText("");
  };

  const activeReminders = upcomingReminders.filter(r => !r.completed);
  const completedReminders = upcomingReminders.filter(r => r.completed);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]" data-testid="dialog-notifications">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t("notifications.title")}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="reminders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="approvals" data-testid="tab-approvals">
              {t("notifications.qrApprovals")}
              {pendingApprovalsCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingApprovalsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reminders" data-testid="tab-reminders">
              {t("notifications.reminders")}
              {activeReminders.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {activeReminders.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="mt-4 space-y-3 max-h-[50vh] overflow-y-auto">
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t("notifications.noPending")}</p>
              </div>
            ) : (
              pendingApprovals.map((submission) => {
                const getTaskTypeLabel = () => {
                  if (submission.taskType === "worker_registration") return t("notifications.workerRegistration");
                  if (submission.taskType === "meter_reading") return t("notifications.meterReading");
                  return t("notifications.documentUpload");
                };
                
                const getTaskTypeColor = () => {
                  if (submission.taskType === "worker_registration") return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
                  if (submission.taskType === "meter_reading") return "bg-green-500/10 text-green-700 dark:text-green-400";
                  return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
                };

                const isExpanded = expandedSubmissions.has(submission.id);
                const displayName = submission.data.firstName && submission.data.lastName
                  ? `${submission.data.firstName} ${submission.data.lastName}`
                  : submission.data.workerName || t("notifications.unnamed");

                return (
                  <Card key={submission.id} data-testid={`qr-approval-${submission.id}`}>
                    <CardContent className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={getTaskTypeColor()}>
                              {getTaskTypeLabel()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true, locale: getDateFnsLocale() })}
                            </span>
                          </div>
                          
                          {/* Quick Preview */}
                          <div className="space-y-1">
                            {submission.taskType === "worker_registration" && (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{displayName}</span>
                                {submission.data.nationality && (
                                  <span className="text-muted-foreground">({submission.data.nationality})</span>
                                )}
                              </div>
                            )}
                            {submission.taskType === "meter_reading" && (
                              <div className="flex items-center gap-2">
                                {submission.data.meterType === "electricity" && <Zap className="w-4 h-4 text-amber-600" />}
                                {submission.data.meterType === "water" && <Droplet className="w-4 h-4 text-blue-600" />}
                                {submission.data.meterType === "gas" && <Flame className="w-4 h-4 text-orange-600" />}
                                <span>
                                  {submission.data.meterType === "electricity" && t("notifications.electricity")}
                                  {submission.data.meterType === "water" && t("notifications.water")}
                                  {submission.data.meterType === "gas" && t("notifications.gas")}
                                  : <span className="font-medium">{submission.data.meterValue}</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSubmissionExpanded(submission.id)}
                          data-testid={`button-toggle-details-${submission.id}`}
                        >
                          <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                        </Button>
                      </div>

                      {/* Detailed Information (Collapsible) */}
                      <Collapsible open={isExpanded}>
                        <CollapsibleContent className="space-y-3 pt-3 border-t">
                          {submission.taskType === "worker_registration" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              {submission.data.firstName && (
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">{t("notifications.firstName")}:</span>
                                  <span className="font-medium">{submission.data.firstName}</span>
                                </div>
                              )}
                              {submission.data.lastName && (
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">{t("notifications.lastName")}:</span>
                                  <span className="font-medium">{submission.data.lastName}</span>
                                </div>
                              )}
                              {submission.data.nationality && (
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">{t("notifications.nationality")}:</span>
                                  <span className="font-medium">{submission.data.nationality}</span>
                                </div>
                              )}
                              {submission.data.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">{t("notifications.phone")}:</span>
                                  <span className="font-medium">{submission.data.phone}</span>
                                </div>
                              )}
                              {submission.data.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">{t("notifications.email")}:</span>
                                  <span className="font-medium">{submission.data.email}</span>
                                </div>
                              )}
                              {submission.data.idNumber && (
                                <div className="flex items-center gap-2">
                                  <Hash className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">{t("notifications.idNumber")}:</span>
                                  <span className="font-medium">{submission.data.idNumber}</span>
                                </div>
                              )}
                              {submission.data.dateOfBirth && (
                                <div className="flex items-center gap-2">
                                  <Cake className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">{t("notifications.birthDate")}:</span>
                                  <span className="font-medium">{new Date(submission.data.dateOfBirth).toLocaleDateString(getLocaleDateFormat())}</span>
                                </div>
                              )}
                              {submission.data.gender && (
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">{t("notifications.gender")}:</span>
                                  <span className="font-medium">{submission.data.gender === 'male' ? t("notifications.male") : t("notifications.female")}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {submission.taskType === "meter_reading" && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                {submission.data.houseName && (
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">{t("notifications.housing")}:</span>
                                    <span className="font-medium">{submission.data.houseName}</span>
                                  </div>
                                )}
                                {submission.data.meterValue && (
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">{t("notifications.value")}:</span>
                                    <span className="font-medium">{submission.data.meterValue}</span>
                                  </div>
                                )}
                              </div>
                              
                              {submission.data.photo && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <ImageIcon className="w-4 h-4" />
                                    <span>{t("notifications.meterPhoto")}</span>
                                  </div>
                                  <img 
                                    src={submission.data.photo} 
                                    alt={t("notifications.meterPhotoAlt")} 
                                    className="w-full h-48 object-cover rounded-lg border"
                                    data-testid={`photo-preview-${submission.id}`}
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {submission.taskType === "document_upload" && submission.data.photo && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <ImageIcon className="w-4 h-4" />
                                <span>{submission.data.documentType || t("notifications.document")}</span>
                              </div>
                              <img 
                                src={submission.data.photo} 
                                alt={t("notifications.documentPhotoAlt")} 
                                className="w-full h-48 object-cover rounded-lg border"
                                data-testid={`document-preview-${submission.id}`}
                              />
                            </div>
                          )}
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => onApproveSubmission?.(submission.id)}
                          className="flex-1"
                          data-testid={`button-approve-${submission.id}`}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {t("notifications.approve")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRejectSubmission?.(submission.id)}
                          className="flex-1"
                          data-testid={`button-reject-${submission.id}`}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {t("notifications.reject")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="reminders" className="mt-4 space-y-4 max-h-[50vh] overflow-y-auto">
            {activeReminders.length === 0 && completedReminders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t("notifications.noUpcoming")}</p>
              </div>
            ) : (
              <>
                {/* Active Reminders */}
                {activeReminders.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm text-muted-foreground">{t("notifications.upcomingReminders")}</h3>
                    {activeReminders.map((reminder) => {
                      const daysUntil = getDaysUntil(reminder.date);
                      return (
                        <Card key={reminder.id} data-testid={`reminder-card-${reminder.id}`}>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={false}
                                onCheckedChange={() => onCompleteReminder(reminder.id)}
                                className="mt-1"
                                data-testid={`checkbox-complete-${reminder.id}`}
                              />
                              <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-medium">{reminder.title}</h4>
                                    <Badge className={getReminderTypeColor(reminder.type)}>
                                      {getReminderTypeLabel(reminder.type)}
                                    </Badge>
                                  </div>
                                  {reminder.houseName && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <Building2 className="w-3 h-3" />
                                      {reminder.houseName}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(reminder.date).toLocaleDateString(getLocaleDateFormat())}
                                    {daysUntil >= 0 && (
                                      <span className="text-amber-600 dark:text-amber-400 font-medium ml-1">
                                        ({daysUntil === 0 ? t("notifications.today") : daysUntil === 1 ? t("notifications.tomorrow") : t("notifications.daysLater", { days: daysUntil })})
                                      </span>
                                    )}
                                  </div>
                              </div>
                            </div>

                            {/* Note Section */}
                            {reminder.note && editingNote !== reminder.id && (
                              <div className="bg-muted/50 rounded-md p-3 text-sm">
                                <div className="flex items-start gap-2">
                                  <StickyNote className="w-4 h-4 mt-0.5 text-muted-foreground" />
                                  <p className="flex-1">{reminder.note}</p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingNote(reminder.id);
                                      setNoteText(reminder.note || "");
                                    }}
                                    data-testid={`button-edit-note-${reminder.id}`}
                                  >
                                    {t("notifications.edit")}
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Note Editing */}
                            {editingNote === reminder.id && (
                              <div className="space-y-2">
                                <Textarea
                                  value={noteText}
                                  onChange={(e) => setNoteText(e.target.value)}
                                  placeholder={t("notifications.addNotePlaceholder")}
                                  className="resize-none"
                                  rows={3}
                                  data-testid={`textarea-note-${reminder.id}`}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveNote(reminder.id)}
                                    data-testid={`button-save-note-${reminder.id}`}
                                  >
                                    {t("notifications.save")}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingNote(null);
                                      setNoteText("");
                                    }}
                                    data-testid={`button-cancel-note-${reminder.id}`}
                                  >
                                    {t("notifications.cancel")}
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Add Note Button */}
                            {!reminder.note && editingNote !== reminder.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingNote(reminder.id);
                                  setNoteText("");
                                }}
                                className="w-full"
                                data-testid={`button-add-note-${reminder.id}`}
                              >
                                <StickyNote className="w-4 h-4 mr-2" />
                                {t("notifications.addNote")}
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* Completed Reminders */}
                {completedReminders.length > 0 && (
                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      {t("notifications.completed")}
                    </h3>
                    {completedReminders.map((reminder) => (
                      <Card key={reminder.id} className="opacity-60" data-testid={`completed-reminder-${reminder.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <div className="flex-1">
                              <h4 className="font-medium line-through">{reminder.title}</h4>
                              {reminder.completedAt && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDistanceToNow(new Date(reminder.completedAt), { addSuffix: true, locale: getDateFnsLocale() })} {t("notifications.completedAt")}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
