import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, QrCode, Copy, Eye, Edit, Trash2, Power, PowerOff, Users, Gauge, FileUp, Check } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  
  // Create QR Dialog States
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: "worker_registration" as QRCodeType,
    title: "",
    usageLimit: "unlimited" as string,
    customLimit: "",
    expiryDays: "30" as string,
  });
  const [generatedCode, setGeneratedCode] = useState("");

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

  const generateQRCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleOpenCreateDialog = () => {
    setStep(1);
    setFormData({
      type: "worker_registration",
      title: "",
      usageLimit: "unlimited",
      customLimit: "",
      expiryDays: "30",
    });
    setGeneratedCode("");
    setIsCreateDialogOpen(true);
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      const code = generateQRCode();
      setGeneratedCode(code);
      
      const usageLimit = formData.usageLimit === "unlimited" 
        ? null 
        : formData.usageLimit === "custom"
        ? parseInt(formData.customLimit)
        : parseInt(formData.usageLimit);
      
      const expiryDate = formData.expiryDays === "unlimited"
        ? null
        : new Date(Date.now() + parseInt(formData.expiryDays) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const newQR: QRCodeData = {
        id: Date.now().toString(),
        code,
        type: formData.type,
        title: formData.title || getTypeLabel(formData.type),
        usageLimit,
        usageCount: 0,
        expiryDate,
        status: "active",
        createdAt: new Date().toISOString().split('T')[0],
      };
      
      setQrCodes([newQR, ...qrCodes]);
      setStep(3);
      
      toast({
        title: "QR Kod Oluşturuldu",
        description: "Yeni QR kod başarıyla oluşturuldu",
      });
    }
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setStep(1);
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
            <Button onClick={handleOpenCreateDialog} data-testid="button-create-qr">
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

      {/* Create QR Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {step === 1 && "QR Kod Tipi Seçin"}
              {step === 2 && "QR Ayarlarını Yapın"}
              {step === 3 && "QR Kod Oluşturuldu!"}
            </DialogTitle>
            <DialogDescription>
              {step === 1 && "QR kodunun hangi amaçla kullanılacağını seçin"}
              {step === 2 && "Kullanım limiti ve geçerlilik süresini belirleyin"}
              {step === 3 && "QR kodunuzu paylaşın veya indirin"}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Type Selection */}
          {step === 1 && (
            <div className="space-y-6 py-4">
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as QRCodeType })}
              >
                <div className="space-y-3">
                  <label className="flex items-start gap-4 p-4 border rounded-lg hover-elevate cursor-pointer">
                    <RadioGroupItem value="worker_registration" id="type-worker" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-5 h-5 text-primary" />
                        <h4 className="font-medium">Çalışan Kaydı</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Çalışanlar kendi bilgilerini girebilir, siz sadece onaylarsınız
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-4 border rounded-lg hover-elevate cursor-pointer">
                    <RadioGroupItem value="meter_reading" id="type-meter" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Gauge className="w-5 h-5 text-primary" />
                        <h4 className="font-medium">Sayaç Okuma</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sayaç değeri girme ve fotoğraf yükleme
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-4 border rounded-lg hover-elevate cursor-pointer">
                    <RadioGroupItem value="document_upload" id="type-document" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileUp className="w-5 h-5 text-primary" />
                        <h4 className="font-medium">Döküman Upload</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        PDF, resim gibi dosya yükleme
                      </p>
                    </div>
                  </label>
                </div>
              </RadioGroup>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleNextStep} data-testid="button-next-step-1">
                  İleri
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Settings */}
          {step === 2 && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="qr-title">Başlık (İsteğe Bağlı)</Label>
                <Input
                  id="qr-title"
                  placeholder="QR kod için açıklayıcı bir başlık girin"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  data-testid="input-qr-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usage-limit">Kullanım Limiti</Label>
                <Select
                  value={formData.usageLimit}
                  onValueChange={(value) => setFormData({ ...formData, usageLimit: value })}
                >
                  <SelectTrigger id="usage-limit" data-testid="select-usage-limit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unlimited">Sınırsız</SelectItem>
                    <SelectItem value="1">1 Kere</SelectItem>
                    <SelectItem value="5">5 Kere</SelectItem>
                    <SelectItem value="10">10 Kere</SelectItem>
                    <SelectItem value="50">50 Kere</SelectItem>
                    <SelectItem value="100">100 Kere</SelectItem>
                    <SelectItem value="custom">Özel Miktar</SelectItem>
                  </SelectContent>
                </Select>
                {formData.usageLimit === "custom" && (
                  <Input
                    type="number"
                    placeholder="Özel kullanım limiti"
                    value={formData.customLimit}
                    onChange={(e) => setFormData({ ...formData, customLimit: e.target.value })}
                    className="mt-2"
                    data-testid="input-custom-limit"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry-days">Geçerlilik Süresi</Label>
                <Select
                  value={formData.expiryDays}
                  onValueChange={(value) => setFormData({ ...formData, expiryDays: value })}
                >
                  <SelectTrigger id="expiry-days" data-testid="select-expiry-days">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unlimited">Sınırsız</SelectItem>
                    <SelectItem value="1">1 Gün</SelectItem>
                    <SelectItem value="3">3 Gün</SelectItem>
                    <SelectItem value="7">1 Hafta</SelectItem>
                    <SelectItem value="30">1 Ay</SelectItem>
                    <SelectItem value="180">6 Ay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Geri
                </Button>
                <Button onClick={handleNextStep} data-testid="button-create-qr-submit">
                  Oluştur
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-500" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">QR Kod Başarıyla Oluşturuldu!</h3>
                  <p className="text-sm text-muted-foreground">
                    QR kodunuzu aşağıdan paylaşabilir veya indirebilirsiniz
                  </p>
                </div>

                <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center border">
                  <QrCode className="w-32 h-32 text-muted-foreground" />
                </div>

                <div className="w-full p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Link</p>
                  <code className="text-sm break-all">
                    https://apdohabitat.app/qr/{generatedCode}
                  </code>
                </div>

                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleCopyLink(generatedCode)}
                    data-testid="button-copy-generated-link"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Linki Kopyala
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    data-testid="button-download-qr"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR İndir
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleCloseDialog} data-testid="button-close-success">
                  Tamam
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
