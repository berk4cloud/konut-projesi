import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Building2, Upload, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockQRCodes, type QRCodeData, type QRCodeType, type QRStatus } from "@shared/mockQRData";

export default function QRPublicPage() {
  const [, params] = useRoute("/qr/:code");
  const { toast } = useToast();
  const code = params?.code || "";
  
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Worker Registration Form
  const [workerForm, setWorkerForm] = useState({
    name: "",
    birthDate: "",
    gender: "",
    country: "",
    phone: "",
  });

  // Meter Reading Form
  const [meterForm, setMeterForm] = useState({
    house: "",
    meterType: "",
    value: "",
    notes: "",
    photo: null as File | null,
  });

  // Document Upload Form
  const [documentForm, setDocumentForm] = useState({
    workerName: "",
    documentType: "",
    file: null as File | null,
  });

  useEffect(() => {
    // Validate QR code
    const qr = mockQRCodes.find(q => q.code === code);
    
    if (!qr) {
      setIsValid(false);
      return;
    }

    if (qr.status === "disabled" || qr.status === "expired") {
      setIsValid(false);
      setQrData(qr);
      return;
    }

    // Check usage limit
    if (qr.usageLimit && qr.usedCount >= qr.usageLimit) {
      setIsValid(false);
      setQrData(qr);
      return;
    }

    // Check expiry
    if (qr.expiryDate && new Date(qr.expiryDate) < new Date()) {
      setIsValid(false);
      setQrData(qr);
      return;
    }

    setIsValid(true);
    setQrData(qr);
  }, [code]);

  const handleWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Başarılı!",
      description: "Kayıt başvurunuz alındı. Yönetici onayından sonra haberdar edileceksiniz.",
    });
    setIsSubmitted(true);
  };

  const handleMeterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Başarılı!",
      description: "Sayaç okuma bilgileriniz kaydedildi.",
    });
    setIsSubmitted(true);
  };

  const handleDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Başarılı!",
      description: "Dökümanınız başarıyla yüklendi.",
    });
    setIsSubmitted(true);
  };

  if (isValid === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValid || !qrData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl">Link Geçersiz</CardTitle>
            <CardDescription className="text-base">
              {qrData?.status === "disabled" 
                ? "Bu QR kod devre dışı bırakılmıştır."
                : qrData?.status === "expired"
                ? "Bu QR kod'un süresi dolmuştur."
                : qrData?.usageLimit && qrData.usedCount >= qrData.usageLimit
                ? "Bu QR kod kullanım limitine ulaşmıştır."
                : "Bu QR kod bulunamadı veya geçersiz."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            Lütfen yöneticinizle iletişime geçin.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Başarılı!</CardTitle>
            <CardDescription className="text-base">
              {qrData.type === "worker_registration" && "Kayıt başvurunuz alındı. Yönetici onayından sonra bilgilendirileceksiniz."}
              {qrData.type === "meter_reading" && "Sayaç okuma bilgileriniz başarıyla kaydedildi."}
              {qrData.type === "document_upload" && "Dökümanınız başarıyla yüklendi ve incelemeye alındı."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">APDO HABITAT</h1>
          <p className="text-muted-foreground">{qrData.title}</p>
        </div>

        {/* Worker Registration Form */}
        {qrData.type === "worker_registration" && (
          <Card>
            <CardHeader>
              <CardTitle>Çalışan Kayıt Formu</CardTitle>
              <CardDescription>
                Lütfen bilgilerinizi eksiksiz doldurun
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWorkerSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">İsim Soyisim *</Label>
                  <Input
                    id="name"
                    value={workerForm.name}
                    onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                    required
                    data-testid="input-worker-name"
                  />
                </div>

                <div>
                  <Label htmlFor="birthDate">Doğum Tarihi *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={workerForm.birthDate}
                    onChange={(e) => setWorkerForm({ ...workerForm, birthDate: e.target.value })}
                    required
                    data-testid="input-worker-birthdate"
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Cinsiyet *</Label>
                  <Select
                    value={workerForm.gender}
                    onValueChange={(value) => setWorkerForm({ ...workerForm, gender: value })}
                    required
                  >
                    <SelectTrigger id="gender" data-testid="select-worker-gender">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Erkek">Erkek</SelectItem>
                      <SelectItem value="Kadın">Kadın</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="country">Ülke *</Label>
                  <Input
                    id="country"
                    value={workerForm.country}
                    onChange={(e) => setWorkerForm({ ...workerForm, country: e.target.value })}
                    required
                    data-testid="input-worker-country"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={workerForm.phone}
                    onChange={(e) => setWorkerForm({ ...workerForm, phone: e.target.value })}
                    required
                    data-testid="input-worker-phone"
                  />
                </div>

                <Button type="submit" className="w-full" data-testid="button-submit-worker">
                  Kayıt Ol
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Meter Reading Form */}
        {qrData.type === "meter_reading" && (
          <Card>
            <CardHeader>
              <CardTitle>Sayaç Okuma Formu</CardTitle>
              <CardDescription>
                Sayaç bilgilerini girin ve fotoğraf ekleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMeterSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="house">Ev Adresi *</Label>
                  <Input
                    id="house"
                    value={meterForm.house}
                    onChange={(e) => setMeterForm({ ...meterForm, house: e.target.value })}
                    placeholder="Örn: Geldernstrasse 13"
                    required
                    data-testid="input-meter-house"
                  />
                </div>

                <div>
                  <Label htmlFor="meterType">Sayaç Tipi *</Label>
                  <Select
                    value={meterForm.meterType}
                    onValueChange={(value) => setMeterForm({ ...meterForm, meterType: value })}
                    required
                  >
                    <SelectTrigger id="meterType" data-testid="select-meter-type">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Elektrik">Elektrik</SelectItem>
                      <SelectItem value="Su">Su</SelectItem>
                      <SelectItem value="Gaz">Gaz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="value">Sayaç Değeri *</Label>
                  <Input
                    id="value"
                    type="number"
                    value={meterForm.value}
                    onChange={(e) => setMeterForm({ ...meterForm, value: e.target.value })}
                    placeholder="Örn: 12450"
                    required
                    data-testid="input-meter-value"
                  />
                </div>

                <div>
                  <Label htmlFor="photo">Sayaç Fotoğrafı *</Label>
                  <div className="mt-2">
                    <label
                      htmlFor="photo"
                      className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover-elevate"
                    >
                      <Camera className="w-5 h-5" />
                      <span>{meterForm.photo ? meterForm.photo.name : "Fotoğraf Ekle"}</span>
                    </label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setMeterForm({ ...meterForm, photo: e.target.files?.[0] || null })}
                      className="hidden"
                      required
                      data-testid="input-meter-photo"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
                  <Textarea
                    id="notes"
                    value={meterForm.notes}
                    onChange={(e) => setMeterForm({ ...meterForm, notes: e.target.value })}
                    placeholder="Varsa ek bilgiler..."
                    data-testid="input-meter-notes"
                  />
                </div>

                <Button type="submit" className="w-full" data-testid="button-submit-meter">
                  Gönder
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Document Upload Form */}
        {qrData.type === "document_upload" && (
          <Card>
            <CardHeader>
              <CardTitle>Döküman Yükleme</CardTitle>
              <CardDescription>
                Gerekli belgeleri yükleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDocumentSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="workerName">İsim Soyisim *</Label>
                  <Input
                    id="workerName"
                    value={documentForm.workerName}
                    onChange={(e) => setDocumentForm({ ...documentForm, workerName: e.target.value })}
                    required
                    data-testid="input-document-worker-name"
                  />
                </div>

                <div>
                  <Label htmlFor="documentType">Döküman Tipi *</Label>
                  <Select
                    value={documentForm.documentType}
                    onValueChange={(value) => setDocumentForm({ ...documentForm, documentType: value })}
                    required
                  >
                    <SelectTrigger id="documentType" data-testid="select-document-type">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kimlik Kartı">Kimlik Kartı</SelectItem>
                      <SelectItem value="Pasaport">Pasaport</SelectItem>
                      <SelectItem value="İkamet İzni">İkamet İzni</SelectItem>
                      <SelectItem value="Diğer">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="file">Dosya *</Label>
                  <div className="mt-2">
                    <label
                      htmlFor="file"
                      className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover-elevate"
                    >
                      <Upload className="w-5 h-5" />
                      <span>{documentForm.file ? documentForm.file.name : "Dosya Seç (PDF, JPG, PNG)"}</span>
                    </label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setDocumentForm({ ...documentForm, file: e.target.files?.[0] || null })}
                      className="hidden"
                      required
                      data-testid="input-document-file"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" data-testid="button-submit-document">
                  Yükle
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
