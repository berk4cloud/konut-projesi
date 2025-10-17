import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, CheckCircle2, Calendar, Building2, AlertCircle, StickyNote, User, FileText, CheckCircle, XCircle, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

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
    workerName?: string;
    nationality?: string;
    meterType?: string;
    meterValue?: string;
    documentType?: string;
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
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const getReminderTypeLabel = (type: Reminder["type"]) => {
    const labels = {
      maintenance: "Bakım",
      lease_end: "Sözleşme Sonu",
      meter_reading: "Sayaç Okuma",
      inspection: "Denetim",
      other: "Diğer",
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
            Bildirimler
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="reminders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="approvals" data-testid="tab-approvals">
              QR Onaylar
              {pendingApprovalsCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingApprovalsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reminders" data-testid="tab-reminders">
              Hatırlatmalar
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
                <p>Bekleyen QR onayı bulunmuyor</p>
              </div>
            ) : (
              pendingApprovals.map((submission) => {
                const getTaskTypeLabel = () => {
                  if (submission.taskType === "worker_registration") return "Çalışan Kaydı";
                  if (submission.taskType === "meter_reading") return "Sayaç Okuma";
                  return "Belge Yükleme";
                };
                
                const getTaskTypeColor = () => {
                  if (submission.taskType === "worker_registration") return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
                  if (submission.taskType === "meter_reading") return "bg-green-500/10 text-green-700 dark:text-green-400";
                  return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
                };

                return (
                  <Card key={submission.id} data-testid={`qr-approval-${submission.id}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={getTaskTypeColor()}>
                              {getTaskTypeLabel()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true, locale: tr })}
                            </span>
                          </div>
                          
                          {/* Submission Data */}
                          <div className="space-y-1 text-sm">
                            {submission.data.workerName && (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span>{submission.data.workerName}</span>
                                {submission.data.nationality && (
                                  <span className="text-muted-foreground">({submission.data.nationality})</span>
                                )}
                              </div>
                            )}
                            {submission.data.meterType && (
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <span>{submission.data.meterType === "electricity" ? "Elektrik" : "Su"}: {submission.data.meterValue}</span>
                              </div>
                            )}
                            {submission.data.documentType && (
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <span>{submission.data.documentType}</span>
                              </div>
                            )}
                            {submission.data.photo && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <ImageIcon className="w-4 h-4" />
                                <span>Fotoğraf eklendi</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => onApproveSubmission?.(submission.id)}
                          className="flex-1"
                          data-testid={`button-approve-${submission.id}`}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Onayla
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRejectSubmission?.(submission.id)}
                          className="flex-1"
                          data-testid={`button-reject-${submission.id}`}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reddet
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
                <p>Yaklaşan hatırlatma bulunmuyor</p>
              </div>
            ) : (
              <>
                {/* Active Reminders */}
                {activeReminders.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm text-muted-foreground">Yaklaşan Hatırlatmalar</h3>
                    {activeReminders.map((reminder) => {
                      const daysUntil = getDaysUntil(reminder.date);
                      return (
                        <Card key={reminder.id} data-testid={`reminder-card-${reminder.id}`}>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1">
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
                                    {new Date(reminder.date).toLocaleDateString("tr-TR")}
                                    {daysUntil >= 0 && (
                                      <span className="text-amber-600 dark:text-amber-400 font-medium ml-1">
                                        ({daysUntil === 0 ? "Bugün" : daysUntil === 1 ? "Yarın" : `${daysUntil} gün sonra`})
                                      </span>
                                    )}
                                  </div>
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
                                    Düzenle
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
                                  placeholder="Not ekle..."
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
                                    Kaydet
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
                                    İptal
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
                                Not Ekle
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
                      Tamamlananlar
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
                                  {formatDistanceToNow(new Date(reminder.completedAt), { addSuffix: true, locale: tr })} tamamlandı
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
