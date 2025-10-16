import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, QrCode, Copy, Eye, Edit, Trash2, Power, PowerOff } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type QRCodeType = "worker_registration" | "meter_reading" | "document_upload";
type QRStatus = "active" | "disabled" | "expired";

type QRCodeData = {
  id: string;
  code: string;
  type: QRCodeType;
  title: string;
  usageLimit: number | null;
  usageCount: number;
  expiryDate: string | null;
  status: QRStatus;
  createdAt: string;
};

const mockQRCodes: QRCodeData[] = [
  {
    id: "1",
    code: "Kts3542MMA",
    type: "worker_registration",
    title: "Geilenkirchen Evleri Kayıt Formu",
    usageLimit: 50,
    usageCount: 12,
    expiryDate: "2025-11-15",
    status: "active",
    createdAt: "2025-10-01",
  },
  {
    id: "2",
    code: "Br9Xm2pQwE",
    type: "meter_reading",
    title: "Aylık Elektrik Sayaç Okuma",
    usageLimit: null,
    usageCount: 28,
    expiryDate: "2025-10-30",
    status: "active",
    createdAt: "2025-10-05",
  },
  {
    id: "3",
    code: "Pq4Hn8TyLk",
    type: "document_upload",
    title: "Kimlik Belgesi Yükleme",
    usageLimit: 20,
    usageCount: 20,
    expiryDate: null,
    status: "disabled",
    createdAt: "2025-09-20",
  },
  {
    id: "4",
    code: "Zm7Wv5RnGh",
    type: "worker_registration",
    title: "Yeni Sezon Çalışan Kaydı",
    usageLimit: 100,
    usageCount: 45,
    expiryDate: "2025-09-30",
    status: "expired",
    createdAt: "2025-08-15",
  },
  {
    id: "5",
    code: "Dj3Ks9FmYu",
    type: "meter_reading",
    title: "Su Sayacı Okuma - Hauptstrasse",
    usageLimit: null,
    usageCount: 8,
    expiryDate: null,
    status: "active",
    createdAt: "2025-10-10",
  },
];

export default function QRManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>(mockQRCodes);

  const filteredQRCodes = qrCodes.filter((qr) =>
    qr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    qr.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeLabel = (type: QRCodeType) => {
    const labels = {
      worker_registration: "Çalışan Kaydı",
      meter_reading: "Sayaç Okuma",
      document_upload: "Döküman Upload",
    };
    return labels[type];
  };

  const getTypeVariant = (type: QRCodeType) => {
    const variants = {
      worker_registration: "default",
      meter_reading: "secondary",
      document_upload: "outline",
    };
    return variants[type] as "default" | "secondary" | "outline";
  };

  const getStatusBadge = (status: QRStatus) => {
    const config = {
      active: { label: "Aktif", variant: "default" as const },
      disabled: { label: "Pasif", variant: "secondary" as const },
      expired: { label: "Süresi Doldu", variant: "destructive" as const },
    };
    return config[status];
  };

  const handleCopyLink = (code: string) => {
    const link = `https://apdohabitat.app/qr/${code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Kopyalandı",
      description: "QR kodu linki panoya kopyalandı",
    });
  };

  const handleToggleStatus = (id: string) => {
    setQrCodes(qrCodes.map(qr => {
      if (qr.id === id && qr.status !== "expired") {
        return { ...qr, status: qr.status === "active" ? "disabled" : "active" };
      }
      return qr;
    }));
    toast({
      title: "Durum Değiştirildi",
      description: "QR kod durumu güncellendi",
    });
  };

  const handleDelete = (id: string) => {
    setQrCodes(qrCodes.filter(qr => qr.id !== id));
    toast({
      title: "Silindi",
      description: "QR kod başarıyla silindi",
      variant: "destructive",
    });
  };

  const getUsageText = (qr: QRCodeData) => {
    if (qr.usageLimit === null) {
      return `${qr.usageCount} / Sınırsız`;
    }
    return `${qr.usageCount} / ${qr.usageLimit}`;
  };

  const getExpiryText = (expiryDate: string | null) => {
    if (!expiryDate) return "Sınırsız";
    return new Date(expiryDate).toLocaleDateString("tr-TR");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header tenantName="Cova B.V." userName="Admin" />

      <main className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold mb-2">QR Yönetimi</h2>
              <p className="text-muted-foreground">QR kodlarınızı oluşturun ve yönetin</p>
            </div>
            <Button data-testid="button-create-qr">
              <Plus className="w-4 h-4 mr-2" />
              Yeni QR Oluştur
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Aktif QR Kodlar</CardTitle>
              <CardDescription>
                Toplam {qrCodes.length} QR kod • {qrCodes.filter(q => q.status === "active").length} aktif
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="QR kod veya başlık ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-qr"
                />
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tip</TableHead>
                      <TableHead>Başlık</TableHead>
                      <TableHead>Kod</TableHead>
                      <TableHead>Kullanım</TableHead>
                      <TableHead>Geçerlilik</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQRCodes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          QR kod bulunamadı
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredQRCodes.map((qr) => (
                        <TableRow key={qr.id} data-testid={`qr-row-${qr.id}`}>
                          <TableCell>
                            <Badge variant={getTypeVariant(qr.type)}>
                              {getTypeLabel(qr.type)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{qr.title}</TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {qr.code}
                            </code>
                          </TableCell>
                          <TableCell>{getUsageText(qr)}</TableCell>
                          <TableCell>{getExpiryText(qr.expiryDate)}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadge(qr.status).variant}>
                              {getStatusBadge(qr.status).label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopyLink(qr.code)}
                                data-testid={`button-copy-${qr.id}`}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                data-testid={`button-view-qr-${qr.id}`}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {qr.status !== "expired" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleToggleStatus(qr.id)}
                                  data-testid={`button-toggle-${qr.id}`}
                                >
                                  {qr.status === "active" ? (
                                    <PowerOff className="w-4 h-4" />
                                  ) : (
                                    <Power className="w-4 h-4" />
                                  )}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(qr.id)}
                                data-testid={`button-delete-${qr.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
