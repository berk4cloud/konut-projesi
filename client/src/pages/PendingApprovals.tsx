import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Gauge, FileUp, Check, X, Eye, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ApprovalType = "worker_registration" | "meter_reading" | "document_upload";
type ApprovalStatus = "pending" | "approved" | "rejected";

type PendingApproval = {
  id: string;
  type: ApprovalType;
  qrCode: string;
  qrTitle: string;
  data: any;
  submittedAt: string;
  status: ApprovalStatus;
};

const mockPendingApprovals: PendingApproval[] = [
  {
    id: "1",
    type: "worker_registration",
    qrCode: "Kts3542MMA",
    qrTitle: "Geilenkirchen Evleri Kayıt Formu",
    data: {
      name: "Ahmet Yılmaz",
      birthDate: "1990-05-15",
      gender: "Erkek",
      country: "Türkiye",
      phone: "+90 555 123 4567",
    },
    submittedAt: "2025-10-16T09:30:00",
    status: "pending",
  },
  {
    id: "2",
    type: "meter_reading",
    qrCode: "Br9Xm2pQwE",
    qrTitle: "Aylık Elektrik Sayaç Okuma",
    data: {
      house: "Geldernstrasse 13",
      meterType: "Elektrik",
      value: "12450",
      unit: "kWh",
      photo: "meter_photo_1.jpg",
    },
    submittedAt: "2025-10-16T14:20:00",
    status: "pending",
  },
  {
    id: "3",
    type: "worker_registration",
    qrCode: "Kts3542MMA",
    qrTitle: "Geilenkirchen Evleri Kayıt Formu",
    data: {
      name: "Maria Schmidt",
      birthDate: "1988-12-03",
      gender: "Kadın",
      country: "Almanya",
      phone: "+49 176 234 5678",
    },
    submittedAt: "2025-10-16T16:45:00",
    status: "pending",
  },
  {
    id: "4",
    type: "document_upload",
    qrCode: "Pq4Hn8TyLk",
    qrTitle: "Kimlik Belgesi Yükleme",
    data: {
      workerName: "John Doe",
      documentType: "Kimlik Kartı",
      fileName: "passport_john.pdf",
      fileSize: "2.4 MB",
    },
    submittedAt: "2025-10-16T11:15:00",
    status: "pending",
  },
  {
    id: "5",
    type: "meter_reading",
    qrCode: "Dj3Ks9FmYu",
    qrTitle: "Su Sayacı Okuma - Hauptstrasse",
    data: {
      house: "Hauptstrasse 45",
      meterType: "Su",
      value: "3850",
      unit: "m³",
      photo: "meter_photo_2.jpg",
    },
    submittedAt: "2025-10-16T08:00:00",
    status: "pending",
  },
];

export default function PendingApprovals() {
  const { toast } = useToast();
  const [approvals, setApprovals] = useState<PendingApproval[]>(mockPendingApprovals);
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const getTypeIcon = (type: ApprovalType) => {
    const icons = {
      worker_registration: Users,
      meter_reading: Gauge,
      document_upload: FileUp,
    };
    return icons[type];
  };

  const getTypeLabel = (type: ApprovalType) => {
    const labels = {
      worker_registration: "Çalışan Kaydı",
      meter_reading: "Sayaç Okuma",
      document_upload: "Döküman Upload",
    };
    return labels[type];
  };

  const getTypeColor = (type: ApprovalType) => {
    const colors = {
      worker_registration: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20",
      meter_reading: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20",
      document_upload: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20",
    };
    return colors[type];
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} dakika önce`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} saat önce`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} gün önce`;
    }
  };

  const handleApprove = (id: string) => {
    setApprovals(approvals.filter(a => a.id !== id));
    toast({
      title: "Onaylandı",
      description: "İstek başarıyla onaylandı",
    });
  };

  const handleReject = (id: string) => {
    setApprovals(approvals.filter(a => a.id !== id));
    toast({
      title: "Reddedildi",
      description: "İstek reddedildi",
      variant: "destructive",
    });
  };

  const handleViewDetails = (approval: PendingApproval) => {
    setSelectedApproval(approval);
    setIsDetailDialogOpen(true);
  };

  const renderApprovalData = (approval: PendingApproval) => {
    if (approval.type === "worker_registration") {
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">İsim:</span>
              <span className="ml-2 font-medium">{approval.data.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Doğum Tarihi:</span>
              <span className="ml-2 font-medium">{approval.data.birthDate}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Cinsiyet:</span>
              <span className="ml-2 font-medium">{approval.data.gender}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Ülke:</span>
              <span className="ml-2 font-medium">{approval.data.country}</span>
            </div>
          </div>
        </div>
      );
    } else if (approval.type === "meter_reading") {
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Ev:</span>
              <span className="ml-2 font-medium">{approval.data.house}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Sayaç Tipi:</span>
              <span className="ml-2 font-medium">{approval.data.meterType}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Değer:</span>
              <span className="ml-2 font-medium">{approval.data.value} {approval.data.unit}</span>
            </div>
            <div>
              <Badge variant="secondary" className="w-fit">📸 Fotoğraf eklendi</Badge>
            </div>
          </div>
        </div>
      );
    } else if (approval.type === "document_upload") {
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Çalışan:</span>
              <span className="ml-2 font-medium">{approval.data.workerName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Döküman:</span>
              <span className="ml-2 font-medium">{approval.data.documentType}</span>
            </div>
            <div className="col-span-2">
              <Badge variant="secondary" className="w-fit">
                📄 {approval.data.fileName} ({approval.data.fileSize})
              </Badge>
            </div>
          </div>
        </div>
      );
    }
  };

  const pendingCount = approvals.filter(a => a.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      <Header tenantName="Cova B.V." userName="Admin" />

      <main className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold mb-2">Bekleyen Onaylar</h2>
              <p className="text-muted-foreground">
                QR kodlarından gelen istekleri inceleyin ve onaylayın
              </p>
            </div>
            <Button variant="outline" data-testid="button-refresh-approvals">
              <RefreshCw className="w-4 h-4 mr-2" />
              Yenile
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="default" className="text-lg px-4 py-2">
              {pendingCount} Bekleyen
            </Badge>
          </div>

          <div className="space-y-4">
            {approvals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Check className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Tüm İstekler Tamamlandı</h3>
                  <p className="text-muted-foreground text-center">
                    Şu anda bekleyen onay bulunmuyor
                  </p>
                </CardContent>
              </Card>
            ) : (
              approvals.map((approval) => {
                const Icon = getTypeIcon(approval.type);
                return (
                  <Card key={approval.id} data-testid={`approval-card-${approval.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${getTypeColor(approval.type)}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-1">
                              {getTypeLabel(approval.type)}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <span>QR: {approval.qrTitle}</span>
                              <span>•</span>
                              <span>{getTimeAgo(approval.submittedAt)}</span>
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {renderApprovalData(approval)}
                        
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            onClick={() => handleApprove(approval.id)}
                            data-testid={`button-approve-${approval.id}`}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Onayla
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleReject(approval.id)}
                            data-testid={`button-reject-${approval.id}`}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reddet
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleViewDetails(approval)}
                            data-testid={`button-details-${approval.id}`}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Detaylar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedApproval && getTypeLabel(selectedApproval.type)}</DialogTitle>
            <DialogDescription>
              Detaylı bilgileri inceleyin
            </DialogDescription>
          </DialogHeader>

          {selectedApproval && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">QR Kod</p>
                  <p className="font-medium">{selectedApproval.qrTitle}</p>
                  <code className="text-sm text-muted-foreground">{selectedApproval.qrCode}</code>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Gönderilme Zamanı</p>
                  <p className="font-medium">
                    {new Date(selectedApproval.submittedAt).toLocaleString("tr-TR")}
                  </p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">Gönderilen Bilgiler</h4>
                {selectedApproval.type === "worker_registration" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">İsim Soyisim</p>
                        <p className="font-medium">{selectedApproval.data.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Doğum Tarihi</p>
                        <p className="font-medium">{selectedApproval.data.birthDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cinsiyet</p>
                        <p className="font-medium">{selectedApproval.data.gender}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Ülke</p>
                        <p className="font-medium">{selectedApproval.data.country}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Telefon</p>
                        <p className="font-medium">{selectedApproval.data.phone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedApproval.type === "meter_reading" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Ev</p>
                        <p className="font-medium">{selectedApproval.data.house}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sayaç Tipi</p>
                        <p className="font-medium">{selectedApproval.data.meterType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Okunan Değer</p>
                        <p className="font-medium text-lg">{selectedApproval.data.value} {selectedApproval.data.unit}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded flex items-center gap-2">
                      <Badge variant="secondary">📸 Sayaç Fotoğrafı</Badge>
                      <span className="text-sm text-muted-foreground">{selectedApproval.data.photo}</span>
                    </div>
                  </div>
                )}

                {selectedApproval.type === "document_upload" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Çalışan</p>
                        <p className="font-medium">{selectedApproval.data.workerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Döküman Tipi</p>
                        <p className="font-medium">{selectedApproval.data.documentType}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm text-muted-foreground mb-1">Yüklenen Dosya</p>
                      <div className="flex items-center gap-2">
                        <FileUp className="w-4 h-4" />
                        <span className="font-medium">{selectedApproval.data.fileName}</span>
                        <Badge variant="secondary">{selectedApproval.data.fileSize}</Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
                >
                  Kapat
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleReject(selectedApproval.id);
                    setIsDetailDialogOpen(false);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reddet
                </Button>
                <Button
                  onClick={() => {
                    handleApprove(selectedApproval.id);
                    setIsDetailDialogOpen(false);
                  }}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Onayla
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
